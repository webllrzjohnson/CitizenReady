import Link from 'next/link'
import sql from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  formatAuditActionLabel,
  formatAuditMetadata,
  getAuditActionBadgeVariant,
} from '@/lib/security/audit-view'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ action?: string; actor?: string; target?: string; page?: string }>

type AuditLogRow = {
  id: string
  action: string
  metadata: unknown
  created_at: string | Date
  actor_id: string | null
  actor_email: string | null
  actor_full_name: string | null
  target_user_id: string | null
  target_email: string | null
  target_full_name: string | null
}

function formatPerson(name: string | null, email: string | null): string {
  if (name && email) return `${name} (${email})`
  return name || email || 'Deleted user'
}

function buildQueryString(params: Record<string, string | undefined>) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value && value !== 'all') query.set(key, value)
  })
  const text = query.toString()
  return text ? `?${text}` : ''
}

export default async function AdminAuditLogsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const actionFilter = params.action || 'all'
  const actorFilter = params.actor || ''
  const targetFilter = params.target || ''
  const page = Math.max(1, parseInt(params.page || '1'))
  const perPage = 50
  const offset = (page - 1) * perPage

  const conditions: string[] = []
  const values: any[] = []
  let paramIdx = 1

  if (actionFilter && actionFilter !== 'all') {
    conditions.push(`l.action = $${paramIdx++}`)
    values.push(actionFilter)
  }

  if (actorFilter) {
    conditions.push(`(actor.email ILIKE $${paramIdx} OR actor.full_name ILIKE $${paramIdx})`)
    values.push(`%${actorFilter}%`)
    paramIdx += 1
  }

  if (targetFilter) {
    conditions.push(`(target.email ILIKE $${paramIdx} OR target.full_name ILIKE $${paramIdx})`)
    values.push(`%${targetFilter}%`)
    paramIdx += 1
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const [logs, countRows, actionRows] = await Promise.all([
    sql.unsafe(`
      SELECT
        l.id,
        l.action,
        l.metadata,
        l.created_at,
        l.actor_id,
        actor.email AS actor_email,
        actor.full_name AS actor_full_name,
        l.target_user_id,
        target.email AS target_email,
        target.full_name AS target_full_name
      FROM public.admin_audit_logs l
      LEFT JOIN public.profiles actor ON actor.id = l.actor_id
      LEFT JOIN public.profiles target ON target.id = l.target_user_id
      ${whereClause}
      ORDER BY l.created_at DESC
      LIMIT ${perPage} OFFSET ${offset}
    `, values) as Promise<AuditLogRow[]>,
    sql.unsafe(`
      SELECT COUNT(*) as count
      FROM public.admin_audit_logs l
      LEFT JOIN public.profiles actor ON actor.id = l.actor_id
      LEFT JOIN public.profiles target ON target.id = l.target_user_id
      ${whereClause}
    `, values),
    sql`SELECT DISTINCT action FROM public.admin_audit_logs ORDER BY action`,
  ])

  const count = parseInt(countRows[0]?.count ?? '0')
  const totalPages = Math.max(1, Math.ceil(count / perPage))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="mt-2 text-muted-foreground">
          Review sensitive admin actions such as role changes, Plus grants, and settings updates.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]" action="/admin/audit-logs">
            <div className="space-y-1">
              <label htmlFor="audit-action" className="text-xs font-medium text-muted-foreground">Action</label>
              <select
                id="audit-action"
                name="action"
                defaultValue={actionFilter}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">All actions</option>
                {actionRows.map((row: any) => (
                  <option key={row.action} value={row.action}>{formatAuditActionLabel(row.action)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="audit-actor" className="text-xs font-medium text-muted-foreground">Actor</label>
              <input
                id="audit-actor"
                name="actor"
                defaultValue={actorFilter}
                placeholder="Admin name or email"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="audit-target" className="text-xs font-medium text-muted-foreground">Target user</label>
              <input
                id="audit-target"
                name="target"
                defaultValue={targetFilter}
                placeholder="Target name or email"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit">Apply</Button>
              <Button variant="outline" asChild><Link href="/admin/audit-logs">Reset</Link></Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Metadata</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No audit logs found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => {
                const metadata = formatAuditMetadata(log.metadata)
                return (
                  <TableRow key={log.id}>
                    <TableCell className="min-w-[150px] text-sm text-muted-foreground">
                      {new Date(log.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getAuditActionBadgeVariant(log.action)}>
                        {formatAuditActionLabel(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[260px] whitespace-normal">
                      {formatPerson(log.actor_full_name, log.actor_email)}
                    </TableCell>
                    <TableCell className="max-w-[260px] whitespace-normal">
                      {log.target_user_id ? formatPerson(log.target_full_name, log.target_email) : '—'}
                    </TableCell>
                    <TableCell className="max-w-[360px] whitespace-normal">
                      {metadata.length === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          {metadata.map((item) => <li key={item}>{item}</li>)}
                        </ul>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing {logs.length} of {count} logs</span>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/audit-logs${buildQueryString({ action: actionFilter, actor: actorFilter, target: targetFilter, page: String(page - 1) })}`}>
                  Previous
                </Link>
              </Button>
            )}
            <span>Page {page} of {totalPages}</span>
            {page < totalPages && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/audit-logs${buildQueryString({ action: actionFilter, actor: actorFilter, target: targetFilter, page: String(page + 1) })}`}>
                  Next
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
