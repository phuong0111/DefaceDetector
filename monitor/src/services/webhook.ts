// src/services/webhook.ts
import { WazuhAlert } from '../types/alert';

export class WebhookService {
    private static instance: WebhookService;
    private alerts: WazuhAlert[] = [];
    private listeners: ((alert: WazuhAlert) => void)[] = [];
    private isConnected: boolean = false;
    private connectionListeners: ((status: boolean) => void)[] = [];
    private websocket: WebSocket | null = null;
    private reconnectInterval: NodeJS.Timeout | null = null;

    static getInstance(): WebhookService {
        if (!this.instance) {
            this.instance = new WebhookService();
        }
        return this.instance;
    }

    startListening(): void {
        // Connect to WebSocket server that receives webhook data
        this.connectWebSocket();
    }

    private connectWebSocket(): void {
        try {
            // Connect to a WebSocket server on port 5001 that forwards webhook data
            this.websocket = new WebSocket('ws://localhost:5001/ws');

            this.websocket.onopen = () => {
                console.log('WebSocket connected to webhook server');
                this.isConnected = true;
                this.notifyConnectionListeners(true);

                if (this.reconnectInterval) {
                    clearInterval(this.reconnectInterval);
                    this.reconnectInterval = null;
                }
            };

            this.websocket.onmessage = (event) => {
                try {
                    const alertData = JSON.parse(event.data);
                    const alert = this.convertToWazuhAlert(alertData);
                    this.addAlert(alert);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            this.websocket.onclose = () => {
                console.log('WebSocket disconnected');
                this.isConnected = false;
                this.notifyConnectionListeners(false);
                this.attemptReconnect();
            };

            this.websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.isConnected = false;
                this.notifyConnectionListeners(false);
            };

        } catch (error) {
            console.error('Failed to connect WebSocket:', error);
            this.isConnected = false;
            this.notifyConnectionListeners(false);
            this.attemptReconnect();
        }
    }

    private attemptReconnect(): void {
        if (!this.reconnectInterval) {
            this.reconnectInterval = setInterval(() => {
                console.log('Attempting to reconnect WebSocket...');
                this.connectWebSocket();
            }, 5000);
        }
    }

    private convertToWazuhAlert(alertData: any): WazuhAlert {
        return {
            id: alertData.id || Math.random().toString(36).substr(2, 9),
            timestamp: alertData.timestamp || new Date().toISOString(),
            rule: {
                id: alertData.rule?.id || 0,
                description: alertData.rule?.description || 'Unknown alert',
                level: alertData.rule?.level || 1
            },
            agent: {
                name: alertData.agent?.name || 'unknown',
                ip: alertData.agent?.ip || '0.0.0.0'
            },
            data: alertData.data || alertData
        };
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

    stopListening(): void {
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
        if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
            this.reconnectInterval = null;
        }
        this.isConnected = false;
        this.notifyConnectionListeners(false);
    }
}