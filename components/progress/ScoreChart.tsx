'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts'
import { format } from 'date-fns'

interface MockExamScore {
  score: number
  total_q: number
  completed_at: string
}

interface ScoreChartProps {
  scores: MockExamScore[]
}

export default function ScoreChart({ scores }: ScoreChartProps) {
  if (scores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mock Exam Performance</CardTitle>
          <CardDescription>Track your progress on practice exams</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="mb-4 text-center text-muted-foreground">
            No mock exams taken yet. Take your first mock exam.
          </p>
          <Button asChild>
            <Link href="/dashboard/mock-exam">Start Mock Exam</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const chartData = scores.map((exam) => ({
    date: format(new Date(exam.completed_at), 'MMM dd'),
    score: exam.score,
    passed: exam.score >= 15,
  }))

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
          <p className="font-semibold">{data.date}</p>
          <p className="text-sm">
            Score: <span className="font-medium">{data.score}/20</span>
          </p>
          <p className={`text-xs ${data.passed ? 'text-green-600' : 'text-red-600'}`}>
            {data.passed ? 'Passed' : 'Failed'}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mock Exam Performance</CardTitle>
        <CardDescription>Your last {scores.length} mock exam scores</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis 
              domain={[0, 20]} 
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine 
              y={15} 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="3 3"
              label={{ value: 'Pass threshold', position: 'right', fill: 'currentColor' }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={(props) => {
                const { cx, cy, payload, index } = props
                return (
                  <circle
                    key={`dot-${index}`}
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill={payload.passed ? 'hsl(142 76% 36%)' : 'hsl(0 84% 60%)'}
                    stroke="white"
                    strokeWidth={2}
                  />
                )
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
