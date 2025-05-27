import React from 'react';
import { X, Clock, Globe, Database } from 'lucide-react';
import { WebhookPayload } from '../types/webhook';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  webhookData: WebhookPayload;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, webhookData }) => {
  if (!isOpen) return null;

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-500 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center">
            <Globe className="w-6 h-6 mr-2" />
            Webhook Triggered!
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
          {/* Timestamp */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <Clock className="w-5 h-5 text-gray-500 mr-2" />
              <h3 className="font-semibold text-gray-700">Timestamp</h3>
            </div>
            <p className="text-gray-600 bg-gray-50 p-3 rounded">
              {formatTimestamp(webhookData.timestamp)}
            </p>
          </div>

          {/* Request Info */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <Globe className="w-5 h-5 text-gray-500 mr-2" />
              <h3 className="font-semibold text-gray-700">Request Info</h3>
            </div>
            <div className="bg-gray-50 p-3 rounded space-y-2">
              <p><span className="font-medium">Method:</span> {webhookData.method}</p>
              <p><span className="font-medium">URL:</span> {webhookData.url}</p>
            </div>
          </div>

          {/* Payload Data */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <Database className="w-5 h-5 text-gray-500 mr-2" />
              <h3 className="font-semibold text-gray-700">Payload Data</h3>
            </div>
            <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto max-h-40 text-gray-700">
              {JSON.stringify(webhookData.data, null, 2)}
            </pre>
          </div>

          {/* Headers */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Headers</h3>
            <div className="bg-gray-50 p-3 rounded">
              <pre className="text-sm text-gray-600 overflow-auto max-h-32">
                {JSON.stringify(webhookData.headers, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};