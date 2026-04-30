import { BlogEditorPage } from '@/components/blog/BlogEditorPage'

export default function AdminNewBlogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Post</h1>
        <p className="mt-1 text-muted-foreground">Write and publish a new blog post</p>
      </div>
      <BlogEditorPage mode="create" />
    </div>
  )
}
