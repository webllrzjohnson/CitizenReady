'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { submitMockExam } from '@/actions/exam'
import { useExamTimer } from '@/hooks/useExamTimer'
import type { Question } from '@/types'
import { cn } from '@/lib/utils'
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Trophy,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import QuestionCard from '@/components/quiz/QuestionCard'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { QuizOptionRow, type QuizOptionVisual } from '@/components/quiz/QuizOptionRow'
import { mockExamPassingCorrectCount, EXAM_CONFIG } from '@/lib/constants'

const GUEST_EXAM_PAYLOAD_KEY = 'citizenready_guest_exam_payload'
const GUEST_EXAM_USED_KEY = 'citizenready_guest_mock_exam_used'

type GuestExamReviewItem = {
  question: Question
  userAnswer: string[]
  isCorrect: boolean
}

type GuestExamResults = {
  score: number
  total: number
  review: GuestExamReviewItem[]
}

interface ExamSessionPageProps {
  params: Promise<{ sessionId: string }>
}

function answersMatch(userAnswer: string[], correctAnswers: string[]) {
  return (
    userAnswer.length === correctAnswers.length &&
    userAnswer.every((a) => correctAnswers.includes(a))
  )
}

export default function ExamSessionPage({ params }: ExamSessionPageProps) {
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string>('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [guestResults, setGuestResults] = useState<GuestExamResults | null>(null)

  useEffect(() => {
    params.then((p) => setSessionId(p.sessionId))
  }, [params])

  const handleTimeExpire = async () => {
    if (!submitted && !isSubmitting && guestResults === null) {
      await handleSubmitExam(true)
    }
  }

  const { timeRemaining, formattedTime } = useExamTimer({
    initialSeconds: 1800,
    onExpire: handleTimeExpire,
  })

  useEffect(() => {
    if (!sessionId) return

    async function loadSession() {
      try {
        setLoading(true)
        setError(null)

        if (sessionId === 'guest') {
          const sessionRes = await fetch('/api/auth/session')
          const sessionData = await sessionRes.json()
          if (sessionData.user) {
            router.replace('/dashboard/mock-exam')
            return
          }

          const raw = typeof window !== 'undefined' ? sessionStorage.getItem(GUEST_EXAM_PAYLOAD_KEY) : null
          if (!raw) {
            setError('Exam data not found. Start a new mock exam from the mock exam page.')
            return
          }

          const parsed = JSON.parse(raw) as { questions: Question[] }
          if (!parsed.questions?.length) {
            setError('Could not load exam questions.')
            return
          }

          setQuestions(parsed.questions)
          return
        }

        const res = await fetch(`/api/exam/session/${sessionId}`)
        if (!res.ok) {
          setError('Session not found')
          return
        }

        const { session: examSession, questions: orderedQuestions } = await res.json()

        if (examSession.completed_at) {
          router.push(`/dashboard/mock-exam/${sessionId}/results`)
          return
        }

        setQuestions(orderedQuestions)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load exam')
      } finally {
        setLoading(false)
      }
    }

    loadSession()
  }, [sessionId, router])

  const handleAnswerSelect = (questionId: string, answerKey: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: [answerKey] }))
  }

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1)
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex((prev) => prev + 1)
  }

  const handleSubmitClick = () => setShowSubmitDialog(true)

  const handleSubmitExam = async (_autoSubmit = false) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    setShowSubmitDialog(false)

    try {
      if (sessionId === 'guest') {
        let score = 0
        const review: GuestExamReviewItem[] = questions.map((q) => {
          const ua = answers[q.id] || []
          const ca = q.correct_answers ?? []
          const isCorrect = answersMatch(ua, ca)
          if (isCorrect) score++
          return { question: q, userAnswer: ua, isCorrect }
        })

        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(GUEST_EXAM_USED_KEY, '1')
            sessionStorage.removeItem(GUEST_EXAM_PAYLOAD_KEY)
          }
        } catch {
          /* ignore */
        }

        setGuestResults({ score, total: questions.length, review })
        setSubmitted(true)
        setIsSubmitting(false)
        return
      }

      const result = await submitMockExam(sessionId, answers)

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
        return
      }

      if (result.success) {
        setSubmitted(true)
        router.push(`/dashboard/mock-exam/${sessionId}/results`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit exam')
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4" role="status" aria-label="Loading exam">
        <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-brand-red border-t-transparent" aria-hidden="true" />
        <p className="text-sm text-muted-foreground" aria-hidden="true">Loading exam…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
            <AlertCircle className="h-8 w-8 text-brand-red" aria-hidden />
          </div>
        </div>
        <h2 className="mb-2 text-xl font-bold text-gray-900">Something went wrong</h2>
        <p className="mb-6 text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => router.push('/dashboard/mock-exam')} className="bg-brand-red text-white hover:bg-brand-red-dark">
          Back to Mock Exam
        </Button>
      </div>
    )
  }

  if (guestResults) {
    const { score, total, review } = guestResults
    const percentage = Math.round((score / total) * 100)
    const passNeed = mockExamPassingCorrectCount(total)
    const passed = score >= passNeed

    return (
      <div className="mx-auto max-w-5xl space-y-8 py-8">
        <div className={cn('relative overflow-hidden rounded-2xl p-8 text-center shadow-xl', passed ? 'bg-gradient-to-br from-green-600 to-green-800' : 'bg-gradient-to-br from-brand-red to-brand-red-dark')}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.12),transparent_65%)]" aria-hidden />
          <div className="relative space-y-3">
            <div className="flex justify-center">
              {passed ? (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 ring-4 ring-white/20">
                  <Trophy className="h-10 w-10 text-white" aria-hidden />
                </div>
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 ring-4 ring-white/20">
                  <AlertCircle className="h-10 w-10 text-white" aria-hidden />
                </div>
              )}
            </div>
            <p className="text-sm font-semibold uppercase tracking-widest text-white/70">{passed ? 'Congratulations' : 'Keep going'}</p>
            <p className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">{score} / {total}</p>
            <p className="text-2xl font-bold text-white/90">{percentage}%</p>
            <p className="text-base text-white/80">
              {passed ? 'You passed the mock citizenship exam!' : `You need ${passNeed}/${total} (${EXAM_CONFIG.PASSING_SCORE}%) to pass. Keep practicing!`}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-brand-red/20 bg-amber-50/60 p-5">
          <p className="font-semibold text-gray-900">Save your results and track progress</p>
          <p className="mt-1 text-sm text-gray-500">Create a free CitizenReady account to store mock exam history, practice scores, and more.</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild className="bg-brand-red text-white hover:bg-brand-red-dark">
              <Link href="/signup">Sign Up Free</Link>
            </Button>
            <Link href="/dashboard" className="text-center text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline sm:text-left">
              Continue as Guest
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <p className="text-lg font-semibold text-gray-900">Question review</p>
            <p className="mt-0.5 text-sm text-gray-500">Your answers and the correct responses</p>
          </div>
          <div className="divide-y divide-gray-100 px-6">
            {review.map((item, idx) => {
              const question = item.question
              const userAnswer = item.userAnswer
              const correctAnswers = question.correct_answers ?? []
              const isCorrect = item.isCorrect

              return (
                <div key={question.id} className="py-6">
                  <div className="flex items-start gap-3">
                    <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white', isCorrect ? 'bg-green-500' : 'bg-red-500')}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-base font-semibold leading-snug text-gray-900">{question.question_text}</h3>
                        {isCorrect ? (
                          <Badge variant="default" className="shrink-0 bg-green-500"><CheckCircle2 className="mr-1 h-3 w-3" />Correct</Badge>
                        ) : (
                          <Badge variant="destructive" className="shrink-0"><XCircle className="mr-1 h-3 w-3" />Incorrect</Badge>
                        )}
                      </div>
                      <div className="space-y-2">
                        {question.options?.map((option) => {
                          const isUserAnswer = userAnswer.includes(option.key)
                          const isCorrectAnswer = correctAnswers.includes(option.key)
                          let visual: QuizOptionVisual = 'default'
                          if (isCorrectAnswer) visual = 'correct'
                          else if (isUserAnswer && !isCorrectAnswer) visual = 'incorrect'
                          return (
                            <QuizOptionRow
                              key={option.key}
                              optionKey={option.key}
                              text={option.text}
                              visual={visual}
                              interactive={false}
                              suffix={
                                <>
                                  {isUserAnswer && <span className="ml-2 text-xs font-semibold text-brand-navy">Your answer</span>}
                                  {isCorrectAnswer && <span className="ml-2 text-xs font-semibold text-green-700">Correct</span>}
                                </>
                              }
                            />
                          )
                        })}
                      </div>
                      {question.explanation && (
                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-700">Explanation</p>
                          <p className="text-sm text-blue-800">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button variant="outline" onClick={() => router.push('/dashboard/practice')}>Practice by topic</Button>
          <Button className="bg-brand-red text-white hover:bg-brand-red-dark" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="mb-6 text-muted-foreground">No questions available</p>
        <Button onClick={() => router.push('/dashboard/mock-exam')} className="bg-brand-red text-white hover:bg-brand-red-dark">
          Back to Mock Exam
        </Button>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const isLastQuestion = currentIndex === questions.length - 1
  const progressPct = ((currentIndex + 1) / questions.length) * 100
  const timerUrgent = timeRemaining <= 300

  return (
    <div className="mx-auto max-w-4xl py-6 md:py-8">
      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-gray-200" role="progressbar" aria-valuenow={currentIndex + 1} aria-valuemin={1} aria-valuemax={questions.length} aria-label={`Question ${currentIndex + 1} of ${questions.length}`}>
        <div className="h-full rounded-full bg-brand-red transition-[width] duration-300 ease-out" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg font-semibold text-brand-navy">
          Question <span className="text-brand-red">{currentIndex + 1}</span>
          <span className="text-muted-foreground"> of {questions.length}</span>
        </p>
        <div className={cn('inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold tabular-nums transition-colors', timerUrgent ? 'motion-safe:animate-pulse bg-brand-red text-white shadow-lg shadow-brand-red/30' : 'bg-gray-100 text-gray-700')}>
          <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span aria-live="polite" aria-atomic="true">{formattedTime}</span>
        </div>
      </div>

      <div className="mb-8">
        <QuestionCard question={currentQuestion} selectedKeys={answers[currentQuestion.id] ?? []} onSelect={handleAnswerSelect} disabled={isSubmitting} />
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {questions.map((q, idx) => {
          const isAnswered = !!answers[q.id]
          const isCurrent = idx === currentIndex
          return (
            <button key={q.id} type="button" onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to question ${idx + 1}${isAnswered ? ' (answered)' : ''}`}
              aria-current={isCurrent ? 'step' : undefined}
              className={cn('flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all', isCurrent ? 'scale-110 ring-2 ring-brand-red ring-offset-2' : 'hover:scale-105', isAnswered ? 'bg-brand-red text-white shadow-sm' : 'bg-gray-200 text-gray-600')}>
              {idx + 1}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button onClick={handlePrevious} disabled={currentIndex === 0} variant="outline">
          <ChevronLeft className="mr-1 h-4 w-4" />Previous
        </Button>
        <p className="order-first text-center text-sm text-muted-foreground sm:order-none">
          <span className="font-semibold text-brand-navy">{answeredCount}/{questions.length}</span> answered
        </p>
        {!isLastQuestion ? (
          <Button onClick={handleNext} className="bg-brand-red text-white hover:bg-brand-red-dark">
            Next<ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmitClick} disabled={isSubmitting} className="bg-brand-red text-white hover:bg-brand-red-dark">
            Submit Exam
          </Button>
        )}
      </div>

      {currentIndex >= 10 && !isLastQuestion && (
        <div className="mt-8 text-center">
          <Button onClick={handleSubmitClick} disabled={isSubmitting} size="lg" variant="outline" className="border-brand-red text-brand-red hover:bg-brand-red hover:text-white">
            Submit Exam Now
          </Button>
        </div>
      )}

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit exam?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>You have answered <strong className="text-foreground">{answeredCount}</strong> of <strong className="text-foreground">{questions.length}</strong> questions.</p>
                {answeredCount < questions.length && (
                  <p className="font-semibold text-brand-red">{questions.length - answeredCount} question{questions.length - answeredCount !== 1 ? 's' : ''} left unanswered.</p>
                )}
                <p>Once submitted you cannot change your answers.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleSubmitExam(false)} className="bg-brand-red text-white hover:bg-brand-red-dark">
              Submit Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {timeRemaining <= 300 && timeRemaining > 0 && (
        <div role="alert" aria-live="assertive" className="fixed bottom-4 right-4 flex items-center gap-2 rounded-xl bg-brand-red px-4 py-3 text-white shadow-xl shadow-brand-red/30">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="text-sm font-semibold">Less than 5 minutes remaining!</span>
        </div>
      )}
    </div>
  )
}