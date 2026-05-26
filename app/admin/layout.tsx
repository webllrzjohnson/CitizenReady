import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AdminNav } from '@/components/admin/AdminNav'
import sql from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'admin') redirect('/dashboard')

  const unreadRows = await sql`
    SELECT COUNT(*) as count FROM public.contact_messages WHERE is_read = false
  `
  const unreadCount = parseInt(unreadRows[0]?.count ?? '0')

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/40 p-6">
        <div className="mb-8">
          <Link href="/admin" className="text-xl font-bold">CitizenReady Admin</Link>
        </div>
        <AdminNav unreadContactCount={unreadCount} />
      </aside>
      <div className="flex-1 p-8">{children}</div>
    </div>
  )
}