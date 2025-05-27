// src/components/Alert/AlertCard.jsx

import React, { useState } from 'react';

const SEVERITY_CONFIG = {
  critical: { color: '#dc2626', bg: '#fee2e2', icon: '🚨' },
  high: { color: '#ea580c', bg: '#fed7aa', icon: '⚠️' },
  medium: { color: '#d97706', bg: '#fef3c7', icon: '⚡' },
  low: { color: '#16a34a', bg: '#dcfce7', icon: 'ℹ️' },
  info: { color: '#2563eb', bg: '#dbeafe', icon: '📝' }
};

const ALERT_TYPE_CONFIG = {
  file_integrity: { icon: '📁', label: 'File Integrity' },
  authentication: { icon: '🔐', label: 'Authentication' },
  web_attack: { icon: '🌐', label: 'Web Attack' },
  network: { icon: '🛡️', label: 'Network' },
  malware: { icon: '🦠', label: 'Malware' },
  general: { icon: '⚠️', label: 'General' }
};

const STATUS_CONFIG = {
  new: { color: '#dc2626', bg: '#fee2e2', label: 'New' },
  acknowledged: { color: '#d97706', bg: '#fef3c7', label: 'Acknowledged' },
  investigating: { color: '#2563eb', bg: '#dbeafe', label: 'Investigating' },
  resolved: { color: '#16a34a', bg: '#dcfce7', label: 'Resolved' }
};

export const AlertCard = ({ 
  alert, 
  onStatusUpdate = () => {}, 
  onRemove = () => {}, 
  isSelected = false, 
  onSelect = () => {} 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewMode, setViewMode] = useState('log'); // 'log', 'json', 'formatted'

  const severityConfig = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
  const alertTypeConfig = ALERT_TYPE_CONFIG[alert.alertType] || ALERT_TYPE_CONFIG.general;
  const statusConfig = STATUS_CONFIG[alert.status] || STATUS_CONFIG.new;

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(alert.id, newStatus);
    } catch (error) {
      console.error('Failed to update alert status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (window.confirm('Are you sure you want to remove this alert?')) {
      try {
        await onRemove(alert.id);
      } catch (error) {
        console.error('Failed to remove alert:', error);
      }
    }
  };

  const formatFileChange = (syscheck) => {
    if (!syscheck) return null;
    
    return (
      <div style={{
        background: '#f8f9fa',
        padding: '12px',
        borderRadius: '6px',
        margin: '12px 0',
        border: '1px solid #e5e7eb'
      }}>
        <h5 style={{ margin: '0 0 8px 0', fontSize: '0.875rem', fontWeight: '600' }}>
          📁 File Change Details
        </h5>
        <div style={{ fontSize: '0.875rem', color: '#374151' }}>
          <div><strong>File:</strong> {syscheck.path}</div>
          <div><strong>Event:</strong> {syscheck.event}</div>
          {syscheck.size_before && syscheck.size_after && (
            <div><strong>Size:</strong> {syscheck.size_before} → {syscheck.size_after} bytes</div>
          )}
          {syscheck.changed_attributes && (
            <div><strong>Changed:</strong> {syscheck.changed_attributes.join(', ')}</div>
          )}
          {syscheck.diff && (
            <details style={{ marginTop: '8px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: '500' }}>
                📄 View File Diff
              </summary>
              <pre style={{
                background: 'white',
                padding: '8px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                overflow: 'auto',
                maxHeight: '200px',
                marginTop: '4px',
                border: '1px solid #d1d5db'
              }}>
                {syscheck.diff}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  };

  const formatJsonData = (data) => {
    try {
      // Create a clean object with all alert data
      const cleanAlert = {
        ...alert,
        // Remove any circular references or functions
        onStatusUpdate: undefined,
        onRemove: undefined,
        onSelect: undefined
      };
      
      return JSON.stringify(cleanAlert, null, 2);
    } catch (error) {
      console.error('Error formatting JSON:', error);
      return JSON.stringify({ error: 'Failed to format JSON data' }, null, 2);
    }
  };

  const formatStructuredData = () => {
    const sections = [];

    // Basic Alert Info
    sections.push({
      title: '🆔 Alert Information',
      data: {
        'Alert ID': alert.id,
        'Timestamp': new Date(alert.timestamp).toLocaleString(),
        'Severity': alert.severity,
        'Status': alert.status,
        'Alert Type': alert.alertType,
        'Location': alert.location
      }
    });

    // Rule Information
    if (alert.rule) {
      sections.push({
        title: '📋 Rule Details',
        data: {
          'Rule ID': alert.rule.id,
          'Rule Level': alert.rule.level,
          'Description': alert.rule.description,
          'Groups': alert.rule.groups?.join(', ') || 'None',
          'PCI DSS': alert.rule.pci_dss?.join(', ') || 'None',
          'NIST 800-53': alert.rule.nist_800_53?.join(', ') || 'None',
          'GDPR': alert.rule.gdpr?.join(', ') || 'None'
        }
      });
    }

    // Agent Information
    if (alert.agent) {
      sections.push({
        title: '🖥️ Agent Information',
        data: {
          'Agent ID': alert.agent.id,
          'Agent Name': alert.agent.name,
          'Agent IP': alert.agent.ip
        }
      });
    }

    // MITRE ATT&CK Information
    if (alert.data?.mitre_technique || alert.rule?.mitre) {
      sections.push({
        title: '🎯 MITRE ATT&CK',
        data: {
          'Technique': alert.data?.mitre_technique || alert.rule?.mitre?.technique?.[0] || 'None',
          'Tactic': alert.data?.mitre_tactic || alert.rule?.mitre?.tactic?.[0] || 'None',
          'Technique ID': alert.rule?.mitre?.id?.[0] || 'None'
        }
      });
    }

    // File Integrity Monitoring
    if (alert.data?.syscheck) {
      const syscheck = alert.data.syscheck;
      sections.push({
        title: '📁 File Integrity Details',
        data: {
          'File Path': syscheck.path,
          'Event Type': syscheck.event,
          'Mode': syscheck.mode,
          'Size Before': syscheck.size_before,
          'Size After': syscheck.size_after,
          'MD5 Before': syscheck.md5_before,
          'MD5 After': syscheck.md5_after,
          'SHA1 Before': syscheck.sha1_before,
          'SHA1 After': syscheck.sha1_after,
          'Changed Attributes': syscheck.changed_attributes?.join(', ')
        }
      });
    }

    // Network/Source Information
    if (alert.data?.srcip || alert.data?.dstip) {
      sections.push({
        title: '🌐 Network Information',
        data: {
          'Source IP': alert.data.srcip,
          'Destination IP': alert.data.dstip,
          'Source User': alert.data.srcuser,
          'Destination User': alert.data.dstuser,
          'Source Port': alert.data.srcport,
          'Destination Port': alert.data.dstport
        }
      });
    }

    return sections;
  };

  const renderLogContent = () => {
    if (viewMode === 'json') {
      return (
        <pre style={{
          background: '#1e1e1e',
          color: '#d4d4d4',
          border: '1px solid #404040',
          borderRadius: '4px',
          padding: '16px',
          marginTop: '8px',
          fontSize: '0.8rem',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          maxHeight: '500px',
          overflow: 'auto',
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", consolas, "source-code-pro", monospace'
        }}>
          {formatJsonData()}
        </pre>
      );
    } else if (viewMode === 'formatted') {
      const sections = formatStructuredData();
      return (
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          padding: '16px',
          marginTop: '8px',
          maxHeight: '500px',
          overflow: 'auto'
        }}>
          {sections.map((section, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
              <h6 style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '4px'
              }}>
                {section.title}
              </h6>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '8px 16px',
                fontSize: '0.8rem'
              }}>
                {Object.entries(section.data).map(([key, value]) => (
                  value && value !== 'None' && value !== '' && (
                    <React.Fragment key={key}>
                      <span style={{
                        fontWeight: '500',
                        color: '#6b7280'
                      }}>
                        {key}:
                      </span>
                      <span style={{
                        color: '#374151',
                        wordBreak: 'break-word'
                      }}>
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </React.Fragment>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <pre style={{
          background: '#f8f9fa',
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          padding: '12px',
          marginTop: '8px',
          fontSize: '0.875rem',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          maxHeight: '300px',
          overflow: 'auto'
        }}>
          {alert.full_log || 'No log data available'}
        </pre>
      );
    }
  };

  const getAvailableActions = () => {
    switch (alert.status) {
      case 'new':
        return [
          { label: '✓ Acknowledge', action: 'acknowledged' },
          { label: '🔍 Investigate', action: 'investigating' }
        ];
      case 'acknowledged':
        return [
          { label: '🔍 Investigate', action: 'investigating' },
          { label: '✅ Resolve', action: 'resolved' }
        ];
      case 'investigating':
        return [
          { label: '✅ Resolve', action: 'resolved' }
        ];
      default:
        return [];
    }
  };

  const availableActions = getAvailableActions();

  return (
    <div style={{
      background: 'white',
      border: `1px solid #e5e7eb`,
      borderLeft: `4px solid ${severityConfig.color}`,
      borderRadius: '8px',
      marginBottom: '12px',
      padding: '16px',
      boxShadow: isSelected ? '0 0 0 2px #3b82f6' : '0 1px 3px rgba(0,0,0,0.1)',
      transition: 'all 0.2s ease'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(alert.id, e.target.checked)}
            style={{ width: '16px', height: '16px' }}
          />
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 8px',
            borderRadius: '12px',
            backgroundColor: severityConfig.bg,
            color: severityConfig.color,
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            {severityConfig.icon} {alert.severity.toUpperCase()}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>{alertTypeConfig.icon}</span>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {alertTypeConfig.label}
            </span>
          </div>
          
          <div style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            background: '#f3f4f6',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            Rule {alert.rule?.id} • Level {alert.rule?.level}
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <div style={{
            padding: '4px 8px',
            borderRadius: '8px',
            backgroundColor: statusConfig.bg,
            color: statusConfig.color,
            fontSize: '0.75rem',
            fontWeight: '500'
          }}>
            {statusConfig.label}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            {new Date(alert.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: '600', color: '#111827' }}>
          {alert.rule?.description || 'Security Alert'}
        </h4>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '8px',
          marginBottom: '12px',
          fontSize: '0.875rem'
        }}>
          <div>
            <span style={{ fontWeight: '500', color: '#6b7280' }}>🖥️ Agent: </span>
            <span style={{ color: '#374151' }}>
              {alert.agent?.name || alert.agent?.id} ({alert.agent?.ip})
            </span>
          </div>
          
          <div>
            <span style={{ fontWeight: '500', color: '#6b7280' }}>📍 Location: </span>
            <span style={{ color: '#374151' }}>{alert.location}</span>
          </div>
          
          {alert.data?.mitre_technique && (
            <div>
              <span style={{ fontWeight: '500', color: '#6b7280' }}>🎯 MITRE: </span>
              <span style={{ color: '#374151' }}>
                {alert.data.mitre_technique} ({alert.data.mitre_tactic})
              </span>
            </div>
          )}
          
          <div>
            <span style={{ fontWeight: '500', color: '#6b7280' }}>🆔 ID: </span>
            <span style={{ color: '#374151', fontFamily: 'monospace' }}>
              {alert.id.slice(-8)}
            </span>
          </div>
        </div>

        {/* File Integrity Details */}
        {alert.data?.syscheck && formatFileChange(alert.data.syscheck)}

        {/* Expandable Log with View Modes */}
        <div style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                background: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              📄 {isExpanded ? 'Hide' : 'Show'} Details
              <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                ▼
              </span>
            </button>

            {isExpanded && (
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setViewMode('log')}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    background: viewMode === 'log' ? '#3b82f6' : 'white',
                    color: viewMode === 'log' ? 'white' : '#374151',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}
                >
                  📝 Log
                </button>
                <button
                  onClick={() => setViewMode('formatted')}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    background: viewMode === 'formatted' ? '#3b82f6' : 'white',
                    color: viewMode === 'formatted' ? 'white' : '#374151',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}
                >
                  📋 Structured
                </button>
                <button
                  onClick={() => setViewMode('json')}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    background: viewMode === 'json' ? '#3b82f6' : 'white',
                    color: viewMode === 'json' ? 'white' : '#374151',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}
                >
                  🔧 JSON
                </button>
              </div>
            )}
          </div>
          
          {isExpanded && renderLogContent()}
        </div>
      </div>

      {/* Actions */}
      <div style={{
        borderTop: '1px solid #f0f0f0',
        paddingTop: '12px',
        marginTop: '16px',
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        {availableActions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleStatusUpdate(action.action)}
            disabled={isUpdating}
            style={{
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              background: 'white',
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              opacity: isUpdating ? 0.5 : 1
            }}
          >
            {action.label}
          </button>
        ))}
        
        <button
          onClick={handleRemove}
          disabled={isUpdating}
          style={{
            padding: '6px 12px',
            border: '1px solid #dc2626',
            borderRadius: '4px',
            background: '#fee2e2',
            color: '#dc2626',
            cursor: isUpdating ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            opacity: isUpdating ? 0.5 : 1
          }}
        >
          🗑️ Remove
        </button>
      </div>
    </div>
  );
};