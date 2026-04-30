import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'
import type { Database } from '../types/database.types'

// Load environment variables from .env.local
config({ path: join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

// Topic mapping with descriptions
const TOPICS = [
  {
    name: 'Rights and Responsibilities',
    slug: 'rights-and-responsibilities',
    description: 'Canadian citizenship rights and responsibilities',
    sort_order: 1
  },
  {
    name: 'Who Are Canadians',
    slug: 'who-are-canadians',
    description: 'Canadian identity, diversity, and Indigenous peoples',
    sort_order: 2
  },
  {
    name: "Canada's History",
    slug: 'canadas-history',
    description: 'Historical events and milestones in Canadian history',
    sort_order: 3
  },
  {
    name: 'Government',
    slug: 'government',
    description: 'Canadian government structure and institutions',
    sort_order: 4
  },
  {
    name: 'Federal Elections',
    slug: 'federal-elections',
    description: 'Electoral system and voting process',
    sort_order: 5
  },
  {
    name: 'Justice System',
    slug: 'justice-system',
    description: 'Canadian laws and justice system',
    sort_order: 6
  },
  {
    name: 'Canadian Symbols',
    slug: 'canadian-symbols',
    description: 'National symbols and heritage',
    sort_order: 7
  },
  {
    name: "Canada's Regions",
    slug: 'canadas-regions',
    description: 'Geographic regions and provincial characteristics',
    sort_order: 8
  },
  {
    name: "Canada's Economy",
    slug: 'canadas-economy',
    description: 'Economic sectors and industries',
    sort_order: 9
  },
  {
    name: 'Modern Canada',
    slug: 'modern-canada',
    description: 'Contemporary Canadian society and culture',
    sort_order: 10
  },
  {
    name: 'Applying for Citizenship',
    slug: 'applying-for-citizenship',
    description: 'Citizenship application process and requirements',
    sort_order: 11
  }
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
  
  const { data: existingTopics, error: fetchError } = await supabase
    .from('topics')
    .select('name, slug')
  
  if (fetchError) {
    console.error('Error fetching topics:', fetchError)
    throw fetchError
  }

  const existingTopicSlugs = new Set(existingTopics?.map(t => t.slug) || [])
  const topicsToInsert = TOPICS.filter(t => !existingTopicSlugs.has(t.slug))

  if (topicsToInsert.length === 0) {
    console.log('✅ All topics already exist')
    return
  }

  // Insert topics one by one to handle partial failures
  let inserted = 0
  for (const topic of topicsToInsert) {
    const { error } = await supabase
      .from('topics')
      .insert(topic)
    
    if (error) {
      // Skip if already exists (might have been created between checks)
      if (error.code === '23505') {
        console.log(`  ⏭️  Topic "${topic.name}" already exists, skipping`)
        continue
      }
      console.error(`Error inserting topic "${topic.name}":`, error)
      throw error
    }
    inserted++
  }

  console.log(`✅ Inserted ${inserted} new topics`)
}

async function getTopicMap(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('topics')
    .select('id, name, slug')

  if (error) {
    console.error('Error fetching topics:', error)
    throw error
  }

  console.log('  Topics in database:')
  data?.forEach(topic => {
    console.log(`    - ${topic.name} (${topic.slug})`)
  })

  const map: Record<string, string> = {}
  
  // Create a flexible mapping that handles variations
  data?.forEach(topic => {
    // Exact match by name
    map[topic.name] = topic.id
    
    // Also map common variations
    // "Justice System" -> "justice-system" slug
    const normalized = topic.name.toLowerCase().replace(/[']/g, '').trim()
    map[normalized] = topic.id
  })

  // Add manual mappings for common variations in the JSON
  const nameToSlugMap: Record<string, string> = {
    'Rights and Responsibilities': 'rights-and-responsibilities',
    'Who Are Canadians': 'who-are-canadians',
    "Canada's History": 'canadas-history',
    'Government': 'government',
    'Federal Elections': 'federal-elections',
    'Justice System': 'justice-system',
    'Canadian Symbols': 'canadian-symbols',
    "Canada's Regions": 'canadas-regions',
    "Canada's Economy": 'canadas-economy',
    'Modern Canada': 'modern-canada',
    'Applying for Citizenship': 'applying-for-citizenship'
  }

  // Map by matching slug
  data?.forEach(topic => {
    Object.entries(nameToSlugMap).forEach(([jsonName, expectedSlug]) => {
      if (topic.slug === expectedSlug) {
        map[jsonName] = topic.id
      }
    })
  })

  return map
}

// Generate plausible distractors for fill-in-the-blank questions
function generateDistractors(correctAnswer: string, questionText: string): string[] {
  // Common Canadian civic knowledge that can serve as distractors
  const commonDistractors: Record<string, string[]> = {
    'constitution': ['Charter', 'Bill of Rights', 'Magna Carta'],
    'charter': ['Constitution', 'Bill of Rights', 'Declaration'],
    'ottawa': ['Toronto', 'Montreal', 'Quebec City'],
    'queen': ['Prime Minister', 'Governor General', 'President'],
    'king': ['Prime Minister', 'Governor General', 'President'],
    'parliament': ['Senate', 'House of Commons', 'Legislature'],
    '1867': ['1867', '1812', '1982', '1945'],
    'senate': ['Parliament', 'House of Commons', 'Cabinet'],
    'prime minister': ['President', 'Governor General', 'Monarch'],
    'provinces': ['states', 'territories', 'counties'],
    'federal': ['provincial', 'municipal', 'territorial'],
  }
  
  // Try to find contextual distractors
  const lowerAnswer = correctAnswer.toLowerCase()
  for (const [key, values] of Object.entries(commonDistractors)) {
    if (lowerAnswer.includes(key)) {
      return values.slice(0, 3)
    }
  }
  
  // Generic but plausible distractors for civic questions
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
  
  // Filter out the correct answer and return 3 random distractors
  const availableDistractors = genericDistractors
    .filter(d => d.toLowerCase() !== lowerAnswer)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
  
  return availableDistractors
}

function transformQuestion(
  question: QuestionFromJSON,
  topicId: string
): Database['public']['Tables']['questions']['Insert'] {
  // Normalize difficulty
  const difficulty = question.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'
  
  // Transform based on question type
  let options: Array<{ key: string; text: string }> | object
  let correctAnswers: string[] | object

  // Helper function to convert options array to key-value format
  const formatOptions = (opts: string[]): Array<{ key: string; text: string }> => {
    const keys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    return opts.map((text, index) => {
      // Remove leading letter prefix (e.g., "A. ", "B. ", etc.)
      const cleanText = text.replace(/^[A-Z]\.\s*/, '')
      return {
        key: keys[index] || String.fromCharCode(97 + index),
        text: cleanText
      }
    })
  }

  // Helper function to convert answer letters to array format
  const formatAnswer = (answer: string | string[]): string[] => {
    if (Array.isArray(answer)) {
      return answer.map(a => a.toLowerCase())
    }
    return [answer.toLowerCase()]
  }

  switch (question.type) {
    case 'single':
      options = formatOptions(question.options || [])
      // correctAnswer is like "B", we store it as ["b"]
      correctAnswers = formatAnswer(question.correctAnswer as string)
      break
    
    case 'multiple':
      options = formatOptions(question.options || [])
      // correctAnswer is an array like ["A", "C", "D"], store as ["a", "c", "d"]
      correctAnswers = formatAnswer(question.correctAnswer as string[])
      break
    
    case 'boolean':
      options = formatOptions(['True', 'False'])
      // Convert "True"/"False" text to option keys "a"/"b"
      const boolAnswer = question.correctAnswer as string
      correctAnswers = [boolAnswer === 'True' ? 'a' : 'b']
      break
    
    case 'fill':
      // Convert fill-in-the-blank to single choice by generating plausible options
      const correctAnswer = question.correctAnswer as string
      const distractors = generateDistractors(correctAnswer, question.question)
      
      // Shuffle so correct answer isn't always first
      const allOptions = [correctAnswer, ...distractors]
      const shuffledWithIndex = allOptions
        .map((opt, idx) => ({ opt, isCorrect: idx === 0 }))
        .sort(() => Math.random() - 0.5)
      
      options = formatOptions(shuffledWithIndex.map(item => item.opt))
      
      // Find which position has the correct answer
      const correctIndex = shuffledWithIndex.findIndex(item => item.isCorrect)
      const keys = ['a', 'b', 'c', 'd']
      correctAnswers = [keys[correctIndex]]
      break
    
    case 'matching':
      // Store matchPairs as options, and the pairs themselves as correct answers
      options = question.matchPairs || []
      correctAnswers = question.matchPairs || []
      break
  }

  return {
    question_text: question.question,
    type: question.type === 'fill' ? 'single' : question.type, // Convert fill to single choice
    options: options as any,
    correct_answers: correctAnswers as any,
    explanation: question.explanation,
    difficulty: difficulty,
    topic_id: topicId,
    is_active: true
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
  
  // Check for any missing topics
  const uniqueTopics = [...new Set(questions.map(q => q.topic))]
  console.log('  Topics in JSON:')
  uniqueTopics.forEach(t => console.log(`    - ${t}`))
  
  const missingTopics = uniqueTopics.filter(t => !topicMap[t])
  if (missingTopics.length > 0) {
    console.error('\n❌ Missing topics in database:')
    missingTopics.forEach(t => console.error(`  - ${t}`))
    console.error('\nAvailable topics:')
    Object.keys(topicMap).forEach(t => console.error(`  - ${t}`))
    throw new Error(`Topics not found in database: ${missingTopics.join(', ')}`)
  }
  
  const transformedQuestions = questions.map(q => {
    const topicId = topicMap[q.topic]
    if (!topicId) {
      throw new Error(`Topic not found: ${q.topic}`)
    }
    return transformQuestion(q, topicId)
  })

  console.log('💾 Inserting questions...')
  
  // Insert in batches of 100 to avoid timeouts
  const batchSize = 100
  let inserted = 0
  
  for (let i = 0; i < transformedQuestions.length; i += batchSize) {
    const batch = transformedQuestions.slice(i, i + batchSize)
    const { error } = await supabase
      .from('questions')
      .insert(batch)
    
    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error)
      throw error
    }
    
    inserted += batch.length
    console.log(`  Inserted ${inserted}/${transformedQuestions.length} questions`)
  }

  console.log(`✅ Successfully inserted all ${inserted} questions`)
}

async function clearExistingData() {
  console.log('🗑️  Clearing existing questions...')
  const { error } = await supabase
    .from('questions')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
  
  if (error) {
    console.error('Error clearing questions:', error)
    throw error
  }
  
  console.log('✅ Cleared existing questions')
}

async function main() {
  try {
    console.log('🚀 Starting seed process...\n')
    
    // Ask for confirmation
    const args = process.argv.slice(2)
    const skipConfirmation = args.includes('--yes') || args.includes('-y')
    
    if (!skipConfirmation) {
      console.log('⚠️  This will clear ALL existing questions and insert 1001 new ones.')
      console.log('   Add --yes or -y to skip this confirmation.\n')
      console.log('   Press Ctrl+C to cancel, or press Enter to continue...')
      
      await new Promise(resolve => {
        process.stdin.once('data', resolve)
      })
    }

    await clearExistingData()
    await seedTopics()
    await seedQuestions()
    
    console.log('\n✨ Seed completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Seed failed:', error)
    process.exit(1)
  }
}

main()
