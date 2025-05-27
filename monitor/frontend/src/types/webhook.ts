export interface WebhookPayload {
  timestamp: string;
  data: any;
  headers: Record<string, string>;
  method: string;
  url: string;
}

export interface WebSocketMessage {
  type: 'webhook_triggered' | 'connection_established';
  payload?: WebhookPayload;
  message?: string;
}

export type ConnectionStatus = 'disconnected' | 'connected' | 'connecting' | 'error';