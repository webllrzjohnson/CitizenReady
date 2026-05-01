type AdFormat = 'auto' | 'rectangle' | 'leaderboard' | 'sidebar'

const formatHeights: Record<AdFormat, string> = {
  auto: 'h-24',
  rectangle: 'h-64',
  leaderboard: 'h-24',
  sidebar: 'h-[600px]',
}

interface AdPlaceholderProps {
  format?: AdFormat
  className?: string
}

export function AdPlaceholder({ format = 'auto', className }: AdPlaceholderProps) {
  const heightClass = formatHeights[format]

  return (
    <div
      className={`flex w-full items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 ${heightClass} ${className ?? ''}`}
      aria-label="Advertisement placeholder"
    >
      <span className="select-none text-xs font-medium uppercase tracking-widest text-gray-400">
        Advertisement
      </span>
    </div>
  )
}
