import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Answers about Canadian citizenship test prep, CitizenReady mock exams, progress tracking, and official IRCC resources.',
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children
}
