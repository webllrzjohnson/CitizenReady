'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants'

export async function getCurrentUser() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return null
  }
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<{ id: string; email: string; full_name: string | null; role: string }>()
  
  if (profileError || !profile) {
    return null
  }
  
  return {
    id: profile.id,
    email: profile.email,
    display_name: profile.full_name,
    role: profile.role as 'admin' | 'user',
  }
}

export async function login() {
  return { success: false, error: 'Not implemented' }
}

export async function signup() {
  return { success: false, error: 'Not implemented' }
}

export async function logout() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  redirect(ROUTES.HOME)
}
