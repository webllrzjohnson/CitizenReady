'use server'

import { revalidatePath } from 'next/cache'
import sql from '@/lib/db'
import { requireAdminSession } from '@/lib/auth/session'
import { QuestionSchema } from '@/lib/validations'

export async function createQuestion(formData: FormData) {
  const check = await requireAdminSession()
  if ('error' in check) return { error: check.error }

  try {
    const options = JSON.parse(formData.get('options') as string || '[]')
    const correct_answers = JSON.parse(formData.get('correct_answers') as string || '[]')

    const validated = QuestionSchema.parse({
      topic_id: formData.get('topic_id'),
      type: formData.get('type'),
      question_text: formData.get('question_text'),
      options,
      correct_answers,
      explanation: formData.get('explanation') || undefined,
      difficulty: formData.get('difficulty'),
      is_active: formData.get('is_active') === 'true',
    })

    await sql`
      INSERT INTO public.questions (topic_id, type, question_text, options, correct_answers, explanation, difficulty, is_active)
      VALUES (${validated.topic_id}::uuid, ${validated.type}, ${validated.question_text},
              ${JSON.stringify(validated.options)}, ${JSON.stringify(validated.correct_answers)},
              ${validated.explanation || null}, ${validated.difficulty}, ${validated.is_active})
    `

    revalidatePath('/admin/questions')
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to create question' }
  }
}

export async function updateQuestion(id: string, formData: FormData) {
  const check = await requireAdminSession()
  if ('error' in check) return { error: check.error }

  try {
    const options = JSON.parse(formData.get('options') as string || '[]')
    const correct_answers = JSON.parse(formData.get('correct_answers') as string || '[]')

    const validated = QuestionSchema.parse({
      topic_id: formData.get('topic_id'),
      type: formData.get('type'),
      question_text: formData.get('question_text'),
      options,
      correct_answers,
      explanation: formData.get('explanation') || undefined,
      difficulty: formData.get('difficulty'),
      is_active: formData.get('is_active') === 'true',
    })

    await sql`
      UPDATE public.questions SET
        topic_id = ${validated.topic_id}::uuid,
        type = ${validated.type},
        question_text = ${validated.question_text},
        options = ${JSON.stringify(validated.options)},
        correct_answers = ${JSON.stringify(validated.correct_answers)},
        explanation = ${validated.explanation || null},
        difficulty = ${validated.difficulty},
        is_active = ${validated.is_active}
      WHERE id = ${id}::uuid
    `

    revalidatePath('/admin/questions')
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to update question' }
  }
}

export async function deleteQuestion(id: string) {
  const check = await requireAdminSession()
  if ('error' in check) return { error: check.error }

  await sql`UPDATE public.questions SET is_active = false WHERE id = ${id}::uuid`
  revalidatePath('/admin/questions')
  return { success: true }
}

export async function toggleQuestion(id: string, is_active: boolean) {
  const check = await requireAdminSession()
  if ('error' in check) return { error: check.error }

  await sql`UPDATE public.questions SET is_active = ${!is_active} WHERE id = ${id}::uuid`
  revalidatePath('/admin/questions')
  return { success: true }
}