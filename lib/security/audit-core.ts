const SECRET_PATTERNS = [/secret/i, /token/i, /password/i, /key/i, /^sk_/i]

export function redactAuditValue(value: unknown): unknown {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  if (!trimmed) return trimmed
  if (SECRET_PATTERNS.some((pattern) => pattern.test(trimmed))) return '[REDACTED]'

  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
    const [local, domain] = trimmed.toLowerCase().split('@')
    return `${local[0] ?? '*'}***@${domain}`
  }

  return trimmed
}

export function buildAdminAuditMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => [key, redactAuditValue(value)]),
  )
}
