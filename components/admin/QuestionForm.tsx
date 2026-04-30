'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { createQuestion, updateQuestion } from '@/actions/questions'
import { toast } from '@/hooks/use-toast'
import type { Topic, QuestionType, Difficulty } from '@/types'

type QuestionInput = {
  topic_id: string
  type: QuestionType
  question_text: string
  options: { key: string; text: string }[]
  correct_answers: string[]
  explanation?: string
  difficulty: Difficulty
  is_active: boolean
}

type QuestionFormProps = {
  mode: 'create' | 'edit'
  defaultValues?: Partial<QuestionInput>
  questionId?: string
  topics: Topic[]
}

export function QuestionForm({
  mode,
  defaultValues,
  questionId,
  topics,
}: QuestionFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const [topicId, setTopicId] = useState(defaultValues?.topic_id || '')
  const [type, setType] = useState<QuestionType>(defaultValues?.type || 'single')
  const [difficulty, setDifficulty] = useState<Difficulty>(
    defaultValues?.difficulty || 'medium'
  )
  const [questionText, setQuestionText] = useState(
    defaultValues?.question_text || ''
  )
  const [options, setOptions] = useState<{ key: string; text: string }[]>(
    defaultValues?.options || [
      { key: 'A', text: '' },
      { key: 'B', text: '' },
      { key: 'C', text: '' },
      { key: 'D', text: '' },
    ]
  )
  const [correctAnswers, setCorrectAnswers] = useState<string[]>(
    defaultValues?.correct_answers || []
  )
  const [explanation, setExplanation] = useState(defaultValues?.explanation || '')
  const [isActive, setIsActive] = useState(
    defaultValues?.is_active !== undefined ? defaultValues.is_active : true
  )

  function addOption() {
    const nextKey = String.fromCharCode(65 + options.length)
    setOptions([...options, { key: nextKey, text: '' }])
  }

  function removeOption(index: number) {
    const newOptions = options.filter((_, i) => i !== index)
    setOptions(newOptions)

    const removedKey = options[index].key
    setCorrectAnswers(correctAnswers.filter((k) => k !== removedKey))
  }

  function updateOptionText(index: number, text: string) {
    const newOptions = [...options]
    newOptions[index].text = text
    setOptions(newOptions)
  }

  function toggleCorrectAnswer(key: string) {
    if (type === 'single' || type === 'boolean') {
      setCorrectAnswers([key])
    } else {
      if (correctAnswers.includes(key)) {
        setCorrectAnswers(correctAnswers.filter((k) => k !== key))
      } else {
        setCorrectAnswers([...correctAnswers, key])
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData()
    formData.append('topic_id', topicId)
    formData.append('type', type)
    formData.append('question_text', questionText)
    formData.append('options', JSON.stringify(options))
    formData.append('correct_answers', JSON.stringify(correctAnswers))
    formData.append('explanation', explanation)
    formData.append('difficulty', difficulty)
    formData.append('is_active', String(isActive))

    const result =
      mode === 'create'
        ? await createQuestion(formData)
        : await updateQuestion(questionId!, formData)

    setIsLoading(false)

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: `Question ${mode === 'create' ? 'created' : 'updated'}`,
      })
      router.push('/admin/questions')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="topic">Topic *</Label>
        <Select value={topicId} onValueChange={setTopicId} required>
          <SelectTrigger id="topic">
            <SelectValue placeholder="Select a topic" />
          </SelectTrigger>
          <SelectContent>
            {topics.map((topic) => (
              <SelectItem key={topic.id} value={topic.id}>
                {topic.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type *</Label>
          <Select value={type} onValueChange={(v) => setType(v as QuestionType)} required>
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single Choice</SelectItem>
              <SelectItem value="multiple">Multiple Choice</SelectItem>
              <SelectItem value="boolean">True/False</SelectItem>
              <SelectItem value="fill">Fill in the Blank</SelectItem>
              <SelectItem value="matching">Matching</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty *</Label>
          <Select
            value={difficulty}
            onValueChange={(v) => setDifficulty(v as Difficulty)}
            required
          >
            <SelectTrigger id="difficulty">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="question_text">Question Text *</Label>
        <Textarea
          id="question_text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          rows={4}
          required
          placeholder="Enter the question..."
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Options *</Label>
          <Button type="button" variant="outline" size="sm" onClick={addOption}>
            + Add Option
          </Button>
        </div>

        <div className="space-y-3">
          {options.map((option, index) => (
            <div key={option.key} className="flex items-center gap-2">
              <input
                type={type === 'multiple' ? 'checkbox' : 'radio'}
                name="correct_answer"
                checked={correctAnswers.includes(option.key)}
                onChange={() => toggleCorrectAnswer(option.key)}
                className="h-4 w-4"
              />
              <div className="flex-1 flex items-center gap-2">
                <span className="font-medium text-sm w-6">{option.key}.</span>
                <Input
                  value={option.text}
                  onChange={(e) => updateOptionText(index, e.target.value)}
                  placeholder={`Option ${option.key}`}
                  required
                />
              </div>
              {options.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(index)}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {type === 'multiple'
            ? 'Check all correct answers'
            : 'Select the correct answer'}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="explanation">Explanation (optional)</Label>
        <Textarea
          id="explanation"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows={3}
          placeholder="Explain why this is the correct answer..."
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? mode === 'create'
              ? 'Creating...'
              : 'Updating...'
            : mode === 'create'
              ? 'Create Question'
              : 'Update Question'}
        </Button>
      </div>
    </form>
  )
}
