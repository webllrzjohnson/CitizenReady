'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Loader2 } from 'lucide-react'
import { deleteAccount } from '@/actions/settings'

export function DeleteAccountSection() {
  const [confirmText, setConfirmText] = useState('')
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setConfirmText('')
      setError(null)
    }
  }

  function handleDelete() {
    setError(null)
    const formData = new FormData()
    formData.set('confirmText', confirmText)
    startTransition(async () => {
      const result = await deleteAccount(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setOpen(false)
        router.push('/')
      }
    })
  }

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="text-red-600">Danger Zone</CardTitle>
        <CardDescription>
          Permanently delete your account and all your data. This cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Your profile, all quiz sessions, and progress data will be permanently
          deleted.
        </p>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <AlertDialog open={open} onOpenChange={handleOpenChange}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete My Account</Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Account</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Type{' '}
                <strong className="font-semibold text-foreground">DELETE</strong>{' '}
                to confirm.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-2 py-2">
              <Label htmlFor="confirm-delete-input">Confirmation</Label>
              <Input
                id="confirm-delete-input"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                autoComplete="off"
              />
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
              <Button
                variant="destructive"
                disabled={confirmText !== 'DELETE' || isPending}
                onClick={handleDelete}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Account
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
