import Image from 'next/image'

type StudyFlagFigureProps = {
  /** Human-readable jurisdiction or “Canada” for alt text. */
  name: string
  /** File name without extension under `/public/flags/`. */
  imageKey: string
  /** Layout size variant. */
  size?: 'md' | 'lg'
}

const maxWidthClass = {
  md: 'max-w-xs sm:max-w-sm',
  lg: 'max-w-md sm:max-w-lg',
} as const

/**
 * Renders a flag from `/public/flags/{imageKey}.svg` (Wikimedia Commons–sourced SVGs).
 * SVGs use `unoptimized` because Next image optimization skips vector by default.
 */
export function StudyFlagFigure({ name, imageKey, size = 'md' }: StudyFlagFigureProps) {
  const label = name === 'Canada' ? 'National Flag of Canada' : `Flag of ${name}`
  return (
    <figure className={`relative mx-auto mt-6 mb-12 w-full ${maxWidthClass[size]}`}>
      <div className="relative aspect-[2/1] w-full overflow-hidden rounded-md border border-border/80 bg-muted/40 shadow-sm dark:bg-muted/20">
        <Image
          src={`/flags/${imageKey}.svg`}
          alt={label}
          fill
          sizes={size === 'lg' ? '(max-width: 640px) 100vw, 28rem' : '(max-width: 640px) 100vw, 20rem'}
          className="object-contain object-center p-2"
          priority={size === 'lg'}
          unoptimized
        />
      </div>
    </figure>
  )
}
