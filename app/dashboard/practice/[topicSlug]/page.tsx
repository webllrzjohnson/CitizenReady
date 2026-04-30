'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { startPracticeSession, submitAnswer, completeSession } from '@/actions/quiz'
import type { Question } from '@/types'
import { cn } from '@/lib/utils'
import QuestionCard from '@/components/quiz/QuestionCard'

interface FeedbackResult {
  is_correct: boolean
  correct_answers: string[]
  explanation: string | null
}

function answersMatch(userAnswer: string[], correctAnswers: string[]) {
  return (
    userAnswer.length === correctAnswers.length &&
    userAnswer.every((a) => correctAnswers.includes(a))
  )
}

export default function TopicPracticePage({
  params,
}: {
  params: Promise<{ topicSlug: string }>
}) {
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
    params.then((p) => setTopicSlug(p.topicSlug))
  }, [params])

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
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="mb-4 text-destructive">{error}</p>
            <Button onClick={handleBackToTopics}>Back to Topics</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (finalScore !== null) {
    const passed = finalScore.score >= 7
    const percentage = Math.round((finalScore.score / finalScore.total) * 100)

    return (
      <div className="container mx-auto max-w-2xl py-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="mb-2 text-3xl">Practice Complete!</CardTitle>
            <CardDescription>Here are your results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="py-8 text-center">
              <div className="mb-2 text-6xl font-bold">
                {finalScore.score}/{finalScore.total}
              </div>
              <div className="mb-4 text-2xl text-muted-foreground">{percentage}%</div>
              <Badge variant={passed ? 'default' : 'destructive'} className="px-4 py-1 text-lg">
                {passed ? 'Passed' : 'Keep Practicing'}
              </Badge>
            </div>

            <div className="space-y-2">
              {questions.map((q, idx) => {
                const userAnswer = userAnswers[q.id]
                const isCorrect = userAnswer && answersMatch(userAnswer, q.correct_answers ?? [])

                return (
                  <div
                    key={q.id ?? `question-${idx}`}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <span className="text-sm">Question {idx + 1}</span>
                    <Badge variant={isCorrect ? 'default' : 'destructive'}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </Badge>
                  </div>
                )
              })}
            </div>

            {isGuest && (
              <Card className="border-brand-red/20 bg-amber-50/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Want to track your progress over time?</CardTitle>
                  <CardDescription>
                    Create a free account to save your scores and see how you improve.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button asChild className="bg-brand-red text-white hover:bg-brand-red-dark">
                    <Link href="/signup">Sign Up Free</Link>
                  </Button>
                  <Link
                    href="/dashboard/practice"
                    className="text-center text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline sm:text-left"
                  >
                    Continue as Guest
                  </Link>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              <Button onClick={handlePracticeAgain} className="flex-1">
                Practice Again
              </Button>
              <Button onClick={handleBackToTopics} variant="outline" className="flex-1">
                Back to Topics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="mb-4 text-muted-foreground">No questions available</p>
            <Button onClick={handleBackToTopics}>Back to Topics</Button>
          </CardContent>
        </Card>
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
