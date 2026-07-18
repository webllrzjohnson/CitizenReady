import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Clock, Shield, Sparkles } from 'lucide-react'
import { PlusRequestForm } from '@/components/plus/PlusRequestForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { siteUrl } from '@/lib/site-url'

export const metadata: Metadata = {
  title: 'Request CitizenReady Plus Early Access',
  description: 'Request manual CitizenReady Plus access while online checkout is being prepared.',
  alternates: { canonical: siteUrl('/plus-request') },
}

const benefits = [
  'Manual early access before Stripe or PayPal checkout is connected',
  'Choose 7 days, 30 days, 1 year, or special/lifetime access',
  'Admin can grant Plus directly to your CitizenReady account',
]

const manualPaymentSteps = [
  'Create or confirm your free CitizenReady account email.',
  'Submit this Plus request with your preferred plan.',
  'Wait for the admin email with manual payment/follow-up instructions.',
  'After payment/account confirmation, admin grants Plus and you receive an activation email.',
]

export default function PlusRequestPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <section className="bg-[#1B2A4A] py-14 text-white shadow-nav">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80">
            <Sparkles className="h-3.5 w-3.5 text-brand-red" />
            Manual Plus Access
          </div>
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">Request CitizenReady Plus</h1>
          <p className="mx-auto max-w-2xl text-lg text-white/80">
            Online checkout is coming later. For now, submit this request and an admin can grant Plus access manually.
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-brand-navy">Early Access Request</CardTitle>
            </CardHeader>
            <CardContent>
              <PlusRequestForm />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="flex gap-3">
                  <Shield className="mt-0.5 h-5 w-5 shrink-0 text-brand-red" />
                  <div>
                    <h2 className="font-semibold text-brand-navy">How it works</h2>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">
                      Create a free account first, then request Plus access using the same account email. We review requests manually and follow up by email.
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-red" />
                  <div>
                    <h2 className="font-semibold text-brand-navy">Response time</h2>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">
                      We typically review Plus access requests within 24-48 hours on business days.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="font-semibold text-brand-navy">Manual payment checklist</h2>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-gray-600">
                  {manualPaymentSteps.map((step) => <li key={step}>{step}</li>)}
                </ol>
              </CardContent>
            </Card>

            <div className="rounded-xl border border-brand-navy/10 bg-white p-5 text-sm text-gray-600">
              <p className="font-semibold text-brand-navy">Need a normal support question?</p>
              <p className="mt-2">Use the contact page for technical issues, content feedback, or general questions.</p>
              <Button variant="outline" size="sm" className="mt-4 border-brand-navy text-brand-navy hover:bg-brand-navy/5" asChild>
                <Link href="/contact">Go to Contact</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
