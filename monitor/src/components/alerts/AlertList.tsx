// src/components/alerts/AlertList.tsx
import React from 'react';
import { WazuhAlert } from '../../types/alert';
import { AlertItem } from './AlertItem';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface AlertListProps {
    alerts: WazuhAlert[];
    loading?: boolean;
}

export const AlertList: React.FC<AlertListProps> = ({ alerts, loading = false }) => {
    if (loading) {
        return <LoadingSpinner />;
    }

    if (alerts.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <div className="text-lg mb-2">No alerts yet</div>
                <div className="text-sm">Waiting for webhook data...</div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {alerts.map(alert => (
                <AlertItem key={alert.id} alert={alert} />
            ))}
        </div>
    );
};
