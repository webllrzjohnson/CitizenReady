import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ContactMessagesTable } from '@/components/admin/ContactMessagesTable'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Contact Messages',
}

export default async function AdminContactMessagesPage() {
  const supabase = await createClient()

  const { data: messages } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  const rows = (messages ?? []) as {
    id: string
    name: string
    email: string
    subject: string
    message: string
    is_read: boolean
    created_at: string
  }[]

  const unreadCount = rows.filter((m) => !m.is_read).length

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold">Contact Messages</h1>
        {unreadCount > 0 && (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            {unreadCount} unread
          </Badge>
        )}
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        Click any row to expand and read the full message. Unread messages are highlighted with an
        amber border.
      </p>

      <ContactMessagesTable messages={rows} />
    </div>
  )
}
