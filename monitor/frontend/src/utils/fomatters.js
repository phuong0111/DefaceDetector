// src/utils/formatters.js

export const formatters = {
  timestamp: (timestamp) => {
    return new Date(timestamp).toLocaleString();
  },

  relativeTime: (timestamp) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now - alertTime;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  },

  severityColor: (severity) => {
    const colors = {
      critical: "#DC2626",
      high: "#EA580C",
      medium: "#D97706",
      low: "#16A34A",
      info: "#2563EB",
    };
    return colors[severity] || colors.info;
  },

  severityBgColor: (severity) => {
    const colors = {
      critical: "#FEE2E2",
      high: "#FED7AA",
      medium: "#FEF3C7",
      low: "#DCFCE7",
      info: "#DBEAFE",
    };
    return colors[severity] || colors.info;
  },

  truncateText: (text, maxLength = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  },

  formatAgent: (agent) => {
    if (!agent) return "Unknown Agent";
    return `${agent.name || agent.id || "Unknown"} (${agent.ip || "No IP"})`;
  },
};
