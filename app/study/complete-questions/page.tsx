import type { Metadata } from 'next'
import { getSession } from '@/lib/auth/session'
import sql from '@/lib/db'
import { siteUrl } from '@/lib/site-url'
import { getQuestionBankEntries } from '@/lib/data/complete-questions'
import { CompleteQuestionsCatalog } from '@/components/study/CompleteQuestionsCatalog'
import { hasPremiumAccess } from '@/lib/premium'

export const metadata: Metadata = {
  title: 'Complete question bank',
  description: 'Canadian citizenship practice questions by Discover Canada chapter — sample free, full bank for members.',
  openGraph: {
    title: 'Complete question bank | CitizenReady',
    description: 'Chapter-by-chapter citizenship questions with explanations.',
    url: siteUrl('/study/complete-questions'),
    siteName: 'CitizenReady',
  },
}

export const dynamic = 'force-dynamic'

export default async function CompleteQuestionsPage() {
  const session = await getSession()

  let premiumAccess = false
  if (session) {
    const rows = await sql`SELECT is_premium, premium_expires_at, role FROM public.profiles WHERE id = ${session.id}::uuid LIMIT 1`
    const profile = rows[0]
    premiumAccess = hasPremiumAccess(profile)
  }

  const { topics, previewQuestions, totalQuestions, unlockedQuestionCount, lockedTopicCount } =
    await getQuestionBankEntries(premiumAccess)

  const viewer = session
    ? { status: 'signed_in' as const, premium: premiumAccess }
    : { status: 'guest' as const }

  return (
    <CompleteQuestionsCatalog
      topics={topics}
      previewQuestions={previewQuestions}
      totalQuestions={totalQuestions}
      unlockedQuestionCount={unlockedQuestionCount}
      lockedTopicCount={lockedTopicCount}
      viewer={viewer}
    />
  )
}