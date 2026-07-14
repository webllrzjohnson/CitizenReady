import Link from 'next/link'
import { AiBlogDraftForm } from '@/components/admin/AiBlogDraftForm'
import { Button } from '@/components/ui/button'
import { getAiBlogSettings } from '@/lib/blog/ai-settings'

export default async function AdminAiBlogDraftPage() {
  const { provider, model } = await getAiBlogSettings()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI blog draft</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Provide a title and context. Your chosen AI provider generates a TipTap draft and saves
            it as a draft post for you to review, edit, and publish.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/blog">Back to posts</Link>
        </Button>
      </div>

      <AiBlogDraftForm initialProvider={provider} initialModel={model} />
    </div>
  )
}
