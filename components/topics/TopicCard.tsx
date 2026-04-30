'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { startPracticeSession } from '@/actions/quiz'

interface TopicCardProps {
  id: string
  name: string
  description: string | null
  slug: string
  questionCount: number
  bestScore: number | null
  bestTotal: number | null
}

export function TopicCard({
  id,
  name,
  description,
  slug,
  questionCount,
  bestScore,
  bestTotal,
}: TopicCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleStartPractice = () => {
    startTransition(async () => {
      try {
        const result = await startPracticeSession(id, slug)
        
        if (result.error) {
          toast.error(result.error)
          return
        }

        if (result.success && result.sessionId) {
          router.push(`/dashboard/practice/${slug}?session=${result.sessionId}`)
        }
      } catch (error) {
        toast.error('Failed to start practice session')
        console.error(error)
      }
    })
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Questions:</span>
            <Badge variant="secondary">{questionCount}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Personal Best:</span>
            {bestScore !== null ? (
              <Badge variant="default">
                {bestScore}/{bestTotal}
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground">Not attempted</span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleStartPractice}
          className="w-full"
          disabled={questionCount === 0 || isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : (
            questionCount === 0 ? 'No Questions' : 'Start Practice'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
