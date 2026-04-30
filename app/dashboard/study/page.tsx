import Link from 'next/link'
import { ArrowLeft, ExternalLink, GraduationCap, BookMarked } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

      <Card className="border-brand-red/15 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookMarked className="h-5 w-5 text-brand-red" aria-hidden />
            Official IRCC resources
          </CardTitle>
          <CardDescription>
            Always confirm facts with Immigration, Refugees and Citizenship Canada before your appointment — formats and rules can change.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
        </CardContent>
      </Card>

      <section aria-label="Study sheets">
        <h2 className="sr-only">Study sheets</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {sheets.map(({ href, title, description, Icon }) => (
            <Link key={href} href={href} className="group block rounded-xl outline-none ring-brand-red focus-visible:ring-2">
              <Card className="h-full border-border/80 shadow-sm transition-shadow group-hover:shadow-md">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-navy text-white">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <CardTitle className="text-lg transition-colors group-hover:text-brand-red">{title}</CardTitle>
                    <CardDescription className="text-sm">{description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <span className="text-sm font-medium text-brand-red dark:text-brand-red-light">Open sheet →</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">About the citizenship test</CardTitle>
          <CardDescription className="text-muted-foreground">
            IRCC typically draws multiple-choice questions from topics covered in Discover Canada (rights and responsibilities,
            history, symbols, institutions, etc.). Use{' '}
            <a className="font-medium text-foreground underline underline-offset-2" href={IRCC_STUDY_GUIDE}>
              the official guide
            </a>{' '}
            for authoritative wording and the latest eligibility rules.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
