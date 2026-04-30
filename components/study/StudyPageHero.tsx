import type { LucideIcon } from 'lucide-react'

type Props = {
  icon: LucideIcon
  eyebrow?: string
  title: string
  description: string
}

export function StudyPageHero({
  icon: Icon,
  eyebrow = 'Study sheet',
  title,
  description,
}: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-brand-navy via-brand-navy-light to-brand-navy p-8 text-white shadow-lg">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-red/25 blur-3xl"
        aria-hidden
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
          <Icon className="h-7 w-7 text-brand-red-light" aria-hidden />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">{eyebrow}</p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">{description}</p>
        </div>
      </div>
    </div>
  )
}
