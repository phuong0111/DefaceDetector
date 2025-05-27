// src/components/Toast/WazuhToast.jsx

import React, { useState, useEffect, useRef } from 'react';

const SEVERITY_CONFIG = {
  critical: { color: '#dc2626', bg: '#fee2e2', icon: '🚨', duration: 10000 },
  high: { color: '#ea580c', bg: '#fed7aa', icon: '⚠️', duration: 8000 },
  medium: { color: '#d97706', bg: '#fef3c7', icon: '⚡', duration: 6000 },
  low: { color: '#16a34a', bg: '#dcfce7', icon: 'ℹ️', duration: 4000 },
  info: { color: '#2563eb', bg: '#dbeafe', icon: '📝', duration: 5000 }
};

const ALERT_TYPE_CONFIG = {
  file_integrity: { icon: '📁', label: 'File Integrity' },
  authentication: { icon: '🔐', label: 'Authentication' },
  web_attack: { icon: '🌐', label: 'Web Attack' },
  network: { icon: '🛡️', label: 'Network' },
  malware: { icon: '🦠', label: 'Malware' },
  general: { icon: '⚠️', label: 'General' }
};

export const WazuhToast = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const { alert } = toast;
  const severityConfig = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
  const alertTypeConfig = ALERT_TYPE_CONFIG[alert.alertType] || ALERT_TYPE_CONFIG.general;
  const duration = severityConfig.duration;

  useEffect(() => {
    // Show toast animation
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Start auto-dismiss timer
    startTimer();

    return () => {
      clearTimeout(showTimer);
      clearTimers();
    };
  }, []);

  const startTimer = () => {
    startTimeRef.current = Date.now();

    // Progress bar animation
    intervalRef.current = setInterval(() => {
      if (isPaused) return;

      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, ((duration - elapsed) / duration) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearTimers();
        handleClose();
      }
    }, 50);

    // Auto-close timer
    timeoutRef.current = setTimeout(() => {
      if (!isPaused) {
        handleClose();
      }
    }, duration);
  };

  const clearTimers = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  const handlePause = () => {
    setIsPaused(true);
    clearTimers();
  };

  const handleResume = () => {
    setIsPaused(false);
    startTimer();
  };

  const formatAlertDetails = () => {
    const details = [];
    
    if (alert.agent?.name) {
      details.push(`Agent: ${alert.agent.name}`);
    }
    
    if (alert.data?.syscheck?.path) {
      const fileName = alert.data.syscheck.path.split(/[/\\]/).pop();
      details.push(`File: ${fileName}`);
    }
    
    if (alert.data?.srcip) {
      details.push(`Source: ${alert.data.srcip}`);
    }
    
    if (alert.data?.mitre_technique) {
      details.push(`MITRE: ${alert.data.mitre_technique}`);
    }

    return details;
  };

  const alertDetails = formatAlertDetails();

  return (
    <div 
      style={{
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        marginBottom: '12px',
        maxWidth: '400px',
        minWidth: '320px',
        opacity: isVisible ? 1 : 0,
        pointerEvents: 'auto',
        position: 'relative',
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        borderLeft: `4px solid ${severityConfig.color}`,
        overflow: 'hidden',
        animation: alert.severity === 'critical' ? 'criticalPulse 2s infinite' : 'none'
      }}
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
    >
      {/* Progress bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: severityConfig.color,
          transition: 'width 0.1s linear',
          opacity: isPaused ? 0.5 : 1
        }} />
      </div>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px 8px 16px',
        gap: '8px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '1.2em' }} title={alertTypeConfig.label}>
            {alertTypeConfig.icon}
          </span>
          <span style={{ fontSize: '1em' }}>
            {severityConfig.icon}
          </span>
        </div>
        
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          minWidth: 0
        }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: '700',
            letterSpacing: '0.5px',
            color: severityConfig.color
          }}>
            {alert.severity.toUpperCase()}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            Rule {alert.rule?.id} • Level {alert.rule?.level}
          </div>
        </div>

        <button 
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            fontSize: '1rem',
            padding: '4px',
            borderRadius: '4px',
            transition: 'all 0.2s',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#f3f4f6';
            e.target.style.color = '#374151';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'none';
            e.target.style.color = '#9ca3af';
          }}
          title="Close notification"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '0 16px 8px 16px' }}>
        <div style={{
          color: '#374151',
          fontSize: '0.875rem',
          fontWeight: '600',
          lineHeight: 1.4,
          marginBottom: '8px'
        }}>
          {alert.rule?.description || 'Security Alert'}
        </div>
        
        {alertDetails.length > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            marginBottom: '8px'
          }}>
            {alertDetails.map((detail, index) => (
              <div key={index} style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center'
              }}>
                {detail}
              </div>
            ))}
          </div>
        )}
        
        <div style={{
          fontSize: '0.75rem',
          color: '#9ca3af',
          fontWeight: '500'
        }}>
          {new Date(alert.timestamp).toLocaleTimeString()}
        </div>
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '8px 16px 12px 16px',
        borderTop: '1px solid #f3f4f6'
      }}>
        <button 
          style={{
            flex: 1,
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            border: `1px solid ${severityConfig.color}`,
            background: severityConfig.color,
            color: 'white'
          }}
          onClick={() => {
            console.log('View alert details:', alert.id);
            handleClose();
          }}
          onMouseEnter={(e) => {
            e.target.style.filter = 'brightness(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.filter = 'none';
          }}
          title="View full alert details"
        >
          View Details
        </button>
        
        <button 
          style={{
            flex: 1,
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            border: '1px solid #d1d5db',
            background: '#f9fafb',
            color: '#374151'
          }}
          onClick={() => {
            console.log('Quick acknowledge:', alert.id);
            handleClose();
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#f9fafb';
          }}
          title="Acknowledge this alert"
        >
          Acknowledge
        </button>
      </div>

      {/* Pause indicator */}
      {isPaused && (
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '0.625rem',
          fontWeight: '500'
        }}>
          ⏸️ Paused
        </div>
      )}

      <style jsx>{`
        @keyframes criticalPulse {
          0%, 100% { 
            box-shadow: 0 10px 25px rgba(220, 38, 38, 0.15); 
          }
          50% { 
            box-shadow: 0 10px 25px rgba(220, 38, 38, 0.3); 
          }
        }
      `}</style>
    </div>
  );
};