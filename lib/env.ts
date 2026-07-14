const REQUIRED_SERVER_ENV = ['DATABASE_URL', 'JWT_SECRET'] as const

/** Log missing required env vars once at server startup (non-fatal). */
export function logMissingServerEnv(): void {
  if (process.env.NODE_ENV === 'test') return

  const missing = REQUIRED_SERVER_ENV.filter((key) => !String(process.env[key] ?? '').trim())
  if (missing.length > 0) {
    console.error(
      `[CitizenReady] Missing required environment variables: ${missing.join(', ')}`,
    )
  }
}

/** SSL for postgres.js — set DATABASE_SSL=require or use ?sslmode=require in DATABASE_URL. */
export function getDatabaseSsl(): false | 'require' {
  const explicit = String(process.env.DATABASE_SSL ?? '').trim().toLowerCase()
  if (explicit === 'require' || explicit === 'true' || explicit === '1') {
    return 'require'
  }

  const url = String(process.env.DATABASE_URL ?? '')
  if (/[?&]sslmode=require/i.test(url)) {
    return 'require'
  }

  return false
}
