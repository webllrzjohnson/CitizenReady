'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import sql from '@/lib/db'
import { getSession, deleteSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

const UpdateProfileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
})

const UpdateEmailSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  confirmEmail: z.string().email('Enter a valid email address'),
}).refine((data) => data.email === data.confirmEmail, {
  message: 'Email addresses do not match',
  path: ['confirmEmail'],
})

const UpdatePasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export async function updateProfile(formData: FormData) {
  const session = await getSession()
  if (!session) return { error: 'Not authenticated' }

  const result = UpdateProfileSchema.safeParse({ full_name: formData.get('full_name') })
  if (!result.success) return { error: result.error.errors[0].message }

  await sql`UPDATE public.profiles SET full_name = ${result.data.full_name} WHERE id = ${session.id}::uuid`

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateEmail(formData: FormData) {
  const session = await getSession()
  if (!session) return { error: 'Not authenticated' }

  const result = UpdateEmailSchema.safeParse({
    email: formData.get('email'),
    confirmEmail: formData.get('confirmEmail'),
  })
  if (!result.success) return { error: result.error.errors[0].message }

  const existing = await sql`SELECT id FROM public.profiles WHERE email = ${result.data.email} AND id != ${session.id}::uuid LIMIT 1`
  if (existing.length > 0) return { error: 'This email is already in use' }

  await sql`UPDATE public.profiles SET email = ${result.data.email} WHERE id = ${session.id}::uuid`

  revalidatePath('/dashboard/settings')
  return { success: true, message: 'Email updated successfully.' }
}

export async function updatePassword(formData: FormData) {
  const session = await getSession()
  if (!session) return { error: 'Not authenticated' }

  const result = UpdatePasswordSchema.safeParse({
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  })
  if (!result.success) return { error: result.error.errors[0].message }

  const password_hash = await bcrypt.hash(result.data.newPassword, 12)
  await sql`UPDATE public.profiles SET password_hash = ${password_hash} WHERE id = ${session.id}::uuid`

  return { success: true }
}

export async function deleteAccount(formData: FormData) {
  const session = await getSession()
  if (!session) return { error: 'Not authenticated' }

  const confirmText = formData.get('confirmText')
  if (confirmText !== 'DELETE') return { error: 'Type DELETE to confirm' }

  await sql`DELETE FROM public.profiles WHERE id = ${session.id}::uuid`
  await deleteSession()
  redirect('/')
}