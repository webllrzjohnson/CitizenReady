# CitizenReady

CitizenReady is a Canadian citizenship exam prep platform where users practice questions by topic, take timed mock exams modelled on the IRCC citizenship test, and track their improvement over time.

## Current production direction

CitizenReady runs on a VPS through Coolify with **direct PostgreSQL** and first-party JWT cookie authentication. It does **not** use Supabase at runtime.

Core assumptions:

- PostgreSQL is accessed through `DATABASE_URL` using the `postgres` package.
- Auth is email/password with signed JWT cookies in `lib/auth/session.ts`.
- Server Actions are used for mutations.
- Production migrations are run with the app's Node migration runner: `npm run db:migrate`.
- Payment checkout is not connected yet; Plus access is granted manually from the admin panel.

## Features

- Practice questions by Discover Canada topic
- Timed mock exams with the citizenship-test pass threshold
- Guest access for practice and limited mock exams
- User accounts with saved progress
- Complete question bank and cheat sheet gated behind Plus access
- Today’s Study Plan and continue-card recommendations for returning learners
- Learner question reporting from practice questions
- Manual Plus access controls for early users and testers
- Admin panel for question, topic, user, blog, contact, ad, and AI draft management
- Admin question-issue report queue for learner feedback on confusing/outdated questions
- Admin analytics snapshot for active learners, mock exams, Plus request conversion, and missed topics
- Blog and public study pages for SEO/content growth
- Health endpoint for deployment verification
- Abuse protection for login, signup, and contact form submissions
- Admin audit logging for sensitive admin mutations

## Tech stack

- **Framework:** Next.js 15 App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn-style components
- **Database:** PostgreSQL through the `postgres` package (`lib/db.ts`)
- **Authentication:** first-party email/password auth with JWT session cookies (`lib/auth/session.ts`)
- **Validation:** Zod
- **Testing:** Node test runner through `tsx`
- **Deployment:** VPS/Coolify with `DATABASE_URL` and `JWT_SECRET`

## Getting started

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local with DATABASE_URL, JWT_SECRET, and NEXT_PUBLIC_SITE_URL
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Required environment variables

```env
DATABASE_URL=postgresql://user:***@host:5432/citizenready
JWT_SECRET=generate-a-long-random-secret-at-least-32-characters
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Optional settings for email, analytics, payments, and AI blog drafts are documented in `.env.example` and `DEPLOYMENT.md`.

## How to operate CitizenReady

Use this section as the day-to-day operating guide after deployment.

### How to deploy a code update

1. Push the verified change to `main`.
2. Wait for the Coolify deployment to finish.
3. If the update includes a migration, run this inside the Coolify app container:

   ```bash
   npm run db:migrate
   ```

4. Confirm app/database health:

   ```bash
   curl -i http://localhost:3000/api/health
   ```

5. Smoke-test the pages touched by the update.

For the current deployed system, the most important smoke tests are:

- `/admin/plus-requests`
- `/admin/question-reports`
- `/admin/settings`
- `/dashboard`
- `/plus-request`

### How to handle a manual Plus request

1. Open `/admin/plus-requests`.
2. Review the requester name, contact email, account email, selected plan, and message.
3. If the user does not have a matched account, mark the request `waiting_account` and ask them to create a free account with the same email.
4. If payment or manual follow-up is needed, mark the request `waiting_payment` or `follow_up`.
5. Use the internal admin note box for private tracking, such as:
   - `Called user`
   - `Waiting for payment`
   - `Asked user to create account`
   - `Resent email`
6. When ready, grant the requested Plus duration from the request row.
7. Confirm the row changes to `completed` and the user profile shows active Plus access.
8. If needed, use **Resend email** from the request row.

Admin notes are internal only. They are not sent to the user.

### How to test email notifications

1. Confirm SMTP variables are configured in Coolify:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_SECURE`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `SMTP_FROM`
   - `ADMIN_NOTIFICATION_EMAIL`
2. Open `/admin/settings`.
3. Use **Send test email**.
4. Confirm the admin inbox receives the message.
5. If Gmail is used, `SMTP_PASS` must be a Gmail app password, not the normal Gmail password.

### How to review learner question reports

1. Open `/admin/question-reports`.
2. Review open reports first.
3. Mark a report `reviewing` while checking the question.
4. Use **Edit question** to correct the question, answers, explanation, or active status.
5. Mark the report `resolved` after the content is checked.
6. Use the admin dashboard’s **Most Missed Topics** and **Question Reports** cards to prioritize cleanup.

### How to monitor learner progress and demand

Open `/admin` and watch:

- Active users in the last 7 days
- Completed sessions
- Completed mock exams
- Signup → Plus request conversion
- Open question reports
- Most missed topics

These numbers should guide the next product phase. Avoid adding payment automation or complex reminders until real usage shows demand.

### How learners should use the dashboard

Logged-in learners should start at `/dashboard` and follow:

1. **Continue where you left off** — resumes recent study activity.
2. **Today’s Study Plan** — recommends missed-question review, weak-topic practice, or mock exams.
3. **Progress** — checks topic performance and weak areas.
4. **Mock exam** — verifies readiness under timed conditions.

## Authentication and session invalidation

CitizenReady uses a first-party JWT cookie named `cr_session`.

Session hardening is handled with `profiles.session_version`:

- Each JWT includes the user's current `session_version`.
- Sensitive server paths/actions call DB-backed session helpers such as `getFreshSession()` or `requireAdminSession()`.
- If the JWT version no longer matches the database version, the session is treated as stale.
- `session_version` is incremented when:
  - a user changes profile identity data
  - a user changes email
  - a user changes password
  - an admin changes a user's role
  - an account is deleted

After deploying the session-version migration, older cookies may require users to log in again.

## Manual Plus access guide

CitizenReady can manage premium access before Stripe or PayPal is connected.

Database fields:

- `profiles.is_premium`
- `profiles.premium_expires_at`

Access rules:

- Admin users always have Plus access.
- `is_premium = false` means Free.
- `is_premium = true` and `premium_expires_at = null` means Lifetime/manual Plus.
- `is_premium = true` and future `premium_expires_at` means active Plus until that date.
- `is_premium = true` and past `premium_expires_at` means expired and no Plus access.

Admin workflow:

1. Users can submit manual Plus leads at `/plus-request`.
2. Admins review them at `/admin/plus-requests`.
3. If the request matches an existing account email, grant Plus directly from that row.
4. Otherwise mark the request `waiting_account` and ask the user to create a free account first.
5. You can still go to `/admin/users`, find the user, and use the Plus controls to grant:
   - 30 days
   - 90 days
   - 1 year
   - Lifetime
6. Use **Remove** to revoke Plus.
7. Confirm the user badge changes to Free, Plus until date, Lifetime, Expired, or Admin Plus.

Plus request workflow statuses:

- `new` — request arrived and needs first review.
- `waiting_payment` — manual payment/follow-up instructions have been sent.
- `waiting_account` — user needs to create or confirm their CitizenReady account email.
- `follow_up` — admin needs one more detail before approving/granting.
- `approved` — request approved, grant still pending.
- `completed` — access granted or request fully handled.
- `rejected` — request closed without Plus access.

Admin notes are internal only and are not included in requester emails.

This is designed as the bridge until online checkout is ready. Future Stripe/PayPal webhooks should update the same fields instead of introducing a separate entitlement system.

## Admin email notifications

Optional SMTP notifications can alert the admin and keep Plus requesters informed. The app sends email when users submit:

- contact messages
- manual Plus access requests

It also emails the requester when an admin approves, rejects, completes, or grants a manual Plus request.

Configure these environment variables in Coolify to enable notifications:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="CitizenReady <your-email@gmail.com>"
ADMIN_NOTIFICATION_EMAIL=admin@example.com
```

If these values are missing, submissions and admin actions still succeed and email sending is skipped. If SMTP fails, the app logs the email error but does not block the user submission or admin action.

## Question quality workflow

Logged-in learners can report a confusing, outdated, or incorrect practice question directly from the question card. Admins review reports at `/admin/question-reports`, edit the underlying question, and mark reports as `reviewing` or `resolved`.

The backing table is `public.question_issue_reports`, added by migration `008_plus_workflow_and_question_reports.sql`.

## Abuse protection and audit logging

The security phase added DB-backed abuse protection and audit logging.

### Rate limiting

`public.rate_limits` stores counters for throttled actions.

Current limits:

| Action | Limit | Scope |
| --- | ---: | --- |
| Login | 5 attempts / 15 minutes | email + IP fingerprint |
| Signup | 3 attempts / 1 hour | email + IP fingerprint |
| Contact form | 3 submissions / 1 hour | email + IP fingerprint |

The implementation is in:

- `lib/security/rate-limit.ts`
- `lib/security/rate-limit-core.ts`

If the `rate_limits` table is missing during a rollout, rate limiting fails open temporarily so auth/contact flows do not break before migrations are applied. Run migrations immediately after deployment.

### Admin audit logs

`public.admin_audit_logs` records sensitive admin mutations:

- user role changes
- manual Plus access changes
- site settings changes
- AI blog settings changes

The implementation is in:

- `lib/security/audit.ts`
- `lib/security/audit-core.ts`

Sensitive metadata such as secrets, tokens, keys, and passwords is redacted before storage. Email values are partially masked.

## Account deletion hardening

Deleting an account now requires both:

1. Typing `DELETE`.
2. Entering the current account password.

This protects against accidental deletion and stale/hijacked browser sessions.

Relevant files:

- `actions/settings.ts`
- `components/settings/DeleteAccountSection.tsx`

## Database

Fresh PostgreSQL databases can be initialized with:

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

Existing databases should be updated through migrations:

```bash
npm run db:migrate
```

Migration order:

```text
db/migrations/001_ai_blog_settings.sql
db/migrations/002_unique_question_attempts.sql
db/migrations/003_profile_session_version.sql
db/migrations/004_premium_expiry.sql
db/migrations/005_security_abuse_protection.sql
db/migrations/006_plus_access_requests.sql
db/migrations/007_plus_request_admin_notes.sql
db/migrations/008_plus_workflow_and_question_reports.sql
```

Migration summary:

- `001` adds AI blog settings.
- `002` removes duplicate question attempts and adds uniqueness protection.
- `003` adds `profiles.session_version` and its index.
- `004` adds `profiles.premium_expires_at`.
- `005` adds `rate_limits` and `admin_audit_logs`.
- `006` adds manual Plus access requests.
- `007` adds internal admin notes to Plus requests.
- `008` adds richer Plus workflow statuses and question issue reports.

See `db/README.md` for backups, restore, and schema export notes.

Optional question seeding:

```bash
npm run seed -- --yes
```

See `scripts/README.md` before running seed commands because they can delete existing questions.

## Verification commands

Run these before pushing code that affects production behavior:

```bash
npm test
npm run lint
npx tsc --noEmit
DATABASE_URL='postgresql://user:pass@127.0.0.1:5432/citizenready' \
  JWT_SECRET='local-verification-secret-at-least-32-chars' \
  NEXT_PUBLIC_SITE_URL='http://localhost:3000' \
  npm run build
npm run db:migrate -- --dry-run
```

Use a real local or disposable database URL for local build verification when possible. Do not paste production secrets into logs or documentation.

## Coolify deployment guide

This project is deployed on a VPS through Coolify. See `DEPLOYMENT.md` for the full production checklist, required Coolify environment variables, health checks, and database backup guidance.

After a successful Coolify deploy, run migrations inside the app container:

```bash
npm run db:migrate
```

Then verify app and database health:

```bash
curl -i http://localhost:3000/api/health
```

Expected JSON body:

```json
{"status":"ok","checks":{"app":"ok","database":"ok"}}
```

If a Coolify deploy fails after `next build` succeeds and the logs stop near Docker image export, investigate VPS storage first:

```bash
df -h
docker system df
docker builder prune -af
docker system prune -af
```

Do **not** run `docker volume prune` unless you are certain production database volumes are not needed.

## Project structure

```text
app/          # Next.js App Router pages and API routes
actions/      # Server Actions for mutations
components/   # UI and domain components
lib/          # Database, auth, validation, security, blog, and utility modules
db/           # PostgreSQL schema and migrations
types/        # Shared TypeScript types
hooks/        # Client hooks
scripts/      # Import/seed/migration tooling
tests/        # Node/tsx tests
```

## License

MIT
