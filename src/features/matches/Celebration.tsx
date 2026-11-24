import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { CalendarHeart, MapPin } from 'lucide-react'
import { useAppStore } from '../../store/store'
import { Photo } from '../../components/Photo'
import { KudosIcon, SportBadge, SPORT_LABEL } from '../../components/icons'
import { ROUTES } from '../../data/routes'
import { sharedSports, suggestFirstDate } from '../../lib/matching'
import { formatDistance, paceUnit, roundDistanceM } from '../../lib/units'
import { formatPaceValue } from '../../lib/pace'

/** Full-screen "It's a match" moment, shown whenever a match is created. */
export function Celebration() {
  const navigate = useNavigate()
  const id = useAppStore((s) => s.celebration)
  const me = useAppStore((s) => s.me)
  const athlete = useAppStore((s) => s.athletes.find((a) => a.id === id))
  const activities = useAppStore((s) => s.activities)
  const units = useAppStore((s) => s.units)
  const dismiss = useAppStore((s) => s.dismissCelebration)
  const ref = useRef<HTMLDialogElement>(null)
  const open = !!(id && me && athlete)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  const keepSwiping = () => {
    dismiss()
    navigate('/discover')
  }

  if (!open) return <dialog ref={ref} className="hidden" aria-hidden />

  const shared = sharedSports(me, athlete)
  const date = suggestFirstDate(me, athlete, activities, ROUTES)

  return (
    <dialog
      ref={ref}
      aria-labelledby="celebrate-title"
      onCancel={(e) => {
        e.preventDefault()
        keepSwiping()
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto bg-celebrate-deep p-0 text-white backdrop:bg-ink/60"
    >
      <div className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center px-6 py-10 text-center">
        <div className="relative flex h-40 w-64 items-center justify-center" aria-hidden>
          <div className="absolute left-2 size-36 animate-pop overflow-hidden rounded-full ring-4 ring-white shadow-lift">
            <Photo src={me.photos[0]} alt="" className="size-full" />
          </div>
          <div
            className="absolute right-2 size-36 animate-pop overflow-hidden rounded-full ring-4 ring-white shadow-lift"
            style={{ animationDelay: '120ms' }}
          >
            <Photo src={athlete.photos[0]} alt="" className="size-full" />
          </div>
          <span
            className="absolute z-10 flex size-14 animate-pop items-center justify-center rounded-full bg-surface text-primary-strong shadow-lift"
            style={{ animationDelay: '260ms' }}
          >
            <KudosIcon filled className="size-8" />
          </span>
        </div>

        <h2
          id="celebrate-title"
          className="mt-6 font-display text-6xl leading-none font-bold uppercase"
        >
          It’s a match!
        </h2>
        <p className="mt-2 text-lg">You and {athlete.firstName} are in the same zone.</p>

        {shared.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="sr-only">Shared sports:</span>
            {shared.map((s) => (
              <SportBadge key={s} sport={s} />
            ))}
          </div>
        )}

        <div className="mt-6 w-full rounded-card bg-surface p-5 text-left text-ink shadow-lift">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-primary-pressed uppercase">
            <CalendarHeart className="size-4" aria-hidden /> Suggested first date
          </p>
          <p className="mt-2 font-display text-3xl leading-tight font-bold">
            {formatDistance(roundDistanceM(date.distanceM, date.sport, units), date.sport, units)}{' '}
            {SPORT_LABEL[date.sport].toLowerCase()}
          </p>
          <p className="text-muted">
            at {formatPaceValue(date.sport, date.pace, units)}
            {date.sport === 'ride' ? ' ' : ''}
            {paceUnit(date.sport, units)}, an easy pace for both of you
          </p>
          {date.route && (
            <p className="mt-2 flex items-center gap-1.5 text-sm">
              <MapPin className="size-4 text-muted" aria-hidden /> {date.route.name}
            </p>
          )}
        </div>

        <div className="mt-8 flex w-full flex-col gap-3">
          <button
            type="button"
            autoFocus
            onClick={() => {
              dismiss()
              navigate(`/matches/${athlete.id}`)
            }}
            className="h-14 rounded-full bg-surface text-lg font-semibold text-primary-pressed shadow-lift hover:bg-cream"
          >
            Send a message
          </button>
          <button
            type="button"
            onClick={keepSwiping}
            className="h-14 rounded-full border-2 border-white/80 text-lg font-semibold text-white hover:bg-white/10"
          >
            Keep swiping
          </button>
        </div>
      </div>
    </dialog>
  )
}
