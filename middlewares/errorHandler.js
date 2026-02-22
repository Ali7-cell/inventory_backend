/**
 * Global Error Handler Middleware
 * Production-safe error responses (no stack traces, clean messages)
 */
const config = require('../config');

/**
 * Determine HTTP status code from error
 */
function getStatusCode(error) {
    if (!error || typeof error !== 'object') return 500;
    if (error.status) return error.status;
    if (error.statusCode) return error.statusCode;
    if (error.code === '23505') return 409;
    if (error.code === '23503') return 400;
    if (error.code === '23502') return 400;
    if (error.code === '42P01') return 500;
    if (error.code === 'ECONNREFUSED') return 503;
    return 500;
}

/**
 * Get user-friendly error message
 */
function getErrorMessage(error) {
    const msg = error && typeof error.message === 'string' ? error.message : '';
    if (msg && !msg.includes('at ') && !msg.includes('Error:')) {
        return msg;
    }

    if (error.code === '23505') {
        return 'A record with this information already exists';
    }
    if (error.code === '23503') {
        return 'Invalid reference to related record';
    }
    if (error.code === '23502') {
        return 'Required field is missing';
    }

    // Connection errors
    if (error.code === 'ECONNREFUSED') {
        return 'Database connection failed. Please try again later.';
    }

    // Default messages based on status
    const status = getStatusCode(error);
    if (status === 400) return 'Invalid request';
    if (status === 401) return 'Authentication required';
    if (status === 403) return 'Access denied';
    if (status === 404) return 'Resource not found';
    if (status === 409) return 'Conflict with existing data';
    if (status === 500) return 'Internal server error';
    if (status === 503) return 'Service temporarily unavailable';

    return 'An error occurred';
}

const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    if (!err || typeof err !== 'object') {
        res.status(500).json({ error: 'Internal server error' });
        return;
    }

    const status = getStatusCode(err);
    const isDevelopment = config.nodeEnv === 'development';

    if (isDevelopment) {
        console.error('[ERROR]', { message: err.message, path: req.path, method: req.method, status, code: err.code });
    }

    const response = { error: getErrorMessage(err) };
    if (isDevelopment) {
        response.details = err.message || '';
        if (err.stack) response.stack = err.stack.split('\n').slice(0, 5);
        if (err.code) response.code = err.code;
    }
    if (req.id) response.requestId = req.id;

    res.status(status).json(response);
};

module.exports = errorHandler;
