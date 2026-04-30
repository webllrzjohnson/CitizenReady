import Link from 'next/link'
import { ArrowLeft, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CANADA_IMPORTANT_DATES } from '@/lib/data/canada-important-dates'

export default function ImportantDatesStudyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-8">
      <Button variant="ghost" size="sm" className="-ml-3 w-fit gap-2 text-muted-foreground" asChild>
        <Link href="/dashboard/study">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to study centre
        </Link>
      </Button>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-brand-navy via-brand-navy-light to-brand-navy p-8 text-white shadow-lg">
        <div
          className="pointer-events-none absolute -right-12 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-brand-red/20 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
            <History className="h-7 w-7 text-brand-red-light" aria-hidden />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Study sheet</p>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Important dates in Canadian history
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
              A timeline of milestones that often appear in citizenship study guides — politics, rights, symbols,
              and defining moments from early foundations to today.
            </p>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Listed from <strong className="font-medium text-foreground">recent to older</strong> so you can review modern events first,
        then walk backward through the story of Canada.
      </p>

      <section aria-label="Canadian history timeline">
        <div className="relative">
          <div
            className="absolute left-[1.375rem] top-4 bottom-4 w-[3px] rounded-full bg-gradient-to-b from-brand-red via-brand-red/40 to-brand-navy/30 sm:left-6"
            aria-hidden
          />

          <ol className="relative m-0 list-none space-y-0 p-0">
            {CANADA_IMPORTANT_DATES.map((entry, index) => (
              <li key={`${entry.period}-${index}`} className="relative pb-10 last:pb-2">
                <div className="flex gap-5 sm:gap-8">
                  <div className="relative z-[1] flex w-12 shrink-0 justify-center sm:w-14">
                    <div className="mt-1 flex size-[2.125rem] items-center justify-center rounded-full border-[3px] border-surface-page bg-brand-red shadow-md ring-2 ring-brand-red/25">
                      <span className="sr-only">Timeline marker</span>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-3 pt-0.5">
                    <time
                      dateTime={entry.period.replace(/\u2013|\u2014/g, '-')}
                      className="inline-flex items-center rounded-lg bg-brand-navy px-3 py-1 text-sm font-bold tracking-tight text-white shadow-sm"
                    >
                      {entry.period}
                    </time>

                    <Card className="border-border/80 p-4 shadow-md ring-1 ring-black/[0.06] sm:p-5">
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
                    </Card>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

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
