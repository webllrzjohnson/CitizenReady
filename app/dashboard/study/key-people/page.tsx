import Link from 'next/link'
import { ArrowLeft, Users, ExternalLink } from 'lucide-react'
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
        description="Explorers, Confederation figures, soldiers, scientists, athletes, and human-rights pioneers sorted A–Z by family name for quick lookup."
      />

      {/* Count + attribution note */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-brand-navy px-3 py-1 text-xs font-bold text-white">
            {STUDY_KEY_PEOPLE_SORTED.length} profiles
          </span>
          <span className="text-sm text-gray-500">sorted A–Z by family name</span>
        </div>
        <p className="text-xs text-gray-400">
          Portraits are public-domain or CC-licensed photos from{' '}
          <a
            href="https://commons.wikimedia.org/"
            className="font-medium text-gray-600 underline underline-offset-2 hover:text-brand-red"
            target="_blank"
            rel="noopener noreferrer"
          >
            Wikimedia Commons
            <ExternalLink className="ml-0.5 inline h-3 w-3 opacity-60" aria-hidden />
          </a>
          {' '}— a placeholder is shown where no open image exists.
        </p>
      </div>

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
