import Link from 'next/link'
import { Flame, History, PlayCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { LearnerRetentionSummary } from '@/lib/learner-retention'

export function LearnerRetentionCard({ summary }: { summary: LearnerRetentionSummary }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-red">Keep your momentum</p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">Continue where you left off</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Flame className="h-4 w-4 text-amber-500" aria-hidden />
              <span>{summary.studyStreakDays} day study streak</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <History className="h-4 w-4 text-brand-navy" aria-hidden />
              <span>Last activity: {summary.lastActivityLabel}</span>
            </div>
          </div>
        </div>
        <Button asChild className="bg-brand-red text-white hover:bg-brand-red-dark">
          <Link href={summary.continueHref}>
            <PlayCircle className="mr-2 h-4 w-4" aria-hidden />
            {summary.continueLabel}
          </Link>
        </Button>
      </div>
    </div>
  )
}
