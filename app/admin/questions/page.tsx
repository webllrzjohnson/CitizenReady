import Link from 'next/link'
import sql from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { QuestionActions } from '@/components/admin/QuestionActions'
import { QuestionFilters } from '@/components/admin/QuestionFilters'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ q?: string; topic?: string; status?: string; page?: string }>

export default async function QuestionsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const search = params.q || ''
  const topicFilter = params.topic || 'all'
  const statusFilter = params.status || 'all'
  const page = parseInt(params.page || '1')
  const perPage = 20
  const offset = (page - 1) * perPage

  const conditions: string[] = []
  const values: any[] = []
  let paramIdx = 1

  if (search) {
    conditions.push(`q.question_text ILIKE $${paramIdx++}`)
    values.push(`%${search}%`)
  }
  if (topicFilter && topicFilter !== 'all') {
    conditions.push(`q.topic_id = $${paramIdx++}::uuid`)
    values.push(topicFilter)
  }
  if (statusFilter === 'active') {
    conditions.push(`q.is_active = true`)
  } else if (statusFilter === 'inactive') {
    conditions.push(`q.is_active = false`)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const [questions, countRows, topics] = await Promise.all([
    sql.unsafe(`
      SELECT q.*, t.name as topic_name
      FROM public.questions q
      LEFT JOIN public.topics t ON t.id = q.topic_id
      ${whereClause}
      ORDER BY q.created_at DESC
      LIMIT ${perPage} OFFSET ${offset}
    `, values),
    sql.unsafe(`
      SELECT COUNT(*) as count FROM public.questions q ${whereClause}
    `, values),
    sql`SELECT id, name FROM public.topics ORDER BY name`,
  ])

  const count = parseInt(countRows[0]?.count ?? '0')
  const totalPages = Math.ceil(count / perPage) || 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Questions</h1>
          <p className="text-muted-foreground mt-2">Showing {questions.length} of {count} questions</p>
        </div>
        <Button asChild><Link href="/admin/questions/new">+ New Question</Link></Button>
      </div>

      <QuestionFilters topics={topics as any[]} />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No questions found</TableCell></TableRow>
            ) : (
              questions.map((question: any) => (
                <TableRow key={question.id}>
                  <TableCell className="max-w-[400px]"><div className="line-clamp-2">{question.question_text}</div></TableCell>
                  <TableCell>{question.topic_name}</TableCell>
                  <TableCell><Badge variant="secondary">{question.type}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={question.difficulty === 'easy' ? 'default' : question.difficulty === 'medium' ? 'secondary' : 'destructive'}>
                      {question.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell><Badge variant={question.is_active ? 'default' : 'outline'}>{question.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                  <TableCell className="text-right"><QuestionActions questionId={question.id} isActive={question.is_active} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Button variant="outline" asChild>
              <Link href={`/admin/questions?${new URLSearchParams({ ...(search && { q: search }), ...(topicFilter && { topic: topicFilter }), ...(statusFilter && { status: statusFilter }), page: String(page - 1) }).toString()}`}>Previous</Link>
            </Button>
          )}
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Button variant="outline" asChild>
              <Link href={`/admin/questions?${new URLSearchParams({ ...(search && { q: search }), ...(topicFilter && { topic: topicFilter }), ...(statusFilter && { status: statusFilter }), page: String(page + 1) }).toString()}`}>Next</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}