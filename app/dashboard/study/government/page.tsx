import Link from 'next/link'
import { ArrowLeft, Landmark, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

      <div className="space-y-4">
        {STUDY_GOVERNMENT_SECTIONS.map((section, idx) => (
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
              <ul className="m-0 flex flex-col gap-3 p-0">
                {section.bullets.map((line, i) => (
                  <li
                    key={i}
                    className="relative pl-5 text-sm leading-relaxed text-gray-600 before:absolute before:left-0 before:top-[0.55rem] before:size-1.5 before:rounded-full before:bg-brand-red/70 before:content-['']"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
        <p className="text-sm text-amber-900">
          <strong className="font-semibold">Exam tip: </strong>
          Know the three parts of Parliament (Sovereign, Senate, House of Commons) and the three levels of government
          (federal, provincial/territorial, municipal). These are among the most-tested concepts.
        </p>
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
