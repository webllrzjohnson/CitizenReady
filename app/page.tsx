import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Clock, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Free Canadian Citizenship Exam Practice',
  description: 'Practice for your Canadian citizenship test with 1,000+ questions, timed mock exams, and topic-by-topic study guides. Free forever.',
}

export default function HomePage() {
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Pass Your Canadian Citizenship Test
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
            Practice with 1,001 official-style questions, take timed mock exams, and track your progress. Free forever.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start Practicing Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#features">Learn More</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive study tools designed to help you pass the Canadian citizenship test with confidence
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Practice by Topic</CardTitle>
                <CardDescription>
                  Study each Discover Canada chapter separately. Focus on your weak areas and master every topic at your own pace.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Mock Exam</CardTitle>
                <CardDescription>
                  Simulate the real test with 20 questions and a 30-minute timer. Experience exam conditions before test day.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Track Progress</CardTitle>
                <CardDescription>
                  See your improvement over time with detailed charts and statistics. Know exactly where you stand.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                1,001
              </div>
              <div className="text-lg text-muted-foreground">
                Questions
              </div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                11
              </div>
              <div className="text-lg text-muted-foreground">
                Topics
              </div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                Free
              </div>
              <div className="text-lg text-muted-foreground">
                Forever
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to pass your citizenship test?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of people preparing for their Canadian citizenship exam
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/signup">
              Start Practicing Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
