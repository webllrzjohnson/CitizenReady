import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How CitizenReady collects, uses, protects, and deletes account, quiz, contact, security, and advertising data.',
}

const LAST_UPDATED = 'July 2026'

const sections = [
  {
    title: '1. Overview',
    content: (
      <p>
        CitizenReady (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is an independent Canadian citizenship
        test preparation platform. This Privacy Policy explains what information we collect, why we
        collect it, how we protect it, and the choices you have. CitizenReady is not affiliated with
        or endorsed by Immigration, Refugees and Citizenship Canada (IRCC) or the Government of Canada.
      </p>
    ),
  },
  {
    title: '2. Information We Collect',
    content: (
      <ul className="list-disc space-y-2 pl-5">
        <li><strong>Account information:</strong> email address, optional display name, account role, and password hash.</li>
        <li><strong>Study activity:</strong> practice answers, quiz sessions, mock exam results, scores, timing, and progress by topic.</li>
        <li><strong>Plus access information:</strong> whether Plus is active and, when applicable, the expiry date for manual early access.</li>
        <li><strong>Contact messages:</strong> name, email, subject, and message text submitted through the contact form.</li>
        <li><strong>Security data:</strong> session version, rate-limit counters, login/signup/contact abuse-protection signals, and admin audit logs.</li>
        <li><strong>Technical data:</strong> browser/device details, IP-derived request information, and server logs used to operate and protect the service.</li>
        <li><strong>Cookies:</strong> essential authentication cookies and, when enabled, advertising cookies managed by third-party ad providers.</li>
      </ul>
    ),
  },
  {
    title: '3. How We Use Information',
    content: (
      <ul className="list-disc space-y-2 pl-5">
        <li>To provide practice questions, mock exams, saved progress, and study tools.</li>
        <li>To authenticate accounts and protect sessions from stale or unauthorized use.</li>
        <li>To grant, expire, or remove manual Plus access.</li>
        <li>To respond to contact messages and account-support requests.</li>
        <li>To prevent abuse such as repeated login attempts, spam signups, or contact-form spam.</li>
        <li>To keep an internal audit record of sensitive admin actions such as role changes and Plus grants.</li>
        <li>To improve site reliability, security, and content quality.</li>
      </ul>
    ),
  },
  {
    title: '4. Cookies and Authentication',
    content: (
      <p>
        CitizenReady uses an essential cookie named <code>cr_session</code> to keep you signed in.
        This cookie is required for account features. You can disable cookies in your browser, but
        login, saved progress, and admin functions may not work correctly.
      </p>
    ),
  },
  {
    title: '5. Advertising and Analytics',
    content: (
      <>
        <p className="mb-3">
          CitizenReady may display advertisements through Google AdSense or similar advertising
          providers. Google and its partners may use cookies or similar technologies to serve,
          measure, and personalize ads depending on your settings and applicable law.
        </p>
        <p>
          You can learn more or adjust Google ad settings at{' '}
          <a href="https://www.google.com/settings/ads" className="text-brand-red hover:underline" target="_blank" rel="noopener noreferrer">
            google.com/settings/ads
          </a>{' '}
          and read Google&apos;s privacy policy at{' '}
          <a href="https://policies.google.com/privacy" className="text-brand-red hover:underline" target="_blank" rel="noopener noreferrer">
            policies.google.com/privacy
          </a>.
        </p>
      </>
    ),
  },
  {
    title: '6. Data Sharing',
    content: (
      <p>
        We do not sell your personal information. We share information only when needed to operate
        the service, comply with law, protect the platform, or use trusted service providers such as
        hosting, database, email, advertising, and optional AI draft-generation providers.
      </p>
    ),
  },
  {
    title: '7. Service Providers',
    content: (
      <ul className="list-disc space-y-2 pl-5">
        <li>VPS/Coolify hosting for the web application.</li>
        <li>PostgreSQL database storage.</li>
        <li>Transactional email services when account emails are enabled.</li>
        <li>Google AdSense when advertising is enabled.</li>
        <li>Optional AI providers used only for admin blog-draft workflows, not for citizenship-test decisions.</li>
      </ul>
    ),
  },
  {
    title: '8. Security',
    content: (
      <p>
        We use hashed passwords, signed JWT session cookies, database-backed session invalidation,
        abuse-protection rate limits, password confirmation for sensitive account changes, and admin
        audit logs for sensitive operations. No online service can guarantee perfect security, so you
        should use a strong password and keep your account credentials private.
      </p>
    ),
  },
  {
    title: '9. Data Retention and Deletion',
    content: (
      <p>
        We keep account and study data while your account is active. You can delete your account from
        Dashboard Settings. Deletion requires typing <strong>DELETE</strong> and entering your current
        password. Some limited security, backup, or legal records may remain for a reasonable period
        where required to protect the service or comply with obligations.
      </p>
    ),
  },
  {
    title: '10. Your Choices',
    content: (
      <ul className="list-disc space-y-2 pl-5">
        <li>Update your profile, email, and password from Dashboard Settings.</li>
        <li>Delete your account from Dashboard Settings.</li>
        <li>Control cookies through your browser settings.</li>
        <li>Contact us to ask privacy questions or request help with your data.</li>
      </ul>
    ),
  },
  {
    title: '11. Children',
    content: (
      <p>
        CitizenReady is intended for Canadian citizenship applicants and is not directed to children
        under 13. If you believe a child has provided personal information, contact us so we can review
        and remove it where appropriate.
      </p>
    ),
  },
  {
    title: '12. Changes to This Policy',
    content: (
      <p>
        We may update this Privacy Policy as CitizenReady changes. The &ldquo;Last updated&rdquo; date
        above will reflect the latest version. Continued use of the service means you accept the
        updated policy.
      </p>
    ),
  },
  {
    title: '13. Contact',
    content: (
      <p>
        For privacy questions, contact us through the{' '}
        <a href="/contact" className="text-brand-red hover:underline">contact page</a>.
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
