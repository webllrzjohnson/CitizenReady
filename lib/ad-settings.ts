import sql from '@/lib/db'

export interface AdSettings {
  adsEnabled: boolean
  clientId: string
  showToGuestsOnly: boolean
}

export async function getAdSettings(): Promise<AdSettings> {
  try {
    const rows = await sql`SELECT key, value FROM public.site_settings`
    const map = new Map<string, string>(rows.map((r: any) => [r.key, r.value]))
    return {
      adsEnabled: map.get('ads_enabled') === 'true',
      clientId: map.get('adsense_client_id') ?? '',
      showToGuestsOnly: map.get('ads_show_to_guests_only') !== 'false',
    }
  } catch {
    return { adsEnabled: false, clientId: '', showToGuestsOnly: true }
  }
}