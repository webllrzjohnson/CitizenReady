function collectText(node: unknown): string {
  if (node === null || typeof node !== 'object') return ''
  const n = node as Record<string, unknown>
  if (n.type === 'text' && typeof n.text === 'string') {
    return n.text
  }
  const content = n.content
  if (!Array.isArray(content)) return ''
  return content.map((c) => collectText(c)).join(' ')
}

export function plainTextFromTiptap(content: Record<string, unknown>): string {
  return collectText(content).replace(/\s+/g, ' ').trim()
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
