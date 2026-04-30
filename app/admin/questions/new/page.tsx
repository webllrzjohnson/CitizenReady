import { createClient } from '@/lib/supabase/server'
import { QuestionForm } from '@/components/admin/QuestionForm'

export default async function NewQuestionPage() {
  const supabase = await createClient()

  const { data: topics } = await supabase
    .from('topics')
    .select('*')
    .order('sort_order')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Question</h1>
        <p className="text-muted-foreground mt-2">
          Create a new question for the question bank
        </p>
      </div>

      <QuestionForm mode="create" topics={topics || []} />
    </div>
  )
}
