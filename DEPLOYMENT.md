# Deployment Checklist

## Pre-Deployment

- [x] All dead code removed
- [x] Console logs cleaned (production-safe)
- [x] Unused dependencies removed
- [x] Consistent naming conventions
- [x] Predictable import patterns
- [x] Production-safe error handling
- [x] Environment variable validation

## Railway Deployment

1. **Connect Repository**
   - Push code to GitHub
   - Connect to Railway

2. **Add PostgreSQL**
   - Create PostgreSQL service
   - Railway provides `DATABASE_URL` automatically

3. **Set Environment Variables**
   ```
   JWT_SECRET=<generate-secure-32-char-string>
   NODE_ENV=production
   ```

4. **Deploy**
   - Railway runs `npm start` automatically
   - Check logs for startup errors

5. **Run Migrations**
   ```bash
   railway run npm run migrate
   ```

6. **Verify**
   - `GET /healthz` → `{"status":"healthy"}`
   - `GET /ready` → `{"status":"ready","database":"connected"}`

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Auto | Railway sets automatically |
| `JWT_SECRET` | Yes | Min 32 characters |
| `DATABASE_URL` | Yes | From Railway PostgreSQL |
| `NODE_ENV` | No | Defaults to `production` |
| `PGPOOL_MAX` | No | Default: 10 |
| `ALLOWED_ORIGINS` | No | CORS origins (comma-separated) |

## Health Checks

- **Liveness:** `GET /healthz`
- **Readiness:** `GET /ready` (includes DB check)

Railway uses `/healthz` for health checks automatically.
