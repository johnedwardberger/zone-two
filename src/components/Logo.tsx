type LogoProps = {
  className?: string
  /** Render the heart-rate line mark only (for tight spaces). */
  markOnly?: boolean
}

/** Zone Two wordmark: a heart-rate line that settles into a steady "zone two" rhythm. */
export function Logo({ className = 'h-8', markOnly = false }: LogoProps) {
  const mark = (
    <path
      d="M2 20 H10 L14 10 L19 30 L24 14 L27 20 H40"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )

  if (markOnly) {
    return (
      <svg
        viewBox="0 0 42 40"
        className={`text-primary ${className}`}
        role="img"
        aria-label="Zone Two"
      >
        {mark}
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 172 40" className={className} role="img" aria-label="Zone Two">
      <g className="text-primary">{mark}</g>
      <text
        x="48"
        y="30"
        className="fill-ink font-display"
        fontSize="30"
        fontWeight="700"
        letterSpacing="0.5"
      >
        ZONE TWO
      </text>
    </svg>
  )
}
