import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Check, Hourglass, Send, X } from 'lucide-react'
import type { Athlete } from '../../types'
import { useAppStore } from '../../store/store'
import { useDerived } from '../../store/hooks'
import {
  athleteById,
  pendingOutgoing,
  selectIncomingRequests,
  selectMatchedAthletes,
  selectMutuals,
} from '../../store/selectors'
import { Button, Card, FictionalNote, Page, PageHeader } from '../../components/ui'
import { Photo } from '../../components/Photo'
import { PulseIcon, SportBadge } from '../../components/icons'
import { ageOn, chatTime, todayISO } from '../../lib/dates'
import { cityName } from '../../data/seed'
import { ProBanner } from '../pro/ProBanner'
import { RequestMatchDialog } from './RequestMatchDialog'

function Avatar({ athlete, className = 'size-14' }: { athlete: Athlete; className?: string }) {
  return (
    <span className={`block shrink-0 overflow-hidden rounded-full bg-hairline ${className}`}>
      <Photo src={athlete.photos[0]} alt="" className="size-full" />
    </span>
  )
}

export function MatchesPage() {
  const core = useDerived((s) => s)
  const requests = useDerived(selectIncomingRequests)
  const mutuals = useDerived(selectMutuals)
  const matched = useDerived(selectMatchedAthletes)
  const respond = useAppStore((s) => s.respondToRequest)
  const markRead = useAppStore((s) => s.markNotificationsRead)
  const mutualNotes = useAppStore((s) => s.notifications)
  const [requestTo, setRequestTo] = useState<Athlete | null>(null)
  const today = todayISO()
  const [now] = useState(() => Date.now())
  const typingMap = useAppStore((s) => s.typing)

  // Visiting Matches clears the tab badge (but keeps "New" chips this visit).
  const [unreadMutual] = useState(
    () =>
      new Set(mutualNotes.filter((n) => n.kind === 'mutual' && !n.read).map((n) => n.athleteId)),
  )
  useEffect(() => {
    markRead()
  }, [markRead, mutualNotes.length])

  const withThreads = matched
    .map((m) => ({ ...m, thread: core.messages[m.athlete.id] ?? [] }))
    .filter((m) => m.thread.length > 0)
    .sort((a, b) => b.thread[b.thread.length - 1].at - a.thread[a.thread.length - 1].at)
  const newMatches = matched.filter((m) => !core.messages[m.athlete.id]?.length)

  const empty = !requests.length && !mutuals.length && !matched.length

  return (
    <Page>
      <PageHeader title="Matches" />

      {empty && (
        <Card className="mb-6 p-8 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary-strong">
            <PulseIcon className="size-7" />
          </span>
          <h2 className="mt-4 font-display text-2xl font-bold uppercase">No matches yet</h2>
          <p className="mt-2 text-muted">
            Send a Pulse in Discover. When it’s mutual, you can send a match request.
          </p>
          <Link
            to="/discover"
            className="mt-4 inline-block font-semibold text-primary-strong underline-offset-4 hover:underline"
          >
            Go to Discover
          </Link>
        </Card>
      )}

      {requests.length > 0 && (
        <section aria-labelledby="requests" className="mb-8">
          <h2 id="requests" className="mb-3 flex items-center gap-2 text-lg font-semibold">
            Match requests
            <span className="rounded-full bg-primary-strong px-2 py-0.5 text-xs font-bold text-white">
              {requests.length}
            </span>
          </h2>
          <ul className="space-y-3">
            {requests.map((r) => {
              const a = athleteById(core, r.fromId)
              if (!a) return null
              return (
                <Card as="li" key={r.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <Link to={`/athlete/${a.id}`} aria-label={`Open ${a.firstName}’s profile`}>
                      <Avatar athlete={a} className="size-16" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">
                        <Link to={`/athlete/${a.id}`} className="hover:underline">
                          {a.firstName}, {ageOn(a.birthDate, today)}
                        </Link>
                      </p>
                      <p className="text-sm text-muted">{cityName(a.cityId)}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {a.sports.map((s) => (
                          <SportBadge key={s} sport={s} />
                        ))}
                      </div>
                      {r.note && (
                        <p className="mt-2 rounded-xl bg-cream px-3 py-2 text-[15px]">“{r.note}”</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Button className="flex-1" onClick={() => respond(r.id, true)}>
                      <Check className="size-4" aria-hidden /> Accept
                    </Button>
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => respond(r.id, false)}
                    >
                      <X className="size-4" aria-hidden /> Decline
                    </Button>
                  </div>
                </Card>
              )
            })}
          </ul>
        </section>
      )}

      {mutuals.length > 0 && (
        <section aria-labelledby="mutual" className="mb-8">
          <h2 id="mutual" className="mb-1 text-lg font-semibold">
            Mutual Pulse
          </h2>
          <p className="mb-3 text-sm text-muted">
            You sent each other a Pulse. Either of you can send a match request.
          </p>
          <ul className="space-y-3">
            {mutuals.map((a) => {
              const sent = !!pendingOutgoing(core, a.id)
              return (
                <Card as="li" key={a.id} className="flex items-center gap-4 p-4">
                  <Link to={`/athlete/${a.id}`} aria-label={`Open ${a.firstName}’s profile`}>
                    <Avatar athlete={a} />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-semibold">
                      <Link to={`/athlete/${a.id}`} className="hover:underline">
                        Mutual Pulse with {a.firstName}
                      </Link>
                      {unreadMutual.has(a.id) && (
                        <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary-pressed">
                          New
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted">{cityName(a.cityId)}</p>
                  </div>
                  {sent ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted">
                      <Hourglass className="size-4" aria-hidden /> Sent
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setRequestTo(a)}
                      aria-label={`Request to match with ${a.firstName}`}
                    >
                      <Send className="size-4" aria-hidden /> Request
                    </Button>
                  )}
                </Card>
              )
            })}
          </ul>
        </section>
      )}

      {newMatches.length > 0 && (
        <section aria-labelledby="new" className="mb-8">
          <h2 id="new" className="mb-3 text-lg font-semibold">
            New matches
          </h2>
          <ul className="scrollbar-none -mx-4 flex gap-4 overflow-x-auto px-4 pb-2">
            {newMatches.map(({ athlete: a }) => (
              <li key={a.id}>
                <Link
                  to={`/matches/${a.id}`}
                  className="flex w-20 flex-col items-center gap-1.5 rounded-xl p-1 text-center"
                >
                  <span className="rounded-full bg-celebrate p-[3px]">
                    <Avatar athlete={a} className="size-[4.25rem] ring-2 ring-surface" />
                  </span>
                  <span className="w-full truncate text-sm font-medium">{a.firstName}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {withThreads.length > 0 && (
        <section aria-labelledby="convos" className="mb-8">
          <h2 id="convos" className="mb-3 text-lg font-semibold">
            Conversations
          </h2>
          <Card as="div" className="overflow-hidden">
            <ul className="divide-y divide-hairline">
              {withThreads.map(({ athlete: a, thread }) => {
                const last = thread[thread.length - 1]
                const preview = last.proposal
                  ? `${last.fromId === 'me' ? 'You' : a.firstName} proposed a workout date`
                  : `${last.fromId === 'me' ? 'You: ' : ''}${last.text}`
                const typing = typingMap[a.id]
                return (
                  <li key={a.id}>
                    <Link
                      to={`/matches/${a.id}`}
                      className="flex items-center gap-4 px-4 py-3.5 hover:bg-cream"
                    >
                      <Avatar athlete={a} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="font-semibold">{a.firstName}</p>
                          <span className="shrink-0 text-xs text-muted">
                            {chatTime(last.at, now)}
                          </span>
                        </div>
                        <p className="truncate text-sm text-muted">
                          {typing ? 'typing…' : preview}
                        </p>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </Card>
        </section>
      )}

      <ProBanner className="mb-3" />
      <FictionalNote className="mb-6 text-center" />
      {requestTo && (
        <RequestMatchDialog athlete={requestTo} open onClose={() => setRequestTo(null)} />
      )}
    </Page>
  )
}
