require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function importQuestions() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('📚 Starting question import...\n');

  const questionsPath = path.join(__dirname, 'questions.json');
  
  if (!fs.existsSync(questionsPath)) {
    console.error(`❌ Questions file not found: ${questionsPath}`);
    process.exit(1);
  }

  const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
  
  if (!Array.isArray(questionsData)) {
    console.error('❌ Questions file must contain an array of questions');
    process.exit(1);
  }

  console.log(`📋 Found ${questionsData.length} questions to import\n`);

  const { data: topics, error: topicsError } = await supabase
    .from('topics')
    .select('id, name, slug');

  if (topicsError) {
    console.error('❌ Failed to fetch topics:', topicsError);
    process.exit(1);
  }

  const topicMap = new Map();
  topics.forEach(topic => {
    topicMap.set(topic.name.toLowerCase(), topic.id);
    topicMap.set(topic.slug.toLowerCase(), topic.id);
  });

  console.log(`✅ Loaded ${topics.length} topics\n`);

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < questionsData.length; i++) {
    const question = questionsData[i];
    
    const topicKey = (question.topic || '').toLowerCase();
    const topicId = topicMap.get(topicKey);

    if (!topicId) {
      errorCount++;
      errors.push({
        index: i + 1,
        question: question.question_text?.substring(0, 50) || 'Unknown',
        error: `Topic not found: "${question.topic}"`
      });
      continue;
    }

    const questionData = {
      topic_id: topicId,
      type: question.type,
      question_text: question.question_text,
      options: question.options || [],
      correct_answers: question.correct_answers || [],
      explanation: question.explanation || null,
      difficulty: question.difficulty || 'medium'
    };

    if (!questionData.question_text || !questionData.type) {
      errorCount++;
      errors.push({
        index: i + 1,
        question: question.question_text?.substring(0, 50) || 'Unknown',
        error: 'Missing required fields: question_text or type'
      });
      continue;
    }

    const { error } = await supabase
      .from('questions')
      .upsert(
        questionData,
        {
          onConflict: 'question_text,topic_id',
          ignoreDuplicates: false
        }
      );

    if (error) {
      errorCount++;
      errors.push({
        index: i + 1,
        question: question.question_text?.substring(0, 50),
        error: error.message
      });
    } else {
      successCount++;
    }

    if ((i + 1) % 100 === 0) {
      console.log(`📊 Progress: ${i + 1}/${questionsData.length} questions processed (${successCount} success, ${errorCount} errors)`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ Import Complete!\n');
  console.log(`✅ Successfully imported: ${successCount} questions`);
  console.log(`❌ Failed: ${errorCount} questions`);
  console.log('='.repeat(60));

  if (errors.length > 0) {
    console.log('\n❌ Errors encountered:\n');
    errors.slice(0, 10).forEach(err => {
      console.log(`  #${err.index}: "${err.question}..."`);
      console.log(`    → ${err.error}\n`);
    });
    
    if (errors.length > 10) {
      console.log(`  ... and ${errors.length - 10} more errors\n`);
    }
  }

  process.exit(errorCount > 0 ? 1 : 0);
}

importQuestions().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
