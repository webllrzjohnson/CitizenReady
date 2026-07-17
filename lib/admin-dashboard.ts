export function formatAdminDashboardCount(value: number): string {
  if (!Number.isFinite(value)) return '0'
  const normalized = Math.max(0, Math.floor(value))
  if (normalized < 1000) return String(normalized)
  const compact = normalized / 1000
  return `${Number.isInteger(compact) ? compact.toFixed(0) : compact.toFixed(1)}k`
}
