import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { SITE_FAQS } from '@/lib/site-faqs'
import { siteUrl } from '@/lib/site-url'

export const metadata: Metadata = {
  title: 'FAQ — Canadian Citizenship Test Practice Questions',
  description: 'Answers about CitizenReady, Canadian citizenship test practice, Discover Canada study material, manual Plus access, privacy, and account deletion.',
  alternates: { canonical: siteUrl('/faq') },
  openGraph: {
    title: 'CitizenReady FAQ',
    description: 'Common questions about Canadian citizenship test prep, Plus access, privacy, and official IRCC sources.',
    url: siteUrl('/faq'),
    type: 'website',
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: SITE_FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.a,
    },
  })),
}

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <Script id="faq-json-ld" type="application/ld+json" strategy="beforeInteractive">
        {JSON.stringify(faqJsonLd)}
      </Script>
      <section className="border-b border-[#E0E0E0] bg-[#1B2A4A] py-12 text-white shadow-nav md:py-16">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Frequently asked questions</h1>
          <p className="mx-auto mt-4 max-w-xl text-gray-300">
            Answers about Canadian citizenship test practice, official study sources, Plus access,
            privacy, and account security.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/60">
            CitizenReady is independent and is not affiliated with IRCC or the Government of Canada.
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-2xl px-4 py-12 md:py-16">
        <Accordion type="single" collapsible className="space-y-2">
          {SITE_FAQS.map((faq, i) => (
            <AccordionItem
              key={faq.q}
              value={`faq-${i}`}
              className="rounded-xl border border-gray-200 bg-white px-5 shadow-sm data-[state=open]:border-brand-navy/20"
            >
              <AccordionTrigger className="py-4 text-left text-sm font-semibold text-gray-800 hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-sm leading-relaxed text-gray-600">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-10 rounded-xl border border-brand-navy/10 bg-white p-5 text-sm leading-relaxed text-gray-600 shadow-sm">
          <p className="font-semibold text-brand-navy">Official reminder</p>
          <p className="mt-2">
            Always confirm eligibility, fees, scheduling, and test rules with IRCC. CitizenReady helps
            you study; it does not replace official Government of Canada instructions.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild variant="outline" className="border-brand-navy text-brand-navy hover:bg-brand-navy/5">
            <Link href="/contact">Contact us</Link>
          </Button>
          <Button asChild className="bg-brand-red text-white hover:bg-brand-red-dark">
            <Link href="/pricing">View Plus options</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
