import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checks: Record<string, string> = {
    app: 'ok',
  }

  try {
    await sql`SELECT 1 AS ok`
    checks.database = 'ok'
  } catch {
    checks.database = 'error'
    return NextResponse.json({ status: 'degraded', checks }, { status: 503 })
  }

  return NextResponse.json({ status: 'ok', checks })
}
