import { getAdSettings } from '@/lib/ad-settings'
import { TopicPracticeContent } from '@/components/practice/TopicPracticeContent'

export default async function TopicPracticePage({
  params,
}: {
  params: Promise<{ topicSlug: string }>
}) {
  const { adsEnabled, clientId } = await getAdSettings()

  return (
    <TopicPracticeContent
      topicSlugParam={params}
      adsEnabled={adsEnabled}
      clientId={clientId}
    />
  )
}
