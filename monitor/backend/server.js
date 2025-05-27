const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// Store connected WebSocket clients
const clients = new Set();

// Initialize SQLite database
const dbPath = path.join(__dirname, 'webhooks.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database');
        initializeDatabase();
    }
});

// Create webhooks table if it doesn't exist
function initializeDatabase() {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS webhooks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            data TEXT NOT NULL
        )
    `;
    
    db.run(createTableSQL, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('✅ Webhooks table ready');
        }
    });
}

// Function to save webhook to database
function saveWebhookToDatabase(data) {
    return new Promise((resolve, reject) => {
        // Convert JSON object to string
        const dataString = JSON.stringify(data);
        const timestamp = new Date().toISOString();
        
        const insertSQL = `INSERT INTO webhooks (timestamp, data) VALUES (?, ?)`;
        
        db.run(insertSQL, [timestamp, dataString], function(err) {
            if (err) {
                console.error('Error saving to database:', err.message);
                reject(err);
            } else {
                console.log(`✅ Webhook saved to database with ID: ${this.lastID}`);
                resolve({
                    id: this.lastID,
                    timestamp: timestamp,
                    data: dataString
                });
            }
        });
    });
}

// Function to get recent webhooks from database
function getRecentWebhooks(limit = 50) {
    return new Promise((resolve, reject) => {
        const selectSQL = `
            SELECT id, timestamp, data 
            FROM webhooks 
            ORDER BY timestamp DESC 
            LIMIT ?
        `;
        
        db.all(selectSQL, [limit], (err, rows) => {
            if (err) {
                console.error('Error fetching webhooks:', err.message);
                reject(err);
            } else {
                // Parse data back to JSON for each row
                const webhooks = rows.map(row => ({
                    ...row,
                    data: JSON.parse(row.data)
                }));
                resolve(webhooks);
            }
        });
    });
}

// WebSocket connection handler
wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('🔌 Client connected. Total clients:', clients.size);
    
    ws.on('close', () => {
        clients.delete(ws);
        console.log('🔌 Client disconnected. Total clients:', clients.size);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clients.delete(ws);
    });
});

// Webhook endpoint
app.post('/webhook/wazuh', async (req, res) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 📨 Webhook received:`, req.body);
    
    try {
        // Save to database
        const savedWebhook = await saveWebhookToDatabase(req.body);
        
        // Broadcast to all connected WebSocket clients
        const message = JSON.stringify(req.body);
        let clientsNotified = 0;
        
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
                clientsNotified++;
            }
        });
        
        console.log(`📡 Broadcasted to ${clientsNotified} clients`);
        
        res.status(200).json({ 
            status: 'received',
            message: 'Webhook saved and broadcasted successfully',
            timestamp,
            savedToDatabase: true,
            databaseId: savedWebhook.id,
            clientsNotified
        });
        
    } catch (error) {
        console.error('❌ Error processing webhook:', error);
        
        // Still broadcast to clients even if database save fails
        const message = JSON.stringify(req.body);
        let clientsNotified = 0;
        
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
                clientsNotified++;
            }
        });
        
        res.status(500).json({ 
            status: 'partial_success',
            message: 'Webhook broadcasted but failed to save to database',
            error: error.message,
            timestamp,
            savedToDatabase: false,
            clientsNotified
        });
    }
});

// API endpoint to get recent webhooks
app.get('/api/webhooks', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const webhooks = await getRecentWebhooks(limit);
        
        res.json({
            status: 'success',
            count: webhooks.length,
            webhooks
        });
    } catch (error) {
        console.error('Error fetching webhooks:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch webhooks',
            error: error.message
        });
    }
});

// API endpoint to get webhook statistics
app.get('/api/stats', (req, res) => {
    const statsSQL = `
        SELECT 
            COUNT(*) as total_webhooks,
            DATE(timestamp) as date,
            COUNT(*) as daily_count
        FROM webhooks 
        WHERE timestamp >= datetime('now', '-7 days')
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
    `;
    
    db.all(statsSQL, [], (err, rows) => {
        if (err) {
            console.error('Error fetching stats:', err);
            res.status(500).json({ error: 'Failed to fetch statistics' });
        } else {
            // Get total count
            db.get('SELECT COUNT(*) as total FROM webhooks', [], (err, totalRow) => {
                if (err) {
                    console.error('Error fetching total:', err);
                    res.status(500).json({ error: 'Failed to fetch total count' });
                } else {
                    res.json({
                        status: 'success',
                        totalWebhooks: totalRow.total,
                        dailyStats: rows,
                        connectedClients: clients.size
                    });
                }
            });
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        connectedClients: clients.size,
        database: 'connected',
        timestamp: new Date().toISOString()
    });
});

// API endpoint to clear old webhooks (optional maintenance)
app.delete('/api/webhooks/cleanup', (req, res) => {
    const daysToKeep = parseInt(req.query.days) || 30;
    const deleteSQL = `
        DELETE FROM webhooks 
        WHERE timestamp < datetime('now', '-${daysToKeep} days')
    `;
    
    db.run(deleteSQL, function(err) {
        if (err) {
            console.error('Error cleaning up webhooks:', err);
            res.status(500).json({ 
                status: 'error', 
                message: 'Failed to cleanup old webhooks' 
            });
        } else {
            res.json({
                status: 'success',
                message: `Cleaned up webhooks older than ${daysToKeep} days`,
                deletedCount: this.changes
            });
        }
    });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
    console.log(`🚀 Webhook server running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket server running on ws://localhost:${PORT}`);
    console.log(`🎯 Send webhooks to: http://localhost:${PORT}/webhook`);
    console.log(`📊 View recent webhooks: http://localhost:${PORT}/api/webhooks`);
    console.log(`📈 View statistics: http://localhost:${PORT}/api/stats`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('✅ Database connection closed');
        }
    });
    
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});