export const APP_NAME = 'Canadian Citizenship Exam Prep'
export const APP_DESCRIPTION = 'Prepare for your Canadian citizenship exam with practice questions and mock exams'

export const EXAM_CONFIG = {
  /** Full 20-question exam — premium subscribers and admins only. */
  TOTAL_QUESTIONS: 20,
  /** 10-question exam for guests and free (non-premium) registered users. */
  FREE_TOTAL_QUESTIONS: 10,
  TIME_LIMIT_MINUTES: 30,
  PASSING_SCORE: 75,
} as const

/** Minimum number correct to pass at PASSING_SCORE% (e.g. 15/20, 8/10). */
export function mockExamPassingCorrectCount(totalQuestions: number): number {
  return Math.ceil((totalQuestions * EXAM_CONFIG.PASSING_SCORE) / 100)
}

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  PRACTICE: '/practice',
  EXAM: '/exam',
  EXAM_HISTORY: '/exam/history',
  ADMIN: '/admin',
  ADMIN_QUESTIONS: '/admin/questions',
  ADMIN_TOPICS: '/admin/topics',
  ADMIN_USERS: '/admin/users',
} as const

export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_NOT_CONFIRMED: 'Please confirm your email address',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists',
  WEAK_PASSWORD: 'Password must be at least 8 characters',
  GENERIC_ERROR: 'An error occurred. Please try again.',
} as const

export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in',
  SIGNUP: 'Account created! Please check your email to confirm.',
  LOGOUT: 'Successfully logged out',
  PASSWORD_RESET: 'Password reset email sent',
  PROFILE_UPDATED: 'Profile updated successfully',
  QUESTION_CREATED: 'Question created successfully',
  QUESTION_UPDATED: 'Question updated successfully',
  QUESTION_DELETED: 'Question deleted successfully',
  TOPIC_CREATED: 'Topic created successfully',
  TOPIC_UPDATED: 'Topic updated successfully',
  TOPIC_DELETED: 'Topic deleted successfully',
  EXAM_SUBMITTED: 'Exam submitted successfully',
} as const
