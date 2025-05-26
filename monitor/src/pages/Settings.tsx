// src/pages/Settings.tsx
import React from 'react';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { useAlerts } from '../hooks/useAlerts';

export const Settings: React.FC = () => {
    const { isConnected } = useAlerts();

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Webhook Configuration</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Webhook URL
                            </label>
                            <input
                                type="text"
                                value="localhost:5001/webhook/wazuh"
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Connection Status
                            </label>
                            <StatusIndicator isConnected={isConnected} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Alert Settings</h2>

                    <div className="space-y-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="sound-alerts"
                                defaultChecked
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="sound-alerts" className="ml-2 text-sm text-gray-700">
                                Enable sound alerts for critical alerts
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="desktop-notifications"
                                defaultChecked
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="desktop-notifications" className="ml-2 text-sm text-gray-700">
                                Show desktop notifications
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};