import sql from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const [
    totalQuestionsRows,
    activeQuestionsRows,
    totalTopicsRows,
    totalUsersRows,
    completedSessionsRows,
    recentSessions,
  ] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM public.questions`,
    sql`SELECT COUNT(*) as count FROM public.questions WHERE is_active = true`,
    sql`SELECT COUNT(*) as count FROM public.topics`,
    sql`SELECT COUNT(*) as count FROM public.profiles`,
    sql`SELECT COUNT(*) as count FROM public.quiz_sessions WHERE completed_at IS NOT NULL`,
    sql`SELECT id, type, score, total_q, completed_at, user_id FROM public.quiz_sessions WHERE completed_at IS NOT NULL ORDER BY completed_at DESC LIMIT 5`,
  ])

  const totalQuestions = parseInt(totalQuestionsRows[0]?.count ?? '0')
  const activeQuestions = parseInt(activeQuestionsRows[0]?.count ?? '0')
  const totalTopics = parseInt(totalTopicsRows[0]?.count ?? '0')
  const totalUsers = parseInt(totalUsersRows[0]?.count ?? '0')
  const completedSessions = parseInt(completedSessionsRows[0]?.count ?? '0')

  const userIds = recentSessions.map((s: any) => s.user_id)
  const sessionProfiles = userIds.length > 0
    ? await sql`SELECT id, email, full_name FROM public.profiles WHERE id = ANY(${sql.array(userIds)}::uuid[])`
    : []

  const profileMap: Record<string, { email: string; full_name: string | null }> = {}
  sessionProfiles.forEach((p: any) => { profileMap[p.id] = { email: p.email, full_name: p.full_name } })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of CitizenReady platform</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Questions</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalQuestions}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Active Questions</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{activeQuestions}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Topics</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalTopics}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Users</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalUsers}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Completed Sessions</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{completedSessions}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Sessions</CardTitle></CardHeader>
        <CardContent>
          {recentSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sessions yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSessions.map((session: any) => {
                  const profile = profileMap[session.user_id]
                  return (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{profile?.full_name ?? profile?.email ?? 'Unknown'}</TableCell>
                      <TableCell><Badge variant="outline">{session.type === 'practice' ? 'Practice' : 'Mock Exam'}</Badge></TableCell>
                      <TableCell>{session.score !== null && session.total_q ? `${session.score} / ${session.total_q}` : 'N/A'}</TableCell>
                      <TableCell>{new Date(session.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}