'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import sql from '@/lib/db'
import { requireAdminSession } from '@/lib/auth/session'
import { isAiProviderId, resolveBlogDraftModel } from '@/lib/blog/ai-providers'
import { saveAiBlogSettings } from '@/lib/blog/ai-settings'
import { writeAdminAuditLog } from '@/lib/security/audit'

export type PremiumGrant = '7d' | '30d' | '90d' | '1y' | 'lifetime' | 'remove'

function premiumExpirySql(grant: PremiumGrant): string | null {
  if (grant === '7d') return '7 days'
  if (grant === '30d') return '30 days'
  if (grant === '90d') return '90 days'
  if (grant === '1y') return '1 year'
  return null
}

export async function toggleUserRole(userId: string, currentRole: string) {
  const check = await requireAdminSession()
  if ('error' in check) return { error: check.error }
  if (userId === check.userId) return { error: 'Cannot change your own role' }

  const newRole = currentRole === 'user' ? 'admin' : 'user'
  await sql`UPDATE public.profiles SET role = ${newRole}, session_version = session_version + 1 WHERE id = ${userId}::uuid`
  await writeAdminAuditLog({
    actorId: check.userId,
    action: 'user.role_updated',
    targetUserId: userId,
    metadata: { previousRole: currentRole, newRole },
  })
  revalidatePath('/admin/users')
  return { success: true }
}

export async function setUserPremiumAccess(userId: string, grant: PremiumGrant) {
  const check = await requireAdminSession()
  if ('error' in check) return { error: check.error }
  if (!['7d', '30d', '90d', '1y', 'lifetime', 'remove'].includes(grant)) return { error: 'Invalid Plus access option' }

  if (grant === 'remove') {
    await sql`
      UPDATE public.profiles
      SET is_premium = false, premium_expires_at = null
      WHERE id = ${userId}::uuid
    `
  } else if (grant === 'lifetime') {
    await sql`
      UPDATE public.profiles
      SET is_premium = true, premium_expires_at = null
      WHERE id = ${userId}::uuid
    `
  } else {
    const interval = premiumExpirySql(grant)
    await sql`
      UPDATE public.profiles
      SET is_premium = true, premium_expires_at = now() + (${interval})::interval
      WHERE id = ${userId}::uuid
    `
  }
  await writeAdminAuditLog({
    actorId: check.userId,
    action: 'user.premium_updated',
    targetUserId: userId,
    metadata: { grant },
  })
  revalidatePath('/admin/users')
  revalidatePath('/study/complete-questions')
  revalidatePath('/study/cheat-sheet')
  revalidatePath('/dashboard')
  return { success: true }
}

const UpdateSiteSettingsSchema = z.object({
  ads_enabled: z.boolean(),
  adsense_client_id: z.string(),
  ads_show_to_guests_only: z.boolean(),
})

export async function updateSiteSettings(formData: FormData) {
  const check = await requireAdminSession()
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

  await writeAdminAuditLog({
    actorId: check.userId,
    action: 'site.settings_updated',
    metadata: {
      ads_enabled: result.data.ads_enabled,
      ads_show_to_guests_only: result.data.ads_show_to_guests_only,
      adsense_client_id: result.data.adsense_client_id,
    },
  })

  revalidatePath('/admin/settings')
  revalidatePath('/')
  revalidatePath('/blog')
  return { success: true }
}

const UpdateAiBlogSettingsSchema = z.object({
  provider: z.string().trim(),
  model: z.string().trim().min(1).max(120),
  custom_model: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((s) => (s === '' ? undefined : s)),
})

export async function updateAiBlogSettings(formData: FormData) {
  const check = await requireAdminSession()
  if ('error' in check) return { error: check.error }

  const parsed = UpdateAiBlogSettingsSchema.safeParse({
    provider: formData.get('provider'),
    model: formData.get('model'),
    custom_model: formData.get('custom_model'),
  })
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Validation failed' }
  }

  if (!isAiProviderId(parsed.data.provider)) {
    return { error: 'Unsupported AI provider' }
  }

  const resolvedModel = resolveBlogDraftModel(
    parsed.data.provider,
    parsed.data.model,
    parsed.data.custom_model,
  )

  await saveAiBlogSettings({
    provider: parsed.data.provider,
    model: resolvedModel,
  })

  await writeAdminAuditLog({
    actorId: check.userId,
    action: 'site.ai_blog_settings_updated',
    metadata: { provider: parsed.data.provider, model: resolvedModel },
  })

  revalidatePath('/admin/blog/ai-draft')
  return { success: true }
}