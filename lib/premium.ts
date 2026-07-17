type PremiumProfile = {
  role?: string | null
  is_premium?: boolean | null
  premium_expires_at?: string | Date | null
}

export type PremiumStatus = 'free' | 'active' | 'expired' | 'lifetime' | 'admin'

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

export function getPremiumStatus(profile: PremiumProfile | null | undefined): PremiumStatus {
  if (!profile) return 'free'
  if (profile.role === 'admin') return 'admin'
  if (profile.is_premium !== true) return 'free'
  if (!profile.premium_expires_at) return 'lifetime'
  return hasPremiumAccess(profile) ? 'active' : 'expired'
}

export function getPremiumStatusLabel(status: PremiumStatus): string {
  if (status === 'active') return 'Active Plus'
  if (status === 'expired') return 'Expired Plus'
  if (status === 'lifetime') return 'Lifetime Plus'
  if (status === 'admin') return 'Admin Plus'
  return 'Free'
}

export function getPremiumStatusDescription(status: PremiumStatus, formattedExpiry?: string | null): string {
  if (status === 'admin') return 'Your admin account includes full Plus access.'
  if (status === 'lifetime') return 'Your account has lifetime/manual Plus access.'
  if (status === 'active') return formattedExpiry
    ? `Your Plus access is active until ${formattedExpiry}.`
    : 'Your Plus access is active.'
  if (status === 'expired') return 'Your previous Plus access has expired. Request renewal to unlock Plus features again.'
  return 'You are on the free plan. Request Plus access to unlock all premium study features.'
}

export function getPremiumStatusCta(status: PremiumStatus): { label: string; href: string } {
  if (status === 'free') return { label: 'Request Plus Access', href: '/plus-request' }
  if (status === 'expired') return { label: 'Request Renewal', href: '/plus-request' }
  return { label: 'Continue Studying', href: '/dashboard/study' }
}

export function formatPremiumExpiry(expiresAt: string | Date | null | undefined): string | null {
  if (!expiresAt) return null
  const date = expiresAt instanceof Date ? expiresAt : new Date(expiresAt)
  if (!Number.isFinite(date.getTime())) return null
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
