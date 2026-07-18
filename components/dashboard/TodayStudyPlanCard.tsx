import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { TodayStudyPlanItem } from '@/lib/progress-insights'

export function TodayStudyPlanCard({ items }: { items: TodayStudyPlanItem[] }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-gray-900">Today&apos;s study plan</p>
          <p className="mt-0.5 text-sm text-gray-500">Three focused steps based on your recent progress.</p>
        </div>
        <Badge variant="secondary">Smart plan</Badge>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <Link
            key={`${item.href}-${index}`}
            href={item.href}
            className="group flex gap-4 rounded-xl border border-gray-100 p-4 transition-colors hover:border-brand-red/40 hover:bg-red-50/30"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white">
              {index + 1}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-gray-900 transition-colors group-hover:text-brand-red">{item.title}</p>
                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {item.estimate}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">{item.reason}</p>
            </div>
            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-brand-red" aria-hidden />
          </Link>
        ))}
      </div>

      <Button asChild className="mt-4 w-full bg-brand-red text-white hover:bg-brand-red-dark">
        <Link href={items[0]?.href ?? '/dashboard/practice'}>Start first step</Link>
      </Button>
    </section>
  )
}
