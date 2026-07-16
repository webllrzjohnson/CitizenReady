import { jwtVerify } from 'jose'
import type { NextRequest } from 'next/server'
import type { SessionPayload } from './session'
import { getJwtSecretBytes } from '@/lib/env'

const SECRET = getJwtSecretBytes()
const COOKIE_NAME = 'cr_session'

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

export async function getSessionFromRequest(request: NextRequest): Promise<SessionPayload | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, SECRET)
    return coerceSessionPayload(payload)
  } catch {
    return null
  }
}