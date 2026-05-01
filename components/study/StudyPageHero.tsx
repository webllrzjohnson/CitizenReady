import type { LucideIcon } from 'lucide-react'

type Props = {
  icon: LucideIcon
  eyebrow?: string
  title: string
  description: string
  badge?: { icon: LucideIcon; label: string }
}

export function StudyPageHero({
  icon: Icon,
  eyebrow = 'Study sheet',
  title,
  description,
  badge,
}: Props) {
  const BadgeIcon = badge?.icon

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-navy via-[#1a2a4a] to-[#0f1e35] p-8 text-white shadow-xl">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(211,47,47,0.18),transparent_60%)]"
        aria-hidden
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10 backdrop-blur">
          <Icon className="h-7 w-7 text-brand-red-light" aria-hidden />
        </div>
        <div className="space-y-2.5">
          {badge && BadgeIcon ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-red/20 px-3 py-1.5 ring-1 ring-brand-red/30">
              <BadgeIcon className="h-3.5 w-3.5 text-brand-red" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-red">
                {badge.label}
              </span>
            </div>
          ) : (
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">{eyebrow}</p>
          )}
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{title}</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">{description}</p>
        </div>
      </div>
    </div>
  )
}
