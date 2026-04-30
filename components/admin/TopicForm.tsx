'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createTopic, updateTopic } from '@/actions/topics'
import { toast } from '@/hooks/use-toast'
import type { TopicInput } from '@/lib/validations'

type TopicFormProps = {
  mode: 'create' | 'edit'
  defaultValues?: Partial<TopicInput>
  topicId?: string
}

export function TopicForm({ mode, defaultValues, topicId }: TopicFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const [name, setName] = useState(defaultValues?.name || '')
  const [slug, setSlug] = useState(defaultValues?.slug || '')
  const [description, setDescription] = useState(defaultValues?.description || '')
  const [sortOrder, setSortOrder] = useState(
    defaultValues?.sort_order?.toString() || '0'
  )

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  function handleNameChange(value: string) {
    setName(value)
    if (mode === 'create' && !slug) {
      setSlug(generateSlug(value))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData()
    formData.append('name', name)
    formData.append('slug', slug)
    formData.append('description', description)
    formData.append('sort_order', sortOrder)

    const result =
      mode === 'create'
        ? await createTopic(formData)
        : await updateTopic(topicId!, formData)

    setIsLoading(false)

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: `Topic ${mode === 'create' ? 'created' : 'updated'}`,
      })
      router.push('/admin/topics')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Topic Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Canadian History"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug *</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="canadian-history"
          required
          pattern="^[a-z0-9-]+$"
          title="Slug must be lowercase with hyphens only"
        />
        <p className="text-xs text-muted-foreground">
          Used in URLs. Lowercase letters, numbers, and hyphens only.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Brief description of this topic..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sort_order">Sort Order</Label>
        <Input
          id="sort_order"
          type="number"
          min="0"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          placeholder="0"
        />
        <p className="text-xs text-muted-foreground">
          Lower numbers appear first in lists.
        </p>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? mode === 'create'
              ? 'Creating...'
              : 'Updating...'
            : mode === 'create'
              ? 'Create Topic'
              : 'Update Topic'}
        </Button>
      </div>
    </form>
  )
}
