import { useState } from 'react'
import { fromISODate } from '../../lib/dates'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const label = (iso: string) => {
  const d = fromISODate(iso)
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

/**
 * Hours per week for the last 8 weeks. Single series: one hue, thin bars
 * with rounded data-ends on the baseline, hover/focus tooltip, recessive
 * axis, and an equivalent table for screen readers.
 */
export function WeeklyChart({ weeks }: { weeks: { start: string; hours: number }[] }) {
  const [active, setActive] = useState<number | null>(null)
  const max = Math.max(1, ...weeks.map((w) => w.hours))
  const top = Math.ceil(max / 2) * 2
  const H = 96

  return (
    <figure>
      <figcaption className="mb-3 text-sm font-semibold">Hours per week · last 8 weeks</figcaption>
      <div className="relative" aria-hidden>
        <div
          className="flex items-end gap-2"
          style={{ height: H }}
          onMouseLeave={() => setActive(null)}
        >
          {weeks.map((w, i) => {
            const h = w.hours > 0 ? Math.max(4, (w.hours / top) * H) : 2
            return (
              <div
                key={w.start}
                className="group relative flex h-full flex-1 items-end justify-center"
                onMouseEnter={() => setActive(i)}
              >
                <div
                  className={`w-full max-w-7 rounded-t-[4px] transition-colors ${w.hours > 0 ? (active === i ? 'bg-primary-strong' : 'bg-primary') : 'bg-hairline'}`}
                  style={{ height: h }}
                />
                {active === i && (
                  <div className="absolute bottom-full mb-2 rounded-lg bg-ink px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-lift">
                    <span className="font-semibold">{w.hours.toFixed(1)} h</span> · week of{' '}
                    {label(w.start)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="mt-1 border-t border-hairline" />
        <div className="mt-1 flex justify-between text-[11px] text-muted">
          <span>{label(weeks[0].start)}</span>
          <span>This week</span>
        </div>
      </div>
      <table className="sr-only">
        <caption>Training hours per week</caption>
        <thead>
          <tr>
            <th scope="col">Week of</th>
            <th scope="col">Hours</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((w) => (
            <tr key={w.start}>
              <td>{label(w.start)}</td>
              <td>{w.hours.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
