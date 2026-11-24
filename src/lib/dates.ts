import type { TimeOfDay } from '../types'

const DAY_MS = 86_400_000
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Local yyyy-mm-dd for a Date. */
export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Parse yyyy-mm-dd as a local date at midnight. */
export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(iso: string, days: number): string {
  const d = fromISODate(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

/** Whole calendar days from a to b (b - a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((fromISODate(b).getTime() - fromISODate(a).getTime()) / DAY_MS)
}

/**
 * Coarse, privacy-friendly label: "This morning", "Yesterday evening",
 * "Tuesday morning" (within the last week), otherwise "Mar 3 · morning".
 */
export function coarseWhen(date: string, timeOfDay: TimeOfDay, today: string): string {
  const diff = daysBetween(date, today)
  if (diff === 0) return timeOfDay === 'evening' ? 'This evening' : `This ${timeOfDay}`
  if (diff === 1) return `Yesterday ${timeOfDay}`
  const d = fromISODate(date)
  if (diff > 1 && diff < 7) return `${WEEKDAYS[d.getDay()]} ${timeOfDay}`
  return `${MONTHS[d.getMonth()]} ${d.getDate()} · ${timeOfDay}`
}

/** Label for a planned future day: "Today", "Tomorrow", "Saturday, Mar 8". */
export function dayLabel(date: string, today: string): string {
  const diff = daysBetween(today, date)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  const d = fromISODate(date)
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`
}

/** Age in whole years on `today`. */
export function ageOn(birthDate: string, today: string): number {
  const b = fromISODate(birthDate)
  const t = fromISODate(today)
  let age = t.getFullYear() - b.getFullYear()
  const beforeBirthday =
    t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())
  if (beforeBirthday) age -= 1
  return age
}

export function isAdult(birthDate: string, today: string): boolean {
  return ageOn(birthDate, today) >= 18
}

/** Start (Monday) of the week containing `date`. */
export function weekStart(date: string): string {
  const d = fromISODate(date)
  const offset = (d.getDay() + 6) % 7
  return addDays(date, -offset)
}

/** Chat-style timestamp: "9:41 AM", or "Mon 9:41 AM" if not today. */
export function chatTime(at: number, now: number): string {
  const d = new Date(at)
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  if (toISODate(d) === toISODate(new Date(now))) return time
  return `${WEEKDAYS[d.getDay()].slice(0, 3)} ${time}`
}

export function todayISO(): string {
  return toISODate(new Date())
}
