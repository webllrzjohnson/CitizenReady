'use client'

import { useState, useTransition } from 'react'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateSiteSettings } from '@/actions/admin'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'

interface AdSettingsFormProps {
  initialAdsEnabled: boolean
  initialClientId: string
  initialGuestsOnly: boolean
}

export function AdSettingsForm({ initialAdsEnabled, initialClientId, initialGuestsOnly }: AdSettingsFormProps) {
  const [adsEnabled, setAdsEnabled] = useState(initialAdsEnabled)
  const [clientId, setClientId] = useState(initialClientId)
  const [guestsOnly, setGuestsOnly] = useState(initialGuestsOnly)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSuccess(false)
    setError(null)

    const formData = new FormData()
    formData.set('ads_enabled', String(adsEnabled))
    formData.set('adsense_client_id', clientId)
    formData.set('ads_show_to_guests_only', String(guestsOnly))

    startTransition(async () => {
      const result = await updateSiteSettings(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Warning banner */}
      <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
        <p className="text-sm text-amber-800">
          <strong>Important:</strong> Ads will not display until your site is approved by Google
          AdSense. Apply at{' '}
          <a
            href="https://adsense.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-amber-900"
          >
            adsense.google.com
          </a>{' '}
          after your site is live and has content.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Google AdSense Settings</CardTitle>
          <CardDescription>
            Control how and where ads appear on CitizenReady.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Ads Enabled */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="ads-enabled" className="text-base font-medium">
                Enable ads on the website
              </Label>
              <p className="text-sm text-muted-foreground">
                When off, no ad tags are rendered anywhere on the site.
              </p>
            </div>
            <Switch
              id="ads-enabled"
              checked={adsEnabled}
              onCheckedChange={setAdsEnabled}
              aria-label="Enable ads on the website"
            />
          </div>

          <hr />

          {/* AdSense Client ID */}
          <div className="space-y-2">
            <Label htmlFor="adsense-client-id" className="text-base font-medium">
              AdSense Client ID
            </Label>
            <Input
              id="adsense-client-id"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="ca-pub-XXXXXXXXXXXXXXXX"
              aria-describedby="client-id-hint"
            />
            <p id="client-id-hint" className="text-xs text-muted-foreground">
              Find this in your Google AdSense dashboard under{' '}
              <strong>Account → Account information</strong>.
            </p>
          </div>

          <hr />

          {/* Guests Only */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="guests-only" className="text-base font-medium">
                Only show ads to non-logged-in visitors
              </Label>
              <p className="text-sm text-muted-foreground">
                Recommended — logged-in users get an ad-free experience.
              </p>
            </div>
            <Switch
              id="guests-only"
              checked={guestsOnly}
              onCheckedChange={setGuestsOnly}
              aria-label="Only show ads to non-logged-in visitors"
            />
          </div>
        </CardContent>
      </Card>

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
          Ad settings saved. Changes will appear on the site immediately.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? 'Saving…' : 'Save Ad Settings'}
      </Button>
    </form>
  )
}
