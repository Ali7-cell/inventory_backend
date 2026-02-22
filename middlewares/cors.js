/**
 * CORS Middleware - Vercel-compatible
 * Supports Vercel production and preview deployments
 */
const cors = require('cors');
const config = require('../config');

/**
 * Determine allowed origins based on environment
 */
function getAllowedOrigins() {
    // If ALLOWED_ORIGINS is explicitly set, use it
    if (config.allowedOrigins && config.allowedOrigins.length > 0) {
        return config.allowedOrigins;
    }

    // In production, allow common Vercel patterns
    if (config.nodeEnv === 'production') {
        return [
            // Allow requests from same origin (if backend and frontend on same domain)
            true, // This allows same-origin requests
        ];
    }

    // Development: allow localhost
    return [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
    ];
}

/**
 * CORS options with Vercel support
 */
const corsOptions = {
    origin: (origin, callback) => {
        const allowed = getAllowedOrigins();

        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) {
            return callback(null, true);
        }

        // If allowedOrigins is true (same-origin), allow it
        if (allowed.includes(true)) {
            return callback(null, true);
        }

        // Check if origin matches any allowed origin
        if (allowed.includes(origin)) {
            return callback(null, true);
        }

        // Check for Vercel domains (production and preview)
        const vercelPattern = /^https:\/\/.*\.vercel\.app$/;
        if (vercelPattern.test(origin)) {
            return callback(null, true);
        }

        // Check for custom Vercel domain (if configured)
        // You can add your custom domain here or via ALLOWED_ORIGINS
        const customDomain = process.env.VERCEL_URL 
            ? `https://${process.env.VERCEL_URL}`
            : null;
        if (customDomain && origin === customDomain) {
            return callback(null, true);
        }

        callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours
};

module.exports = cors(corsOptions);
