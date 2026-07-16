type PremiumProfile = {
  role?: string | null
  is_premium?: boolean | null
  premium_expires_at?: string | Date | null
}

export function hasPremiumAccess(profile: PremiumProfile | null | undefined): boolean {
  if (!profile) return false
  if (profile.role === 'admin') return true
  if (profile.is_premium !== true) return false
  if (!profile.premium_expires_at) return true

  const expiresAt = profile.premium_expires_at instanceof Date
    ? profile.premium_expires_at
    : new Date(profile.premium_expires_at)

  return Number.isFinite(expiresAt.getTime()) && expiresAt > new Date()
}

export function getPremiumStatus(profile: PremiumProfile | null | undefined): 'free' | 'active' | 'expired' | 'lifetime' | 'admin' {
  if (!profile) return 'free'
  if (profile.role === 'admin') return 'admin'
  if (profile.is_premium !== true) return 'free'
  if (!profile.premium_expires_at) return 'lifetime'
  return hasPremiumAccess(profile) ? 'active' : 'expired'
}

export function formatPremiumExpiry(expiresAt: string | Date | null | undefined): string | null {
  if (!expiresAt) return null
  const date = expiresAt instanceof Date ? expiresAt : new Date(expiresAt)
  if (!Number.isFinite(date.getTime())) return null
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
