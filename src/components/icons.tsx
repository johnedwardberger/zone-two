import { Bike, Footprints, Waves, type LucideProps } from 'lucide-react'
import type { Sport } from '../types'

export const SPORT_LABEL: Record<Sport, string> = { run: 'Run', ride: 'Ride', swim: 'Swim' }

const SPORT_ICON = { run: Footprints, ride: Bike, swim: Waves }

export function SportIcon({ sport, ...props }: { sport: Sport } & LucideProps) {
  const Icon = SPORT_ICON[sport]
  return <Icon aria-hidden {...props} />
}

const TINT: Record<Sport, string> = {
  run: 'bg-run text-run-ink',
  ride: 'bg-ride text-ride-ink',
  swim: 'bg-swim text-swim-ink',
}

/** Sport chip with its consistent icon and tint. */
export function SportBadge({
  sport,
  showLabel = true,
  className = '',
}: {
  sport: Sport
  showLabel?: boolean
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${TINT[sport]} ${className}`}
    >
      <SportIcon sport={sport} className="size-3.5" strokeWidth={2.25} />
      {showLabel ? SPORT_LABEL[sport] : <span className="sr-only">{SPORT_LABEL[sport]}</span>}
    </span>
  )
}

/**
 * Zone Two's Kudos mark: a laurel (a nod to finish lines and podiums),
 * deliberately not a heart or a thumbs-up.
 */
export function KudosIcon({
  filled = false,
  className = 'size-6',
  strokeWidth = 1.6,
}: {
  filled?: boolean
  className?: string
  strokeWidth?: number
}) {
  // Leaves along the left branch: [x, y, rotation]; mirrored for the right.
  const leaves: [number, number, number][] = [
    [8.4, 19.4, -62],
    [6.1, 16.4, -38],
    [4.8, 12.6, -18],
    [4.7, 8.7, 2],
    [5.6, 5.2, 22],
  ]
  const leaf = 'M0 0C1.5-1.1 1.6-3.2 0-4.6C-1.6-3.2-1.5-1.1 0 0Z'
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {[1, -1].map((dir) => (
        <g key={dir} transform={dir === -1 ? 'translate(24 0) scale(-1 1)' : undefined}>
          <path d="M11.2 21.2C6.2 19.4 3.6 14.6 5.3 5.4" />
          {leaves.map(([x, y, r]) => (
            <path
              key={`${x}-${y}`}
              d={leaf}
              transform={`translate(${x} ${y}) rotate(${r})`}
              fill={filled ? 'currentColor' : 'none'}
              strokeWidth={strokeWidth * 0.85}
            />
          ))}
        </g>
      ))}
    </svg>
  )
}
