#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

let serverProcess = null;

function startServer() {
    console.log('🚀 Starting webhook server...');
    
    serverProcess = spawn('node', ['server.js'], {
        stdio: 'inherit',
        cwd: __dirname
    });
    
    serverProcess.on('error', (err) => {
        console.error('❌ Failed to start server:', err);
    });
    
    serverProcess.on('exit', (code, signal) => {
        if (signal === 'SIGINT' || signal === 'SIGTERM') {
            console.log('✅ Server stopped gracefully');
        } else {
            console.log(`⚠️ Server exited with code ${code}, signal ${signal}`);
        }
        serverProcess = null;
    });
}

function stopServer() {
    if (serverProcess) {
        console.log('🛑 Stopping server...');
        serverProcess.kill('SIGTERM');
        
        // Force kill after 3 seconds
        setTimeout(() => {
            if (serverProcess) {
                console.log('⚠️ Force killing server...');
                serverProcess.kill('SIGKILL');
            }
        }, 3000);
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down...');
    stopServer();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down...');
    stopServer();
    process.exit(0);
});

// Start the server
startServer();