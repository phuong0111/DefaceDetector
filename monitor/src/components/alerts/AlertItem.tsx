// src/components/alerts/AlertItem.tsx
import React from 'react';
import { WazuhAlert } from '../../types/alert';
import { formatDate, getRelativeTime } from '../../utils/dateFormatter';

interface AlertItemProps {
    alert: WazuhAlert;
}

export const AlertItem: React.FC<AlertItemProps> = ({ alert }) => {
    const getSeverityColor = (level: number): string => {
        if (level <= 5) return 'bg-green-100 text-green-800 border-green-200';
        if (level <= 10) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        if (level <= 12) return 'bg-orange-100 text-orange-800 border-orange-200';
        return 'bg-red-100 text-red-800 border-red-200';
    };

    const getSeverityLabel = (level: number): string => {
        if (level <= 5) return 'Low';
        if (level <= 10) return 'Medium';
        if (level <= 12) return 'High';
        return 'Critical';
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(alert.rule.level)}`}>
                            {getSeverityLabel(alert.rule.level)}
                        </span>
                        <span className="text-xs text-gray-500">Rule {alert.rule.id}</span>
                    </div>

                    <h3 className="font-medium text-gray-900 mb-1">
                        {alert.rule.description}
                    </h3>

                    <div className="text-sm text-gray-600 space-y-1">
                        <div>Agent: {alert.agent.name} ({alert.agent.ip})</div>
                        <div>Time: {formatDate(alert.timestamp)}</div>
                    </div>
                </div>

                <div className="text-xs text-gray-500 ml-4">
                    {getRelativeTime(alert.timestamp)}
                </div>
            </div>
        </div>
    );
};
