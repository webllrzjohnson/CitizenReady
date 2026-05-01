import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { AdSettingsForm } from '@/components/admin/AdSettingsForm'

export const metadata: Metadata = {
  title: 'Ad Settings',
}

export default async function AdminAdSettingsPage() {
  const supabase = await createClient()

  const { data } = await supabase.from('site_settings').select('key, value')
  const map = new Map<string, string>(
    ((data ?? []) as { key: string; value: string }[]).map((r) => [r.key, r.value]),
  )

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Ad Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage Google AdSense integration for CitizenReady.
        </p>
      </div>

      <AdSettingsForm
        initialAdsEnabled={map.get('ads_enabled') === 'true'}
        initialClientId={map.get('adsense_client_id') ?? ''}
        initialGuestsOnly={map.get('ads_show_to_guests_only') !== 'false'}
      />
    </div>
  )
}
