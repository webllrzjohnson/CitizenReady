'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import sql from '@/lib/db'
import { requireAdminSession } from '@/lib/auth/session'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Please enter a valid email address'),
  subject: z.enum(['General Inquiry', 'Technical Issue', 'Content Feedback', 'Partnership', 'Other'], {
    errorMap: () => ({ message: 'Please select a subject' }),
  }),
  message: z.string().min(20, 'Message must be at least 20 characters').max(1000),
})

export async function submitContactForm(formData: FormData) {
  const parsed = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  })

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Validation error' }

  const { name, email, subject, message } = parsed.data

  await sql`INSERT INTO public.contact_messages (name, email, subject, message) VALUES (${name}, ${email}, ${subject}, ${message})`

  return { success: true, message: 'Thank you! We will get back to you within 24-48 hours.', name }
}

export async function markMessageRead(id: string) {
  const check = await requireAdminSession()
  if ('error' in check) return { error: check.error }

  await sql`UPDATE public.contact_messages SET is_read = true WHERE id = ${id}::uuid`
  revalidatePath('/admin/contact-messages')
  return { success: true }
}