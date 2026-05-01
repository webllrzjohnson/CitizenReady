import Link from 'next/link'
import { ArrowLeft, Flag, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StudyFlagFigure } from '@/components/study/StudyFlagFigure'
import { StudyPageHero } from '@/components/study/StudyPageHero'
import {
  STUDY_NATIONAL_SYMBOL_SECTIONS,
  STUDY_PROVINCIAL_TERRITORIAL_CAPITALS,
  STUDY_PROVINCIAL_TERRITORIAL_FLAGS,
  STUDY_SYMBOLS_EXAM_NOTES,
} from '@/lib/data/study-symbols-capitals'

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="m-0 flex flex-col gap-3 p-0">
      {items.map((line, i) => (
        <li
          key={i}
          className="relative pl-5 text-sm leading-relaxed text-muted-foreground before:absolute before:left-0 before:top-[0.55rem] before:size-1.5 before:rounded-full before:bg-brand-red/70 before:content-['']"
        >
          {line}
        </li>
      ))}
    </ul>
  )
}

export default function StudySymbolsCapitalsPage() {
  const capitalsSorted = [...STUDY_PROVINCIAL_TERRITORIAL_CAPITALS].sort((a, b) =>
    a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
  )
  const flagsSorted = [...STUDY_PROVINCIAL_TERRITORIAL_FLAGS].sort((a, b) =>
    a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
  )

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-8">
      <Button variant="ghost" size="sm" className="-ml-3 w-fit gap-2 text-muted-foreground" asChild>
        <Link href="/dashboard/study">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to study centre
        </Link>
      </Button>

      <StudyPageHero
        icon={Flag}
        title="Symbols & capitals"
        description="Official emblems plus design notes and trivia for flags across Canada — not just pictures and names."
      />

      {/* ── National symbols ──────────────────────────────────── */}
      <div className="space-y-4">
        {STUDY_NATIONAL_SYMBOL_SECTIONS.map((section, idx) => (
          <div
            key={section.heading}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/60 px-6 py-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-navy text-[11px] font-bold text-white">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <h2 className="text-base font-semibold text-gray-900">{section.heading}</h2>
            </div>
            <div className="px-6 py-4">
              {section.imageKey ? (
                <StudyFlagFigure name="Canada" imageKey={section.imageKey} size="lg" />
              ) : null}
              <BulletList items={section.bullets} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Exam-style notes ──────────────────────────────────── */}
      <div className="flex gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/80 p-5">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-amber-900">Exam-style notes &amp; trivia</p>
            <p className="mt-0.5 text-xs text-amber-700">Shortcuts that confuse people on drills — skim before a mock test.</p>
          </div>
          <BulletList items={STUDY_SYMBOLS_EXAM_NOTES} />
          <p className="rounded-xl bg-amber-100/70 px-4 py-3 text-sm text-amber-900">
            Canada&apos;s federal capital is <strong className="font-semibold">Ottawa</strong>, located in the province of Ontario.
          </p>
        </div>
      </div>

      {/* ── Provincial & territorial flags ────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 pb-4 pt-6">
          <h2 className="text-lg font-semibold text-gray-900">Provincial &amp; territorial flags</h2>
          <p className="mt-1 text-sm text-gray-500">
            What distinguishes each banner — visuals, heraldry, and story beats likely to stick in memory.
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Flag illustrations are Wikimedia Commons SVGs bundled for offline-friendly study — colours may differ slightly from official specimens.
          </p>
        </div>
        <div className="divide-y divide-gray-100">
          {flagsSorted.map((row, idx) => (
            <div key={row.name} className="px-6 py-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-navy text-[11px] font-bold text-white">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <h3 className="text-base font-semibold text-gray-800">{row.name}</h3>
              </div>
              <StudyFlagFigure name={row.name} imageKey={row.imageKey} />
              <BulletList items={row.bullets} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Capitals table ────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Provincial &amp; territorial capitals</h2>
          <p className="mt-1 text-sm text-gray-500">
            Know both names cold — questions often pair jurisdiction with capital.
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Province or territory</TableHead>
              <TableHead className="pr-6 text-right">Capital city</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {capitalsSorted.map((row) => (
              <TableRow key={row.name} className="group">
                <TableCell className="pl-6 font-medium text-gray-900">{row.name}</TableCell>
                <TableCell className="pr-6 text-right font-medium text-brand-navy">{row.capital}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Symbols are summarized here — verify details with{' '}
        <a
          className="underline underline-offset-2 hover:text-foreground"
          href="https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/study-guide.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          Discover Canada
        </a>
        .
      </p>
    </div>
  )
}
