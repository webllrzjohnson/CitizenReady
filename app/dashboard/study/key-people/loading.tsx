import { Skeleton } from '@/components/ui/skeleton'

export default function StudyKeyPeopleLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-8">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-44 w-full max-w-3xl rounded-2xl" />
      <Skeleton className="h-16 w-full max-w-2xl rounded-lg" />
      <div className="grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[340px] w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}
