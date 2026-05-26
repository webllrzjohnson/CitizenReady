import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const rows = await sql`SELECT * FROM public.topics WHERE slug = ${slug} LIMIT 1`

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
  }

  return NextResponse.json(rows[0])
}