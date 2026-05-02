import Link from 'next/link'
import { AiBlogDraftForm } from '@/components/admin/AiBlogDraftForm'
import { Button } from '@/components/ui/button'

export default function AdminAiBlogDraftPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI blog draft</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Sends title and context to your n8n webhook. The automation generates JSON, uploads it to
            Google Drive, and your scheduled workflow can insert it into Supabase when the slug is new.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/blog">Back to posts</Link>
        </Button>
      </div>

      <AiBlogDraftForm />
    </div>
  )
}
