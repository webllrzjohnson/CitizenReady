import Image from '@tiptap/extension-image'

export type BlogImageLayout = 'default' | 'center_large' | 'right_wrap' | 'featured_top'

export const BLOG_IMAGE_LAYOUTS: { value: BlogImageLayout; label: string; description: string }[] = [
  {
    value: 'default',
    label: 'Default',
    description: 'Standard inline width',
  },
  {
    value: 'featured_top',
    label: 'Featured (top)',
    description: 'Full-width hero-style banner in the article',
  },
  {
    value: 'center_large',
    label: 'Centered large',
    description: 'Wide centered image that breaks up text',
  },
  {
    value: 'right_wrap',
    label: 'Right + wrap',
    description: 'Medium image on the right; text flows around it',
  },
]

export const blogImageEditorClass =
  'outline-none min-h-[320px] [&_h2]:clear-both [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-brand-navy [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-brand-navy [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-brand-navy [&_h3]:mb-2 [&_p]:text-base [&_p]:text-gray-700 [&_p]:mb-4 [&_p]:leading-relaxed [&_blockquote]:border-l-4 [&_blockquote]:border-brand-red pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_ul]:ml-6 [&_ul]:mb-4 [&_ol]:ml-6 [&_ol]:mb-4 [&_hr]:border-gray-200 [&_hr]:my-6 [&_a]:text-red-600 [&_a]:underline [&_a:hover]:text-red-800 [&_img]:rounded-lg [&_img[data-layout=default]]:max-w-full [&_img[data-layout=default]]:my-4 [&_img[data-layout=featured_top]]:my-8 [&_img[data-layout=featured_top]]:block [&_img[data-layout=featured_top]]:w-full [&_img[data-layout=featured_top]]:max-w-none [&_img[data-layout=featured_top]]:aspect-video [&_img[data-layout=featured_top]]:object-cover [&_img[data-layout=featured_top]]:rounded-xl [&_img[data-layout=center_large]]:my-8 [&_img[data-layout=center_large]]:block [&_img[data-layout=center_large]]:w-full [&_img[data-layout=center_large]]:max-w-4xl [&_img[data-layout=center_large]]:mx-auto [&_img[data-layout=center_large]]:max-h-[min(70vh,720px)] [&_img[data-layout=center_large]]:object-cover [&_img[data-layout=center_large]]:rounded-xl [&_img[data-layout=right_wrap]]:my-4 [&_img[data-layout=right_wrap]]:mx-auto [&_img[data-layout=right_wrap]]:block [&_img[data-layout=right_wrap]]:w-full [&_img[data-layout=right_wrap]]:max-w-md [&_img[data-layout=right_wrap]]:rounded-lg [&_img[data-layout=right_wrap]]:object-cover sm:[&_img[data-layout=right_wrap]]:float-right sm:[&_img[data-layout=right_wrap]]:ml-4 sm:[&_img[data-layout=right_wrap]]:mb-2 sm:[&_img[data-layout=right_wrap]]:mt-1 sm:[&_img[data-layout=right_wrap]]:w-[min(100%,20rem)] sm:[&_img[data-layout=right_wrap]]:max-w-none'

export const blogImageRendererClass =
  'outline-none [&_h2]:clear-both [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-brand-navy [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-brand-navy [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-brand-navy [&_h3]:mb-2 [&_p]:text-base [&_p]:text-gray-700 [&_p]:mb-4 [&_p]:leading-relaxed [&_blockquote]:border-l-4 [&_blockquote]:border-brand-red [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_ul]:ml-6 [&_ul]:mb-4 [&_ol]:ml-6 [&_ol]:mb-4 [&_hr]:border-gray-200 [&_hr]:my-6 [&_a]:text-red-600 [&_a]:underline [&_a:hover]:text-red-800 [&_img]:rounded-lg [&_img[data-layout=default]]:max-w-full [&_img[data-layout=default]]:my-4 [&_img[data-layout=featured_top]]:my-8 [&_img[data-layout=featured_top]]:block [&_img[data-layout=featured_top]]:w-full [&_img[data-layout=featured_top]]:max-w-none [&_img[data-layout=featured_top]]:aspect-video [&_img[data-layout=featured_top]]:object-cover [&_img[data-layout=featured_top]]:rounded-xl [&_img[data-layout=center_large]]:my-8 [&_img[data-layout=center_large]]:block [&_img[data-layout=center_large]]:w-full [&_img[data-layout=center_large]]:max-w-4xl [&_img[data-layout=center_large]]:mx-auto [&_img[data-layout=center_large]]:max-h-[min(70vh,720px)] [&_img[data-layout=center_large]]:object-cover [&_img[data-layout=center_large]]:rounded-xl [&_img[data-layout=right_wrap]]:my-4 [&_img[data-layout=right_wrap]]:mx-auto [&_img[data-layout=right_wrap]]:block [&_img[data-layout=right_wrap]]:w-full [&_img[data-layout=right_wrap]]:max-w-md [&_img[data-layout=right_wrap]]:rounded-lg [&_img[data-layout=right_wrap]]:object-cover sm:[&_img[data-layout=right_wrap]]:float-right sm:[&_img[data-layout=right_wrap]]:ml-4 sm:[&_img[data-layout=right_wrap]]:mb-2 sm:[&_img[data-layout=right_wrap]]:mt-1 sm:[&_img[data-layout=right_wrap]]:w-[min(100%,20rem)] sm:[&_img[data-layout=right_wrap]]:max-w-none'

export const BlogImage = Image.extend({
  name: 'image',

  addAttributes() {
    return {
      ...this.parent?.(),
      layout: {
        default: 'default' as BlogImageLayout,
        parseHTML: (element) => {
          const v = element.getAttribute('data-layout')
          if (v === 'center_large' || v === 'right_wrap' || v === 'featured_top') return v
          return 'default'
        },
        renderHTML: (attributes) => {
          const layout = attributes.layout as BlogImageLayout | undefined
          if (!layout || layout === 'default') {
            return { 'data-layout': 'default' }
          }
          return { 'data-layout': layout }
        },
      },
    }
  },
})
