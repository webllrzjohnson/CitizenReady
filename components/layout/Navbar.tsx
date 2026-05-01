'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, User, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const publicNav = [
  { href: '/', label: 'Home', match: (path: string) => path === '/' },
  {
    href: '/study/cheat-sheet',
    label: 'Cheat Sheet',
    match: (path: string) => path === '/study/cheat-sheet',
  },
  {
    href: '/study/complete-questions',
    label: 'Question bank',
    match: (path: string) => path.startsWith('/study') && path !== '/study/cheat-sheet',
  },
  {
    href: '/pricing',
    label: 'Plus',
    match: (path: string) => path === '/pricing',
  },
  { href: '/blog', label: 'Blog', match: (path: string) => path.startsWith('/blog') },
  { href: '/contact', label: 'Contact', match: (path: string) => path === '/contact' },
  { href: '/#how-to-prepare', label: 'How It Works', hash: '#how-to-prepare' },
  { href: '/#topics', label: 'Topics', hash: '#topics' },
  { href: '/#success-stories', label: 'Stories', hash: '#success-stories' },
] as const

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [hash, setHash] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const mobileToggleRef = useRef<HTMLButtonElement>(null)
  const supabase = createClient()

  useEffect(() => {
    setHash(typeof window !== 'undefined' ? window.location.hash : '')
    const onHash = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Escape closes menu; Tab traps focus inside the mobile panel while open
  useEffect(() => {
    if (!mobileOpen) return

    const container = mobileMenuRef.current
    if (!container) return

    const getFocusable = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.closest('[aria-hidden="true"]'))

    const id = requestAnimationFrame(() => {
      const els = getFocusable()
      els[0]?.focus()
    })

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setMobileOpen(false)
        mobileToggleRef.current?.focus()
        return
      }

      if (e.key !== 'Tab') return

      const els = getFocusable()
      if (els.length === 0) return

      const first = els[0]
      const last = els[els.length - 1]
      const active = document.activeElement

      if (e.shiftKey) {
        if (active === first || !container.contains(active)) {
          e.preventDefault()
          last.focus()
        }
      } else if (active === last || !container.contains(active)) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      cancelAnimationFrame(id)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileOpen])

  const isNavActive = (item: (typeof publicNav)[number]) => {
    if ('match' in item && item.match) {
      return item.match(pathname)
    }
    if ('hash' in item && pathname === '/') {
      return hash === item.hash
    }
    return false
  }

  const loggedInLinks = [
    { href: '/dashboard', label: 'Dashboard', active: pathname.startsWith('/dashboard') },
    { href: '/blog', label: 'Blog', active: pathname.startsWith('/blog') },
    { href: '/contact', label: 'Contact', active: pathname === '/contact' },
    { href: '/study/cheat-sheet', label: 'Cheat Sheet', active: pathname === '/study/cheat-sheet' },
    {
      href: '/study/complete-questions',
      label: 'Question bank',
      active: pathname.startsWith('/study') && pathname !== '/study/cheat-sheet',
    },
    { href: '/pricing', label: 'Plus', active: pathname === '/pricing' },
  ]

  return (
    <nav className="bg-[#1B2A4A] shadow-[0_2px_4px_rgba(0,0,0,0.1)] print:hidden">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-extrabold text-white">
          Citizen<span className="text-[#E8192C]">Ready</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-6">
          {loading ? (
            <div className="h-9 w-20 animate-pulse rounded-md bg-white/10" aria-hidden="true" />
          ) : user ? (
            <>
              {/* Desktop links (logged-in) */}
              <div className="hidden items-center gap-1 sm:flex">
                {loggedInLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white',
                      item.active && 'border-b-2 border-[#E8192C] text-white',
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Mobile hamburger (logged-in) */}
              <Button
                ref={mobileToggleRef}
                variant="ghost"
                size="icon"
                className="sm:hidden text-white hover:bg-white/10 hover:text-white"
                aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav"
                onClick={() => setMobileOpen((o) => !o)}
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Account menu"
                    className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  >
                    <User className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      void (async () => {
                        try {
                          await supabase.auth.signOut()
                          router.push('/')
                          router.refresh()
                        } catch (err) {
                          console.error(err)
                        }
                      })()
                    }}
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              {/* Desktop links (logged-out) */}
              <div className="hidden items-center gap-1 md:flex">
                {publicNav.map((item) => {
                  const active = isNavActive(item)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white',
                        active && 'border-b-2 border-[#E8192C] text-white'
                      )}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile hamburger (logged-out) */}
                <Button
                  ref={mobileToggleRef}
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-white hover:bg-white/10 hover:text-white"
                  aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-nav"
                  onClick={() => setMobileOpen((o) => !o)}
                >
                  {mobileOpen ? (
                    <X className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  className="hidden max-w-[9rem] truncate px-2 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white sm:inline-flex sm:max-w-none sm:px-3 sm:text-sm"
                  asChild
                >
                  <Link href="/dashboard">Try free</Link>
                </Button>
                <Button variant="ghost" className="font-medium text-white/80 hover:bg-white/10 hover:text-white" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button
                  className="hidden bg-[#E8192C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#C41020] sm:inline-flex"
                  asChild
                >
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          ref={mobileMenuRef}
          className="border-t border-white/10 bg-[#1B2A4A] px-4 pb-4 pt-2 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {user ? (
            <ul className="space-y-1">
              {loggedInLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'block rounded-lg px-4 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white/90',
                      item.active &&
                        'rounded-l-lg rounded-r-none border-l-2 border-[#E8192C] bg-white/10 font-semibold text-white'
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-1">
              {publicNav.map((item) => {
                const active = isNavActive(item)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white/90',
                        active && 'rounded-l-lg rounded-r-none border-l-2 border-[#E8192C] bg-white/10 font-semibold text-white'
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
              <li className="pt-2">
                <Link
                  href="/signup"
                  className="block rounded-md bg-[#E8192C] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#C41020]"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign Up Free
                </Link>
              </li>
            </ul>
          )}
        </div>
      )}
    </nav>
  )
}
