// src/components/Dashboard/RealTimePanel.jsx

import React, { useState, useEffect } from 'react';

export const RealTimePanel = ({ isConnected = false, stats = {}, alerts = [] }) => {
  const [alertRate, setAlertRate] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Calculate alert rate (alerts per minute)
  useEffect(() => {
    const now = new Date();
    const oneMinuteAgo = new Date(now - 60 * 1000);
    const recentAlerts = alerts.filter(alert => 
      new Date(alert.timestamp) >= oneMinuteAgo
    );
    setAlertRate(recentAlerts.length);
    setLastUpdate(now);
  }, [alerts]);

  // Get threat level based on stats
  const getThreatLevel = () => {
    const critical = stats.critical || 0;
    const high = stats.high || 0;
    const lastHour = stats.lastHour || 0;

    if (critical >= 5 || lastHour >= 10) {
      return { level: 'critical', label: 'Critical', color: '#dc2626', bg: '#fee2e2' };
    } else if (critical >= 2 || high >= 10) {
      return { level: 'high', label: 'High', color: '#ea580c', bg: '#fed7aa' };
    } else if (critical >= 1 || high >= 5) {
      return { level: 'medium', label: 'Medium', color: '#d97706', bg: '#fef3c7' };
    }
    return { level: 'low', label: 'Low', color: '#16a34a', bg: '#dcfce7' };
  };

  const threatLevel = getThreatLevel();

  return (
    <div style={{
      padding: '16px',
      background: 'white',
      borderBottom: '1px solid #e5e7eb'
    }}>
      {/* Panel Header */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{
          color: '#1f2937',
          fontSize: '1.125rem',
          fontWeight: '600',
          margin: '0 0 4px 0'
        }}>
          🔴 Real-Time Monitor
        </h3>
        <div style={{
          color: '#6b7280',
          fontSize: '0.75rem'
        }}>
          Updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* Connection Status */}
      <div style={{
        background: '#f9fafb',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: isConnected ? '#10b981' : '#ef4444',
            animation: isConnected ? 'pulse 2s infinite' : 'none'
          }} />
          <div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              fontWeight: '500'
            }}>
              WebSocket Status
            </div>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: isConnected ? '#15803d' : '#dc2626'
            }}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>
      </div>

      {/* Threat Level */}
      <div style={{
        background: '#f9fafb',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px'
      }}>
        <div style={{
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '8px'
        }}>
          🛡️ Threat Level
        </div>
        <div style={{
          border: `2px solid ${threatLevel.color}`,
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{
            color: 'white',
            fontWeight: '700',
            fontSize: '0.875rem',
            padding: '4px 8px',
            borderRadius: '4px',
            marginBottom: '4px',
            display: 'inline-block',
            background: threatLevel.color
          }}>
            {threatLevel.label.toUpperCase()}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#6b7280'
          }}>
            {threatLevel.level === 'critical' && 'Immediate attention required'}
            {threatLevel.level === 'high' && 'Monitor closely'}
            {threatLevel.level === 'medium' && 'Normal monitoring'}
            {threatLevel.level === 'low' && 'All systems normal'}
          </div>
        </div>
      </div>

      {/* Live Metrics */}
      <div style={{
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '8px'
      }}>
        📊 Live Metrics
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        marginBottom: '16px'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '8px',
          background: '#f9fafb',
          borderRadius: '6px'
        }}>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '2px'
          }}>
            {stats.total || 0}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#6b7280'
          }}>
            Total Alerts
          </div>
        </div>
        
        <div style={{
          textAlign: 'center',
          padding: '8px',
          background: '#f9fafb',
          borderRadius: '6px'
        }}>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '2px'
          }}>
            {alertRate}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#6b7280'
          }}>
            Alerts/min
          </div>
        </div>
        
        <div style={{
          textAlign: 'center',
          padding: '8px',
          background: '#f9fafb',
          borderRadius: '6px'
        }}>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '2px'
          }}>
            {stats.lastHour || 0}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#6b7280'
          }}>
            Last Hour
          </div>
        </div>
        
        <div style={{
          textAlign: 'center',
          padding: '8px',
          background: '#fee2e2',
          borderRadius: '6px'
        }}>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#dc2626',
            marginBottom: '2px'
          }}>
            {stats.critical || 0}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#6b7280'
          }}>
            Critical
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '8px'
      }}>
        ⚡ Quick Stats
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        {[
          { label: '🔴 Critical', value: stats.critical || 0, color: '#dc2626' },
          { label: '🟠 High', value: stats.high || 0, color: '#ea580c' },
          { label: '🟡 Medium', value: stats.medium || 0, color: '#d97706' },
          { label: '🟢 Low', value: stats.low || 0, color: '#16a34a' }
        ].map((stat, index) => (
          <div key={index} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '6px 0'
          }}>
            <span style={{
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              {stat.label}:
            </span>
            <span style={{
              fontWeight: '600',
              fontSize: '0.875rem',
              color: stat.color
            }}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '8px'
      }}>
        🚀 Quick Actions
      </div>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <button style={{
          padding: '8px 12px',
          background: '#fee2e2',
          color: '#dc2626',
          border: 'none',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: '500',
          cursor: 'pointer',
          textAlign: 'left'
        }}>
          🚨 View Critical ({stats.critical || 0})
        </button>
        
        <button style={{
          padding: '8px 12px',
          background: '#dbeafe',
          color: '#2563eb',
          border: 'none',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: '500',
          cursor: 'pointer',
          textAlign: 'left'
        }}>
          🕐 Recent Alerts ({stats.lastHour || 0})
        </button>
        
        <button style={{
          padding: '8px 12px',
          background: '#f3f4f6',
          color: '#374151',
          border: 'none',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: '500',
          cursor: 'pointer',
          textAlign: 'left'
        }}>
          📊 Export Report
        </button>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};