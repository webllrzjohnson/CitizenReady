import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'CitizenReady terms covering independent citizenship-test preparation, accounts, Plus access, acceptable use, and disclaimers.',
}

const LAST_UPDATED = 'July 2026'

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: (
      <p>
        By accessing or using CitizenReady, you agree to these Terms of Use. If you do not agree,
        please do not use the service.
      </p>
    ),
  },
  {
    title: '2. Independent Study Tool',
    content: (
      <p>
        CitizenReady is an independent educational preparation tool for the Canadian citizenship
        knowledge test. CitizenReady is not affiliated with, endorsed by, or operated by Immigration,
        Refugees and Citizenship Canada (IRCC) or the Government of Canada. Always rely on official
        IRCC materials for application rules, fees, appointments, and final test information.
      </p>
    ),
  },
  {
    title: '3. Educational Use Only',
    content: (
      <p>
        CitizenReady provides practice questions, explanations, mock exams, progress tracking, and
        study resources. It does not provide immigration, legal, or government advice, and it does not
        guarantee that you will pass the official citizenship test.
      </p>
    ),
  },
  {
    title: '4. Accounts and Security',
    content: (
      <ul className="list-disc space-y-2 pl-5">
        <li>You must provide accurate account information.</li>
        <li>You are responsible for keeping your password and account secure.</li>
        <li>You should not share your account with another person.</li>
        <li>Sensitive account changes may require your current password.</li>
        <li>We may suspend or remove accounts that abuse the service or violate these terms.</li>
      </ul>
    ),
  },
  {
    title: '5. Free and Plus Access',
    content: (
      <p>
        CitizenReady includes free features and optional CitizenReady Plus access. Until online
        checkout is available, Plus may be granted manually by an admin for early users, testers, or
        approved manual arrangements. Plus access may be time-limited or lifetime depending on what is
        granted in your account.
      </p>
    ),
  },
  {
    title: '6. Payments, Refunds, and Manual Access',
    content: (
      <p>
        Online payment checkout is not active yet. If you receive manual Plus access, the access
        period and any refund arrangement should be confirmed directly with CitizenReady before access
        is granted. Future payment-provider terms may apply when Stripe, PayPal, or another checkout
        provider is added.
      </p>
    ),
  },
  {
    title: '7. Acceptable Use',
    content: (
      <>
        <p className="mb-2">You agree not to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Attempt to bypass authentication, rate limits, Plus access checks, or admin controls.</li>
          <li>Scrape, copy, republish, or resell the question bank or study materials.</li>
          <li>Use bots, automated scripts, or abusive traffic against the service.</li>
          <li>Submit spam, harmful content, or false contact information.</li>
          <li>Use CitizenReady for unlawful purposes or to interfere with other users.</li>
        </ul>
      </>
    ),
  },
  {
    title: '8. Intellectual Property',
    content: (
      <p>
        CitizenReady content, design, question organization, explanations, and software are owned by
        CitizenReady or used under applicable rights. Official Government of Canada materials remain
        owned by their respective rights holders. You may use CitizenReady for personal study, but you
        may not copy or redistribute the service content without permission.
      </p>
    ),
  },
  {
    title: '9. Official Sources',
    content: (
      <p>
        The Discover Canada study guide and official IRCC pages are the authoritative sources for the
        citizenship test and application process. CitizenReady may summarize or create practice tools
        based on public study material, but official sources control if there is any difference.
      </p>
    ),
  },
  {
    title: '10. Availability and Changes',
    content: (
      <p>
        We may change, improve, pause, or discontinue features at any time. We aim to keep the service
        reliable, but we do not guarantee uninterrupted access or that every feature will always be
        available.
      </p>
    ),
  },
  {
    title: '11. Disclaimer of Warranties',
    content: (
      <p>
        CitizenReady is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of
        any kind. We do not guarantee a passing score, test appointment, citizenship approval, or any
        government outcome.
      </p>
    ),
  },
  {
    title: '12. Limitation of Liability',
    content: (
      <p>
        To the maximum extent permitted by law, CitizenReady is not liable for indirect, incidental,
        special, consequential, or punitive damages arising from your use of the service.
      </p>
    ),
  },
  {
    title: '13. Termination',
    content: (
      <p>
        You may delete your account from Dashboard Settings. We may suspend or terminate access if an
        account violates these terms, abuses the service, creates security risk, or is required by law.
      </p>
    ),
  },
  {
    title: '14. Governing Law',
    content: (
      <p>These terms are governed by the laws of Ontario, Canada, where applicable.</p>
    ),
  },
  {
    title: '15. Contact',
    content: (
      <p>
        For terms-related questions, contact us through the{' '}
        <a href="/contact" className="text-brand-red hover:underline">contact page</a>.
      </p>
    ),
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <section className="bg-[#1B2A4A] py-14 text-white shadow-nav">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">Terms of Use</h1>
          <p className="text-white/70">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      <section className="container mx-auto max-w-3xl px-4 py-12">
        <div className="card p-8">
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
