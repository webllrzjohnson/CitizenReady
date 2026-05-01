'use client'

import { useTransition, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

type ActionResult = {
  success?: boolean
  error?: string
  message?: string
}

interface SettingsFormProps {
  title: string
  description: string
  children: React.ReactNode
  action: (formData: FormData) => Promise<ActionResult>
  submitLabel: string
  variant?: 'default' | 'destructive'
}

export function SettingsForm({
  title,
  description,
  children,
  action,
  submitLabel,
  variant = 'default',
}: SettingsFormProps) {
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<ActionResult | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setState(null)
    startTransition(async () => {
      const result = await action(formData)
      setState(result)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {children}

          {state?.error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {state.error}
            </p>
          )}

          {state?.success && (
            <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
              {state.message ?? 'Changes saved successfully.'}
            </p>
          )}

          <Button type="submit" disabled={isPending} variant={variant}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
