import { Skeleton } from '@/components/ui/skeleton'

export default function PublicHolidaysLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-44 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Skeleton className="hidden h-[520px] w-full md:block" />
      <div className="space-y-3 md:hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    </div>
  )
}
