import { useId } from 'react'

/**
 * Accessible dual-thumb range: two native range inputs layered on one
 * track (each has its own label and keyboard support).
 */
export function DualRange({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  format = String,
  minLabel = 'Minimum',
  maxLabel = 'Maximum',
}: {
  label: string
  min: number
  max: number
  step?: number
  value: [number, number]
  onChange: (v: [number, number]) => void
  format?: (v: number) => string
  minLabel?: string
  maxLabel?: string
}) {
  const id = useId()
  const [lo, hi] = value
  const pct = (v: number) => ((v - min) / (max - min)) * 100
  return (
    <div role="group" aria-labelledby={`${id}-label`}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span id={`${id}-label`} className="text-sm font-semibold">
          {label}
        </span>
        <span className="font-display text-xl font-bold" aria-hidden>
          {format(lo)} – {format(hi)}
        </span>
      </div>
      <div className="dual-range relative h-8">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-hairline" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary-strong"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        <input
          type="range"
          aria-label={`${label}: ${minLabel.toLowerCase()}`}
          aria-valuetext={format(lo)}
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi), hi])}
        />
        <input
          type="range"
          aria-label={`${label}: ${maxLabel.toLowerCase()}`}
          aria-valuetext={format(hi)}
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo)])}
        />
      </div>
    </div>
  )
}

export function SingleRange({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  format = String,
}: {
  label: string
  min: number
  max: number
  step?: number
  value: number
  onChange: (v: number) => void
  format?: (v: number) => string
}) {
  const id = useId()
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold">
          {label}
        </label>
        <span className="font-display text-xl font-bold" aria-hidden>
          {format(value)}
        </span>
      </div>
      <div className="dual-range relative h-8">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-hairline" />
        <div
          className="absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full bg-primary-strong"
          style={{ width: `${pct}%` }}
        />
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-valuetext={format(value)}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </div>
  )
}
