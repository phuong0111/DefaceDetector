// src/utils/alertHelpers.js

export const alertHelpers = {
  getSeverityFromLevel: (level) => {
    if (level >= 12) return "critical";
    if (level >= 8) return "high";
    if (level >= 5) return "medium";
    if (level >= 3) return "low";
    return "info";
  },

  parseWazuhAlert: (rawData) => {
    // Handle both direct Wazuh format and wrapped webhook format
    const alert = rawData.alert || rawData;

    return {
      id:
        alert.id ||
        `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: alert.timestamp || new Date().toISOString(),
      rule: {
        id: alert.rule?.id || "Unknown",
        level: alert.rule?.level || 1,
        description: alert.rule?.description || "Security Alert",
        groups: alert.rule?.groups || [],
      },
      agent: {
        id: alert.agent?.id || "000",
        name: alert.agent?.name || "Unknown Agent",
        ip: alert.agent?.ip || "Unknown IP",
      },
      location: alert.location || "Unknown Location",
      full_log: alert.full_log || alert.message || "No log data available",
      decoder: {
        name: alert.decoder?.name || "unknown",
      },
      data: alert.data || {},
      severity:
        alert.severity ||
        alertHelpers.getSeverityFromLevel(alert.rule?.level || 1),
      status: alert.status || "new",
    };
  },

  filterAlerts: (alerts, filters) => {
    return alerts.filter((alert) => {
      // Severity filter
      if (
        filters.severity &&
        filters.severity !== "all" &&
        alert.severity !== filters.severity
      ) {
        return false;
      }

      // Agent filter
      if (
        filters.agent &&
        filters.agent !== "all" &&
        alert.agent.id !== filters.agent
      ) {
        return false;
      }

      // Rule ID filter
      if (filters.ruleId && alert.rule.id.toString() !== filters.ruleId) {
        return false;
      }

      // Search text filter
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const searchFields = [
          alert.rule.description,
          alert.agent.name,
          alert.location,
          alert.full_log,
        ]
          .join(" ")
          .toLowerCase();

        if (!searchFields.includes(searchLower)) {
          return false;
        }
      }

      // Time range filter
      if (filters.timeRange) {
        const alertTime = new Date(alert.timestamp);
        const now = new Date();
        const diffHours = (now - alertTime) / (1000 * 60 * 60);

        switch (filters.timeRange) {
          case "1h":
            if (diffHours > 1) return false;
            break;
          case "24h":
            if (diffHours > 24) return false;
            break;
          case "7d":
            if (diffHours > 168) return false;
            break;
          default:
            break;
        }
      }

      return true;
    });
  },

  getAlertStats: (alerts) => {
    const stats = {
      total: alerts.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
      byAgent: {},
      byRule: {},
      last24h: 0,
      lastHour: 0,
    };

    const now = new Date();

    alerts.forEach((alert) => {
      // Count by severity
      stats[alert.severity]++;

      // Count by agent
      const agentKey = alert.agent.name || alert.agent.id;
      stats.byAgent[agentKey] = (stats.byAgent[agentKey] || 0) + 1;

      // Count by rule
      const ruleKey = `${alert.rule.id}: ${alert.rule.description}`;
      stats.byRule[ruleKey] = (stats.byRule[ruleKey] || 0) + 1;

      // Time-based counts
      const alertTime = new Date(alert.timestamp);
      const diffHours = (now - alertTime) / (1000 * 60 * 60);

      if (diffHours <= 24) stats.last24h++;
      if (diffHours <= 1) stats.lastHour++;
    });

    return stats;
  },

  getSeverityIcon: (severity) => {
    const icons = {
      critical: "🚨",
      high: "⚠️",
      medium: "⚡",
      low: "ℹ️",
      info: "📝",
    };
    return icons[severity] || icons.info;
  },

  sortAlerts: (alerts, sortBy = "timestamp", sortOrder = "desc") => {
    return [...alerts].sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case "timestamp":
          aVal = new Date(a.timestamp);
          bVal = new Date(b.timestamp);
          break;
        case "severity":
          const severityOrder = {
            critical: 4,
            high: 3,
            medium: 2,
            low: 1,
            info: 0,
          };
          aVal = severityOrder[a.severity];
          bVal = severityOrder[b.severity];
          break;
        case "rule":
          aVal = a.rule.level;
          bVal = b.rule.level;
          break;
        case "agent":
          aVal = a.agent.name || a.agent.id;
          bVal = b.agent.name || b.agent.id;
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  },
};
