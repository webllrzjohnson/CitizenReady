import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { getJwtSecretBytes } from '@/lib/env'
import sql from '@/lib/db'

const SECRET = getJwtSecretBytes()
const COOKIE_NAME = 'cr_session'

export type SessionPayload = {
  id: string
  email: string
  role: 'user' | 'admin'
  full_name: string | null
  session_version: number
}

function coerceSessionPayload(payload: unknown): SessionPayload | null {
  if (!payload || typeof payload !== 'object') return null
  const value = payload as Record<string, unknown>
  if (typeof value.id !== 'string') return null
  if (typeof value.email !== 'string') return null
  if (value.role !== 'user' && value.role !== 'admin') return null
  if (value.full_name !== null && typeof value.full_name !== 'string') return null
  if (typeof value.session_version !== 'number') return null

  return {
    id: value.id,
    email: value.email,
    role: value.role,
    full_name: value.full_name as string | null,
    session_version: value.session_version,
  }
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(SECRET)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, SECRET)
    return coerceSessionPayload(payload)
  } catch {
    return null
  }
}

export async function getFreshSession(): Promise<SessionPayload | null> {
  const session = await getSession()
  if (!session) return null

  const rows = await sql`
    SELECT id, email, full_name, role, session_version
    FROM public.profiles
    WHERE id = ${session.id}::uuid
    LIMIT 1
  `
  const profile = rows[0]
  if (!profile || profile.session_version !== session.session_version) {
    await deleteSession()
    return null
  }

  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    full_name: profile.full_name,
    session_version: profile.session_version,
  }
}

export async function requireAdminSession() {
  const session = await getFreshSession()
  if (!session || session.role !== 'admin') return { error: 'Unauthorized' as const }
  return { userId: session.id }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}