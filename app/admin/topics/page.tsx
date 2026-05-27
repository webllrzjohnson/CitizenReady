import Link from 'next/link'
import sql from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TopicActions } from '@/components/admin/TopicActions'

export const dynamic = 'force-dynamic'

export default async function TopicsPage() {
  const topics = await sql`
    SELECT t.*, COUNT(q.id) as question_count
    FROM public.topics t
    LEFT JOIN public.questions q ON q.topic_id = t.id
    GROUP BY t.id
    ORDER BY t.sort_order
  `

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Topics</h1>
          <p className="text-muted-foreground mt-2">Manage question categories and topics</p>
        </div>
        <Button asChild><Link href="/admin/topics/new">+ New Topic</Link></Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Sort Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topics.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No topics found</TableCell></TableRow>
            ) : (
              topics.map((topic: any) => (
                <TableRow key={topic.id}>
                  <TableCell className="font-medium">{topic.name}</TableCell>
                  <TableCell><code className="text-xs">{topic.slug}</code></TableCell>
                  <TableCell className="max-w-[300px] truncate">{topic.description || '-'}</TableCell>
                  <TableCell>{topic.question_count}</TableCell>
                  <TableCell>{topic.sort_order}</TableCell>
                  <TableCell className="text-right">
                    <TopicActions topicId={topic.id} hasQuestions={parseInt(topic.question_count) > 0} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}