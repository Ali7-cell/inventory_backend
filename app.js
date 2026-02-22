/**
 * Inventory Backend - Railway-compatible Express server
 * Vercel frontend-ready with proper CORS and production-safe responses
 */
const express = require('express');
const corsMiddleware = require('./middlewares/cors');
const config = require('./config');
const { authenticateToken } = require('./middlewares/auth');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');
const { ping: dbPing, close: closeDb } = require('./db/pool');

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const batchRoutes = require('./routes/batches');
const stockRoutes = require('./routes/stock');
const movementRoutes = require('./routes/stockMovements');
const supplierRoutes = require('./routes/suppliers');
const salesRoutes = require('./routes/sales');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// Trust proxy (for Railway/Vercel reverse proxies)
app.set('trust proxy', 1);

// Middleware
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (development only)
if (config.nodeEnv === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// Health check - no auth required (Railway/Kubernetes)
app.get('/healthz', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
    });
});

// Readiness check - includes DB connectivity
app.get('/ready', async (req, res) => {
    try {
        await dbPing();
        res.status(200).json({
            status: 'ready',
            database: 'connected',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(503).json({
            status: 'not ready',
            database: 'disconnected',
            error: 'Database connection failed',
        });
    }
});

// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        name: 'Inventory System API',
        version: '1.0.0',
        status: 'online',
        environment: config.nodeEnv,
        endpoints: {
            auth: '/auth',
            products: '/products',
            batches: '/batches',
            stock: '/stock',
            movements: '/movements',
            suppliers: '/suppliers',
            sales: '/sales',
            analytics: '/analytics',
        },
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Inventory system backend',
        status: 'online',
        environment: config.nodeEnv,
        api: '/api',
    });
});

// Public routes
app.use('/auth', authRoutes);

// Protected routes
app.use('/products', authenticateToken, productRoutes);
app.use('/batches', authenticateToken, batchRoutes);
app.use('/stock', authenticateToken, stockRoutes);
app.use('/movements', authenticateToken, movementRoutes);
app.use('/suppliers', authenticateToken, supplierRoutes);
app.use('/sales', authenticateToken, salesRoutes);
app.use('/analytics', authenticateToken, analyticsRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(config.port, '0.0.0.0', () => {
    if (config.nodeEnv === 'development') {
        console.log(`Server started on port ${config.port}`);
        console.log(`Environment: ${config.nodeEnv}`);
    }
});

// Graceful shutdown
function shutdown(signal) {
    if (config.nodeEnv === 'development') {
        console.log(`${signal} received, shutting down gracefully...`);
    }
    
    server.close(() => {
        closeDb()
            .then(() => {
                process.exit(0);
            })
            .catch((err) => {
                console.error('Error closing database pool:', err);
                process.exit(1);
            });
    });

    // Force exit after timeout
    setTimeout(() => {
        console.error('Forced exit after timeout');
        process.exit(1);
    }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    shutdown('uncaughtException');
});

module.exports = app;
