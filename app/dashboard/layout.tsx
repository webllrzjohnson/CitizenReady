import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from './DashboardSidebar'
import { GuestBanner } from '@/components/layout/GuestBanner'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isGuest = !user

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {isGuest && (
        <GuestBanner message="You are using CitizenReady as a guest. Sign up free to save your progress and track improvements." />
      )}
      <div className="flex flex-1 flex-col lg:flex-row">
        <DashboardSidebar isGuest={isGuest} />
        <main className="flex-1 bg-[#f8f7f5] p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
