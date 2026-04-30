'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Home, BookOpen, FileText, TrendingUp, Settings, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: Home },
  { href: '/dashboard/practice', label: 'Practice', icon: BookOpen },
  { href: '/dashboard/mock-exam', label: 'Mock Exam', icon: FileText },
  { href: '/dashboard/progress', label: 'Progress', icon: TrendingUp },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const SidebarContent = () => (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        
        return (
          <Button
            key={item.href}
            variant={isActive ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start',
              isActive && 'bg-secondary'
            )}
            asChild
          >
            <Link href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Link>
          </Button>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 lg:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <aside
            className="fixed left-0 top-0 h-full w-64 border-r bg-background p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-6 text-lg font-semibold">Dashboard</h2>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r bg-background p-6 lg:block">
        <h2 className="mb-6 text-lg font-semibold">Dashboard</h2>
        <SidebarContent />
      </aside>
    </>
  )
}
