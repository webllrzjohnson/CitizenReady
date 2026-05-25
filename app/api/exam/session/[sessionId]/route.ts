import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import sql from '@/lib/db'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sessionRows = await sql`
    SELECT id, user_id, completed_at, question_ids
    FROM public.quiz_sessions
    WHERE id = ${sessionId}::uuid AND user_id = ${session.id}::uuid
    LIMIT 1
  `

  if (sessionRows.length === 0) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  const examSession = sessionRows[0]
  const questionIds = typeof examSession.question_ids === 'string'
    ? JSON.parse(examSession.question_ids)
    : examSession.question_ids

  const questionsData = await sql`
    SELECT * FROM public.questions WHERE id = ANY(${sql.array(questionIds)}::uuid[])
  `

  const questionsMap = new Map(questionsData.map((q: any) => [q.id, q]))
  const orderedQuestions = questionIds.map((id: string) => {
    const q = questionsMap.get(id)
    if (!q) return null
    return {
      id: q.id,
      topic_id: q.topic_id,
      type: q.type,
      question_text: q.question_text,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      correct_answers: typeof q.correct_answers === 'string' ? JSON.parse(q.correct_answers) : q.correct_answers,
      explanation: q.explanation,
      difficulty: q.difficulty,
      is_active: q.is_active,
      created_at: q.created_at,
    }
  }).filter(Boolean)

  return NextResponse.json({ session: examSession, questions: orderedQuestions })
}