'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

async function requireAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || (profile as { role: string } | null)?.role !== 'admin') {
    return { error: 'Unauthorized' }
  }

  return { supabase, userId: user.id }
}

export async function toggleUserRole(userId: string, currentRole: string) {
  const adminCheck = await requireAdmin()
  if ('error' in adminCheck) {
    return { error: adminCheck.error }
  }

  const { supabase, userId: currentUserId } = adminCheck

  if (userId === currentUserId) {
    return { error: 'Cannot change your own role' }
  }

  const newRole = currentRole === 'user' ? 'admin' : 'user'

  const { error } = await supabase
    .from('profiles')
    // @ts-expect-error - Supabase type inference issue
    .update({ role: newRole })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function toggleUserPremium(userId: string, currentPremium: boolean) {
  const adminCheck = await requireAdmin()
  if ('error' in adminCheck) {
    return { error: adminCheck.error }
  }

  const { supabase } = adminCheck

  const { error } = await supabase
    .from('profiles')
    // @ts-expect-error - Supabase client narrow typing on dynamic update
    .update({ is_premium: !currentPremium })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  revalidatePath('/study/complete-questions')
  return { success: true }
}

const UpdateSiteSettingsSchema = z.object({
  ads_enabled: z.boolean(),
  adsense_client_id: z.string(),
  ads_show_to_guests_only: z.boolean(),
})

export async function updateSiteSettings(formData: FormData) {
  const adminCheck = await requireAdmin()
  if ('error' in adminCheck) {
    return { error: adminCheck.error }
  }

  const { supabase } = adminCheck

  const raw = {
    ads_enabled: formData.get('ads_enabled') === 'true',
    adsense_client_id: (formData.get('adsense_client_id') as string) ?? '',
    ads_show_to_guests_only: formData.get('ads_show_to_guests_only') === 'true',
  }

  const result = UpdateSiteSettingsSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  const entries: { key: string; value: string }[] = [
    { key: 'ads_enabled', value: String(result.data.ads_enabled) },
    { key: 'adsense_client_id', value: result.data.adsense_client_id },
    { key: 'ads_show_to_guests_only', value: String(result.data.ads_show_to_guests_only) },
  ]

  for (const entry of entries) {
    const { error } = await supabase
      .from('site_settings')
      // @ts-expect-error - site_settings table added via migration, types may lag
      .upsert({ key: entry.key, value: entry.value, updated_at: new Date().toISOString() }, { onConflict: 'key' })

    if (error) {
      return { error: `Failed to save ${entry.key}: ${error.message}` }
    }
  }

  revalidatePath('/admin/settings')
  revalidatePath('/')
  revalidatePath('/blog')
  return { success: true }
}
