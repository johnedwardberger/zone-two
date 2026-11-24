import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import type { Activity, Athlete, Units } from '../../types'
import { Photo } from '../../components/Photo'
import { SportBadge } from '../../components/icons'
import { ActivityMetrics } from '../../components/ActivityMetrics'
import { ageOn, coarseWhen, todayISO } from '../../lib/dates'
import { CITIES, cityName } from '../../data/seed'
import { cityDistanceKm, roundedDistanceLabel } from '../../lib/geo'
import { SPORT_LABEL } from '../../components/icons'

export type SwipeDir = 'left' | 'right'
export type SwipeCardHandle = { fling: (dir: SwipeDir) => void }

const THRESHOLD = 110
const FLING_MS = 280

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** One Discover card. The top card is draggable; others are static previews. */
export const SwipeCard = forwardRef<
  SwipeCardHandle,
  {
    athlete: Athlete
    activity: Activity
    myCityId: string
    units: Units
    depth: number
    onSwipe: (dir: SwipeDir) => void
    onOpen: () => void
  }
>(function SwipeCard({ athlete, activity, myCityId, units, depth, onSwipe, onOpen }, ref) {
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null)
  const [leaving, setLeaving] = useState<SwipeDir | null>(null)
  const start = useRef<{ x: number; y: number; t: number; id: number } | null>(null)
  const moved = useRef(false)
  const interactive = depth === 0

  function fling(dir: SwipeDir) {
    if (leaving) return
    setLeaving(dir)
    window.setTimeout(() => onSwipe(dir), prefersReducedMotion() ? 0 : FLING_MS)
  }
  useImperativeHandle(ref, () => ({ fling }))

  const today = todayISO()
  const age = ageOn(athlete.birthDate, today)
  const distance = roundedDistanceLabel(cityDistanceKm(CITIES, myCityId, athlete.cityId), units)
  const photo = activity.photos[0] ?? athlete.photos[0]

  const dx = leaving ? (leaving === 'right' ? 1 : -1) * window.innerWidth * 1.2 : (drag?.x ?? 0)
  const dy = leaving ? (drag?.y ?? 0) + 40 : (drag?.y ?? 0)
  const rotate = dx / 18
  const kudosOpacity = Math.min(1, Math.max(0, dx / 100))
  const passOpacity = Math.min(1, Math.max(0, -dx / 100))

  const style: React.CSSProperties = interactive
    ? {
        transform: `translate(${dx}px, ${dy}px) rotate(${rotate}deg)`,
        transition:
          drag && !leaving ? 'none' : `transform ${FLING_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
      }
    : {
        transform: `translateY(${depth * 14}px) scale(${1 - depth * 0.05})`,
        transition: 'transform 300ms ease',
      }

  return (
    <article
      aria-hidden={!interactive}
      className={`absolute inset-0 touch-pan-y overflow-hidden rounded-[1.75rem] bg-ink text-white shadow-lift select-none ${interactive ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
      style={{ ...style, zIndex: 10 - depth }}
      onPointerDown={(e) => {
        if (!interactive || leaving || (e.pointerType === 'mouse' && e.button !== 0)) return
        start.current = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId }
        moved.current = false
        e.currentTarget.setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        const s = start.current
        if (!s || s.id !== e.pointerId) return
        const x = e.clientX - s.x
        const y = e.clientY - s.y
        if (Math.abs(x) > 6 || Math.abs(y) > 6) moved.current = true
        setDrag({ x, y: y * 0.3 })
      }}
      onPointerUp={(e) => {
        const s = start.current
        start.current = null
        if (!s) return
        const x = e.clientX - s.x
        const velocity = Math.abs(x) / Math.max(1, performance.now() - s.t)
        if (!moved.current) {
          setDrag(null)
          onOpen()
        } else if (Math.abs(x) > THRESHOLD || (velocity > 0.6 && Math.abs(x) > 40)) {
          fling(x > 0 ? 'right' : 'left')
        } else {
          setDrag(null)
        }
      }}
      onPointerCancel={() => {
        start.current = null
        setDrag(null)
      }}
    >
      <Photo
        src={photo}
        alt={`${activity.title}, ${SPORT_LABEL[activity.sport].toLowerCase()} photo`}
        className="absolute inset-0 size-full"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-transparent via-35% to-ink/90" />

      {interactive && (
        <>
          <span
            className="absolute top-8 left-6 -rotate-12 rounded-xl border-4 border-white bg-primary-strong/80 px-3 py-1 font-display text-4xl font-bold tracking-widest text-white"
            style={{ opacity: kudosOpacity }}
            aria-hidden
          >
            KUDOS
          </span>
          <span
            className="absolute top-8 right-6 rotate-12 rounded-xl border-4 border-white bg-ink/70 px-3 py-1 font-display text-4xl font-bold tracking-widest text-white"
            style={{ opacity: passOpacity }}
            aria-hidden
          >
            PASS
          </span>
        </>
      )}

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <Photo
            src={athlete.photos[0]}
            alt=""
            className="size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-white/80"
          />
          <div className="min-w-0">
            <h2 className="font-display text-3xl leading-none font-bold">
              {athlete.firstName}, {age}
            </h2>
            <p className="mt-1 truncate text-sm text-white/90">
              {cityName(athlete.cityId)}
              {distance && ` · ${distance}`}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <SportBadge sport={activity.sport} />
          <span className="text-sm text-white/90">
            {coarseWhen(activity.date, activity.timeOfDay, today)}
          </span>
        </div>
        <p className="mt-2 text-lg font-semibold">{activity.title}</p>
        <div className="mt-3">
          <ActivityMetrics activity={activity} units={units} tone="light" />
        </div>
      </div>
    </article>
  )
})
