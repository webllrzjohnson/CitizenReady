import sql from '@/lib/db'
import { QuestionForm } from '@/components/admin/QuestionForm'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string }>

export default async function EditQuestionPage({ params }: { params: Params }) {
  const { id } = await params

  const [questionRows, topics] = await Promise.all([
    sql`SELECT * FROM public.questions WHERE id = ${id}::uuid LIMIT 1`,
    sql`SELECT * FROM public.topics ORDER BY sort_order`,
  ])

  if (questionRows.length === 0) notFound()

  const q = questionRows[0]
  const defaultValues = {
    topic_id: q.topic_id,
    type: q.type as any,
    question_text: q.question_text,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
    correct_answers: typeof q.correct_answers === 'string' ? JSON.parse(q.correct_answers) : q.correct_answers,
    explanation: q.explanation || undefined,
    difficulty: q.difficulty as any,
    is_active: q.is_active,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Question</h1>
        <p className="text-muted-foreground mt-2">Update the question details</p>
      </div>
      <QuestionForm mode="edit" questionId={id} defaultValues={defaultValues} topics={topics} />
    </div>
  )
}