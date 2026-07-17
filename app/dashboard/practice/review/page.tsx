import { getAdSettings } from '@/lib/ad-settings'
import { TopicPracticeContent } from '@/components/practice/TopicPracticeContent'
import { StudyPageHero } from '@/components/study/StudyPageHero'
import { RefreshCcw } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Review Missed Questions',
  description: 'Retake your recent incorrect Canadian citizenship practice questions.',
}

export default async function ReviewPracticePage() {
  const { adsEnabled, clientId } = await getAdSettings()

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-8">
      <StudyPageHero
        icon={RefreshCcw}
        eyebrow="Smart review"
        title="Review missed questions"
        description="Retake recent incorrect answers as a focused practice session. CitizenReady saves the new score to your progress history."
      />
      <TopicPracticeContent mode="review" adsEnabled={adsEnabled} clientId={clientId} />
    </div>
  )
}
