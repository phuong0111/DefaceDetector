// src/hooks/useWazuhWebSocket.js

import { useState, useEffect, useCallback, useRef } from 'react';

export const useWazuhWebSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastAlert, setLastAlert] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  
  const reconnectTimeoutRef = useRef(null);
  const socketRef = useRef(null);
  const mountedRef = useRef(true);

  // Parse Wazuh alert data
  const parseWazuhAlert = (rawData) => {
    const source = rawData._source || rawData;
    
    return {
      id: source.id || rawData._id || `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: source.timestamp || new Date().toISOString(),
      rule: {
        id: source.rule?.id || 'Unknown',
        level: source.rule?.level || 1,
        description: source.rule?.description || 'Security Alert',
        groups: source.rule?.groups || [],
        mitre: source.rule?.mitre || null,
        pci_dss: source.rule?.pci_dss || [],
        nist_800_53: source.rule?.nist_800_53 || [],
        gdpr: source.rule?.gdpr || []
      },
      agent: {
        id: source.agent?.id || '000',
        name: source.agent?.name || 'Unknown Agent',
        ip: source.agent?.ip || 'Unknown IP'
      },
      location: source.location || 'Unknown Location',
      full_log: source.full_log || 'No log data available',
      decoder: {
        name: source.decoder?.name || 'unknown'
      },
      data: {
        syscheck: source.syscheck || null,
        manager: source.manager || null,
        _source: source,
        srcip: extractSourceIP(source),
        file_path: source.syscheck?.path || null,
        file_event: source.syscheck?.event || null,
        mitre_technique: source.rule?.mitre?.technique?.[0] || null,
        mitre_tactic: source.rule?.mitre?.tactic?.[0] || null
      },
      severity: getSeverityFromLevel(source.rule?.level || 1),
      status: 'new',
      alertType: getAlertType(source)
    };
  };

  const extractSourceIP = (source) => {
    return source.srcip || 
           source.src_ip || 
           source.data?.srcip ||
           source.data?.src_ip ||
           source.agent?.ip ||
           null;
  };

  const getAlertType = (source) => {
    if (source.syscheck) return 'file_integrity';
    if (source.rule?.groups?.includes('authentication')) return 'authentication';
    if (source.rule?.groups?.includes('web')) return 'web_attack';
    if (source.rule?.groups?.includes('firewall')) return 'network';
    if (source.rule?.groups?.includes('malware')) return 'malware';
    return 'general';
  };

  const getSeverityFromLevel = (level) => {
    if (level >= 12) return 'critical';
    if (level >= 8) return 'high';
    if (level >= 5) return 'medium';
    if (level >= 3) return 'low';
    return 'info';
  };

  const connect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (!mountedRef.current) return;

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    try {
      console.log('🔌 Connecting to Wazuh WebSocket...');
      const ws = new WebSocket(url);
      socketRef.current = ws;
      
      ws.onopen = () => {
        if (!mountedRef.current) return;
        console.log('✅ Wazuh WebSocket connected');
        setIsConnected(true);
        setSocket(ws);
        setConnectionError(null);
      };
      
      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const rawData = JSON.parse(event.data);
          console.log('📨 Raw Wazuh alert received:', rawData);
          
          const parsedAlert = parseWazuhAlert(rawData);
          console.log('🔍 Parsed Wazuh alert:', parsedAlert);
          
          setLastAlert(parsedAlert);
        } catch (e) {
          console.error('❌ Error parsing Wazuh alert:', e);
          console.error('Raw data:', event.data);
        }
      };
      
      ws.onclose = (event) => {
        if (!mountedRef.current) return;
        console.log('🔌 Wazuh WebSocket disconnected', event.code);
        setIsConnected(false);
        setSocket(null);
        socketRef.current = null;
        
        if (event.code !== 1000 && mountedRef.current) {
          console.log('🔄 Scheduling Wazuh reconnection in 3 seconds...');
          reconnectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              connect();
            }
          }, 3000);
        }
      };
      
      ws.onerror = (error) => {
        if (!mountedRef.current) return;
        console.error('❌ Wazuh WebSocket error:', error);
        setConnectionError('Wazuh WebSocket connection error');
        setIsConnected(false);
      };
      
    } catch (error) {
      if (!mountedRef.current) return;
      console.error('❌ Failed to create Wazuh WebSocket:', error);
      setConnectionError('Failed to create Wazuh WebSocket connection');
      
      reconnectTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          connect();
        }
      }, 3000);
    }
  }, [url]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    
    return () => {
      console.log('🧹 Cleaning up Wazuh WebSocket connection');
      mountedRef.current = false;
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (socketRef.current) {
        socketRef.current.close(1000, 'Component unmounting');
        socketRef.current = null;
      }
      
      setSocket(null);
      setIsConnected(false);
    };
  }, [connect]);

  const manualReconnect = useCallback(() => {
    console.log('🔄 Manual Wazuh reconnection requested');
    setConnectionError(null);
    connect();
  }, [connect]);

  return { 
    isConnected, 
    lastAlert, 
    connectionError,
    manualReconnect 
  };
}; 