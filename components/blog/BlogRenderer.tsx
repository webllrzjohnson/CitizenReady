'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { blogEditorExtensions } from '@/lib/blog/tiptap-extensions'
import { blogImageRendererClass } from '@/lib/blog/blog-image-extension'

type BlogRendererProps = {
  content: Record<string, unknown>
}

export function BlogRenderer({ content }: BlogRendererProps) {
  const editor = useEditor({
    extensions: blogEditorExtensions,
    content: content as Record<string, unknown>,
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: blogImageRendererClass,
      },
    },
  })

  if (!editor) {
    return <div className="min-h-[200px] animate-pulse rounded-md bg-muted/40" aria-hidden />
  }

  return (
    <div className="prose-blog max-w-none overflow-auto sm:overflow-visible">
      <EditorContent editor={editor} />
    </div>
  )
}
