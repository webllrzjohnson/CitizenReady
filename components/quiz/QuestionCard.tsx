'use client'

import type { Question } from '@/types'
import { Badge } from '@/components/ui/badge'
import { QuizOptionRow, type QuizOptionVisual } from '@/components/quiz/QuizOptionRow'

export type QuestionCardProps = {
  question: Question
  selectedKeys: string[]
  onSelect: (questionId: string, answerKey: string) => void
  showResults?: boolean
  disabled?: boolean
  /** e.g. difficulty badge — rendered below the question title */
  afterTitle?: React.ReactNode
}

function getOptionVisual(
  optionKey: string,
  selectedKeys: string[],
  correctAnswers: string[],
  showResults: boolean
): QuizOptionVisual {
  const isSelected = selectedKeys.includes(optionKey)
  const isCorrect = correctAnswers.includes(optionKey)

  if (showResults) {
    if (isCorrect) return 'correct'
    if (isSelected && !isCorrect) return 'incorrect'
    return 'default'
  }
  if (isSelected) return 'selected'
  return 'default'
}

export default function QuestionCard({
  question,
  selectedKeys,
  onSelect,
  showResults = false,
  disabled = false,
  afterTitle,
}: QuestionCardProps) {
  const correctAnswers = question.correct_answers ?? []

  return (
    <div className="rounded-xl border border-surface-border bg-surface-card p-6 shadow-sm md:p-8">
      <div className="mb-6 space-y-3">
        <h2 className="text-xl font-bold leading-snug text-brand-navy md:text-2xl">
          {question.question_text}
        </h2>
        {(question.type === 'boolean' || afterTitle) && (
          <div className="flex flex-wrap items-center gap-2">
            {question.type === 'boolean' && (
              <Badge variant="outline" className="border-surface-border text-[#424242]">
                True/False
              </Badge>
            )}
            {afterTitle}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {question.options?.map((option, index) => {
          const visual = getOptionVisual(
            option.key,
            selectedKeys,
            correctAnswers,
            showResults
          )
          const interactive = !disabled && !showResults

          return (
            <QuizOptionRow
              key={`${question.id}-${option.key ?? index}`}
              optionKey={option.key}
              text={option.text}
              visual={visual}
              interactive={interactive}
              disabled={disabled}
              onClick={
                interactive ? () => onSelect(question.id, option.key) : undefined
              }
            />
          )
        })}
      </div>
    </div>
  )
}
