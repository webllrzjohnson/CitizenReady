'use client'

import { useEffect, useState } from 'react'
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
import { User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const publicNav = [
  { href: '/', label: 'Home', match: (path: string) => path === '/' },
  { href: '/blog', label: 'Blog', match: (path: string) => path.startsWith('/blog') },
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

  const isNavActive = (item: (typeof publicNav)[number]) => {
    if ('match' in item && item.match) {
      return item.match(pathname)
    }
    if ('hash' in item && pathname === '/') {
      return hash === item.hash
    }
    return false
  }

  return (
    <nav className="border-b border-brand-navy-light bg-brand-navy">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-white">
          CitizenRead<span className="text-brand-red">y</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-6">
          {loading ? (
            <div className="h-9 w-20 animate-pulse rounded-full bg-white/10" />
          ) : user ? (
            <>
              <div className="hidden items-center gap-1 sm:flex">
                <Link
                  href="/blog"
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium text-white transition-colors hover:text-brand-red',
                    pathname.startsWith('/blog') &&
                      'border-b-2 border-brand-red pb-1 text-brand-red',
                  )}
                >
                  Blog
                </Link>
                <Link
                  href="/dashboard"
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium text-white transition-colors hover:text-brand-red',
                    pathname.startsWith('/dashboard') &&
                      'border-b-2 border-brand-red pb-1 text-brand-red'
                  )}
                >
                  Dashboard
                </Link>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">Settings</Link>
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
              <div className="hidden items-center gap-1 md:flex">
                {publicNav.map((item) => {
                  const active = isNavActive(item)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'px-3 py-2 text-sm font-medium text-white transition-colors hover:text-brand-red',
                        active && 'border-b-2 border-brand-red text-brand-red'
                      )}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="inline-flex max-w-[9rem] truncate px-2 text-xs text-white hover:bg-white/10 hover:text-white sm:max-w-none sm:px-3 sm:text-sm"
                  asChild
                >
                  <Link href="/dashboard">Try free</Link>
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-white bg-transparent text-white hover:bg-white/10 hover:text-white"
                  asChild
                >
                  <Link href="/login">Login</Link>
                </Button>
                <Button
                  className="rounded-full bg-brand-red text-white hover:bg-brand-red-dark"
                  asChild
                >
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
