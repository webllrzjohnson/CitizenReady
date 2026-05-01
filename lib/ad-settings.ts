import { createPublicSupabaseClient } from '@/lib/supabase/public'

export interface AdSettings {
  adsEnabled: boolean
  clientId: string
  showToGuestsOnly: boolean
}

export async function getAdSettings(): Promise<AdSettings> {
  try {
    const supabase = createPublicSupabaseClient()
    // @ts-expect-error - site_settings added via migration
    const { data } = await supabase.from('site_settings').select('key, value')
    const map = new Map<string, string>((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]))
    return {
      adsEnabled: map.get('ads_enabled') === 'true',
      clientId: map.get('adsense_client_id') ?? '',
      showToGuestsOnly: map.get('ads_show_to_guests_only') !== 'false',
    }
  } catch {
    return { adsEnabled: false, clientId: '', showToGuestsOnly: true }
  }
}
