'use client'

import { useRef, useState, useTransition } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { submitPlusRequest } from '@/actions/plus-requests'
import { formatPlusRequestPlanLabel, PLUS_REQUEST_PLANS, type PlusRequestPlan } from '@/lib/plus-requests'
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

export function PlusRequestForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [plan, setPlan] = useState<PlusRequestPlan>('30day')
  const [messageLength, setMessageLength] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ name: string } | null>(null)

  function resetForm() {
    formRef.current?.reset()
    setPlan('30day')
    setMessageLength(0)
    setError(null)
    setSuccess(null)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('requestedPlan', plan)

    startTransition(async () => {
      const result = await submitPlusRequest(formData)
      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setSuccess({ name: result.name ?? 'there' })
      }
    })
  }

  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
        <h3 className="mb-2 text-xl font-bold text-green-800">Request Sent</h3>
        <p className="mb-6 text-green-700">
          Thanks {success.name}. We received your Plus access request and will follow up by email.
        </p>
        <Button onClick={resetForm} variant="outline" className="border-green-600 text-green-700 hover:bg-green-100">
          Send Another Request
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" placeholder="Jane Smith" autoComplete="name" required disabled={isPending} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Best Contact Email</Label>
          <Input id="email" name="email" type="email" placeholder="jane@example.com" autoComplete="email" required disabled={isPending} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="accountEmail">CitizenReady Account Email</Label>
        <Input id="accountEmail" name="accountEmail" type="email" placeholder="Leave blank if same as contact email" autoComplete="email" disabled={isPending} />
        <p className="text-xs text-muted-foreground">Use this if your login email is different from your contact email.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="requestedPlan">Requested Plus Access</Label>
        <Select value={plan} onValueChange={(value) => setPlan(value as PlusRequestPlan)} disabled={isPending}>
          <SelectTrigger id="requestedPlan">
            <SelectValue placeholder="Choose an option" />
          </SelectTrigger>
          <SelectContent>
            {PLUS_REQUEST_PLANS.map((option) => (
              <SelectItem key={option} value={option}>{formatPlusRequestPlanLabel(option)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Notes</Label>
        <Textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Tell us your test timeline, preferred access length, or any question before we grant Plus."
          disabled={isPending}
          onChange={(e) => setMessageLength(e.target.value.length)}
          className="resize-none"
          aria-describedby="plus-request-message-count"
        />
        <p id="plus-request-message-count" aria-live="polite" className={`text-right text-xs ${messageLength > 1000 ? 'text-red-600' : 'text-muted-foreground'}`}>
          {messageLength} / 1000
        </p>
      </div>

      <Button type="submit" disabled={isPending} className="w-full bg-brand-red text-white hover:bg-brand-red-dark">
        {isPending ? 'Sending…' : 'Request Plus Access'}
      </Button>
    </form>
  )
}
