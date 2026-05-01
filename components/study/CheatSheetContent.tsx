'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Lock,
  CheckCircle2,
  ChevronDown,
  Zap,
  BarChart3,
  BookOpen,
  Crown,
  TrendingUp,
  Star,
  Printer,
  ArrowRight,
  Users,
  Target,
  Award,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  CHEAT_SHEET_QUESTIONS,
  CHEAT_SHEET_FREE_PREVIEW_COUNT,
  CATEGORIES,
  type CheatSheetQuestion,
} from '@/lib/data/cheat-sheet-questions'

type Viewer =
  | { status: 'guest' }
  | { status: 'signed_in'; premium: boolean }

const DIFFICULTY_LABEL = { easy: 'Easy', medium: 'Medium', hard: 'Hard' } as const
const DIFFICULTY_COLOR = {
  easy: 'bg-green-100 text-green-700 ring-green-200',
  medium: 'bg-amber-100 text-amber-700 ring-amber-200',
  hard: 'bg-red-100 text-red-700 ring-red-200',
} as const

function QuestionCard({ q, number, locked }: { q: CheatSheetQuestion; number: number; locked?: boolean }) {
  const [expanded, setExpanded] = useState(false)

  if (locked) {
    return (
      <div className="relative flex gap-4 border-b border-gray-100 py-5 last:border-b-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-400">
          {number}
        </div>
        <div className="flex-1 select-none">
          <div className="mb-2 h-4 w-3/4 rounded bg-gray-200/80 blur-[3px]" />
          <div className="mb-1.5 h-3 w-full rounded bg-gray-100/80 blur-[3px]" />
          <div className="h-3 w-2/3 rounded bg-gray-100/80 blur-[3px]" />
        </div>
        <Lock className="mt-1 h-4 w-4 shrink-0 text-gray-300" aria-hidden />
      </div>
    )
  }

  return (
    <div className="border-b border-gray-100 py-5 last:border-b-0">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-start gap-4 text-left"
        aria-expanded={expanded}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-navy/10 text-xs font-bold text-brand-navy">
          {number}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 pb-1.5">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${DIFFICULTY_COLOR[q.difficulty]}`}
            >
              {DIFFICULTY_LABEL[q.difficulty]}
            </span>
          </div>
          <p className="text-sm font-semibold leading-snug text-gray-900 md:text-[0.9375rem]">
            {q.question}
          </p>
        </div>
        <ChevronDown
          className={`mt-1 h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {expanded && (
        <div className="mt-3 pl-12">
          <div className="rounded-lg bg-green-50 px-4 py-3 ring-1 ring-green-200">
            <p className="flex items-start gap-2 text-sm font-medium text-green-900">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden />
              {q.answer}
            </p>
          </div>
          {q.tip && (
            <div className="mt-2 flex items-start gap-2 rounded-lg bg-blue-50/70 px-3.5 py-2.5 ring-1 ring-blue-100">
              <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" aria-hidden />
              <p className="text-xs leading-relaxed text-blue-800">
                <span className="font-semibold">Exam tip: </span>
                {q.tip}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CategoryPill({
  cat,
  active,
  onClick,
}: {
  cat: (typeof CATEGORIES)[number]
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? 'bg-brand-navy text-white shadow-sm'
          : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <span>{cat.icon}</span>
      <span>{cat.label}</span>
      <span className={`rounded-full px-1.5 py-px text-[10px] font-bold ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
        {cat.count}
      </span>
    </button>
  )
}

export function CheatSheetContent({ viewer }: { viewer: Viewer }) {
  const isPremium = viewer.status === 'signed_in' && viewer.premium
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const allQuestions = activeCategory
    ? CHEAT_SHEET_QUESTIONS.filter((q) => q.category === activeCategory)
    : CHEAT_SHEET_QUESTIONS

  const freeQuestions = allQuestions.slice(0, isPremium ? allQuestions.length : CHEAT_SHEET_FREE_PREVIEW_COUNT)
  const lockedQuestions = isPremium ? [] : allQuestions.slice(CHEAT_SHEET_FREE_PREVIEW_COUNT)

  const lockedCount = CHEAT_SHEET_QUESTIONS.length - CHEAT_SHEET_FREE_PREVIEW_COUNT

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      {/* ── HERO ── */}
      <div className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-br from-brand-navy via-[#1a2a4a] to-[#0f1e35] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(211,47,47,0.15),transparent_60%)]" />
        <div className="container relative mx-auto max-w-5xl px-4 py-12 md:py-16">
          <nav className="mb-6 flex items-center gap-1.5 text-xs text-white/50">
            <Link href="/" className="hover:text-white/80">Home</Link>
            <span>/</span>
            <Link href="/dashboard/study" className="hover:text-white/80">Study</Link>
            <span>/</span>
            <span className="text-white/80">Cheat Sheet</span>
          </nav>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-red/20 px-3 py-1.5 ring-1 ring-brand-red/30">
                <Zap className="h-3.5 w-3.5 text-brand-red" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-red">
                  Survey-Ranked · Most Tested Questions
                </span>
              </div>

              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white md:text-4xl lg:text-[2.6rem]">
                150 Questions Most Likely to{' '}
                <span className="text-brand-red">Appear on Your Test</span>
              </h1>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
                Curated from real applicant surveys and exam feedback — these are the exact questions that show up
                most often. Click any question to reveal the answer. Study smarter, not longer.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 ring-1 ring-white/10">
                  <Target className="h-4 w-4 text-brand-red" />
                  <div>
                    <p className="text-xs text-white/50">Questions covered</p>
                    <p className="text-sm font-bold text-white">150 top questions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 ring-1 ring-white/10">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <div>
                    <p className="text-xs text-white/50">Avg. pass rate</p>
                    <p className="text-sm font-bold text-white">91% for those who studied this</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 ring-1 ring-white/10">
                  <Users className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-xs text-white/50">Based on</p>
                    <p className="text-sm font-bold text-white">Applicant survey data</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Card */}
            {!isPremium && (
              <div className="w-full shrink-0 rounded-2xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur-sm lg:w-72">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Crown className="h-4 w-4 text-yellow-400" />
                  CitizenReady Plus
                </div>
                <p className="mt-2 text-xs leading-relaxed text-white/60">
                  Unlock all 150 questions with answers, exam tips, difficulty ratings, and instant print export.
                </p>
                <ul className="mt-3 space-y-1.5">
                  {[
                    'All 150 survey-ranked questions',
                    'Instant answer reveal + explanations',
                    'Exam tips on every question',
                    'Print-ready PDF layout',
                    'Filter by topic & difficulty',
                    'Full question bank access',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-white/80">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-400" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-col gap-2">
                  {viewer.status === 'guest' ? (
                    <>
                      <Button className="w-full bg-brand-red hover:bg-brand-red-dark" asChild>
                        <Link href="/signup">
                          Get Plus free trial
                          <ArrowRight className="ml-1.5 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white" asChild>
                        <Link href="/login">Sign in</Link>
                      </Button>
                    </>
                  ) : (
                    <Button className="w-full bg-brand-red hover:bg-brand-red-dark" asChild>
                      <Link href="/pricing">
                        Upgrade to Plus
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── SOCIAL PROOF STRIP ── */}
      <div className="border-b border-gray-200 bg-white print:hidden">
        <div className="container mx-auto max-w-5xl px-4 py-3">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-brand-red" />
              Covers all 9 major test topics
            </span>
            <span className="flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-brand-navy" />
              Ranked by frequency in real applicant reports
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-green-600" />
              Based on official Discover Canada guide
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Updated for 2026 test format
            </span>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="container mx-auto max-w-5xl px-4 py-8 md:py-10">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-10">

          {/* ── Questions List ── */}
          <div className="min-w-0">
            {/* Category filter */}
            <div className="mb-6 print:hidden">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Filter by topic</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    activeCategory === null
                      ? 'bg-brand-navy text-white shadow-sm'
                      : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
                  }`}
                >
                  All topics
                  <span className={`rounded-full px-1.5 py-px text-[10px] font-bold ${activeCategory === null ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    150
                  </span>
                </button>
                {CATEGORIES.map((cat) => (
                  <CategoryPill
                    key={cat.key}
                    cat={cat}
                    active={activeCategory === cat.key}
                    onClick={() => setActiveCategory(activeCategory === cat.key ? null : cat.key)}
                  />
                ))}
              </div>
            </div>

            {/* Access status */}
            {isPremium ? (
              <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-800">
                <Crown className="h-4 w-4 text-green-600" aria-hidden />
                <span>
                  <strong>Plus member</strong> — all {CHEAT_SHEET_QUESTIONS.length} questions unlocked. Click any question to reveal the answer.
                </span>
              </div>
            ) : (
              <div className="mb-5 flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
                <Lock className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
                <span>
                  Showing <strong>{CHEAT_SHEET_FREE_PREVIEW_COUNT} of {CHEAT_SHEET_QUESTIONS.length}</strong> questions.{' '}
                  <Link href="/pricing" className="font-semibold underline underline-offset-2 hover:text-amber-900">
                    Unlock {lockedCount} more with Plus →
                  </Link>
                </span>
              </div>
            )}

            {/* Questions */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-4 print:hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900 md:text-base">
                      {activeCategory
                        ? CATEGORIES.find((c) => c.key === activeCategory)?.label
                        : 'All Questions'}
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-400">
                      Click any question to reveal the answer
                    </p>
                  </div>
                  {isPremium && (
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Print
                    </button>
                  )}
                </div>
              </div>

              <div className="px-5">
                {freeQuestions.map((q, idx) => (
                  <QuestionCard key={q.id} q={q} number={idx + 1} />
                ))}
                {lockedQuestions.map((q, idx) => (
                  <QuestionCard key={q.id} q={q} number={freeQuestions.length + idx + 1} locked />
                ))}
              </div>
            </div>

            {/* Paywall CTA block */}
            {!isPremium && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-brand-navy/15 bg-gradient-to-br from-brand-navy/[0.04] to-brand-red/[0.04] print:hidden">
                <div className="px-6 py-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-navy/10">
                    <Crown className="h-7 w-7 text-brand-navy" aria-hidden />
                  </div>
                  <h3 className="text-xl font-bold text-brand-navy">
                    Unlock {lockedCount} More Questions
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                    The remaining questions cover advanced topics examiners love — government structure, history, and
                    justice questions that trip up unprepared candidates.
                  </p>

                  <div className="mx-auto mt-5 grid max-w-sm grid-cols-2 gap-3 text-left">
                    {[
                      ['Government & Democracy', '25 questions'],
                      ['Canadian History', '22 questions'],
                      ['Federal Elections', '13 questions'],
                      ['Justice System', '15 questions'],
                    ].map(([topic, count]) => (
                      <div key={topic} className="flex flex-col rounded-lg bg-white px-3 py-2.5 shadow-sm ring-1 ring-gray-100">
                        <span className="text-xs font-semibold text-gray-800">{topic}</span>
                        <span className="mt-0.5 text-[11px] text-gray-400">{count} locked</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    {viewer.status === 'guest' ? (
                      <>
                        <Button className="bg-brand-red hover:bg-brand-red-dark" asChild>
                          <Link href="/signup">
                            Create free account
                            <ArrowRight className="ml-1.5 h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" className="border-brand-navy/25" asChild>
                          <Link href="/pricing">See Plus plans</Link>
                        </Button>
                      </>
                    ) : (
                      <Button className="bg-brand-red hover:bg-brand-red-dark" asChild>
                        <Link href="/pricing">
                          Upgrade to Plus
                          <ArrowRight className="ml-1.5 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <p className="mt-6 text-center text-xs text-gray-400 print:hidden">
              Questions curated from the official{' '}
              <a
                href="https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/study-guide.html"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                Discover Canada
              </a>{' '}
              guide. CitizenReady is independent of IRCC.
            </p>
          </div>

          {/* ── Sidebar ── */}
          <aside className="mt-8 space-y-4 print:hidden lg:mt-0">

            {/* Stats card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                Question breakdown
              </p>
              <ul className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <li key={cat.key} className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => setActiveCategory(activeCategory === cat.key ? null : cat.key)}
                      className="flex items-center gap-2 text-left text-xs text-gray-600 hover:text-gray-900"
                    >
                      <span>{cat.icon}</span>
                      <span className="truncate">{cat.label}</span>
                    </button>
                    <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                      {cat.count}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t border-gray-100 pt-3 text-right text-xs font-bold text-gray-700">
                Total: 150 questions
              </div>
            </div>

            {/* Difficulty breakdown */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                Difficulty mix
              </p>
              {(
                [
                  { label: 'Easy', key: 'easy', color: 'bg-green-500', count: CHEAT_SHEET_QUESTIONS.filter((q) => q.difficulty === 'easy').length },
                  { label: 'Medium', key: 'medium', color: 'bg-amber-500', count: CHEAT_SHEET_QUESTIONS.filter((q) => q.difficulty === 'medium').length },
                  { label: 'Hard', key: 'hard', color: 'bg-red-500', count: CHEAT_SHEET_QUESTIONS.filter((q) => q.difficulty === 'hard').length },
                ] as const
              ).map((d) => (
                <div key={d.key} className="mb-2">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-gray-600">{d.label}</span>
                    <span className="font-semibold text-gray-800">{d.count}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${d.color}`}
                      style={{ width: `${(d.count / 150) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky upgrade nudge (non-premium only) */}
            {!isPremium && (
              <div className="sticky top-24 rounded-2xl border border-brand-red/20 bg-brand-red/[0.04] p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-bold text-brand-navy">
                  <Crown className="h-4 w-4 text-brand-red" />
                  Unlock everything
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-500">
                  Get all 150 questions, print-ready format, and the complete 300+ question bank.
                </p>
                <Button className="mt-4 w-full bg-brand-red hover:bg-brand-red-dark text-sm" asChild>
                  <Link href={viewer.status === 'guest' ? '/signup' : '/pricing'}>
                    {viewer.status === 'guest' ? 'Get Plus free trial' : 'Upgrade to Plus'}
                  </Link>
                </Button>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
