import { Skeleton } from '@/components/ui/skeleton'

export default function ImportantDatesLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-8">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-44 w-full rounded-2xl" />
      <Skeleton className="h-5 w-full max-w-xl" />
      <div className="space-y-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4 pl-8">
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-7 w-24 rounded-md" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
