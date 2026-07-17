'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import sql from '@/lib/db'
import { requireAdminSession } from '@/lib/auth/session'
import { checkRateLimit, getClientFingerprint } from '@/lib/security/rate-limit'
import { writeAdminAuditLog } from '@/lib/security/audit'
import { PLUS_REQUEST_PLANS, PLUS_REQUEST_STATUSES, normalizePlusRequestPlan } from '@/lib/plus-requests'

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
    RETURNING id, email, account_email, requested_plan, status
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

  revalidatePath('/admin/plus-requests')
  revalidatePath('/admin/audit-logs')
  return { success: true }
}
