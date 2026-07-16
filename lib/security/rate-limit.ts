import { headers } from 'next/headers'
import sql from '@/lib/db'
import { buildRateLimitKey, normalizeRateLimitIdentity, secondsUntilReset } from './rate-limit-core'

export { buildRateLimitKey, normalizeRateLimitIdentity, secondsUntilReset }

export type RateLimitResult =
  | { success: true }
  | { success: false; retryAfterSeconds: number; error: string }

export async function getClientFingerprint(fallback = 'anonymous'): Promise<string> {
  const requestHeaders = await headers()
  const forwardedFor = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim()
  const realIp = requestHeaders.get('x-real-ip')?.trim()
  const cfIp = requestHeaders.get('cf-connecting-ip')?.trim()
  return normalizeRateLimitIdentity(forwardedFor || realIp || cfIp || fallback)
}

export async function checkRateLimit(options: {
  scope: string
  identity: string
  maxAttempts: number
  windowSeconds: number
}): Promise<RateLimitResult> {
  const key = buildRateLimitKey(options.scope, options.identity)
  let rows: { attempts: number; reset_at: Date }[]
  try {
    rows = await sql<{ attempts: number; reset_at: Date }[]>`
      INSERT INTO public.rate_limits (key, attempts, reset_at)
      VALUES (${key}, 1, now() + (${`${options.windowSeconds} seconds`})::interval)
      ON CONFLICT (key) DO UPDATE SET
        attempts = CASE
          WHEN public.rate_limits.reset_at <= now() THEN 1
          ELSE public.rate_limits.attempts + 1
        END,
        reset_at = CASE
          WHEN public.rate_limits.reset_at <= now() THEN now() + (${`${options.windowSeconds} seconds`})::interval
          ELSE public.rate_limits.reset_at
        END,
        updated_at = now()
      RETURNING attempts, reset_at
    `
  } catch (error: any) {
    if (error?.code === '42P01') return { success: true }
    throw error
  }

  const record = rows[0]
  if (!record || record.attempts <= options.maxAttempts) return { success: true }

  const retryAfterSeconds = secondsUntilReset(new Date(record.reset_at))
  return {
    success: false,
    retryAfterSeconds,
    error: `Too many attempts. Please try again in ${retryAfterSeconds} seconds.`,
  }
}
