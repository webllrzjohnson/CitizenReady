import type { Metadata } from 'next'
import Link from 'next/link'
import sql from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { QuestionReportStatusButton } from '@/components/admin/QuestionReportStatusButton'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Question Reports' }

function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminQuestionReportsPage() {
  const reports = await sql`
    SELECT
      r.id,
      r.reason,
      r.status,
      r.created_at,
      q.id AS question_id,
      q.question_text,
      q.is_active,
      t.name AS topic_name,
      reporter.email AS reporter_email
    FROM public.question_issue_reports r
    JOIN public.questions q ON q.id = r.question_id
    LEFT JOIN public.topics t ON t.id = q.topic_id
    LEFT JOIN public.profiles reporter ON reporter.id = r.user_id
    ORDER BY
      CASE r.status WHEN 'open' THEN 0 WHEN 'reviewing' THEN 1 ELSE 2 END,
      r.created_at DESC
    LIMIT 100
  `

  const openCount = reports.filter((report: any) => report.status === 'open').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Question Issue Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review learner feedback about confusing, outdated, or incorrect questions.
          </p>
        </div>
        {openCount > 0 && <Badge className="w-fit bg-amber-100 text-amber-800 hover:bg-amber-100">{openCount} open</Badge>}
      </div>

      {reports.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
          No question reports yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-left">
            <thead className="border-b bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Question</th>
                <th className="px-4 py-3">Report</th>
                <th className="px-4 py-3">Reporter</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report: any) => (
                <tr key={report.id} className="border-b align-top last:border-b-0">
                  <td className="max-w-[360px] px-4 py-3">
                    <p className="text-sm font-medium text-foreground">{report.question_text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{report.topic_name || 'No topic'} · {report.is_active ? 'active' : 'inactive'}</p>
                    <Button asChild variant="link" size="sm" className="mt-1 h-auto px-0">
                      <Link href={`/admin/questions/${report.question_id}/edit`}>Edit question</Link>
                    </Button>
                  </td>
                  <td className="max-w-[360px] whitespace-pre-wrap px-4 py-3 text-sm text-muted-foreground">
                    {report.reason}
                    <p className="mt-2 text-xs">Submitted {formatDate(report.created_at)}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{report.reporter_email || 'Unknown'}</td>
                  <td className="px-4 py-3"><Badge variant={report.status === 'resolved' ? 'outline' : 'secondary'}>{report.status}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {report.status !== 'reviewing' && <QuestionReportStatusButton reportId={report.id} status="reviewing" label="Reviewing" />}
                      {report.status !== 'resolved' && <QuestionReportStatusButton reportId={report.id} status="resolved" label="Resolve" />}
                      {report.status !== 'open' && <QuestionReportStatusButton reportId={report.id} status="open" label="Reopen" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
