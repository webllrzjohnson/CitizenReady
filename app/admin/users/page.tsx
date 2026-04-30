import { createClient } from '@/lib/supabase/server'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { RoleToggleButton } from './role-toggle-button'

type UserWithSessions = {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
  session_count: number
}

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false })

  const userIds = (users ?? []).map((u: any) => u.id)

  const { data: sessionCounts } = await supabase
    .from('quiz_sessions')
    .select('user_id')
    .in('user_id', userIds)

  const sessionCountMap: Record<string, number> = {}
  sessionCounts?.forEach((session: any) => {
    sessionCountMap[session.user_id] = (sessionCountMap[session.user_id] || 0) + 1
  })

  const usersWithSessions: UserWithSessions[] = (users ?? []).map((user: any) => ({
    ...user,
    session_count: sessionCountMap[user.id] || 0,
  }))

  const totalUsers = usersWithSessions.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground mt-2">
          {totalUsers} registered {totalUsers === 1 ? 'user' : 'users'}
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Total Sessions</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usersWithSessions.map((user) => {
            const isCurrentUser = user.id === currentUser?.id
            const joinedDate = new Date(user.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })

            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.full_name || 'N/A'}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role === 'admin' ? 'Admin' : 'User'}
                  </Badge>
                </TableCell>
                <TableCell>{joinedDate}</TableCell>
                <TableCell className="text-right">{user.session_count}</TableCell>
                <TableCell className="text-right">
                  {!isCurrentUser && (
                    <RoleToggleButton
                      userId={user.id}
                      currentRole={user.role}
                    />
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
