'use client'

import NextImage from 'next/image'
import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react'
import type { BlogImageLayout } from '@/lib/blog/blog-image-extension'
import { cn } from '@/lib/utils'

/** Vertical rhythm for blog images (wrapper-based so spacing works with next/image DOM). */
const OUTER_SPACING: Record<BlogImageLayout, string> = {
  default: 'mt-10 mb-12 md:mt-11 md:mb-14',
  featured_top: 'my-16 md:my-20',
  center_large: 'my-16 md:my-20',
  right_wrap: 'max-sm:my-10 sm:mt-1 sm:mb-0',
}

/** Display widths passed to `sizes` so Next.js picks smaller srcset entries than full-resolution uploads. */
const LAYOUT_SIZES: Record<BlogImageLayout, string> = {
  default: '(max-width: 640px) 100vw, 720px',
  featured_top: '(max-width: 1280px) 100vw, min(1200px, 100vw)',
  center_large: '(max-width: 1024px) 100vw, min(880px, 92vw)',
  right_wrap: '(max-width: 640px) 100vw, min(320px, 22rem)',
}

/** Intrinsic dimensions for layout stability; visual size comes from CSS + sizes. */
const INTRINSIC = { width: 1200, height: 800 }

function canUseNextImage(src: string): boolean {
  if (!src || src.startsWith('data:')) return false
  try {
    const url = new URL(src, 'https://citizenready.local')
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export function BlogImageNodeView(props: ReactNodeViewProps) {
  const { node } = props
  const src = node.attrs.src as string
  const alt = ((node.attrs.alt as string) || '').trim()
  const title = (node.attrs.title as string | undefined) || undefined
  const layout = ((node.attrs.layout as BlogImageLayout) || 'default') as BlogImageLayout

  if (!src) {
    return null
  }

  const sizes = LAYOUT_SIZES[layout]
  const optimizable = canUseNextImage(src)

  if (!optimizable) {
    return (
      <NodeViewWrapper className={cn('block w-full', OUTER_SPACING[layout])}>
        {/* Fallback for data URLs or malformed src */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          title={title}
          data-layout={layout}
          className="h-auto w-full rounded-lg"
        />
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper className={cn('block w-full', OUTER_SPACING[layout])}>
      <NextImage
        src={src}
        alt={alt || ''}
        title={title}
        width={INTRINSIC.width}
        height={INTRINSIC.height}
        sizes={sizes}
        quality={70}
        className="h-auto w-full"
        data-layout={layout}
      />
    </NodeViewWrapper>
  )
}
