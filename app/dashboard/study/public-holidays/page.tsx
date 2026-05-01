import Link from 'next/link'
import { ArrowLeft, CalendarRange, Lightbulb } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CANADA_PUBLIC_HOLIDAYS,
  type HolidayKind,
} from '@/lib/data/canada-public-holidays'
import { cn } from '@/lib/utils'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function kindLabel(kind: HolidayKind): string {
  switch (kind) {
    case 'federal':      return 'Federal'
    case 'commemorative': return 'Commemorative'
    case 'quebec':       return 'Québec'
    default:             return kind
  }
}

const KIND_STYLES: Record<HolidayKind, { badge: string; borderL: string }> = {
  federal: {
    badge:   'border-brand-red/40 bg-brand-red-light/80 text-brand-red-dark dark:bg-brand-red/10 dark:text-brand-red-light',
    borderL: 'border-l-brand-red',
  },
  commemorative: {
    badge:   'border-muted-foreground/25 bg-muted/40 text-muted-foreground',
    borderL: 'border-l-gray-400',
  },
  quebec: {
    badge:   'border-blue-300/60 bg-blue-50 text-blue-900 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-100',
    borderL: 'border-l-blue-500',
  },
}

function KindBadge({ kind }: { kind: HolidayKind }) {
  return (
    <Badge
      variant="outline"
      className={cn('shrink-0 font-normal text-xs', KIND_STYLES[kind].badge)}
    >
      {kindLabel(kind)}
    </Badge>
  )
}

export default function PublicHolidaysStudyPage() {
  const sorted = [...CANADA_PUBLIC_HOLIDAYS].sort((a, b) => a.monthOrder - b.monthOrder)

  const counts = sorted.reduce(
    (acc, h) => { acc[h.kind] = (acc[h.kind] ?? 0) + 1; return acc },
    {} as Record<HolidayKind, number>,
  )

  const byMonth = sorted.reduce<Record<number, typeof sorted>>((acc, h) => {
    acc[h.monthOrder] = [...(acc[h.monthOrder] ?? []), h]
    return acc
  }, {})

  const monthEntries = Object.entries(byMonth).map(([m, holidays]) => ({
    month: MONTHS[Number(m) - 1],
    holidays,
  }))

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-8">
      <Button variant="ghost" size="sm" className="-ml-3 w-fit gap-2 text-muted-foreground" asChild>
        <Link href="/dashboard/study">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to study centre
        </Link>
      </Button>

      {/* ── Hero ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-navy via-[#1a2a4a] to-[#0f1e35] p-8 text-white shadow-xl">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(211,47,47,0.18),transparent_60%)]"
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10 backdrop-blur">
            <CalendarRange className="h-7 w-7 text-brand-red-light" aria-hidden />
          </div>
          <div className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Study sheet</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Canada — public holidays
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
              Quick reference for dates and observances that often appear in citizenship study material.
              Rules for paid days off differ by province, territory, and employer.
            </p>
            {/* Stats pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FFEBEE]" aria-hidden />
                {counts.federal} Federal
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-300" aria-hidden />
                {counts.commemorative} Commemorative
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-300" aria-hidden />
                {counts.quebec} Québec
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Legend cards ────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Federal */}
        <div className="rounded-2xl border border-brand-red/25 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-900">Federal</p>
            <span className="rounded-full bg-brand-red/10 px-2.5 py-0.5 text-xs font-semibold text-brand-red-dark">
              {counts.federal}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-gray-500">
            Widely observed nationwide — statutory for federal employees
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-brand-red/10">
            <div
              className="h-full rounded-full bg-brand-red"
              style={{ width: `${(counts.federal / sorted.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Commemorative */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-900">Commemorative</p>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
              {counts.commemorative}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-gray-500">
            National days of remembrance and honour — not always statutory
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gray-400"
              style={{ width: `${(counts.commemorative / sorted.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Québec */}
        <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-900">Québec</p>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              {counts.quebec}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-gray-500">
            Provincial observance learners should know
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-blue-100">
            <div
              className="h-full rounded-full bg-blue-400"
              style={{ width: `${(counts.quebec / sorted.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Month-by-month list ──────────────────────────────── */}
      <div className="space-y-4">
        {monthEntries.map(({ month, holidays }) => (
          <div
            key={month}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
          >
            {/* Month header */}
            <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/70 px-5 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-navy text-[11px] font-bold tracking-wide text-white">
                {month.slice(0, 3).toUpperCase()}
              </div>
              <p className="font-semibold text-gray-800">{month}</p>
              <span className="ml-auto text-xs text-gray-400">
                {holidays.length} {holidays.length === 1 ? 'observance' : 'observances'}
              </span>
            </div>

            {/* Holiday rows */}
            <ul className="divide-y divide-gray-100">
              {holidays.map((row) => (
                <li
                  key={row.name}
                  className={cn(
                    'flex items-start gap-4 border-l-[3px] px-5 py-4 transition-colors hover:bg-gray-50/60',
                    KIND_STYLES[row.kind].borderL,
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-snug text-gray-900">{row.name}</p>
                    <p className="mt-0.5 text-sm text-gray-500">{row.when}</p>
                    {row.note ? (
                      <p className="mt-1 text-xs leading-snug text-gray-400">{row.note}</p>
                    ) : null}
                  </div>
                  <div className="shrink-0 pt-0.5">
                    <KindBadge kind={row.kind} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Exam tip ────────────────────────────────────────── */}
      <div className="flex gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
        <p className="text-sm text-amber-900">
          <strong className="font-semibold">Exam tip: </strong>
          Canada Day (July 1), Remembrance Day (November 11), and Victoria Day are the most commonly
          tested federal holidays. Know their exact dates and significance cold.
        </p>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        For official schedules and employment standards, see{' '}
        <a
          className="underline underline-offset-2 hover:text-foreground"
          href="https://www.canada.ca/en/services/finance/publicholidays.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          Canada.ca — Public holidays
        </a>
        .
      </p>
    </div>
  )
}
