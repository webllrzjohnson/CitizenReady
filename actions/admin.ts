'use server'

import { createClient } from '@/lib/supabase/server'
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

  return { supabase, userId: user.id }
}

export async function toggleUserRole(userId: string, currentRole: string) {
  const adminCheck = await requireAdmin()
  if ('error' in adminCheck) {
    return { error: adminCheck.error }
  }

  const { supabase, userId: currentUserId } = adminCheck

  if (userId === currentUserId) {
    return { error: 'Cannot change your own role' }
  }

  const newRole = currentRole === 'user' ? 'admin' : 'user'

  const { error } = await supabase
    .from('profiles')
    // @ts-expect-error - Supabase type inference issue
    .update({ role: newRole })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}
