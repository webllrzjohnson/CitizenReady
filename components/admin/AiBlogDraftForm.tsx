'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { queueAiBlogDraft } from '@/actions/blog'
import { toast } from '@/hooks/use-toast'

export function AiBlogDraftForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [context, setContext] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData()
    formData.append('title', title)
    formData.append('context', context)
    formData.append('cover_image_url', coverImageUrl)

    const result = await queueAiBlogDraft(formData)
    setIsLoading(false)

    if (result.error) {
      toast({
        title: 'Could not queue draft',
        description: result.error,
        variant: 'destructive',
      })
      return
    }

    toast({
      title: 'Draft queued',
      description:
        'n8n will write a JSON file to your Drive queue. The sync job can publish it to the blog within a few minutes.',
    })
    setTitle('')
    setContext('')
    setCoverImageUrl('')
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="ai-title">Title / topic *</Label>
        <Input
          id="ai-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Visiting Banff in winter"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ai-context">Context for the model *</Label>
        <Textarea
          id="ai-context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Facts, angle, outline, tone, links — everything the article should reflect."
          rows={12}
          required
          disabled={isLoading}
          className="min-h-[200px] resize-y"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ai-cover">Cover image URL (optional)</Label>
        <Input
          id="ai-cover"
          type="url"
          inputMode="url"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          placeholder="https://..."
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">Must start with https if provided.</p>
      </div>

      <Button
        type="submit"
        className="bg-brand-red text-white hover:bg-brand-red-dark"
        disabled={isLoading}
      >
        {isLoading ? 'Sending…' : 'Queue AI draft'}
      </Button>
    </form>
  )
}
