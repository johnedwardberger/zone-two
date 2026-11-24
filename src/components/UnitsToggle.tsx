import { useId } from 'react'
import { useAppStore } from '../store/store'
import type { Units } from '../types'

/** Segmented miles/kilometers control bound to the store. */
export function UnitsToggle({
  className = '',
  onUnitsChange,
}: {
  className?: string
  /** Lets forms convert values already typed in the previous units. */
  onUnitsChange?: (next: Units, prev: Units) => void
}) {
  const units = useAppStore((s) => s.units)
  const setUnits = useAppStore((s) => s.setUnits)
  const name = useId()
  const opts: { value: Units; label: string }[] = [
    { value: 'imperial', label: 'Miles' },
    { value: 'metric', label: 'Kilometers' },
  ]
  return (
    <fieldset className={`inline-flex rounded-full bg-hairline/70 p-1 ${className}`}>
      <legend className="sr-only">Units</legend>
      {opts.map((o) => (
        <label
          key={o.value}
          className={[
            'cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-primary-strong',
            units === o.value ? 'bg-surface text-ink shadow-card' : 'text-muted hover:text-ink',
          ].join(' ')}
        >
          <input
            type="radio"
            name={name}
            className="sr-only"
            checked={units === o.value}
            onChange={() => {
              if (o.value === units) return
              onUnitsChange?.(o.value, units)
              setUnits(o.value)
            }}
          />
          {o.label}
        </label>
      ))}
    </fieldset>
  )
}
