# Deployment Guide

This guide covers deploying CitizenReady on a VPS with [Coolify](https://coolify.io), PostgreSQL, and optional Anthropic (AI blog drafts).

## Prerequisites

- A VPS with Coolify installed
- Node.js 20.9+ (matches `engines` in `package.json`)
- PostgreSQL (on the same VPS, a managed host, or a Coolify database service)
- Git access to this repository

## Architecture

- **App:** Next.js 15 (App Router), built and run as a Node server (`npm run build` → `npm start`)
- **Database:** PostgreSQL via `DATABASE_URL` (`lib/db.ts`)
- **Auth:** JWT session cookies (`JWT_SECRET`) — no third-party auth provider
- **AI blog drafts:** Server Action calls Anthropic when `ANTHROPIC_API_KEY` is set

## Step 1: PostgreSQL

Point `DATABASE_URL` at your Postgres instance.

**New database:** apply the schema from this repo:

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

See `db/README.md` for backups, restore, and exporting a live schema.

The app expects tables: `profiles`, `topics`, `questions`, `quiz_sessions`, `question_attempts`, `blog_posts`, `contact_messages`, `site_settings`.

**Existing database:** apply numbered SQL files in `db/migrations/` in order after deploy. Current migrations:

```bash
npm run db:migrate
```

The migration runner uses the app's `DATABASE_URL` and works inside the Coolify app container; no `psql` binary is required.

After the `003_profile_session_version` migration, existing users may need to log in again because older JWT cookies do not include the new session-version claim.

The `004_premium_expiry` migration enables manual Plus grants with expiry dates while online checkout is not connected yet.

If Postgres runs on the same VPS as Coolify, use the internal hostname Coolify provides (not `localhost` from inside the app container unless Postgres is in the same container).

## Step 2: Coolify application

1. In Coolify, create a **new resource** → **Application** (or add this repo to an existing project).
2. Connect your Git repository and set the branch (e.g. `main`).
3. Build pack: **Nixpacks** or **Dockerfile** — default Node detection usually works.
4. Set the **build command** (if not auto-detected): `npm run build`
5. Set the **start command**: `npm start`
6. Expose port **3000** (or map Coolify’s proxy to the container port Next.js uses).
7. **Health check** (optional): `GET /api/health` — returns `200` when Postgres is reachable.
8. **Proxy timeout:** for AI blog drafts, set read/proxy timeout to **≥ 180 seconds** (generation can take up to 3 minutes).

Redeploy after every push to `main` (or enable auto-deploy on push).

## Step 3: Environment variables (Coolify)

In your Coolify app → **Environment Variables**, set:

### Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://user:pass@host:5432/citizenready` |
| `DATABASE_SSL` | Optional. Set to `require` when Postgres needs TLS (or use `?sslmode=require` in `DATABASE_URL`) |
| `JWT_SECRET` | Long random secret for session cookies (same value across redeploys) |
| `NEXT_PUBLIC_SITE_URL` | Public site URL, e.g. `https://citizenready.ca` (no trailing slash) |

### Optional — AI blog draft (Admin → AI blog draft)

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Anthropic API key (`sk-ant-...`) — required when using Claude |
| `OPENAI_API_KEY` | OpenAI API key (`sk-...`) — required when using OpenAI |
| `ANTHROPIC_MODEL` | Optional env fallback if no admin default is saved |
| `OPENAI_MODEL` | Optional env fallback if no admin default is saved |

Default provider/model can be set in **Admin → AI blog draft** and are stored in `site_settings`. Do **not** use retired Anthropic ids such as `claude-sonnet-4-20250514`.

### Optional — other features

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Transactional email |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Payments |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | Analytics |
| `SENTRY_DSN` | Error monitoring |

Coolify injects these at runtime; you do not commit production secrets to the repo.

## Step 4: Local development

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local with DATABASE_URL, JWT_SECRET, NEXT_PUBLIC_SITE_URL
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional: seed questions with `npm run seed -- --yes` (requires `canadaquiz_questions.json` in the project root).

## Step 5: First admin user

Create a user via signup, then promote in Postgres:

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'you@example.com';
```

## Step 6: Backups

Schedule regular Postgres dumps on the VPS. Example:

```bash
pg_dump "$DATABASE_URL" --format=custom --file="/backups/citizenready-$(date +%F).dump"
```

Copy backups off-server. Details in `db/README.md`.

## Production checklist

- [ ] Postgres reachable from the Coolify app container
- [ ] `DATABASE_URL`, `JWT_SECRET`, and `NEXT_PUBLIC_SITE_URL` set in Coolify
- [ ] `NEXT_PUBLIC_SITE_URL` matches your public domain (HTTPS)
- [ ] Reverse proxy / SSL configured in Coolify for your domain
- [ ] Admin user has `role = 'admin'` in `profiles`
- [ ] For AI drafts: `ANTHROPIC_API_KEY` set; `ANTHROPIC_MODEL` unset or `claude-sonnet-4-6`
- [ ] Coolify proxy timeout ≥ 180s if using AI blog drafts
- [ ] `GET /api/health` returns `200` after deploy
- [ ] Existing databases have `npm run db:migrate` applied after deploy
- [ ] Postgres backups scheduled (`db/README.md`)

## Troubleshooting

### Login fails

- Confirm `JWT_SECRET` is set and unchanged between deploys
- Confirm the profile has `password_hash` set (users created after the Postgres migration)

### Database connection errors

- Verify `DATABASE_URL` from inside the container (host, port, user, password, database name)
- If Postgres requires SSL, set `DATABASE_SSL=require` or add `?sslmode=require` to `DATABASE_URL`

### Build fails

- Run `npm run build` locally and fix TypeScript/lint errors
- Ensure Node version in Coolify is **≥ 20.9**

### AI blog draft fails

- **`ANTHROPIC_API_KEY is not configured.`** — add the key in Coolify env vars and redeploy
- **Model / 404 errors** — remove an old `ANTHROPIC_MODEL` value or set `claude-sonnet-4-6`
- **Unauthorized** — log in as a user with `role = 'admin'`
- After changing env vars in Coolify, trigger a **new deploy** so the running container picks them up
