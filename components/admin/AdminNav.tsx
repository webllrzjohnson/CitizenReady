'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const staticNavItems = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Questions', href: '/admin/questions' },
  { label: 'Question Reports', href: '/admin/question-reports' },
  { label: 'Topics', href: '/admin/topics' },
  { label: 'Blog Posts', href: '/admin/blog' },
  { label: 'AI blog draft', href: '/admin/blog/ai-draft' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Audit Logs', href: '/admin/audit-logs' },
  { label: 'Ad Settings', href: '/admin/settings' },
]

interface AdminNavProps {
  unreadContactCount?: number
  newPlusRequestCount?: number
}

export function AdminNav({ unreadContactCount = 0, newPlusRequestCount = 0 }: AdminNavProps) {
  const pathname = usePathname()

  const navItems = [
    ...staticNavItems,
    {
      label:
        newPlusRequestCount > 0
          ? `Plus Requests (${newPlusRequestCount})`
          : 'Plus Requests',
      href: '/admin/plus-requests',
    },
    {
      label:
        unreadContactCount > 0
          ? `Contact Messages (${unreadContactCount})`
          : 'Contact Messages',
      href: '/admin/contact-messages',
    },
  ]

  return (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const isActive =
          item.href === '/admin'
            ? pathname === '/admin'
            : item.href === '/admin/blog'
              ? pathname.startsWith('/admin/blog') &&
                !pathname.startsWith('/admin/blog/ai-draft')
              : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'block px-4 py-2 rounded-md text-sm font-medium transition-colors',
              isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
              item.href === '/admin/contact-messages' &&
                unreadContactCount > 0 &&
                !isActive &&
                'text-amber-700 font-semibold',
              item.href === '/admin/plus-requests' &&
                newPlusRequestCount > 0 &&
                !isActive &&
                'text-amber-700 font-semibold'
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
