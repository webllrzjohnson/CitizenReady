'use client'

import { useState, useTransition } from 'react'
import { unstable_rethrow, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, ArrowRight } from 'lucide-react'
import { startPracticeSession } from '@/actions/quiz'
import { cn } from '@/lib/utils'

interface TopicCardProps {
  id: string
  name: string
  description: string | null
  slug: string
  questionCount: number
  bestScore: number | null
  bestTotal: number | null
  sortOrder: number
}

export function TopicCard({
  id,
  name,
  description,
  slug,
  questionCount,
  bestScore,
  bestTotal,
  sortOrder,
}: TopicCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleStartPractice = () => {
    startTransition(() => {
      void (async () => {
        try {
          const result = await startPracticeSession(id, slug)

          if (result.error) {
            toast.error(result.error)
            return
          }

          if (result.success && result.questions?.length) {
            if (result.sessionId) {
              router.push(`/dashboard/practice/${slug}?session=${result.sessionId}`)
            } else if (result.isGuest) {
              router.push(`/dashboard/practice/${slug}`)
            }
          }
        } catch (error) {
          unstable_rethrow(error)
          toast.error('Failed to start practice session')
          console.error(error)
        }
      })()
    })
  }

  return (
    <div
      className={cn(
        'group flex flex-col rounded-xl border border-surface-border bg-surface-card p-5 shadow-sm transition-all duration-200',
        'hover:scale-[1.02] hover:shadow-lg',
        isPending && 'pointer-events-none opacity-80'
      )}
    >
      <div className="mb-4 flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-red text-lg font-bold text-white">
          {sortOrder}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-brand-navy">{name}</h3>
          <p className="mt-1 line-clamp-3 text-sm text-[#424242]">
            {description || 'Practice questions for this chapter.'}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full bg-brand-red-light px-3 py-1 text-xs font-semibold text-brand-red">
          {questionCount} {questionCount === 1 ? 'question' : 'questions'}
        </span>
        {bestScore !== null && bestTotal !== null && (
          <span className="text-xs font-medium text-[#424242]">
            Best: {bestScore}/{bestTotal}
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-end border-t border-surface-border pt-4">
        <Button
          variant="ghost"
          className="h-auto p-0 font-semibold text-brand-red hover:bg-transparent hover:text-brand-red-dark"
          onClick={handleStartPractice}
          disabled={questionCount === 0 || isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : questionCount === 0 ? (
            'No questions'
          ) : (
            <>
              Start Practice
              <ArrowRight className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
