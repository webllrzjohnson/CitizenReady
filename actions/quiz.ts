'use server'

import { revalidatePath } from 'next/cache'
import sql from '@/lib/db'
import { getFreshSession } from '@/lib/auth/session'
import { SubmitAnswerSchema } from '@/lib/validations'
import type { Question } from '@/types'

export async function startPracticeSession(topicId: string, topicSlug: string) {
  const session = await getFreshSession()

  const questions = await sql`
    SELECT * FROM public.questions
    WHERE topic_id = ${topicId}::uuid AND is_active = true AND type IN ('single', 'multiple', 'boolean')
    LIMIT 100
  `

  if (questions.length === 0) return { error: 'No questions available for this topic' }

  const shuffled = [...questions].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, Math.min(10, shuffled.length))
  const questionIds = selected.map((q: any) => q.id)

  const typedQuestions: Question[] = selected.map((q: any) => ({
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
  }))

  if (!session) {
    return { success: true, sessionId: null, questions: typedQuestions, isGuest: true }
  }

  const sessionRows = await sql`
    INSERT INTO public.quiz_sessions (user_id, type, topic_id, total_q, question_ids)
    VALUES (${session.id}::uuid, 'practice', ${topicId}::uuid, ${selected.length}, ${JSON.stringify(questionIds)})
    RETURNING id
  `

  return { success: true, sessionId: sessionRows[0].id, questions: typedQuestions, isGuest: false }
}

export async function submitAnswer(formData: FormData) {
  const session = await getFreshSession()
  if (!session) return { error: 'You must be logged in' }

  const sessionId = formData.get('session_id') as string
  const questionId = formData.get('question_id') as string
  const userAnswerJson = formData.get('user_answer') as string
  const timeSpentMs = formData.get('time_spent_ms')

  if (!sessionId || !questionId || !userAnswerJson) return { error: 'Missing required fields' }

  let userAnswer: string[]
  try {
    userAnswer = JSON.parse(userAnswerJson)
  } catch {
    return { error: 'Invalid answer format' }
  }

  const validation = SubmitAnswerSchema.safeParse({
    session_id: sessionId,
    question_id: questionId,
    user_answer: userAnswer,
    time_spent_ms: timeSpentMs ? parseInt(timeSpentMs as string) : 0,
  })
  if (!validation.success) return { error: validation.error.errors[0]?.message || 'Invalid input' }

  const sessionRows = await sql`SELECT user_id FROM public.quiz_sessions WHERE id = ${sessionId}::uuid LIMIT 1`
  if (sessionRows.length === 0 || sessionRows[0].user_id !== session.id) return { error: 'Invalid session' }

  const questionRows = await sql`SELECT correct_answers, explanation FROM public.questions WHERE id = ${questionId}::uuid LIMIT 1`
  if (questionRows.length === 0) return { error: 'Question not found' }

  const correctAnswers = typeof questionRows[0].correct_answers === 'string'
    ? JSON.parse(questionRows[0].correct_answers)
    : questionRows[0].correct_answers

  const isCorrect = userAnswer.length === correctAnswers.length && userAnswer.every((a: string) => correctAnswers.includes(a))

  await sql`
    INSERT INTO public.question_attempts (session_id, question_id, user_answer, is_correct, time_spent_ms)
    VALUES (${sessionId}::uuid, ${questionId}::uuid, ${JSON.stringify(userAnswer)}, ${isCorrect}, ${validation.data.time_spent_ms || 0})
  `

  return { success: true, is_correct: isCorrect, correct_answers: correctAnswers, explanation: questionRows[0].explanation }
}

export async function completeSession(sessionId: string) {
  const session = await getFreshSession()
  if (!session) return { error: 'You must be logged in' }

  const sessionRows = await sql`SELECT user_id, total_q FROM public.quiz_sessions WHERE id = ${sessionId}::uuid LIMIT 1`
  if (sessionRows.length === 0 || sessionRows[0].user_id !== session.id) return { error: 'Invalid session' }

  const attempts = await sql`SELECT is_correct FROM public.question_attempts WHERE session_id = ${sessionId}::uuid`
  const score = attempts.filter((a: any) => a.is_correct).length

  await sql`UPDATE public.quiz_sessions SET score = ${score}, completed_at = now() WHERE id = ${sessionId}::uuid`

  revalidatePath('/dashboard/progress')
  revalidatePath('/dashboard')

  return { success: true, score, total: sessionRows[0].total_q }
}