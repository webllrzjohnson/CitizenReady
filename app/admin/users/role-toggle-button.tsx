'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toggleUserRole } from '@/actions/admin'
import { useToast } from '@/hooks/use-toast'

type RoleToggleButtonProps = {
  userId: string
  currentRole: string
}

export function RoleToggleButton({ userId, currentRole }: RoleToggleButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleToggle = async () => {
    setIsLoading(true)

    const result = await toggleUserRole(userId, currentRole)

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: `User role updated to ${currentRole === 'user' ? 'admin' : 'user'}`,
      })
    }

    setIsLoading(false)
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={isLoading}
      variant={currentRole === 'user' ? 'default' : 'outline'}
      size="sm"
    >
      {isLoading
        ? 'Updating...'
        : currentRole === 'user'
        ? 'Make Admin'
        : 'Remove Admin'}
    </Button>
  )
}
