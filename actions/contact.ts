'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Please enter a valid email address'),
  subject: z.enum(
    ['General Inquiry', 'Technical Issue', 'Content Feedback', 'Partnership', 'Other'],
    { errorMap: () => ({ message: 'Please select a subject' }) }
  ),
  message: z
    .string()
    .min(20, 'Message must be at least 20 characters')
    .max(1000, 'Message must be at most 1000 characters'),
})

export async function submitContactForm(formData: FormData) {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  }

  const parsed = contactSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation error'
    return { error: firstError }
  }

  const { name, email, subject, message } = parsed.data

  const supabase = await createClient()
  const { error } = await supabase
    .from('contact_messages')
    .insert({ name, email, subject, message })

  if (error) {
    return { error: 'Failed to send message. Please try again.' }
  }

  return {
    success: true,
    message: 'Thank you! We will get back to you within 24-48 hours.',
    name,
  }
}

export async function markMessageRead(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile as { role: string }).role !== 'admin') {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('contact_messages')
    .update({ is_read: true })
    .eq('id', id)

  if (error) {
    return { error: 'Failed to update message.' }
  }

  revalidatePath('/admin/contact-messages')
  return { success: true }
}
