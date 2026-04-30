import { Skeleton } from '@/components/ui/skeleton'

export default function StudySymbolsLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-8">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-56 w-full rounded-xl" />
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  )
}
