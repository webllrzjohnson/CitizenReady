'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { generateAiBlogDraft } from '@/actions/blog'
import { updateAiBlogSettings } from '@/actions/admin'
import { toast } from '@/hooks/use-toast'
import {
  AiProviderModelFields,
  initialProviderModelState,
} from '@/components/admin/AiProviderModelFields'
import {
  AI_CUSTOM_MODEL_VALUE,
  AI_PROVIDERS,
  type AiProviderId,
} from '@/lib/blog/ai-providers'

const CONTEXT_MAX = 60_000

type AiBlogDraftFormProps = {
  initialProvider: AiProviderId
  initialModel: string
}

export function AiBlogDraftForm({ initialProvider, initialModel }: AiBlogDraftFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSavingDefaults, setIsSavingDefaults] = useState(false)
  const [title, setTitle] = useState('')
  const [context, setContext] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [saveAsDefault, setSaveAsDefault] = useState(false)

  const initial = initialProviderModelState(initialProvider, initialModel)
  const [provider, setProvider] = useState<AiProviderId>(initial.provider)
  const [modelSelection, setModelSelection] = useState(initial.modelSelection)
  const [customModel, setCustomModel] = useState(initial.customModel)

  const contextLength = context.length
  const contextNearLimit = contextLength > CONTEXT_MAX * 0.9
  const contextOverLimit = contextLength > CONTEXT_MAX

  function handleProviderChange(next: AiProviderId) {
    setProvider(next)
    setModelSelection(AI_PROVIDERS[next].defaultModel)
    setCustomModel('')
  }

  async function handleSaveDefaults() {
    setIsSavingDefaults(true)
    const formData = new FormData()
    formData.set('provider', provider)
    formData.set('model', modelSelection)
    formData.set('custom_model', customModel)

    const result = await updateAiBlogSettings(formData)
    setIsSavingDefaults(false)

    if ('error' in result) {
      toast({
        title: 'Could not save defaults',
        description: result.error,
        variant: 'destructive',
      })
      return
    }

    toast({
      title: 'Defaults saved',
      description: 'Provider and model will be pre-selected next time.',
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (contextOverLimit) {
      toast({
        title: 'Context too long',
        description: `Keep context under ${CONTEXT_MAX.toLocaleString()} characters.`,
        variant: 'destructive',
      })
      return
    }
    if (modelSelection === AI_CUSTOM_MODEL_VALUE && !customModel.trim()) {
      toast({
        title: 'Model required',
        description: 'Enter a custom model ID or pick a preset.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    const formData = new FormData()
    formData.append('title', title)
    formData.append('context', context)
    formData.append('cover_image_url', coverImageUrl)
    formData.append('provider', provider)
    formData.append('model', modelSelection)
    formData.append('custom_model', customModel)
    formData.append('save_as_default', String(saveAsDefault))

    const result = await generateAiBlogDraft(formData)
    setIsLoading(false)

    if ('error' in result || !result.data) {
      toast({
        title: 'Could not generate draft',
        description: 'error' in result ? result.error : 'Failed to save draft',
        variant: 'destructive',
      })
      return
    }

    const { id } = result.data
    toast({
      title: 'Draft created',
      description: 'Review and edit the post, then publish when ready.',
    })
    router.push(`/admin/blog/${id}/edit`)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI provider &amp; model</CardTitle>
          <CardDescription>
            Choose which API generates the draft. Keys stay on the server ({' '}
            <code className="text-xs">ANTHROPIC_API_KEY</code>,{' '}
            <code className="text-xs">OPENAI_API_KEY</code>).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AiProviderModelFields
            provider={provider}
            modelSelection={modelSelection}
            customModel={customModel}
            disabled={isLoading || isSavingDefaults}
            onProviderChange={handleProviderChange}
            onModelSelectionChange={setModelSelection}
            onCustomModelChange={setCustomModel}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading || isSavingDefaults}
            onClick={handleSaveDefaults}
          >
            {isSavingDefaults ? 'Saving…' : 'Save as default'}
          </Button>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
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
          <p
            className={
              contextOverLimit
                ? 'text-xs text-destructive'
                : contextNearLimit
                  ? 'text-xs text-amber-600'
                  : 'text-xs text-muted-foreground'
            }
          >
            {contextLength.toLocaleString()} / {CONTEXT_MAX.toLocaleString()} characters
          </p>
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

        <div className="flex items-center gap-2">
          <input
            id="save-as-default"
            type="checkbox"
            checked={saveAsDefault}
            onChange={(e) => setSaveAsDefault(e.target.checked)}
            disabled={isLoading}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="save-as-default" className="cursor-pointer font-normal">
            Save provider &amp; model as default when generating
          </Label>
        </div>

        <Button
          type="submit"
          className="bg-brand-red text-white hover:bg-brand-red-dark"
          disabled={isLoading || contextOverLimit}
        >
          {isLoading ? 'Generating…' : 'Generate AI draft'}
        </Button>
      </form>
    </div>
  )
}
