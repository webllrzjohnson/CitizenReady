import { Skeleton } from '@/components/ui/skeleton'

export default function ImportantDatesLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-8">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-52 w-full rounded-2xl" />
      <Skeleton className="h-10 w-full rounded-xl" />

      {/* Era sections */}
      {Array.from({ length: 3 }).map((_, era) => (
        <div key={era} className="space-y-6">
          {/* Era divider */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-px flex-1" />
            <Skeleton className="h-8 w-40 rounded-full" />
            <Skeleton className="h-px flex-1" />
          </div>
          {/* Timeline entries */}
          {Array.from({ length: era === 0 ? 4 : 3 }).map((_, i) => (
            <div key={i} className="flex gap-5 pl-1 sm:gap-8">
              <Skeleton className="mt-1 size-[2.125rem] shrink-0 rounded-full" />
              <div className="flex-1 space-y-3 pt-0.5">
                <Skeleton className="h-7 w-20 rounded-lg" />
                <Skeleton className="h-20 w-full rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
