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

} from 'lucide-react'

import { useState } from 'react'



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

              'flex w-full items-center gap-3 rounded-md border-l-4 py-2.5 pl-3 pr-2 text-sm font-medium transition-colors',

              isActive

                ? 'border-brand-red bg-brand-navy-light text-brand-red'

                : 'border-transparent text-gray-300 hover:bg-white/5 hover:text-white',

              isProgressLocked &&

                !isActive &&

                'text-gray-500 hover:bg-white/5 hover:text-gray-400'

            )}

          >

            <Icon className="h-4 w-4 shrink-0" />

            {item.label}

            {isProgressLocked && (

              <Lock className="ml-auto h-3.5 w-3.5 shrink-0 text-gray-500" aria-hidden />

            )}

          </Link>

        )

      })}

    </nav>

  )



  return (

    <>

      <Button

        variant="outline"

        size="icon"

        className="fixed bottom-4 right-4 z-50 border-brand-navy bg-brand-navy text-white hover:bg-brand-navy-light hover:text-white lg:hidden"

        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}

      >

        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}

      </Button>



      {isMobileMenuOpen && (

        <div

          className="fixed inset-0 z-40 bg-black/50 lg:hidden"

          onClick={() => setIsMobileMenuOpen(false)}

        >

          <aside

            className="fixed left-0 top-0 h-full w-72 overflow-y-auto border-r border-brand-navy-light bg-brand-navy p-6"

            onClick={(e) => e.stopPropagation()}

          >

            <Link href="/dashboard" className="mb-6 block text-xl font-bold text-white">

              CitizenRead<span className="text-brand-red">y</span>

            </Link>

            <SidebarContent />

          </aside>

        </div>

      )}



      <aside className="hidden w-72 shrink-0 overflow-y-auto border-r border-brand-navy-light bg-brand-navy p-6 lg:block">

        <Link href="/dashboard" className="mb-8 block text-xl font-bold text-white">

          CitizenRead<span className="text-brand-red">y</span>

        </Link>

        <SidebarContent />

      </aside>

    </>

  )

}

