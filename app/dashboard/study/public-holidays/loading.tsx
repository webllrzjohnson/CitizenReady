import { Skeleton } from '@/components/ui/skeleton'

export default function PublicHolidaysLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-8">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-52 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-16 w-full rounded-2xl" />
    </div>
  )
}
