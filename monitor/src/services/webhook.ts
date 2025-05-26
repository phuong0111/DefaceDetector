// src/services/webhook.ts
import { WazuhAlert } from '../types/alert';

export class WebhookService {
    private static instance: WebhookService;
    private alerts: WazuhAlert[] = [];
    private listeners: ((alert: WazuhAlert) => void)[] = [];
    private isConnected: boolean = false;
    private connectionListeners: ((status: boolean) => void)[] = [];

    static getInstance(): WebhookService {
        if (!this.instance) {
            this.instance = new WebhookService();
        }
        return this.instance;
    }

    startListening(): void {
        // Simulate webhook server connection
        this.isConnected = true;
        this.notifyConnectionListeners(true);

        // Simulate receiving alerts periodically for demo
        this.simulateAlerts();
    }

    private simulateAlerts(): void {
        setInterval(() => {
            const mockAlert: WazuhAlert = {
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toISOString(),
                rule: {
                    id: Math.floor(Math.random() * 1000) + 1000,
                    description: this.getRandomAlertDescription(),
                    level: Math.floor(Math.random() * 15) + 1
                },
                agent: {
                    name: `server-${Math.floor(Math.random() * 10) + 1}`,
                    ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`
                },
                data: {}
            };

            this.addAlert(mockAlert);
        }, 5000);
    }

    private getRandomAlertDescription(): string {
        const descriptions = [
            'SSH login attempt',
            'File integrity monitoring alert',
            'Rootkit detection',
            'System log anomaly',
            'Network intrusion detected',
            'Privilege escalation attempt',
            'Malware detected',
            'Configuration change detected'
        ];
        return descriptions[Math.floor(Math.random() * descriptions.length)];
    }

    addListener(callback: (alert: WazuhAlert) => void): void {
        this.listeners.push(callback);
    }

    addConnectionListener(callback: (status: boolean) => void): void {
        this.connectionListeners.push(callback);
    }

    private addAlert(alert: WazuhAlert): void {
        this.alerts.unshift(alert);
        this.notifyListeners(alert);
    }

    private notifyListeners(alert: WazuhAlert): void {
        this.listeners.forEach(callback => callback(alert));
    }

    private notifyConnectionListeners(status: boolean): void {
        this.connectionListeners.forEach(callback => callback(status));
    }

    getAlerts(): WazuhAlert[] {
        return this.alerts;
    }

    isServiceConnected(): boolean {
        return this.isConnected;
    }
}