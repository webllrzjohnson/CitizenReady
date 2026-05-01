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
  isSelected?: boolean
  onClick?: () => void
  suffix?: ReactNode
}

export function QuizOptionRow({
  optionKey,
  text,
  visual,
  interactive,
  disabled = false,
  isSelected = false,
  onClick,
  suffix,
}: QuizOptionRowProps) {
  const label = formatOptionKey(optionKey)

  const rowClass = cn(
    'flex w-full items-center gap-4 rounded-xl border bg-white p-4 text-left transition-all duration-150',
    visual === 'default' &&
      interactive &&
      'cursor-pointer border-[#E0E0E0] hover:border-[#E8192C] hover:bg-[#FFF0F0]',
    visual === 'default' && !interactive && 'border-[#E0E0E0]',
    visual === 'selected' && 'border-[#E8192C] bg-[#FFF0F0]',
    visual === 'correct' && 'border-[#2E7D32] bg-[#F1F8F1] text-[#2E7D32]',
    visual === 'incorrect' && 'border-[#E8192C] bg-[#FFF0F0] text-[#C41020]',
    disabled && 'pointer-events-none opacity-60'
  )

  const letterClass = cn(
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
    visual === 'default' && 'bg-[#F0F0F0] text-[#4A4A4A]',
    visual === 'selected' && 'bg-[#E8192C] text-white',
    visual === 'correct' && 'bg-[#2E7D32] text-white',
    visual === 'incorrect' && 'bg-[#E8192C] text-white'
  )

  const body = (
    <>
      <span className={letterClass} aria-hidden>
        {label}
      </span>
      <span
        className={cn(
          'flex-1 text-base',
          visual === 'correct' && 'text-[#2E7D32]',
          visual === 'incorrect' && 'text-[#C41020]',
          (visual === 'default' || visual === 'selected') && 'text-[#1B2A4A]'
        )}
      >
        {text}
        {suffix}
      </span>
    </>
  )

  if (interactive && onClick) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={rowClass}
        aria-pressed={isSelected}
      >
        {body}
      </button>
    )
  }

  return <div className={rowClass}>{body}</div>
}
