# Database

CitizenReady uses PostgreSQL directly (`lib/db.ts`). Auth is handled by first-party JWT cookies and the `profiles` table.

## Fresh install

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

Then seed questions (optional):

```bash
npm run seed -- --yes
```

## Existing database migrations

For an existing Coolify/VPS database, apply migration files in order after deploying the code that introduced them:

```bash
npm run db:migrate
```

The runner applies numbered SQL files in `db/migrations/` using `DATABASE_URL`. The `002` migration removes duplicate answer rows for the same session/question before adding a uniqueness guard. The `003` migration adds `profiles.session_version`; existing users may need to log in again after deploy because older JWT cookies do not include this field.

## Backup (recommended on VPS)

Daily dump from the host or a cron job:

```bash
pg_dump "$DATABASE_URL" --format=custom --file="citizenready-$(date +%F).dump"
```

Copy backups off the VPS (S3, another server, etc.).

## Restore

```bash
pg_restore --clean --if-exists --dbname="$DATABASE_URL" citizenready-YYYY-MM-DD.dump
```

## Live schema export

If production has drifted, export the truth from Postgres:

```bash
pg_dump "$DATABASE_URL" --schema-only --schema=public --no-owner --no-privileges > db/schema.live.sql
```

Compare with `db/schema.sql` and merge intentional changes.
