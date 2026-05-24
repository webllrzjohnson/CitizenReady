'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth/session'

async function requireAdmin() {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }
  if (session.role !== 'admin') return { error: 'Unauthorized' }
  return { userId: session.id }
}

export async function toggleUserRole(userId: string, currentRole: string) {
  const check = await requireAdmin()
  if ('error' in check) return { error: check.error }
  if (userId === check.userId) return { error: 'Cannot change your own role' }

  const newRole = currentRole === 'user' ? 'admin' : 'user'
  await sql`UPDATE public.profiles SET role = ${newRole} WHERE id = ${userId}::uuid`
  revalidatePath('/admin/users')
  return { success: true }
}

export async function toggleUserPremium(userId: string, currentPremium: boolean) {
  const check = await requireAdmin()
  if ('error' in check) return { error: check.error }

  await sql`UPDATE public.profiles SET is_premium = ${!currentPremium} WHERE id = ${userId}::uuid`
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
  const check = await requireAdmin()
  if ('error' in check) return { error: check.error }

  const raw = {
    ads_enabled: formData.get('ads_enabled') === 'true',
    adsense_client_id: (formData.get('adsense_client_id') as string) ?? '',
    ads_show_to_guests_only: formData.get('ads_show_to_guests_only') === 'true',
  }

  const result = UpdateSiteSettingsSchema.safeParse(raw)
  if (!result.success) return { error: result.error.errors[0].message }

  const entries = [
    { key: 'ads_enabled', value: String(result.data.ads_enabled) },
    { key: 'adsense_client_id', value: result.data.adsense_client_id },
    { key: 'ads_show_to_guests_only', value: String(result.data.ads_show_to_guests_only) },
  ]

  for (const entry of entries) {
    await sql`
      INSERT INTO public.site_settings (key, value, updated_at)
      VALUES (${entry.key}, ${entry.value}, now())
      ON CONFLICT (key) DO UPDATE SET value = ${entry.value}, updated_at = now()
    `
  }

  revalidatePath('/admin/settings')
  revalidatePath('/')
  revalidatePath('/blog')
  return { success: true }
}