// src/components/ui/StatusIndicator.tsx
import React from 'react';

interface StatusIndicatorProps {
    isConnected: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isConnected }) => {
    return (
        <div className="flex items-center space-x-2">
            <div
                className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'
                    }`}
            />
            <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'
                }`}>
                {isConnected ? 'Connected' : 'Disconnected'}
            </span>
        </div>
    );
};