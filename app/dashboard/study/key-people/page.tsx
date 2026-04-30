import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { KeyPersonCard } from '@/components/study/KeyPersonCard'
import { StudyPageHero } from '@/components/study/StudyPageHero'
import { STUDY_KEY_PEOPLE_SORTED } from '@/lib/data/study-key-people'

export default function StudyKeyPeoplePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-8">
      <Button variant="ghost" size="sm" className="-ml-3 w-fit gap-2 text-muted-foreground" asChild>
        <Link href="/dashboard/study">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to study centre
        </Link>
      </Button>

      <StudyPageHero
        icon={Users}
        title="Important people"
        description="Profiles similar in breadth to companion citizenship sites — explorers, Confederation figures, soldiers, scientists, athletes, and human-rights pioneers. Sorted A–Z by family name for quick lookup."
      />

      <p className="text-sm text-muted-foreground">
        Portraits are photographs, paintings, or monuments from{' '}
        <a
          href="https://commons.wikimedia.org/"
          className="font-medium text-foreground underline underline-offset-2 hover:text-brand-red"
          target="_blank"
          rel="noopener noreferrer"
        >
          Wikimedia Commons
        </a>{' '}
        (public domain or CC-licensed; licence varies by file). Where no suitable open image exists, a placeholder is shown instead of a misleading substitute.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        {STUDY_KEY_PEOPLE_SORTED.map((person) => (
          <KeyPersonCard key={person.slug} person={person} />
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Discover Canada introduces additional explorers, artists, and soldiers — cross-check everyone you memorize against the{' '}
        <a
          className="font-medium text-foreground underline underline-offset-2"
          href="https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/study-guide.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          official study guide
        </a>
        .
      </p>
    </div>
  )
}
