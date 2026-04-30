'use client'

import { useState, useTransition } from 'react'
import { unstable_rethrow, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deletePost } from '@/actions/blog'
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
import { Button } from '@/components/ui/button'

type DeletePostDialogProps = {
  postId: string
  postTitle: string
  trigger: React.ReactNode
}

export function DeletePostDialog({ postId, postTitle, trigger }: DeletePostDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this post?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete &quot;{postTitle}&quot;. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={() => {
              startTransition(() => {
                void (async () => {
                  try {
                    const result = await deletePost(postId)
                    if ('error' in result && result.error) {
                      toast.error(result.error)
                      return
                    }
                    toast.success('Post deleted')
                    setOpen(false)
                    router.refresh()
                  } catch (e) {
                    unstable_rethrow(e)
                    toast.error('Could not delete the post. Try again.')
                  }
                })()
              })
            }}
          >
            {pending ? 'Deleting…' : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
