/**
 * JWT Authentication Middleware
 */
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Authenticate JWT token from Authorization header
 */
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        jwt.verify(token, config.jwtSecret, (err, user) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid or expired token.' });
            }
            req.user = user;
            next();
        });
    } catch (error) {
        return res.status(500).json({ error: 'Authentication error.' });
    }
};

module.exports = { authenticateToken };
