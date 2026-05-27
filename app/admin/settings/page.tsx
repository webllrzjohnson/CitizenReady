import type { Metadata } from 'next'
import sql from '@/lib/db'
import { AdSettingsForm } from '@/components/admin/AdSettingsForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Ad Settings' }

export default async function AdminAdSettingsPage() {
  const rows = await sql`SELECT key, value FROM public.site_settings`
  const map = new Map(rows.map((r: any) => [r.key, r.value]))

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Ad Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage Google AdSense integration for CitizenReady.</p>
      </div>
      <AdSettingsForm
        initialAdsEnabled={map.get('ads_enabled') === 'true'}
        initialClientId={map.get('adsense_client_id') ?? ''}
        initialGuestsOnly={map.get('ads_show_to_guests_only') !== 'false'}
      />
    </div>
  )
}