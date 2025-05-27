// src/hooks/useAlertManager.js (Fixed)

import { useState, useCallback } from 'react';

export const useAlertManager = (maxAlerts = 1000) => {
  const [alerts, setAlerts] = useState([]);
  const [filters, setFilters] = useState({
    severity: 'all',
    status: 'all',
    agent: 'all',
    ruleId: '',
    searchText: '',
    timeRange: 'all'
  });

  // Add new alert
  const addAlert = useCallback((newAlert) => {
    console.log('Adding alert to manager:', newAlert.id);
    setAlerts(prevAlerts => {
      const updatedAlerts = [newAlert, ...prevAlerts];
      
      // Limit the number of alerts to prevent memory issues
      if (updatedAlerts.length > maxAlerts) {
        return updatedAlerts.slice(0, maxAlerts);
      }
      
      return updatedAlerts;
    });
  }, [maxAlerts]);

  // Update alert status - FIXED to target specific alert
  const updateAlertStatus = useCallback((alertId, newStatus) => {
    console.log('Updating alert status:', alertId, 'to', newStatus);
    setAlerts(prevAlerts => {
      const updated = prevAlerts.map(alert => {
        if (alert.id === alertId) {
          console.log('Found and updating alert:', alertId);
          return { ...alert, status: newStatus };
        }
        return alert;
      });
      console.log('Updated alerts array length:', updated.length);
      return updated;
    });
  }, []);

  // Remove alert - FIXED to target specific alert only
  const removeAlert = useCallback((alertId) => {
    console.log('Removing specific alert:', alertId);
    
    setAlerts(prevAlerts => {
      console.log('Before removal - Total alerts:', prevAlerts.length);
      console.log('Looking for alert to remove:', alertId);
      
      // Find the alert to confirm it exists
      const alertToRemove = prevAlerts.find(alert => alert.id === alertId);
      if (alertToRemove) {
        console.log('Found alert to remove:', alertToRemove.id, alertToRemove.rule?.description);
      } else {
        console.log('Alert not found:', alertId);
        return prevAlerts; // Return unchanged if alert not found
      }
      
      // Filter out only the specific alert
      const filtered = prevAlerts.filter(alert => {
        const shouldKeep = alert.id !== alertId;
        if (!shouldKeep) {
          console.log('Removing alert:', alert.id, alert.rule?.description);
        }
        return shouldKeep;
      });
      
      console.log('After removal - Total alerts:', filtered.length, '(removed 1)');
      return filtered;
    });
  }, []);

  // Clear all alerts
  const clearAllAlerts = useCallback(() => {
    console.log('Clearing all alerts');
    setAlerts([]);
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    console.log('Updating filters:', newFilters);
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    console.log('Clearing all filters');
    setFilters({
      severity: 'all',
      status: 'all',
      agent: 'all',
      ruleId: '',
      searchText: '',
      timeRange: 'all'
    });
  }, []);

  // Bulk operations
  const bulkUpdateStatus = useCallback((alertIds, newStatus) => {
    console.log('Bulk updating alerts:', alertIds, 'to', newStatus);
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alertIds.includes(alert.id)
          ? { ...alert, status: newStatus }
          : alert
      )
    );
  }, []);

  const bulkRemove = useCallback((alertIds) => {
    console.log('Bulk removing alerts:', alertIds);
    setAlerts(prevAlerts => {
      const beforeCount = prevAlerts.length;
      const filtered = prevAlerts.filter(alert => !alertIds.includes(alert.id));
      const afterCount = filtered.length;
      console.log(`Bulk removal: ${beforeCount} -> ${afterCount} (removed ${beforeCount - afterCount})`);
      return filtered;
    });
  }, []);

  // Enhanced filtering with proper error handling
  const filteredAlerts = alerts.filter(alert => {
    try {
      // Severity filter
      if (filters.severity !== 'all' && alert.severity !== filters.severity) {
        return false;
      }
      
      // Status filter
      if (filters.status !== 'all' && alert.status !== filters.status) {
        return false;
      }
      
      // Agent filter - handle both agent.id and agent.name
      if (filters.agent !== 'all') {
        const agentId = alert.agent?.id;
        const agentName = alert.agent?.name;
        if (agentId !== filters.agent && agentName !== filters.agent) {
          return false;
        }
      }
      
      // Rule ID filter
      if (filters.ruleId && filters.ruleId.trim() !== '') {
        const alertRuleId = alert.rule?.id?.toString() || '';
        const filterRuleId = filters.ruleId.toString().trim();
        if (alertRuleId !== filterRuleId) {
          return false;
        }
      }
      
      // Search text filter
      if (filters.searchText && filters.searchText.trim() !== '') {
        const searchLower = filters.searchText.toLowerCase().trim();
        const searchableText = [
          alert.rule?.description || '',
          alert.agent?.name || '',
          alert.agent?.id || '',
          alert.location || '',
          alert.full_log || ''
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchLower)) {
          return false;
        }
      }
      
      // Time range filter
      if (filters.timeRange !== 'all') {
        const alertTime = new Date(alert.timestamp);
        const now = new Date();
        const diffHours = (now - alertTime) / (1000 * 60 * 60);
        
        switch (filters.timeRange) {
          case '1h':
            if (diffHours > 1) return false;
            break;
          case '24h':
            if (diffHours > 24) return false;
            break;
          case '7d':
            if (diffHours > 168) return false;
            break;
          default:
            break;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error filtering alert:', alert.id, error);
      return true; // Include alert if filtering fails
    }
  });

  // Enhanced statistics calculation
  const stats = {
    // Basic counts
    total: alerts.length,
    filtered: filteredAlerts.length,
    
    // Severity breakdown
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    low: alerts.filter(a => a.severity === 'low').length,
    info: alerts.filter(a => a.severity === 'info').length,
    
    // Status breakdown
    new: alerts.filter(a => a.status === 'new').length,
    acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
    investigating: alerts.filter(a => a.status === 'investigating').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
    
    // Time-based stats
    lastHour: alerts.filter(a => {
      const now = new Date();
      const alertTime = new Date(a.timestamp);
      return (now - alertTime) <= (60 * 60 * 1000);
    }).length,
    
    last24h: alerts.filter(a => {
      const now = new Date();
      const alertTime = new Date(a.timestamp);
      return (now - alertTime) <= (24 * 60 * 60 * 1000);
    }).length,
    
    // Top items
    byAgent: alerts.reduce((acc, alert) => {
      const agentKey = alert.agent?.name || alert.agent?.id || 'Unknown';
      acc[agentKey] = (acc[agentKey] || 0) + 1;
      return acc;
    }, {}),
    
    byRule: alerts.reduce((acc, alert) => {
      const ruleKey = `${alert.rule?.id}: ${alert.rule?.description || 'Unknown Rule'}`;
      acc[ruleKey] = (acc[ruleKey] || 0) + 1;
      return acc;
    }, {})
  };

  // Filter options for dropdowns
  const filterOptions = {
    severities: ['all', 'critical', 'high', 'medium', 'low', 'info'],
    statuses: ['all', 'new', 'acknowledged', 'investigating', 'resolved'],
    agents: ['all', ...new Set(alerts.map(alert => 
      alert.agent?.name || alert.agent?.id || 'Unknown'
    ).filter(Boolean))],
    timeRanges: [
      { value: 'all', label: 'All Time' },
      { value: '1h', label: 'Last Hour' },
      { value: '24h', label: 'Last 24 Hours' },
      { value: '7d', label: 'Last 7 Days' }
    ]
  };

  return {
    // Data
    alerts: filteredAlerts,
    allAlerts: alerts,
    stats,
    filters,
    filterOptions,
    
    // Actions
    addAlert,
    updateAlertStatus,
    removeAlert,
    clearAllAlerts,
    updateFilters,
    clearFilters,
    bulkUpdateStatus,
    bulkRemove
  };
};