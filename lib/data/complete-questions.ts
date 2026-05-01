import { createClient } from '@/lib/supabase/server'
import { QUESTION_BANK_FREE_PREVIEW_COUNT } from '@/lib/question-bank'
import type { Question, Topic } from '@/types'
import type { Json } from '@/types/database.types'
import type { Tables } from '@/types/database.types'

export type TopicWithQuestions = Topic & {
  questions: Question[]
}

export type QuestionBankPreviewItem = Question & {
  topic_name: string
  topic_slug: string
}

export type QuestionBankTopicEntry = Topic & {
  questionCount: number
  isLocked: boolean
  questions: Question[]
}

function pickRandomQuestionIds(ids: string[], n: number): string[] {
  if (ids.length === 0) return []
  const copy = [...ids]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = copy[i]!
    copy[i] = copy[j]!
    copy[j] = tmp
  }
  return copy.slice(0, Math.min(n, copy.length))
}

function parseOptions(raw: Json | null): { key: string; text: string }[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (o): o is { key: string; text: string } =>
      typeof o === 'object' &&
      o !== null &&
      'key' in o &&
      'text' in o &&
      typeof (o as { key: unknown }).key === 'string' &&
      typeof (o as { text: unknown }).text === 'string'
  )
}

function parseCorrectAnswers(raw: Json | null): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((x): x is string => typeof x === 'string')
}

function rowToQuestion(row: Tables<'questions'>): Question {
  return {
    id: row.id,
    topic_id: row.topic_id,
    type: row.type as Question['type'],
    question_text: row.question_text,
    options: parseOptions(row.options),
    correct_answers: parseCorrectAnswers(row.correct_answers),
    explanation: row.explanation,
    difficulty: row.difficulty as Question['difficulty'],
    is_active: row.is_active,
    created_at: row.created_at,
  }
}

/**
 * Question bank for /study/complete-questions.
 * Non–Plus: only a random subset of questions is loaded as preview; chapter bodies stay locked (no leaked text).
 * Plus/admin: full catalog per chapter.
 */
export async function getQuestionBankEntries(premiumAccess: boolean): Promise<{
  topics: QuestionBankTopicEntry[]
  previewQuestions: QuestionBankPreviewItem[]
  totalQuestions: number
  unlockedQuestionCount: number
  lockedTopicCount: number
}> {
  const supabase = await createClient()

  const { data: topicRows, error: topicsError } = await supabase
    .from('topics')
    .select('id, name, slug, description, sort_order')
    .order('sort_order', { ascending: true })

  if (topicsError || !topicRows) {
    console.error('[getQuestionBankEntries] topics', topicsError)
    return {
      topics: [],
      previewQuestions: [],
      totalQuestions: 0,
      unlockedQuestionCount: 0,
      lockedTopicCount: 0,
    }
  }

  type TopicRow = {
    id: string
    name: string
    slug: string
    description: string | null
    sort_order: number
  }

  const topicsSorted = topicRows as unknown as TopicRow[]
  const topicMeta = new Map(topicsSorted.map((t) => [t.id, { name: t.name, slug: t.slug }]))

  const { data: idRows, error: idsError } = await supabase
    .from('questions')
    .select('id, topic_id')
    .eq('is_active', true)
    .in('type', ['single', 'multiple', 'boolean'])

  if (idsError || !idRows) {
    console.error('[getQuestionBankEntries] question ids', idsError)
    return {
      topics: [],
      previewQuestions: [],
      totalQuestions: 0,
      unlockedQuestionCount: 0,
      lockedTopicCount: 0,
    }
  }

  const questionIdRows = idRows as unknown as { id: string; topic_id: string }[]

  const countByTopic = new Map<string, number>()
  const idsByTopic = new Map<string, string[]>()
  for (const row of questionIdRows) {
    const tid = row.topic_id
    countByTopic.set(tid, (countByTopic.get(tid) ?? 0) + 1)
    const list = idsByTopic.get(tid) ?? []
    list.push(row.id)
    idsByTopic.set(tid, list)
  }

  const topicsWithContent = topicsSorted.filter((t) => (countByTopic.get(t.id) ?? 0) > 0)

  const freeTopicIds = new Set(
    premiumAccess ? topicsWithContent.map((t) => t.id) : []
  )

  const unlockedChapterIdList = [...freeTopicIds].flatMap((tid) => idsByTopic.get(tid) ?? [])

  const allQuestionIds = questionIdRows.map((r) => r.id)
  const previewIdList = premiumAccess
    ? []
    : pickRandomQuestionIds(allQuestionIds, QUESTION_BANK_FREE_PREVIEW_COUNT)

  const idsToFetchFull = premiumAccess
    ? unlockedChapterIdList
    : previewIdList

  let fullRows: Tables<'questions'>[] = []
  if (idsToFetchFull.length > 0) {
    const { data: questionRows, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .in('id', idsToFetchFull)
      .order('created_at', { ascending: true })

    if (questionsError) {
      console.error('[getQuestionBankEntries] questions', questionsError)
    } else {
      const rows = (questionRows ?? []) as Tables<'questions'>[]
      if (premiumAccess) {
        fullRows = rows
      } else {
        const byId = new Map(rows.map((r) => [r.id, r]))
        fullRows = previewIdList.map((id) => byId.get(id)).filter((r): r is Tables<'questions'> => r != null)
      }
    }
  }

  const questionsByTopic = new Map<string, Question[]>()
  if (premiumAccess) {
    for (const row of fullRows) {
      const q = rowToQuestion(row)
      const list = questionsByTopic.get(q.topic_id) ?? []
      list.push(q)
      questionsByTopic.set(q.topic_id, list)
    }
  }

  const previewQuestions: QuestionBankPreviewItem[] = premiumAccess
    ? []
    : fullRows.map((row) => {
        const q = rowToQuestion(row)
        const meta = topicMeta.get(q.topic_id)
        return {
          ...q,
          topic_name: meta?.name ?? 'Topic',
          topic_slug: meta?.slug ?? '',
        }
      })

  const topics: QuestionBankTopicEntry[] = topicsSorted.map((t) => {
    const questionCount = countByTopic.get(t.id) ?? 0
    const isLocked = !premiumAccess && questionCount > 0
    return {
      id: t.id,
      name: t.name,
      slug: t.slug,
      description: t.description,
      sort_order: t.sort_order,
      questionCount,
      isLocked,
      questions: questionsByTopic.get(t.id) ?? [],
    }
  })

  const totalQuestions = questionIdRows.length
  const unlockedQuestionCount = premiumAccess
    ? topics.reduce((n, t) => n + t.questions.length, 0)
    : previewQuestions.length
  const lockedTopicCount = premiumAccess
    ? topics.filter((t) => t.questionCount > 0 && t.isLocked).length
    : topics.filter((t) => t.questionCount > 0).length

  return {
    topics,
    previewQuestions,
    totalQuestions,
    unlockedQuestionCount,
    lockedTopicCount,
  }
}
