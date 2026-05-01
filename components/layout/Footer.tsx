'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Footer() {
  const pathname = usePathname()

  // Don't render footer inside admin or dashboard layouts
  if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
    return null
  }

  return (
    <footer className="bg-[#1B2A4A] text-white print:hidden">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <h3 className="mb-4 font-semibold text-white">About</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="/" className="hover:text-white">
                  CitizenReady
                </Link>
              </li>
              <li>
                <Link href="/#how-to-prepare" className="hover:text-white">
                  How it works
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Practice</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="/signup" className="hover:text-white">
                  Start practicing
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white">
                  Mock exam
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Resources</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <a
                  href="https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada.html"
                  className="hover:text-white"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Discover Canada
                </a>
              </li>
              <li>
                <Link href="/#topics" className="hover:text-white">
                  Chapters
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Support</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white">
                  Sign up
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Legal</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="/privacy" className="hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/sitemap-page" className="hover:text-white">
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-white/70">
          © 2026 CitizenReady. Proudly Canadian <span aria-hidden="true">🍁</span>
        </div>
      </div>
    </footer>
  )
}
