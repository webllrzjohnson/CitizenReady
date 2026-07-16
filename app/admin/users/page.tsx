import sql from '@/lib/db'
import { getFreshSession } from '@/lib/auth/session'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { RoleToggleButton } from './role-toggle-button'
import { PremiumToggleButton } from '@/components/admin/PremiumToggleButton'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const session = await getFreshSession()

  const users = await sql`
    SELECT id, email, full_name, role, is_premium, created_at
    FROM public.profiles
    ORDER BY created_at DESC
  `

  const userIds = users.map((u: any) => u.id)
  const sessionCounts = userIds.length > 0
    ? await sql`SELECT user_id, COUNT(*) as count FROM public.quiz_sessions WHERE user_id = ANY(${sql.array(userIds)}::uuid[]) GROUP BY user_id`
    : []

  const sessionCountMap: Record<string, number> = {}
  sessionCounts.forEach((s: any) => { sessionCountMap[s.user_id] = parseInt(s.count) })

  const usersWithSessions = users.map((user: any) => ({
    ...user,
    is_premium: user.is_premium === true,
    session_count: sessionCountMap[user.id] || 0,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground mt-2">{usersWithSessions.length} registered {usersWithSessions.length === 1 ? 'user' : 'users'}</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Plus</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Total Sessions</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usersWithSessions.map((user: any) => {
            const isCurrentUser = user.id === session?.id
            const joinedDate = new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell><Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role === 'admin' ? 'Admin' : 'User'}</Badge></TableCell>
                <TableCell><Badge variant={user.is_premium ? 'default' : 'secondary'}>{user.is_premium ? 'Plus' : '—'}</Badge></TableCell>
                <TableCell>{joinedDate}</TableCell>
                <TableCell className="text-right">{user.session_count}</TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end gap-2">
                    <PremiumToggleButton userId={user.id} isPremium={user.is_premium} />
                    {!isCurrentUser && <RoleToggleButton userId={user.id} currentRole={user.role} />}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}