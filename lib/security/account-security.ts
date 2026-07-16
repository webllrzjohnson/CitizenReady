export function hasCurrentPassword(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0
}
