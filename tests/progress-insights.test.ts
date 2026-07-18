import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildTodayStudyPlan,
  buildWeakTopicRecommendations,
  formatIncorrectReviewSummary,
  selectUniqueIncorrectQuestionIds,
} from '../lib/progress-insights'

test('prioritizes weak topic recommendations by low best score and recent practice gaps', () => {
  const recommendations = buildWeakTopicRecommendations([
    { topic_id: 'history', topic_name: 'History', best_score: 4, sessions_count: 3, last_attempted: '2026-01-10T00:00:00.000Z' },
    { topic_id: 'rights', topic_name: 'Rights', best_score: 9, sessions_count: 2, last_attempted: '2026-01-11T00:00:00.000Z' },
    { topic_id: 'geography', topic_name: 'Geography', best_score: null, sessions_count: 0, last_attempted: null },
    { topic_id: 'government', topic_name: 'Government', best_score: 6, sessions_count: 1, last_attempted: '2026-01-12T00:00:00.000Z' },
  ], 3)

  assert.deepEqual(recommendations.map((item) => item.topic_name), [
    'Geography',
    'History',
    'Government',
  ])
  assert.equal(recommendations[0].reason, 'Not started yet')
  assert.equal(recommendations[1].reason, 'Best score below 60%')
  assert.equal(recommendations[2].reason, 'Needs another practice run')
})

test('formats incorrect review summaries with correct-answer labels', () => {
  assert.equal(
    formatIncorrectReviewSummary({ correct_answers: ['B'], options: [{ key: 'A', text: 'Wrong' }, { key: 'B', text: 'Correct choice' }] }),
    'Correct answer: Correct choice',
  )
  assert.equal(
    formatIncorrectReviewSummary({ correct_answers: ['A', 'C'], options: [{ key: 'A', text: 'One' }, { key: 'C', text: 'Three' }] }),
    'Correct answers: One; Three',
  )
  assert.equal(formatIncorrectReviewSummary({ correct_answers: ['True'], options: [] }), 'Correct answer: True')
})

test('selects recent unique incorrect question ids for review sessions', () => {
  const ids = selectUniqueIncorrectQuestionIds([
    { question_id: 'q1' },
    { question_id: 'q2' },
    { question_id: 'q1' },
    { question_id: null },
    { question_id: 'q3' },
  ], 2)

  assert.deepEqual(ids, ['q1', 'q2'])
})

test('builds a prioritized daily study plan from missed answers, weak topics, and mock exams', () => {
  const plan = buildTodayStudyPlan({
    missedQuestionCount: 4,
    weakTopics: [
      { topic_id: 'history', topic_name: 'History', topic_slug: 'history', best_score: 4, sessions_count: 2, last_attempted: null, reason: 'Best score below 60%', priority: 92 },
    ],
    mockExamCount: 0,
    latestMockScore: null,
  })

  assert.deepEqual(plan.map((item) => item.href), [
    '/dashboard/practice/review',
    '/dashboard/practice/history',
    '/dashboard/mock-exam',
  ])
  assert.equal(plan[0].title, 'Review missed questions')
  assert.equal(plan[1].title, 'Practice History')
  assert.equal(plan[2].reason, 'No saved mock exam yet')
})
