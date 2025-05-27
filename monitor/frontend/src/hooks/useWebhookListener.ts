import { useState, useEffect, useCallback } from 'react';
import { WebhookPayload, WebSocketMessage, ConnectionStatus } from '../types/webhook';

export const useWebhookListener = (serverUrl: string = 'ws://localhost:5001') => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [lastWebhookData, setLastWebhookData] = useState<WebhookPayload | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    console.log('Attempting to connect to:', serverUrl);
    setConnectionStatus('connecting');
    
    const websocket = new WebSocket(serverUrl);
    
    websocket.onopen = () => {
      console.log('✅ Connected to webhook server');
      setConnectionStatus('connected');
    };

    websocket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log('📨 Received WebSocket message:', message);
        
        if (message.type === 'webhook_triggered' && message.payload) {
          console.log('🚨 Webhook triggered! Setting modal data:', message.payload);
          setLastWebhookData(message.payload);
        }
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error);
      }
    };

    websocket.onclose = (event) => {
      console.log('🔌 WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
      setConnectionStatus('disconnected');
    };

    websocket.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      setConnectionStatus('error');
    };

    setWs(websocket);
  }, [serverUrl, ws]);

  const disconnect = useCallback(() => {
    if (ws) {
      console.log('Disconnecting WebSocket...');
      ws.close();
      setWs(null);
    }
  }, [ws]);

  useEffect(() => {
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [ws]);

  return {
    connectionStatus,
    lastWebhookData,
    connect,
    disconnect,
    clearLastWebhookData: () => setLastWebhookData(null)
  };
};