import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'CitizenReady privacy policy and data practices.',
}

const sections = [
  {
    title: '1. Introduction',
    content: (
      <p>
        CitizenReady (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is committed to
        protecting your privacy. This policy explains what data we collect, how we use it, and your
        rights.
      </p>
    ),
  },
  {
    title: '2. Information We Collect',
    content: (
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong>Account information:</strong> name, email when you register
        </li>
        <li>
          <strong>Usage data:</strong> quiz sessions, scores, practice history
        </li>
        <li>
          <strong>Device data:</strong> browser type, IP address (via Vercel)
        </li>
        <li>
          <strong>Cookies:</strong> session cookies for authentication
        </li>
      </ul>
    ),
  },
  {
    title: '3. How We Use Your Information',
    content: (
      <ul className="list-disc space-y-1 pl-5">
        <li>To provide the exam preparation service</li>
        <li>To save and display your progress</li>
        <li>To improve our question bank and features</li>
        <li>To send account-related emails (confirmations, resets)</li>
        <li>We never sell your personal data to third parties</li>
      </ul>
    ),
  },
  {
    title: '4. Google AdSense & Advertising',
    content: (
      <>
        <p className="mb-3">
          We use Google AdSense to display advertisements. Google may use cookies to serve ads
          based on your prior visits to this and other websites.
        </p>
        <p>
          You can opt out at:{' '}
          <a
            href="https://www.google.com/settings/ads"
            className="text-brand-red hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            google.com/settings/ads
          </a>
          . For more information:{' '}
          <a
            href="https://policies.google.com/privacy"
            className="text-brand-red hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            policies.google.com/privacy
          </a>
          .
        </p>
      </>
    ),
  },
  {
    title: '5. Data Storage & Security',
    content: (
      <p>
        Your data is stored securely using Supabase, hosted on servers in the United States. We use
        industry-standard encryption and security practices.
      </p>
    ),
  },
  {
    title: '6. Data Retention',
    content: (
      <p>
        We retain your account data as long as your account is active. You can delete your account
        at any time from Settings, which permanently removes all your data.
      </p>
    ),
  },
  {
    title: '7. Third Party Services',
    content: (
      <ul className="list-disc space-y-1 pl-5">
        <li>Supabase (database and authentication)</li>
        <li>Vercel (hosting)</li>
        <li>Google AdSense (advertising)</li>
        <li>Resend (transactional email)</li>
      </ul>
    ),
  },
  {
    title: '8. Your Rights',
    content: (
      <ul className="list-disc space-y-1 pl-5">
        <li>Access your personal data</li>
        <li>Correct inaccurate data</li>
        <li>Delete your account and all associated data</li>
        <li>Withdraw consent at any time</li>
      </ul>
    ),
  },
  {
    title: '9. Cookies',
    content: (
      <p>
        We use essential cookies for authentication only. Advertising cookies are managed by Google
        AdSense. You can control cookies through your browser settings.
      </p>
    ),
  },
  {
    title: '10. Contact',
    content: (
      <p>
        For privacy-related questions, email us at{' '}
        <a href="mailto:privacy@citizenready.ca" className="text-brand-red hover:underline">
          privacy@citizenready.ca
        </a>
        .
      </p>
    ),
  },
  {
    title: '11. Changes to This Policy',
    content: (
      <p>
        We may update this policy periodically. Continued use of the service constitutes acceptance
        of the updated policy.
      </p>
    ),
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <section className="bg-[#1B2A4A] py-14 text-white shadow-nav">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">Privacy Policy</h1>
          <p className="text-white/70">Last updated: April 2026</p>
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
