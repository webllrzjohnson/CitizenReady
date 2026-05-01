import Link from 'next/link'
import { Zap, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PLUS_BULLETS = [
  '900+ exam-style questions',
  'Unlimited timed mock exams',
  'Challenge bank & progress tracker',
  'Revision notes & cheat sheet PDF',
]

/**
 * Horizontal upgrade banner — drop into any full-width page section.
 */
export function UpgradeBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-brand-navy px-6 py-7 text-white shadow-md">
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_80%_20%,#D32F2F_0%,transparent_50%)]" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-red px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
              <Zap className="h-3 w-3" aria-hidden />
              50% off — limited time
            </span>
          </div>
          <p className="text-lg font-extrabold leading-snug">
            Upgrade to CitizenReady Plus
          </p>
          <p className="text-sm text-white/70">
            Full question bank, mock exams &amp; study tools — starting at{' '}
            <span className="font-semibold text-white">$5.99</span>.
          </p>
        </div>
        <Button
          size="lg"
          className="shrink-0 bg-brand-red font-semibold hover:bg-brand-red-dark"
          asChild
        >
          <Link href="/pricing">
            See plans <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  )
}

/**
 * Vertical upgrade card — drop into sidebars or narrow columns.
 */
export function UpgradeCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-brand-navy p-5 text-white shadow-md">
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_80%_10%,#D32F2F_0%,transparent_55%)]" />
      <div className="relative space-y-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-red px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
            <Zap className="h-3 w-3" aria-hidden />
            50% off
          </span>
        </div>
        <div>
          <p className="font-extrabold text-white">CitizenReady Plus</p>
          <p className="mt-1 text-sm text-white/70">
            Everything you need to pass — timed exams, full question bank, study sheets.
          </p>
        </div>
        <ul className="space-y-2">
          {PLUS_BULLETS.map((b) => (
            <li key={b} className="flex items-start gap-2 text-xs text-white/80">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-400" aria-hidden />
              {b}
            </li>
          ))}
        </ul>
        <div>
          <p className="mb-3 text-sm text-white/60">
            From <span className="font-bold text-white">$5.99</span>{' '}
            <span className="line-through text-white/40">$11.98</span>
          </p>
          <Button
            className="w-full bg-brand-red font-semibold hover:bg-brand-red-dark"
            asChild
          >
            <Link href="/pricing">Upgrade to Plus</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
