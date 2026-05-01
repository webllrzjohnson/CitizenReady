import type { Metadata } from 'next'
import { siteUrl } from '@/lib/site-url'
import { getQuestionBankEntries } from '@/lib/data/complete-questions'
import { CompleteQuestionsCatalog } from '@/components/study/CompleteQuestionsCatalog'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Complete question bank',
  description:
    'Canadian citizenship practice questions by Discover Canada chapter — sample free, full bank for members. Interactive practice and mock exams available.',
  openGraph: {
    title: 'Complete question bank | CitizenReady',
    description:
      'Chapter-by-chapter citizenship questions with explanations. Preview free chapters; unlock the full bank as a member.',
    url: siteUrl('/study/complete-questions'),
    siteName: 'CitizenReady',
  },
}

export const dynamic = 'force-dynamic'

export default async function CompleteQuestionsPage() {
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

  const {
    topics,
    previewQuestions,
    totalQuestions,
    unlockedQuestionCount,
    lockedTopicCount,
  } = await getQuestionBankEntries(premiumAccess)

  const viewer = user
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
