import { StartExamButton } from '@/components/exam/StartExamButton'
import { Clock, FileText, Target, AlertCircle, Lock, Zap } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EXAM_CONFIG, mockExamPassingCorrectCount } from '@/lib/constants'
import { StudyPageHero } from '@/components/study/StudyPageHero'

export const metadata = {
  title: 'Mock Citizenship Exam',
  description: `Timed mock exam — ${EXAM_CONFIG.FREE_TOTAL_QUESTIONS} questions for free users, ${EXAM_CONFIG.TOTAL_QUESTIONS} for premium members. 30 minutes. ${EXAM_CONFIG.PASSING_SCORE}% to pass.`,
}

export default async function MockExamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isPremium = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium, role')
      .eq('id', user.id)
      .single()
    const row = profile as { is_premium?: boolean; role?: string } | null
    isPremium = row?.role === 'admin' || row?.is_premium === true
  }

  const qCount = isPremium ? EXAM_CONFIG.TOTAL_QUESTIONS : EXAM_CONFIG.FREE_TOTAL_QUESTIONS
  const passNeed = mockExamPassingCorrectCount(qCount)

  const questionsRuleDescription = () => {
    if (isPremium) {
      return 'Random questions from all topics covering Canadian history, geography, government, and rights.'
    }
    if (user) {
      return `Free accounts get a 10-question preview. Upgrade to Plus for the full 20-question mock exam that mirrors the real citizenship test.`
    }
    return 'Guests take a shorter preview. Create a free account or upgrade to Plus for the full 20-question mock exam.'
  }

  const rules = [
    {
      icon: FileText,
      title: isPremium
        ? `${qCount} Questions`
        : `${qCount} Questions${user ? ' (free preview)' : ' (guest preview)'}`,
      description: questionsRuleDescription(),
    },
    {
      icon: Clock,
      title: '30 Minute Time Limit',
      description: 'You have 30 minutes to complete the exam. The timer will automatically submit when time expires.',
    },
    {
      icon: Target,
      title: `${EXAM_CONFIG.PASSING_SCORE}% to Pass`,
      description: `You need at least ${passNeed} out of ${qCount} correct to pass.`,
    },
    {
      icon: AlertCircle,
      title: 'No Feedback During Exam',
      description: "You won't see correct answers until you submit. Just like the real citizenship test.",
    },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-8">
      <StudyPageHero
        icon={FileText}
        eyebrow="Mock exam"
        title="Mock citizenship exam"
        description={`Simulated Canadian citizenship test — ${qCount} questions, 30 minute timer, ${EXAM_CONFIG.PASSING_SCORE}% to pass. No feedback until you submit.`}
      />

      {/* Upgrade banner for free registered users */}
      {user && !isPremium && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
              <Lock className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-amber-900">
                Full 20-question exam is a Plus feature
              </p>
              <p className="mt-1 text-sm text-amber-700">
                You're on the free plan — you'll get a 10-question preview exam. Upgrade to Plus to take the full 20-question mock exam that mirrors the real Canadian citizenship test.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
                >
                  <Zap className="h-3.5 w-3.5" />
                  Upgrade to Plus
                </Link>
                <p className="self-center text-xs text-amber-600">
                  Unlock 20 questions · Full score history · Cheat sheet · Question bank
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exam rules */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <span className="rounded-full bg-brand-navy px-2.5 py-0.5 text-xs font-semibold text-white">
            Official Format
          </span>
          <h2 className="text-lg font-semibold text-gray-900">Exam rules</h2>
        </div>
        <p className="mb-5 text-sm text-gray-500">
          This mock exam follows the official Canadian citizenship test format.
        </p>
        <div className="grid gap-5 md:grid-cols-2">
          {rules.map((rule, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy/10">
                <rule.icon className="h-5 w-5 text-brand-navy" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{rule.title}</p>
                <p className="mt-0.5 text-sm text-gray-500">{rule.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Before you begin */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="rounded-xl bg-gray-50 p-5">
          <h3 className="mb-3 font-semibold text-gray-900">Before you begin</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-bold text-brand-red">•</span>
              Make sure you have a stable internet connection
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-bold text-brand-red">•</span>
              Find a quiet place where you can focus for 30 minutes
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-bold text-brand-red">•</span>
              Once started, the timer cannot be paused
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-bold text-brand-red">•</span>
              You can navigate between questions freely during the exam
            </li>
          </ul>
        </div>

        <div className="mt-6 flex justify-center">
          <StartExamButton />
        </div>
      </div>

      <p className="text-center text-sm text-gray-400">
        Not ready yet?{' '}
        <Link href="/dashboard/practice" className="font-medium text-brand-red hover:text-brand-red-dark">
          Practice by topic
        </Link>{' '}
        to improve your knowledge first.
      </p>
    </div>
  )
}
