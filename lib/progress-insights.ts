export type TopicProgressInsight = {
  topic_id: string
  topic_name: string
  topic_slug?: string
  best_score: number | null
  sessions_count: number
  last_attempted: string | null
}

export type WeakTopicRecommendation = TopicProgressInsight & {
  reason: string
  priority: number
}

export type TodayStudyPlanItem = {
  title: string
  reason: string
  estimate: string
  href: string
}

type AnswerOption = { key: string; text: string }

export function buildWeakTopicRecommendations(
  topics: TopicProgressInsight[],
  limit = 3,
): WeakTopicRecommendation[] {
  return topics
    .map((topic) => {
      const bestScore = topic.best_score
      let reason = 'Keep building consistency'
      let priority = 0

      if (bestScore === null) {
        reason = 'Not started yet'
        priority = 100
      } else if (bestScore < 6) {
        reason = 'Best score below 60%'
        priority = 90 + (6 - bestScore)
      } else if (bestScore < 8) {
        reason = 'Needs another practice run'
        priority = 70 + (8 - bestScore)
      } else if (topic.sessions_count < 2) {
        reason = 'Only practiced once'
        priority = 50
      }

      return { ...topic, reason, priority }
    })
    .filter((topic) => topic.priority > 0)
    .sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority
      if (a.best_score === null && b.best_score !== null) return -1
      if (b.best_score === null && a.best_score !== null) return 1
      return (a.best_score ?? 99) - (b.best_score ?? 99)
    })
    .slice(0, limit)
}

export function formatIncorrectReviewSummary(input: {
  correct_answers: string[]
  options: AnswerOption[]
}): string {
  const optionMap = new Map(input.options.map((option) => [option.key, option.text]))
  const labels = input.correct_answers.map((answer) => optionMap.get(answer) || answer)
  const prefix = labels.length === 1 ? 'Correct answer' : 'Correct answers'
  return `${prefix}: ${labels.join('; ')}`
}

export function selectUniqueIncorrectQuestionIds(
  rows: Array<{ question_id: string | null | undefined }>,
  limit = 10,
): string[] {
  const seen = new Set<string>()
  const ids: string[] = []

  for (const row of rows) {
    if (!row.question_id || seen.has(row.question_id)) continue
    seen.add(row.question_id)
    ids.push(row.question_id)
    if (ids.length >= limit) break
  }

  return ids
}

export function buildTodayStudyPlan(input: {
  missedQuestionCount: number
  weakTopics: WeakTopicRecommendation[]
  mockExamCount: number
  latestMockScore: number | null
}): TodayStudyPlanItem[] {
  const items: TodayStudyPlanItem[] = []

  if (input.missedQuestionCount > 0) {
    items.push({
      title: 'Review missed questions',
      reason: `${input.missedQuestionCount} recent missed ${input.missedQuestionCount === 1 ? 'question' : 'questions'} ready`,
      estimate: '10 min',
      href: '/dashboard/practice/review',
    })
  }

  const weakest = input.weakTopics[0]
  if (weakest?.topic_slug) {
    items.push({
      title: `Practice ${weakest.topic_name}`,
      reason: weakest.reason,
      estimate: '10 min',
      href: `/dashboard/practice/${weakest.topic_slug}`,
    })
  }

  if (input.mockExamCount === 0 || input.latestMockScore === null || input.latestMockScore < 15) {
    items.push({
      title: 'Take a mock exam',
      reason: input.mockExamCount === 0 ? 'No saved mock exam yet' : 'Latest mock exam is below passing score',
      estimate: '30 min',
      href: '/dashboard/mock-exam',
    })
  }

  if (items.length === 0) {
    items.push({
      title: 'Keep your streak going',
      reason: 'Your recent progress looks strong — complete one study session today',
      estimate: '10 min',
      href: '/dashboard/practice',
    })
  }

  return items.slice(0, 3)
}
