# Deployment Guide

This guide covers deploying CitizenReady with PostgreSQL and Vercel.

## Prerequisites

- Node.js 20.9+ installed (matches `engines` in `package.json` and Next.js 15 support)
- A PostgreSQL database (local, Neon, Railway, etc.)
- A Vercel account (free tier works)
- Git installed

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure PostgreSQL

Point `DATABASE_URL` at your Postgres instance. The app talks to the database directly via the `postgres` package (`lib/db.ts`). Auth uses JWT cookies (`JWT_SECRET`) — there is no third-party auth provider.

Ensure your schema includes the tables the app expects (`profiles`, `topics`, `questions`, `quiz_sessions`, `question_attempts`, `blog_posts`, `contact_messages`, `site_settings`, etc.).

## Step 3: Configure Environment Variables

Create `.env.local` in the project root:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL=postgresql://user:password@host:5432/citizenready
JWT_SECRET=generate-a-long-random-secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Step 4: Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional: seed questions with `npm run seed` (requires `canadaquiz_questions.json`).

## Step 5: Deploy to Vercel

1. Push the repo to GitHub
2. Import the project in Vercel
3. Set environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_SITE_URL` (your production URL)
   - Optional: `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, etc.
4. Deploy

## Checklist

- [ ] Postgres reachable from Vercel
- [ ] `DATABASE_URL` and `JWT_SECRET` set in production
- [ ] `NEXT_PUBLIC_SITE_URL` matches the production hostname
- [ ] Admin user exists with `role = 'admin'` in `profiles`

## Troubleshooting

- **Login fails**: confirm `JWT_SECRET` matches across deploys and `password_hash` is set on the profile
- **DB connection errors**: check `DATABASE_URL`, SSL settings, and network allowlists for your host
- **Build fails**: run `npm run build` locally and fix TypeScript/lint errors first
