require('dotenv').config({ path: '.env.local' })
const postgres = require('postgres')
const fs = require('fs')
const path = require('path')

async function importQuestions() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.error('❌ Missing DATABASE_URL in .env.local')
    process.exit(1)
  }

  const sql = postgres(databaseUrl, { ssl: false, max: 1 })

  console.log('📚 Starting question import...\n')

  const questionsPath = path.join(__dirname, 'questions.json')

  if (!fs.existsSync(questionsPath)) {
    console.error(`❌ Questions file not found: ${questionsPath}`)
    await sql.end({ timeout: 5 })
    process.exit(1)
  }

  const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'))

  if (!Array.isArray(questionsData)) {
    console.error('❌ Questions file must contain an array of questions')
    await sql.end({ timeout: 5 })
    process.exit(1)
  }

  console.log(`📋 Found ${questionsData.length} questions to import\n`)

  const topics = await sql`
    SELECT id, name, slug FROM public.topics
  `

  const topicMap = new Map()
  topics.forEach((topic) => {
    topicMap.set(topic.name.toLowerCase(), topic.id)
    topicMap.set(topic.slug.toLowerCase(), topic.id)
  })

  console.log(`✅ Loaded ${topics.length} topics\n`)

  let successCount = 0
  let errorCount = 0
  const errors = []

  for (let i = 0; i < questionsData.length; i++) {
    const question = questionsData[i]

    const topicKey = (question.topic || '').toLowerCase()
    const topicId = topicMap.get(topicKey)

    if (!topicId) {
      errorCount++
      errors.push({
        index: i + 1,
        question: question.question_text?.substring(0, 50) || 'Unknown',
        error: `Topic not found: "${question.topic}"`,
      })
      continue
    }

    if (!question.question_text || !question.type) {
      errorCount++
      errors.push({
        index: i + 1,
        question: question.question_text?.substring(0, 50) || 'Unknown',
        error: 'Missing required fields: question_text or type',
      })
      continue
    }

    try {
      await sql`
        INSERT INTO public.questions (
          topic_id,
          type,
          question_text,
          options,
          correct_answers,
          explanation,
          difficulty
        ) VALUES (
          ${topicId}::uuid,
          ${question.type},
          ${question.question_text},
          ${JSON.stringify(question.options || [])},
          ${JSON.stringify(question.correct_answers || [])},
          ${question.explanation || null},
          ${question.difficulty || 'medium'}
        )
      `
      successCount++
    } catch (error) {
      errorCount++
      errors.push({
        index: i + 1,
        question: question.question_text?.substring(0, 50),
        error: error.message,
      })
    }

    if ((i + 1) % 100 === 0) {
      console.log(
        `📊 Progress: ${i + 1}/${questionsData.length} questions processed (${successCount} success, ${errorCount} errors)`
      )
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('✨ Import Complete!\n')
  console.log(`✅ Successfully imported: ${successCount} questions`)
  console.log(`❌ Failed: ${errorCount} questions`)
  console.log('='.repeat(60))

  if (errors.length > 0) {
    console.log('\n❌ Errors encountered:\n')
    errors.slice(0, 10).forEach((err) => {
      console.log(`  #${err.index}: "${err.question}..."`)
      console.log(`    → ${err.error}\n`)
    })

    if (errors.length > 10) {
      console.log(`  ... and ${errors.length - 10} more errors\n`)
    }
  }

  await sql.end({ timeout: 5 })
  process.exit(errorCount > 0 ? 1 : 0)
}

importQuestions().catch(async (err) => {
  console.error('❌ Unexpected error:', err)
  process.exit(1)
})
