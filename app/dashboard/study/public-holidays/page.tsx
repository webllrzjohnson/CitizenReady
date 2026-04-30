import Link from 'next/link'
import { ArrowLeft, CalendarRange } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  CANADA_PUBLIC_HOLIDAYS,
  type HolidayKind,
} from '@/lib/data/canada-public-holidays'
import { cn } from '@/lib/utils'

function kindLabel(kind: HolidayKind): string {
  switch (kind) {
    case 'federal':
      return 'Federal'
    case 'commemorative':
      return 'Commemorative'
    case 'quebec':
      return 'Québec'
    default:
      return kind
  }
}

function KindBadge({ kind }: { kind: HolidayKind }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-normal',
        kind === 'federal' &&
          'border-brand-red/40 bg-brand-red-light/80 text-brand-red-dark dark:bg-brand-red/10 dark:text-brand-red-light',
        kind === 'commemorative' && 'border-muted-foreground/25 bg-muted/40 text-muted-foreground',
        kind === 'quebec' &&
          'border-blue-300/60 bg-blue-50 text-blue-900 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-100'
      )}
    >
      {kindLabel(kind)}
    </Badge>
  )
}

export default function PublicHolidaysStudyPage() {
  const sorted = [...CANADA_PUBLIC_HOLIDAYS].sort((a, b) => a.monthOrder - b.monthOrder)

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <Button variant="ghost" size="sm" className="-ml-3 w-fit gap-2 text-muted-foreground" asChild>
        <Link href="/dashboard/study">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to study centre
        </Link>
      </Button>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-brand-navy via-brand-navy-light to-brand-navy p-8 text-white shadow-lg">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-red/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 left-1/4 h-40 w-40 rounded-full bg-white/5 blur-2xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
            <CalendarRange className="h-7 w-7 text-brand-red-light" aria-hidden />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
              Study sheet
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Canada — public holidays
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
              Quick reference for dates and observances that often appear in citizenship study material.
              Rules for paid days off differ by province, territory, and employer — use official sources when
              it matters for work or legal purposes.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-brand-red/15 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Federal</CardTitle>
            <CardDescription>Widely observed nationwide dates</CardDescription>
          </CardHeader>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Commemorative</CardTitle>
            <CardDescription>National days of remembrance & honour</CardDescription>
          </CardHeader>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Québec</CardTitle>
            <CardDescription>Provincial observance learners should know</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Desktop / tablet: table */}
      <Card className="hidden overflow-hidden shadow-md md:block">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-lg">Holiday list</CardTitle>
          <CardDescription>Movable holidays follow the Western calendar unless your employer specifies otherwise.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[38%] pl-6">Holiday</TableHead>
                <TableHead className="w-[37%]">When</TableHead>
                <TableHead className="pr-6 text-right">Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((row) => (
                <TableRow key={row.name}>
                  <TableCell className="align-top pl-6 font-medium">{row.name}</TableCell>
                  <TableCell className="max-w-md align-top text-muted-foreground">
                    <span className="text-foreground">{row.when}</span>
                    {row.note ? (
                      <span className="mt-1 block text-xs leading-snug text-muted-foreground">{row.note}</span>
                    ) : null}
                  </TableCell>
                  <TableCell className="pr-6 text-right align-top">
                    <KindBadge kind={row.kind} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile: cards */}
      <ul className="space-y-3 md:hidden">
        {sorted.map((row) => (
          <li key={row.name}>
            <Card className="overflow-hidden shadow-sm">
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base leading-snug">{row.name}</CardTitle>
                  <KindBadge kind={row.kind} />
                </div>
                <CardDescription className="text-sm text-foreground">{row.when}</CardDescription>
                {row.note ? <p className="text-xs text-muted-foreground">{row.note}</p> : null}
              </CardHeader>
            </Card>
          </li>
        ))}
      </ul>

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
