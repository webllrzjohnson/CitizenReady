'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'citizenready_guest_banner_dismissed'

export type GuestBannerProps = {
  /** Override default guest message (e.g. dashboard layout copy). */
  message?: string
  className?: string
}

export function GuestBanner({
  message = "You're browsing as a guest. Your progress won't be saved.",
  className,
}: GuestBannerProps) {
  // Default visible so SSR + first paint show the banner; hide only after checking dismissal.
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === '1') {
        setVisible(false)
      }
    } catch {
      /* keep visible */
    }
  }, [])

  if (!visible) return null

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* ignore */
    }
    setVisible(false)
  }

  return (
    <div
      role="region"
      aria-label="Guest mode notice"
      className={cn(
        'flex shrink-0 items-center justify-between gap-4 border-b border-amber-200 px-4 py-3 pr-2 text-sm text-amber-950',
        className
      )}
      style={{ backgroundColor: '#FFF8E1' }}
    >
      <div className="flex min-w-0 flex-1 items-start gap-2 sm:items-center">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 sm:mt-0" aria-hidden />
        <p className="min-w-0 leading-snug">{message}</p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        <Button
          asChild
          size="sm"
          className="bg-brand-red text-white hover:bg-brand-red-dark"
        >
          <Link href="/signup">Sign Up Free</Link>
        </Button>
        <Link
          href="/login"
          className="px-2 text-sm font-medium text-amber-900 underline-offset-4 hover:underline"
        >
          Login
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-md p-1.5 text-amber-800 hover:bg-amber-200/60"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
