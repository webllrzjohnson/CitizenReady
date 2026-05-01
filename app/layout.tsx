import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CookieBanner } from '@/components/cookies/CookieBanner'
import { Toaster } from 'sonner'
import { getAdSettings } from '@/lib/ad-settings'
import { getSiteUrl, siteUrl } from '@/lib/site-url'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'CitizenReady',
    template: '%s | CitizenReady',
  },
  description: 'Free Canadian citizenship exam practice. Study by topic, take mock tests, and track your progress.',
  keywords: ['Canadian citizenship test', 'citizenship exam practice', 
    'IRCC test prep', 'Canada citizenship quiz'],
  openGraph: {
    title: 'CitizenReady — Canadian Citizenship Exam Prep',
    description: 'Free practice questions, timed mock exams, and progress tracking.',
    url: siteUrl('/'),
    siteName: 'CitizenReady',
    locale: 'en_CA',
    type: 'website',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { adsEnabled, clientId } = await getAdSettings()
  const loadAdScript = adsEnabled && clientId.length > 0

  return (
    <html lang="en" className="font-sans">
      <head>
        {loadAdScript && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className={inter.className}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-[#1B2A4A] focus:shadow"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content">
          {children}
        </main>
        <Footer />
        <CookieBanner />
        <div className="print:hidden">
          <Toaster />
        </div>
      </body>
    </html>
  )
}
