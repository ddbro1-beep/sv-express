# SV Express - Deployment Guide

## Deployment Architecture

```
Landing:  sv-express-one.vercel.app          (Static files)
API:      sv-express-one.vercel.app/api      (Serverless functions)
Admin:    admin.sv-express-one.vercel.app    (React SPA)
Portal:   portal.sv-express-one.vercel.app   (React SPA)
Database: Supabase Cloud                      (PostgreSQL)
```

---

## Prerequisites

- Vercel account
- Supabase account
- GitHub repository with code
- Domain (optional, for custom domains)

---

## Part 1: Database Deployment (Supabase)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in details:
   - **Name:** sv-express
   - **Database Password:** Save this securely!
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free (or Pro for production)

4. Wait for project to be created (~2 minutes)

### 2. Run Database Migrations

1. Go to **SQL Editor** in Supabase dashboard
2. Run migrations in order:

```sql
-- Copy and paste contents of each file:
-- database/migrations/001_create_users_table.sql
-- database/migrations/002_create_countries_table.sql
-- etc.
```

Execute each migration one by one, check for errors.

### 3. Insert Seed Data

```sql
-- database/seeds/countries.sql
-- database/seeds/pricing_tiers.sql
```

### 4. Create First Admin User

```sql
-- In SQL Editor:
INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified)
VALUES (
    'admin@sv-express.com',
    -- Hash for 'Admin123!' (use bcrypt in your app instead)
    '$2a$10$rZ...',
    'Admin',
    'User',
    'admin',
    TRUE
);
```

**Important:** Use proper bcrypt hash. Generate with:
```bash
node -e "console.log(require('bcryptjs').hashSync('Admin123!', 10))"
```

### 5. Get Database Credentials

From **Project Settings → API**:
- Project URL: `https://xxx.supabase.co`
- Anon key: `eyJhbGc...`
- Service role key: `eyJhbGc...` (keep secret!)

From **Project Settings → Database**:
- Connection string

---

## Part 2: API Deployment (Vercel Serverless)

### 1. Prepare API for Deployment

Create `packages/api/vercel.json`:

```json
{
  "version": 2,
  "name": "sv-express-api",
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/src/index.ts"
    }
  ]
}
```

Update `packages/api/package.json`:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node-dev --respawn src/index.ts"
  },
  "main": "dist/index.js"
}
```

### 2. Deploy API to Vercel

**Option A: Via CLI**

```bash
cd packages/api
vercel --prod
```

**Option B: Via Dashboard**

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import from GitHub
4. Select `sv-express` repository
5. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `packages/api`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Add Environment Variables (see below)
7. Deploy

### 3. Set Environment Variables

In Vercel project settings → Environment Variables:

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT].supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc... (secret!)
JWT_SECRET=your-32-char-secret
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=another-secret
REFRESH_TOKEN_EXPIRES_IN=30d
NODE_ENV=production
CORS_ORIGIN=https://sv-express-one.vercel.app,https://admin.sv-express-one.vercel.app,https://portal.sv-express-one.vercel.app
EMAIL_API_KEY=your-sendgrid-key
EMAIL_FROM=noreply@sv-express.com
```

**Important:**
- Set as "Production" environment
- Mark sensitive values (SERVICE_KEY, secrets) as encrypted

### 4. Test API

```bash
curl https://sv-express-one.vercel.app/api/countries
```

Should return list of countries.

---

## Part 3: Admin Dashboard Deployment

### 1. Prepare Admin App

Create `packages/admin/vercel.json`:

```json
{
  "version": 2,
  "name": "sv-express-admin",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 2. Deploy Admin

```bash
cd packages/admin
vercel --prod
```

Or via Vercel Dashboard:
- Root Directory: `packages/admin`
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

### 3. Set Environment Variables

```
VITE_API_URL=https://sv-express-one.vercel.app/api
VITE_APP_NAME=SV Express Admin
```

### 4. Configure Custom Domain (Optional)

In Vercel project → Settings → Domains:
- Add: `admin.sv-express.com`
- Follow DNS configuration instructions

---

## Part 4: User Portal Deployment

Same as Admin Dashboard, but:
- Root Directory: `packages/portal`
- Domain: `portal.sv-express.com`
- Name: SV Express Portal

---

## Part 5: Landing Page Deployment

### Already Deployed!

Your landing page is already at `https://sv-express-one.vercel.app`.

### Update Landing to Use API

Edit `packages/landing/assets/js/main.js`:

```javascript
// Replace form submission with API call
const submitForm = async (formData) => {
    const response = await fetch('https://sv-express-one.vercel.app/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    });
    return response.json();
};
```

---

## Part 6: Post-Deployment Setup

### 1. Test All Endpoints

```bash
# Health check
curl https://sv-express-one.vercel.app/api/health

# Create lead
curl -X POST https://sv-express-one.vercel.app/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com"}'

# Login (admin)
curl -X POST https://sv-express-one.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sv-express.com","password":"Admin123!"}'
```

### 2. Configure Monitoring

**Vercel:**
- Enable Analytics in project settings
- Set up Error Tracking (Sentry integration)
- Configure Log Drains

**Supabase:**
- Enable Database Insights
- Set up Alerts for high CPU/memory usage
- Configure Log Explorer

### 3. Set Up Email Service

**SendGrid:**
1. Create account at sendgrid.com
2. Verify sender email
3. Create API key
4. Add to Vercel env variables

Or use **Mailgun** / **Postmark** / **AWS SES**

### 4. Configure CORS

Ensure API allows requests from:
- Landing page domain
- Admin dashboard domain
- User portal domain

In API code:
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true
}));
```

---

## Continuous Deployment

### Automatic Deployments

Vercel automatically deploys on push to `main` branch.

**Setup:**
1. Push code to GitHub
2. Vercel detects changes
3. Builds and deploys automatically

**Preview Deployments:**
- Pull requests get preview URLs
- Test before merging to main

### Manual Deployment

```bash
# From any package
cd packages/api
vercel --prod

# Or from root
vercel --prod --cwd packages/api
```

---

## Rollback

If deployment fails or has issues:

### Via Vercel Dashboard
1. Go to project → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Via CLI
```bash
vercel rollback
```

---

## Custom Domains

### Add Custom Domain

1. Buy domain (Namecheap, GoDaddy, etc.)
2. In Vercel project → Settings → Domains
3. Add domain: `sv-express.com`
4. Configure DNS:

```
Type    Name    Value
A       @       76.76.19.19
CNAME   www     cname.vercel-dns.com
```

5. Wait for DNS propagation (~24-48 hours)

### SSL Certificates

Vercel automatically provisions SSL certificates via Let's Encrypt.

---

## Monitoring & Logging

### View Logs

**Vercel:**
```bash
vercel logs <deployment-url>
```

Or in Dashboard → Deployments → Click deployment → Logs

**Supabase:**
- Dashboard → Logs → select table/function
- Real-time query logs

### Set Up Alerts

**Vercel:**
- Integrations → Notifications
- Slack/Discord/Email alerts for:
  - Failed deployments
  - High error rate
  - Performance issues

**Supabase:**
- Project Settings → Alerts
- Set thresholds for:
  - Database size
  - Active connections
  - Query performance

---

## Performance Optimization

### API

- Enable response caching
- Use Vercel Edge Functions for faster response
- Optimize database queries
- Add database indexes

### Frontend

- Enable Vercel Analytics
- Use Vercel Image Optimization
- Code splitting
- Lazy loading routes

### Database

- Enable pgBouncer (connection pooling)
- Set up read replicas (Pro plan)
- Regular VACUUM

---

## Security Checklist

- [ ] Environment variables are encrypted
- [ ] JWT secrets are strong (32+ chars)
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection (sanitize inputs)
- [ ] HTTPS only (no HTTP)
- [ ] Row Level Security enabled in Supabase
- [ ] Admin endpoints require admin role
- [ ] Passwords are bcrypt hashed
- [ ] API keys are not exposed in frontend

---

## Troubleshooting

### API Not Responding

1. Check Vercel deployment logs
2. Verify environment variables
3. Test database connection
4. Check CORS settings

### Database Connection Failed

1. Verify DATABASE_URL is correct
2. Check Supabase project is active
3. Verify IP restrictions (disable for testing)
4. Check connection pooling

### CORS Errors

1. Verify `CORS_ORIGIN` includes all frontend URLs
2. Check API is using cors middleware
3. Ensure credentials are set correctly

### Build Failures

1. Check build logs in Vercel
2. Verify all dependencies are installed
3. Check TypeScript compilation errors
4. Ensure vercel.json is correct

---

## Scaling

As your app grows:

1. **Database:**
   - Upgrade Supabase plan
   - Enable read replicas
   - Add caching layer (Redis)

2. **API:**
   - Split into microservices
   - Use Vercel Edge Functions
   - Add CDN for static assets

3. **Frontend:**
   - Enable Vercel Analytics
   - Optimize bundle size
   - Use ISR (Incremental Static Regeneration)

---

## Costs Estimation

**Free Tier (MVP):**
- Vercel: Free (hobby plan)
- Supabase: Free (up to 500MB database, 50k users)
- **Total:** $0/month

**Production (Small Scale):**
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- SendGrid: $15/month
- **Total:** ~$60/month

**Production (Medium Scale):**
- Vercel Pro: $20/month
- Supabase Pro: $25/month (or higher)
- SendGrid: $15-50/month
- Custom domains: ~$12/year
- **Total:** ~$70-100/month

---

## Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **API Reference:** `docs/API.md`
- **Database Schema:** `docs/DATABASE.md`
