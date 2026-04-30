'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { createClient } from '@/lib/supabase/client'
import { submitMockExam } from '@/actions/exam'
import { useExamTimer } from '@/hooks/useExamTimer'
import type { Question } from '@/types'
import { cn } from '@/lib/utils'
import { Clock, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'

interface ExamSessionPageProps {
  params: Promise<{ sessionId: string }>
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

  useEffect(() => {
    params.then(p => setSessionId(p.sessionId))
  }, [params])

  const handleTimeExpire = async () => {
    if (!submitted && !isSubmitting) {
      await handleSubmitExam(true)
    }
  }

  const { timeRemaining, formattedTime, isExpired } = useExamTimer({
    initialSeconds: 1800, // 30 minutes
    onExpire: handleTimeExpire,
  })

  useEffect(() => {
    if (!sessionId) return

    async function loadSession() {
      try {
        setLoading(true)
        setError(null)

        const supabase = createClient()

        const { data: sessionData, error: sessionError } = await supabase
          .from('quiz_sessions')
          .select('*')
          .eq('id', sessionId)
          .single()

        if (sessionError || !sessionData) {
          setError('Session not found')
          return
        }

        const typedSession = sessionData as any

        if (typedSession.completed_at) {
          router.push(`/dashboard/mock-exam/${sessionId}/results`)
          return
        }

        const questionIds = typedSession.question_ids as string[]

        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .in('id', questionIds)

        if (questionsError || !questionsData) {
          setError('Failed to load questions')
          return
        }

        const typedQuestions = questionsData as any[]

        const orderedQuestions = questionIds
          .map(id => typedQuestions.find(q => q.id === id))
          .filter(Boolean)
          .map((q: any) => ({
            id: q.id,
            topic_id: q.topic_id,
            type: q.type as 'single' | 'multiple' | 'boolean' | 'fill' | 'matching',
            question_text: q.question_text,
            options: q.options as { key: string; text: string }[],
            correct_answers: q.correct_answers as string[],
            explanation: q.explanation,
            difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
            is_active: q.is_active,
            created_at: q.created_at,
          }))

        setQuestions(orderedQuestions as Question[])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load exam')
      } finally {
        setLoading(false)
      }
    }

    loadSession()
  }, [sessionId, router])

  const handleAnswerSelect = (questionId: string, answerKey: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: [answerKey],
    }))
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handleSubmitClick = () => {
    setShowSubmitDialog(true)
  }

  const handleSubmitExam = async (autoSubmit = false) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    setShowSubmitDialog(false)

    try {
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
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading exam...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => router.push('/dashboard/mock-exam')}>
              Back to Exam
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No questions available</p>
            <Button onClick={() => router.push('/dashboard/mock-exam')}>
              Back to Exam
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const isLastQuestion = currentIndex === questions.length - 1

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Top Bar */}
      <div className="mb-6 flex items-center justify-between bg-card border rounded-lg p-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className={cn(
            'w-5 h-5',
            timeRemaining <= 300 ? 'text-destructive' : 'text-muted-foreground'
          )} />
          <span className={cn(
            'font-mono text-lg font-bold',
            timeRemaining <= 300 ? 'text-destructive' : ''
          )}>
            {formattedTime}
          </span>
        </div>
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion.question_text}</CardTitle>
          {currentQuestion.type === 'boolean' && (
            <Badge variant="outline" className="w-fit">True/False</Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options?.map((option, index) => {
            const isSelected = answers[currentQuestion.id]?.includes(option.key)

            return (
              <Card
                key={`${currentQuestion.id}-${option.key ?? index}`}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md hover:border-primary',
                  isSelected && 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                )}
                onClick={() => handleAnswerSelect(currentQuestion.id, option.key)}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                    isSelected 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-secondary text-secondary-foreground'
                  )}>
                    {option.key}
                  </div>
                  <div className="flex-1">{option.text}</div>
                </CardContent>
              </Card>
            )
          })}
        </CardContent>
      </Card>

      {/* Question Indicators */}
      <div className="mb-6 flex flex-wrap gap-2 justify-center">
        {questions.map((q, idx) => {
          const isAnswered = !!answers[q.id]
          const isCurrent = idx === currentIndex

          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                'w-8 h-8 rounded-full text-sm font-semibold transition-all',
                isCurrent && 'ring-2 ring-primary ring-offset-2',
                isAnswered && !isCurrent && 'bg-blue-500 text-white',
                !isAnswered && !isCurrent && 'bg-muted text-muted-foreground',
                isCurrent && isAnswered && 'bg-blue-500 text-white',
                isCurrent && !isAnswered && 'bg-primary text-primary-foreground'
              )}
            >
              {idx + 1}
            </button>
          )
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <Button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          variant="outline"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-semibold">{answeredCount}/20</span>
          <span>answered</span>
        </div>

        {!isLastQuestion ? (
          <Button onClick={handleNext}>
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSubmitClick} disabled={isSubmitting}>
            Submit Exam
          </Button>
        )}
      </div>

      {/* Submit Button (appears after question 10) */}
      {currentIndex >= 10 && !isLastQuestion && (
        <div className="mt-6 text-center">
          <Button
            onClick={handleSubmitClick}
            disabled={isSubmitting}
            variant="default"
            size="lg"
          >
            Submit Exam
          </Button>
        </div>
      )}

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {answeredCount} of {questions.length} questions.
              {answeredCount < questions.length && (
                <span className="block mt-2 text-destructive font-semibold">
                  {questions.length - answeredCount} questions remain unanswered.
                </span>
              )}
              <span className="block mt-2">
                Once submitted, you cannot change your answers. Are you sure you want to submit now?
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleSubmitExam(false)}>
              Submit Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Time Warning */}
      {timeRemaining <= 300 && timeRemaining > 0 && (
        <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground p-4 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">Less than 5 minutes remaining!</span>
          </div>
        </div>
      )}
    </div>
  )
}
