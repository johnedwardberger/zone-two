import type { Activity, Units } from '../types'
import { distanceUnit, formatElevation, metersToDisplay, paceUnit } from '../lib/units'
import { formatDuration, formatPaceValue, paceFrom } from '../lib/pace'

type Metric = { label: string; value: string; unit?: string }

export function activityMetrics(a: Activity, units: Units, withExtras = false): Metric[] {
  const d = metersToDisplay(a.distanceM, a.sport, units)
  const distance =
    a.sport === 'swim'
      ? Math.round(d).toLocaleString('en-US')
      : d >= 100
        ? d.toFixed(0)
        : d.toFixed(d >= 10 ? 1 : 2)
  const pace = paceFrom(a.sport, a.distanceM, a.movingTimeS)
  const metrics: Metric[] = [
    { label: 'Distance', value: distance, unit: distanceUnit(a.sport, units) },
    {
      label: a.sport === 'ride' ? 'Speed' : 'Pace',
      value: formatPaceValue(a.sport, pace, units),
      unit: paceUnit(a.sport, units),
    },
    { label: 'Time', value: formatDuration(a.movingTimeS) },
  ]
  if (withExtras) {
    if (a.elevationM !== undefined) {
      const [v, u] = formatElevation(a.elevationM, units).split(' ')
      metrics.push({ label: 'Elevation', value: v, unit: u })
    }
    if (a.avgHr) metrics.push({ label: 'Avg HR', value: String(a.avgHr), unit: 'bpm' })
    if (a.effort) metrics.push({ label: 'Effort', value: String(a.effort), unit: '/10' })
  }
  return metrics
}

/** Big, confident stat numbers. `tone="light"` for use over photos. */
export function ActivityMetrics({
  activity,
  units,
  withExtras = false,
  tone = 'dark',
  size = 'md',
}: {
  activity: Activity
  units: Units
  withExtras?: boolean
  tone?: 'dark' | 'light'
  size?: 'md' | 'lg'
}) {
  const metrics = activityMetrics(activity, units, withExtras)
  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-3">
      {metrics.map((m) => (
        <div key={m.label} className="min-w-0">
          <dt
            className={`text-xs font-medium ${tone === 'light' ? 'text-white/85' : 'text-muted'}`}
          >
            {m.label}
          </dt>
          <dd
            className={`font-display font-bold leading-none ${size === 'lg' ? 'text-4xl' : 'text-3xl'}`}
          >
            {m.value}
            {m.unit && (
              <span
                className={`ml-1 text-base font-semibold ${tone === 'light' ? 'text-white/85' : 'text-muted'}`}
              >
                {m.unit}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
