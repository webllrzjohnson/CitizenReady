'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { startPracticeSession, submitAnswer, completeSession } from '@/actions/quiz'
import type { Question } from '@/types'
import { cn } from '@/lib/utils'

interface FeedbackResult {
  is_correct: boolean
  correct_answers: string[]
  explanation: string | null
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
    params.then(p => setTopicSlug(p.topicSlug))
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

        if (result.success && result.sessionId && result.questions) {
          setSessionId(result.sessionId)
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
    if (!sessionId || !currentQuestion || submitting || showFeedback) return

    setSubmitting(true)
    const timeSpent = Date.now() - startTime

    const formData = new FormData()
    formData.append('session_id', sessionId)
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
      setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: [answerKey] }))
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
      setCurrentIndex(prev => prev + 1)
      setShowFeedback(false)
      setLastResult(null)
      setStartTime(Date.now())
    }
  }

  async function handleSeeResults() {
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
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
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
            <p className="text-destructive mb-4">{error}</p>
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
      <div className="container mx-auto py-8 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-2">Practice Complete!</CardTitle>
            <CardDescription>Here are your results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <div className="text-6xl font-bold mb-2">
                {finalScore.score}/{finalScore.total}
              </div>
              <div className="text-2xl text-muted-foreground mb-4">
                {percentage}%
              </div>
              <Badge variant={passed ? 'default' : 'destructive'} className="text-lg px-4 py-1">
                {passed ? 'Passed' : 'Keep Practicing'}
              </Badge>
            </div>

            <div className="space-y-2">
              {questions.map((q, idx) => {
                const userAnswer = userAnswers[q.id]
                const isCorrect = userAnswer && 
                  userAnswer.length === q.correct_answers.length &&
                  userAnswer.every(a => q.correct_answers.includes(a))

                return (
                  <div
                    key={q.id ?? `question-${idx}`}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <span className="text-sm">Question {idx + 1}</span>
                    <Badge variant={isCorrect ? 'default' : 'destructive'}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </Badge>
                  </div>
                )
              })}
            </div>

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
            <p className="text-muted-foreground mb-4">No questions available</p>
            <Button onClick={handleBackToTopics}>Back to Topics</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const userAnswer = userAnswers[currentQuestion.id]
  const isLastQuestion = currentIndex === questions.length - 1

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion.question_text}</CardTitle>
          {currentQuestion.difficulty && (
            <Badge variant="outline" className="w-fit">
              {currentQuestion.difficulty}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options?.map((option, index) => {
            const isSelected = userAnswer?.includes(option.key)
            const isCorrect = lastResult?.correct_answers.includes(option.key)
            const shouldHighlight = showFeedback && (isSelected || isCorrect)

            return (
              <Card
                key={`${currentQuestion.id}-${option.key ?? index}`}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  !showFeedback && 'hover:border-primary',
                  shouldHighlight && isCorrect && 'border-green-500 bg-green-50',
                  shouldHighlight && !isCorrect && isSelected && 'border-red-500 bg-red-50',
                  submitting && 'pointer-events-none opacity-50'
                )}
                onClick={() => !showFeedback && handleAnswerSelect(option.key)}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                    !shouldHighlight && 'bg-secondary text-secondary-foreground',
                    shouldHighlight && isCorrect && 'bg-green-500 text-white',
                    shouldHighlight && !isCorrect && isSelected && 'bg-red-500 text-white'
                  )}>
                    {option.key}
                  </div>
                  <div className="flex-1">{option.text}</div>
                </CardContent>
              </Card>
            )
          })}

          {showFeedback && lastResult && (
            <div className="mt-6 space-y-4">
              <div className={cn(
                'p-4 rounded-lg',
                lastResult.is_correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              )}>
                <p className={cn(
                  'font-semibold mb-2',
                  lastResult.is_correct ? 'text-green-900' : 'text-red-900'
                )}>
                  {lastResult.is_correct ? 'Correct!' : 'Incorrect'}
                </p>
                {lastResult.explanation && (
                  <p className="text-sm text-muted-foreground">
                    {lastResult.explanation}
                  </p>
                )}
              </div>

              <Button
                onClick={isLastQuestion ? handleSeeResults : handleNext}
                className="w-full"
                disabled={completing}
              >
                {completing ? 'Completing...' : isLastQuestion ? 'See Results' : 'Next Question'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
