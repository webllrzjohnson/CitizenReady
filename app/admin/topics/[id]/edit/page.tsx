import sql from '@/lib/db'
import { TopicForm } from '@/components/admin/TopicForm'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string }>

export default async function EditTopicPage({ params }: { params: Params }) {
  const { id } = await params

  const rows = await sql`SELECT * FROM public.topics WHERE id = ${id}::uuid LIMIT 1`
  if (rows.length === 0) notFound()

  const topic = rows[0]
  const defaultValues = {
    name: topic.name,
    slug: topic.slug,
    description: topic.description || undefined,
    sort_order: topic.sort_order,
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