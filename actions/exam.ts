'use server'

import { revalidatePath } from 'next/cache'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth/session'
import { EXAM_CONFIG } from '@/lib/constants'
import { SubmitExamSchema } from '@/lib/validations'
import type { Question } from '@/types'

export async function startMockExam() {
  const session = await getSession()

  let isPremium = false
  if (session) {
    const rows = await sql`SELECT is_premium, role FROM public.profiles WHERE id = ${session.id}::uuid LIMIT 1`
    const profile = rows[0]
    isPremium = profile?.role === 'admin' || profile?.is_premium === true
  }

  const questions = await sql`
    SELECT * FROM public.questions
    WHERE is_active = true AND type IN ('single', 'boolean')
    LIMIT 200
  `

  const targetCount = isPremium ? EXAM_CONFIG.TOTAL_QUESTIONS : EXAM_CONFIG.FREE_TOTAL_QUESTIONS

  if (questions.length < targetCount) return { error: 'Not enough questions available for mock exam' }

  const shuffled = [...questions].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, targetCount)
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
    VALUES (${session.id}::uuid, 'mock_exam', null, ${targetCount}, ${JSON.stringify(questionIds)})
    RETURNING id
  `

  return { success: true, sessionId: sessionRows[0].id, questions: typedQuestions, isGuest: false }
}

export async function submitMockExam(sessionId: string, answers: Record<string, string[]>) {
  const session = await getSession()
  if (!session) return { success: false as const, error: 'You must be logged in' }

  const validation = SubmitExamSchema.safeParse({ session_id: sessionId, answers })
  if (!validation.success) return { success: false as const, error: validation.error.errors[0]?.message || 'Invalid input' }

  const result = await sql.begin(async (tx) => {
    const sessionRows = await tx`
      SELECT user_id, question_ids, score, completed_at
      FROM public.quiz_sessions
      WHERE id = ${sessionId}::uuid
      LIMIT 1
      FOR UPDATE
    `
    if (sessionRows.length === 0) return { success: false as const, error: 'Invalid session' }
    if (sessionRows[0].user_id !== session.id) return { success: false as const, error: 'Invalid session' }

    const questionIds = typeof sessionRows[0].question_ids === 'string'
      ? JSON.parse(sessionRows[0].question_ids)
      : sessionRows[0].question_ids

    if (sessionRows[0].completed_at) {
      const attemptsData = await tx`
        SELECT question_id, is_correct
        FROM public.question_attempts
        WHERE session_id = ${sessionId}::uuid
      `
      return {
        success: true as const,
        score: sessionRows[0].score ?? 0,
        total: questionIds.length,
        attempts: attemptsData.map((a: any) => ({ question_id: a.question_id, is_correct: a.is_correct })),
      }
    }

    const questionsData = await tx`
      SELECT id, correct_answers, explanation FROM public.questions WHERE id = ANY(${sql.array(questionIds)}::uuid[])
    `

    const questionsMap = new Map(questionsData.map((q: any) => [q.id, {
      correct_answers: typeof q.correct_answers === 'string' ? JSON.parse(q.correct_answers) : q.correct_answers,
      explanation: q.explanation,
    }]))

    let score = 0
    const attempts = questionIds.map((questionId: string) => {
      const userAnswer = answers[questionId] || []
      const questionData = questionsMap.get(questionId)
      if (!questionData) return null
      const correctAnswers = (questionData as any).correct_answers as string[]
      const isCorrect = userAnswer.length === correctAnswers.length && userAnswer.every((a: string) => correctAnswers.includes(a))
      if (isCorrect) score++
      return { session_id: sessionId, question_id: questionId, user_answer: userAnswer, is_correct: isCorrect, time_spent_ms: 0 }
    }).filter(Boolean)

    await tx`DELETE FROM public.question_attempts WHERE session_id = ${sessionId}::uuid`

    for (const attempt of attempts) {
      await tx`
        INSERT INTO public.question_attempts (session_id, question_id, user_answer, is_correct, time_spent_ms)
        VALUES (${(attempt as any).session_id}::uuid, ${(attempt as any).question_id}::uuid, ${JSON.stringify((attempt as any).user_answer)}, ${(attempt as any).is_correct}, ${(attempt as any).time_spent_ms})
      `
    }

    await tx`UPDATE public.quiz_sessions SET score = ${score}, completed_at = now() WHERE id = ${sessionId}::uuid`

    return {
      success: true as const,
      score,
      total: questionIds.length,
      attempts: attempts.map((a: any) => ({ question_id: a.question_id, is_correct: a.is_correct })),
    }
  })

  revalidatePath('/dashboard/progress')
  revalidatePath('/dashboard')

  return result
}