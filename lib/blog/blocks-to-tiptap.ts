export type AiBlogBlock = {
  type?: string
  text?: string
  src?: string
  alt?: string
  layout?: string
}

export type TiptapDoc = {
  type: 'doc'
  content: Record<string, unknown>[]
}

export function slugifyAiSlug(s: string): string {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

/** Map Claude block list to a TipTap JSON document. */
export function blocksToTiptap(blocks: AiBlogBlock[] | undefined): TiptapDoc {
  const content: Record<string, unknown>[] = []

  for (const b of blocks || []) {
    if (!b || !b.type) continue
    const t = String(b.text || '').trim()
    if (!t && b.type !== 'paragraph') continue

    if (b.type === 'h1') {
      content.push({
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: t }],
      })
    } else if (b.type === 'h2') {
      content.push({
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: t }],
      })
    } else if (b.type === 'h3') {
      content.push({
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: t }],
      })
    } else if (b.type === 'paragraph') {
      content.push({
        type: 'paragraph',
        content: t ? [{ type: 'text', text: t }] : [],
      })
    } else if (b.type === 'image' && b.src) {
      content.push({
        type: 'image',
        attrs: {
          src: String(b.src),
          alt: b.alt ? String(b.alt) : null,
          title: null,
          layout: b.layout || 'center_large',
        },
      })
    }
  }

  return { type: 'doc', content }
}
