'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const UpdateProfileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
})

const UpdateEmailSchema = z
  .object({
    email: z.string().email('Enter a valid email address'),
    confirmEmail: z.string().email('Enter a valid email address'),
  })
  .refine((data) => data.email === data.confirmEmail, {
    message: 'Email addresses do not match',
    path: ['confirmEmail'],
  })

const UpdatePasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const result = UpdateProfileSchema.safeParse({
    full_name: formData.get('full_name'),
  })

  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: result.data.full_name })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateEmail(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const result = UpdateEmailSchema.safeParse({
    email: formData.get('email'),
    confirmEmail: formData.get('confirmEmail'),
  })

  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  const { error } = await supabase.auth.updateUser({ email: result.data.email })

  if (error) {
    return { error: error.message }
  }

  return {
    success: true,
    message: 'Check your new email address to confirm the change.',
  }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const result = UpdatePasswordSchema.safeParse({
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  const { error } = await supabase.auth.updateUser({
    password: result.data.newPassword,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function deleteAccount(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const confirmText = formData.get('confirmText')
  if (confirmText !== 'DELETE') {
    return { error: 'Type DELETE to confirm' }
  }

  // Use service role client to delete the auth user.
  // The profiles table has ON DELETE CASCADE from auth.users, so the profile
  // and all related data is removed automatically.
  const adminClient = createAdminClient()
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)

  if (deleteError) {
    return { error: deleteError.message }
  }

  // Clear the session cookies
  await supabase.auth.signOut()

  return { success: true }
}
