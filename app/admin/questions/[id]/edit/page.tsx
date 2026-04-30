import { createClient } from '@/lib/supabase/server'
import { QuestionForm } from '@/components/admin/QuestionForm'
import { notFound } from 'next/navigation'

type Params = Promise<{ id: string }>

export default async function EditQuestionPage({ params }: { params: Params }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: question }, { data: topics }] = await Promise.all([
    supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single(),
    supabase.from('topics').select('*').order('sort_order'),
  ])

  if (!question) {
    notFound()
  }

  const typedQuestion = question as any

  const defaultValues = {
    topic_id: typedQuestion.topic_id,
    type: typedQuestion.type as any,
    question_text: typedQuestion.question_text,
    options: typedQuestion.options as any,
    correct_answers: typedQuestion.correct_answers as string[],
    explanation: typedQuestion.explanation || undefined,
    difficulty: typedQuestion.difficulty as any,
    is_active: typedQuestion.is_active,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Question</h1>
        <p className="text-muted-foreground mt-2">
          Update the question details
        </p>
      </div>

      <QuestionForm
        mode="edit"
        questionId={id}
        defaultValues={defaultValues}
        topics={topics || []}
      />
    </div>
  )
}
