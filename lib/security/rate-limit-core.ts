export function normalizeRateLimitIdentity(identity: string | null | undefined): string {
  const value = identity?.trim().toLowerCase()
  return value || 'anonymous'
}

export function buildRateLimitKey(scope: string, identity: string | null | undefined): string {
  return `${scope}:${normalizeRateLimitIdentity(identity)}`
}

export function secondsUntilReset(resetAt: Date, now = new Date()): number {
  return Math.max(1, Math.ceil((resetAt.getTime() - now.getTime()) / 1000))
}
