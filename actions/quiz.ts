'use server'

// @ts-nocheck - Supabase type inference issues with JSONB fields
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { SubmitAnswerSchema } from '@/lib/validations'
import type { Question } from '@/types'
import type { Tables } from '@/types/database.types'

export async function startPracticeSession(topicId: string, topicSlug: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  console.log('[startPracticeSession] Querying questions for topicId:', topicId)

  // Note: Fill-in-the-blank questions are converted to single choice during seeding
  // TODO: Add support for 'matching' question type
  const { data: questionsData, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .eq('topic_id', topicId)
    .eq('is_active', true)
    .in('type', ['single', 'multiple', 'boolean'])
    .limit(100)

  if (questionsError) {
    console.error('[startPracticeSession] Supabase query error:', questionsError)
    return { error: `Failed to load questions: ${questionsError.message}` }
  }

  if (!questionsData) {
    console.error('[startPracticeSession] No data returned from query')
    return { error: 'Failed to load questions: No data returned' }
  }

  const questions = questionsData as Tables<'questions'>[]
  console.log('[startPracticeSession] Number of questions returned:', questions.length)

  if (questions.length === 0) {
    console.warn('[startPracticeSession] No questions found for topicId:', topicId)
    return { error: 'No questions available for this topic' }
  }

  const shuffled = [...questions].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, Math.min(10, shuffled.length))
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
      type: 'practice',
      topic_id: topicId,
      total_q: selected.length,
      question_ids: questionIds,
    })
    .select()
    .single()

  if (sessionError || !sessionData) {
    return { error: 'Failed to create practice session' }
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

export async function submitAnswer(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'You must be logged in' }
  }

  const sessionId = formData.get('session_id')
  const questionId = formData.get('question_id')
  const userAnswerJson = formData.get('user_answer')
  const timeSpentMs = formData.get('time_spent_ms')

  if (!sessionId || !questionId || !userAnswerJson) {
    return { error: 'Missing required fields' }
  }

  let userAnswer: string[]
  try {
    userAnswer = JSON.parse(userAnswerJson as string)
  } catch {
    return { error: 'Invalid answer format' }
  }

  const validation = SubmitAnswerSchema.safeParse({
    session_id: sessionId,
    question_id: questionId,
    user_answer: userAnswer,
    time_spent_ms: timeSpentMs ? parseInt(timeSpentMs as string) : 0,
  })

  if (!validation.success) {
    return { error: validation.error.errors[0]?.message || 'Invalid input' }
  }

  const { data: sessionData, error: sessionError } = await supabase
    .from('quiz_sessions')
    .select('user_id')
    .eq('id', sessionId)
    .single()

  if (sessionError || !sessionData) {
    return { error: 'Invalid session' }
  }

  const session = sessionData as { user_id: string }

  if (session.user_id !== user.id) {
    return { error: 'Invalid session' }
  }

  const { data: questionData, error: questionError } = await supabase
    .from('questions')
    .select('correct_answers, explanation')
    .eq('id', questionId)
    .single()

  if (questionError || !questionData) {
    return { error: 'Question not found' }
  }

  const question = questionData as { correct_answers: unknown; explanation: string | null }

  const correctAnswers = question.correct_answers as string[]
  const isCorrect =
    userAnswer.length === correctAnswers.length &&
    userAnswer.every(a => correctAnswers.includes(a))

  // @ts-ignore - Supabase type inference issue
  const { error: attemptError } = await supabase
    .from('question_attempts')
    // @ts-expect-error - Supabase type inference issue with JSONB fields
    .insert({
      session_id: sessionId,
      question_id: questionId,
      user_answer: userAnswer,
      is_correct: isCorrect,
      time_spent_ms: validation.data.time_spent_ms || 0,
    })

  if (attemptError) {
    return { error: 'Failed to save answer' }
  }

  return {
    success: true,
    is_correct: isCorrect,
    correct_answers: correctAnswers,
    explanation: question.explanation,
  }
}

export async function completeSession(sessionId: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'You must be logged in' }
  }

  const { data: sessionData, error: sessionError } = await supabase
    .from('quiz_sessions')
    .select('user_id, total_q')
    .eq('id', sessionId)
    .single()

  if (sessionError || !sessionData) {
    return { error: 'Invalid session' }
  }

  const session = sessionData as { user_id: string; total_q: number }

  if (session.user_id !== user.id) {
    return { error: 'Invalid session' }
  }

  const { data: attemptsData, error: attemptsError } = await supabase
    .from('question_attempts')
    .select('is_correct')
    .eq('session_id', sessionId)

  if (attemptsError) {
    return { error: 'Failed to load attempts' }
  }

  const attempts = (attemptsData || []) as { is_correct: boolean }[]

  const score = attempts.filter(a => a.is_correct).length

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
    return { error: 'Failed to complete session' }
  }

  revalidatePath('/dashboard/progress')
  revalidatePath('/dashboard')

  return {
    success: true,
    score,
    total: session.total_q,
  }
}
