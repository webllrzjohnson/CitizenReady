'use server'

import { revalidatePath } from 'next/cache'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth/session'
import { TopicSchema } from '@/lib/validations'

async function requireAdmin() {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }
  if (session.role !== 'admin') return { error: 'Unauthorized' }

  const rows = await sql`SELECT role FROM public.profiles WHERE id = ${session.id}::uuid LIMIT 1`
  if (rows[0]?.role !== 'admin') return { error: 'Unauthorized' }

  return { userId: session.id }
}

export async function createTopic(formData: FormData) {
  const check = await requireAdmin()
  if ('error' in check) return { error: check.error }

  try {
    const validated = TopicSchema.parse({
      name: formData.get('name'),
      slug: formData.get('slug'),
      description: formData.get('description') || undefined,
      sort_order: parseInt(formData.get('sort_order') as string) || 0,
    })

    await sql`
      INSERT INTO public.topics (name, slug, description, sort_order)
      VALUES (${validated.name}, ${validated.slug}, ${validated.description || null}, ${validated.sort_order})
    `

    revalidatePath('/admin/topics')
    revalidatePath('/dashboard/practice')
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to create topic' }
  }
}

export async function updateTopic(id: string, formData: FormData) {
  const check = await requireAdmin()
  if ('error' in check) return { error: check.error }

  try {
    const validated = TopicSchema.parse({
      name: formData.get('name'),
      slug: formData.get('slug'),
      description: formData.get('description') || undefined,
      sort_order: parseInt(formData.get('sort_order') as string) || 0,
    })

    await sql`
      UPDATE public.topics SET
        name = ${validated.name},
        slug = ${validated.slug},
        description = ${validated.description || null},
        sort_order = ${validated.sort_order}
      WHERE id = ${id}::uuid
    `

    revalidatePath('/admin/topics')
    revalidatePath('/dashboard/practice')
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to update topic' }
  }
}

export async function deleteTopic(id: string) {
  const check = await requireAdmin()
  if ('error' in check) return { error: check.error }

  const questions = await sql`SELECT id FROM public.questions WHERE topic_id = ${id}::uuid LIMIT 1`
  if (questions.length > 0) return { error: 'Cannot delete topic with questions' }

  await sql`DELETE FROM public.topics WHERE id = ${id}::uuid`
  revalidatePath('/admin/topics')
  revalidatePath('/dashboard/practice')
  return { success: true }
}