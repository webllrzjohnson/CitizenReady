export const APP_NAME = 'Canadian Citizenship Exam Prep'
export const APP_DESCRIPTION = 'Prepare for your Canadian citizenship exam with practice questions and mock exams'

export const EXAM_CONFIG = {
  TOTAL_QUESTIONS: 20,
  TIME_LIMIT_MINUTES: 30,
  PASSING_SCORE: 75,
} as const

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
