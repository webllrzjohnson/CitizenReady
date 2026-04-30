'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { startMockExam } from '@/actions/exam'
import { useToast } from '@/hooks/use-toast'

export function StartExamButton() {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [isStarting, setIsStarting] = useState(false)

  const handleStartExam = () => {
    setIsStarting(true)
    startTransition(async () => {
      try {
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

        if (result.success && result.sessionId) {
          router.push(`/dashboard/mock-exam/${result.sessionId}`)
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to start exam. Please try again.',
          variant: 'destructive',
        })
        setIsStarting(false)
      }
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
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        </>
      ) : (
        'Start Exam'
      )}
    </Button>
  )
}
