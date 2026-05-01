import Link from 'next/link'
import { ArrowLeft, ExternalLink, GraduationCap, BookMarked, ListChecks, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StudyPageHero } from '@/components/study/StudyPageHero'
import { studySheetsWithIcons } from '@/lib/study/study-sheet-icons'

const IRCC_STUDY_GUIDE =
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/study-guide.html'
const IRCC_PRACTICE_TEST =
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/test/practice.html'

export default function StudyHubPage() {
  const sheets = studySheetsWithIcons()

  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-8">
      <Button variant="ghost" size="sm" className="-ml-3 w-fit gap-2 text-muted-foreground" asChild>
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to overview
        </Link>
      </Button>

      <StudyPageHero
        icon={GraduationCap}
        eyebrow="Citizenship prep"
        title="Study centre"
        description="Explore focused sheets on holidays, history, government, symbols, people, and responsibilities — designed as a companion to IRCC’s official materials."
      />

      <div className="rounded-2xl border border-brand-red/20 bg-white p-6 shadow-sm">
        <div className="mb-1 flex items-center gap-2">
          <BookMarked className="h-5 w-5 text-brand-red" aria-hidden />
          <h2 className="text-lg font-semibold text-gray-900">Official IRCC resources</h2>
        </div>
        <p className="mb-4 text-sm text-gray-500">
          Always confirm facts with Immigration, Refugees and Citizenship Canada before your appointment — formats and rules can change.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button variant="outline" className="justify-start gap-2 border-brand-navy/20" asChild>
            <a href={IRCC_STUDY_GUIDE} target="_blank" rel="noopener noreferrer">
              Discover Canada (study guide)
              <ExternalLink className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
            </a>
          </Button>
          <Button variant="outline" className="justify-start gap-2 border-brand-navy/20" asChild>
            <a href={IRCC_PRACTICE_TEST} target="_blank" rel="noopener noreferrer">
              Official practice questions
              <ExternalLink className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
            </a>
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-red/20 bg-gradient-to-br from-brand-red/[0.05] to-transparent p-6 shadow-sm">
        <div className="mb-1 flex items-center gap-2">
          <Zap className="h-5 w-5 text-brand-red" aria-hidden />
          <h2 className="text-lg font-semibold text-gray-900">Cheat sheet — 150 most likely questions</h2>
        </div>
        <p className="mb-4 text-sm text-gray-500">
          Survey-ranked: the 150 questions most likely to appear on your test, with instant answer reveal and
          exam tips. Free preview included; full sheet unlocked with Plus.
        </p>
        <Button className="bg-brand-red hover:bg-brand-red-dark" asChild>
          <Link href="/study/cheat-sheet">Open cheat sheet →</Link>
        </Button>
      </div>

      <div className="rounded-2xl border border-brand-navy/15 bg-gradient-to-br from-brand-navy/[0.04] to-transparent p-6 shadow-sm">
        <div className="mb-1 flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-brand-red" aria-hidden />
          <h2 className="text-lg font-semibold text-gray-900">Complete question bank</h2>
        </div>
        <p className="mb-4 text-sm text-gray-500">
          Browse every active question by <em>Discover Canada</em> chapter — free users get a
          random sample from all topics; Plus unlocks every chapter. Interactive practice still works for all topics.
        </p>
        <Button className="bg-brand-red hover:bg-brand-red-dark" asChild>
          <Link href="/study/complete-questions">Open question bank →</Link>
        </Button>
      </div>

      <section aria-label="Study sheets">
        <h2 className="sr-only">Study sheets</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {sheets.map(({ href, title, description, Icon }) => (
            <Link key={href} href={href} className="group block rounded-2xl outline-none ring-brand-red focus-visible:ring-2">
              <div className="h-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow group-hover:shadow-md">
                <div className="flex flex-row items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-white">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-brand-red">{title}</p>
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                </div>
                <div className="mt-3 pl-[3.75rem]">
                  <span className="text-sm font-medium text-brand-red">Open sheet →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-base font-semibold text-gray-900">About the citizenship test</h2>
        <p className="text-sm text-gray-500">
          IRCC typically draws multiple-choice questions from topics covered in Discover Canada (rights and responsibilities,
          history, symbols, institutions, etc.). Use{' '}
          <a className="font-medium text-gray-700 underline underline-offset-2" href={IRCC_STUDY_GUIDE}>
            the official guide
          </a>{' '}
          for authoritative wording and the latest eligibility rules.
        </p>
      </div>
    </div>
  )
}
