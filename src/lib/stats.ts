import type { Activity, Sport } from '../types'
import { addDays, weekStart } from './dates'

export type TrainingSnapshot = {
  /** Average hours/week over the last 4 weeks (including this one). */
  avgWeeklyHours4: number
  totals: Record<Sport, { count: number; distanceM: number; movingTimeS: number }>
  longest?: Activity
  /** Last 8 weeks, oldest first. */
  weeks: { start: string; hours: number }[]
}

export function trainingSnapshot(activities: Activity[], today: string): TrainingSnapshot {
  const thisWeek = weekStart(today)
  const weeks = Array.from({ length: 8 }, (_, i) => ({
    start: addDays(thisWeek, -7 * (7 - i)),
    hours: 0,
  }))
  const totals: TrainingSnapshot['totals'] = {
    run: { count: 0, distanceM: 0, movingTimeS: 0 },
    ride: { count: 0, distanceM: 0, movingTimeS: 0 },
    swim: { count: 0, distanceM: 0, movingTimeS: 0 },
  }
  let longest: Activity | undefined

  for (const a of activities) {
    const t = totals[a.sport]
    t.count += 1
    t.distanceM += a.distanceM
    t.movingTimeS += a.movingTimeS
    if (!longest || a.movingTimeS > longest.movingTimeS) longest = a
    const ws = weekStart(a.date)
    const w = weeks.find((x) => x.start === ws)
    if (w) w.hours += a.movingTimeS / 3600
  }

  const last4 = weeks.slice(-4).reduce((s, w) => s + w.hours, 0)
  return { avgWeeklyHours4: last4 / 4, totals, longest, weeks }
}
