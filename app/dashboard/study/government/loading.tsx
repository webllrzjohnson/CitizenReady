import { Skeleton } from '@/components/ui/skeleton'

export default function StudyGovernmentLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-8">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}
