'use client'

import { useState, useTransition } from 'react'
import { unstable_rethrow, useRouter } from 'next/navigation'
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
        'group flex flex-col rounded-[12px] border border-[#E0E0E0] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow duration-200',
        'hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]',
        isPending && 'pointer-events-none opacity-80'
      )}
    >
      <div className="mb-4 flex gap-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8192C] text-sm font-bold text-white">
          {sortOrder}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-[#1B2A4A]">{name}</h3>
          <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-[#6B7280]">
            {description || 'Practice questions for this chapter.'}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="badge-grey">
          {questionCount} {questionCount === 1 ? 'question' : 'questions'}
        </span>
        {bestScore !== null && bestTotal !== null && (
          <span className="text-xs font-medium text-[#4A4A4A]">
            Best: {bestScore}/{bestTotal}
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-end border-t border-[#E0E0E0] pt-4">
        <button
          type="button"
          className={cn(
            'inline-flex items-center text-sm font-semibold text-[#E8192C] transition-colors hover:text-[#C41020]',
            'disabled:pointer-events-none disabled:opacity-50'
          )}
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
        </button>
      </div>
    </div>
  )
}
