import { createClient } from '@/lib/supabase/server'
import { TopicForm } from '@/components/admin/TopicForm'
import { notFound } from 'next/navigation'

type Params = Promise<{ id: string }>

export default async function EditTopicPage({ params }: { params: Params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: topic } = await supabase
    .from('topics')
    .select('*')
    .eq('id', id)
    .single()

  if (!topic) {
    notFound()
  }

  const typedTopic = topic as any

  const defaultValues = {
    name: typedTopic.name,
    slug: typedTopic.slug,
    description: typedTopic.description || undefined,
    sort_order: typedTopic.sort_order,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Topic</h1>
        <p className="text-muted-foreground mt-2">Update the topic details</p>
      </div>

      <TopicForm mode="edit" topicId={id} defaultValues={defaultValues} />
    </div>
  )
}
