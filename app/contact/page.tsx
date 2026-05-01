import type { Metadata } from 'next'
import { Mail, Clock, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ContactForm } from '@/components/contact/ContactForm'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the CitizenReady team.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Hero */}
      <section className="bg-[#1B2A4A] py-14 text-white shadow-nav">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">Contact Us</h1>
          <p className="text-lg text-white/80">We&apos;d love to hear from you</p>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* LEFT — Contact form (takes 2/3) */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-brand-navy">Send us a message</CardTitle>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>
          </div>

          {/* RIGHT — Info cards */}
          <div className="space-y-4">
            {/* Email card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-red" />
                  <div>
                    <h3 className="font-semibold text-brand-navy">Email Us</h3>
                    <a
                      href="mailto:support@citizenready.ca"
                      className="text-sm text-gray-600 hover:text-brand-red"
                    >
                      support@citizenready.ca
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response time card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-red" />
                  <div>
                    <h3 className="font-semibold text-brand-navy">Response Time</h3>
                    <p className="text-sm text-gray-600">
                      We typically respond within 24-48 hours on business days.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-red" />
                  <div>
                    <h3 className="mb-1 font-semibold text-brand-navy">Common Questions</h3>
                    <p className="mb-3 text-sm text-gray-600">
                      Check our FAQ section for quick answers.
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-brand-red text-brand-red hover:bg-brand-red hover:text-white"
                    >
                      <Link href="/faq">View FAQ</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
