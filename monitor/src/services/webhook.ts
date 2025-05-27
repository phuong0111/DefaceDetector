// src/services/webhook.ts
import { WazuhAlert } from '../types/alert';
import { io, Socket } from 'socket.io-client';

export class WebhookService {
    private static instance: WebhookService;
    private alerts: WazuhAlert[] = [];
    private listeners: ((alert: WazuhAlert) => void)[] = [];
    private isConnected: boolean = false;
    private connectionListeners: ((status: boolean) => void)[] = [];
    private socket: Socket | null = null;
    private processedAlertIds: Set<string> = new Set();

    static getInstance(): WebhookService {
        if (!this.instance) {
            this.instance = new WebhookService();
        }
        return this.instance;
    }

    startListening(): void {
        this.connectSocket();
    }

    private connectSocket(): void {
        try {
            // Connect to Flask-SocketIO server
            this.socket = io('http://localhost:5001', {
                transports: ['websocket', 'polling'],
                autoConnect: true,
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5
            });

            this.socket.on('connect', () => {
                console.log('Connected to Flask WebSocket server');
                this.isConnected = true;
                this.notifyConnectionListeners(true);

                // Request recent alerts when connecting
                this.socket?.emit('get_recent_alerts');
            });

            this.socket.on('disconnect', () => {
                console.log('Disconnected from Flask WebSocket server');
                this.isConnected = false;
                this.notifyConnectionListeners(false);
            });

            this.socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                this.isConnected = false;
                this.notifyConnectionListeners(false);
            });

            // Listen for new alerts from Flask backend
            this.socket.on('new_alert', (alertData: any) => {
                console.log('Received new alert via Socket.IO:', alertData);
                const alert = this.convertToWazuhAlert(alertData);

                // Check for duplicates
                if (!this.processedAlertIds.has(alert.id)) {
                    this.processedAlertIds.add(alert.id);
                    this.addAlert(alert);

                    // Clean up old IDs
                    if (this.processedAlertIds.size > 1000) {
                        const idsArray = Array.from(this.processedAlertIds);
                        this.processedAlertIds = new Set(idsArray.slice(-500));
                    }
                }
            });

            // Handle recent alerts when reconnecting
            this.socket.on('recent_alerts', (alerts: any[]) => {
                console.log('Received recent alerts:', alerts.length);
                alerts.forEach(alertData => {
                    const alert = this.convertToWazuhAlert(alertData);
                    if (!this.processedAlertIds.has(alert.id)) {
                        this.processedAlertIds.add(alert.id);
                        this.addAlert(alert, false); // Don't notify for historical alerts
                    }
                });
            });

            this.socket.on('connection_status', (data: any) => {
                console.log('Connection status:', data);
            });

        } catch (error) {
            console.error('Failed to connect Socket.IO:', error);
            this.isConnected = false;
            this.notifyConnectionListeners(false);
        }
    }

    private convertToWazuhAlert(alertData: any): WazuhAlert {
        // Use the ID from Flask backend or generate one
        const alertId = alertData.id ||
            alertData.alert_id ||
            this.generateAlertId(alertData);

        return {
            id: alertId,
            timestamp: alertData.timestamp || new Date().toISOString(),
            rule: {
                id: alertData.rule?.id || alertData.rule_id || 0,
                description: alertData.rule?.description || alertData.rule_description || 'Unknown alert',
                level: alertData.rule?.level || alertData.rule_level || 1
            },
            agent: {
                name: alertData.agent?.name || alertData.agent_name || 'unknown',
                ip: alertData.agent?.ip || alertData.agent_ip || '0.0.0.0'
            },
            data: alertData.data || alertData.raw_alert || alertData
        };
    }

    private generateAlertId(alertData: any): string {
        const timestamp = alertData.timestamp || new Date().toISOString();
        const ruleId = alertData.rule?.id || alertData.rule_id || 0;
        const agentName = alertData.agent?.name || alertData.agent_name || 'unknown';

        const content = `${timestamp}-${ruleId}-${agentName}`;
        return btoa(content).replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);
    }

    addListener(callback: (alert: WazuhAlert) => void): void {
        this.listeners.push(callback);
    }

    addConnectionListener(callback: (status: boolean) => void): void {
        this.connectionListeners.push(callback);
    }

    private addAlert(alert: WazuhAlert, notify: boolean = true): void {
        this.alerts.unshift(alert);

        // Keep only last 100 alerts
        if (this.alerts.length > 100) {
            this.alerts = this.alerts.slice(0, 100);
        }

        if (notify) {
            this.notifyListeners(alert);
        }
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
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.isConnected = false;
        this.notifyConnectionListeners(false);
    }

    clearAlerts(): void {
        this.alerts = [];
        this.processedAlertIds.clear();
    }
}