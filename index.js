// index.js - Enhanced with Better Keep-Alive

const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

// ============ MIDDLEWARE ============
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ============ CREATE REQUIRED DIRECTORIES ============
const requiredDirs = ['data', 'session', 'plugins'];
requiredDirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
        fs.ensureDirSync(dirPath);
        console.log(`✅ Created directory: ${dir}`);
    }
});

// ============ LOAD MAIN ROUTER ============
let pairRouter;
try {
    pairRouter = require('./main');
    app.use('/', pairRouter);
    console.log('✅ Main router loaded successfully');
} catch (error) {
    console.error('❌ Failed to load main.js:', error.message);
    app.get('/', (req, res) => {
        res.status(200).json({
            status: 'error',
            message: 'Bot failed to initialize, but server is running',
            error: error.message
        });
    });
}

// ============ HEALTH CHECK ENDPOINTS ============

app.get('/health', (req, res) => {
    const activeSessions = global.activeSockets ? global.activeSockets.size : 0;
    const healthyConnections = global.connectionHealth ? 
        Array.from(global.connectionHealth.values()).filter(info => info.isHealthy).length : 0;
    
    res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        memory: process.memoryUsage(),
        activeSessions: activeSessions,
        healthyConnections: healthyConnections,
        sessions: activeSessions > 0 ? '✅ Active' : '⚠️ No active sessions'
    });
});

app.get('/ping', (req, res) => {
    const activeSessions = global.activeSockets ? global.activeSockets.size : 0;
    res.status(200).json({
        status: 'pong',
        timestamp: new Date().toISOString(),
        activeSessions: activeSessions,
        uptime: Math.floor(process.uptime())
    });
});

app.get('/', (req, res) => {
    const activeSessions = global.activeSockets ? global.activeSockets.size : 0;
    res.status(200).json({
        status: 'running',
        message: '🤖 ICON-X MD is alive!',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        sessions: activeSessions,
        memory: process.memoryUsage()
    });
});

// ============ CONNECTION MANAGEMENT ENDPOINTS ============

// Check all connections health
app.get('/connections/health', (req, res) => {
    const health = [];
    if (global.connectionHealth) {
        global.connectionHealth.forEach((info, number) => {
            health.push({
                number: number,
                isHealthy: info.isHealthy !== undefined ? info.isHealthy : true,
                lastMessage: info.lastMessage ? new Date(info.lastMessage).toISOString() : null,
                reconnectAttempts: info.reconnectAttempts || 0,
                uptime: info.createdAt ? Math.floor((Date.now() - info.createdAt) / 1000) : 0
            });
        });
    }
    res.json({
        total: health.length,
        healthy: health.filter(h => h.isHealthy).length,
        details: health,
        timestamp: new Date().toISOString()
    });
});

// Force reconnect a specific number
app.get('/connections/reconnect/:number', async (req, res) => {
    const number = req.params.number;
    const cleanNumber = number.replace(/[^0-9]/g, '');
    
    try {
        if (global.activeSockets && global.activeSockets.has(cleanNumber)) {
            const oldSocket = global.activeSockets.get(cleanNumber);
            try { 
                oldSocket.ws?.close(); 
                oldSocket.ev?.removeAllListeners();
            } catch (e) {}
            global.activeSockets.delete(cleanNumber);
        }
        
        // Try to use arslanPair if available
        if (typeof global.arslanPair === 'function') {
            const mockRes = { 
                headersSent: false, 
                json: () => {}, 
                status: () => mockRes,
                send: () => {},
                setHeader: () => {}
            };
            await global.arslanPair(cleanNumber, mockRes);
            res.json({
                success: true,
                message: `Reconnection initiated for ${cleanNumber}`,
                timestamp: new Date().toISOString()
            });
        } else {
            res.json({
                success: false,
                message: 'arslanPair not available',
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Reconnect all connections
app.get('/connections/reconnect-all', async (req, res) => {
    try {
        const numbers = [];
        if (global.connectionHealth) {
            global.connectionHealth.forEach((info, number) => {
                numbers.push(number);
            });
        }
        
        if (numbers.length === 0) {
            return res.json({
                success: true,
                message: 'No connections to reconnect',
                total: 0,
                reconnected: 0,
                timestamp: new Date().toISOString()
            });
        }
        
        let success = 0;
        let failed = 0;
        
        for (const number of numbers) {
            try {
                const cleanNumber = number.replace(/[^0-9]/g, '');
                
                if (global.activeSockets && global.activeSockets.has(cleanNumber)) {
                    const oldSocket = global.activeSockets.get(cleanNumber);
                    try { 
                        oldSocket.ws?.close(); 
                        oldSocket.ev?.removeAllListeners();
                    } catch (e) {}
                    global.activeSockets.delete(cleanNumber);
                }
                
                if (typeof global.arslanPair === 'function') {
                    const mockRes = { 
                        headersSent: false, 
                        json: () => {}, 
                        status: () => mockRes,
                        send: () => {},
                        setHeader: () => {}
                    };
                    await global.arslanPair(cleanNumber, mockRes);
                    success++;
                }
                
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (e) {
                console.error(`Failed to reconnect ${number}:`, e.message);
                failed++;
            }
        }
        
        res.json({
            success: true,
            total: numbers.length,
            reconnected: success,
            failed: failed,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ============ AUTO KEEP-ALIVE ============

function startKeepAlive() {
    const selfUrl = process.env.RENDER_EXTERNAL_URL || 
                   `https://${process.env.RENDER_SERVICE_NAME || 'your-bot'}.onrender.com`;
    
    console.log(`🔄 Auto keep-alive started! Pinging: ${selfUrl}/ping`);
    
    const interval = setInterval(async () => {
        try {
            const response = await axios.get(`${selfUrl}/ping`, {
                timeout: 10000
            });
            console.log(`✅ Keep-alive ping successful at ${new Date().toISOString()}`);
        } catch (error) {
            console.error(`❌ Keep-alive ping failed: ${error.message}`);
            
            try {
                await axios.get(`https://${process.env.RENDER_SERVICE_NAME || 'your-bot'}.onrender.com/ping`);
                console.log('✅ Backup ping successful');
            } catch (e) {
                console.error('❌ Backup ping also failed');
            }
        }
    }, 10 * 60 * 1000);
    
    return interval;
}

function startDummyKeepAlive() {
    const dummyInterval = setInterval(() => {
        // Dummy operation to keep event loop busy
        const now = Date.now();
    }, 5 * 60 * 1000);
    
    return dummyInterval;
}

let keepAliveInterval = null;
let dummyInterval = null;

if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
    setTimeout(() => {
        keepAliveInterval = startKeepAlive();
        dummyInterval = startDummyKeepAlive();
        console.log('🔋 Auto keep-alive enabled for Render free tier');
    }, 30000);
} else {
    console.log('🔋 Running in development mode - keep-alive disabled');
}

// ============ ERROR HANDLING ============

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
    console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection:', reason);
});

// ============ GRACEFUL SHUTDOWN ============

process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
    }
    if (dummyInterval) {
        clearInterval(dummyInterval);
    }
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
    }
    if (dummyInterval) {
        clearInterval(dummyInterval);
    }
    process.exit(0);
});

// ============ START SERVER ============

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`✅ Health check: http://localhost:${port}/health`);
    console.log(`✅ Ping: http://localhost:${port}/ping`);
    console.log(`✅ Connections: http://localhost:${port}/connections/health`);
    console.log(`🤖 ICON-X MD is ready!`);
});

module.exports = app;
