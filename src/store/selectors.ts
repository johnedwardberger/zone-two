/*
 * Read-only views over the store. Components use these (with useShallow /
 * useMemo) instead of reaching into raw state shape.
 */
import type { Activity, Athlete } from '../types'
import type { AppState } from './store'
import { CITIES } from '../data/seed'
import { todayISO } from '../lib/dates'
import { cityDistanceKm } from '../lib/geo'
import { compareActivitiesDesc, latestActivity, passesFilters } from '../lib/matching'

type S = Pick<
  AppState,
  | 'me'
  | 'athletes'
  | 'activities'
  | 'filters'
  | 'swipes'
  | 'kudosGiven'
  | 'kudosReceived'
  | 'requests'
  | 'matches'
  | 'messages'
  | 'hidden'
  | 'blocked'
  | 'feedKudos'
>

export function athleteById(s: Pick<S, 'me' | 'athletes'>, id: string): Athlete | undefined {
  if (id === 'me') return s.me ?? undefined
  return s.athletes.find((a) => a.id === id)
}

export const isMatched = (s: Pick<S, 'matches'>, id: string) =>
  s.matches.some((m) => m.athleteId === id)

export const isUnavailable = (s: Pick<S, 'hidden' | 'blocked'>, id: string) =>
  s.hidden.includes(id) || s.blocked.includes(id)

export const isMutualWith = (s: Pick<S, 'kudosGiven' | 'kudosReceived'>, id: string) =>
  !!s.kudosGiven[id]?.length && !!s.kudosReceived[id]

export const pendingIncoming = (s: Pick<S, 'requests'>, id: string) =>
  s.requests.find((r) => r.fromId === id && r.toId === 'me' && r.status === 'pending')

export const pendingOutgoing = (s: Pick<S, 'requests'>, id: string) =>
  s.requests.find((r) => r.fromId === 'me' && r.toId === id && r.status === 'pending')

export type DeckCard = { athlete: Athlete; activity: Activity }

/** Discover deck: one card per athlete (their latest activity), filtered both ways. */
export function selectDeck(s: S): DeckCard[] {
  const me = s.me
  if (!me) return []
  const today = todayISO()
  const cards: DeckCard[] = []
  for (const athlete of s.athletes) {
    if (s.swipes[athlete.id]) continue
    if (isMatched(s, athlete.id) || isUnavailable(s, athlete.id)) continue
    if (pendingIncoming(s, athlete.id)) continue
    if (!passesFilters(me, athlete, s.filters, CITIES, today)) continue
    const activity = latestActivity(s.activities, athlete.id)
    if (activity) cards.push({ athlete, activity })
  }
  // Nearby athletes first (so matching feels local), then freshest activity.
  const far = (a: Athlete) => (cityDistanceKm(CITIES, me.cityId, a.cityId) > 60 ? 1 : 0)
  return cards.sort(
    (a, b) => far(a.athlete) - far(b.athlete) || compareActivitiesDesc(a.activity, b.activity),
  )
}

export function selectIncomingRequests(s: S) {
  return s.requests.filter(
    (r) => r.toId === 'me' && r.status === 'pending' && !isUnavailable(s, r.fromId),
  )
}

/** Mutual-Kudos athletes I'm not matched with yet. */
export function selectMutuals(s: S): Athlete[] {
  return s.athletes.filter(
    (a) =>
      isMutualWith(s, a.id) &&
      !isMatched(s, a.id) &&
      !isUnavailable(s, a.id) &&
      !pendingIncoming(s, a.id),
  )
}

export function selectMatchedAthletes(s: S): { athlete: Athlete; at: number }[] {
  return s.matches
    .filter((m) => !isUnavailable(s, m.athleteId))
    .map((m) => ({ athlete: athleteById(s, m.athleteId), at: m.at }))
    .filter((x): x is { athlete: Athlete; at: number } => !!x.athlete)
}

/** Feed: my activities plus my matches', newest first. */
export function selectFeed(s: S): Activity[] {
  const ids = new Set(['me', ...selectMatchedAthletes(s).map((m) => m.athlete.id)])
  return s.activities.filter((a) => ids.has(a.athleteId)).sort(compareActivitiesDesc)
}

export function activitiesOf(s: Pick<S, 'activities'>, athleteId: string): Activity[] {
  return s.activities.filter((a) => a.athleteId === athleteId).sort(compareActivitiesDesc)
}
