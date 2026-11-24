import type { PhotoSrc, Sport } from '../types'

type PhotoProps = {
  src: PhotoSrc
  alt: string
  className?: string
}

/*
 * Renders a user-uploaded photo (data URL) or one of the generated
 * illustrations used for fictional profiles. Illustrations are abstract on
 * purpose: they must never look like photos of real people.
 */
/** Decorative images (empty alt) are hidden from assistive tech; others are labeled. */
function svgA11y(alt: string) {
  return alt ? { role: 'img', 'aria-label': alt } : { 'aria-hidden': true }
}

export function Photo({ src, alt, className = '' }: PhotoProps) {
  if (src.startsWith('art:avatar:')) {
    const [, , hue, initial] = src.split(':')
    return <AvatarArt hue={Number(hue)} initial={initial ?? '?'} alt={alt} className={className} />
  }
  if (src.startsWith('art:scene:')) {
    const [, , sport, variant] = src.split(':')
    return (
      <SceneArt
        sport={sport as Sport}
        variant={Number(variant) || 0}
        alt={alt}
        className={className}
      />
    )
  }
  return <img src={src} alt={alt} className={`object-cover ${className}`} draggable={false} />
}

function AvatarArt({
  hue,
  initial,
  alt,
  className,
}: {
  hue: number
  initial: string
  alt: string
  className: string
}) {
  const id = `av-${hue}-${initial}`
  return (
    <svg
      viewBox="0 0 400 500"
      preserveAspectRatio="xMidYMid slice"
      {...svgA11y(alt)}
      className={className}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={`hsl(${hue} 70% 82%)`} />
          <stop offset="1" stopColor={`hsl(${(hue + 40) % 360} 55% 62%)`} />
        </linearGradient>
      </defs>
      <rect width="400" height="500" fill={`url(#${id})`} />
      <circle cx="330" cy="90" r="120" fill="white" opacity="0.18" />
      <circle cx="60" cy="440" r="160" fill="white" opacity="0.12" />
      <path
        d="M0 360 Q100 300 200 340 T400 320 V500 H0Z"
        fill={`hsl(${hue} 45% 40%)`}
        opacity="0.18"
      />
      <text
        x="200"
        y="300"
        textAnchor="middle"
        fontFamily="Barlow Condensed, sans-serif"
        fontWeight="700"
        fontSize="220"
        fill="white"
        opacity="0.92"
      >
        {initial}
      </text>
    </svg>
  )
}

const SKIES: [string, string, string][] = [
  // [top, bottom, sun]
  ['hsl(28 90% 78%)', 'hsl(12 80% 86%)', 'hsl(40 100% 92%)'], // sunrise
  ['hsl(200 70% 78%)', 'hsl(195 60% 92%)', 'hsl(50 100% 92%)'], // clear day
  ['hsl(330 50% 70%)', 'hsl(25 85% 80%)', 'hsl(45 100% 88%)'], // dusk
  ['hsl(215 45% 62%)', 'hsl(200 40% 84%)', 'hsl(0 0% 98%)'], // overcast
  ['hsl(15 75% 72%)', 'hsl(40 90% 85%)', 'hsl(50 100% 94%)'], // golden hour
  ['hsl(170 40% 70%)', 'hsl(160 35% 88%)', 'hsl(55 100% 92%)'], // misty green
]

function SceneArt({
  sport,
  variant,
  alt,
  className,
}: {
  sport: Sport
  variant: number
  alt: string
  className: string
}) {
  const [top, bottom, sun] = SKIES[variant % SKIES.length]
  const id = `sc-${sport}-${variant}`
  return (
    <svg
      viewBox="0 0 400 500"
      preserveAspectRatio="xMidYMid slice"
      {...svgA11y(alt)}
      className={className}
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
        <linearGradient id={`${id}-water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="hsl(192 70% 62%)" />
          <stop offset="1" stopColor="hsl(205 70% 42%)" />
        </linearGradient>
      </defs>
      {sport === 'swim' && variant % 2 === 0 ? (
        <PoolScene id={id} />
      ) : (
        <>
          <rect width="400" height="500" fill={`url(#${id}-sky)`} />
          <circle
            cx={90 + variant * 40}
            cy={120 + (variant % 3) * 20}
            r="46"
            fill={sun}
            opacity="0.95"
          />
          {sport === 'run' && <RunScene variant={variant} />}
          {sport === 'ride' && <RideScene variant={variant} />}
          {sport === 'swim' && <OpenWaterScene id={id} />}
        </>
      )}
    </svg>
  )
}

function RunScene({ variant }: { variant: number }) {
  const g = 110 + (variant % 3) * 15
  return (
    <>
      <path d="M0 300 Q90 250 190 285 T400 265 V500 H0Z" fill={`hsl(${g} 30% 62%)`} />
      <path d="M0 350 Q120 310 230 345 T400 330 V500 H0Z" fill={`hsl(${g} 35% 48%)`} />
      <path
        d="M170 500 C190 430 230 390 215 345 L225 345 C250 395 230 440 260 500Z"
        fill="hsl(35 35% 80%)"
      />
      {[40, 75, 320, 355].map((x, i) => (
        <g key={x} transform={`translate(${x} ${330 + (i % 2) * 12})`}>
          <rect x="-3" y="0" width="6" height="26" fill="hsl(25 30% 30%)" />
          <circle cx="0" cy="-8" r={18 + (i % 2) * 4} fill={`hsl(${g + 10} 40% 32%)`} />
        </g>
      ))}
    </>
  )
}

function RideScene({ variant }: { variant: number }) {
  const m = 220 + (variant % 3) * 10
  return (
    <>
      <path
        d="M0 290 L80 200 L150 270 L240 170 L330 260 L400 220 V500 H0Z"
        fill={`hsl(${m} 20% 60%)`}
      />
      <path d="M0 320 Q100 280 200 310 T400 300 V500 H0Z" fill="hsl(95 30% 52%)" />
      <path d="M195 300 L205 300 L330 500 L70 500Z" fill="hsl(220 8% 35%)" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={199 - i * 0.6}
          y={315 + i * 38}
          width={2 + i * 1.2}
          height={14 + i * 6}
          fill="hsl(48 90% 80%)"
        />
      ))}
    </>
  )
}

function PoolScene({ id }: { id: string }) {
  return (
    <>
      <rect width="400" height="500" fill={`url(#${id}-water)`} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={i * 90 + 40}
          y="0"
          width="10"
          height="500"
          fill="hsl(215 70% 30%)"
          opacity="0.35"
        />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          {Array.from({ length: 25 }, (_, k) => (
            <circle
              key={k}
              cx={i * 90 + 90}
              cy={k * 20 + 10}
              r="5"
              fill={k % 5 === 0 ? 'hsl(0 75% 60%)' : 'hsl(0 0% 98%)'}
            />
          ))}
        </g>
      ))}
      {[80, 220, 360].map((y) => (
        <path
          key={y}
          d={`M0 ${y} q50 -14 100 0 t100 0 t100 0 t100 0`}
          stroke="white"
          strokeWidth="3"
          fill="none"
          opacity="0.25"
        />
      ))}
    </>
  )
}

function OpenWaterScene({ id }: { id: string }) {
  return (
    <>
      <rect y="270" width="400" height="230" fill={`url(#${id}-water)`} />
      <path d="M0 270 L400 270 L400 255 Q300 240 220 258 T0 250Z" fill="hsl(100 25% 45%)" />
      {[300, 340, 385, 430, 470].map((y, i) => (
        <path
          key={y}
          d={`M${-20 + (i % 2) * 30} ${y} q30 -10 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0`}
          stroke="white"
          strokeWidth="3"
          fill="none"
          opacity="0.35"
        />
      ))}
      <circle cx="290" cy="330" r="12" fill="hsl(25 95% 60%)" />
    </>
  )
}
