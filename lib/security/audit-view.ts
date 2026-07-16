import type { ComponentProps } from 'react'
import type { Badge } from '@/components/ui/badge'

type BadgeVariant = NonNullable<ComponentProps<typeof Badge>['variant']>

export function formatAuditActionLabel(action: string): string {
  return action
    .split('.')
    .flatMap((part) => part.split('_'))
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase()
      if (lower === 'ai') return 'AI'
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join(' ')
}

export function getAuditActionBadgeVariant(action: string): BadgeVariant {
  if (action.startsWith('user.')) return 'default'
  if (action.startsWith('site.')) return 'secondary'
  return 'outline'
}

export function formatAuditMetadata(metadata: unknown): string[] {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return []

  return Object.entries(metadata as Record<string, unknown>).map(([key, value]) => {
    const formatted = typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
      ? String(value)
      : JSON.stringify(value)
    return `${key}: ${formatted}`
  })
}
