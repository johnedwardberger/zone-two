import { useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Clock, MapPin, Medal, Timer } from 'lucide-react'
import type { Activity, Athlete, Units } from '../../types'
import { SPORTS } from '../../types'
import { Photo } from '../../components/Photo'
import { PulseIcon, SportBadge, SportIcon, SPORT_LABEL } from '../../components/icons'
import { ActivityMetrics } from '../../components/ActivityMetrics'
import { Card } from '../../components/ui'
import { CITIES, cityName } from '../../data/seed'
import { ageOn, coarseWhen, todayISO } from '../../lib/dates'
import { cityDistanceKm, roundedDistanceLabel } from '../../lib/geo'
import { formatDistance } from '../../lib/units'
import { formatDuration } from '../../lib/pace'
import { trainingSnapshot } from '../../lib/stats'
import { LEVEL_LABEL } from '../onboarding/profileForm'
import { WeeklyChart } from './WeeklyChart'

/** Swipeable photo carousel (scroll-snap) with buttons and dots. */
export function PhotoCarousel({
  photos,
  name,
  aspect = 'aspect-[4/5] sm:aspect-[4/3]',
  rounded = 'rounded-card',
}: {
  photos: string[]
  name: string
  aspect?: string
  rounded?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const go = (i: number) => {
    const el = ref.current
    if (!el) return
    const next = Math.max(0, Math.min(photos.length - 1, i))
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' })
  }
  return (
    <div
      className={`relative overflow-hidden bg-hairline ${rounded}`}
      aria-roledescription="carousel"
      aria-label={`${name}’s photos`}
    >
      <div
        ref={ref}
        className={`scrollbar-none flex snap-x snap-mandatory overflow-x-auto ${aspect}`}
        tabIndex={0}
        aria-label={`${name}’s photos, scroll sideways for more`}
        onScroll={(e) => {
          const el = e.currentTarget
          setIndex(Math.round(el.scrollLeft / el.clientWidth))
        }}
      >
        {photos.map((p, i) => (
          <div
            key={i}
            className="w-full shrink-0 snap-center"
            role="group"
            aria-roledescription="slide"
            aria-label={`Photo ${i + 1} of ${photos.length}`}
          >
            <Photo src={p} alt={`${name}, photo ${i + 1}`} className="size-full" />
          </div>
        ))}
      </div>
      {photos.length > 1 && (
        <>
          <div className="absolute inset-x-0 top-2.5 flex gap-1 px-3" aria-hidden>
            {photos.map((_, i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full ${i === index ? 'bg-white' : 'bg-white/45'}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            className="absolute top-1/2 left-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-ink shadow-card disabled:opacity-0"
            aria-label="Previous photo"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index === photos.length - 1}
            className="absolute top-1/2 right-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-ink shadow-card disabled:opacity-0"
            aria-label="Next photo"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </>
      )}
    </div>
  )
}

export function ProfileHeader({
  athlete,
  myCityId,
  units,
  actions,
}: {
  athlete: Athlete
  myCityId?: string
  units: Units
  actions?: ReactNode
}) {
  const today = todayISO()
  const distance = myCityId
    ? roundedDistanceLabel(cityDistanceKm(CITIES, myCityId, athlete.cityId), units)
    : ''
  return (
    <div className="grid gap-6 desk:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] desk:items-start">
      <PhotoCarousel photos={athlete.photos} name={athlete.firstName} />
      <div>
        <h1 className="font-display text-5xl leading-none font-bold">
          {athlete.firstName}, {ageOn(athlete.birthDate, today)}
        </h1>
        <p className="mt-2 flex items-center gap-1.5 text-muted">
          <MapPin className="size-4" aria-hidden />
          {cityName(athlete.cityId)}
          {distance && ` · ${distance}`}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {athlete.sports.map((s) => (
            <SportBadge key={s} sport={s} />
          ))}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-hairline/70 px-2.5 py-1 text-xs font-semibold">
            <Medal className="size-3.5" aria-hidden /> {LEVEL_LABEL[athlete.level]}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-hairline/70 px-2.5 py-1 text-xs font-semibold">
            <Clock className="size-3.5" aria-hidden /> ~{athlete.weeklyHours} h/week
          </span>
        </div>
        {actions && <div className="mt-5">{actions}</div>}
        {athlete.bio && <p className="mt-5 text-[17px] leading-relaxed">{athlete.bio}</p>}
        {athlete.idealDate && (
          <div className="mt-5 rounded-2xl bg-celebrate-soft p-4">
            <p className="text-xs font-semibold tracking-wide text-primary-pressed uppercase">
              Ideal first date
            </p>
            <p className="mt-1">{athlete.idealDate}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function TrainingSnapshot({ activities, units }: { activities: Activity[]; units: Units }) {
  const snap = trainingSnapshot(activities, todayISO())
  const sports = SPORTS.filter((s) => snap.totals[s].count > 0)
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="font-display text-2xl font-bold uppercase">Training snapshot</h2>
      <p className="mb-5 text-sm text-muted">From activities posted on Zone Two</p>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-5">
          <div>
            <p className="text-xs font-medium text-muted">Avg weekly hours · last 4 weeks</p>
            <p className="font-display text-5xl font-bold">
              {snap.avgWeeklyHours4.toFixed(1)}
              <span className="ml-1 text-lg text-muted">h</span>
            </p>
          </div>
          {sports.length > 0 ? (
            <ul className="space-y-2">
              {sports.map((s) => (
                <li key={s} className="flex items-center gap-3">
                  <SportIcon sport={s} className="size-4 text-muted" />
                  <span className="w-12 text-sm font-medium">{SPORT_LABEL[s]}</span>
                  <span className="font-display text-xl font-bold">
                    {formatDistance(snap.totals[s].distanceM, s, units)}
                  </span>
                  <span className="text-sm text-muted">
                    · {snap.totals[s].count} {snap.totals[s].count === 1 ? 'session' : 'sessions'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No activities yet.</p>
          )}
          {snap.longest && (
            <p className="flex items-center gap-2 text-sm">
              <Timer className="size-4 text-muted" aria-hidden />
              <span className="text-muted">Longest session:</span>
              <span className="font-semibold">
                {formatDuration(snap.longest.movingTimeS)}{' '}
                {SPORT_LABEL[snap.longest.sport].toLowerCase()}
              </span>
            </p>
          )}
        </div>
        <WeeklyChart weeks={snap.weeks} />
      </div>
    </Card>
  )
}

/** A single activity in a profile list. */
export function ActivityItem({
  activity,
  units,
  pulse,
}: {
  activity: Activity
  units: Units
  /** Private Pulse control (only on others' profiles, before matching). */
  pulse?: { sent: boolean; onSend: () => void }
}) {
  return (
    <Card as="article" className="overflow-hidden">
      {activity.photos.length > 0 && (
        <div className="flex gap-0.5">
          {activity.photos.slice(0, 2).map((p, i) => (
            <Photo
              key={i}
              src={p}
              alt={`${activity.title}, photo ${i + 1}`}
              className="aspect-[16/9] min-w-0 flex-1"
            />
          ))}
        </div>
      )}
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <SportBadge sport={activity.sport} />
          <span>{coarseWhen(activity.date, activity.timeOfDay, todayISO())}</span>
        </div>
        <h3 className="mt-2 text-lg font-semibold">{activity.title}</h3>
        {activity.description && <p className="mt-1 text-muted">{activity.description}</p>}
        <div className="mt-4">
          <ActivityMetrics activity={activity} units={units} withExtras />
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs text-muted">Logged with {activity.loggedWith}</span>
          {pulse && (
            <button
              type="button"
              onClick={pulse.onSend}
              disabled={pulse.sent}
              aria-pressed={pulse.sent}
              className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${pulse.sent ? 'bg-primary-soft text-primary-pressed' : 'border border-hairline bg-surface text-ink hover:border-primary hover:text-primary-strong'}`}
            >
              <PulseIcon filled={pulse.sent} className="size-5" />
              {pulse.sent ? 'Pulse sent' : 'Send a Pulse'}
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}
