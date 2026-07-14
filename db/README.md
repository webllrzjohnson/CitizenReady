# Database

CitizenReady uses PostgreSQL directly (`lib/db.ts`). Auth is JWT cookies — there is no Supabase `auth` schema.

## Fresh install

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

Then seed questions (optional):

```bash
npm run seed -- --yes
```

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
