# SV Express

Full-stack international parcel delivery management system.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Supabase account
- Vercel account (for deployment)

### Installation

```bash
# Clone repository
git clone https://github.com/ddbro1-beep/sv-express.git
cd sv-express

# Install all dependencies
npm install

# Set up environment variables (see docs/SETUP.md)
cp packages/api/.env.example packages/api/.env
cp packages/admin/.env.example packages/admin/.env
cp packages/portal/.env.example packages/portal/.env

# Build shared package
npm run build:shared
```

### Development

```bash
# Run API (Terminal 1)
npm run dev -w packages/api

# Run Admin Dashboard (Terminal 2)
npm run dev -w packages/admin

# Run User Portal (Terminal 3)
npm run dev -w packages/portal
```

### URLs in Development

- **Landing Page:** http://localhost:3001
- **API:** http://localhost:3000
- **Admin Dashboard:** http://localhost:5173
- **User Portal:** http://localhost:5174

## 📁 Project Structure

```
sv-express/
├── packages/
│   ├── shared/       # Shared TypeScript types and utilities
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

## 🛠 Tech Stack

- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL (Supabase)
- **Frontend:** React, Vite, Tailwind CSS
- **Authentication:** JWT
- **Deployment:** Vercel (serverless functions)

## 📚 Documentation

- [Setup Guide](docs/SETUP.md) - Development environment setup
- [API Documentation](docs/API.md) - API endpoints reference
- [Database Schema](docs/DATABASE.md) - Database structure
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment
- [Development Rules](claude.md) - Coding guidelines for Claude AI

## 🔑 Features

### For Customers
- Track shipments by tracking number
- Register and manage account
- View shipment history
- Submit new shipping requests
- Calculate shipping costs

### For Administrators
- Manage all customer leads
- Create and manage shipments
- Assign shipments to admins
- Add tracking events
- Manage users
- View analytics and reports

## 🌍 Supported Routes

- **Origin Countries:** EU countries (France, Germany, Spain, Italy, etc.)
- **Destination Countries:** CIS countries (Russia, Belarus, Kazakhstan, etc.)

## 🔒 Security

- JWT authentication with bcrypt password hashing
- Row Level Security (RLS) in Supabase
- CORS protection
- Rate limiting on API endpoints
- Input validation and sanitization
- SQL injection protection

## 📦 Building for Production

```bash
# Build all packages
npm run build

# Build individual packages
npm run build:shared
npm run build:api
npm run build:admin
npm run build:portal
```

## 🚢 Deployment

The project is deployed on Vercel:

- **Landing:** https://landing-b4gqiybv0-gregs-projects-c94a974d.vercel.app
- **API:** https://api-c95db0ov1-gregs-projects-c94a974d.vercel.app
- **Admin:** https://admin-6s5anbhde-gregs-projects-c94a974d.vercel.app
- **Portal:** Coming soon...

### Admin Login Credentials

- **Email:** admin@sv-express.com
- **Password:** Bordei1705B

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

## 🧪 Testing

```bash
# Run tests for API
npm test -w packages/api

# Run tests for Admin
npm test -w packages/admin

# Run tests for Portal
npm test -w packages/portal
```

## 📝 Scripts

- `npm run dev` - Show development instructions
- `npm run build` - Build all packages
- `npm run clean` - Clean build artifacts
- `npm run lint` - Lint all packages
- `npm run format` - Format code with Prettier
- `npm run type-check` - TypeScript type checking

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'feat: add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📄 License

MIT

## 👥 Contact

- **Website:** https://sv-express-one.vercel.app
- **GitHub:** https://github.com/ddbro1-beep/sv-express
- **Email:** support@sv-express.com

---

Made with ❤️ by SV Express Team
