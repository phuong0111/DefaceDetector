// src/components/Dashboard/Dashboard.jsx

import React from 'react';
import { StatisticsPanel } from './StatisticsPanel';
import { RealTimePanel } from './RealTimePanel';
import { AlertFilter } from '../Alert/AlertFilter';
import { AlertList } from '../Alert/AlertList';

export const Dashboard = ({
  alerts = [],
  stats = {},
  filters = {},
  filterOptions = {},
  isConnected = false,
  connectionError = null,
  onFiltersChange = () => {},
  onClearFilters = () => {},
  onStatusUpdate = () => {},
  onRemove = () => {},
  onBulkUpdate = () => {},
  onBulkRemove = () => {},
  onManualReconnect = () => {}
}) => {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#f8fafc',
      overflow: 'hidden'
    }}>
      {/* Fixed Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        flexShrink: 0
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div>
            <h1 style={{
              color: '#1f2937',
              fontSize: '1.5rem',
              fontWeight: '700',
              margin: '0 0 4px 0'
            }}>
              🛡️ Wazuh Security Monitor
            </h1>
            <p style={{
              color: '#6b7280',
              fontSize: '0.875rem',
              margin: '0'
            }}>
              Real-time security alert monitoring and management
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '500',
              background: isConnected ? '#dcfce7' : '#fee2e2',
              color: isConnected ? '#15803d' : '#dc2626',
              border: `1px solid ${isConnected ? '#bbf7d0' : '#fecaca'}`
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isConnected ? '#16a34a' : '#dc2626',
                animation: isConnected ? 'pulse 2s infinite' : 'none'
              }} />
              <span>
                {isConnected ? '✅ Connected' : '❌ Disconnected'}
              </span>
              {!isConnected && (
                <button
                  onClick={onManualReconnect}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                  }}
                  title="Retry connection"
                >
                  🔄
                </button>
              )}
            </div>
          </div>
        </div>
        
        {connectionError && (
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            maxWidth: '1400px',
            margin: '12px auto 0'
          }}>
            <span>⚠️</span>
            <span style={{ color: '#92400e', fontSize: '0.875rem' }}>
              {connectionError}
            </span>
          </div>
        )}
      </header>

      {/* Main Content Layout */}
      <div style={{
        flex: 1,
        display: 'flex',
        minHeight: 0,
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Left Sidebar - Statistics and Real-time Panel */}
        <aside style={{
          width: '320px',
          background: 'white',
          borderRight: '1px solid #e5e7eb',
          overflow: 'auto',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <RealTimePanel 
            isConnected={isConnected}
            stats={stats}
            alerts={alerts}
          />
          
          <StatisticsPanel 
            stats={stats}
            alerts={alerts}
          />
        </aside>

        {/* Main Panel - Alerts */}
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          background: '#f8fafc'
        }}>
          <AlertFilter
            filters={filters}
            filterOptions={filterOptions}
            onFiltersChange={onFiltersChange}
            onClearFilters={onClearFilters}
            stats={stats}
          />
          
          <AlertList
            alerts={alerts}
            onStatusUpdate={onStatusUpdate}
            onRemove={onRemove}
            onBulkUpdate={onBulkUpdate}
            onBulkRemove={onBulkRemove}
          />
        </main>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          aside {
            width: 280px !important;
          }
        }

        @media (max-width: 768px) {
          .dashboard-content {
            flex-direction: column !important;
          }

          aside {
            width: 100% !important;
            height: 200px;
            border-right: none !important;
            border-bottom: 1px solid #e5e7eb;
          }

          header > div {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px;
          }

          header > div > div:last-child {
            width: 100%;
            justify-content: flex-end;
          }
        }

        /* Custom scrollbar */
        aside::-webkit-scrollbar {
          width: 6px;
        }

        aside::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        aside::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        aside::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};