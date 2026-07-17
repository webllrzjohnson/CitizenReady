import type { Metadata } from 'next'
import sql from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { PlusRequestsTable } from '@/components/admin/PlusRequestsTable'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Plus Requests' }

export default async function AdminPlusRequestsPage() {
  const rows = await sql`
    SELECT
      r.id,
      r.name,
      r.email,
      r.account_email,
      r.requested_plan,
      r.message,
      r.status,
      r.created_at,
      p.id AS matched_user_id,
      p.email AS matched_user_email,
      p.is_premium AS matched_user_is_premium,
      p.premium_expires_at AS matched_user_premium_expires_at
    FROM public.plus_access_requests r
    LEFT JOIN public.profiles p
      ON lower(p.email) = lower(COALESCE(NULLIF(r.account_email, ''), r.email))
    ORDER BY
      CASE status
        WHEN 'new' THEN 0
        WHEN 'approved' THEN 1
        WHEN 'completed' THEN 2
        WHEN 'rejected' THEN 3
        ELSE 4
      END,
      created_at DESC
  `

  const newCount = rows.filter((request: any) => request.status === 'new').length

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold">Plus Access Requests</h1>
        {newCount > 0 && (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">{newCount} new</Badge>
        )}
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        Review manual Plus access requests submitted from the public early-access form. Matched accounts can be granted Plus directly from this page.
      </p>
      <PlusRequestsTable requests={rows as any[]} />
    </div>
  )
}
