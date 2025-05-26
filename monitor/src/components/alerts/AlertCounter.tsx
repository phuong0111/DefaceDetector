// src/components/alerts/AlertCounter.tsx
import React from 'react';
import { WazuhAlert } from '../../types/alert';

interface AlertCounterProps {
    alerts: WazuhAlert[];
}

export const AlertCounter: React.FC<AlertCounterProps> = ({ alerts }) => {
    const getAlertsByLevel = () => {
        const counts = { low: 0, medium: 0, high: 0, critical: 0 };

        alerts.forEach(alert => {
            if (alert.rule.level <= 5) counts.low++;
            else if (alert.rule.level <= 10) counts.medium++;
            else if (alert.rule.level <= 12) counts.high++;
            else counts.critical++;
        });

        return counts;
    };

    const counts = getAlertsByLevel();

    return (
        <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-green-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{counts.low}</div>
                <div className="text-sm text-green-600">Low</div>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">{counts.medium}</div>
                <div className="text-sm text-yellow-600">Medium</div>
            </div>
            <div className="bg-orange-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">{counts.high}</div>
                <div className="text-sm text-orange-600">High</div>
            </div>
            <div className="bg-red-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">{counts.critical}</div>
                <div className="text-sm text-red-600">Critical</div>
            </div>
        </div>
    );
};