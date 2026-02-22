/**
 * Application configuration - Railway-compatible, Vercel-ready
 * Supports DATABASE_URL or individual PostgreSQL environment variables
 */
require('dotenv').config();

function getDatabaseConfig() {
    if (process.env.DATABASE_URL) {
        return {
            connectionString: process.env.DATABASE_URL,
        };
    }

    const host = process.env.PGHOST;
    const port = process.env.PGPORT;
    const database = process.env.PGDATABASE;
    const user = process.env.PGUSER;
    const password = process.env.PGPASSWORD;

    if (!host || !port || !database || !user || password === undefined) {
        return null;
    }

    const encodedUser = encodeURIComponent(user);
    const encodedPassword = encodeURIComponent(password);
    const connectionString = `postgresql://${encodedUser}:${encodedPassword}@${host}:${port}/${database}`;

    return { connectionString };
}

function validateConfig() {
    const missing = [];

    if (!process.env.JWT_SECRET) {
        missing.push('JWT_SECRET');
    }

    const dbConfig = getDatabaseConfig();
    if (!dbConfig) {
        if (process.env.DATABASE_URL) {
            missing.push('DATABASE_URL (empty or invalid)');
        } else {
            missing.push('DATABASE_URL or (PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD)');
        }
    }

    if (missing.length > 0) {
        console.error('Missing required environment variables:');
        missing.forEach(key => console.error(`  - ${key}`));
        process.exit(1);
    }

    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
        console.warn('Warning: JWT_SECRET should be at least 32 characters for production');
    }
}

validateConfig();

const dbConfig = getDatabaseConfig();

const config = {
    port: (() => {
        const port = process.env.PORT;
        if (!port) {
            console.error('PORT environment variable is required');
            process.exit(1);
        }
        const parsed = parseInt(port, 10);
        if (isNaN(parsed) || parsed < 1 || parsed > 65535) {
            console.error(`Invalid PORT value: ${port}`);
            process.exit(1);
        }
        return parsed;
    })(),
    
    nodeEnv: process.env.NODE_ENV || 'production',
    
    jwtSecret: process.env.JWT_SECRET,
    
    database: {
        connectionString: dbConfig.connectionString,
        host: process.env.PGHOST,
        port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : undefined,
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
    },
    poolMax: parseInt(process.env.PGPOOL_MAX, 10) || 10,
    
    allowedOrigins: process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
        : [],
    
    apiBaseUrl: process.env.API_BASE_URL || process.env.BACKEND_URL || '',
};

module.exports = config;
