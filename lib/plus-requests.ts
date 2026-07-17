import type { ComponentProps } from 'react'
import type { Badge } from '@/components/ui/badge'

type BadgeVariant = NonNullable<ComponentProps<typeof Badge>['variant']>

export const PLUS_REQUEST_PLANS = ['7day', '30day', '1year', 'lifetime'] as const
export const PLUS_REQUEST_STATUSES = ['new', 'approved', 'rejected', 'completed'] as const

export type PlusRequestPlan = (typeof PLUS_REQUEST_PLANS)[number]
export type PlusRequestStatus = (typeof PLUS_REQUEST_STATUSES)[number]

const PLAN_LABELS: Record<PlusRequestPlan, string> = {
  '7day': '7-Day Sprint',
  '30day': '30-Day Plan',
  '1year': '1-Year Access',
  lifetime: 'Lifetime / Special Access',
}

export function normalizePlusRequestPlan(value: unknown): PlusRequestPlan {
  return PLUS_REQUEST_PLANS.includes(value as PlusRequestPlan) ? value as PlusRequestPlan : '30day'
}

export function formatPlusRequestPlanLabel(plan: PlusRequestPlan): string {
  return PLAN_LABELS[plan]
}

export function getPlusRequestStatusBadgeVariant(status: PlusRequestStatus): BadgeVariant {
  if (status === 'new') return 'default'
  if (status === 'approved') return 'secondary'
  if (status === 'rejected') return 'destructive'
  return 'outline'
}
