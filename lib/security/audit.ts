import sql from '@/lib/db'
import { buildAdminAuditMetadata, redactAuditValue } from './audit-core'

export { buildAdminAuditMetadata, redactAuditValue }

export async function writeAdminAuditLog(input: {
  actorId: string
  action: string
  targetUserId?: string | null
  metadata?: Record<string, unknown>
}) {
  const metadata = buildAdminAuditMetadata(input.metadata ?? {}) as any
  await sql`
    INSERT INTO public.admin_audit_logs (actor_id, action, target_user_id, metadata)
    VALUES (${input.actorId}::uuid, ${input.action}, ${input.targetUserId ?? null}::uuid, ${sql.json(metadata)})
  `
}
