// src/App.js

import React, { useState, useEffect } from "react";
import { useWazuhWebSocket } from "./hooks/useWazuhWebSocket";
import { useAlertManager } from "./hooks/useAlertManager.js";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { WazuhToast } from "./components/Toast/WazuhToast";
import "./App.css";

function App() {
  // WebSocket connection
  const { isConnected, lastAlert, connectionError, manualReconnect } =
    useWazuhWebSocket("ws://localhost:5001");

  // Alert management
  const {
    alerts,
    stats,
    filters,
    filterOptions,
    addAlert,
    updateAlertStatus,
    removeAlert,
    updateFilters,
    clearFilters,
    bulkUpdateStatus,
    bulkRemove,
  } = useAlertManager();

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  // Handle new alerts from WebSocket
  useEffect(() => {
    if (lastAlert) {
      console.log("🚨 New Wazuh alert received:", lastAlert);
      addAlert(lastAlert);

      // Show toast notification for new alerts
      addToast(lastAlert);
    }
  }, [lastAlert, addAlert]);

  // Toast management
  const addToast = (alert) => {
    const toast = {
      id: `toast_${alert.id}`,
      alert,
      timestamp: new Date(),
      duration: getSeverityDuration(alert.severity),
    };

    setToasts((prev) => [toast, ...prev.slice(0, 4)]); // Keep max 5 toasts

    // Auto-remove toast
    setTimeout(() => {
      removeToast(toast.id);
    }, toast.duration);
  };

  const removeToast = (toastId) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
  };

  const getSeverityDuration = (severity) => {
    switch (severity) {
      case "critical":
        return 10000; // 10 seconds
      case "high":
        return 8000; // 8 seconds
      case "medium":
        return 6000; // 6 seconds
      case "low":
        return 4000; // 4 seconds
      default:
        return 5000; // 5 seconds
    }
  };

  // Handle alert status updates
  const handleStatusUpdate = async (alertId, newStatus) => {
    try {
      updateAlertStatus(alertId, newStatus);
      console.log(`✅ Alert ${alertId} status updated to: ${newStatus}`);
    } catch (error) {
      console.error("❌ Failed to update alert status:", error);
    }
  };

  // Handle alert removal
  const handleRemove = async (alertId) => {
    try {
      removeAlert(alertId);
      console.log(`🗑️ Alert ${alertId} removed`);
    } catch (error) {
      console.error("❌ Failed to remove alert:", error);
    }
  };

  // Handle bulk operations
  const handleBulkUpdate = async (alertIds, newStatus) => {
    try {
      bulkUpdateStatus(alertIds, newStatus);
      console.log(`✅ ${alertIds.length} alerts updated to: ${newStatus}`);
    } catch (error) {
      console.error("❌ Failed to bulk update alerts:", error);
    }
  };

  const handleBulkRemove = async (alertIds) => {
    try {
      bulkRemove(alertIds);
      console.log(`🗑️ ${alertIds.length} alerts removed`);
    } catch (error) {
      console.error("❌ Failed to bulk remove alerts:", error);
    }
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters) => {
    updateFilters(newFilters);
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  return (
    <div className="wazuh-app">
      {/* Main Dashboard */}
      <Dashboard
        alerts={alerts}
        stats={stats}
        filters={filters}
        filterOptions={filterOptions}
        isConnected={isConnected}
        connectionError={connectionError}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        onStatusUpdate={handleStatusUpdate}
        onRemove={handleRemove}
        onBulkUpdate={handleBulkUpdate}
        onBulkRemove={handleBulkRemove}
        onManualReconnect={manualReconnect}
      />

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <WazuhToast
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* Global App Styles */}
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
            "Oxygen", "Ubuntu", "Cantarell", sans-serif;
          background: #f8fafc;
          color: #1f2937;
          line-height: 1.5;
        }

        .wazuh-app {
          height: 100vh;
          width: 100vw;
          overflow: hidden;
        }

        .toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          pointer-events: none;
        }

        /* Custom scrollbars */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Focus styles */
        *:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        button:focus,
        input:focus,
        select:focus {
          outline: 2px solid #3b82f6;
          outline-offset: -2px;
        }

        /* Button base styles */
        button {
          cursor: pointer;
          transition: all 0.2s ease;
        }

        button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        /* Form element base styles */
        input,
        select,
        textarea {
          font-family: inherit;
          font-size: inherit;
        }

        /* Print styles */
        @media print {
          .toast-container {
            display: none;
          }

          .dashboard-sidebar {
            display: none;
          }

          .alert-filter {
            display: none;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .alert-card {
            border: 2px solid currentColor;
          }

          .status-indicator {
            border: 2px solid currentColor;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Dark mode support (future enhancement) */
        @media (prefers-color-scheme: dark) {
          /* Will be implemented later if needed */
        }
      `}</style>
    </div>
  );
}

export default App;
