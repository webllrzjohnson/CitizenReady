'use client'

import { useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { markMessageRead } from '@/actions/contact'
import { cn } from '@/lib/utils'

type ContactMessage = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  is_read: boolean
  created_at: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function MessageRow({ message: initial }: { message: ContactMessage }) {
  const [expanded, setExpanded] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isRead, setIsRead] = useState(initial.is_read)

  function handleMarkRead() {
    startTransition(async () => {
      await markMessageRead(initial.id)
      setIsRead(true)
    })
  }

  return (
    <>
      <tr
        className={cn(
          'cursor-pointer border-b transition-colors hover:bg-muted/40',
          !isRead && 'border-l-4 border-l-amber-400'
        )}
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-4 py-3 font-medium text-sm">{initial.name}</td>
        <td className="px-4 py-3 text-sm text-muted-foreground">{initial.email}</td>
        <td className="px-4 py-3 text-sm">{initial.subject}</td>
        <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">
          {initial.message}
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
          {formatDate(initial.created_at)}
        </td>
        <td className="px-4 py-3">
          {isRead ? (
            <Badge variant="secondary">Read</Badge>
          ) : (
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Unread</Badge>
          )}
        </td>
      </tr>

      {expanded && (
        <tr className="bg-muted/20">
          <td colSpan={6} className="px-6 py-4">
            <div className="max-w-2xl space-y-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  From
                </span>
                <p className="text-sm">
                  {initial.name} &lt;{initial.email}&gt;
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Subject
                </span>
                <p className="text-sm">{initial.subject}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Message
                </span>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{initial.message}</p>
              </div>
              {!isRead && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleMarkRead()
                  }}
                  className="mt-1"
                >
                  {isPending ? 'Marking…' : 'Mark as Read'}
                </Button>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export function ContactMessagesTable({ messages }: { messages: ContactMessage[] }) {
  if (messages.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
        No contact messages yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left">
        <thead className="border-b bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Subject</th>
            <th className="px-4 py-3">Message</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((msg) => (
            <MessageRow key={msg.id} message={msg} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
