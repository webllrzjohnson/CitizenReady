import { Skeleton } from '@/components/ui/skeleton'

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-surface-page">
      <div className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
        <div className="mx-auto mb-10 max-w-xl space-y-3 text-center md:mb-14">
          <Skeleton className="mx-auto h-12 w-64 rounded-md" />
          <Skeleton className="mx-auto h-6 w-full max-w-lg rounded-md" />
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-surface-border bg-surface-card"
            >
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="space-y-3 p-6">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-7 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
