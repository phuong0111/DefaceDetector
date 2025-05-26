// src/pages/Dashboard.tsx
import React from 'react';
import { useAlerts } from '../hooks/useAlerts';
import { AlertCounter } from '../components/alerts/AlertCounter';
import { AlertList } from '../components/alerts/AlertList';
import { StatusIndicator } from '../components/ui/StatusIndicator';

export const Dashboard: React.FC = () => {
    const { alerts, isConnected } = useAlerts();
    const recentAlerts = alerts.slice(0, 5);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <StatusIndicator isConnected={isConnected} />
            </div>

            <AlertCounter alerts={alerts} />

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Alerts</h2>
                <AlertList alerts={recentAlerts} />

                {alerts.length > 5 && (
                    <div className="mt-4 text-center">
                        <span className="text-gray-500 text-sm">
                            Showing {recentAlerts.length} of {alerts.length} total alerts
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};