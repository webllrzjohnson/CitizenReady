import Link from 'next/link'
import {
  formatPremiumExpiry,
  getPremiumStatus,
  getPremiumStatusCta,
  getPremiumStatusDescription,
  getPremiumStatusLabel,
} from '@/lib/premium'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Profile = {
  role?: string | null
  is_premium?: boolean | null
  premium_expires_at?: string | Date | null
}

function badgeClass(status: ReturnType<typeof getPremiumStatus>) {
  if (status === 'active' || status === 'lifetime' || status === 'admin') return 'bg-green-100 text-green-800 hover:bg-green-100'
  if (status === 'expired') return 'bg-amber-100 text-amber-800 hover:bg-amber-100'
  return ''
}

export function PlusStatusCard({ profile, compact = false }: { profile: Profile | null | undefined; compact?: boolean }) {
  const status = getPremiumStatus(profile)
  const expiry = formatPremiumExpiry(profile?.premium_expires_at)
  const cta = getPremiumStatusCta(status)

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className={compact ? 'text-lg font-semibold text-gray-900' : 'text-xl font-semibold text-gray-900'}>
              Plus Status
            </h2>
            <Badge className={badgeClass(status) || undefined} variant={badgeClass(status) ? 'default' : 'secondary'}>
              {getPremiumStatusLabel(status)}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {getPremiumStatusDescription(status, expiry)}
          </p>
        </div>
        <Button asChild className="bg-brand-red text-white hover:bg-brand-red-dark" variant={status === 'free' || status === 'expired' ? 'default' : 'outline'}>
          <Link href={cta.href}>{cta.label}</Link>
        </Button>
      </div>
    </div>
  )
}
