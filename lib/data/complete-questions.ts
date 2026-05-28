import sql from '@/lib/db'
import { QUESTION_BANK_FREE_PREVIEW_COUNT } from '@/lib/question-bank'
import type { Question, Topic } from '@/types'

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

function parseOptions(raw: any): { key: string; text: string }[] {
  const arr = typeof raw === 'string' ? JSON.parse(raw) : raw
  if (!Array.isArray(arr)) return []
  return arr.filter((o: any) => o && typeof o.key === 'string' && typeof o.text === 'string')
}

function parseCorrectAnswers(raw: any): string[] {
  const arr = typeof raw === 'string' ? JSON.parse(raw) : raw
  if (!Array.isArray(arr)) return []
  return arr.filter((x: any): x is string => typeof x === 'string')
}

function rowToQuestion(row: any): Question {
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

export async function getQuestionBankEntries(premiumAccess: boolean): Promise<{
  topics: QuestionBankTopicEntry[]
  previewQuestions: QuestionBankPreviewItem[]
  totalQuestions: number
  unlockedQuestionCount: number
  lockedTopicCount: number
}> {
  const empty = { topics: [], previewQuestions: [], totalQuestions: 0, unlockedQuestionCount: 0, lockedTopicCount: 0 }

  const topicRows = await sql`
    SELECT id, name, slug, description, sort_order
    FROM public.topics
    ORDER BY sort_order ASC
  `
  if (!topicRows.length) return empty

  const topicMeta = new Map(topicRows.map((t: any) => [t.id, { name: t.name, slug: t.slug }]))

  const idRows = await sql`
    SELECT id, topic_id FROM public.questions
    WHERE is_active = true AND type IN ('single', 'multiple', 'boolean')
  `

  const countByTopic = new Map<string, number>()
  const idsByTopic = new Map<string, string[]>()
  for (const row of idRows) {
    const tid = row.topic_id
    countByTopic.set(tid, (countByTopic.get(tid) ?? 0) + 1)
    const list = idsByTopic.get(tid) ?? []
    list.push(row.id)
    idsByTopic.set(tid, list)
  }

  const topicsWithContent = topicRows.filter((t: any) => (countByTopic.get(t.id) ?? 0) > 0)
  const freeTopicIds = new Set(premiumAccess ? topicsWithContent.map((t: any) => t.id) : [])
  const unlockedChapterIdList = [...freeTopicIds].flatMap((tid) => idsByTopic.get(tid) ?? [])
  const allQuestionIds = idRows.map((r: any) => r.id)
  const previewIdList = premiumAccess ? [] : pickRandomQuestionIds(allQuestionIds, QUESTION_BANK_FREE_PREVIEW_COUNT)
  const idsToFetchFull = premiumAccess ? unlockedChapterIdList : previewIdList

  let fullRows: any[] = []
  if (idsToFetchFull.length > 0) {
    const questionRows = await sql`
      SELECT * FROM public.questions
      WHERE id = ANY(${sql.array(idsToFetchFull)}::uuid[])
      ORDER BY created_at ASC
    `
    if (premiumAccess) {
      fullRows = questionRows
    } else {
      const byId = new Map(questionRows.map((r: any) => [r.id, r]))
      fullRows = previewIdList.map((id) => byId.get(id)).filter(Boolean)
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
        return { ...q, topic_name: meta?.name ?? 'Topic', topic_slug: meta?.slug ?? '' }
      })

  const topics: QuestionBankTopicEntry[] = topicRows.map((t: any) => {
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

  const totalQuestions = idRows.length
  const unlockedQuestionCount = premiumAccess
    ? topics.reduce((n: number, t: any) => n + t.questions.length, 0)
    : previewQuestions.length
  const lockedTopicCount = premiumAccess
    ? topics.filter((t: any) => t.questionCount > 0 && t.isLocked).length
    : topics.filter((t: any) => t.questionCount > 0).length

  return { topics, previewQuestions, totalQuestions, unlockedQuestionCount, lockedTopicCount }
}