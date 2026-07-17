import Link from 'next/link'
import sql from '@/lib/db'
import { formatAdminDashboardCount } from '@/lib/admin-dashboard'
import { formatAuditActionLabel, getAuditActionBadgeVariant } from '@/lib/security/audit-view'
import { formatPremiumExpiry } from '@/lib/premium'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

function countFrom(rows: any[]): number {
  return parseInt(rows[0]?.count ?? '0')
}

function formatDate(value: string | Date | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function actorName(row: any) {
  return row.actor_full_name || row.actor_email || 'System / deleted user'
}

function StatCard({
  title,
  value,
  description,
  href,
  cta,
  urgent = false,
}: {
  title: string
  value: number
  description: string
  href: string
  cta: string
  urgent?: boolean
}) {
  return (
    <Card className={urgent && value > 0 ? 'ring-amber-300' : undefined}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {urgent && value > 0 && <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Needs attention</Badge>}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{formatAdminDashboardCount(value)}</div>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href={href}>{cta}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default async function AdminPage() {
  const [
    newPlusRequestRows,
    unreadContactRows,
    totalUsersRows,
    activePlusUsersRows,
    activeQuestionsRows,
    publishedBlogRows,
    completedSessionsRows,
    recentAuditLogs,
  ] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM public.plus_access_requests WHERE status = 'new'`,
    sql`SELECT COUNT(*) as count FROM public.contact_messages WHERE is_read = false`,
    sql`SELECT COUNT(*) as count FROM public.profiles`,
    sql`
      SELECT COUNT(*) as count
      FROM public.profiles
      WHERE is_premium = true
        AND (premium_expires_at IS NULL OR premium_expires_at > now())
    `,
    sql`SELECT COUNT(*) as count FROM public.questions WHERE is_active = true`,
    sql`SELECT COUNT(*) as count FROM public.blog_posts WHERE status = 'published'`,
    sql`SELECT COUNT(*) as count FROM public.quiz_sessions WHERE completed_at IS NOT NULL`,
    sql`
      SELECT
        l.id,
        l.action,
        l.target_user_id,
        l.created_at,
        actor.email AS actor_email,
        actor.full_name AS actor_full_name,
        target.email AS target_email,
        target.full_name AS target_full_name
      FROM public.admin_audit_logs l
      LEFT JOIN public.profiles actor ON actor.id = l.actor_id
      LEFT JOIN public.profiles target ON target.id = l.target_user_id
      ORDER BY l.created_at DESC
      LIMIT 5
    `,
  ])

  const newPlusRequests = countFrom(newPlusRequestRows)
  const unreadContactMessages = countFrom(unreadContactRows)
  const totalUsers = countFrom(totalUsersRows)
  const activePlusUsers = countFrom(activePlusUsersRows)
  const activeQuestions = countFrom(activeQuestionsRows)
  const publishedBlogPosts = countFrom(publishedBlogRows)
  const completedSessions = countFrom(completedSessionsRows)

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Daily operational overview for CitizenReady: requests, messages, users, content, and recent admin activity.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm"><Link href="/admin/plus-requests">Plus Requests</Link></Button>
          <Button asChild variant="outline" size="sm"><Link href="/admin/audit-logs">Audit Logs</Link></Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="New Plus Requests"
          value={newPlusRequests}
          description="Manual Plus requests waiting for review or grant."
          href="/admin/plus-requests"
          cta="Review requests"
          urgent
        />
        <StatCard
          title="Unread Messages"
          value={unreadContactMessages}
          description="Contact messages that still need attention."
          href="/admin/contact-messages"
          cta="Open inbox"
          urgent
        />
        <StatCard
          title="Users / Active Plus"
          value={totalUsers}
          description={`${formatAdminDashboardCount(activePlusUsers)} active Plus users`}
          href="/admin/users"
          cta="Manage users"
        />
        <StatCard
          title="Completed Sessions"
          value={completedSessions}
          description="Completed practice or mock exam sessions."
          href="/admin/users"
          cta="View users"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Content Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Active Questions</p>
                <p className="text-sm text-muted-foreground">Questions available for practice and study flows.</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{formatAdminDashboardCount(activeQuestions)}</div>
                <Button asChild variant="link" size="sm" className="px-0"><Link href="/admin/questions">Manage</Link></Button>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Published Blog Posts</p>
                <p className="text-sm text-muted-foreground">Public SEO/support content currently published.</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{formatAdminDashboardCount(publishedBlogPosts)}</div>
                <Button asChild variant="link" size="sm" className="px-0"><Link href="/admin/blog">Manage</Link></Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Audit Activity</CardTitle>
            <Button asChild variant="outline" size="sm"><Link href="/admin/audit-logs">View all</Link></Button>
          </CardHeader>
          <CardContent>
            {recentAuditLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No audit activity yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAuditLogs.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant={getAuditActionBadgeVariant(log.action)}>
                          {formatAuditActionLabel(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{actorName(log)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.target_full_name || log.target_email || '—'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(log.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
