const fs = require('fs');
const path = require('path');

// Read the questions file
const questionsPath = path.join(__dirname, '..', 'canadaquiz_questions.json');
const data = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

// Group by topic
const byTopic = {};
data.questions.forEach((q, index) => {
  const topic = q.topic || 'Unknown';
  if (!byTopic[topic]) byTopic[topic] = [];
  byTopic[topic].push({ ...q, originalIndex: index + 1 });
});

// Sample questions from each topic
console.log('=== MANUAL REVIEW SAMPLES ===\n');
console.log('Review these samples for factual accuracy:\n');

Object.entries(byTopic).forEach(([topic, questions]) => {
  console.log(`\n### ${topic} (${questions.length} total questions)`);
  console.log('─'.repeat(80));
  
  // Take 5 random samples per topic
  const samples = questions
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(5, questions.length));
  
  samples.forEach((q, idx) => {
    console.log(`\n${idx + 1}. Question #${q.originalIndex} [${q.type}] [${q.difficulty}]`);
    console.log(`   Q: ${q.question}`);
    
    if (q.options && Array.isArray(q.options)) {
      q.options.forEach(opt => {
        console.log(`      ${opt}`);
      });
    }
    
    const correctAnswer = Array.isArray(q.correctAnswer) 
      ? q.correctAnswer.join(', ') 
      : q.correctAnswer;
    console.log(`   ✓ Answer: ${correctAnswer}`);
    console.log(`   📝 Explanation: ${q.explanation}`);
  });
  
  console.log('');
});

// Save to file for detailed review
const outputPath = path.join(__dirname, 'manual-review-samples.txt');
const output = [];

Object.entries(byTopic).forEach(([topic, questions]) => {
  output.push(`\n${'='.repeat(80)}`);
  output.push(`${topic} (${questions.length} total questions)`);
  output.push('='.repeat(80));
  
  const samples = questions
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(5, questions.length));
  
  samples.forEach((q, idx) => {
    output.push(`\n${idx + 1}. Question #${q.originalIndex} [${q.type}] [${q.difficulty}]`);
    output.push(`Q: ${q.question}`);
    
    if (q.options && Array.isArray(q.options)) {
      q.options.forEach(opt => output.push(`   ${opt}`));
    }
    
    const correctAnswer = Array.isArray(q.correctAnswer) 
      ? q.correctAnswer.join(', ') 
      : q.correctAnswer;
    output.push(`✓ Answer: ${correctAnswer}`);
    output.push(`Explanation: ${q.explanation}`);
    output.push('');
  });
});

fs.writeFileSync(outputPath, output.join('\n'));
console.log(`\nSaved to: ${outputPath}`);
