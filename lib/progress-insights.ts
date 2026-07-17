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
