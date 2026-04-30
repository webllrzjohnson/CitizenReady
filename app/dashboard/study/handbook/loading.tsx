import { Skeleton } from '@/components/ui/skeleton'

export default function HandbookLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-8">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-44 w-full rounded-2xl" />
      <Skeleton className="h-28 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="min-h-[70vh] w-full rounded-xl" />
    </div>
  )
}
