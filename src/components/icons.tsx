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
  strokeWidth = 1.8,
}: {
  filled?: boolean
  className?: string
  strokeWidth?: number
}) {
  const leaves: [number, number, number][] = [
    [6.3, 17.2, -50],
    [4.6, 13.4, -25],
    [4.5, 9.4, 0],
    [5.6, 5.8, 20],
  ]
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
          <path d="M10.5 20.5C6.6 19.4 4.2 15.6 4.8 9.6C5 7.7 5.6 6 6.6 4.5" />
          {leaves.map(([x, y, r]) => (
            <ellipse
              key={`${x}-${y}`}
              cx={x - 1.6}
              cy={y}
              rx="1.25"
              ry="2.2"
              transform={`rotate(${r} ${x - 1.6} ${y})`}
              fill={filled ? 'currentColor' : 'none'}
            />
          ))}
        </g>
      ))}
      <path
        d="M12 6.2l.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z"
        fill={filled ? 'currentColor' : 'none'}
        strokeWidth={strokeWidth * 0.8}
      />
    </svg>
  )
}
