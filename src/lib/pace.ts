import type { Sport, Units } from '../types'
import { M_PER_MI, M_PER_YD } from './units'

/*
 * Canonical pace units: run = s/km, ride = km/h, swim = s/100 m.
 * "Display" pace: run = s/mi or s/km, ride = mph or km/h, swim = s/100 yd or s/100 m.
 */

/** Canonical pace from a distance (m) and moving time (s). */
export function paceFrom(sport: Sport, distanceM: number, movingTimeS: number): number {
  if (distanceM <= 0 || movingTimeS <= 0) return NaN
  if (sport === 'run') return movingTimeS / (distanceM / 1000)
  if (sport === 'ride') return distanceM / 1000 / (movingTimeS / 3600)
  return movingTimeS / (distanceM / 100)
}

/** Moving time (s) needed to cover a distance at a canonical pace. */
export function timeFor(sport: Sport, distanceM: number, pace: number): number {
  if (sport === 'run') return (distanceM / 1000) * pace
  if (sport === 'ride') return (distanceM / 1000 / pace) * 3600
  return (distanceM / 100) * pace
}

/** Canonical → display units. */
export function paceToDisplay(sport: Sport, pace: number, units: Units): number {
  if (units === 'metric') return pace
  if (sport === 'run') return pace * (M_PER_MI / 1000)
  if (sport === 'ride') return pace / (M_PER_MI / 1000)
  return pace * M_PER_YD
}

/** Display → canonical units. */
export function paceFromDisplay(sport: Sport, value: number, units: Units): number {
  if (units === 'metric') return value
  if (sport === 'run') return value / (M_PER_MI / 1000)
  if (sport === 'ride') return value * (M_PER_MI / 1000)
  return value / M_PER_YD
}

/** "7:45" style for paces; "18.6" for speeds. Unit label not included. */
export function formatPaceValue(sport: Sport, pace: number, units: Units): string {
  if (!Number.isFinite(pace) || pace <= 0) return '–'
  const v = paceToDisplay(sport, pace, units)
  if (sport === 'ride') return v.toFixed(1)
  return formatClock(v)
}

/** mm:ss (or h:mm:ss) from seconds, rounding to whole seconds. */
export function formatClock(totalSeconds: number): string {
  const s = Math.round(totalSeconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const ss = String(sec).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

/** "1h 23m" / "45m" for durations. */
export function formatDuration(totalSeconds: number): string {
  const mins = Math.round(totalSeconds / 60)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

/**
 * Parse "7:45", "1:23:45" or a plain number of minutes ("45", "7.5") into seconds.
 * Returns NaN for anything unparseable or negative.
 */
export function parseClock(input: string): number {
  const s = input.trim()
  if (!s) return NaN
  if (/^\d+(\.\d+)?$/.test(s)) return Number(s) * 60
  const m = s.match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?$/)
  if (!m) return NaN
  const [a, b, c] = [Number(m[1]), Number(m[2]), m[3] === undefined ? undefined : Number(m[3])]
  if (c === undefined) return b < 60 ? a * 60 + b : NaN
  return b < 60 && c < 60 ? a * 3600 + b * 60 + c : NaN
}

/** Parse a pace input in display units (clock for run/swim, number for ride) → canonical. */
export function parsePaceInput(sport: Sport, input: string, units: Units): number {
  if (sport === 'ride') {
    const v = Number(input.trim())
    return input.trim() && Number.isFinite(v) && v > 0 ? paceFromDisplay(sport, v, units) : NaN
  }
  const secs = parseClock(input)
  return secs > 0 ? paceFromDisplay(sport, secs, units) : NaN
}

/** Plausible human ranges (canonical units) used for validation. */
export const PACE_LIMITS: Record<Sport, { min: number; max: number }> = {
  // Run: faster than ~2:30/km is beyond world-record territory; slower than 20:00/km is a walk.
  run: { min: 150, max: 1200 },
  // Ride: average moving speed between 5 and 60 km/h.
  ride: { min: 5, max: 60 },
  // Swim: faster than 0:45/100m is beyond world-record pace; slower than 6:00/100m is unlikely.
  swim: { min: 45, max: 360 },
}

/** Is a canonical pace physically plausible for the sport? */
export function isPlausiblePace(sport: Sport, pace: number): boolean {
  const { min, max } = PACE_LIMITS[sport]
  return Number.isFinite(pace) && pace >= min && pace <= max
}

/** Is `a` slower than `b`? (lower speed for rides, higher s/unit otherwise) */
export function isSlower(sport: Sport, a: number, b: number): boolean {
  return sport === 'ride' ? a < b : a > b
}

/** The slower of two canonical paces. */
export function slowerPace(sport: Sport, a: number, b: number): number {
  return isSlower(sport, a, b) ? a : b
}
