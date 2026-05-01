import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  ChevronDown,
  ExternalLink,
  Lock,
  BookOpen,
  CheckCircle2,
  Printer,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PrintPageButton } from '@/components/study/PrintPageButton'
import type { QuestionBankPreviewItem, QuestionBankTopicEntry } from '@/lib/data/complete-questions'
import { QUESTION_BANK_FREE_PREVIEW_COUNT } from '@/lib/question-bank'
import type { Question } from '@/types'

const IRCC_GUIDE =
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/study-guide.html'

export type QuestionBankViewer =
  | { status: 'guest' }
  | { status: 'signed_in'; premium: boolean }

function answerLabel(q: Question): string {
  const keys = q.correct_answers ?? []
  const parts = keys
    .map((k) => q.options.find((o) => o.key === k)?.text)
    .filter(Boolean) as string[]
  if (parts.length > 0) return parts.join('; ')
  return keys.join(', ')
}

function QuestionItem({
  q,
  number,
  topicMeta,
}: {
  q: Question
  number: number
  topicMeta?: { name: string; slug: string }
}) {
  return (
    <div className="border-b border-gray-100 py-6 last:border-b-0 print:break-inside-avoid">
      <div className="flex gap-3 sm:gap-4">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-navy/10 text-xs font-bold text-brand-navy">
          {number}
        </div>
        <div className="min-w-0 flex-1">
          {topicMeta ? (
            <Link
              href={`/dashboard/practice/${topicMeta.slug}`}
              className="mb-2 inline-flex items-center gap-1 rounded-full bg-brand-red/8 px-2.5 py-0.5 text-xs font-medium text-brand-red no-underline hover:bg-brand-red/15 print:hidden"
            >
              <BookOpen className="h-3 w-3" />
              {topicMeta.name}
            </Link>
          ) : null}

          <p className="text-base font-semibold leading-snug text-gray-900 md:text-[1.0625rem]">
            {q.question_text}
          </p>

          <ul className="mt-3 space-y-2 text-sm">
            {q.options.map((opt) => {
              const isCorrect = q.correct_answers.includes(opt.key)
              return (
                <li
                  key={opt.key}
                  className={
                    isCorrect
                      ? 'flex items-start gap-2.5 rounded-lg bg-green-50 px-3 py-2.5 ring-1 ring-green-200 print:bg-transparent print:ring-gray-400'
                      : 'flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-gray-500'
                  }
                >
                  <span
                    className={
                      isCorrect
                        ? 'mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold uppercase text-white print:bg-transparent print:text-black'
                        : 'mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold uppercase text-gray-600'
                    }
                  >
                    {opt.key}
                  </span>
                  <span className={isCorrect ? 'font-medium text-gray-900' : 'text-gray-600'}>
                    {opt.text}
                  </span>
                  {isCorrect ? (
                    <CheckCircle2
                      className="ml-auto mt-px h-4 w-4 shrink-0 text-green-500 print:hidden"
                      aria-label="Correct"
                    />
                  ) : null}
                </li>
              )
            })}
          </ul>

          <div className="mt-3 flex flex-wrap items-start gap-3">
            <p className="text-sm font-medium text-gray-700">
              <span className="text-gray-500">Answer: </span>
              <span className="text-green-700">{answerLabel(q)}</span>
            </p>
          </div>

          {q.explanation ? (
            <div className="mt-3 rounded-lg bg-blue-50/60 px-3.5 py-3 text-sm leading-relaxed text-gray-600 print:bg-transparent print:pl-3 print:border-l print:border-gray-400">
              <span className="font-semibold text-gray-700">Explanation: </span>
              {q.explanation}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function ChapterAccordion({
  id,
  slug,
  number,
  name,
  description,
  questionCount,
  questions,
  defaultOpen,
  headerRight,
}: {
  id: string
  slug: string
  number: number
  name: string
  description: string | null
  questionCount: number
  questions: Question[]
  defaultOpen?: boolean
  headerRight?: ReactNode
}) {
  return (
    <details
      id={id}
      className="group scroll-mt-24 border-b border-gray-200 last:border-b-0 open:bg-white"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 py-5 pr-2 [&::-webkit-details-marker]:hidden">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">
          {String(number).padStart(2, '0')}
        </span>
        <div className="min-w-0 flex-1">
          <span className="block text-base font-semibold text-gray-900 group-open:text-brand-navy md:text-lg">
            {name}
          </span>
          {description ? (
            <span className="mt-0.5 block text-xs text-gray-500 md:text-sm">{description}</span>
          ) : null}
        </div>
        <div className="ml-2 flex shrink-0 items-center gap-2">
          {headerRight}
          <span className="hidden rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500 sm:inline">
            {questionCount} q
          </span>
          <ChevronDown className="h-5 w-5 text-gray-400 transition-transform duration-200 group-open:rotate-180" aria-hidden />
        </div>
      </summary>

      <div className="pb-6 pl-11">
        <div className="flex items-center justify-between pb-2">
          <span className="text-xs text-gray-400">{questionCount} questions</span>
          <Link
            href={`/dashboard/practice/${slug}`}
            className="print:hidden text-xs font-medium text-brand-red underline-offset-2 hover:underline"
          >
            Practice interactively →
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {questions.map((q, idx) => (
            <QuestionItem key={q.id} q={q} number={idx + 1} />
          ))}
        </div>
      </div>
    </details>
  )
}

function LockedChapterRow({
  number,
  slug,
  name,
  description,
  questionCount,
  viewer,
}: {
  number: number
  slug: string
  name: string
  description: string | null
  questionCount: number
  viewer: QuestionBankViewer
}) {
  return (
    <div id={slug} className="scroll-mt-24 border-b border-gray-200 last:border-b-0">
      <div className="flex items-center gap-3 py-5 pr-2 opacity-70">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-500">
          {String(number).padStart(2, '0')}
        </span>
        <div className="min-w-0 flex-1">
          <span className="block text-base font-semibold text-gray-700 md:text-lg">{name}</span>
          {description ? (
            <span className="mt-0.5 block text-xs text-gray-400 md:text-sm">{description}</span>
          ) : null}
        </div>
        <div className="ml-2 flex shrink-0 items-center gap-2 print:hidden">
          <Link
            href={`/dashboard/practice/${slug}`}
            className="hidden text-xs font-medium text-gray-500 underline-offset-2 hover:underline sm:inline"
          >
            Practice free →
          </Link>
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
            {questionCount} q
          </span>
          <Lock className="h-4 w-4 text-gray-400" aria-hidden />
          <Link
            href="/pricing"
            className="rounded-full bg-brand-navy px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-brand-navy/80"
          >
            {viewer.status === 'guest' ? 'Unlock' : 'Plus'}
          </Link>
        </div>
      </div>
    </div>
  )
}

export function CompleteQuestionsCatalog({
  topics,
  previewQuestions,
  totalQuestions,
  unlockedQuestionCount,
  lockedTopicCount,
  viewer,
}: {
  topics: QuestionBankTopicEntry[]
  previewQuestions: QuestionBankPreviewItem[]
  totalQuestions: number
  unlockedQuestionCount: number
  lockedTopicCount: number
  viewer: QuestionBankViewer
}) {
  const toc = topics.filter((t) => t.questionCount > 0)
  const showPaywall = viewer.status === 'guest' || (viewer.status === 'signed_in' && !viewer.premium)
  const showPreview = showPaywall && previewQuestions.length > 0
  const memberLabel = viewer.status === 'signed_in' && viewer.premium

  return (
    <div className="complete-questions-catalog min-h-screen bg-[#f8f8f8] text-gray-900">

      {/* ── Hero ── */}
      <div className="border-b border-gray-200 bg-white print:hidden">
        <div className="container mx-auto max-w-5xl px-4 py-10 md:py-12">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <nav className="mb-3 flex items-center gap-1.5 text-xs text-gray-400">
                <Link href="/" className="hover:text-gray-600">Home</Link>
                <span>/</span>
                <Link href="/dashboard/study" className="hover:text-gray-600">Study</Link>
                <span>/</span>
                <span className="text-gray-600">Complete Questions</span>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                Complete Questions
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-500 md:text-base">
                Prepare for your Canadian citizenship test with chapter-by-chapter practice based on{' '}
                <em>Discover Canada</em>. Work through each topic and review explanations — perfect for
                a printable or PDF study format.
              </p>
              {showPaywall ? (
                <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs leading-relaxed text-amber-800 md:text-sm">
                  <Lock className="mr-1.5 inline h-3.5 w-3.5 align-middle" aria-hidden />
                  <strong>{unlockedQuestionCount}</strong> of <strong>{totalQuestions}</strong> questions
                  available as a free random sample.{' '}
                  <strong>{lockedTopicCount} chapter{lockedTopicCount === 1 ? '' : 's'}</strong> unlocked
                  with{' '}
                  <Link href="/pricing" className="font-semibold underline underline-offset-2">
                    CitizenReady Plus
                  </Link>
                  .
                </p>
              ) : (
                <p className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3.5 py-2.5 text-xs leading-relaxed text-green-800 md:text-sm">
                  <CheckCircle2 className="mr-1.5 inline h-3.5 w-3.5 align-middle" aria-hidden />
                  Full access — all <strong>{totalQuestions}</strong> questions across{' '}
                  <strong>{toc.length}</strong> chapters.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 print:hidden sm:flex-row sm:items-start">
              <PrintPageButton />
              <Button variant="outline" size="sm" className="gap-1.5 border-gray-300 text-gray-600 hover:text-gray-900" asChild>
                <a href={IRCC_GUIDE} target="_blank" rel="noopener noreferrer">
                  Official guide
                  <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden />
                </a>
              </Button>
              {showPaywall ? (
                <Button size="sm" className="bg-brand-red hover:bg-brand-red-dark" asChild>
                  <Link href="/pricing">{viewer.status === 'guest' ? 'Get Plus' : 'Upgrade'}</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="container mx-auto max-w-5xl px-4 py-8 md:py-10">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-10">

          {/* ── Main content ── */}
          <div className="min-w-0">

            {/* Preview section */}
            {showPreview ? (
              <div className="mb-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-red/10">
                    <BookOpen className="h-4 w-4 text-brand-red" aria-hidden />
                  </div>
                  <div>
                    <h2 id="free-preview" className="scroll-mt-24 text-base font-bold text-gray-900">
                      Free Preview
                    </h2>
                    <p className="text-xs text-gray-400">
                      {previewQuestions.length} random question{previewQuestions.length === 1 ? '' : 's'} from all chapters
                      — reshuffled each visit (max {QUESTION_BANK_FREE_PREVIEW_COUNT})
                    </p>
                  </div>
                </div>
                <div className="divide-y divide-gray-100 px-5">
                  {previewQuestions.map((q, idx) => (
                    <QuestionItem
                      key={q.id}
                      q={q}
                      number={idx + 1}
                      topicMeta={{ name: q.topic_name, slug: q.topic_slug }}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {/* Chapter list */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-4">
                <h2 className="text-base font-bold text-gray-900">
                  {memberLabel ? 'All Chapters' : 'Chapters'}
                </h2>
                <p className="mt-0.5 text-xs text-gray-400">
                  {memberLabel
                    ? `${toc.length} topics · ${totalQuestions} questions · click any chapter to expand`
                    : `${toc.length} topics — free preview above · chapter detail unlocked with Plus`}
                </p>
              </div>

              <div className="px-5">
                {toc.map((topic, idx) =>
                  topic.isLocked ? (
                    <LockedChapterRow
                      key={topic.id}
                      number={idx + 1}
                      slug={topic.slug}
                      name={topic.name}
                      description={topic.description}
                      questionCount={topic.questionCount}
                      viewer={viewer}
                    />
                  ) : (
                    <ChapterAccordion
                      key={topic.id}
                      id={topic.slug}
                      slug={topic.slug}
                      number={idx + 1}
                      name={topic.name}
                      description={topic.description}
                      questionCount={topic.questionCount}
                      questions={topic.questions}
                      defaultOpen={idx === 0}
                    />
                  )
                )}
              </div>
            </div>

            {/* Paywall CTA block (non-Plus) */}
            {showPaywall && lockedTopicCount > 0 ? (
              <div className="mt-6 rounded-2xl border border-brand-navy/15 bg-brand-navy/[0.03] px-6 py-8 text-center print:hidden">
                <Lock className="mx-auto h-10 w-10 text-brand-navy/40" aria-hidden />
                <p className="mt-4 text-lg font-bold text-brand-navy">
                  Unlock {lockedTopicCount} more chapter{lockedTopicCount === 1 ? '' : 's'}
                </p>
                <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                  CitizenReady Plus gives you the complete per-chapter question list — every question in
                  order, with answers and explanations, ready to print.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  {viewer.status === 'guest' ? (
                    <>
                      <Button className="bg-brand-red hover:bg-brand-red-dark" asChild>
                        <Link href="/signup">Create free account</Link>
                      </Button>
                      <Button variant="outline" className="border-brand-navy/25" asChild>
                        <Link href="/pricing">See Plus plans</Link>
                      </Button>
                    </>
                  ) : (
                    <Button className="bg-brand-red hover:bg-brand-red-dark" asChild>
                      <Link href="/pricing">Upgrade to Plus</Link>
                    </Button>
                  )}
                </div>
              </div>
            ) : null}

            <p className="mt-6 text-center text-xs text-gray-400 print:hidden">
              CitizenReady is independent of IRCC. Confirm eligibility and rules with the{' '}
              <a href={IRCC_GUIDE} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                official study guide
              </a>{' '}
              before your appointment.
            </p>
          </div>

          {/* ── Sidebar TOC ── */}
          <aside className="mt-8 print:hidden lg:mt-0">
            <nav
              aria-label="Chapters"
              className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                Chapters
              </p>
              <ul className="space-y-px text-sm">
                {showPreview ? (
                  <li>
                    <a
                      href="#free-preview"
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 font-medium text-brand-red hover:bg-gray-50"
                    >
                      <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      Free Preview
                      <span className="ml-auto text-xs text-gray-400">{previewQuestions.length}</span>
                    </a>
                  </li>
                ) : null}
                {toc.map((t, idx) => (
                  <li key={t.id}>
                    <a
                      href={`#${t.slug}`}
                      className={
                        t.isLocked
                          ? 'flex items-center gap-2 rounded-lg px-2 py-1.5 text-gray-400 hover:bg-gray-50'
                          : 'flex items-center gap-2 rounded-lg px-2 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                    >
                      <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-sm bg-gray-100 text-[10px] font-bold text-gray-500">
                        {idx + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{t.name}</span>
                      {t.isLocked ? (
                        <Lock className="h-3 w-3 shrink-0 opacity-50" aria-hidden />
                      ) : (
                        <span className="ml-auto text-xs text-gray-400">{t.questionCount}</span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>

        {/* Mobile jump list */}
        <details className="mt-6 rounded-xl border border-gray-200 bg-white p-4 lg:hidden print:hidden">
          <summary className="cursor-pointer text-sm font-semibold text-gray-700">
            Jump to chapter
          </summary>
          <ul className="mt-3 grid grid-cols-2 gap-1.5 text-sm">
            {showPreview ? (
              <li className="col-span-2">
                <a href="#free-preview" className="text-brand-red underline-offset-2 hover:underline">
                  Free Preview ({previewQuestions.length})
                </a>
              </li>
            ) : null}
            {toc.map((t, idx) => (
              <li key={t.id}>
                <a
                  href={`#${t.slug}`}
                  className={
                    t.isLocked
                      ? 'flex items-center gap-1 text-gray-400'
                      : 'flex items-center gap-1 text-gray-700 underline-offset-2 hover:underline'
                  }
                >
                  {t.isLocked ? <Lock className="h-3 w-3 shrink-0" aria-hidden /> : null}
                  <span className="truncate">{idx + 1}. {t.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  )
}
