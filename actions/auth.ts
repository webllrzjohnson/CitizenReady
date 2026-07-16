'use server'

import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import sql from '@/lib/db'
import { createSession, getFreshSession, deleteSession } from '@/lib/auth/session'
import { LoginSchema, SignupSchema } from '@/lib/validations'
import { checkRateLimit, getClientFingerprint } from '@/lib/security/rate-limit'

export async function getCurrentUser() {
  return getFreshSession()
}

export async function login(formData: { email: string; password: string }) {
  const result = LoginSchema.safeParse(formData)
  if (!result.success) {
    return { success: false, error: result.error.errors[0].message }
  }

  const { email, password } = result.data

  const loginLimit = await checkRateLimit({
    scope: 'auth:login',
    identity: `${email}:${await getClientFingerprint()}`,
    maxAttempts: 5,
    windowSeconds: 15 * 60,
  })
  if (!loginLimit.success) return { success: false, error: loginLimit.error }

  const rows = await sql`
    SELECT id, email, full_name, role, password_hash, session_version
    FROM public.profiles
    WHERE email = ${email}
    LIMIT 1
  `

  const user = rows[0]
  if (!user || !user.password_hash) {
    return { success: false, error: 'Invalid email or password' }
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return { success: false, error: 'Invalid email or password' }
  }

  await createSession({
    id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
    session_version: user.session_version,
  })

  return { success: true }
}

export async function signup(formData: { email: string; password: string; full_name: string }) {
  const result = SignupSchema.safeParse({
    email: formData.email,
    password: formData.password,
    full_name: formData.full_name,
  })
  if (!result.success) {
    return { success: false, error: result.error.errors[0].message }
  }

  const { email, password, full_name } = result.data

  const signupLimit = await checkRateLimit({
    scope: 'auth:signup',
    identity: `${email}:${await getClientFingerprint()}`,
    maxAttempts: 3,
    windowSeconds: 60 * 60,
  })
  if (!signupLimit.success) return { success: false, error: signupLimit.error }

  // Check if email already exists
  const existing = await sql`
    SELECT id FROM public.profiles WHERE email = ${email} LIMIT 1
  `
  if (existing.length > 0) {
    return { success: false, error: 'An account with this email already exists' }
  }

  const password_hash = await bcrypt.hash(password, 12)

  await sql`
    INSERT INTO public.profiles (email, full_name, password_hash, role)
    VALUES (${email}, ${full_name}, ${password_hash}, 'user')
  `

  return { success: true }
}

export async function logout() {
  await deleteSession()
  redirect('/')
}