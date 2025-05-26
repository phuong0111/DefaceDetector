// src/pages/AlertsPage.tsx
import React, { useState } from 'react';
import { useAlerts } from '../hooks/useAlerts';
import { AlertList } from '../components/alerts/AlertList';
import { AlertFilter } from '../components/alerts/AlertFilter';
import { WazuhAlert } from '../types/alert';

export const AlertsPage: React.FC = () => {
    const { alerts } = useAlerts();
    const [filter, setFilter] = useState<string>('all');

    const filterAlerts = (alerts: WazuhAlert[], filter: string): WazuhAlert[] => {
        if (filter === 'all') return alerts;

        return alerts.filter(alert => {
            const level = alert.rule.level;
            switch (filter) {
                case 'low': return level <= 5;
                case 'medium': return level > 5 && level <= 10;
                case 'high': return level > 10 && level <= 12;
                case 'critical': return level > 12;
                default: return true;
            }
        });
    };

    const filteredAlerts = filterAlerts(alerts, filter);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">All Alerts</h1>
                <div className="text-sm text-gray-600">
                    Total: {alerts.length} alerts
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <AlertFilter onFilterChange={setFilter} currentFilter={filter} />
                    <div className="text-sm text-gray-600">
                        Showing {filteredAlerts.length} alerts
                    </div>
                </div>

                <AlertList alerts={filteredAlerts} />
            </div>
        </div>
    );
};