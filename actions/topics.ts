'use server'

import { createClient } from '@/lib/supabase/server'
import { TopicSchema } from '@/lib/validations'
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

export async function createTopic(formData: FormData) {
  const adminCheck = await requireAdmin()
  if ('error' in adminCheck) {
    return { error: adminCheck.error }
  }

  const { supabase } = adminCheck

  try {
    const data = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: (formData.get('description') as string) || undefined,
      sort_order: parseInt(formData.get('sort_order') as string) || 0,
    }

    const validated = TopicSchema.parse(data)

    // @ts-expect-error - Supabase type inference issue
    const { error } = await supabase.from('topics').insert({
      name: validated.name,
      slug: validated.slug,
      description: validated.description || null,
      sort_order: validated.sort_order,
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/admin/topics')
    revalidatePath('/dashboard/practice')
    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Failed to create topic' }
  }
}

export async function updateTopic(id: string, formData: FormData) {
  const adminCheck = await requireAdmin()
  if ('error' in adminCheck) {
    return { error: adminCheck.error }
  }

  const { supabase } = adminCheck

  try {
    const data = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: (formData.get('description') as string) || undefined,
      sort_order: parseInt(formData.get('sort_order') as string) || 0,
    }

    const validated = TopicSchema.parse(data)

    const { error } = await supabase
      .from('topics')
      // @ts-expect-error - Supabase type inference issue
      .update({
        name: validated.name,
        slug: validated.slug,
        description: validated.description || null,
        sort_order: validated.sort_order,
      })
      .eq('id', id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/admin/topics')
    revalidatePath('/dashboard/practice')
    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Failed to update topic' }
  }
}

export async function deleteTopic(id: string) {
  const adminCheck = await requireAdmin()
  if ('error' in adminCheck) {
    return { error: adminCheck.error }
  }

  const { supabase } = adminCheck

  const { data: questions, error: checkError } = await supabase
    .from('questions')
    .select('id')
    .eq('topic_id', id)
    .limit(1)

  if (checkError) {
    return { error: checkError.message }
  }

  if (questions && questions.length > 0) {
    return { error: 'Cannot delete topic with questions' }
  }

  const { error } = await supabase.from('topics').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/topics')
  revalidatePath('/dashboard/practice')
  return { success: true }
}
