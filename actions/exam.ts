'use server'

// @ts-nocheck - Supabase type inference issues with JSONB fields
import { createClient } from '@/lib/supabase/server'
import { EXAM_CONFIG } from '@/lib/constants'
import { revalidatePath } from 'next/cache'
import { SubmitExamSchema } from '@/lib/validations'
import type { Question } from '@/types'
import type { Tables } from '@/types/database.types'

export async function startMockExam() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  // Determine premium status for logged-in users
  let isPremium = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium, role')
      .eq('id', user.id)
      .single()
    const row = profile as { is_premium?: boolean; role?: string } | null
    isPremium = row?.role === 'admin' || row?.is_premium === true
  }

  console.log('[startMockExam] Fetching questions for mock exam')

  const { data: questionsData, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .eq('is_active', true)
    .in('type', ['single', 'boolean'])
    .limit(200)

  if (questionsError) {
    console.error('[startMockExam] Supabase query error:', questionsError)
    return { error: `Failed to load questions: ${questionsError.message}` }
  }

  if (!questionsData) {
    console.error('[startMockExam] No data returned from query')
    return { error: 'Failed to load questions: No data returned' }
  }

  const questions = questionsData as Tables<'questions'>[]
  console.log('[startMockExam] Number of questions returned:', questions.length)

  // Premium users get 20 questions; guests and free registered users get 10
  const targetCount = isPremium ? EXAM_CONFIG.TOTAL_QUESTIONS : EXAM_CONFIG.FREE_TOTAL_QUESTIONS

  if (questions.length < targetCount) {
    console.warn('[startMockExam] Not enough questions available:', questions.length)
    return { error: 'Not enough questions available for mock exam' }
  }

  const shuffled = [...questions].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, targetCount)
  const questionIds = selected.map(q => q.id)

  if (!user) {
    const typedQuestionsGuest: Question[] = selected.map(q => ({
      id: q.id,
      topic_id: q.topic_id,
      type: q.type as 'single' | 'multiple' | 'boolean' | 'fill' | 'matching',
      question_text: q.question_text,
      options: q.options as { key: string; text: string }[],
      correct_answers: q.correct_answers as string[],
      explanation: q.explanation,
      difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
      is_active: q.is_active,
      created_at: q.created_at,
    }))

    return {
      success: true,
      sessionId: null,
      questions: typedQuestionsGuest,
      isGuest: true,
    }
  }

  // @ts-ignore - Supabase type inference issue
  const { data: sessionData, error: sessionError } = await supabase
    .from('quiz_sessions')
    // @ts-expect-error - Supabase type inference issue with JSONB fields
    .insert({
      user_id: user.id,
      type: 'mock_exam',
      topic_id: null,
      total_q: targetCount,
      question_ids: questionIds,
    })
    .select()
    .single()

  if (sessionError || !sessionData) {
    console.error('[startMockExam] Failed to create session:', sessionError)
    return { error: 'Failed to create mock exam session' }
  }

  const session = sessionData as Tables<'quiz_sessions'>

  const typedQuestions: Question[] = selected.map(q => ({
    id: q.id,
    topic_id: q.topic_id,
    type: q.type as 'single' | 'multiple' | 'boolean' | 'fill' | 'matching',
    question_text: q.question_text,
    options: q.options as { key: string; text: string }[],
    correct_answers: q.correct_answers as string[],
    explanation: q.explanation,
    difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
    is_active: q.is_active,
    created_at: q.created_at,
  }))

  return {
    success: true,
    sessionId: session.id,
    questions: typedQuestions,
    isGuest: false,
  }
}

export async function submitMockExam(
  sessionId: string,
  answers: Record<string, string[]>
) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'You must be logged in' }
  }

  // Validate input
  const validation = SubmitExamSchema.safeParse({ session_id: sessionId, answers })
  if (!validation.success) {
    return { error: validation.error.errors[0]?.message || 'Invalid input' }
  }

  // Verify session belongs to current user
  const { data: sessionData, error: sessionError } = await supabase
    .from('quiz_sessions')
    .select('user_id, question_ids')
    .eq('id', sessionId)
    .single()

  if (sessionError || !sessionData) {
    return { error: 'Invalid session' }
  }

  const session = sessionData as { user_id: string; question_ids: unknown }

  if (session.user_id !== user.id) {
    return { error: 'Invalid session' }
  }

  const questionIds = session.question_ids as string[]

  // Fetch correct answers and explanations for all questions
  const { data: questionsData, error: questionsError } = await supabase
    .from('questions')
    .select('id, correct_answers, explanation')
    .in('id', questionIds)

  if (questionsError || !questionsData) {
    return { error: 'Failed to load question data' }
  }

  const questionsMap = new Map(
    (questionsData as Array<{ id: string; correct_answers: unknown; explanation: string }>).map(q => [
      q.id,
      {
        correct_answers: q.correct_answers as string[],
        explanation: q.explanation,
      }
    ])
  )

  // Calculate score and prepare attempts
  let score = 0
  const attempts = questionIds.map(questionId => {
    const userAnswer = answers[questionId] || []
    const questionData = questionsMap.get(questionId)
    
    if (!questionData) {
      return null
    }

    const correctAnswers = questionData.correct_answers
    const isCorrect =
      userAnswer.length === correctAnswers.length &&
      userAnswer.every(a => correctAnswers.includes(a))

    if (isCorrect) {
      score++
    }

    return {
      session_id: sessionId,
      question_id: questionId,
      user_answer: userAnswer,
      is_correct: isCorrect,
      time_spent_ms: 0,
    }
  }).filter((a): a is NonNullable<typeof a> => a !== null)

  // Insert all attempts in a single query
  // @ts-ignore - Supabase type inference issue
  const { error: attemptsError } = await supabase
    .from('question_attempts')
    // @ts-expect-error - Supabase type inference issue with JSONB fields
    .insert(attempts)

  if (attemptsError) {
    console.error('[submitMockExam] Failed to save attempts:', attemptsError)
    return { error: 'Failed to save exam results' }
  }

  // Update session with score and completion time
  // @ts-ignore - Supabase type inference issue
  const { error: updateError } = await supabase
    .from('quiz_sessions')
    // @ts-expect-error - Supabase type inference issue
    .update({
      score,
      completed_at: new Date().toISOString(),
    })
    .eq('id', sessionId)

  if (updateError) {
    console.error('[submitMockExam] Failed to update session:', updateError)
    return { error: 'Failed to update exam results' }
  }

  revalidatePath('/dashboard/progress')
  revalidatePath('/dashboard')

  return {
    success: true,
    score,
    total: questionIds.length,
    attempts: attempts.map(a => ({
      question_id: a.question_id,
      is_correct: a.is_correct,
    })),
  }
}
