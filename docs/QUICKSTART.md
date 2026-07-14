# Quick Start

Get CitizenReady running locally against PostgreSQL.

## Prerequisites

- Node.js 20.9+
- A PostgreSQL database

## 1. Install

```bash
npm install
cp .env.local.example .env.local
```

## 2. Environment

Edit `.env.local`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/citizenready
JWT_SECRET=generate-a-long-random-secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Optional: Seed questions

```bash
npm run seed -- --yes
```

Requires `canadaquiz_questions.json` in the project root. See `scripts/README.md`.

## Project layout

```
app/          # Pages (App Router)
actions/      # Server Actions
lib/          # db, auth, validations
components/   # UI
types/        # Shared TypeScript types
```
