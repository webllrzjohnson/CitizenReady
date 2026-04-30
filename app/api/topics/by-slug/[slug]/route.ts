import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: topic, error } = await supabase
    .from('topics')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !topic) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
  }

  return NextResponse.json(topic)
}
