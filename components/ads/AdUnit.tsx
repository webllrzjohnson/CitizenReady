'use client'

import { useEffect, useRef } from 'react'

type AdFormat = 'auto' | 'rectangle' | 'leaderboard' | 'sidebar'

interface AdUnitProps {
  slot: string
  clientId: string
  adsEnabled: boolean
  format?: AdFormat
  className?: string
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export function AdUnit({ slot, clientId, adsEnabled, format = 'auto', className }: AdUnitProps) {
  const pushed = useRef(false)

  useEffect(() => {
    if (!adsEnabled || pushed.current) return
    try {
      pushed.current = true
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // AdSense script not loaded yet
    }
  }, [adsEnabled])

  if (!adsEnabled) return null

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
