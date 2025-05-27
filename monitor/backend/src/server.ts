import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { corsMiddleware } from './middleware/cors';
import { createWebhookRouter } from './routes/webhook';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 5001;

// Middleware
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', createWebhookRouter(wss));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        connections: wss.clients.size
    });
});

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    ws.send(JSON.stringify({
        type: 'connection_established',
        message: 'Connected to webhook server'
    }));

    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

server.listen(PORT, () => {
    console.log(`Webhook server running on port ${PORT}`);
    console.log(`WebSocket server ready for connections`);
});