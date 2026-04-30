import { Skeleton } from '@/components/ui/skeleton'

export default function StudyHubLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-8">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-44 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}
