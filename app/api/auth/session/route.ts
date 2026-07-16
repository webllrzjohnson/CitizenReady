import { NextResponse } from 'next/server'
import { getFreshSession } from '@/lib/auth/session'

export async function GET() {
  const session = await getFreshSession()
  if (!session) return NextResponse.json({ user: null })
  return NextResponse.json({ user: session })
}