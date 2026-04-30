import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StartExamButton } from '@/components/exam/StartExamButton'
import { Clock, FileText, Target, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EXAM_CONFIG, mockExamPassingCorrectCount } from '@/lib/constants'

export const metadata = {
  title: 'Mock Citizenship Exam',
  description: `Timed mock exam — ${EXAM_CONFIG.GUEST_TOTAL_QUESTIONS} questions for guests, ${EXAM_CONFIG.TOTAL_QUESTIONS} when signed in. 30 minutes. ${EXAM_CONFIG.PASSING_SCORE}% to pass.`,
}

export default async function MockExamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const qCount = user ? EXAM_CONFIG.TOTAL_QUESTIONS : EXAM_CONFIG.GUEST_TOTAL_QUESTIONS
  const passNeed = mockExamPassingCorrectCount(qCount)

  const rules = [
    {
      icon: FileText,
      title: user ? `${qCount} Questions` : `${qCount} Questions (guest preview)`,
      description: user
        ? 'Random questions from all topics covering Canadian history, geography, government, and rights.'
        : 'Guests take a shorter preview. Create a free account for the full 20-question mock exam.',
    },
    {
      icon: Clock,
      title: '30 Minute Time Limit',
      description: 'You have 30 minutes to complete the exam. The timer will automatically submit when time expires.',
    },
    {
      icon: Target,
      title: `${EXAM_CONFIG.PASSING_SCORE}% to Pass`,
      description: `You need at least ${passNeed} out of ${qCount} correct to pass.`,
    },
    {
      icon: AlertCircle,
      title: 'No Feedback During Exam',
      description: "You won't see correct answers until you submit. Just like the real citizenship test.",
    },
  ]

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Mock Citizenship Exam</h1>
        <p className="text-lg text-muted-foreground">
          Test your knowledge with a simulated Canadian citizenship exam
        </p>
      </div>

      <Card className="mb-8 border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="default" className="text-sm">
              Official Format
            </Badge>
            Exam Rules
          </CardTitle>
          <CardDescription>
            This mock exam follows the official Canadian citizenship test format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {rules.map((rule, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <rule.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{rule.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {rule.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Before you begin:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Make sure you have a stable internet connection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Find a quiet place where you can focus for 30 minutes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Once started, the timer cannot be paused</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>You can navigate between questions freely during the exam</span>
                </li>
              </ul>
            </div>

            <div className="flex justify-center pt-4">
              <StartExamButton />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          Not ready yet?{' '}
          <Link href="/dashboard/practice" className="text-primary hover:underline">
            Practice by topic
          </Link>{' '}
          to improve your knowledge first.
        </p>
      </div>
    </div>
  )
}
