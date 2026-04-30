'use client'

import { useCallback, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import type { Editor } from '@tiptap/core'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ChevronDown,
  ImageIcon,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { blogEditorExtensions, defaultBlogDoc } from '@/lib/blog/tiptap-extensions'
import { BLOG_IMAGE_LAYOUTS, type BlogImageLayout, blogImageEditorClass } from '@/lib/blog/blog-image-extension'

type BlogEditorProps = {
  initialContent?: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
}

function toolbarBtnClass(active: boolean) {
  return cn(
    'rounded px-2.5 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100',
    active && 'bg-red-100 text-red-800 hover:bg-red-100',
  )
}

function blockLabel(editor: Editor) {
  if (editor.isActive('heading', { level: 1 })) return 'Heading 1'
  if (editor.isActive('heading', { level: 2 })) return 'Heading 2'
  if (editor.isActive('heading', { level: 3 })) return 'Heading 3'
  return 'Paragraph'
}

export function BlogEditor({ initialContent, onChange }: BlogEditorProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleUpdate = useCallback(
    ({ editor }: { editor: Editor }) => {
      onChange(editor.getJSON())
    },
    [onChange],
  )

  const editor = useEditor({
    extensions: blogEditorExtensions,
    content: (initialContent ?? defaultBlogDoc) as Record<string, unknown>,
    immediatelyRender: false,
    onCreate: ({ editor }) => {
      onChange(editor.getJSON())
    },
    editorProps: {
      attributes: {
        class: blogImageEditorClass,
      },
    },
    onUpdate: handleUpdate,
  })

  if (!editor) {
    return (
      <div className="min-h-[400px] animate-pulse rounded-md bg-muted/40" aria-hidden />
    )
  }

  const imgLayout = (editor.getAttributes('image').layout ?? 'default') as BlogImageLayout

  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-gray-200 bg-white px-2 py-2">
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'rounded gap-1 text-gray-700 hover:bg-gray-100',
                menuOpen && 'bg-gray-100',
              )}
            >
              {blockLabel(editor)}
              <ChevronDown className="h-4 w-4 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onClick={() => {
                editor.chain().focus().setParagraph().run()
                setMenuOpen(false)
              }}
            >
              Paragraph
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 1 }).run()
                setMenuOpen(false)
              }}
            >
              Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 2 }).run()
                setMenuOpen(false)
              }}
            >
              Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 3 }).run()
                setMenuOpen(false)
              }}
            >
              Heading 3
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mx-1 h-6 w-px bg-gray-200" aria-hidden />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={toolbarBtnClass(editor.isActive('bold'))}
          aria-label="Bold"
        >
          <span className="font-bold">B</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={toolbarBtnClass(editor.isActive('italic'))}
          aria-label="Italic"
        >
          <span className="italic">I</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={toolbarBtnClass(editor.isActive('underline'))}
          aria-label="Underline"
        >
          <span className="underline">U</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={toolbarBtnClass(editor.isActive('strike'))}
          aria-label="Strikethrough"
        >
          <span className="line-through">S</span>
        </button>

        <div className="mx-1 h-6 w-px bg-gray-200" aria-hidden />

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={toolbarBtnClass(editor.isActive({ textAlign: 'left' }))}
          aria-label="Align left"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={toolbarBtnClass(editor.isActive({ textAlign: 'center' }))}
          aria-label="Align center"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={toolbarBtnClass(editor.isActive({ textAlign: 'right' }))}
          aria-label="Align right"
        >
          <AlignRight className="h-4 w-4" />
        </button>

        <div className="mx-1 h-6 w-px bg-gray-200" aria-hidden />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={toolbarBtnClass(editor.isActive('bulletList'))}
          aria-label="Bullet list"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={toolbarBtnClass(editor.isActive('orderedList'))}
          aria-label="Ordered list"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <div className="mx-1 h-6 w-px bg-gray-200" aria-hidden />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={toolbarBtnClass(editor.isActive('blockquote'))}
          aria-label="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={toolbarBtnClass(false)}
          aria-label="Horizontal rule"
        >
          —
        </button>
        <button
          type="button"
          onClick={() => {
            const prev = editor.getAttributes('link').href as string | undefined
            const url = window.prompt('Link URL', prev ?? 'https://')
            if (url === null) return
            if (url === '') {
              editor.chain().focus().extendMarkRange('link').unsetLink().run()
              return
            }
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
          }}
          className={toolbarBtnClass(editor.isActive('link'))}
          aria-label="Link"
        >
          <Link2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt('Image URL', 'https://')
            if (!url) return
            editor
              .chain()
              .focus()
              .setImage({ src: url })
              .updateAttributes('image', { layout: 'default' })
              .run()
          }}
          className={toolbarBtnClass(false)}
          aria-label="Insert image"
        >
          <ImageIcon className="h-4 w-4" />
        </button>

        {editor.isActive('image') ? (
          <>
            <div className="mx-1 h-6 w-px bg-gray-200" aria-hidden />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded gap-1 text-gray-700 hover:bg-gray-100">
                  Image layout
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-w-[min(100vw-2rem,22rem)]">
                {BLOG_IMAGE_LAYOUTS.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    onClick={() => {
                      editor.chain().focus().updateAttributes('image', { layout: opt.value }).run()
                    }}
                    className={cn('flex flex-col items-start gap-0.5 py-2', imgLayout === opt.value && 'bg-red-50')}
                  >
                    <span className="font-medium">{opt.label}</span>
                    <span className="text-xs font-normal text-muted-foreground">{opt.description}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : null}

        <div className="mx-1 h-6 w-px bg-gray-200" aria-hidden />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className={cn(toolbarBtnClass(false), 'disabled:opacity-40')}
          aria-label="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className={cn(toolbarBtnClass(false), 'disabled:opacity-40')}
          aria-label="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-[400px] bg-white p-6">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
