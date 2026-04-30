'use client'

import { useTransition } from 'react'
import { unstable_rethrow, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { publishPost, unpublishPost } from '@/actions/blog'
import { Button } from '@/components/ui/button'

type BlogPublishToggleProps = {
  postId: string
  status: 'draft' | 'published'
}

export function BlogPublishToggle({ postId, status }: BlogPublishToggleProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  if (status === 'draft') {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => {
          startTransition(() => {
            void (async () => {
              try {
                const res = await publishPost(postId)
                if ('error' in res && res.error) {
                  toast.error(res.error)
                  return
                }
                toast.success('Post published')
                router.refresh()
              } catch (e) {
                unstable_rethrow(e)
                toast.error('Could not update the post. Try again.')
              }
            })()
          })
        }}
      >
        {pending ? '…' : 'Publish'}
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(() => {
          void (async () => {
            try {
              const res = await unpublishPost(postId)
              if ('error' in res && res.error) {
                toast.error(res.error)
                return
              }
              toast.success('Post moved to draft')
              router.refresh()
            } catch (e) {
              unstable_rethrow(e)
              toast.error('Could not update the post. Try again.')
            }
          })()
        })
      }}
    >
      {pending ? '…' : 'Unpublish'}
    </Button>
  )
}
