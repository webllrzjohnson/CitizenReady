import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type QuizOptionVisual = 'default' | 'selected' | 'correct' | 'incorrect'

export function formatOptionKey(key: string): string {
  if (!key) return key
  if (key.length === 1) return key.toLowerCase()
  return key
}

type QuizOptionRowProps = {
  optionKey: string
  text: string
  visual: QuizOptionVisual
  interactive: boolean
  disabled?: boolean
  onClick?: () => void
  suffix?: ReactNode
}

export function QuizOptionRow({
  optionKey,
  text,
  visual,
  interactive,
  disabled = false,
  onClick,
  suffix,
}: QuizOptionRowProps) {
  const label = formatOptionKey(optionKey)

  const rowClass = cn(
    'flex w-full items-center gap-4 rounded-lg border-2 bg-white px-4 py-4 text-left transition-colors',
    visual === 'default' &&
      interactive &&
      'cursor-pointer border-surface-border hover:border-brand-red hover:bg-brand-red-light',
    visual === 'default' && !interactive && 'border-surface-border',
    visual === 'selected' && 'border-brand-red bg-brand-red-light',
    visual === 'correct' && 'border-green-500 bg-green-50',
    visual === 'incorrect' && 'border-red-500 bg-red-50',
    disabled && 'pointer-events-none opacity-60'
  )

  const letterClass = cn(
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
    visual === 'default' && 'bg-neutral-200 text-neutral-800',
    visual === 'selected' && 'bg-brand-red text-white',
    visual === 'correct' && 'bg-green-600 text-white',
    visual === 'incorrect' && 'bg-red-600 text-white'
  )

  const body = (
    <>
      <span className={letterClass} aria-hidden>
        {label}
      </span>
      <span className="flex-1 text-base text-brand-navy">
        {text}
        {suffix}
      </span>
    </>
  )

  if (interactive && onClick) {
    return (
      <button type="button" disabled={disabled} onClick={onClick} className={rowClass}>
        {body}
      </button>
    )
  }

  return <div className={rowClass}>{body}</div>
}
