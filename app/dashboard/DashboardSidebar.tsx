'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Home,
  BookOpen,
  FileText,
  TrendingUp,
  Settings,
  Menu,
  X,
  Lock,
  CalendarDays,
  History,
  Library,
  Landmark,
  Flag,
  Users,
  Scale,
  BookCopy,
  ListChecks,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

function isSidebarNavActive(pathname: string, href: string): boolean {
  if (pathname === href) return true
  if (href === '/dashboard') return false
  if (href === '/dashboard/study') return false
  return pathname.startsWith(`${href}/`)
}

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: Home },
  { href: '/dashboard/study', label: 'Study centre', icon: Library },
  { href: '/dashboard/study/handbook', label: 'Discover Canada handbook', icon: BookCopy },
  { href: '/study/complete-questions', label: 'Complete question bank', icon: ListChecks },
  { href: '/dashboard/study/public-holidays', label: 'Public holidays', icon: CalendarDays },
  { href: '/dashboard/study/important-dates', label: 'Important dates', icon: History },
  { href: '/dashboard/study/government', label: 'Government', icon: Landmark },
  { href: '/dashboard/study/symbols-and-capitals', label: 'Symbols & capitals', icon: Flag },
  { href: '/dashboard/study/key-people', label: 'Important people', icon: Users },
  { href: '/dashboard/study/rights-and-responsibilities', label: 'Rights & duties', icon: Scale },
  { href: '/dashboard/practice', label: 'Practice', icon: BookOpen },
  { href: '/dashboard/mock-exam', label: 'Mock Exam', icon: FileText },
  { href: '/dashboard/progress', label: 'Progress', icon: TrendingUp },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function DashboardSidebar({ isGuest = false }: { isGuest?: boolean }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const toggleButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isMobileMenuOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false)
        toggleButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMobileMenuOpen])

  const logo = (
    <Link href="/dashboard" className="mb-6 block text-xl font-extrabold text-white lg:mb-8">
      Citizen<span className="text-[#E8192C]">Ready</span>
    </Link>
  )

  const SidebarContent = () => (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const isProgressLocked = isGuest && item.href === '/dashboard/progress'
        const isActive = isSidebarNavActive(pathname, item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg py-2.5 pl-4 pr-2 text-sm font-medium transition-colors',
              isActive
                ? 'rounded-l-lg rounded-r-none border-l-2 border-[#E8192C] bg-white/10 font-semibold text-white'
                : 'border-l-2 border-transparent text-white/60 hover:bg-white/5 hover:text-white/90',
              isProgressLocked && !isActive && 'text-white/40 hover:text-white/60'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
            {isProgressLocked && (
              <Lock className="ml-auto h-3.5 w-3.5 shrink-0 text-white/40" aria-hidden />
            )}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      <Button
        ref={toggleButtonRef}
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 border-white/20 bg-[#1B2A4A] text-white hover:bg-[#243558] hover:text-white lg:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isMobileMenuOpen}
        aria-controls="dashboard-mobile-nav"
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
      </Button>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        >
          <aside
            id="dashboard-mobile-nav"
            className="fixed left-0 top-0 h-full w-64 overflow-y-auto border-r border-white/10 bg-[#1B2A4A] p-6"
            onClick={(e) => e.stopPropagation()}
            aria-label="Dashboard navigation"
          >
            {logo}
            <SidebarContent />
          </aside>
        </div>
      )}

      <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-white/10 bg-[#1B2A4A] p-6 lg:block">
        {logo}
        <SidebarContent />
      </aside>
    </>
  )
}
