import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const SignupSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const TopicSchema = z.object({
  name: z.string().min(2, 'Topic name is required'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  description: z.string().optional(),
  sort_order: z.number().int().min(0).default(0),
})

export const QuestionSchema = z.object({
  topic_id: z.string().uuid('Select a topic'),
  type: z.enum(['single', 'multiple', 'boolean', 'fill', 'matching']),
  question_text: z.string().min(10, 'Question text is required'),
  options: z.array(z.object({
    key: z.string().min(1),
    text: z.string().min(1),
  })).min(2, 'Add at least 2 options'),
  correct_answers: z.array(z.string()).min(1, 'Mark at least one correct answer'),
  explanation: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  is_active: z.boolean().default(true),
})

export const SubmitAnswerSchema = z.object({
  session_id: z.string().uuid(),
  question_id: z.string().uuid(),
  user_answer: z.array(z.string()).min(1, 'Select an answer'),
  time_spent_ms: z.number().int().min(0).optional(),
})

export const SubmitExamSchema = z.object({
  session_id: z.string().uuid(),
  answers: z.record(z.string().uuid(), z.array(z.string())),
})

export type LoginInput = z.infer<typeof LoginSchema>
export type SignupInput = z.infer<typeof SignupSchema>
export type TopicInput = z.infer<typeof TopicSchema>
export type QuestionInput = z.infer<typeof QuestionSchema>
export type SubmitAnswerInput = z.infer<typeof SubmitAnswerSchema>
export type SubmitExamInput = z.infer<typeof SubmitExamSchema>
