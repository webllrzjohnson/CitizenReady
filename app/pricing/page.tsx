'use client'

import Link from 'next/link'
import {
  Shield,
  Star,
  CheckCircle2,
  X,
  BookOpen,
  ClipboardList,
  BarChart3,
  FileText,
  Target,
  Clock,
  RefreshCw,
  Bookmark,
  MapPin,
  Users,
  Flag,
  Calendar,
  Zap,
  Award,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

// ─── Data ────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '900+', label: 'Exam-like questions' },
  { value: '95%', label: 'Student pass rate' },
  { value: '800+', label: 'Canadians prepared' },
  { value: '4.9 ★', label: 'Avg rating' },
]

const TESTIMONIALS = [
  {
    name: 'Amara Osei',
    location: 'Ontario',
    quote:
      'Between two jobs and three kids, I had maybe 20 minutes a day to study. The topic quizzes kept things bite-sized and I passed first try. Couldn\'t have done it without this.',
  },
  {
    name: 'Priya Mehta',
    location: 'British Columbia',
    quote:
      'I had failed once before and was terrified to re-book. The challenge bank pinpointed every gap I had. After two weeks of targeted review, I walked in calm — and walked out a future citizen.',
  },
  {
    name: 'Marcus Bouchard',
    location: 'Alberta',
    quote:
      'The mock exams are scarily close to the real thing — same pressure, same format. By test day it already felt familiar. Best $15 I\'ve ever spent.',
  },
]

const OLD_WAY = [
  'Skim the handbook with no clear structure',
  'No feedback on what you got wrong',
  'No sense of timing or exam pressure',
  'Repeat the same weak areas without knowing it',
  'Walk in uncertain — hope for the best',
]

const NEW_WAY = [
  '900+ targeted questions, chapter by chapter',
  'Instant explanations for every answer',
  'Timed mock exams that mirror the real format',
  'Challenge bank rebuilds weak spots automatically',
  'Arrive confident — you\'ve already done this',
]

const STEPS = [
  {
    number: '01',
    icon: BookOpen,
    title: 'Practice by Topic',
    description:
      'Work through every chapter from the Discover Canada guide at your own pace. Build real understanding, not just surface memorisation.',
  },
  {
    number: '02',
    icon: ClipboardList,
    title: 'Full Practice Tests',
    description:
      'Once you\'ve covered the topics, reinforce everything with full-length tests that mix all chapters — exposing patterns and weak areas before exam day.',
  },
  {
    number: '03',
    icon: Target,
    title: 'Timed Mock Exam',
    description:
      'Simulate the official test with a live countdown and shuffled questions. Instant results show exactly where you stand — and what to fix.',
  },
]

const FEATURES = [
  { icon: ClipboardList, label: 'Practice by Topic' },
  { icon: Target, label: 'Unlimited Mock Tests' },
  { icon: Bookmark, label: 'Challenge Bank' },
  { icon: BarChart3, label: 'Progress Tracker' },
  { icon: FileText, label: 'Revision Notes' },
  { icon: BookOpen, label: 'Study Questions' },
  { icon: RefreshCw, label: 'Cheat Sheet PDF' },
  { icon: Calendar, label: 'Important Dates' },
  { icon: Users, label: 'Government Questions' },
  { icon: Flag, label: 'Flags & Symbols' },
  { icon: MapPin, label: 'Capitals & Provinces' },
  { icon: Clock, label: 'Timed Sessions' },
]

const PLANS = [
  {
    id: '7day',
    badge: '7-Day Sprint',
    tagline: 'Last-minute, high-focus preparation.',
    price: '$5.99',
    original: '$11.98',
    discount: '50% off',
    cta: 'Start Studying Now',
    highlight: false,
  },
  {
    id: '30day',
    badge: '30-Day Plan',
    tagline: 'The most popular balanced study path.',
    price: '$14.99',
    original: '$29.98',
    discount: '50% off',
    cta: 'Get Instant Access',
    highlight: true,
    popularLabel: 'Most Popular',
  },
  {
    id: '1year',
    badge: '1-Year Access',
    tagline: 'Prepare at your pace, on your schedule.',
    price: '$19.99',
    original: '$39.98',
    discount: '50% off',
    cta: 'Get Full-Year Access',
    highlight: false,
    bestValue: 'Best Value',
  },
]

const PLAN_FEATURES = {
  fundamentals: [
    '900+ Exam-Like Questions',
    '2026 Updated Content',
    'Practice by Topics',
    'Unlimited Mock Tests',
    'Challenge Bank',
    'Progress Tracker',
    'Study Questions',
  ],
  advanced: [
    'Revision Notes',
    'Cheat Sheet PDF',
    'Government Questions',
    'Important Dates & Key People',
    'Flags & Symbols',
  ],
}

const FAQS = [
  {
    q: 'How is CitizenReady Plus different from just reading the handbook?',
    a: 'The Discover Canada handbook is the source material — our platform turns it into 900+ targeted practice questions with instant explanations, timed mock exams, and a challenge bank that focuses exactly on what you\'ve missed. Reading alone can\'t tell you whether you truly understand the material until it\'s too late.',
  },
  {
    q: 'I failed my knowledge test before. Will this actually help?',
    a: 'Yes — and it\'s built for exactly that situation. Every question you get wrong is saved to your Challenge Bank with a clear explanation. Retakers typically spend the first few days on their weak chapters, then move into mixed mock exams until their score is comfortably above the 75% pass threshold.',
  },
  {
    q: 'Can I track my progress as I study?',
    a: 'Absolutely. Your dashboard shows accuracy by topic, time per question, recent mistakes, and full mock-exam scores. You\'ll know at a glance which chapters need more work and which ones you\'ve already locked in.',
  },
  {
    q: 'How closely do the mock exams match the real IRCC test?',
    a: 'Our mock exams follow the official format: 20 questions, a 30-minute timer, and the same 75% passing threshold. Questions are shuffled on every attempt, so each run stays fresh and realistic.',
  },
  {
    q: 'I have several weeks before my test. Is one of the shorter plans enough?',
    a: 'The 30-Day Plan is designed for exactly that window — enough time to work through every topic, run several mixed tests, and use the challenge bank to close any gaps. Most steady studiers feel fully ready within two to three weeks.',
  },
  {
    q: 'Where can I verify official test details and fees?',
    a: 'Always check IRCC directly for the latest format, fees, and scheduling information. The Discover Canada handbook and the IRCC Citizenship test and interview page are the official sources.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  return (
    <div className="bg-white">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-brand-navy text-white">
        <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_70%_30%,#D32F2F_0%,transparent_55%)]" />
        <div className="container relative mx-auto max-w-3xl px-4 py-16 text-center md:py-24">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80">
            <Shield className="h-3.5 w-3.5 text-brand-red" />
            CitizenReady Plus — Official 2026 Content
          </div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
            Pass Your Canadian Citizenship Test —{' '}
            <span className="text-brand-red">Arrive Confident on Test Day</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            Join 800+ permanent residents who prepared smarter with 900+ exam-style
            questions, timed mocks, and personalised feedback — all built around the
            official Discover Canada guide.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="bg-brand-red px-8 font-semibold hover:bg-brand-red-dark"
              asChild
            >
              <a href="#pricing">See Plans &amp; Pricing</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10"
              asChild
            >
              <Link href="/signup">Try Free First</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="container mx-auto max-w-4xl px-4 py-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-extrabold text-brand-navy">{s.value}</p>
                <p className="mt-0.5 text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="container mx-auto max-w-5xl px-4 py-16">
        <h2 className="mb-2 text-center text-2xl font-extrabold text-gray-900">
          Real Stories from New Canadians
        </h2>
        <p className="mb-10 text-center text-sm text-gray-500">
          Hundreds of permanent residents have passed using CitizenReady Plus.
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-6"
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                    aria-hidden
                  />
                ))}
              </div>
              <p className="flex-1 text-sm leading-relaxed text-gray-700">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-400">{t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comparison ── */}
      <section className="border-y border-gray-100 bg-gray-50 py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="mb-2 text-center text-2xl font-extrabold text-gray-900">
            A Smarter Way to Prepare
          </h2>
          <p className="mb-10 text-center text-sm text-gray-500">
            The handbook alone leaves too much to chance. Here&apos;s the difference.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Old way */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <p className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                Handbook Only
              </p>
              <ul className="space-y-3">
                {OLD_WAY.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-500">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-gray-300" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* New way */}
            <div className="rounded-2xl border border-brand-red/20 bg-brand-red/[0.03] p-6 ring-1 ring-brand-red/15">
              <p className="mb-4 text-xs font-bold uppercase tracking-wider text-brand-red">
                CitizenReady Plus
              </p>
              <ul className="space-y-3">
                {NEW_WAY.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="container mx-auto max-w-4xl px-4 py-16">
        <h2 className="mb-2 text-center text-2xl font-extrabold text-gray-900">
          Three Steps to Test-Day Confidence
        </h2>
        <p className="mb-10 text-center text-sm text-gray-500">
          A clear, proven path from first study session to walking out with a pass.
        </p>
        <div className="grid gap-8 sm:grid-cols-3">
          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-extrabold text-gray-100">
                    {step.number}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-navy/5">
                    <Icon className="h-5 w-5 text-brand-navy" aria-hidden />
                  </div>
                </div>
                <h3 className="font-bold text-gray-900">{step.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{step.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Feature grid ── */}
      <section className="border-y border-gray-100 bg-gray-50 py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="mb-2 text-center text-2xl font-extrabold text-gray-900">
            Everything You Need, All in One Place
          </h2>
          <p className="mb-10 text-center text-sm text-gray-500">
            No juggling apps or scattered notes — one platform takes you from first
            study session to test day.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.label}
                  className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3"
                >
                  <Icon className="h-4 w-4 shrink-0 text-brand-red" aria-hidden />
                  <span className="text-sm font-medium text-gray-700">{f.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="container mx-auto max-w-5xl px-4 py-16">
        <div className="mb-2 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-red/10 px-3 py-1 text-xs font-semibold text-brand-red">
            <Zap className="h-3.5 w-3.5" aria-hidden />
            Limited-time offer — 50% off all plans
          </span>
        </div>
        <h2 className="mb-2 text-center text-2xl font-extrabold text-gray-900">
          One Price, Full Access, No Surprises
        </h2>
        <p className="mb-10 text-center text-sm text-gray-500">
          Every plan unlocks all 900+ questions and every study tool. Pick the window that
          fits your timeline.
        </p>

        <div className="grid gap-6 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={[
                'relative flex flex-col rounded-2xl border p-6',
                plan.highlight
                  ? 'border-brand-navy bg-brand-navy text-white shadow-lg'
                  : 'border-gray-200 bg-white',
              ].join(' ')}
            >
              {plan.popularLabel && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-brand-red px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
                    {plan.popularLabel}
                  </span>
                </div>
              )}
              {plan.bestValue && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-green-600 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
                    {plan.bestValue}
                  </span>
                </div>
              )}

              <p
                className={[
                  'text-xs font-bold uppercase tracking-wider',
                  plan.highlight ? 'text-white/60' : 'text-gray-400',
                ].join(' ')}
              >
                {plan.badge}
              </p>
              <p
                className={[
                  'mt-1 text-sm',
                  plan.highlight ? 'text-white/70' : 'text-gray-500',
                ].join(' ')}
              >
                {plan.tagline}
              </p>

              <div className="mt-5 flex items-baseline gap-2">
                <span
                  className={[
                    'text-3xl font-extrabold',
                    plan.highlight ? 'text-white' : 'text-gray-900',
                  ].join(' ')}
                >
                  {plan.price}
                </span>
                <span
                  className={[
                    'text-sm line-through',
                    plan.highlight ? 'text-white/40' : 'text-gray-300',
                  ].join(' ')}
                >
                  {plan.original}
                </span>
                <span className="rounded bg-brand-red/20 px-1.5 py-0.5 text-xs font-semibold text-brand-red">
                  {plan.discount}
                </span>
              </div>

              {/* Fundamentals */}
              <p
                className={[
                  'mt-6 mb-2 text-xs font-semibold uppercase tracking-wider',
                  plan.highlight ? 'text-white/50' : 'text-gray-400',
                ].join(' ')}
              >
                Fundamentals
              </p>
              <ul className="space-y-2">
                {PLAN_FEATURES.fundamentals.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2
                      className={[
                        'h-4 w-4 shrink-0',
                        plan.highlight ? 'text-green-400' : 'text-green-500',
                      ].join(' ')}
                      aria-hidden
                    />
                    <span className={plan.highlight ? 'text-white/80' : 'text-gray-600'}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Advanced */}
              <p
                className={[
                  'mt-4 mb-2 text-xs font-semibold uppercase tracking-wider',
                  plan.highlight ? 'text-white/50' : 'text-gray-400',
                ].join(' ')}
              >
                Advanced Prep
              </p>
              <ul className="space-y-2">
                {PLAN_FEATURES.advanced.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2
                      className={[
                        'h-4 w-4 shrink-0',
                        plan.highlight ? 'text-green-400' : 'text-green-500',
                      ].join(' ')}
                      aria-hidden
                    />
                    <span className={plan.highlight ? 'text-white/80' : 'text-gray-600'}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-6">
                <Button
                  className={[
                    'w-full font-semibold',
                    plan.highlight
                      ? 'bg-brand-red hover:bg-brand-red-dark text-white'
                      : 'bg-brand-navy text-white hover:bg-brand-navy/90',
                  ].join(' ')}
                  asChild
                >
                  <Link href="/signup">{plan.cta}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Trust strip */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <Award className="mt-0.5 h-5 w-5 shrink-0 text-brand-navy" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-gray-900">Instant Access</p>
              <p className="mt-0.5 text-xs text-gray-500">
                Start studying the moment you sign up — no waiting, no downloads.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <Users className="mt-0.5 h-5 w-5 shrink-0 text-brand-navy" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-gray-900">800+ Canadians</p>
              <p className="mt-0.5 text-xs text-gray-500">
                Trusted by permanent residents preparing for their citizenship test.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-brand-navy" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-gray-900">Secure Checkout</p>
              <p className="mt-0.5 text-xs text-gray-500">
                Payments are encrypted and processed safely. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-gray-100 bg-gray-50 py-16">
        <div className="container mx-auto max-w-2xl px-4">
          <h2 className="mb-2 text-center text-2xl font-extrabold text-gray-900">
            Frequently Asked Questions
          </h2>
          <p className="mb-10 text-center text-sm text-gray-500">
            Still weighing it up? Here are the questions we hear most often.
          </p>
          <Accordion type="single" collapsible className="space-y-2">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-xl border border-gray-200 bg-white px-5 data-[state=open]:border-brand-navy/20"
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
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-brand-navy py-16 text-center text-white">
        <div className="container mx-auto max-w-xl px-4">
          <TrendingUp className="mx-auto mb-4 h-8 w-8 text-brand-red" aria-hidden />
          <h2 className="text-2xl font-extrabold">Ready to Pass on Your First Try?</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Join 800+ permanent residents who trusted CitizenReady Plus to get them
            across the finish line. Your Canadian citizenship journey starts here.
          </p>
          <Button
            size="lg"
            className="mt-7 bg-brand-red px-10 font-bold hover:bg-brand-red-dark"
            asChild
          >
            <a href="#pricing">Unlock All 900+ Questions</a>
          </Button>
          <p className="mt-3 text-xs text-white/40">
            Cancel anytime · Secure checkout · Instant access
          </p>
        </div>
      </section>
    </div>
  )
}
