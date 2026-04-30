export type Role = 'user' | 'admin'

export type Profile = {
  id: string
  email: string
  full_name: string | null
  role: Role
  created_at: string
}

export type Topic = {
  id: string
  name: string
  slug: string
  description: string | null
  sort_order: number
  question_count?: number
}

export type QuestionType = 'single' | 'multiple' | 'boolean' | 'fill' | 'matching'
export type Difficulty = 'easy' | 'medium' | 'hard'

export type Question = {
  id: string
  topic_id: string
  topic?: Topic
  type: QuestionType
  question_text: string
  options: { key: string; text: string }[]
  correct_answers: string[]
  explanation: string | null
  difficulty: Difficulty
  is_active: boolean
  created_at: string
}

export type SessionType = 'practice' | 'mock_exam'

export type QuizSession = {
  id: string
  user_id: string
  type: SessionType
  topic_id: string | null
  topic?: Topic
  total_q: number
  score: number | null
  completed_at: string | null
  created_at: string
}

export type QuestionAttempt = {
  id: string
  session_id: string
  question_id: string
  question?: Question
  user_answer: string[]
  is_correct: boolean
  time_spent_ms: number | null
  created_at: string
}

export type SessionWithAttempts = QuizSession & {
  attempts: QuestionAttempt[]
}

export type TopicProgress = {
  topic: Topic
  sessions_count: number
  best_score: number | null
  last_attempted: string | null
}

export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'image'
  | 'quote'
  | 'divider'
  | 'bulletList'
  | 'orderedList'

export type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image: string | null
  content: Record<string, unknown>
  author_id: string
  author?: Pick<Profile, 'full_name' | 'email'>
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
}
