'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AI_CUSTOM_MODEL_VALUE,
  AI_PROVIDERS,
  type AiProviderId,
  modelSelectionFromStored,
} from '@/lib/blog/ai-providers'

type AiProviderModelFieldsProps = {
  provider: AiProviderId
  modelSelection: string
  customModel: string
  disabled?: boolean
  onProviderChange: (provider: AiProviderId) => void
  onModelSelectionChange: (selection: string) => void
  onCustomModelChange: (value: string) => void
  idPrefix?: string
}

export function AiProviderModelFields({
  provider,
  modelSelection,
  customModel,
  disabled,
  onProviderChange,
  onModelSelectionChange,
  onCustomModelChange,
  idPrefix = 'ai',
}: AiProviderModelFieldsProps) {
  const providerConfig = AI_PROVIDERS[provider]
  const showCustomModel = modelSelection === AI_CUSTOM_MODEL_VALUE

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-provider`}>AI provider</Label>
        <Select
          value={provider}
          onValueChange={(value) => onProviderChange(value as AiProviderId)}
          disabled={disabled}
        >
          <SelectTrigger id={`${idPrefix}-provider`}>
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(AI_PROVIDERS).map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          API key from server env: {providerConfig.envKey}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-model`}>Model</Label>
        <Select
          value={modelSelection}
          onValueChange={onModelSelectionChange}
          disabled={disabled}
        >
          <SelectTrigger id={`${idPrefix}-model`}>
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {providerConfig.models.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.label}
              </SelectItem>
            ))}
            <SelectItem value={AI_CUSTOM_MODEL_VALUE}>Custom model ID…</SelectItem>
          </SelectContent>
        </Select>
        {showCustomModel && (
          <Input
            value={customModel}
            onChange={(e) => onCustomModelChange(e.target.value)}
            placeholder={`e.g. ${providerConfig.defaultModel}`}
            disabled={disabled}
            aria-label="Custom model ID"
          />
        )}
      </div>
    </div>
  )
}

export function initialProviderModelState(
  provider: AiProviderId,
  model: string,
): { provider: AiProviderId; modelSelection: string; customModel: string } {
  const { selection, customModel } = modelSelectionFromStored(provider, model)
  return { provider, modelSelection: selection, customModel }
}
