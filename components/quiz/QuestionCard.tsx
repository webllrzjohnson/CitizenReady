'use client'

import { useState, useTransition } from 'react'
import type { Question } from '@/types'
import { submitQuestionIssueReport } from '@/actions/quiz'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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
  const [showReport, setShowReport] = useState(false)
  const [reportMessage, setReportMessage] = useState<string | null>(null)
  const [isReporting, startReportTransition] = useTransition()

  const headingId = `question-heading-${question.id}`

  function handleReportSubmit(formData: FormData) {
    setReportMessage(null)
    formData.set('questionId', question.id)
    startReportTransition(async () => {
      const result = await submitQuestionIssueReport(formData)
      if (result.error) {
        setReportMessage(result.error)
      } else {
        setReportMessage('Thanks — this question was sent to admin review.')
        setShowReport(false)
      }
    })
  }

  return (
    <div className="rounded-xl border border-[#E0E0E0] bg-white p-6 shadow-card md:p-8">
      <div className="mb-6 space-y-3">
        <h2
          id={headingId}
          className="text-xl font-bold leading-snug text-brand-navy md:text-2xl"
        >
          {question.question_text}
        </h2>
        {(question.type === 'boolean' || afterTitle) && (
          <div className="flex flex-wrap items-center gap-2">
            {question.type === 'boolean' && (
              <Badge variant="outline" className="border-[#E0E0E0] text-[#4A4A4A]">
                True/False
              </Badge>
            )}
            {afterTitle}
          </div>
        )}
      </div>

      <div
        className="space-y-3"
        role="group"
        aria-labelledby={headingId}
      >
        {question.options?.map((option, index) => {
          const visual = getOptionVisual(
            option.key,
            selectedKeys,
            correctAnswers,
            showResults
          )
          const interactive = !disabled && !showResults
          const isSelected = selectedKeys.includes(option.key)

          return (
            <QuizOptionRow
              key={`${question.id}-${option.key ?? index}`}
              optionKey={option.key}
              text={option.text}
              visual={visual}
              interactive={interactive}
              disabled={disabled}
              isSelected={isSelected}
              onClick={
                interactive ? () => onSelect(question.id, option.key) : undefined
              }
            />
          )
        })}
      </div>

      <div className="mt-6 border-t border-gray-100 pt-4">
        <Button type="button" variant="ghost" size="sm" onClick={() => setShowReport((value) => !value)}>
          Report issue with this question
        </Button>
        {showReport && (
          <form action={handleReportSubmit} className="mt-3 space-y-2">
            <Textarea
              name="reason"
              rows={3}
              maxLength={1000}
              placeholder="Tell us what seems wrong, confusing, outdated, or misspelled."
              aria-label="Question issue details"
              disabled={isReporting}
            />
            <Button type="submit" size="sm" disabled={isReporting}>
              {isReporting ? 'Sending…' : 'Send report'}
            </Button>
          </form>
        )}
        {reportMessage && (
          <p className="mt-2 text-sm text-muted-foreground" role="status">{reportMessage}</p>
        )}
      </div>
    </div>
  )
}
