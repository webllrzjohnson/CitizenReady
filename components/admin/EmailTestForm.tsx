'use client'

import { useState, useTransition } from 'react'
import { sendAdminEmailTest } from '@/actions/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, MailWarning } from 'lucide-react'

export function EmailTestForm() {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit() {
    setSuccess(false)
    setError(null)
    startTransition(async () => {
      const result = await sendAdminEmailTest()
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email notifications</CardTitle>
        <CardDescription>
          Send a test email to the configured admin notification inbox to confirm SMTP is working.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
            Test email sent. Check the configured admin inbox.
          </div>
        )}
        {error && (
          <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <MailWarning className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        )}
        <Button type="button" onClick={handleSubmit} disabled={isPending}>
          {isPending ? 'Sending…' : 'Send test email'}
        </Button>
      </CardContent>
    </Card>
  )
}
