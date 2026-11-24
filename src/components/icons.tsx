import { useId } from 'react'
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
 * Zone Two's Pulse mark: a single heartbeat spike inside a circle, echoing
 * the logo's heart-rate line (deliberately not a heart or a thumbs-up).
 * Filled state is a solid disc with the beat cut out, so it reads on any
 * background.
 */
export function PulseIcon({
  filled = false,
  className = 'size-6',
  strokeWidth = 1.8,
}: {
  filled?: boolean
  className?: string
  strokeWidth?: number
}) {
  const maskId = useId()
  const beat = 'M4.6 12.4h3.1l1.7-4.3 2.9 8.6 2.1-6.2 1.2 1.9h3.8'
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
      {filled ? (
        <>
          <mask id={maskId}>
            <rect width="24" height="24" fill="white" />
            <path d={beat} stroke="black" strokeWidth={strokeWidth * 1.1} />
          </mask>
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="currentColor"
            stroke="none"
            mask={`url(#${maskId})`}
          />
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="9.2" />
          <path d={beat} />
        </>
      )}
    </svg>
  )
}
