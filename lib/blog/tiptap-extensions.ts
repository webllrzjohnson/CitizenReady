import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import { BlogImage } from '@/lib/blog/blog-image-extension'

export const blogEditorExtensions = [
  StarterKit.configure({
    heading: false,
    horizontalRule: false,
  }),
  Heading.configure({ levels: [1, 2, 3] }),
  BlogImage,
  Link.configure({
    openOnClick: false,
    autolink: true,
  }),
  Placeholder.configure({
    placeholder: 'Start writing your post...',
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  Underline,
  HorizontalRule,
]

export const defaultBlogDoc = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
} as const
