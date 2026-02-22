# Railway Deployment Guide

This backend is configured for Railway deployment with zero-configuration defaults.

## Structure

```
inventory-backend/
├── config/          # Environment configuration (validates on startup)
├── db/              # Database connection pool and migrations
├── middlewares/     # Auth, error handling, 404
├── services/        # Business logic layer
├── controllers/     # HTTP request handlers
├── routes/          # Route definitions
├── app.js          # Express app entry point
└── package.json    # Dependencies and scripts
```

## Railway Setup

### 1. Create New Project
- Go to Railway dashboard
- Click "New Project"
- Select "Deploy from GitHub repo" (or use Railway CLI)

### 2. Add PostgreSQL Database
- In your project, click "+ New"
- Select "Database" → "Add PostgreSQL"
- Railway automatically creates `DATABASE_URL` environment variable

### 3. Configure Environment Variables
Railway will auto-detect `PORT`, but you need to set:

**Required:**
- `JWT_SECRET` - Generate a secure 32+ character string:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

**Optional:**
- `NODE_ENV` - Set to `production` (defaults to production)
- `PGPOOL_MAX` - Connection pool size (default: 10)
- `ALLOWED_ORIGINS` - Comma-separated CORS origins

### 4. Deploy
Railway will:
1. Run `npm install` (from `package.json`)
2. Run `npm start` (starts the server)

### 5. Run Migrations
After first deployment, run migrations manually:

**Option A: Railway CLI**
```bash
railway run npm run migrate
```

**Option B: Railway Shell**
- Open Railway dashboard → Your service → "Shell"
- Run: `npm run migrate`

**Option C: Add to startup (temporary)**
Modify `package.json` start script:
```json
"start": "node db/run-migrations.js && node app.js"
```
(Remove after first migration)

## Health Checks

- **Liveness:** `GET /healthz` - Returns 200 if server is running
- **Readiness:** `GET /ready` - Returns 200 if server AND database are connected

Railway automatically uses `/healthz` for health checks.

## Verification

After deployment:
1. Check logs in Railway dashboard
2. Visit `https://your-app.railway.app/healthz` - should return `{"status":"healthy"}`
3. Visit `https://your-app.railway.app/ready` - should return `{"status":"ready","database":"connected"}`

## Troubleshooting

### Server won't start
- Check logs for missing environment variables
- Ensure `PORT` is set (Railway sets this automatically)
- Ensure `JWT_SECRET` is set and >= 32 characters
- Ensure `DATABASE_URL` is set (from PostgreSQL service)

### Database connection errors
- Verify PostgreSQL service is running
- Check `DATABASE_URL` format: `postgresql://user:pass@host:port/db`
- Run migrations: `npm run migrate`

### 503 on /ready
- Database is not connected
- Check PostgreSQL service status
- Verify `DATABASE_URL` is correct

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | Auto | Server port (Railway sets automatically) | `3000` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://...` |
| `JWT_SECRET` | Yes | JWT signing secret (min 32 chars) | `abc123...` |
| `NODE_ENV` | No | Environment mode | `production` |
| `PGPOOL_MAX` | No | DB pool size | `10` |
| `ALLOWED_ORIGINS` | No | CORS origins (comma-separated) | `https://app.com` |

## Architecture Notes

- **Fail-fast:** Server exits immediately if required env vars are missing
- **No localhost:** All configuration from environment variables
- **Graceful shutdown:** Handles SIGTERM/SIGINT, closes DB pool
- **Error handling:** All async operations wrapped in try/catch
- **Connection management:** DB clients always released in finally blocks
