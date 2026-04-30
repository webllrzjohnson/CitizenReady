import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AdminNav } from '@/components/admin/AdminNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile as { role: string } | null)?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/40 p-6">
        <div className="mb-8">
          <Link href="/admin" className="text-xl font-bold">
            CitizenReady Admin
          </Link>
        </div>

        <AdminNav />
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
