'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { startPracticeSession, submitAnswer, completeSession } from '@/actions/quiz'
import type { Question } from '@/types'
import { cn } from '@/lib/utils'
import QuestionCard from '@/components/quiz/QuestionCard'
import { AdUnit } from '@/components/ads/AdUnit'
import { AdPlaceholder } from '@/components/ads/AdPlaceholder'

interface FeedbackResult {
  is_correct: boolean
  correct_answers: string[]
  explanation: string | null
}

interface TopicPracticeContentProps {
  topicSlugParam: Promise<{ topicSlug: string }>
  adsEnabled: boolean
  clientId: string
}

function answersMatch(userAnswer: string[], correctAnswers: string[]) {
  return (
    userAnswer.length === correctAnswers.length &&
    userAnswer.every((a) => correctAnswers.includes(a))
  )
}

export function TopicPracticeContent({ topicSlugParam, adsEnabled, clientId }: TopicPracticeContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [topicSlug, setTopicSlug] = useState<string>('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({})
  const [showFeedback, setShowFeedback] = useState(false)
  const [lastResult, setLastResult] = useState<FeedbackResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [finalScore, setFinalScore] = useState<{ score: number; total: number } | null>(null)
  const [startTime, setStartTime] = useState<number>(Date.now())

  useEffect(() => {
    topicSlugParam.then((p) => setTopicSlug(p.topicSlug))
  }, [topicSlugParam])

  useEffect(() => {
    if (!topicSlug) return

    async function initSession() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/topics/by-slug/${topicSlug}`)
        if (!response.ok) {
          throw new Error('Topic not found')
        }
        const topic = await response.json()

        const result = await startPracticeSession(topic.id, topicSlug)

        if (result.error) {
          setError(result.error)
          return
        }

        if (result.success && result.questions && (result.sessionId != null || result.isGuest)) {
          setSessionId(result.sessionId ?? null)
          setIsGuest(!!result.isGuest)
          setQuestions(result.questions)
          setStartTime(Date.now())
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start session')
      } finally {
        setLoading(false)
      }
    }

    initSession()
  }, [topicSlug, searchParams])

  const currentQuestion = questions[currentIndex]
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0

  async function handleAnswerSelect(answerKey: string) {
    if (!currentQuestion || submitting || showFeedback) return
    if (!isGuest && !sessionId) return

    if (isGuest) {
      setSubmitting(true)
      const userAns = [answerKey]
      const correct = currentQuestion.correct_answers ?? []
      const isCorrect = answersMatch(userAns, correct)
      setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: userAns }))
      setLastResult({
        is_correct: isCorrect,
        correct_answers: correct,
        explanation: currentQuestion.explanation,
      })
      setShowFeedback(true)
      setSubmitting(false)
      return
    }

    setSubmitting(true)
    const timeSpent = Date.now() - startTime

    const formData = new FormData()
    formData.append('session_id', sessionId!)
    formData.append('question_id', currentQuestion.id)
    formData.append('user_answer', JSON.stringify([answerKey]))
    formData.append('time_spent_ms', timeSpent.toString())

    const result = await submitAnswer(formData)

    if (result.error) {
      setError(result.error)
      setSubmitting(false)
      return
    }

    if (result.success) {
      setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: [answerKey] }))
      setLastResult({
        is_correct: result.is_correct,
        correct_answers: result.correct_answers,
        explanation: result.explanation,
      })
      setShowFeedback(true)
    }

    setSubmitting(false)
  }

  async function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setShowFeedback(false)
      setLastResult(null)
      setStartTime(Date.now())
    }
  }

  async function handleSeeResults() {
    if (isGuest) {
      setCompleting(true)
      let score = 0
      for (const q of questions) {
        const ua = userAnswers[q.id] ?? []
        if (answersMatch(ua, q.correct_answers ?? [])) score++
      }
      setFinalScore({ score, total: questions.length })
      setCompleting(false)
      return
    }

    if (!sessionId) return

    setCompleting(true)
    const result = await completeSession(sessionId)

    if (result.error) {
      setError(result.error)
      setCompleting(false)
      return
    }

    if (result.success) {
      setFinalScore({ score: result.score, total: result.total })
    }

    setCompleting(false)
  }

  function handlePracticeAgain() {
    router.push(`/dashboard/practice/${topicSlug}`)
    router.refresh()
  }

  function handleBackToTopics() {
    router.push('/dashboard/practice')
  }

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[50vh] items-center justify-center py-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading practice session...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <div className="rounded-2xl border border-gray-200 bg-white py-12 text-center shadow-sm">
          <p className="mb-4 text-red-600">{error}</p>
          <Button onClick={handleBackToTopics}>Back to Topics</Button>
        </div>
      </div>
    )
  }

  if (finalScore !== null) {
    const passed = finalScore.score >= 7
    const percentage = Math.round((finalScore.score / finalScore.total) * 100)

    return (
      <div className="mx-auto max-w-2xl space-y-5 py-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="py-4 text-center">
            <p className="text-5xl font-extrabold text-gray-900">
              {finalScore.score}/{finalScore.total}
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-500">{percentage}%</p>
            <Badge variant={passed ? 'default' : 'destructive'} className="mt-3 px-4 py-1 text-base">
              {passed ? 'Passed' : 'Keep Practicing'}
            </Badge>
          </div>

          <div className="mt-6 space-y-2">
            {questions.map((q, idx) => {
              const userAnswer = userAnswers[q.id]
              const isCorrect = userAnswer && answersMatch(userAnswer, q.correct_answers ?? [])
              return (
                <div
                  key={q.id ?? `question-${idx}`}
                  className="flex items-center justify-between rounded-xl border border-gray-100 p-3"
                >
                  <span className="text-sm text-gray-600">Question {idx + 1}</span>
                  <Badge variant={isCorrect ? 'default' : 'destructive'}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </Badge>
                </div>
              )
            })}
          </div>

          <div className="mt-6 flex gap-3">
            <Button onClick={handlePracticeAgain} className="flex-1 bg-brand-red hover:bg-brand-red-dark">
              Practice Again
            </Button>
            <Button onClick={handleBackToTopics} variant="outline" className="flex-1 border-brand-navy/25">
              Back to Topics
            </Button>
          </div>
        </div>

        {/* Ad shown to guests only on results screen */}
        {isGuest && (
          <div>
            {adsEnabled ? (
              <AdUnit slot="practice-results-rectangle" clientId={clientId} adsEnabled={adsEnabled} format="rectangle" />
            ) : (
              <AdPlaceholder format="rectangle" />
            )}
          </div>
        )}

        {isGuest && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <p className="font-semibold text-gray-900">Want to track your progress over time?</p>
            <p className="mt-1 text-sm text-gray-500">
              Create a free account to save your scores and see how you improve.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild className="bg-brand-red text-white hover:bg-brand-red-dark">
                <Link href="/signup">Sign Up Free</Link>
              </Button>
              <Link
                href="/dashboard/practice"
                className="text-center text-sm font-medium text-gray-500 underline-offset-4 hover:text-gray-800 hover:underline sm:text-left"
              >
                Continue as Guest
              </Link>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <div className="rounded-2xl border border-gray-200 bg-white py-12 text-center shadow-sm">
          <p className="mb-4 text-gray-400">No questions available</p>
          <Button onClick={handleBackToTopics}>Back to Topics</Button>
        </div>
      </div>
    )
  }

  const userAnswer = userAnswers[currentQuestion.id]
  const isLastQuestion = currentIndex === questions.length - 1

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      <QuestionCard
        question={currentQuestion}
        selectedKeys={userAnswer ?? []}
        onSelect={(_qid, key) => handleAnswerSelect(key)}
        showResults={showFeedback}
        disabled={submitting}
        afterTitle={
          currentQuestion.difficulty ? (
            <Badge
              variant="outline"
              className="w-fit border-surface-border capitalize text-[#424242]"
            >
              {currentQuestion.difficulty}
            </Badge>
          ) : undefined
        }
      />

      {showFeedback && lastResult && (
        <div className="mt-6 space-y-4">
          <div
            className={cn(
              'rounded-lg border p-4',
              lastResult.is_correct
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            )}
          >
            <p
              className={cn(
                'mb-2 font-semibold',
                lastResult.is_correct ? 'text-green-900' : 'text-red-900'
              )}
            >
              {lastResult.is_correct ? 'Correct!' : 'Incorrect'}
            </p>
            {lastResult.explanation && (
              <p className="text-sm text-[#424242]">{lastResult.explanation}</p>
            )}
          </div>

          <Button
            onClick={isLastQuestion ? handleSeeResults : handleNext}
            className="w-full bg-brand-red text-white hover:bg-brand-red-dark"
            disabled={completing}
          >
            {completing ? 'Completing...' : isLastQuestion ? 'See Results' : 'Next Question'}
          </Button>
        </div>
      )}
    </div>
  )
}
