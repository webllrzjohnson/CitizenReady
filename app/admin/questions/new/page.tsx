import sql from '@/lib/db'
import { QuestionForm } from '@/components/admin/QuestionForm'

export const dynamic = 'force-dynamic'

export default async function NewQuestionPage() {
  const topics = await sql`SELECT * FROM public.topics ORDER BY sort_order`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Question</h1>
        <p className="text-muted-foreground mt-2">Create a new question for the question bank</p>
      </div>
      <QuestionForm mode="create" topics={topics} />
    </div>
  )
}