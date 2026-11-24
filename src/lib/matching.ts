import type { Activity, Athlete, City, Filters, Route, Sport } from '../types'
import { SPORTS } from '../types'
import { ageOn } from './dates'
import { cityDistanceKm } from './geo'
import { slowerPace } from './pace'

/** Broadest possible filters (also what "Widen filters" resets to). */
export function broadFilters(meet: Filters['meet']): Filters {
  return {
    sports: [...SPORTS],
    ageMin: 18,
    ageMax: 70,
    meet: [...meet],
    radiusKm: null,
    minWeeklyHours: 0,
    levels: ['recreational', 'competitive', 'elite'],
    paceRanges: { ...PACE_FILTER_BOUNDS },
  }
}

/** Slider bounds for pace filters (canonical units). */
export const PACE_FILTER_BOUNDS: Record<Sport, [number, number]> = {
  run: [180, 600], // 3:00–10:00 /km
  ride: [15, 45], // km/h
  swim: [60, 180], // 1:00–3:00 /100m
}

function inRange(sport: Sport, pace: number, [lo, hi]: [number, number]): boolean {
  // Treat the slider ends as open-ended so extreme athletes aren't hidden by default.
  const [bLo, bHi] = PACE_FILTER_BOUNDS[sport]
  const okLo = lo <= bLo || pace >= lo
  const okHi = hi >= bHi || pace <= hi
  return okLo && okHi
}

/**
 * Does `them` pass `me`'s discovery filters, and does `me` fit theirs?
 * Gender and age apply both ways.
 */
export function passesFilters(
  me: Athlete,
  them: Athlete,
  filters: Filters,
  cities: City[],
  today: string,
): boolean {
  const theirAge = ageOn(them.birthDate, today)
  const myAge = ageOn(me.birthDate, today)

  // My preferences about them.
  if (!filters.meet.includes(them.gender)) return false
  if (theirAge < filters.ageMin || theirAge > filters.ageMax) return false
  if (
    filters.radiusKm !== null &&
    cityDistanceKm(cities, me.cityId, them.cityId) > filters.radiusKm
  )
    return false
  if (them.weeklyHours < filters.minWeeklyHours) return false
  if (!filters.levels.includes(them.level)) return false

  // Sports + pace: they must do at least one selected sport at a pace in range.
  const sportOk = them.sports.some((s) => {
    if (!filters.sports.includes(s)) return false
    const p = them.paces[s]
    return p === undefined || inRange(s, p, filters.paceRanges[s])
  })
  if (!sportOk) return false

  // Their preferences about me.
  if (!them.meet.includes(me.gender)) return false
  if (myAge < them.ageMin || myAge > them.ageMax) return false

  return true
}

/** Mutual Kudos: each side gave Kudos to at least one of the other's activities. */
export function isMutual(iGaveKudos: boolean, theyGaveKudos: boolean): boolean {
  return iGaveKudos && theyGaveKudos
}

export function sharedSports(a: Athlete, b: Athlete): Sport[] {
  return a.sports.filter((s) => b.sports.includes(s))
}

/** Most recent activity first (date, then time of day, then posting order). */
export function compareActivitiesDesc(a: Activity, b: Activity): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1
  const order = { morning: 0, afternoon: 1, evening: 2 }
  if (a.timeOfDay !== b.timeOfDay) return order[b.timeOfDay] - order[a.timeOfDay]
  return b.postedAt - a.postedAt
}

export function latestActivity(activities: Activity[], athleteId: string): Activity | undefined {
  return activities.filter((a) => a.athleteId === athleteId).sort(compareActivitiesDesc)[0]
}

export const DEFAULT_DISTANCE_M: Record<Sport, number> = { run: 8000, ride: 40000, swim: 2000 }
export const DEFAULT_PACE: Record<Sport, number> = { run: 330, ride: 26, swim: 120 }

/** Median distance of an athlete's activities in a sport (or a sensible default). */
export function typicalDistanceM(activities: Activity[], athleteId: string, sport: Sport): number {
  const d = activities
    .filter((a) => a.athleteId === athleteId && a.sport === sport)
    .map((a) => a.distanceM)
    .sort((x, y) => x - y)
  if (d.length === 0) return DEFAULT_DISTANCE_M[sport]
  const mid = Math.floor(d.length / 2)
  return d.length % 2 ? d[mid] : (d[mid - 1] + d[mid]) / 2
}

export type DateSuggestion = {
  sport: Sport
  distanceM: number
  pace: number
  route?: Route
}

/**
 * Suggest a first-date workout: a shared sport (else my first sport), the
 * shorter of the two typical distances, the slower partner's pace, and the
 * route whose distance options fit best.
 */
export function suggestFirstDate(
  me: Athlete,
  them: Athlete,
  activities: Activity[],
  routes: Route[],
  preferredSport?: Sport,
): DateSuggestion {
  const shared = sharedSports(me, them)
  const sport = preferredSport ?? shared[0] ?? me.sports[0] ?? them.sports[0] ?? ('run' as Sport)
  const distanceM = Math.min(
    typicalDistanceM(activities, me.id, sport),
    typicalDistanceM(activities, them.id, sport),
  )
  const pace = slowerPace(
    sport,
    me.paces[sport] ?? DEFAULT_PACE[sport],
    them.paces[sport] ?? DEFAULT_PACE[sport],
  )
  const route = routesForSport(routes, sport, distanceM)[0]
  const roundTo = sport === 'swim' ? 100 : 1000
  return {
    sport,
    distanceM: Math.max(roundTo, Math.round(distanceM / roundTo) * roundTo),
    pace,
    route,
  }
}

/** Routes for a sport, best distance fit first. */
export function routesForSport(routes: Route[], sport: Sport, targetM: number): Route[] {
  const fit = (r: Route) =>
    Math.min(...r.distanceOptionsM.map((d) => Math.abs(d - targetM) / targetM))
  return routes.filter((r) => r.sports.includes(sport)).sort((a, b) => fit(a) - fit(b))
}

/** Distance option on a route closest to a target. */
export function closestOption(route: Route, targetM: number): number {
  return route.distanceOptionsM.reduce((best, d) =>
    Math.abs(d - targetM) < Math.abs(best - targetM) ? d : best,
  )
}
