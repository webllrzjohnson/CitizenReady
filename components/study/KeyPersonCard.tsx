import Image from 'next/image'
import { UserRound } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { StudyKeyPerson } from '@/lib/data/study-key-people'
import { keyPersonPortraitUrl } from '@/lib/study/key-person-portraits'

export function KeyPersonCard({ person }: { person: StudyKeyPerson }) {
  const src = keyPersonPortraitUrl(person.slug)

  return (
    <Card className="overflow-hidden shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-col gap-4 border-b border-border/60 bg-gradient-to-br from-muted/40 to-transparent pb-4 sm:flex-row sm:items-center">
        <div className="relative mx-auto h-36 w-36 shrink-0 overflow-hidden rounded-2xl bg-muted shadow-inner ring-2 ring-border sm:mx-0">
          {src ? (
            <Image
              src={src}
              alt={`Photograph or historical portrait of ${person.name}.`}
              width={144}
              height={144}
              className="h-full w-full object-cover object-center"
              sizes="144px"
              unoptimized
            />
          ) : (
            <div
              className="flex h-full w-full flex-col items-center justify-center gap-1 bg-muted px-2 text-center"
              role="img"
              aria-label={`No open-licence photograph available for ${person.name}.`}
            >
              <UserRound className="h-10 w-10 text-muted-foreground/80" aria-hidden />
              <span className="text-[10px] leading-tight text-muted-foreground">Photo unavailable</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1.5 text-center sm:text-left">
          <CardTitle className="text-lg leading-snug tracking-tight">{person.name}</CardTitle>
          <CardDescription className="text-sm leading-snug">{person.tagline}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ul className="m-0 flex flex-col gap-2.5 p-0">
          {person.bullets.map((line, i) => (
            <li
              key={i}
              className="relative pl-4 text-sm leading-relaxed text-muted-foreground before:absolute before:left-0 before:top-2 before:size-1 before:rounded-full before:bg-brand-red/70 before:content-['']"
            >
              {line}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
