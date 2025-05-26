// src/hooks/useAlerts.tsx
import { useState, useEffect } from 'react';
import { WazuhAlert } from '../types/alert';
import { WebhookService } from '../services/webhook';

export const useAlerts = () => {
    const [alerts, setAlerts] = useState<WazuhAlert[]>([]);
    const [isConnected, setIsConnected] = useState<boolean>(false);

    useEffect(() => {
        const webhook = WebhookService.getInstance();

        webhook.addListener((newAlert: WazuhAlert) => {
            setAlerts(prev => [newAlert, ...prev.slice(0, 99)]); // Keep last 100 alerts
        });

        webhook.addConnectionListener((status: boolean) => {
            setIsConnected(status);
        });

        webhook.startListening();
        setIsConnected(webhook.isServiceConnected());
    }, []);

    return { alerts, isConnected };
};