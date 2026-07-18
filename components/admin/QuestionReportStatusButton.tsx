'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateQuestionIssueReportStatus } from '@/actions/questions'
import { Button } from '@/components/ui/button'

type ReportStatus = 'open' | 'reviewing' | 'resolved'

export function QuestionReportStatusButton({
  reportId,
  status,
  label,
}: {
  reportId: string
  status: ReportStatus
  label: string
}) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    setMessage(null)
    startTransition(async () => {
      const result = await updateQuestionIssueReportStatus(reportId, status)
      if (result.error) {
        setMessage(result.error)
      } else {
        setMessage('Updated')
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-1">
      <Button type="button" size="sm" variant="outline" onClick={handleClick} disabled={isPending}>
        {isPending ? 'Updating…' : label}
      </Button>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  )
}
