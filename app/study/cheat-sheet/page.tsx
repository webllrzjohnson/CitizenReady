import type { Metadata } from 'next'
import { getSession } from '@/lib/auth/session'
import sql from '@/lib/db'
import { siteUrl } from '@/lib/site-url'
import { CheatSheetContent } from '@/components/study/CheatSheetContent'
import { hasPremiumAccess } from '@/lib/premium'

export const metadata: Metadata = {
  title: '150 Most Likely Citizenship Test Questions — Cheat Sheet',
  description: 'The 150 Canadian citizenship test questions most likely to appear on your exam, ranked by real applicant surveys.',
  openGraph: {
    title: '150 Questions Most Likely on Your Canadian Citizenship Test | CitizenReady',
    description: 'Survey-ranked cheat sheet: the 150 most-tested questions with instant answer reveal, exam tips, and print-ready layout.',
    url: siteUrl('/study/cheat-sheet'),
    siteName: 'CitizenReady',
  },
}

export const dynamic = 'force-dynamic'

export default async function CheatSheetPage() {
  const session = await getSession()

  let premiumAccess = false
  if (session) {
    const rows = await sql`SELECT is_premium, premium_expires_at, role FROM public.profiles WHERE id = ${session.id}::uuid LIMIT 1`
    const profile = rows[0]
    premiumAccess = hasPremiumAccess(profile)
  }

  const viewer = session
    ? { status: 'signed_in' as const, premium: premiumAccess }
    : { status: 'guest' as const }

  return <CheatSheetContent viewer={viewer} />
}