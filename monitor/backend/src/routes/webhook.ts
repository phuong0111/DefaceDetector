import { Router, Request, Response } from 'express';
import { WebhookPayload, WebSocketMessage } from '../types/webhook';
import { WebSocketServer } from 'ws';

export const createWebhookRouter = (wss: WebSocketServer) => {
    const router = Router();

    router.post('/webhook', (req: Request, res: Response) => {
        try {
            const webhookPayload: WebhookPayload = {
                timestamp: new Date().toISOString(),
                data: req.body,
                headers: req.headers as Record<string, string>,
                method: req.method,
                url: req.url
            };

            console.log('Webhook received:', webhookPayload);

            // Broadcast to all connected WebSocket clients
            const message: WebSocketMessage = {
                type: 'webhook_triggered',
                payload: webhookPayload
            };

            wss.clients.forEach((client) => {
                if (client.readyState === client.OPEN) {
                    client.send(JSON.stringify(message));
                }
            });

            res.status(200).json({
                success: true,
                message: 'Webhook received and broadcasted',
                timestamp: webhookPayload.timestamp
            });

        } catch (error) {
            console.error('Webhook processing error:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing webhook'
            });
        }
    });

    return router;
};