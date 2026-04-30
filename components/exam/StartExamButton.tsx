'use client'

import { useState, useTransition } from 'react'
import { unstable_rethrow, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { startMockExam } from '@/actions/exam'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

const GUEST_EXAM_PAYLOAD_KEY = 'citizenready_guest_exam_payload'
const GUEST_EXAM_USED_KEY = 'citizenready_guest_mock_exam_used'

export function StartExamButton() {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [isStarting, setIsStarting] = useState(false)

  const handleStartExam = () => {
    setIsStarting(true)
    startTransition(() => {
      void (async () => {
        try {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()

          if (
            !user &&
            typeof window !== 'undefined' &&
            localStorage.getItem(GUEST_EXAM_USED_KEY) === '1'
          ) {
            toast({
              title: 'Free mock exam already completed',
              description: 'Create a free account for unlimited mock exams and saved progress.',
            })
            setIsStarting(false)
            return
          }

          const result = await startMockExam()

          if (result.error) {
            toast({
              title: 'Error',
              description: result.error,
              variant: 'destructive',
            })
            setIsStarting(false)
            return
          }

          if (result.success && result.isGuest && result.questions) {
            sessionStorage.setItem(
              GUEST_EXAM_PAYLOAD_KEY,
              JSON.stringify({ questions: result.questions })
            )
            router.push('/dashboard/mock-exam/guest')
            setIsStarting(false)
            return
          }

          if (result.success && result.sessionId) {
            router.push(`/dashboard/mock-exam/${result.sessionId}`)
          }
          setIsStarting(false)
        } catch (error) {
          unstable_rethrow(error)
          toast({
            title: 'Error',
            description: 'Failed to start exam. Please try again.',
            variant: 'destructive',
          })
          setIsStarting(false)
        }
      })()
    })
  }

  return (
    <Button
      onClick={handleStartExam}
      disabled={isPending || isStarting}
      size="lg"
      className="w-full sm:w-auto"
    >
      {isStarting ? (
        <>
          <span className="mr-2">Starting exam...</span>
          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
        </>
      ) : (
        'Start Exam'
      )}
    </Button>
  )
}
