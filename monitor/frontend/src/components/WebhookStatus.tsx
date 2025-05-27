import React from 'react';
import { ConnectionStatus } from '../types/webhook';
import { Wifi, WifiOff, AlertCircle, Loader } from 'lucide-react';

interface WebhookStatusProps {
  status: ConnectionStatus;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const WebhookStatus: React.FC<WebhookStatusProps> = ({ 
  status, 
  onConnect, 
  onDisconnect 
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected': return <Wifi className="w-5 h-5" />;
      case 'connecting': return <Loader className="w-5 h-5 animate-spin" />;
      case 'error': return <AlertCircle className="w-5 h-5" />;
      default: return <WifiOff className="w-5 h-5" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'Connected to webhook server';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Connection error';
      default: return 'Disconnected';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={getStatusColor()}>
            {getStatusIcon()}
          </div>
          <div>
            <p className={`font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </p>
            <p className="text-sm text-gray-500">
              Listening on localhost:5001/webhook
            </p>
          </div>
        </div>
        
        <div className="space-x-2">
          {status === 'connected' ? (
            <button
              onClick={onDisconnect}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={onConnect}
              disabled={status === 'connecting'}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {status === 'connecting' ? 'Connecting...' : 'Connect'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};