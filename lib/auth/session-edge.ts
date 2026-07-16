import { jwtVerify } from 'jose'
import type { NextRequest } from 'next/server'
import type { SessionPayload } from './session'
import { getJwtSecretBytes } from '@/lib/env'

const SECRET = getJwtSecretBytes()
const COOKIE_NAME = 'cr_session'

export async function getSessionFromRequest(request: NextRequest): Promise<SessionPayload | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}