'use server'

import { createClient } from '@/lib/supabase/server'
import { QuestionSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || (profile as { role: string } | null)?.role !== 'admin') {
    return { error: 'Unauthorized' }
  }

  return { supabase }
}

export async function createQuestion(formData: FormData) {
  const adminCheck = await requireAdmin()
  if ('error' in adminCheck) {
    return { error: adminCheck.error }
  }

  const { supabase } = adminCheck

  try {
    const optionsRaw = formData.get('options')
    const correctAnswersRaw = formData.get('correct_answers')

    const options = optionsRaw ? JSON.parse(optionsRaw as string) : []
    const correctAnswers = correctAnswersRaw ? JSON.parse(correctAnswersRaw as string) : []

    const data = {
      topic_id: formData.get('topic_id') as string,
      type: formData.get('type') as string,
      question_text: formData.get('question_text') as string,
      options,
      correct_answers: correctAnswers,
      explanation: (formData.get('explanation') as string) || undefined,
      difficulty: formData.get('difficulty') as string,
      is_active: formData.get('is_active') === 'true',
    }

    const validated = QuestionSchema.parse(data)

    // @ts-expect-error - Supabase type inference issue with JSONB fields
    const { error } = await supabase.from('questions').insert({
      topic_id: validated.topic_id,
      type: validated.type,
      question_text: validated.question_text,
      options: validated.options,
      correct_answers: validated.correct_answers,
      explanation: validated.explanation || null,
      difficulty: validated.difficulty,
      is_active: validated.is_active,
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/admin/questions')
    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Failed to create question' }
  }
}

export async function updateQuestion(id: string, formData: FormData) {
  const adminCheck = await requireAdmin()
  if ('error' in adminCheck) {
    return { error: adminCheck.error }
  }

  const { supabase } = adminCheck

  try {
    const optionsRaw = formData.get('options')
    const correctAnswersRaw = formData.get('correct_answers')

    const options = optionsRaw ? JSON.parse(optionsRaw as string) : []
    const correctAnswers = correctAnswersRaw ? JSON.parse(correctAnswersRaw as string) : []

    const data = {
      topic_id: formData.get('topic_id') as string,
      type: formData.get('type') as string,
      question_text: formData.get('question_text') as string,
      options,
      correct_answers: correctAnswers,
      explanation: (formData.get('explanation') as string) || undefined,
      difficulty: formData.get('difficulty') as string,
      is_active: formData.get('is_active') === 'true',
    }

    const validated = QuestionSchema.parse(data)

    const { error } = await supabase
      .from('questions')
      // @ts-expect-error - Supabase type inference issue with JSONB fields
      .update({
        topic_id: validated.topic_id,
        type: validated.type,
        question_text: validated.question_text,
        options: validated.options,
        correct_answers: validated.correct_answers,
        explanation: validated.explanation || null,
        difficulty: validated.difficulty,
        is_active: validated.is_active,
      })
      .eq('id', id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/admin/questions')
    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Failed to update question' }
  }
}

export async function deleteQuestion(id: string) {
  const adminCheck = await requireAdmin()
  if ('error' in adminCheck) {
    return { error: adminCheck.error }
  }

  const { supabase } = adminCheck

  const { error } = await supabase
    .from('questions')
    // @ts-expect-error - Supabase type inference issue
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/questions')
  return { success: true }
}

export async function toggleQuestion(id: string, is_active: boolean) {
  const adminCheck = await requireAdmin()
  if ('error' in adminCheck) {
    return { error: adminCheck.error }
  }

  const { supabase } = adminCheck

  const { error } = await supabase
    .from('questions')
    // @ts-expect-error - Supabase type inference issue
    .update({ is_active: !is_active })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/questions')
  return { success: true }
}
