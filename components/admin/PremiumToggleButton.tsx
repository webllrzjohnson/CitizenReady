'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toggleUserPremium } from '@/actions/admin'
import { useToast } from '@/hooks/use-toast'

type PremiumToggleButtonProps = {
  userId: string
  isPremium: boolean
}

export function PremiumToggleButton({ userId, isPremium }: PremiumToggleButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleToggle = async () => {
    setIsLoading(true)

    const result = await toggleUserPremium(userId, isPremium)

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: isPremium ? 'Plus access removed' : 'Plus access granted',
      })
      router.refresh()
    }

    setIsLoading(false)
  }

  return (
    <Button
      onClick={() => void handleToggle()}
      disabled={isLoading}
      variant={isPremium ? 'outline' : 'default'}
      size="sm"
      className={!isPremium ? 'bg-brand-navy hover:bg-brand-navy/90' : undefined}
    >
      {isLoading ? 'Updating...' : isPremium ? 'Revoke Plus' : 'Grant Plus'}
    </Button>
  )
}
