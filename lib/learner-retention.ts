export type LearnerSessionActivity = {
  completed_at: string | Date | null
  type: string
  topic_slug?: string | null
}

export type LearnerRetentionSummary = {
  studyStreakDays: number
  lastActivityLabel: string
  continueHref: string
  continueLabel: string
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function daysBetween(a: Date, b: Date): number {
  const start = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate())
  const end = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate())
  return Math.round((start - end) / 86_400_000)
}

export function buildLearnerRetentionSummary(input: {
  completedSessions: LearnerSessionActivity[]
  now?: Date
}): LearnerRetentionSummary {
  const now = input.now ?? new Date()
  const sessions = input.completedSessions
    .filter((session) => session.completed_at)
    .map((session) => ({ ...session, completedAt: new Date(session.completed_at as string | Date) }))
    .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())

  const latest = sessions[0]
  const activeDays = new Set(sessions.map((session) => dayKey(session.completedAt)))
  let studyStreakDays = 0
  for (let offset = 0; offset < 365; offset++) {
    const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - offset))
    if (!activeDays.has(dayKey(day))) break
    studyStreakDays++
  }

  let lastActivityLabel = 'No completed study sessions yet'
  if (latest) {
    const diff = daysBetween(now, latest.completedAt)
    if (diff <= 0) lastActivityLabel = 'Today'
    else if (diff === 1) lastActivityLabel = 'Yesterday'
    else lastActivityLabel = `${diff} days ago`
  }

  let continueHref = '/dashboard/practice'
  let continueLabel = 'Start topic practice'
  if (latest?.type === 'practice' && latest.topic_slug) {
    continueHref = `/dashboard/practice/${latest.topic_slug}`
    continueLabel = 'Continue recent topic'
  } else if (latest?.type === 'mock_exam') {
    continueHref = '/dashboard/mock-exam'
    continueLabel = 'Take another mock exam'
  }

  return { studyStreakDays, lastActivityLabel, continueHref, continueLabel }
}
