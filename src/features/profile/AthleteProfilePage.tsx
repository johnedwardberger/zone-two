import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, CalendarHeart, Check, Hourglass, MessageCircle, Send, X } from 'lucide-react'
import { useAppStore } from '../../store/store'
import { useDerived } from '../../store/hooks'
import {
  activitiesOf,
  athleteById,
  isMatched,
  isMutualWith,
  isUnavailable,
  pendingIncoming,
  pendingOutgoing,
} from '../../store/selectors'
import { Button, ButtonLink, Card, FictionalNote, Page } from '../../components/ui'
import { KudosIcon } from '../../components/icons'
import { RequestMatchDialog } from '../matches/RequestMatchDialog'
import { SafetyMenu } from '../matches/SafetyMenu'
import { ActivityItem, ProfileHeader, TrainingSnapshot } from './ProfileView'

export function AthleteProfilePage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const core = useDerived((s) => s)
  const giveKudos = useAppStore((s) => s.giveKudos)
  const respond = useAppStore((s) => s.respondToRequest)
  const [requestOpen, setRequestOpen] = useState(false)

  const athlete = id === 'me' ? undefined : athleteById(core, id)
  if (!athlete || isUnavailable(core, id)) {
    return (
      <Page>
        <Card className="p-8 text-center">
          <h1 className="font-display text-3xl font-bold uppercase">Profile not available</h1>
          <p className="mt-2 text-muted">This athlete isn’t available anymore.</p>
          <ButtonLink to="/discover" className="mt-6">
            Back to Discover
          </ButtonLink>
        </Card>
      </Page>
    )
  }

  const activities = activitiesOf(core, id)
  const matched = isMatched(core, id)
  const mutual = isMutualWith(core, id)
  const incoming = pendingIncoming(core, id)
  const outgoing = pendingOutgoing(core, id)
  const given = new Set(core.kudosGiven[id] ?? [])

  let actions
  if (matched) {
    actions = (
      <div className="flex flex-wrap gap-3">
        <ButtonLink to={`/matches/${id}`}>
          <MessageCircle className="size-4" aria-hidden /> Message
        </ButtonLink>
        <ButtonLink to={`/matches/${id}/plan`} variant="secondary">
          <CalendarHeart className="size-4" aria-hidden /> Plan a workout date
        </ButtonLink>
      </div>
    )
  } else if (incoming) {
    actions = (
      <div className="rounded-2xl bg-surface p-4 shadow-card">
        <p className="font-semibold">{athlete.firstName} sent you a match request</p>
        {incoming.note && <p className="mt-1 text-muted">“{incoming.note}”</p>}
        <div className="mt-3 flex gap-3">
          <Button onClick={() => respond(incoming.id, true)}>
            <Check className="size-4" aria-hidden /> Accept
          </Button>
          <Button variant="secondary" onClick={() => respond(incoming.id, false)}>
            <X className="size-4" aria-hidden /> Decline
          </Button>
        </div>
      </div>
    )
  } else if (outgoing) {
    actions = (
      <Button disabled variant="secondary">
        <Hourglass className="size-4" aria-hidden /> Request sent
      </Button>
    )
  } else if (mutual) {
    actions = (
      <div className="flex flex-wrap items-center gap-3">
        <Button size="lg" onClick={() => setRequestOpen(true)}>
          <Send className="size-5" aria-hidden /> Request to match
        </Button>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-sm font-semibold text-primary-pressed">
          <KudosIcon filled className="size-4" /> Mutual Kudos
        </span>
      </div>
    )
  } else {
    actions = (
      <p className="rounded-2xl bg-surface p-4 text-sm text-muted shadow-card">
        {given.size > 0
          ? `You gave ${athlete.firstName} Kudos. Kudos stay private unless they’re mutual.`
          : `Give Kudos to one of ${athlete.firstName}’s activities. If it’s mutual, you can request a match.`}
      </p>
    )
  }

  return (
    <Page wide>
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/discover'))}
        >
          <ArrowLeft className="size-4" aria-hidden /> Back
        </Button>
        <SafetyMenu athlete={athlete} matched={matched} />
      </div>
      <ProfileHeader
        athlete={athlete}
        myCityId={core.me?.cityId}
        units={core.units}
        actions={actions}
      />
      <div className="mt-8 space-y-6">
        <TrainingSnapshot activities={activities} units={core.units} />
        <section aria-labelledby="acts">
          <h2 id="acts" className="mb-3 font-display text-2xl font-bold uppercase">
            Activities
          </h2>
          <ul className="grid gap-4 desk:grid-cols-2">
            {activities.map((a) => (
              <li key={a.id}>
                <ActivityItem
                  activity={a}
                  units={core.units}
                  kudos={
                    matched
                      ? undefined
                      : { given: given.has(a.id), onGive: () => giveKudos(id, a.id) }
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      </div>
      <FictionalNote className="my-6 text-center" />
      <RequestMatchDialog
        athlete={athlete}
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
      />
    </Page>
  )
}
