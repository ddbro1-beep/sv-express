# Changelog

All notable changes to the SV Express project will be documented in this file.

## [1.0.0] - 2025-12-11

### 🎉 Initial Production Release

This is the first production release of SV Express - a full-stack international parcel delivery management system.

### ✨ Added

#### Backend (API)
- **Express.js REST API** with TypeScript
  - Authentication endpoints (login, register, refresh token, logout)
  - Lead management endpoints (create, read, update)
  - Shipment management endpoints (CRUD operations)
  - Country endpoints (get origins, destinations)
  - Tracking endpoints (public tracking by number)
- **JWT Authentication** with access and refresh tokens
  - Access token: 24h expiration
  - Refresh token: 30d expiration
  - Automatic token refresh on 401 errors
- **Middleware**
  - Authentication middleware (requireAuth, requireAdmin)
  - Error handling middleware with standardized responses
  - CORS configuration for cross-origin requests
  - Rate limiting (100 requests per 15 minutes)
- **Security Features**
  - bcrypt password hashing (10 rounds)
  - SQL injection protection (parameterized queries)
  - Input validation
  - Row Level Security (RLS) in database

#### Database (Supabase PostgreSQL)
- **Schema Design**
  - `users` table (customers and admins)
  - `countries` table (22 countries: EU origins, CIS destinations)
  - `pricing_tiers` table (16 tiers based on weight and type)
  - `leads` table (inquiries from landing page)
  - `shipments` table (parcel deliveries)
  - `tracking_events` table (status updates for shipments)
- **Migrations** (8 SQL files)
  - 001: Create users table with roles
  - 002: Create countries table
  - 003: Create pricing tiers table
  - 004: Create leads table with foreign keys
  - 005: Create shipments table
  - 006: Create tracking events table
  - 007: Add indexes for performance
  - 008: Enable Row Level Security
- **Seed Data**
  - 22 countries (10 EU origins, 12 CIS destinations)
  - 16 pricing tiers (documents, parcels up to 20kg)
  - Admin user (admin@sv-express.com)

#### Admin Dashboard
- **Authentication**
  - Login page with form validation
  - AuthContext for state management
  - Protected routes with automatic redirect
  - Token refresh on expiration
  - Logout functionality
- **Lead Management**
  - View all leads in table format
  - Filter by status (new, contacted, converted, lost)
  - Update lead status with dropdown
  - Display country names and flags
  - Show weight estimates and contact info
  - Real-time updates after status changes
- **UI Components**
  - Responsive Tailwind CSS design
  - Loading states
  - Error handling with user feedback
  - Status badges with color coding
  - Professional admin interface

#### Landing Page
- **Static Website**
  - Modern, responsive design
  - Hero section with call-to-action
  - Services showcase
  - Pricing calculator (3 tiers)
  - Countries selector (EU to CIS)
  - Tracking input (redirects to track.global)
- **Lead Form Integration**
  - Connected to API (POST /api/leads)
  - Fields: name, phone, origin, destination
  - Client-side validation
  - Loading state during submission
  - Success/error messages
  - Form reset after successful submission
- **Dynamic Features**
  - Interactive pricing calculator
  - Mobile-responsive menu
  - Smooth animations
  - Iconify icons integration

#### Documentation
- **Setup Guide** (docs/SETUP.md)
  - Prerequisites
  - Installation steps
  - Database setup
  - Environment variables
  - Development workflow
- **API Documentation** (docs/API.md)
  - All endpoint descriptions
  - Request/response examples
  - Authentication flow
  - Error codes
- **Database Schema** (docs/DATABASE.md)
  - Table structures
  - Relationships
  - Indexes
  - RLS policies
- **Deployment Guide** (docs/DEPLOYMENT.md)
  - Vercel deployment steps
  - Environment variables setup
  - Production URLs
  - Troubleshooting

#### Infrastructure
- **Monorepo Structure** with npm workspaces
  - `packages/shared` - Shared TypeScript types
  - `packages/api` - Backend Express API
  - `packages/admin` - Admin React dashboard
  - `packages/landing` - Static landing page
  - `packages/portal` - User portal (placeholder)
- **Development Tools**
  - ESLint configuration
  - Prettier formatting
  - TypeScript strict mode
  - Git hooks ready
- **Deployment**
  - Vercel serverless functions for API
  - Vercel static hosting for frontend
  - Environment variables in Vercel
  - Automatic HTTPS
  - Global CDN

### 🚀 Deployed

- **Landing Page:** https://landing-b4gqiybv0-gregs-projects-c94a974d.vercel.app
- **API:** https://api-c95db0ov1-gregs-projects-c94a974d.vercel.app
- **Admin Dashboard:** https://admin-6s5anbhde-gregs-projects-c94a974d.vercel.app
- **GitHub Repository:** https://github.com/ddbro1-beep/sv-express

### 🔧 Technical Specifications

- **Node.js:** 18.x
- **TypeScript:** 5.9.x
- **React:** 18.2.x
- **Express:** 4.18.x
- **Vite:** 5.4.x
- **Tailwind CSS:** 3.4.x
- **PostgreSQL:** 15.x (Supabase)
- **JWT:** jsonwebtoken 9.x
- **bcrypt:** bcryptjs 2.4.x

### 📦 Package Structure

```
sv-express-local/
├── packages/
│   ├── shared/           # TypeScript types and utilities
│   ├── api/              # Express API (19 files)
│   ├── admin/            # React Admin (10 files)
│   ├── landing/          # Static website
│   └── portal/           # User portal (coming soon)
├── database/
│   ├── migrations/       # 8 SQL migration files
│   └── seeds/            # 3 seed data files
├── docs/                 # 4 documentation files
├── .gitignore            # Git ignore rules
├── package.json          # Root workspace config
├── README.md             # Project documentation
├── CHANGELOG.md          # This file
└── claude.md             # Development rules
```

### 🎯 Features Implemented

#### For Customers (via Landing Page)
- ✅ Submit shipping inquiries
- ✅ Calculate shipping costs
- ✅ Track existing shipments (via external service)
- ✅ View supported countries and routes
- ⏳ Register and login (coming in Portal)

#### For Administrators (via Admin Dashboard)
- ✅ View all customer leads
- ✅ Filter leads by status
- ✅ Update lead status
- ✅ Secure authentication with JWT
- ⏳ Create shipments from leads
- ⏳ Add tracking events
- ⏳ Manage users

### 🐛 Known Issues

- TypeScript warnings in token.ts (non-breaking, does not affect functionality)
- CORS environment variable needs manual update in Vercel dashboard
- Email notifications not yet implemented

### 🔜 Coming Next (v1.1.0)

See [ROADMAP.md](docs/ROADMAP.md) for upcoming features.

---

## How to Update Production

```bash
# 1. Make changes locally
git add .
git commit -m "feat: your feature description"
git push origin main

# 2. Deploy API
cd packages/api && vercel --prod

# 3. Deploy Admin
cd packages/admin && vercel --prod

# 4. Deploy Landing
cd packages/landing && vercel --prod
```

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
