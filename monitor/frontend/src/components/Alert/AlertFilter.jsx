// src/components/Alert/AlertFilter.jsx

import React, { useState } from 'react';

export const AlertFilter = ({ 
  filters = {}, 
  filterOptions = {}, 
  onFiltersChange = () => {}, 
  onClearFilters = () => {},
  stats = {}
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key, value) => {
    onFiltersChange({ [key]: value });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== 'all' && value !== ''
  );

  return (
    <div style={{
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '16px'
    }}>
      {/* Main Filter Row */}
      <div style={{
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: isExpanded ? '16px' : '0'
      }}>
        {/* Search Input */}
        <div style={{ flex: '1', minWidth: '200px' }}>
          <input
            type="text"
            placeholder="🔍 Search alerts..."
            value={filters.searchText || ''}
            onChange={(e) => handleFilterChange('searchText', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem'
            }}
          />
        </div>
        
        {/* Severity Filter */}
        <select
          value={filters.severity || 'all'}
          onChange={(e) => handleFilterChange('severity', e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '0.875rem',
            background: 'white'
          }}
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical ({stats.critical || 0})</option>
          <option value="high">High ({stats.high || 0})</option>
          <option value="medium">Medium ({stats.medium || 0})</option>
          <option value="low">Low ({stats.low || 0})</option>
          <option value="info">Info ({stats.info || 0})</option>
        </select>

        {/* Time Range Filter */}
        <select
          value={filters.timeRange || 'all'}
          onChange={(e) => handleFilterChange('timeRange', e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '0.875rem',
            background: 'white'
          }}
        >
          <option value="all">All Time</option>
          <option value="1h">Last Hour ({stats.lastHour || 0})</option>
          <option value="24h">Last 24 Hours ({stats.last24h || 0})</option>
          <option value="7d">Last 7 Days</option>
        </select>

        {/* More Filters Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            background: 'white',
            cursor: 'pointer',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            position: 'relative'
          }}
        >
          More Filters
          {hasActiveFilters && (
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '8px',
              height: '8px',
              background: '#dc2626',
              borderRadius: '50%'
            }} />
          )}
          <span style={{
            transform: isExpanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s'
          }}>
            ▼
          </span>
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            style={{
              padding: '8px 12px',
              border: '1px solid #dc2626',
              borderRadius: '6px',
              background: '#fee2e2',
              color: '#dc2626',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div style={{
          borderTop: '1px solid #e5e7eb',
          paddingTop: '16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          {/* Status Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '4px'
            }}>
              Status
            </label>
            <select
              value={filters.status || 'all'}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem',
                background: 'white'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="new">New ({stats.new || 0})</option>
              <option value="acknowledged">Acknowledged ({stats.acknowledged || 0})</option>
              <option value="investigating">Investigating ({stats.investigating || 0})</option>
              <option value="resolved">Resolved ({stats.resolved || 0})</option>
            </select>
          </div>

          {/* Rule ID Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '4px'
            }}>
              Rule ID
            </label>
            <input
              type="text"
              placeholder="e.g. 550"
              value={filters.ruleId || ''}
              onChange={(e) => handleFilterChange('ruleId', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}
            />
          </div>

          {/* Agent Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '4px'
            }}>
              Agent
            </label>
            <select
              value={filters.agent || 'all'}
              onChange={(e) => handleFilterChange('agent', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem',
                background: 'white'
              }}
            >
              <option value="all">All Agents</option>
              {(filterOptions.agents || []).filter(agent => agent !== 'all').map(agent => (
                <option key={agent} value={agent}>{agent}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Quick Filter Buttons */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: '12px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => onFiltersChange({ severity: 'critical', timeRange: 'all' })}
          style={{
            padding: '4px 8px',
            border: '1px solid #dc2626',
            borderRadius: '12px',
            background: filters.severity === 'critical' ? '#fee2e2' : 'white',
            color: '#dc2626',
            cursor: 'pointer',
            fontSize: '0.75rem'
          }}
        >
          🚨 Critical Only
        </button>

        <button
          onClick={() => onFiltersChange({ timeRange: '1h', severity: 'all' })}
          style={{
            padding: '4px 8px',
            border: '1px solid #2563eb',
            borderRadius: '12px',
            background: filters.timeRange === '1h' ? '#dbeafe' : 'white',
            color: '#2563eb',
            cursor: 'pointer',
            fontSize: '0.75rem'
          }}
        >
          🕐 Last Hour
        </button>

        <button
          onClick={() => onFiltersChange({ status: 'new', severity: 'all' })}
          style={{
            padding: '4px 8px',
            border: '1px solid #d97706',
            borderRadius: '12px',
            background: filters.status === 'new' ? '#fef3c7' : 'white',
            color: '#d97706',
            cursor: 'pointer',
            fontSize: '0.75rem'
          }}
        >
          🆕 New Alerts
        </button>

        <button
          onClick={() => onFiltersChange({ severity: 'high', timeRange: '24h' })}
          style={{
            padding: '4px 8px',
            border: '1px solid #ea580c',
            borderRadius: '12px',
            background: (filters.severity === 'high' && filters.timeRange === '24h') ? '#fed7aa' : 'white',
            color: '#ea580c',
            cursor: 'pointer',
            fontSize: '0.75rem'
          }}
        >
          ⚠️ High Priority
        </button>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          background: '#f0f9ff',
          border: '1px solid #bfdbfe',
          borderRadius: '6px',
          fontSize: '0.875rem'
        }}>
          <strong>Active Filters: </strong>
          {filters.severity !== 'all' && (
            <span style={{
              background: '#dbeafe',
              color: '#1d4ed8',
              padding: '2px 6px',
              borderRadius: '4px',
              marginRight: '4px'
            }}>
              Severity: {filters.severity}
            </span>
          )}
          {filters.status !== 'all' && (
            <span style={{
              background: '#dbeafe',
              color: '#1d4ed8',
              padding: '2px 6px',
              borderRadius: '4px',
              marginRight: '4px'
            }}>
              Status: {filters.status}
            </span>
          )}
          {filters.timeRange !== 'all' && (
            <span style={{
              background: '#dbeafe',
              color: '#1d4ed8',
              padding: '2px 6px',
              borderRadius: '4px',
              marginRight: '4px'
            }}>
              Time: {filters.timeRange}
            </span>
          )}
          {filters.ruleId && (
            <span style={{
              background: '#dbeafe',
              color: '#1d4ed8',
              padding: '2px 6px',
              borderRadius: '4px',
              marginRight: '4px'
            }}>
              Rule: {filters.ruleId}
            </span>
          )}
          {filters.searchText && (
            <span style={{
              background: '#dbeafe',
              color: '#1d4ed8',
              padding: '2px 6px',
              borderRadius: '4px',
              marginRight: '4px'
            }}>
              Search: "{filters.searchText}"
            </span>
          )}
        </div>
      )}
    </div>
  );
};