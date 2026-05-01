import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Sitemap',
  description: 'All pages on CitizenReady',
}

const mainPages = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
]

const practicePages = [
  { label: 'Practice by Topic', href: '/dashboard/practice' },
  { label: 'Mock Exam', href: '/dashboard/mock-exam' },
  { label: 'Track Progress', href: '/dashboard/progress' },
]

const accountPages = [
  { label: 'Sign Up', href: '/signup' },
  { label: 'Login', href: '/login' },
  { label: 'Settings', href: '/dashboard/settings' },
]

const adminPages = [
  { label: 'Admin Dashboard', href: '/admin' },
  { label: 'Question Bank', href: '/admin/questions' },
  { label: 'Topics', href: '/admin/topics' },
  { label: 'Blog Posts', href: '/admin/blog' },
  { label: 'Users', href: '/admin/users' },
]

function SitemapSection({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string }[]
}) {
  return (
    <div>
      <h2 className="mb-3 text-base font-bold text-brand-navy">{title}</h2>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-brand-red hover:underline"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default async function SitemapPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = (profile as { role: string } | null)?.role === 'admin'
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <section className="bg-[#1B2A4A] py-14 text-white shadow-nav">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">Sitemap</h1>
          <p className="text-white/70">All pages on CitizenReady</p>
        </div>
      </section>

      <section className="container mx-auto max-w-4xl px-4 py-12">
        <div className="card p-8">
          <div className="grid gap-10 sm:grid-cols-2">
            <SitemapSection title="Main Pages" links={mainPages} />
            <SitemapSection title="Practice" links={practicePages} />
            <SitemapSection title="Account" links={accountPages} />
            {isAdmin && <SitemapSection title="Admin" links={adminPages} />}
          </div>
        </div>
      </section>
    </div>
  )
}
