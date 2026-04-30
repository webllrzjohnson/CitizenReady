import Link from 'next/link'
import { ArrowLeft, Flag, Sparkles } from 'lucide-react'
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

      <div className="space-y-6">
        {STUDY_NATIONAL_SYMBOL_SECTIONS.map((section) => (
          <Card key={section.heading} className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">{section.heading}</CardTitle>
            </CardHeader>
            <CardContent>
              {section.imageKey ? (
                <StudyFlagFigure name="Canada" imageKey={section.imageKey} size="lg" />
              ) : null}
              <BulletList items={section.bullets} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm ring-1 ring-brand-red/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-brand-red" aria-hidden />
            Exam-style notes & trivia
          </CardTitle>
          <CardDescription>Shortcuts that confuse people on drills — skim before a mock test.</CardDescription>
        </CardHeader>
        <CardContent>
          <BulletList items={STUDY_SYMBOLS_EXAM_NOTES} />
          <p className="mt-6 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            Canada&apos;s federal capital is <strong className="text-foreground">Ottawa</strong>, located in the province of Ontario.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Provincial & territorial flags</CardTitle>
          <CardDescription>What distinguishes each banner — visuals, heraldry, and story beats likely to stick in memory.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 px-6 pb-8 pt-2">
          <p className="-mt-1 text-xs text-muted-foreground">
            Flag illustrations are Wikimedia Commons SVGs bundled for offline-friendly study — colours may differ slightly from official specimens.
          </p>
          {flagsSorted.map((row) => (
            <section key={row.name} className="border-b border-border/60 pb-8 last:border-0 last:pb-0">
              <h3 className="mb-3 text-base font-semibold text-foreground">{row.name}</h3>
              <StudyFlagFigure name={row.name} imageKey={row.imageKey} />
              <BulletList items={row.bullets} />
            </section>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Provincial & territorial capitals</CardTitle>
          <CardDescription>Know both names cold — questions often pair jurisdiction with capital.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Province or territory</TableHead>
                <TableHead className="pr-6 text-right">Capital city</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {capitalsSorted.map((row) => (
                <TableRow key={row.name}>
                  <TableCell className="pl-6 font-medium">{row.name}</TableCell>
                  <TableCell className="pr-6 text-right text-muted-foreground">{row.capital}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
