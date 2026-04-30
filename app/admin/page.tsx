import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    { count: totalQuestions },
    { count: activeQuestions },
    { count: totalTopics },
    { count: totalUsers },
    { count: completedSessions },
  ] = await Promise.all([
    supabase.from('questions').select('*', { count: 'exact', head: true }),
    supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
    supabase.from('topics').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('quiz_sessions')
      .select('*', { count: 'exact', head: true })
      .not('completed_at', 'is', null),
  ])

  // Fetch recent sessions
  const { data: recentSessions, error: sessionsError } = await supabase
    .from('quiz_sessions')
    .select('id, type, score, total_q, completed_at, user_id')
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(5)

  console.log('recent sessions:', recentSessions)
  console.log('sessions error:', sessionsError)

  // Fetch profiles for those users separately
  const userIds = (recentSessions as Array<{ user_id: string }> | null)?.map(s => s.user_id) ?? []

  const { data: sessionProfiles } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .in('id', userIds)

  // Build a profile map
  const profileMap: Record<string, { email: string; full_name: string | null }> = {};
  (sessionProfiles as Array<{ id: string; email: string; full_name: string | null }> | null)?.forEach(p => {
    profileMap[p.id] = { email: p.email, full_name: p.full_name }
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of CitizenReady platform
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestions || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeQuestions || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTopics || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSessions || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {!recentSessions || recentSessions.length === 0 ? (
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
                      <TableCell className="font-medium">
                        {profile?.full_name ?? profile?.email ?? 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {session.type === 'practice' ? 'Practice' : 'Mock Exam'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {session.score !== null && session.total_q 
                          ? `${session.score} / ${session.total_q}` 
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {new Date(session.completed_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </TableCell>
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
