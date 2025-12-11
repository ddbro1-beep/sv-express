# SV Express - Development Setup Guide

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Git**
- **Supabase account** (free tier available)
- **Vercel account** (for deployment)

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/ddbro1-beep/sv-express.git
cd sv-express
```

### 2. Install Dependencies

```bash
# Install root dependencies and all workspaces
npm install
```

This will install dependencies for all packages:
- `packages/shared`
- `packages/api`
- `packages/admin`
- `packages/portal`
- `packages/landing` (static, no deps)

### 3. Set Up Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project credentials:
   - Project URL
   - Anon/Public Key
   - Service Role Key (keep secret!)
   - Database Password

4. Run database migrations:
```bash
# Copy SQL from database/migrations/*.sql
# Execute in Supabase SQL Editor in order
```

5. Run seed data:
```bash
# Copy SQL from database/seeds/*.sql
# Execute in Supabase SQL Editor
```

### 4. Configure Environment Variables

#### Backend API

Create `packages/api/.env`:

```bash
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc... # Service role key
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=another-secret-key-for-refresh-tokens
REFRESH_TOKEN_EXPIRES_IN=30d
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
EMAIL_API_KEY=your-sendgrid-or-mailgun-key
EMAIL_FROM=noreply@sv-express.com
PORT=3000
```

#### Admin Dashboard

Create `packages/admin/.env`:

```bash
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=SV Express Admin
```

#### User Portal

Create `packages/portal/.env`:

```bash
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=SV Express Portal
```

### 5. Generate JWT Secrets

```bash
# Generate secure random strings for JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this twice - once for `JWT_SECRET` and once for `REFRESH_TOKEN_SECRET`.

## Development

### Run All Services

From root directory:

```bash
# Terminal 1 - API
cd packages/api && npm run dev

# Terminal 2 - Admin Dashboard
cd packages/admin && npm run dev

# Terminal 3 - User Portal
cd packages/portal && npm run dev

# Terminal 4 - Landing Page (optional)
cd packages/landing && npx serve
```

### Run Individual Services

```bash
# API only
npm run dev -w packages/api

# Admin only
npm run dev -w packages/admin

# Portal only
npm run dev -w packages/portal
```

### URLs in Development

- **Landing Page:** http://localhost:3001
- **API:** http://localhost:3000
- **Admin Dashboard:** http://localhost:5173
- **User Portal:** http://localhost:5174

## Database Management

### Run Migrations

```bash
# Migrations are SQL files in database/migrations/
# Run them in Supabase SQL Editor in numerical order:
# 001_create_users_table.sql
# 002_create_countries_table.sql
# etc.
```

### Seed Data

```bash
# Seeds are in database/seeds/
# Run after all migrations are complete
```

### View Database

- Use Supabase Dashboard: Table Editor
- Or connect via `psql`:

```bash
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

## Testing

### API Tests

```bash
cd packages/api
npm test
```

### Frontend Tests

```bash
cd packages/admin
npm test

cd packages/portal
npm test
```

## Building for Production

### Build All Packages

```bash
npm run build -w packages/api
npm run build -w packages/admin
npm run build -w packages/portal
```

### Test Production Builds Locally

```bash
# API
cd packages/api && npm run start

# Admin (serves dist folder)
cd packages/admin && npx serve dist

# Portal (serves dist folder)
cd packages/portal && npx serve dist
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

#### Supabase Connection Failed

- Check DATABASE_URL is correct
- Verify IP is whitelisted in Supabase (or disable IP restriction)
- Check database password is correct

#### CORS Errors

- Verify `CORS_ORIGIN` in API .env includes frontend URLs
- Check API is running before starting frontends

#### JWT Token Invalid

- Ensure JWT_SECRET matches between services
- Check token hasn't expired (default 24h)
- Clear browser cookies/localStorage

## Project Structure

```
sv-express-local/
├── packages/
│   ├── shared/       # Shared types and utilities
│   ├── landing/      # Static landing page
│   ├── api/          # Backend Express API
│   ├── admin/        # Admin dashboard (React)
│   └── portal/       # User portal (React)
├── database/
│   ├── migrations/   # SQL migrations
│   └── seeds/        # Seed data
├── docs/             # Documentation
└── scripts/          # Utility scripts
```

## Next Steps

1. Create first admin user in Supabase
2. Test API endpoints with Postman/Thunder Client
3. Login to admin dashboard
4. Create test shipment
5. Test tracking in user portal

## Getting Help

- Check API documentation: `docs/API.md`
- Check database schema: `docs/DATABASE.md`
- Review deployment guide: `docs/DEPLOYMENT.md`
- Open GitHub issue for bugs
