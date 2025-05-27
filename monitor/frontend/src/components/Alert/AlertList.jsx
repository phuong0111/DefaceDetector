// src/components/Alert/AlertList.jsx

import React, { useState, useEffect, useRef } from 'react';
import { AlertCard } from './AlertCard';

export const AlertList = ({ 
  alerts = [], 
  onStatusUpdate = () => {}, 
  onRemove = () => {}, 
  onBulkUpdate = () => {},
  onBulkRemove = () => {},
  isLoading = false 
}) => {
  const [selectedAlerts, setSelectedAlerts] = useState(new Set());
  const [autoScroll, setAutoScroll] = useState(true);
  const listRef = useRef(null);
  const prevAlertsLength = useRef(alerts.length);

  // Auto-scroll when new alerts arrive
  useEffect(() => {
    if (autoScroll && alerts.length > prevAlertsLength.current && listRef.current) {
      listRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    prevAlertsLength.current = alerts.length;
  }, [alerts.length, autoScroll]);

  // Clear invalid selections
  useEffect(() => {
    setSelectedAlerts(prev => {
      const alertIds = new Set(alerts.map(alert => alert.id));
      const validSelections = new Set([...prev].filter(id => alertIds.has(id)));
      return validSelections;
    });
  }, [alerts]);

  const handleAlertSelect = (alertId, isSelected) => {
    setSelectedAlerts(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(alertId);
      } else {
        newSet.delete(alertId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedAlerts.size === alerts.length) {
      setSelectedAlerts(new Set());
    } else {
      setSelectedAlerts(new Set(alerts.map(alert => alert.id)));
    }
  };

  const clearSelections = () => {
    setSelectedAlerts(new Set());
  };

  const handleBulkOperation = async (operation, status = null) => {
    if (selectedAlerts.size === 0) return;
    
    const alertIds = Array.from(selectedAlerts);
    
    try {
      if (operation === 'remove') {
        if (window.confirm(`Remove ${alertIds.length} selected alerts?`)) {
          await onBulkRemove(alertIds);
          clearSelections();
        }
      } else {
        await onBulkUpdate(alertIds, status);
        clearSelections();
      }
    } catch (error) {
      console.error(`Failed to ${operation} alerts:`, error);
    }
  };

  const isAllSelected = selectedAlerts.size === alerts.length && alerts.length > 0;
  const isSomeSelected = selectedAlerts.size > 0;

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '200px',
        color: '#6b7280'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }} />
        <p>Loading alerts...</p>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '300px',
        color: '#6b7280',
        textAlign: 'center',
        padding: '40px'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📭</div>
        <h3 style={{ color: '#374151', marginBottom: '8px' }}>No alerts found</h3>
        <p>No security alerts match your current filters.</p>
        <div style={{ marginTop: '16px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}>
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
            Auto-scroll to new alerts
          </label>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#f8fafc'
    }}>
      {/* Header with bulk actions */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Select All */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            color: '#374151'
          }}>
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={checkbox => {
                if (checkbox) checkbox.indeterminate = isSomeSelected && !isAllSelected;
              }}
              onChange={handleSelectAll}
            />
            <span style={{ fontSize: '0.875rem' }}>
              {selectedAlerts.size > 0 
                ? `${selectedAlerts.size} selected` 
                : `Select all (${alerts.length})`
              }
            </span>
          </label>

          {/* Bulk Actions */}
          {isSomeSelected && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleBulkOperation('update', 'acknowledged')}
                style={{
                  padding: '6px 12px',
                  background: '#fef3c7',
                  border: '1px solid #d97706',
                  borderRadius: '4px',
                  color: '#92400e',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}
              >
                ✓ Acknowledge ({selectedAlerts.size})
              </button>
              
              <button
                onClick={() => handleBulkOperation('update', 'investigating')}
                style={{
                  padding: '6px 12px',
                  background: '#dbeafe',
                  border: '1px solid #2563eb',
                  borderRadius: '4px',
                  color: '#1d4ed8',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}
              >
                🔍 Investigate ({selectedAlerts.size})
              </button>
              
              <button
                onClick={() => handleBulkOperation('update', 'resolved')}
                style={{
                  padding: '6px 12px',
                  background: '#dcfce7',
                  border: '1px solid #16a34a',
                  borderRadius: '4px',
                  color: '#15803d',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}
              >
                ✅ Resolve ({selectedAlerts.size})
              </button>
              
              <button
                onClick={() => handleBulkOperation('remove')}
                style={{
                  padding: '6px 12px',
                  background: '#fee2e2',
                  border: '1px solid #dc2626',
                  borderRadius: '4px',
                  color: '#dc2626',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}
              >
                🗑️ Remove ({selectedAlerts.size})
              </button>
              
              <button
                onClick={clearSelections}
                style={{
                  padding: '6px 12px',
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            color: '#6b7280'
          }}>
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
            Auto-scroll
          </label>
          
          <div style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Alert List */}
      <div 
        ref={listRef}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px'
        }}
      >
        {alerts.map(alert => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onStatusUpdate={onStatusUpdate}
            onRemove={onRemove}
            isSelected={selectedAlerts.has(alert.id)}
            onSelect={handleAlertSelect}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};