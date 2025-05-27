import React, { useEffect, useState } from 'react';
import { WebhookStatus } from './components/WebhookStatus';
import { Modal } from './components/Modal';
import { useWebhookListener } from './hooks/useWebhookListener';
import { Webhook } from 'lucide-react';

const App: React.FC = () => {
  const { 
    connectionStatus, 
    lastWebhookData, 
    connect, 
    disconnect, 
    clearLastWebhookData 
  } = useWebhookListener();

  const [showModal, setShowModal] = useState(false);

  // Show modal when new webhook data arrives
  useEffect(() => {
    if (lastWebhookData) {
      setShowModal(true);
    }
  }, [lastWebhookData]);

  const handleCloseModal = () => {
    setShowModal(false);
    clearLastWebhookData();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Webhook className="w-12 h-12 text-blue-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">
              Webhook Modal Alert App
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Connect to the webhook server and receive real-time notifications 
            when webhooks are triggered at localhost:5001/webhook
          </p>
        </div>

        {/* Status Component */}
        <div className="max-w-2xl mx-auto">
          <WebhookStatus
            status={connectionStatus}
            onConnect={connect}
            onDisconnect={disconnect}
          />

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              How to Test
            </h2>
            <div className="space-y-4 text-gray-600">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">
                  Send a test webhook:
                </h3>
                
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">
                  Or use any webhook service:
                </h3>
                <p className="text-sm">
                  Point your webhook URL to: <strong>http://localhost:5001/webhook</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && lastWebhookData && (
          <Modal
            isOpen={showModal}
            onClose={handleCloseModal}
            webhookData={lastWebhookData}
          />
        )}
      </div>
    </div>
  );
};

export default App;