import Link from 'next/link'
import { ArrowLeft, Landmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StudyPageHero } from '@/components/study/StudyPageHero'
import { GovernmentOfficeholdersSection } from '@/components/study/GovernmentOfficeholdersSection'
import { STUDY_GOVERNMENT_SECTIONS } from '@/lib/data/study-government'

export default function StudyGovernmentPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-8">
      <Button variant="ghost" size="sm" className="-ml-3 w-fit gap-2 text-muted-foreground" asChild>
        <Link href="/dashboard/study">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to study centre
        </Link>
      </Button>

      <StudyPageHero
        icon={Landmark}
        title="Government & democracy"
        description="How authority is organized in Canada — Crown, Parliament, federalism, elections, and the Charter."
      />

      <GovernmentOfficeholdersSection />

      <div className="space-y-6">
        {STUDY_GOVERNMENT_SECTIONS.map((section) => (
          <Card key={section.heading} className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">{section.heading}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="m-0 flex flex-col gap-3 p-0">
                {section.bullets.map((line, i) => (
                  <li
                    key={i}
                    className="relative pl-5 text-sm leading-relaxed text-muted-foreground before:absolute before:left-0 before:top-[0.55rem] before:size-1.5 before:rounded-full before:bg-brand-red/70 before:content-['']"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Confirm wording with{' '}
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
