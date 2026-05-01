import Link from 'next/link'
import { ArrowLeft, History, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CANADA_IMPORTANT_DATES } from '@/lib/data/canada-important-dates'
import { cn } from '@/lib/utils'

/* ─── Era definitions (descending: recent → old) ─────────────────────────── */
const ERAS = [
  {
    label: '2000s – Present',
    sub: 'Modern milestones & recent changes',
    minYear: 2000,
  },
  {
    label: '1970s – 1990s',
    sub: 'Rights, referenda & reform',
    minYear: 1970,
  },
  {
    label: '1940s – 1960s',
    sub: 'Post-war growth & social change',
    minYear: 1940,
  },
  {
    label: 'Early 20th Century',
    sub: '1900–1939 · Wars, rights & nation-building',
    minYear: 1900,
  },
  {
    label: 'Confederation Era',
    sub: '1840s–1890s · The birth of modern Canada',
    minYear: 1840,
  },
  {
    label: 'Colonial Period',
    sub: '1790s–1830s · Settlement & conflict',
    minYear: 1790,
  },
  {
    label: 'Exploration & Foundations',
    sub: 'Pre-1790 · Indigenous peoples, France & Britain',
    minYear: 0,
  },
] as const

function getStartYear(period: string): number {
  const m = period.match(/\d{3,4}/)
  return m ? parseInt(m[0], 10) : 0
}

function getEraLabel(period: string): string {
  const year = getStartYear(period)
  for (const era of ERAS) {
    if (year >= era.minYear) return era.label
  }
  return ERAS[ERAS.length - 1].label
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function ImportantDatesStudyPage() {
  const totalEvents = CANADA_IMPORTANT_DATES.reduce((n, e) => n + e.events.length, 0)

  const grouped = ERAS.map((era) => ({
    ...era,
    entries: CANADA_IMPORTANT_DATES.filter((e) => getEraLabel(e.period) === era.label),
  })).filter((g) => g.entries.length > 0)

  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-8">
      {/* ── Back ──────────────────────────────────────────────── */}
      <Button variant="ghost" size="sm" className="-ml-3 w-fit gap-2 text-muted-foreground" asChild>
        <Link href="/dashboard/study">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to study centre
        </Link>
      </Button>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-navy via-[#1a2a4a] to-[#0f1e35] p-8 text-white shadow-xl">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(211,47,47,0.18),transparent_60%)]"
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10 backdrop-blur">
            <History className="h-7 w-7 text-brand-red-light" aria-hidden />
          </div>
          <div className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Study sheet</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Important dates in Canadian history
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
              A timeline of milestones that often appear in citizenship study guides — politics, rights,
              symbols, and defining moments from early foundations to today.
            </p>
            {/* Stats pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
                {CANADA_IMPORTANT_DATES.length} periods
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
                {totalEvents} events
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
                {grouped.length} eras
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Reading order note ────────────────────────────────── */}
      <p className="rounded-xl bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground">
        Listed{' '}
        <strong className="font-medium text-foreground">recent → older</strong> — review modern
        events first, then walk backward through Canada&apos;s story.
      </p>

      {/* ── Timeline grouped by era ───────────────────────────── */}
      <section aria-label="Canadian history timeline">
        <div className="space-y-12">
          {grouped.map((era) => (
            <div key={era.label}>
              {/* Era divider */}
              <div className="mb-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-200" />
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="rounded-full bg-brand-navy px-4 py-1.5 text-xs font-bold tracking-wide text-white shadow-sm">
                    {era.label}
                  </span>
                  <span className="text-[11px] text-gray-400">{era.sub}</span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-200" />
              </div>

              {/* Timeline entries */}
              <div className="relative">
                {/* Vertical line */}
                <div
                  className="absolute bottom-4 left-[1.375rem] top-4 w-[2px] rounded-full bg-gradient-to-b from-brand-red/60 via-brand-red/25 to-brand-navy/15 sm:left-6"
                  aria-hidden
                />

                <ol className="relative m-0 list-none space-y-0 p-0">
                  {era.entries.map((entry, index) => {
                    const isRich = entry.events.length >= 3
                    return (
                      <li key={`${entry.period}-${index}`} className="relative pb-8 last:pb-2">
                        <div className="flex gap-5 sm:gap-8">
                          {/* Dot marker */}
                          <div className="relative z-[1] flex w-12 shrink-0 justify-center sm:w-14">
                            <div
                              className={cn(
                                'mt-1 flex size-[2.125rem] items-center justify-center rounded-full border-[3px] border-[#f8f7f5] shadow-md ring-2',
                                isRich
                                  ? 'bg-brand-red ring-brand-red/35'
                                  : 'bg-brand-red/80 ring-brand-red/20',
                              )}
                            >
                              <span className="sr-only">Timeline marker</span>
                            </div>
                          </div>

                          {/* Card */}
                          <div className="min-w-0 flex-1 space-y-3 pt-0.5">
                            <time
                              dateTime={entry.period.replace(/\u2013|\u2014/g, '-')}
                              className="inline-flex items-center rounded-lg bg-brand-navy px-3 py-1 text-sm font-bold tracking-tight text-white shadow-sm"
                            >
                              {entry.period}
                            </time>

                            <div
                              className={cn(
                                'rounded-2xl border bg-white p-4 shadow-sm sm:p-5',
                                isRich ? 'border-brand-red/20' : 'border-gray-200',
                              )}
                            >
                              {isRich && (
                                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-red/60">
                                  {entry.events.length} events
                                </p>
                              )}
                              <ul className="m-0 flex flex-col gap-3 p-0">
                                {entry.events.map((text, i) => (
                                  <li
                                    key={i}
                                    className="relative pl-5 text-sm leading-relaxed text-muted-foreground before:absolute before:left-0 before:top-[0.55rem] before:size-1.5 before:rounded-full before:bg-brand-red/75 before:content-['']"
                                  >
                                    {text}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Exam tip ──────────────────────────────────────────── */}
      <div className="flex gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
        <p className="text-sm text-amber-900">
          <strong className="font-semibold">Exam tip: </strong>
          Focus on Confederation (1867), the Charter of Rights and Freedoms (1982), women&apos;s right
          to vote federally (1918), and the first Indigenous Governor General (2021). These
          appear most frequently in practice tests.
        </p>
      </div>

      {/* ── Footer ────────────────────────────────────────────── */}
      <p className="text-center text-xs text-muted-foreground">
        Cross-check dates and wording with{' '}
        <a
          className="underline underline-offset-2 hover:text-foreground"
          href="https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/study-guide.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          Discover Canada
        </a>{' '}
        and other official IRCC materials.
      </p>
    </div>
  )
}
