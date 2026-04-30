const fs = require('fs');
const path = require('path');

// Read the questions file
const questionsPath = path.join(__dirname, '..', 'canadaquiz_questions.json');
const data = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

const contentIssues = [];
const warnings = [];

// Known facts for validation
const KNOWN_FACTS = {
  canadaFoundingYear: '1867',
  constitution1982: '1982',
  officialLanguages: ['English', 'French'],
  provinces: 10,
  territories: 3,
  votingAge: 18,
  capitalCity: 'Ottawa',
  headOfState: ['King', 'Monarch', 'Crown'],
  headOfGovernment: 'Prime Minister',
  legislature: 'Parliament',
  upperHouse: 'Senate',
  lowerHouse: 'House of Commons',
  supremeCourt: 'Supreme Court',
};

// Common errors to detect
const PATTERNS_TO_FLAG = {
  outdatedTerms: [
    /\bQueen\b/i,  // Should be King or Monarch (if after 2022)
    /\bIndian Act\b/i, // Sensitive terminology
  ],
  ambiguousWording: [
    /\ball of the above\b/i,
    /\bnone of the above\b/i,
    /\balways\b/i,
    /\bnever\b/i,
  ],
  potentialErrors: [
    /\b1868\b/, // Common typo for 1867
    /\b1981\b/, // Common typo for 1982
    /11 provinces/i,
    /2 territories/i,
    /4 territories/i,
  ]
};

// Review each question
data.questions.forEach((q, index) => {
  const qNum = index + 1;
  
  // Check for outdated terms
  PATTERNS_TO_FLAG.outdatedTerms.forEach(pattern => {
    if (pattern.test(q.question) || q.explanation?.match(pattern)) {
      warnings.push({
        questionNum: qNum,
        type: 'outdated_term',
        question: q.question.substring(0, 80),
        issue: `Contains potentially outdated term: ${pattern.source}`,
        fullQuestion: q.question,
        explanation: q.explanation
      });
    }
  });
  
  // Check for ambiguous wording
  PATTERNS_TO_FLAG.ambiguousWording.forEach(pattern => {
    if (pattern.test(q.question)) {
      warnings.push({
        questionNum: qNum,
        type: 'ambiguous_wording',
        question: q.question.substring(0, 80),
        issue: `Contains ambiguous wording: ${pattern.source}`,
        fullQuestion: q.question
      });
    }
  });
  
  // Check for potential factual errors
  PATTERNS_TO_FLAG.potentialErrors.forEach(pattern => {
    const matchQ = q.question.match(pattern);
    const matchE = q.explanation?.match(pattern);
    if (matchQ || matchE) {
      contentIssues.push({
        questionNum: qNum,
        type: 'potential_factual_error',
        question: q.question.substring(0, 80),
        issue: `Potential factual error: "${matchQ?.[0] || matchE?.[0]}" - please verify`,
        fullQuestion: q.question,
        explanation: q.explanation
      });
    }
  });
  
  // Check for missing explanation
  if (!q.explanation || q.explanation.trim().length < 10) {
    contentIssues.push({
      questionNum: qNum,
      type: 'weak_explanation',
      question: q.question.substring(0, 80),
      issue: 'Explanation is too short or missing'
    });
  }
  
  // Check boolean questions for proper structure
  if (q.type === 'boolean') {
    // Check if question is phrased as a statement
    const isQuestion = /\?$/.test(q.question.trim());
    if (isQuestion) {
      warnings.push({
        questionNum: qNum,
        type: 'boolean_format',
        question: q.question.substring(0, 80),
        issue: 'Boolean question should be a statement, not end with "?"',
        fullQuestion: q.question
      });
    }
    
    // Check if answer matches explanation
    const correctAnswer = q.correctAnswer;
    const explanation = q.explanation?.toLowerCase() || '';
    
    if (correctAnswer === 'True' && (explanation.includes('false') || explanation.includes('incorrect'))) {
      contentIssues.push({
        questionNum: qNum,
        type: 'answer_explanation_mismatch',
        question: q.question.substring(0, 80),
        issue: 'Answer is True but explanation suggests False',
        correctAnswer,
        explanation: q.explanation
      });
    }
    
    if (correctAnswer === 'False' && explanation.includes('this is true') || explanation.includes('this is correct')) {
      contentIssues.push({
        questionNum: qNum,
        type: 'answer_explanation_mismatch',
        question: q.question.substring(0, 80),
        issue: 'Answer is False but explanation suggests True',
        correctAnswer,
        explanation: q.explanation
      });
    }
  }
  
  // Check for options that are too similar
  if (q.options && Array.isArray(q.options)) {
    for (let i = 0; i < q.options.length; i++) {
      for (let j = i + 1; j < q.options.length; j++) {
        const opt1 = q.options[i].toLowerCase();
        const opt2 = q.options[j].toLowerCase();
        
        // Calculate simple similarity
        const words1 = opt1.split(/\s+/);
        const words2 = opt2.split(/\s+/);
        const commonWords = words1.filter(w => words2.includes(w) && w.length > 3);
        
        if (commonWords.length > 3) {
          warnings.push({
            questionNum: qNum,
            type: 'similar_options',
            question: q.question.substring(0, 80),
            issue: `Options ${i+1} and ${j+1} may be too similar`,
            option1: q.options[i],
            option2: q.options[j]
          });
        }
      }
    }
  }
  
  // Check multiple choice for correct answer validation
  if (q.type === 'single' && q.options) {
    const correctKey = q.correctAnswer;
    const optionKeys = ['A', 'B', 'C', 'D', 'E', 'F'];
    
    if (!optionKeys.slice(0, q.options.length).includes(correctKey)) {
      contentIssues.push({
        questionNum: qNum,
        type: 'invalid_correct_answer',
        question: q.question.substring(0, 80),
        issue: `Correct answer "${correctKey}" doesn't match available options (${q.options.length} options)`,
        correctAnswer: correctKey,
        options: q.options
      });
    }
  }
});

// Output results
console.log('\n=== CONTENT REVIEW REPORT ===\n');
console.log(`Total questions reviewed: ${data.questions.length}`);
console.log(`Content issues found: ${contentIssues.length}`);
console.log(`Warnings: ${warnings.length}`);

if (contentIssues.length > 0) {
  console.log('\n=== CONTENT ISSUES (MUST FIX) ===\n');
  
  const byType = {};
  contentIssues.forEach(issue => {
    if (!byType[issue.type]) byType[issue.type] = [];
    byType[issue.type].push(issue);
  });
  
  Object.entries(byType).forEach(([type, issues]) => {
    console.log(`\n${type.toUpperCase().replace(/_/g, ' ')} (${issues.length}):`);
    issues.forEach((issue, idx) => {
      if (idx < 20) { // Show first 20 of each type
        console.log(`\n  Question #${issue.questionNum}:`);
        console.log(`    "${issue.question}..."`);
        console.log(`    Issue: ${issue.issue}`);
        if (issue.correctAnswer) {
          console.log(`    Correct Answer: ${issue.correctAnswer}`);
        }
        if (issue.explanation) {
          console.log(`    Explanation: ${issue.explanation.substring(0, 100)}...`);
        }
      }
    });
    if (issues.length > 20) {
      console.log(`\n  ... and ${issues.length - 20} more issues of this type`);
    }
  });
}

if (warnings.length > 0) {
  console.log('\n\n=== WARNINGS (REVIEW RECOMMENDED) ===\n');
  
  const byType = {};
  warnings.forEach(warning => {
    if (!byType[warning.type]) byType[warning.type] = [];
    byType[warning.type].push(warning);
  });
  
  Object.entries(byType).forEach(([type, warns]) => {
    console.log(`\n${type.toUpperCase().replace(/_/g, ' ')} (${warns.length}):`);
    warns.slice(0, 10).forEach(warning => {
      console.log(`\n  Question #${warning.questionNum}:`);
      console.log(`    "${warning.question}..."`);
      console.log(`    Issue: ${warning.issue}`);
      if (warning.fullQuestion && warning.fullQuestion.length < 150) {
        console.log(`    Full: "${warning.fullQuestion}"`);
      }
    });
    if (warns.length > 10) {
      console.log(`\n  ... and ${warns.length - 10} more warnings of this type`);
    }
  });
}

// Save detailed report
const reportPath = path.join(__dirname, 'content-review-report.json');
fs.writeFileSync(reportPath, JSON.stringify({
  summary: {
    totalQuestions: data.questions.length,
    contentIssues: contentIssues.length,
    warnings: warnings.length
  },
  contentIssues,
  warnings,
  timestamp: new Date().toISOString()
}, null, 2));

console.log(`\n\nDetailed report saved to: ${reportPath}`);
console.log('\nNext steps:');
console.log('  1. Review all CONTENT ISSUES and fix them');
console.log('  2. Review WARNINGS for potential improvements');
console.log('  3. Run manual spot-checks on random samples');
