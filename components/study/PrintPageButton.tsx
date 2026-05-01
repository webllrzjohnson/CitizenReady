'use client'

import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PrintPageButton() {
  return (
    <Button
      type="button"
      variant="outline"
      className="gap-2 border-brand-navy/20"
      onClick={() => window.print()}
    >
      <Printer className="h-4 w-4" aria-hidden />
      Print or save as PDF
    </Button>
  )
}
