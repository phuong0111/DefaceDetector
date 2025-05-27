// src/components/Dashboard/StatisticsPanel.jsx

import React, { useState } from 'react';

const SEVERITY_COLORS = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#d97706',
  low: '#16a34a',
  info: '#2563eb'
};

export const StatisticsPanel = ({ stats = {}, alerts = [] }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate additional metrics
  const getTopAgents = () => {
    const agentCounts = {};
    alerts.forEach(alert => {
      const agentKey = alert.agent?.name || alert.agent?.id || 'Unknown';
      agentCounts[agentKey] = (agentCounts[agentKey] || 0) + 1;
    });
    
    return Object.entries(agentCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const getTopRules = () => {
    const ruleCounts = {};
    alerts.forEach(alert => {
      const ruleKey = `${alert.rule?.id}: ${alert.rule?.description}`;
      ruleCounts[ruleKey] = (ruleCounts[ruleKey] || 0) + 1;
    });
    
    return Object.entries(ruleCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
  };

  const topAgents = getTopAgents();
  const topRules = getTopRules();

  const renderOverviewTab = () => (
    <div style={{ padding: '16px' }}>
      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        marginBottom: '16px'
      }}>
        <div style={{
          background: '#f0f9ff',
          padding: '12px',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#0284c7'
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
          background: '#fee2e2',
          padding: '12px',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#dc2626'
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
        
        <div style={{
          background: '#dcfce7',
          padding: '12px',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#16a34a'
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
          background: '#fef3c7',
          padding: '12px',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#d97706'
          }}>
            {stats.last24h || 0}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#6b7280'
          }}>
            Last 24h
          </div>
        </div>
      </div>

      {/* Time-based Stats */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '8px'
        }}>
          ⏰ Recent Activity
        </h4>
        <div style={{
          background: '#f9fafb',
          padding: '12px',
          borderRadius: '6px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '4px'
          }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Last Hour:
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
              {stats.lastHour || 0}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Last 24 Hours:
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
              {stats.last24h || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSeverityTab = () => (
    <div style={{ padding: '16px' }}>
      <h4 style={{
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '12px'
      }}>
        📊 Severity Distribution
      </h4>
      
      <div style={{ marginBottom: '16px' }}>
        {Object.entries(SEVERITY_COLORS).map(([severity, color]) => {
          const count = stats[severity] || 0;
          const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
          
          return (
            <div key={severity} style={{ marginBottom: '8px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px'
              }}>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  textTransform: 'capitalize'
                }}>
                  {severity}
                </span>
                <span style={{
                  fontSize: '0.875rem',
                  color: '#6b7280'
                }}>
                  {count} ({percentage}%)
                </span>
              </div>
              <div style={{
                height: '6px',
                background: '#f3f4f6',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${percentage}%`,
                  backgroundColor: color,
                  borderRadius: '3px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          );
        })}
      </div>

      <h4 style={{
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '12px'
      }}>
        🔄 Status Distribution
      </h4>
      
      <div>
        {[
          { key: 'new', label: 'New', color: '#dc2626' },
          { key: 'acknowledged', label: 'Acknowledged', color: '#d97706' },
          { key: 'investigating', label: 'Investigating', color: '#2563eb' },
          { key: 'resolved', label: 'Resolved', color: '#16a34a' }
        ].map(({ key, label, color }) => {
          const count = stats[key] || 0;
          const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
          
          return (
            <div key={key} style={{ marginBottom: '8px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px'
              }}>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  {label}
                </span>
                <span style={{
                  fontSize: '0.875rem',
                  color: '#6b7280'
                }}>
                  {count}
                </span>
              </div>
              <div style={{
                height: '4px',
                background: '#f3f4f6',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${percentage}%`,
                  backgroundColor: color,
                  borderRadius: '2px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderTopItemsTab = () => (
    <div style={{ padding: '16px' }}>
      {/* Top Agents */}
      {topAgents.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            🖥️ Top Agents
          </h4>
          <div>
            {topAgents.map(([agent, count], index) => (
              <div key={agent} style={{
                display: 'grid',
                gridTemplateColumns: '24px 1fr 40px',
                gap: '8px',
                alignItems: 'center',
                padding: '6px 0'
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#6b7280',
                  textAlign: 'center'
                }}>
                  #{index + 1}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }} title={agent}>
                    {agent.length > 20 ? `${agent.substring(0, 20)}...` : agent}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#6b7280'
                  }}>
                    {count} alerts
                  </div>
                </div>
                <div style={{
                  height: '4px',
                  background: '#f3f4f6',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  width: '40px'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(count / topAgents[0][1]) * 100}%`,
                    background: '#3b82f6',
                    borderRadius: '2px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Rules */}
      {topRules.length > 0 && (
        <div>
          <h4 style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            📋 Top Rules
          </h4>
          <div>
            {topRules.map(([rule, count], index) => (
              <div key={rule} style={{
                display: 'grid',
                gridTemplateColumns: '24px 1fr 40px',
                gap: '8px',
                alignItems: 'center',
                padding: '6px 0'
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#6b7280',
                  textAlign: 'center'
                }}>
                  #{index + 1}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }} title={rule}>
                    {rule.length > 25 ? `${rule.substring(0, 25)}...` : rule}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#6b7280'
                  }}>
                    {count} alerts
                  </div>
                </div>
                <div style={{
                  height: '4px',
                  background: '#f3f4f6',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  width: '40px'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(count / topRules[0][1]) * 100}%`,
                    background: '#10b981',
                    borderRadius: '2px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {topAgents.length === 0 && topRules.length === 0 && (
        <div style={{
          textAlign: 'center',
          color: '#6b7280',
          padding: '40px 0'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📊</div>
          <p>No data available yet</p>
          <p style={{ fontSize: '0.875rem' }}>Statistics will appear once alerts are received</p>
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'white'
    }}>
      {/* Panel Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h3 style={{
          color: '#1f2937',
          fontSize: '1.125rem',
          fontWeight: '600',
          margin: '0 0 4px 0'
        }}>
          📊 Statistics
        </h3>
        <div style={{
          color: '#6b7280',
          fontSize: '0.75rem'
        }}>
          Updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e5e7eb'
      }}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'severity', label: 'Severity' },
          { key: 'top', label: 'Top Items' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              color: activeTab === tab.key ? '#2563eb' : '#6b7280',
              borderBottom: `2px solid ${activeTab === tab.key ? '#2563eb' : 'transparent'}`,
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{
        flex: 1,
        overflow: 'auto'
      }}>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'severity' && renderSeverityTab()}
        {activeTab === 'top' && renderTopItemsTab()}
      </div>
    </div>
  );
};