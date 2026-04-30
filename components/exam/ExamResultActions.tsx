'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function ExamResultActions() {
  const router = useRouter()

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button 
        size="lg"
        onClick={() => router.push('/dashboard/mock-exam')}
      >
        Take Another Exam
      </Button>
      <Button 
        size="lg"
        variant="outline"
        onClick={() => router.push('/dashboard/practice')}
      >
        Practice Weak Topics
      </Button>
      <Button 
        size="lg"
        variant="outline"
        onClick={() => router.push('/dashboard/progress')}
      >
        View Progress
      </Button>
    </div>
  )
}
