const fs = require('fs');
const path = require('path');

// Read the questions file
const questionsPath = path.join(__dirname, '..', 'canadaquiz_questions.json');
const data = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

const issues = [];
const stats = {
  total: 0,
  byType: {},
  byDifficulty: {},
  byTopic: {}
};

// Validate each question
data.questions.forEach((q, index) => {
  stats.total++;
  
  // Count by type
  stats.byType[q.type] = (stats.byType[q.type] || 0) + 1;
  
  // Count by difficulty
  const difficulty = q.difficulty || 'Unknown';
  stats.byDifficulty[difficulty] = (stats.byDifficulty[difficulty] || 0) + 1;
  
  // Count by topic
  const topic = q.topic || 'Unknown';
  stats.byTopic[topic] = (stats.byTopic[topic] || 0) + 1;
  
  // Check for missing fields
  if (!q.question || q.question.trim() === '') {
    issues.push({
      index,
      type: 'missing_question',
      message: 'Question text is missing or empty'
    });
  }
  
  if (!q.explanation || q.explanation.trim() === '') {
    issues.push({
      index,
      type: 'missing_explanation',
      message: 'Explanation is missing or empty'
    });
  }
  
  if (!q.type) {
    issues.push({
      index,
      type: 'missing_type',
      message: 'Question type is missing'
    });
  }
  
  // Validate by question type
  if (q.type === 'single' || q.type === 'multiple') {
    if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
      issues.push({
        index,
        type: 'invalid_options',
        message: `Options array invalid or has less than 2 options`,
        question: q.question?.substring(0, 60)
      });
    }
    
    if (!q.correctAnswer && !Array.isArray(q.correctAnswer)) {
      issues.push({
        index,
        type: 'missing_answer',
        message: 'correctAnswer is missing',
        question: q.question?.substring(0, 60)
      });
    }
    
    // Check if correct answer refers to valid option
    if (q.type === 'single' && q.correctAnswer) {
      const validOptions = ['A', 'B', 'C', 'D', 'E', 'F'];
      if (!validOptions.includes(q.correctAnswer)) {
        issues.push({
          index,
          type: 'invalid_answer_key',
          message: `correctAnswer "${q.correctAnswer}" is not a valid option letter`,
          question: q.question?.substring(0, 60)
        });
      }
    }
    
    if (q.type === 'multiple' && Array.isArray(q.correctAnswer)) {
      const validOptions = ['A', 'B', 'C', 'D', 'E', 'F'];
      const invalidAnswers = q.correctAnswer.filter(ans => !validOptions.includes(ans));
      if (invalidAnswers.length > 0) {
        issues.push({
          index,
          type: 'invalid_answer_key',
          message: `correctAnswer contains invalid option letters: ${invalidAnswers.join(', ')}`,
          question: q.question?.substring(0, 60)
        });
      }
    }
  }
  
  if (q.type === 'boolean') {
    if (q.correctAnswer !== 'True' && q.correctAnswer !== 'False') {
      issues.push({
        index,
        type: 'invalid_boolean_answer',
        message: `Boolean question has invalid answer: "${q.correctAnswer}" (should be "True" or "False")`,
        question: q.question?.substring(0, 60)
      });
    }
  }
  
  if (q.type === 'fill') {
    if (!q.correctAnswer || q.correctAnswer.trim() === '') {
      issues.push({
        index,
        type: 'missing_fill_answer',
        message: 'Fill-in-the-blank question is missing correctAnswer',
        question: q.question?.substring(0, 60)
      });
    }
  }
  
  // Check for duplicate questions
  const duplicates = data.questions.filter((other, otherIndex) => 
    otherIndex !== index && 
    other.question?.toLowerCase().trim() === q.question?.toLowerCase().trim()
  );
  
  if (duplicates.length > 0) {
    issues.push({
      index,
      type: 'duplicate_question',
      message: 'Duplicate question text found',
      question: q.question?.substring(0, 60)
    });
  }
});

// Output results
console.log('\n=== QUESTION VALIDATION REPORT ===\n');
console.log(`Total questions: ${stats.total}`);
console.log('\nBy Type:');
Object.entries(stats.byType).forEach(([type, count]) => {
  console.log(`  ${type}: ${count}`);
});

console.log('\nBy Difficulty:');
Object.entries(stats.byDifficulty).forEach(([diff, count]) => {
  console.log(`  ${diff}: ${count}`);
});

console.log('\nBy Topic:');
Object.entries(stats.byTopic).sort((a, b) => b[1] - a[1]).forEach(([topic, count]) => {
  console.log(`  ${topic}: ${count}`);
});

console.log(`\n=== ISSUES FOUND: ${issues.length} ===\n`);

if (issues.length > 0) {
  // Group by type
  const byType = {};
  issues.forEach(issue => {
    if (!byType[issue.type]) byType[issue.type] = [];
    byType[issue.type].push(issue);
  });
  
  Object.entries(byType).forEach(([type, typeIssues]) => {
    console.log(`\n${type.toUpperCase()} (${typeIssues.length}):`);
    typeIssues.slice(0, 10).forEach(issue => {
      console.log(`  Question #${issue.index + 1}: ${issue.message}`);
      if (issue.question) {
        console.log(`    "${issue.question}..."`);
      }
    });
    if (typeIssues.length > 10) {
      console.log(`  ... and ${typeIssues.length - 10} more`);
    }
  });
} else {
  console.log('No issues found! ✓');
}

// Save detailed report
const reportPath = path.join(__dirname, 'validation-report.json');
fs.writeFileSync(reportPath, JSON.stringify({
  stats,
  issues,
  timestamp: new Date().toISOString()
}, null, 2));

console.log(`\nDetailed report saved to: ${reportPath}`);
