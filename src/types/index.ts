/*
 * Domain types. All measurements are stored in canonical metric units:
 *   distance → meters, time → seconds, elevation → meters,
 *   run pace → seconds per km, ride speed → km/h, swim pace → seconds per 100 m.
 * Conversion to the viewer's units happens only at display/input time (lib/units).
 */

export type Sport = 'run' | 'ride' | 'swim'
export const SPORTS: Sport[] = ['run', 'ride', 'swim']

export type Level = 'recreational' | 'competitive' | 'elite'
export const LEVELS: Level[] = ['recreational', 'competitive', 'elite']

export type Gender = 'woman' | 'man' | 'nonbinary'
export const GENDERS: Gender[] = ['woman', 'man', 'nonbinary']

export type TimeOfDay = 'morning' | 'afternoon' | 'evening'
export const TIMES_OF_DAY: TimeOfDay[] = ['morning', 'afternoon', 'evening']

export type Units = 'imperial' | 'metric'

export type LoggedWith = 'Strava' | 'Nike Run Club' | 'Garmin Connect' | 'Apple Fitness' | 'Other'
export const LOGGED_WITH: LoggedWith[] = [
  'Strava',
  'Nike Run Club',
  'Garmin Connect',
  'Apple Fitness',
  'Other',
]

/** Canonical typical pace per sport (see header for units). */
export type Paces = Partial<Record<Sport, number>>

export type City = {
  id: string
  name: string
  state: string
  lat: number
  lng: number
}

/**
 * Photo source. Either a data URL (user uploads) or an illustration key:
 *   "art:avatar:<hue>:<initial>"  – abstract avatar
 *   "art:scene:<sport>:<variant>" – generic sport scenery
 */
export type PhotoSrc = string

export type Athlete = {
  id: string
  firstName: string
  /** ISO date (yyyy-mm-dd). */
  birthDate: string
  gender: Gender
  /** Who they'd like to meet. */
  meet: Gender[]
  /** Age range they're open to (used for two-way discovery). */
  ageMin: number
  ageMax: number
  cityId: string
  sports: Sport[]
  weeklyHours: number
  level: Level
  paces: Paces
  bio: string
  idealDate: string
  photos: PhotoSrc[]
  /** Demo-only: hidden flag that makes this athlete reciprocate Kudos. */
  likesYou?: boolean
  /** Demo-only: key into the canned chat replies. */
  persona?: string
}

export type Comment = {
  id: string
  authorId: string
  text: string
  /** Epoch ms. */
  at: number
}

export type Activity = {
  id: string
  athleteId: string
  sport: Sport
  title: string
  /** ISO date (yyyy-mm-dd). Never an exact time. */
  date: string
  timeOfDay: TimeOfDay
  distanceM: number
  movingTimeS: number
  elevationM?: number
  avgHr?: number
  effort?: number
  description?: string
  loggedWith: LoggedWith
  photos: PhotoSrc[]
  /** Feed Kudos (between matches) from people other than the viewer. */
  baseKudos: number
  comments: Comment[]
  /** Epoch ms when posted; used only for ordering. */
  postedAt: number
}

export type MatchRequest = {
  id: string
  fromId: string
  toId: string
  note?: string
  status: 'pending' | 'accepted' | 'declined'
  at: number
}

export type Match = {
  athleteId: string
  at: number
}

export type DateProposal = {
  sport: Sport
  routeId?: string
  /** Custom public meeting spot (when not using a suggested route). */
  customSpot?: string
  distanceM: number
  /** Canonical pace for the sport. */
  pace: number
  /** ISO date. */
  day: string
  timeOfDay: TimeOfDay
  status: 'pending' | 'accepted'
}

export type Message = {
  id: string
  fromId: string
  at: number
  text?: string
  proposal?: DateProposal
}

export type Notification = {
  id: string
  kind: 'mutual' | 'request' | 'match'
  athleteId: string
  at: number
  read: boolean
}

export type Filters = {
  sports: Sport[]
  ageMin: number
  ageMax: number
  meet: Gender[]
  /** null = anywhere. */
  radiusKm: number | null
  minWeeklyHours: number
  levels: Level[]
  /** Inclusive [min, max] per sport in canonical units. */
  paceRanges: Record<Sport, [number, number]>
}

export type Route = {
  id: string
  name: string
  sports: Sport[]
  /** Distance options in meters. */
  distanceOptionsM: number[]
  surface: string
  meetingPoint: string
  description: string
  /** [lat, lng] pairs of the public route (or a single venue point). */
  path: [number, number][]
  meetingLatLng: [number, number]
}
