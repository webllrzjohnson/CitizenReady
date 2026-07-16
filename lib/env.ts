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

export function getRequiredServerEnv(key: (typeof REQUIRED_SERVER_ENV)[number]): string {
  const value = String(process.env[key] ?? '').trim()
  if (!value) {
    throw new Error(`[CitizenReady] Missing required environment variable: ${key}`)
  }
  return value
}

export function getDatabaseUrl(): string {
  return getRequiredServerEnv('DATABASE_URL')
}

export function getJwtSecret(): string {
  const secret = getRequiredServerEnv('JWT_SECRET')
  if (secret.length < 32) {
    throw new Error('[CitizenReady] JWT_SECRET must be at least 32 characters long')
  }
  return secret
}

export function getJwtSecretBytes(): Uint8Array {
  return new TextEncoder().encode(getJwtSecret())
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
