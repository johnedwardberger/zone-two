import { Link } from 'react-router'
import { CalendarHeart, Check, Clock, Gauge, MapPin, Route as RouteIcon } from 'lucide-react'
import type { Athlete, DateProposal, Units } from '../../types'
import { SportBadge } from '../../components/icons'
import { useAppStore } from '../../store/store'
import { routeById } from '../../data/routes'
import { dayLabel, todayISO } from '../../lib/dates'
import { formatDistance, paceUnit } from '../../lib/units'
import { formatPaceValue } from '../../lib/pace'

const TOD: Record<DateProposal['timeOfDay'], string> = {
  morning: 'morning',
  afternoon: 'afternoon',
  evening: 'evening',
}

/** Styled "Date proposal" card shown inside a chat thread. */
export function ProposalCard({
  proposal: p,
  mine,
  other,
  units,
  messageId,
}: {
  proposal: DateProposal
  mine: boolean
  other: Athlete
  units: Units
  messageId: string
}) {
  const route = routeById(p.routeId)
  const accept = useAppStore((s) => s.proposalAccepted)
  const accepted = p.status === 'accepted'
  return (
    <div className="w-[min(20rem,80vw)] overflow-hidden rounded-3xl bg-surface text-ink shadow-card ring-1 ring-hairline">
      <div className="flex items-center gap-2 bg-celebrate-soft px-4 py-3">
        <CalendarHeart className="size-5 text-primary-pressed" aria-hidden />
        <p className="font-display text-xl font-bold tracking-wide uppercase">Workout date</p>
        <SportBadge sport={p.sport} className="ml-auto" />
      </div>
      <dl className="space-y-2.5 px-4 py-4 text-[15px]">
        <div className="flex gap-2.5">
          <dt className="sr-only">Where</dt>
          <MapPin className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
          <dd>
            <span className="font-semibold">{route ? route.name : p.customSpot}</span>
            {route && <span className="block text-sm text-muted">Meet: {route.meetingPoint}</span>}
          </dd>
        </div>
        <div className="flex gap-2.5">
          <dt className="sr-only">When</dt>
          <Clock className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
          <dd>
            {dayLabel(p.day, todayISO())}, {TOD[p.timeOfDay]}
          </dd>
        </div>
        <div className="flex gap-2.5">
          <dt className="sr-only">Distance</dt>
          <RouteIcon className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
          <dd>{formatDistance(p.distanceM, p.sport, units)}</dd>
        </div>
        <div className="flex gap-2.5">
          <dt className="sr-only">Target {p.sport === 'ride' ? 'speed' : 'pace'}</dt>
          <Gauge className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
          <dd>
            {formatPaceValue(p.sport, p.pace, units)}
            {p.sport === 'ride' ? ' ' : ''}
            {paceUnit(p.sport, units)} target {p.sport === 'ride' ? 'speed' : 'pace'}
          </dd>
        </div>
      </dl>
      <div className="border-t border-hairline px-4 py-3">
        {accepted ? (
          <p className="flex items-center gap-2 font-semibold text-success">
            <Check className="size-5" aria-hidden />{' '}
            {mine ? `${other.firstName} accepted` : 'You accepted'}. It’s a date!
          </p>
        ) : mine ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted">Waiting for {other.firstName}…</p>
            <Link
              to={`/matches/${other.id}/plan?edit=${messageId}`}
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-primary-strong hover:bg-primary-soft"
            >
              Suggest changes
            </Link>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => accept(other.id, messageId)}
              className="h-10 flex-1 rounded-full bg-primary-strong text-sm font-semibold text-white"
            >
              Accept
            </button>
            <Link
              to={`/matches/${other.id}/plan`}
              className="flex h-10 flex-1 items-center justify-center rounded-full border border-hairline text-sm font-semibold"
            >
              Suggest changes
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
