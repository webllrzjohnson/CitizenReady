import './globals.css'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "sonner";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata = {
  title: {
    default: 'CitizenReady',
    template: '%s | CitizenReady',
  },
  description: 'Free Canadian citizenship exam practice. Study by topic, take mock tests, and track your progress.',
  keywords: ['Canadian citizenship test', 'citizenship exam practice', 
    'IRCC test prep', 'Canada citizenship quiz'],
  openGraph: {
    title: 'CitizenReady — Canadian Citizenship Exam Prep',
    description: 'Free practice questions, timed mock exams, and progress tracking.',
    url: 'https://citizenready.ca',
    siteName: 'CitizenReady',
    locale: 'en_CA',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        <Navbar />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
