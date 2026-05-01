import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { siteUrl } from '@/lib/site-url'
import { CheatSheetContent } from '@/components/study/CheatSheetContent'

export const metadata: Metadata = {
  title: '150 Most Likely Citizenship Test Questions — Cheat Sheet',
  description:
    'The 150 Canadian citizenship test questions most likely to appear on your exam, ranked by real applicant surveys. Answers, exam tips, and difficulty ratings included.',
  openGraph: {
    title: '150 Questions Most Likely on Your Canadian Citizenship Test | CitizenReady',
    description:
      'Survey-ranked cheat sheet: the 150 most-tested questions with instant answer reveal, exam tips, and print-ready layout. Unlock with CitizenReady Plus.',
    url: siteUrl('/study/cheat-sheet'),
    siteName: 'CitizenReady',
  },
}

export const dynamic = 'force-dynamic'

export default async function CheatSheetPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let premiumAccess = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium, role')
      .eq('id', user.id)
      .single()
    const row = profile as { is_premium?: boolean; role?: string } | null
    premiumAccess = row?.role === 'admin' || row?.is_premium === true
  }

  const viewer = user
    ? { status: 'signed_in' as const, premium: premiumAccess }
    : { status: 'guest' as const }

  return <CheatSheetContent viewer={viewer} />
}
