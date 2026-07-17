import type { Metadata } from 'next'
import sql from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { PlusRequestsTable } from '@/components/admin/PlusRequestsTable'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Plus Requests' }

export default async function AdminPlusRequestsPage() {
  const rows = await sql`
    SELECT id, name, email, account_email, requested_plan, message, status, created_at
    FROM public.plus_access_requests
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
        Review manual Plus access requests submitted from the public early-access form. Use status buttons to track approval and completion; granting Plus is still handled from Admin → Users.
      </p>
      <PlusRequestsTable requests={rows as any[]} />
    </div>
  )
}
