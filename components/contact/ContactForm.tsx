'use client'

import { useRef, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle2 } from 'lucide-react'
import { submitContactForm } from '@/actions/contact'

const SUBJECTS = [
  'General Inquiry',
  'Technical Issue',
  'Content Feedback',
  'Partnership',
  'Other',
] as const

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ name: string } | null>(null)
  const [messageLength, setMessageLength] = useState(0)
  const [subject, setSubject] = useState('')

  function handleReset() {
    formRef.current?.reset()
    setSuccess(null)
    setError(null)
    setMessageLength(0)
    setSubject('')
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('subject', subject)

    startTransition(async () => {
      const result = await submitContactForm(formData)
      if (result.error) {
        setError(result.error)
      } else if (result.success && result.name) {
        setSuccess({ name: result.name })
      }
    })
  }

  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
        <h3 className="mb-2 text-xl font-bold text-green-800">Message Sent!</h3>
        <p className="mb-6 text-green-700">
          Thank you {success.name}. We will get back to you within 24-48 hours.
        </p>
        <Button
          onClick={handleReset}
          variant="outline"
          className="border-green-600 text-green-700 hover:bg-green-100"
        >
          Send Another Message
        </Button>
      </div>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Jane Smith"
          required
          autoComplete="name"
          disabled={isPending}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="jane@example.com"
          required
          autoComplete="email"
          disabled={isPending}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="subject">Subject</Label>
        <Select value={subject} onValueChange={setSubject} disabled={isPending}>
          <SelectTrigger id="subject">
            <SelectValue placeholder="Select a subject…" />
          </SelectTrigger>
          <SelectContent>
            {SUBJECTS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          rows={6}
          placeholder="Tell us how we can help…"
          required
          disabled={isPending}
          onChange={(e) => setMessageLength(e.target.value.length)}
          className="resize-none"
          aria-describedby="message-count"
        />
        <p
          id="message-count"
          aria-live="polite"
          className={`text-right text-xs ${
            messageLength > 1000
              ? 'text-red-600'
              : messageLength < 20 && messageLength > 0
                ? 'text-amber-600'
                : 'text-muted-foreground'
          }`}
        >
          {messageLength} / 1000
        </p>
      </div>

      <Button
        type="submit"
        disabled={isPending || !subject}
        className="w-full bg-brand-red text-white hover:bg-brand-red-dark"
      >
        {isPending ? 'Sending…' : 'Send Message'}
      </Button>
    </form>
  )
}
