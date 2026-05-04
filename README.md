<div align="center">

# RDI Recruiter Module

### Modern Recruitment Pipeline Management Platform

**Build, track, and manage your recruitment process with ease.** A full-stack web application designed for seamless candidate management and proposal tracking.

[![Next.js 14](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?style=flat&logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat)](LICENSE)

</div>

---

## Core Features

| Feature | Description |
|---------|-------------|
| **Secure Authentication** | Email/password authentication with JWT tokens in httpOnly cookies |
| **Proposal Management** | Browse, search, filter, and review student proposals at scale |
| **Pipeline Board** | Kanban-style board to track candidates through recruitment stages |
| **Status Tracking** | Complete audit trail of all status changes and candidate movements |
| **Private Notes** | Keep recruiter-only notes on each candidate for collaboration |
| **Analytics Dashboard** | Gain insights into your recruitment pipeline performance |
| **Accessibility Compliant** | WCAG-compliant with keyboard navigation and screen reader support |
| **Modern Interface** | Clean, intuitive interface built with Tailwind CSS |

---

## Technology Stack

<div align="center">

| Component | Technology |
|-----------|------------|
| **Frontend Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5.3 |
| **Database** | SQLite with Prisma ORM |
| **Authentication** | JWT + bcrypt |
| **Styling** | Tailwind CSS 3.3 |
| **Validation** | Zod |
| **Runtime** | Node.js 20 LTS |

</div>

---

## Prerequisites

- **Node.js 20 LTS** — Required (version 24 is not compatible)
- npm 9+
- Git

---

## Getting Started

### Step 1: Clone & Navigate
```bash
git clone <repository-url>
cd rdi-recruiter-module
```

### Step 2: Verify Node.js Version
```bash
node --version  # Should print v20.x.x
```

If you use `nvm`:
```bash
nvm use 20
# or if not installed: nvm install 20 && nvm use 20
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and add your JWT secret:
```env
JWT_SECRET="your-secure-key-here"
DATABASE_URL="file:./dev.db"
```

### Step 5: Set Up Database
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed with demo data
npm run db:seed
```

### Step 6: Start Development
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

---

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with demo data
npm run db:reset     # Reset database and re-seed
npm run db:studio    # Open Prisma Studio GUI
```

---

## Project Structure

```
rdi-recruiter-module/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/         # Authentication pages
│   │   ├── (dashboard)/    # Dashboard & features
│   │   └── api/            # API routes
│   ├── components/         # Reusable React components
│   ├── lib/               # Utilities & helpers
│   └── styles/            # Global styles
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts            # Seeding script
│   └── migrations/        # Migration history
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## Demo Credentials

After seeding the database, log in with:
```
Email:    recruiter@techcorp.com
Password: password123
```

---

## Database Schema

The application uses these core models:

| Model | Purpose |
|-------|---------|
| **Company** | Recruiter/employer accounts |
| **Student** | Student profiles and information |
| **Proposal** | Student-submitted proposals |
| **Application** | Linking companies to proposals with status |
| **StatusHistory** | Audit trail of all status changes |
| **RecruiterNote** | Private recruiter notes on candidates |

**Note**: SQLite doesn't support Prisma enums, so statuses are stored as Strings with validation in application code.

---

## Status Workflow

```
┌─────────────────┐
│   NEW           │  Application received
└────────┬────────┘
         │
         v
┌──────────────────────┐
│  UNDER_REVIEW        │  Being evaluated
└────────┬─────────────┘
         │
    ┌────┴─────────────────────────┐
    │                              │
    v                              v
┌──────────────┐          ┌──────────────────┐
│ SHORTLISTED  │          │   REJECTED       │
└────────┬─────┘          └──────────────────┘
         │
         v
┌──────────────────────┐
│   INTERVIEW          │  Interview stage
└────────┬─────────────┘
         │
         v
┌──────────────────────┐
│   SELECTED           │  HIRED
└──────────────────────┘
```

**Available Statuses:**
- `NEW` — Application received
- `UNDER_REVIEW` — Being evaluated
- `SHORTLISTED` — Moving forward
- `INTERVIEW` — Interview scheduled
- `SELECTED` — Candidate hired
- `REJECTED` — Not moving forward
- `REQUEST_INFO` — Need more information

---

## Troubleshooting

### Node Version Error

**Problem:** `npm install` fails with Node version error

**Solution:**
```bash
nvm use 20
# or: nvm install 20 && nvm use 20
```

---

### Prisma Client Error

**Problem:** `@prisma/client did not initialize yet`

**Solution:**
```bash
npm run db:generate
```

---

### Lockfile Conflicts

**Problem:** Next.js/Turbopack infers wrong workspace root

**Solution:**
```bash
rm ~/package-lock.json ~/yarn.lock ~/pnpm-lock.yaml
```

---

### Port Already in Use

**Problem:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- --port 3001
```

---

### Database Corruption

**Problem:** Database errors or corrupted state

**Solution:**
```bash
npm run db:reset  # Resets database and re-seeds
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` — Create new company account
- `POST /api/auth/login` — Login with credentials
- `POST /api/auth/logout` — Logout session
- `GET /api/auth/me` — Get current user

### Pipeline
- `GET /api/pipeline` — Get pipeline state
- `GET /api/proposals` — List all proposals
- `GET /api/proposals/[id]` — Get proposal details
- `PUT /api/applications/[id]/status` — Update application status

### Analytics
- `GET /api/analytics` — Get pipeline analytics
- `GET /api/ml/analytics` — Get recruitment insights

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the **MIT License** — see the LICENSE file for details.

---

## Support

For issues, questions, or feedback:
- Open an [issue](../../issues)
- Check existing [discussions](../../discussions)
- Email: support@rdi-recruiter.dev

---

<div align="center">

**Made with care for modern recruitment**

[Back to top](#rdi-recruiter-module)

</div>
