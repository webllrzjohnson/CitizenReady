import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'CitizenReady terms of service and usage conditions.',
}

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: (
      <p>
        By using CitizenReady you agree to these terms. If you do not agree, please do not use the
        service.
      </p>
    ),
  },
  {
    title: '2. Description of Service',
    content: (
      <p>
        CitizenReady provides Canadian citizenship exam preparation tools including practice
        questions, mock exams, and progress tracking. The service is provided free of charge for
        basic features.
      </p>
    ),
  },
  {
    title: '3. User Accounts',
    content: (
      <ul className="list-disc space-y-1 pl-5">
        <li>You must provide accurate information when registering</li>
        <li>You are responsible for maintaining account security</li>
        <li>You must be 13 years or older to create an account</li>
        <li>One account per person</li>
      </ul>
    ),
  },
  {
    title: '4. Acceptable Use',
    content: (
      <>
        <p className="mb-2">You agree not to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Misuse the service or attempt to access it by unauthorized means</li>
          <li>Share account credentials with others</li>
          <li>Use the service for any unlawful purpose</li>
          <li>Attempt to scrape, copy, or reproduce our question bank</li>
        </ul>
      </>
    ),
  },
  {
    title: '5. Intellectual Property',
    content: (
      <p>
        All content on CitizenReady including questions, explanations, and design is owned by
        CitizenReady or licensed for use. Questions are based on the official Discover Canada study
        guide published by the Government of Canada.
      </p>
    ),
  },
  {
    title: '6. Disclaimer',
    content: (
      <p>
        CitizenReady is an independent preparation tool and is not affiliated with or endorsed by
        Immigration, Refugees and Citizenship Canada (IRCC). We make no guarantee that use of this
        service will result in passing the official citizenship test.
      </p>
    ),
  },
  {
    title: '7. Limitation of Liability',
    content: (
      <p>
        CitizenReady is provided &ldquo;as is&rdquo; without warranties. We are not liable for any
        damages arising from use of the service.
      </p>
    ),
  },
  {
    title: '8. Termination',
    content: (
      <p>
        We reserve the right to suspend or terminate accounts that violate these terms. You may
        delete your account at any time from Settings.
      </p>
    ),
  },
  {
    title: '9. Changes to Terms',
    content: (
      <p>
        We may update these terms periodically. Continued use of the service constitutes acceptance.
      </p>
    ),
  },
  {
    title: '10. Governing Law',
    content: (
      <p>These terms are governed by the laws of Ontario, Canada.</p>
    ),
  },
  {
    title: '11. Contact',
    content: (
      <p>
        For terms-related questions, email us at{' '}
        <a href="mailto:legal@citizenready.ca" className="text-brand-red hover:underline">
          legal@citizenready.ca
        </a>
        .
      </p>
    ),
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface-page">
      <section className="bg-brand-navy py-14 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">Terms of Service</h1>
          <p className="text-gray-300">Last updated: April 2026</p>
        </div>
      </section>

      <section className="container mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-xl bg-white p-8 shadow-sm">
          <div className="space-y-0">
            {sections.map((section, i) => (
              <div key={section.title}>
                <div className="py-7">
                  <h2 className="mb-3 text-lg font-bold text-brand-navy">{section.title}</h2>
                  <div className="leading-relaxed text-gray-700">{section.content}</div>
                </div>
                {i < sections.length - 1 && <hr className="border-gray-200" />}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
