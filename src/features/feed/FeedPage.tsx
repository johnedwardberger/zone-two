import { useState } from 'react'
import { Link } from 'react-router'
import { MessageCircle, Send } from 'lucide-react'
import type { Activity, Athlete, Units } from '../../types'
import { useAppStore } from '../../store/store'
import { useDerived } from '../../store/hooks'
import { athleteById, selectFeed, selectMatchedAthletes } from '../../store/selectors'
import { ButtonLink, Card, FictionalNote, Page, PageHeader } from '../../components/ui'
import { Photo } from '../../components/Photo'
import { PulseIcon, SportBadge } from '../../components/icons'
import { ActivityMetrics } from '../../components/ActivityMetrics'
import { coarseWhen, todayISO } from '../../lib/dates'
import { PhotoCarousel } from '../profile/ProfileView'

export function FeedPage() {
  const core = useDerived((s) => s)
  const feed = useDerived(selectFeed)
  const matchCount = useDerived((s) => selectMatchedAthletes(s).length)

  return (
    <Page>
      <PageHeader title="Feed" subtitle="Activities from you and your matches." />
      {matchCount === 0 && (
        <Card className="mb-6 flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center">
          <p className="flex-1 text-muted">
            Your feed fills up as you match. Pulses here are just a friendly cheer between matches.
          </p>
          <ButtonLink to="/discover" size="sm" variant="secondary">
            Find matches
          </ButtonLink>
        </Card>
      )}
      {feed.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="font-semibold">Nothing here yet</p>
          <p className="mt-1 text-muted">
            Post an activity or match with someone to get your feed going.
          </p>
          <ButtonLink to="/post" className="mt-5">
            Post an activity
          </ButtonLink>
        </Card>
      ) : (
        <ul className="space-y-5">
          {feed.map((a) => {
            const athlete = athleteById(core, a.athleteId)
            return athlete ? (
              <li key={a.id}>
                <FeedPost
                  activity={a}
                  athlete={athlete}
                  units={core.units}
                  pulseSent={!!core.feedPulses[a.id]}
                />
              </li>
            ) : null
          })}
        </ul>
      )}
      <FictionalNote className="my-6 text-center" />
    </Page>
  )
}

function FeedPost({
  activity: a,
  athlete,
  units,
  pulseSent,
}: {
  activity: Activity
  athlete: Athlete
  units: Units
  pulseSent: boolean
}) {
  const toggle = useAppStore((s) => s.toggleFeedPulse)
  const comment = useAppStore((s) => s.addComment)
  const me = useAppStore((s) => s.me)
  const athletes = useAppStore((s) => s.athletes)
  const [text, setText] = useState('')
  const [showComposer, setShowComposer] = useState(false)
  const mine = a.athleteId === 'me'
  const count = a.basePulses + (pulseSent ? 1 : 0)
  const profileHref = mine ? '/profile' : `/athlete/${athlete.id}`
  const nameOf = (id: string) =>
    id === 'me' ? 'You' : (athletes.find((x) => x.id === id)?.firstName ?? '')

  return (
    <Card as="article" className="overflow-hidden">
      <header className="flex items-center gap-3 p-4">
        <Link
          to={profileHref}
          className="shrink-0"
          aria-label={`${mine ? 'Your' : `${athlete.firstName}’s`} profile`}
        >
          <span className="block size-11 overflow-hidden rounded-full bg-hairline">
            <Photo src={athlete.photos[0]} alt="" className="size-full" />
          </span>
        </Link>
        <div className="min-w-0 flex-1">
          <Link to={profileHref} className="font-semibold hover:underline">
            {mine ? `${me?.firstName} (you)` : athlete.firstName}
          </Link>
          <p className="text-sm text-muted">{coarseWhen(a.date, a.timeOfDay, todayISO())}</p>
        </div>
        <SportBadge sport={a.sport} />
      </header>

      {a.photos.length > 1 ? (
        <PhotoCarousel
          photos={a.photos}
          name={a.title}
          aspect="aspect-[4/3]"
          rounded="rounded-none"
        />
      ) : a.photos.length === 1 ? (
        <Photo src={a.photos[0]} alt={`${a.title} photo`} className="aspect-[4/3] w-full" />
      ) : null}

      <div className="p-4 sm:p-5">
        <h2 className="text-lg font-semibold">{a.title}</h2>
        {a.description && <p className="mt-1 text-muted">{a.description}</p>}
        <div className="mt-4">
          <ActivityMetrics activity={a} units={units} />
        </div>

        <div className="mt-5 flex items-center gap-2 border-t border-hairline pt-3">
          {mine ? (
            <span className="inline-flex h-10 items-center gap-2 px-2 text-sm font-semibold text-muted">
              <PulseIcon className="size-5" /> {count} {count === 1 ? 'Pulse' : 'Pulses'}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => toggle(a.id)}
              aria-pressed={pulseSent}
              aria-label={`Send a Pulse on ${athlete.firstName}’s ${a.title}. ${count} ${count === 1 ? 'Pulse' : 'Pulses'}.`}
              className={`inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold transition-colors ${pulseSent ? 'bg-primary-soft text-primary-pressed' : 'text-ink hover:bg-hairline/70'}`}
            >
              <PulseIcon
                filled={pulseSent}
                className={`size-5 ${pulseSent ? 'animate-pop' : ''}`}
              />
              <span aria-hidden>{count}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowComposer((v) => !v)}
            aria-expanded={showComposer}
            className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-ink hover:bg-hairline/70"
          >
            <MessageCircle className="size-5" aria-hidden />
            {a.comments.length > 0 ? a.comments.length : ''} Comment
          </button>
          <span className="ml-auto text-xs text-muted">via {a.loggedWith}</span>
        </div>

        {a.comments.length > 0 && (
          <ul className="mt-3 space-y-2" aria-label="Comments">
            {a.comments.map((c) => (
              <li key={c.id} className="rounded-xl bg-cream px-3 py-2 text-[15px]">
                <span className="font-semibold">{nameOf(c.authorId)}</span> {c.text}
              </li>
            ))}
          </ul>
        )}

        {showComposer && (
          <form
            className="mt-3 flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              comment(a.id, text)
              setText('')
            }}
          >
            <label className="sr-only" htmlFor={`c-${a.id}`}>
              Add a comment
            </label>
            <input
              id={`c-${a.id}`}
              autoFocus
              value={text}
              maxLength={280}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment…"
              className="h-11 min-w-0 flex-1 rounded-full border border-line/60 bg-surface px-4 text-[16px] placeholder:text-muted/80 focus-visible:border-primary-strong"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="flex size-11 items-center justify-center rounded-full bg-primary-strong text-white disabled:opacity-40"
              aria-label="Post comment"
            >
              <Send className="size-4" aria-hidden />
            </button>
          </form>
        )}
      </div>
    </Card>
  )
}
