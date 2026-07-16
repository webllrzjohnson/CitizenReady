'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { setUserPremiumAccess, type PremiumGrant } from '@/actions/admin'
import { useToast } from '@/hooks/use-toast'

type PremiumControlsProps = {
  userId: string
  isPremium: boolean
}

const GRANTS: { value: PremiumGrant; label: string }[] = [
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '1y', label: '1 year' },
  { value: 'lifetime', label: 'Lifetime' },
]

export function PremiumToggleButton({ userId, isPremium }: PremiumControlsProps) {
  const router = useRouter()
  const [loadingGrant, setLoadingGrant] = useState<PremiumGrant | 'remove' | null>(null)
  const { toast } = useToast()

  const handleGrant = async (grant: PremiumGrant) => {
    setLoadingGrant(grant)
    const result = await setUserPremiumAccess(userId, grant)
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Success', description: 'Plus access updated' })
      router.refresh()
    }
    setLoadingGrant(null)
  }

  const handleRemove = async () => {
    setLoadingGrant('remove')
    const result = await setUserPremiumAccess(userId, 'remove')
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Success', description: 'Plus access removed' })
      router.refresh()
    }
    setLoadingGrant(null)
  }

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {GRANTS.map((grant) => (
        <Button
          key={grant.value}
          onClick={() => void handleGrant(grant.value)}
          disabled={loadingGrant !== null}
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs"
        >
          {loadingGrant === grant.value ? '...' : grant.label}
        </Button>
      ))}
      {isPremium && (
        <Button
          onClick={() => void handleRemove()}
          disabled={loadingGrant !== null}
          variant="destructive"
          size="sm"
          className="h-7 px-2 text-xs"
        >
          {loadingGrant === 'remove' ? '...' : 'Remove'}
        </Button>
      )}
    </div>
  )
}
