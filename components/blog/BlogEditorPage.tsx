'use client'

import { useCallback, useMemo, useState, useTransition, useRef, useEffect } from 'react'
import { unstable_rethrow } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { BlogEditor } from '@/components/blog/BlogEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { createPost, updatePost } from '@/actions/blog'
import type { BlogPost } from '@/types'
import { defaultBlogDoc } from '@/lib/blog/tiptap-extensions'
import { slugifyTitle } from '@/lib/blog/plain-text'
import Image from 'next/image'

type BlogEditorPageProps = {
  mode: 'create' | 'edit'
  defaultValues?: Partial<BlogPost>
  postId?: string
}

export function BlogEditorPage({ mode, defaultValues, postId }: BlogEditorPageProps) {
  const initialDoc = useMemo(
    () =>
      (defaultValues?.content as Record<string, unknown> | undefined) ??
      ({ ...defaultBlogDoc } as Record<string, unknown>),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset doc when editing a different post
    [defaultValues?.id, defaultValues?.slug],
  )

  const [title, setTitle] = useState(defaultValues?.title ?? '')
  const [slug, setSlug] = useState(defaultValues?.slug ?? '')
  const [excerpt, setExcerpt] = useState(defaultValues?.excerpt ?? '')
  const [coverImage, setCoverImage] = useState(defaultValues?.cover_image ?? '')
  const [content, setContent] = useState<Record<string, unknown>>(initialDoc)
  const [status, setStatus] = useState<'draft' | 'published'>(
    defaultValues?.status ?? 'draft',
  )
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastTouched, setLastTouched] = useState<Date | null>(null)
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    return () => {
      if (touchTimer.current) clearTimeout(touchTimer.current)
    }
  }, [])

  const onContentChange = useCallback((doc: Record<string, unknown>) => {
    setContent(doc)
    if (touchTimer.current) clearTimeout(touchTimer.current)
    touchTimer.current = setTimeout(() => setLastTouched(new Date()), 1500)
  }, [])

  const onTitleChange = useCallback(
    (value: string) => {
      setTitle(value)
      if (mode === 'create') {
        const s = slugifyTitle(value)
        if (s.length >= 3) setSlug(s)
      }
    },
    [mode],
  )

  const editorKey = useMemo(
    () => (mode === 'edit' && postId ? postId : 'new'),
    [mode, postId],
  )

  const buildFormData = useCallback(
    (nextStatus: 'draft' | 'published') => {
      const fd = new FormData()
      fd.append('title', title)
      fd.append('slug', slug)
      fd.append('excerpt', excerpt)
      fd.append('cover_image', coverImage)
      fd.append('content', JSON.stringify(content))
      fd.append('status', nextStatus)
      return fd
    },
    [title, slug, excerpt, coverImage, content],
  )

  const submit = (nextStatus: 'draft' | 'published') => {
    setError(null)
    setStatus(nextStatus)
    setIsSaving(true)
    startTransition(() => {
      void (async () => {
        try {
          const fd = buildFormData(nextStatus)
          const res =
            mode === 'create'
              ? await createPost(fd)
              : postId
                ? await updatePost(postId, fd)
                : { error: 'Missing post id' }

          if (res && 'error' in res && res.error) {
            setError(res.error)
          }
        } catch (e) {
          unstable_rethrow(e)
          setError('Something went wrong. Please try again.')
        } finally {
          setIsSaving(false)
        }
      })()
    })
  }

  const saving = isPending || isSaving

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1 space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Post Title"
          className="w-full border-0 bg-transparent p-0 text-3xl font-bold text-brand-navy placeholder:text-gray-400 focus:outline-none focus:ring-0"
        />
        <BlogEditor key={editorKey} initialContent={initialDoc} onChange={onContentChange} />
      </div>

      <div className="w-full shrink-0 space-y-4 lg:w-80">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Publish Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge variant={status === 'published' ? 'default' : 'secondary'}>
              {status === 'published' ? 'Published' : 'Draft'}
            </Badge>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => submit('draft')}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Save Draft'
                )}
              </Button>
              <Button
                type="button"
                className="w-full bg-brand-red text-white hover:bg-brand-red-dark"
                disabled={saving}
                onClick={() => submit('published')}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Publish'
                )}
              </Button>
            </div>
            {lastTouched ? (
              <p className="text-xs text-muted-foreground">
                Updated {formatDistanceToNow(lastTouched, { addSuffix: true })}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Post Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="post-slug">Slug</Label>
              <Input
                id="post-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                URL preview: /blog/{slug || 'your-slug'}
              </p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="post-excerpt">Excerpt</Label>
              <Textarea
                id="post-excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value.slice(0, 300))}
                rows={4}
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground">{excerpt.length} / 300</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="cover-url">Cover Image URL</Label>
              <Input
                id="cover-url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://…"
              />
              {coverImage.trim() ? (
                <div className="relative mt-2 aspect-video w-full max-w-xs overflow-hidden rounded-md border bg-muted">
                  <Image
                    src={coverImage.trim()}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  )
}
