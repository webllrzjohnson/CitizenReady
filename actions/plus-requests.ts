'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import sql from '@/lib/db'
import { requireAdminSession } from '@/lib/auth/session'
import { checkRateLimit, getClientFingerprint } from '@/lib/security/rate-limit'
import { writeAdminAuditLog } from '@/lib/security/audit'
import {
  buildPlusAccessGrantedEmail,
  buildPlusRequestNotificationEmail,
  buildPlusRequestStatusEmail,
  sendAdminNotification,
  sendUserNotification,
} from '@/lib/email'
import {
  formatPlusRequestPlanLabel,
  PLUS_REQUEST_PLANS,
  PLUS_REQUEST_STATUSES,
  normalizePlusRequestPlan,
  plusRequestPlanToPremiumGrant,
  type PlusRequestPremiumGrant,
} from '@/lib/plus-requests'

const plusRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Please enter a valid email address'),
  accountEmail: z.string().email('Please enter a valid account email').or(z.literal('')).optional(),
  requestedPlan: z.enum(PLUS_REQUEST_PLANS, { errorMap: () => ({ message: 'Choose a Plus access option' }) }),
  message: z.string().max(1000, 'Message must be 1000 characters or less').optional(),
})

const updateStatusSchema = z.object({
  id: z.string().uuid('Invalid request id'),
  status: z.enum(PLUS_REQUEST_STATUSES),
})

const grantPlusRequestSchema = z.object({
  id: z.string().uuid('Invalid request id'),
  grant: z.enum(['7d', '30d', '1y', 'lifetime']),
})

function premiumExpirySql(grant: PlusRequestPremiumGrant): string | null {
  if (grant === '7d') return '7 days'
  if (grant === '30d') return '30 days'
  if (grant === '1y') return '1 year'
  return null
}

export async function submitPlusRequest(formData: FormData) {
  const parsed = plusRequestSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    accountEmail: formData.get('accountEmail') || '',
    requestedPlan: normalizePlusRequestPlan(formData.get('requestedPlan')),
    message: formData.get('message') || '',
  })

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Validation error' }

  const { name, email, accountEmail, requestedPlan, message } = parsed.data
  const limit = await checkRateLimit({
    scope: 'plus-request:submit',
    identity: `${email}:${await getClientFingerprint()}`,
    maxAttempts: 3,
    windowSeconds: 60 * 60,
  })
  if (!limit.success) return { error: limit.error }

  await sql`
    INSERT INTO public.plus_access_requests (name, email, account_email, requested_plan, message)
    VALUES (${name}, ${email}, ${accountEmail || null}, ${requestedPlan}, ${message || null})
  `
  await sendAdminNotification(buildPlusRequestNotificationEmail({
    name,
    email,
    accountEmail,
    requestedPlanLabel: formatPlusRequestPlanLabel(requestedPlan),
    message,
  }))

  return { success: true, message: 'Thanks! Your Plus access request was sent.', name }
}

export async function updatePlusRequestStatus(formData: FormData) {
  const admin = await requireAdminSession()
  if ('error' in admin) return { error: admin.error }

  const parsed = updateStatusSchema.safeParse({
    id: formData.get('id'),
    status: formData.get('status'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Validation error' }

  const rows = await sql`
    UPDATE public.plus_access_requests
    SET status = ${parsed.data.status}, updated_at = now()
    WHERE id = ${parsed.data.id}::uuid
    RETURNING id, name, email, account_email, requested_plan, status
  `
  const request = rows[0]
  if (!request) return { error: 'Request not found' }

  await writeAdminAuditLog({
    actorId: admin.userId,
    action: 'plus_request.status_updated',
    metadata: {
      requestId: request.id,
      email: request.email,
      accountEmail: request.account_email,
      requestedPlan: request.requested_plan,
      status: request.status,
    },
  })

  if (request.status === 'approved' || request.status === 'rejected' || request.status === 'completed') {
    await sendUserNotification(request.email, buildPlusRequestStatusEmail({
      name: request.name,
      status: request.status,
      requestedPlanLabel: formatPlusRequestPlanLabel(request.requested_plan),
    }))
  }

  revalidatePath('/admin/plus-requests')
  revalidatePath('/admin/audit-logs')
  return { success: true }
}

export async function grantPlusForRequest(formData: FormData) {
  const admin = await requireAdminSession()
  if ('error' in admin) return { error: admin.error }

  const parsed = grantPlusRequestSchema.safeParse({
    id: formData.get('id'),
    grant: formData.get('grant'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Validation error' }

  const rows = await sql`
    SELECT
      r.id,
      r.name,
      r.email,
      r.account_email,
      r.requested_plan,
      r.status,
      p.id AS user_id,
      p.email AS user_email
    FROM public.plus_access_requests r
    LEFT JOIN public.profiles p
      ON lower(p.email) = lower(COALESCE(NULLIF(r.account_email, ''), r.email))
    WHERE r.id = ${parsed.data.id}::uuid
    LIMIT 1
  `
  const request = rows[0]
  if (!request) return { error: 'Request not found' }
  if (!request.user_id) return { error: 'No matching user account found' }

  const grant = parsed.data.grant
  const interval = premiumExpirySql(grant)
  if (grant === 'lifetime') {
    await sql`
      UPDATE public.profiles
      SET is_premium = true, premium_expires_at = null
      WHERE id = ${request.user_id}::uuid
    `
  } else {
    await sql`
      UPDATE public.profiles
      SET is_premium = true, premium_expires_at = now() + (${interval})::interval
      WHERE id = ${request.user_id}::uuid
    `
  }

  await sql`
    UPDATE public.plus_access_requests
    SET status = 'completed', updated_at = now()
    WHERE id = ${request.id}::uuid
  `

  await writeAdminAuditLog({
    actorId: admin.userId,
    action: 'plus_request.access_granted',
    targetUserId: request.user_id,
    metadata: {
      requestId: request.id,
      email: request.email,
      accountEmail: request.account_email,
      matchedUserEmail: request.user_email,
      requestedPlan: request.requested_plan,
      defaultGrant: plusRequestPlanToPremiumGrant(request.requested_plan),
      grant,
    },
  })

  await sendUserNotification(request.email, buildPlusAccessGrantedEmail({
    name: request.name,
    grantLabel: formatPlusRequestPlanLabel(request.requested_plan),
    accountEmail: request.user_email,
  }))

  revalidatePath('/admin/plus-requests')
  revalidatePath('/admin/users')
  revalidatePath('/admin/audit-logs')
  revalidatePath('/study/complete-questions')
  revalidatePath('/study/cheat-sheet')
  revalidatePath('/dashboard')
  return { success: true }
}
