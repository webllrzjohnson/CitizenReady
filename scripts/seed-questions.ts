import { readFileSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'
import postgres from 'postgres'
import type { Database, Json } from '../types/database.types'

config({ path: join(process.cwd(), '.env.local') })

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('Missing DATABASE_URL in .env.local')
  process.exit(1)
}

const sql = postgres(databaseUrl, { ssl: false, max: 1 })

type QuestionInsert = Database['public']['Tables']['questions']['Insert']

const TOPICS = [
  {
    name: 'Rights and Responsibilities',
    slug: 'rights-and-responsibilities',
    description: 'Canadian citizenship rights and responsibilities',
    sort_order: 1,
  },
  {
    name: 'Who Are Canadians',
    slug: 'who-are-canadians',
    description: 'Canadian identity, diversity, and Indigenous peoples',
    sort_order: 2,
  },
  {
    name: "Canada's History",
    slug: 'canadas-history',
    description: 'Historical events and milestones in Canadian history',
    sort_order: 3,
  },
  {
    name: 'Government',
    slug: 'government',
    description: 'Canadian government structure and institutions',
    sort_order: 4,
  },
  {
    name: 'Federal Elections',
    slug: 'federal-elections',
    description: 'Electoral system and voting process',
    sort_order: 5,
  },
  {
    name: 'Justice System',
    slug: 'justice-system',
    description: 'Canadian laws and justice system',
    sort_order: 6,
  },
  {
    name: 'Canadian Symbols',
    slug: 'canadian-symbols',
    description: 'National symbols and heritage',
    sort_order: 7,
  },
  {
    name: "Canada's Regions",
    slug: 'canadas-regions',
    description: 'Geographic regions and provincial characteristics',
    sort_order: 8,
  },
  {
    name: "Canada's Economy",
    slug: 'canadas-economy',
    description: 'Economic sectors and industries',
    sort_order: 9,
  },
  {
    name: 'Modern Canada',
    slug: 'modern-canada',
    description: 'Contemporary Canadian society and culture',
    sort_order: 10,
  },
  {
    name: 'Applying for Citizenship',
    slug: 'applying-for-citizenship',
    description: 'Citizenship application process and requirements',
    sort_order: 11,
  },
]

type QuestionFromJSON = {
  type: 'single' | 'boolean' | 'fill' | 'multiple' | 'matching'
  question: string
  options?: string[]
  correctAnswer?: string | string[]
  matchPairs?: Array<{ left: string; right: string }>
  explanation: string
  topic: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

async function seedTopics() {
  console.log('🌱 Seeding topics...')

  const existingTopics = await sql<{ slug: string }[]>`
    SELECT slug FROM public.topics
  `
  const existingTopicSlugs = new Set(existingTopics.map((t) => t.slug))
  const topicsToInsert = TOPICS.filter((t) => !existingTopicSlugs.has(t.slug))

  if (topicsToInsert.length === 0) {
    console.log('✅ All topics already exist')
    return
  }

  let inserted = 0
  for (const topic of topicsToInsert) {
    try {
      await sql`
        INSERT INTO public.topics (name, slug, description, sort_order)
        VALUES (${topic.name}, ${topic.slug}, ${topic.description}, ${topic.sort_order})
      `
      inserted++
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code
      if (code === '23505') {
        console.log(`  ⏭️  Topic "${topic.name}" already exists, skipping`)
        continue
      }
      console.error(`Error inserting topic "${topic.name}":`, error)
      throw error
    }
  }

  console.log(`✅ Inserted ${inserted} new topics`)
}

async function getTopicMap(): Promise<Record<string, string>> {
  const data = await sql<{ id: string; name: string; slug: string }[]>`
    SELECT id, name, slug FROM public.topics
  `

  console.log('  Topics in database:')
  data.forEach((topic) => {
    console.log(`    - ${topic.name} (${topic.slug})`)
  })

  const map: Record<string, string> = {}

  data.forEach((topic) => {
    map[topic.name] = topic.id
    const normalized = topic.name.toLowerCase().replace(/['']/g, '').trim()
    map[normalized] = topic.id
  })

  const nameToSlugMap: Record<string, string> = {
    'Rights and Responsibilities': 'rights-and-responsibilities',
    'Who Are Canadians': 'who-are-canadians',
    "Canada's History": 'canadas-history',
    Government: 'government',
    'Federal Elections': 'federal-elections',
    'Justice System': 'justice-system',
    'Canadian Symbols': 'canadian-symbols',
    "Canada's Regions": 'canadas-regions',
    "Canada's Economy": 'canadas-economy',
    'Modern Canada': 'modern-canada',
    'Applying for Citizenship': 'applying-for-citizenship',
  }

  data.forEach((topic) => {
    Object.entries(nameToSlugMap).forEach(([jsonName, expectedSlug]) => {
      if (topic.slug === expectedSlug) {
        map[jsonName] = topic.id
      }
    })
  })

  return map
}

function generateDistractors(correctAnswer: string): string[] {
  const commonDistractors: Record<string, string[]> = {
    constitution: ['Charter', 'Bill of Rights', 'Magna Carta'],
    charter: ['Constitution', 'Bill of Rights', 'Declaration'],
    ottawa: ['Toronto', 'Montreal', 'Quebec City'],
    queen: ['Prime Minister', 'Governor General', 'President'],
    king: ['Prime Minister', 'Governor General', 'President'],
    parliament: ['Senate', 'House of Commons', 'Legislature'],
    '1867': ['1867', '1812', '1982', '1945'],
    senate: ['Parliament', 'House of Commons', 'Cabinet'],
    'prime minister': ['President', 'Governor General', 'Monarch'],
    provinces: ['states', 'territories', 'counties'],
    federal: ['provincial', 'municipal', 'territorial'],
  }

  const lowerAnswer = correctAnswer.toLowerCase()
  for (const [key, values] of Object.entries(commonDistractors)) {
    if (lowerAnswer.includes(key)) {
      return values.slice(0, 3)
    }
  }

  const genericDistractors = [
    'The federal government',
    'The provincial legislature',
    'The Supreme Court',
    'The Governor General',
    'The House of Commons',
    'The Senate',
    'The Prime Minister',
    'The Monarch',
    'The Constitution',
    'The Charter of Rights',
    'Parliament',
    '10 years',
    '5 years',
    '18 years',
    'All citizens',
    'Permanent residents',
  ]

  return genericDistractors
    .filter((d) => d.toLowerCase() !== lowerAnswer)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
}

function transformQuestion(question: QuestionFromJSON, topicId: string): QuestionInsert {
  const difficulty = question.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'

  let options: Json
  let correctAnswers: Json

  const formatOptions = (opts: string[]): Array<{ key: string; text: string }> => {
    const keys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    return opts.map((text, index) => {
      const cleanText = text.replace(/^[A-Z]\.\s*/, '')
      return {
        key: keys[index] || String.fromCharCode(97 + index),
        text: cleanText,
      }
    })
  }

  const formatAnswer = (answer: string | string[]): string[] => {
    if (Array.isArray(answer)) {
      return answer.map((a) => a.toLowerCase())
    }
    return [answer.toLowerCase()]
  }

  switch (question.type) {
    case 'single':
      options = formatOptions(question.options || [])
      correctAnswers = formatAnswer(question.correctAnswer as string)
      break

    case 'multiple':
      options = formatOptions(question.options || [])
      correctAnswers = formatAnswer(question.correctAnswer as string[])
      break

    case 'boolean':
      options = formatOptions(['True', 'False'])
      const boolAnswer = question.correctAnswer as string
      correctAnswers = [boolAnswer === 'True' ? 'a' : 'b']
      break

    case 'fill': {
      const correctAnswer = question.correctAnswer as string
      const distractors = generateDistractors(correctAnswer)
      const allOptions = [correctAnswer, ...distractors]
      const shuffledWithIndex = allOptions
        .map((opt, idx) => ({ opt, isCorrect: idx === 0 }))
        .sort(() => Math.random() - 0.5)

      options = formatOptions(shuffledWithIndex.map((item) => item.opt))
      const correctIndex = shuffledWithIndex.findIndex((item) => item.isCorrect)
      const keys = ['a', 'b', 'c', 'd']
      correctAnswers = [keys[correctIndex]]
      break
    }

    case 'matching':
      options = question.matchPairs || []
      correctAnswers = question.matchPairs || []
      break
  }

  return {
    question_text: question.question,
    type: question.type === 'fill' ? 'single' : question.type,
    options,
    correct_answers: correctAnswers,
    explanation: question.explanation,
    difficulty,
    topic_id: topicId,
    is_active: true,
  }
}

async function seedQuestions() {
  console.log('📚 Loading questions from JSON...')

  const jsonPath = join(process.cwd(), 'canadaquiz_questions.json')
  const jsonData = JSON.parse(readFileSync(jsonPath, 'utf-8'))
  const questions = jsonData.questions as QuestionFromJSON[]

  console.log(`Found ${questions.length} questions`)

  console.log('🗺️  Getting topic mappings...')
  const topicMap = await getTopicMap()

  console.log('📝 Transforming questions...')

  const uniqueTopics = [...new Set(questions.map((q) => q.topic))]
  console.log('  Topics in JSON:')
  uniqueTopics.forEach((t) => console.log(`    - ${t}`))

  const missingTopics = uniqueTopics.filter((t) => !topicMap[t])
  if (missingTopics.length > 0) {
    console.error('\n❌ Missing topics in database:')
    missingTopics.forEach((t) => console.error(`  - ${t}`))
    console.error('\nAvailable topics:')
    Object.keys(topicMap).forEach((t) => console.error(`  - ${t}`))
    throw new Error(`Topics not found in database: ${missingTopics.join(', ')}`)
  }

  const transformedQuestions = questions.map((q) => {
    const topicId = topicMap[q.topic]
    if (!topicId) {
      throw new Error(`Topic not found: ${q.topic}`)
    }
    return transformQuestion(q, topicId)
  })

  console.log('💾 Inserting questions...')

  const batchSize = 100
  let inserted = 0

  for (let i = 0; i < transformedQuestions.length; i += batchSize) {
    const batch = transformedQuestions.slice(i, i + batchSize)

    for (const q of batch) {
      await sql`
        INSERT INTO public.questions (
          question_text, type, options, correct_answers, explanation, difficulty, topic_id, is_active
        ) VALUES (
          ${q.question_text},
          ${q.type},
          ${JSON.stringify(q.options)},
          ${JSON.stringify(q.correct_answers)},
          ${q.explanation ?? null},
          ${q.difficulty},
          ${q.topic_id}::uuid,
          ${q.is_active ?? true}
        )
      `
    }

    inserted += batch.length
    console.log(`  Inserted ${inserted}/${transformedQuestions.length} questions`)
  }

  console.log(`✅ Successfully inserted all ${inserted} questions`)
}

async function clearExistingData() {
  console.log('🗑️  Clearing existing questions...')
  await sql`DELETE FROM public.questions`
  console.log('✅ Cleared existing questions')
}

async function main() {
  try {
    console.log('🚀 Starting seed process...\n')

    const args = process.argv.slice(2)
    const skipConfirmation = args.includes('--yes') || args.includes('-y')

    if (!skipConfirmation) {
      console.log('⚠️  This will clear ALL existing questions and insert new ones.')
      console.log('   Add --yes or -y to skip this confirmation.\n')
      console.log('   Press Ctrl+C to cancel, or press Enter to continue...')

      await new Promise((resolve) => {
        process.stdin.once('data', resolve)
      })
    }

    await clearExistingData()
    await seedTopics()
    await seedQuestions()

    console.log('\n✨ Seed completed successfully!')
    await sql.end()
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Seed failed:', error)
    await sql.end({ timeout: 5 })
    process.exit(1)
  }
}

main()
