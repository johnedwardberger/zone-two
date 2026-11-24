import { useState } from 'react'
import { useNavigate } from 'react-router'
import type { LoggedWith, Sport, TimeOfDay } from '../../types'
import { LOGGED_WITH, SPORTS, TIMES_OF_DAY } from '../../types'
import { useAppStore } from '../../store/store'
import {
  Button,
  Card,
  ChoiceGroup,
  Field,
  Page,
  PageHeader,
  Select,
  TextArea,
  TextInput,
} from '../../components/ui'
import { PhotoPicker } from '../../components/PhotoPicker'
import { SportIcon, SPORT_LABEL } from '../../components/icons'
import { UnitsToggle } from '../../components/UnitsToggle'
import { addDays, todayISO } from '../../lib/dates'
import { displayToMeters, distanceUnit, M_PER_FT, metersToDisplay, paceUnit } from '../../lib/units'
import { formatPaceValue, isPlausiblePace, paceFrom } from '../../lib/pace'

/** Longest plausible single sessions (meters), for validation. */
const MAX_DISTANCE_M: Record<Sport, number> = { run: 350_000, ride: 1_000_000, swim: 40_000 }

type Draft = {
  sport: Sport | null
  title: string
  date: string
  timeOfDay: TimeOfDay | null
  distance: string
  hours: string
  minutes: string
  seconds: string
  elevation: string
  avgHr: string
  effort: string
  description: string
  loggedWith: LoggedWith
  photos: string[]
}

const TOD_LABEL: Record<TimeOfDay, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
}

export function PostPage() {
  const navigate = useNavigate()
  const units = useAppStore((s) => s.units)
  const mySports = useAppStore((s) => s.me?.sports ?? [])
  const post = useAppStore((s) => s.postActivity)
  const toast = useAppStore((s) => s.toast)
  const today = todayISO()
  const [d, setD] = useState<Draft>(() => ({
    sport: mySports[0] ?? null,
    title: '',
    date: today,
    timeOfDay: null,
    distance: '',
    hours: '',
    minutes: '',
    seconds: '',
    elevation: '',
    avgHr: '',
    effort: '',
    description: '',
    loggedWith: 'Strava',
    photos: [],
  }))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const set = (patch: Partial<Draft>) => setD((x) => ({ ...x, ...patch }))
  const num = (v: string) => (v.trim() === '' ? NaN : Number(v))

  const distanceM = d.sport ? displayToMeters(num(d.distance), d.sport, units) : NaN
  const movingTimeS =
    (num(d.hours) || 0) * 3600 + (num(d.minutes) || 0) * 60 + (num(d.seconds) || 0)
  const pace =
    d.sport && distanceM > 0 && movingTimeS > 0 ? paceFrom(d.sport, distanceM, movingTimeS) : NaN

  function validate(): Record<string, string> {
    const e: Record<string, string> = {}
    if (!d.sport) e.sport = 'Choose a sport.'
    if (!d.title.trim()) e.title = 'Give it a title.'
    if (!d.date) e.date = 'Choose a date.'
    else if (d.date > today) e.date = 'Activities can’t be in the future.'
    else if (d.date < addDays(today, -365)) e.date = 'Choose a date within the last year.'
    if (!d.timeOfDay) e.timeOfDay = 'Choose a time of day.'
    const dist = num(d.distance)
    if (!Number.isFinite(dist)) e.distance = 'Add a distance.'
    else if (dist <= 0) e.distance = 'Distance must be more than zero.'
    else if (d.sport && distanceM > MAX_DISTANCE_M[d.sport])
      e.distance = 'That’s longer than any single session we can believe.'
    const parts = [d.hours, d.minutes, d.seconds].map(num)
    if (parts.some((p) => Number.isFinite(p) && p < 0)) e.time = 'Time can’t be negative.'
    else if (num(d.minutes) >= 60 || num(d.seconds) >= 60)
      e.time = 'Minutes and seconds go up to 59.'
    else if (movingTimeS <= 0) e.time = 'Add your moving time.'
    else if (movingTimeS > 48 * 3600) e.time = 'Moving time over 48 hours isn’t supported.'
    if (!e.distance && !e.time && d.sport && !isPlausiblePace(d.sport, pace))
      e.pace = `That ${d.sport === 'ride' ? 'speed' : 'pace'} isn’t physically possible. Check the distance, time and units.`
    if (d.elevation && (num(d.elevation) < 0 || !Number.isFinite(num(d.elevation))))
      e.elevation = 'Elevation can’t be negative.'
    else if (d.elevation && num(d.elevation) * (units === 'imperial' ? M_PER_FT : 1) > 10_000)
      e.elevation = 'That’s more climbing than seems possible.'
    if (d.avgHr && !(num(d.avgHr) >= 40 && num(d.avgHr) <= 230))
      e.avgHr = 'Use a heart rate between 40 and 230 bpm.'
    if (d.effort && !(num(d.effort) >= 1 && num(d.effort) <= 10)) e.effort = 'Use 1 to 10.'
    if (d.description.length > 500) e.description = 'Keep it under 500 characters.'
    return e
  }

  const liveErrors = submitted ? validate() : errors

  function submit() {
    setSubmitted(true)
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) {
      // Move focus to the first invalid field.
      window.setTimeout(
        () => (document.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus(),
        0,
      )
      return
    }
    post({
      sport: d.sport!,
      title: d.title.trim(),
      date: d.date,
      timeOfDay: d.timeOfDay!,
      distanceM,
      movingTimeS,
      elevationM:
        d.sport !== 'swim' && d.elevation
          ? num(d.elevation) * (units === 'imperial' ? M_PER_FT : 1)
          : undefined,
      avgHr: d.avgHr ? Math.round(num(d.avgHr)) : undefined,
      effort: d.effort ? Math.round(num(d.effort)) : undefined,
      description: d.description.trim() || undefined,
      loggedWith: d.loggedWith,
      photos: d.photos,
    })
    toast('Activity posted! It’s on your profile and in your matches’ feeds.', {
      label: 'View',
      to: '/profile',
    })
    navigate('/profile')
  }

  return (
    <Page>
      <PageHeader
        title="Post an activity"
        subtitle="Add a session you logged elsewhere. No routes or maps, ever."
      />
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="space-y-6"
      >
        <Card className="space-y-6 p-5 sm:p-6">
          <ChoiceGroup
            legend="Sport"
            options={SPORTS.map((s) => ({ value: s, label: SPORT_LABEL[s] }))}
            value={d.sport ? [d.sport] : []}
            onChange={([sport]) => set({ sport })}
            error={liveErrors.sport}
            renderOption={(o) => (
              <>
                <SportIcon sport={o.value} className="size-4" />
                {o.label}
              </>
            )}
          />
          <Field label="Title" error={liveErrors.title}>
            {(p) => (
              <TextInput
                {...p}
                maxLength={60}
                placeholder="e.g. Sunrise long run"
                value={d.title}
                onChange={(e) => set({ title: e.target.value })}
              />
            )}
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Date" error={liveErrors.date}>
              {(p) => (
                <TextInput
                  {...p}
                  type="date"
                  max={today}
                  value={d.date}
                  onChange={(e) => set({ date: e.target.value })}
                />
              )}
            </Field>
            <ChoiceGroup
              legend="Time of day"
              hint="Never an exact time."
              options={TIMES_OF_DAY.map((t) => ({ value: t, label: TOD_LABEL[t] }))}
              value={d.timeOfDay ? [d.timeOfDay] : []}
              onChange={([timeOfDay]) => set({ timeOfDay })}
              error={liveErrors.timeOfDay}
            />
          </div>
        </Card>

        <Card className="space-y-6 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-bold uppercase">Metrics</h2>
            <UnitsToggle
              onUnitsChange={(next, prev) => {
                const v = num(d.distance)
                if (!d.sport || !Number.isFinite(v)) return
                const m = displayToMeters(v, d.sport, prev)
                const conv = metersToDisplay(m, d.sport, next)
                const elev = num(d.elevation)
                set({
                  distance: String(Math.round(conv * 100) / 100),
                  elevation: Number.isFinite(elev)
                    ? String(Math.round(next === 'imperial' ? elev / M_PER_FT : elev * M_PER_FT))
                    : d.elevation,
                })
              }}
            />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field
              label={`Distance (${d.sport ? distanceUnit(d.sport, units) : units === 'imperial' ? 'mi' : 'km'})`}
              error={liveErrors.distance}
            >
              {(p) => (
                <TextInput
                  {...p}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  value={d.distance}
                  onChange={(e) => set({ distance: e.target.value })}
                />
              )}
            </Field>
            <fieldset aria-describedby={liveErrors.time ? 'time-err' : undefined}>
              <legend className="mb-1.5 text-sm font-semibold">Moving time</legend>
              <div className="flex items-center gap-2">
                {(['hours', 'minutes', 'seconds'] as const).map((k) => (
                  <label key={k} className="flex-1">
                    <span className="sr-only">{k}</span>
                    <div className="relative">
                      <TextInput
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={k === 'hours' ? 48 : 59}
                        value={d[k]}
                        aria-invalid={liveErrors.time ? true : undefined}
                        onChange={(e) => set({ [k]: e.target.value } as Partial<Draft>)}
                        className="pr-8"
                      />
                      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted">
                        {k[0]}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
              {liveErrors.time && (
                <p id="time-err" className="mt-1.5 text-sm font-medium text-danger" role="alert">
                  {liveErrors.time}
                </p>
              )}
            </fieldset>
          </div>

          <div
            className="flex items-center justify-between rounded-2xl bg-cream px-5 py-4"
            aria-live="polite"
          >
            <span className="text-sm font-semibold text-muted">
              {d.sport === 'ride' ? 'Average speed' : 'Average pace'}
            </span>
            <span className="font-display text-4xl font-bold">
              {d.sport ? formatPaceValue(d.sport, pace, units) : '–'}
              <span className="ml-1 text-base text-muted">
                {d.sport ? paceUnit(d.sport, units) : ''}
              </span>
            </span>
          </div>
          {liveErrors.pace && (
            <p className="-mt-3 text-sm font-medium text-danger" role="alert">
              {liveErrors.pace}
            </p>
          )}

          <div className="grid gap-6 sm:grid-cols-3">
            {d.sport !== 'swim' && (
              <Field
                label={`Elevation gain (${units === 'imperial' ? 'ft' : 'm'})`}
                hint="Optional"
                error={liveErrors.elevation}
              >
                {(p) => (
                  <TextInput
                    {...p}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={d.elevation}
                    onChange={(e) => set({ elevation: e.target.value })}
                  />
                )}
              </Field>
            )}
            <Field label="Avg heart rate (bpm)" hint="Optional" error={liveErrors.avgHr}>
              {(p) => (
                <TextInput
                  {...p}
                  type="number"
                  inputMode="numeric"
                  min={40}
                  max={230}
                  value={d.avgHr}
                  onChange={(e) => set({ avgHr: e.target.value })}
                />
              )}
            </Field>
            <Field label="Perceived effort (1–10)" hint="Optional" error={liveErrors.effort}>
              {(p) => (
                <Select {...p} value={d.effort} onChange={(e) => set({ effort: e.target.value })}>
                  <option value="">—</option>
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                      {i === 0
                        ? ' · very easy'
                        : i === 4
                          ? ' · moderate'
                          : i === 9
                            ? ' · all out'
                            : ''}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
        </Card>

        <Card className="space-y-6 p-5 sm:p-6">
          <Field
            label="Description"
            hint={`Optional · ${d.description.length}/500`}
            error={liveErrors.description}
          >
            {(p) => (
              <TextArea
                {...p}
                rows={3}
                maxLength={500}
                placeholder="How did it feel?"
                value={d.description}
                onChange={(e) => set({ description: e.target.value })}
              />
            )}
          </Field>
          <ChoiceGroup
            legend="Logged with"
            hint="Just a label. Zone Two doesn’t connect to other apps."
            options={LOGGED_WITH.map((l) => ({ value: l, label: l }))}
            value={[d.loggedWith]}
            onChange={([loggedWith]) => set({ loggedWith })}
          />
          <PhotoPicker
            label="Photos"
            hint="Up to 4."
            max={4}
            photos={d.photos}
            onChange={(photos) => set({ photos })}
          />
        </Card>

        <div className="flex justify-end gap-3 pb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" size="lg">
            Post activity
          </Button>
        </div>
      </form>
    </Page>
  )
}
