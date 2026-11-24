import { lazy, Suspense, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { ArrowLeft, Lightbulb, MapPin, Send, ShieldCheck } from 'lucide-react'
import type { Sport, TimeOfDay } from '../../types'
import { SPORTS, TIMES_OF_DAY } from '../../types'
import { useAppStore } from '../../store/store'
import { useDerived } from '../../store/hooks'
import { athleteById, isMatched } from '../../store/selectors'
import { Button, ButtonLink, Card, ChoiceGroup, Field, Page, TextInput } from '../../components/ui'
import { SportIcon, SPORT_LABEL } from '../../components/icons'
import { ROUTES } from '../../data/routes'
import { addDays, todayISO } from '../../lib/dates'
import {
  DEFAULT_PACE,
  closestOption,
  routesForSport,
  sharedSports,
  suggestFirstDate,
} from '../../lib/matching'
import {
  displayToMeters,
  distanceUnit,
  formatDistance,
  metersToDisplay,
  paceUnit,
  roundDistanceM,
} from '../../lib/units'
import { formatPaceValue, isPlausiblePace, isSlower, parsePaceInput } from '../../lib/pace'

const RouteMap = lazy(() => import('./RouteMap'))
const TOD_LABEL: Record<TimeOfDay, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
}
const CUSTOM = 'custom'

export function PlanDatePage() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const core = useDerived((s) => s)
  const sendProposal = useAppStore((s) => s.sendProposal)
  const units = core.units
  const me = core.me!
  const athlete = athleteById(core, id)
  const editing = params.get('edit')
  const existing = editing ? core.messages[id]?.find((m) => m.id === editing)?.proposal : undefined

  const shared = athlete ? sharedSports(me, athlete) : []
  const sportOptions: Sport[] = shared.length ? shared : SPORTS.filter((s) => me.sports.includes(s))

  const initial = useMemo(() => {
    if (!athlete) return null
    const sug = suggestFirstDate(me, athlete, core.activities, ROUTES, existing?.sport)
    return {
      sport: existing?.sport ?? sug.sport,
      routeId: existing ? (existing.routeId ?? CUSTOM) : (sug.route?.id ?? CUSTOM),
      customSpot: existing?.customSpot ?? '',
      distance: String(
        Math.round(
          metersToDisplay(
            existing?.distanceM ?? roundDistanceM(sug.distanceM, sug.sport, units),
            sug.sport,
            units,
          ) * 10,
        ) / 10,
      ),
      pace: formatPaceValue(sug.sport, existing?.pace ?? sug.pace, units),
      day: existing?.day ?? addDays(todayISO(), (6 - new Date().getDay() + 7) % 7 || 7),
      timeOfDay: existing?.timeOfDay ?? ('morning' as TimeOfDay),
    }
    // Only computed once, when the planner opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [athlete?.id])

  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!athlete || !isMatched(core, id) || !form) {
    return (
      <Page>
        <Card className="p-8 text-center">
          <h1 className="font-display text-3xl font-bold uppercase">Planner not available</h1>
          <p className="mt-2 text-muted">You can plan workout dates with your matches.</p>
          <ButtonLink to="/matches" className="mt-6">
            Back to Matches
          </ButtonLink>
        </Card>
      </Page>
    )
  }

  const set = (patch: Partial<NonNullable<typeof form>>) =>
    setForm((f) => (f ? { ...f, ...patch } : f))
  const sport = form.sport
  const targetM = displayToMeters(Number(form.distance) || 0, sport, units)
  const routes = routesForSport(ROUTES, sport, targetM || 5000)

  function chooseSport(next: Sport) {
    const sug = suggestFirstDate(me, athlete!, core.activities, ROUTES, next)
    set({
      sport: next,
      routeId: sug.route?.id ?? CUSTOM,
      distance: String(
        Math.round(metersToDisplay(roundDistanceM(sug.distanceM, next, units), next, units) * 10) /
          10,
      ),
      pace: formatPaceValue(next, sug.pace, units),
    })
    setErrors({})
  }

  function chooseRoute(routeId: string) {
    const r = ROUTES.find((x) => x.id === routeId)
    const patch: Partial<NonNullable<typeof form>> = { routeId }
    if (r && targetM > 0) {
      const opt = closestOption(r, targetM)
      patch.distance = String(
        Math.round(metersToDisplay(roundDistanceM(opt, sport, units), sport, units)),
      )
    }
    set(patch)
  }

  function submit() {
    const e: Record<string, string> = {}
    if (form!.routeId === CUSTOM && form!.customSpot.trim().length < 3)
      e.customSpot = 'Add a public meeting spot.'
    const dist = Number(form!.distance)
    if (!form!.distance.trim() || !Number.isFinite(dist) || dist <= 0)
      e.distance = 'Add a distance greater than zero.'
    const pace = parsePaceInput(sport, form!.pace, units)
    if (!Number.isFinite(pace))
      e.pace = sport === 'ride' ? 'Use a number, like 17.5.' : 'Use minutes:seconds, like 8:30.'
    else if (!isPlausiblePace(sport, pace)) e.pace = 'That target isn’t physically realistic.'
    if (!form!.day || form!.day < todayISO()) e.day = 'Pick today or a future day.'
    else if (form!.day > addDays(todayISO(), 60)) e.day = 'Pick a day in the next two months.'
    setErrors(e)
    if (Object.keys(e).length) {
      window.setTimeout(
        () => (document.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus(),
        0,
      )
      return
    }
    sendProposal(id, {
      sport,
      routeId: form!.routeId === CUSTOM ? undefined : form!.routeId,
      customSpot: form!.routeId === CUSTOM ? form!.customSpot.trim() : undefined,
      distanceM: displayToMeters(dist, sport, units),
      pace,
      day: form!.day,
      timeOfDay: form!.timeOfDay,
    })
    navigate(`/matches/${id}`)
  }

  const mine = me.paces[sport] ?? DEFAULT_PACE[sport]
  const theirs = athlete.paces[sport] ?? DEFAULT_PACE[sport]
  const slower =
    isSlower(sport, mine, theirs) || mine === theirs ? 'your' : `${athlete.firstName}’s`

  return (
    <Page>
      <Link
        to={`/matches/${id}`}
        className="mb-3 inline-flex items-center gap-1.5 rounded-full py-2 pr-3 text-sm font-semibold hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden /> Back to chat
      </Link>
      <header className="mb-6">
        <h1 className="font-display text-4xl font-bold uppercase desk:text-5xl">
          Plan a workout date
        </h1>
        <p className="mt-1 text-muted">
          With {athlete.firstName}. We’ll send it as a proposal in your chat.
        </p>
      </header>

      <div className="mb-6 flex gap-3 rounded-2xl bg-swim p-4 text-swim-ink">
        <ShieldCheck className="mt-0.5 size-5 shrink-0" aria-hidden />
        <p className="text-sm">
          <span className="font-semibold">Safety tip:</span> meet at a public, busy spot in
          daylight, and tell a friend your plans.
        </p>
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="space-y-6"
      >
        <Card className="p-5 sm:p-6">
          <h2 className="mb-4 font-display text-2xl font-bold uppercase">1 · Sport</h2>
          <ChoiceGroup
            legend={shared.length ? 'Sports you share' : 'Your sports'}
            options={sportOptions.map((s) => ({ value: s, label: SPORT_LABEL[s] }))}
            value={[sport]}
            onChange={([s]) => chooseSport(s)}
            renderOption={(o) => (
              <>
                <SportIcon sport={o.value} className="size-4" />
                {o.label}
              </>
            )}
          />
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="mb-1 font-display text-2xl font-bold uppercase">2 · Where</h2>
          <p className="mb-4 text-sm text-muted">
            Well-known public places in Indianapolis, best fit first.
          </p>
          <fieldset>
            <legend className="sr-only">Suggested routes</legend>
            <ul className="grid gap-4">
              {routes.map((r) => {
                const selected = form.routeId === r.id
                return (
                  <li key={r.id}>
                    <label
                      className={`block cursor-pointer overflow-hidden rounded-2xl border-2 bg-surface transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-strong ${selected ? 'border-primary-strong' : 'border-hairline hover:border-line/60'}`}
                    >
                      <input
                        type="radio"
                        name="route"
                        className="sr-only"
                        checked={selected}
                        onChange={() => chooseRoute(r.id)}
                      />
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-semibold">{r.name}</p>
                            <p className="text-sm text-muted">{r.surface}</p>
                          </div>
                          <span
                            aria-hidden
                            className={`mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${selected ? 'border-primary-strong bg-primary-strong' : 'border-line'}`}
                          >
                            {selected && <span className="size-2 rounded-full bg-white" />}
                          </span>
                        </div>
                        <p className="mt-2 text-[15px]">{r.description}</p>
                        <p className="mt-2 flex items-start gap-1.5 text-sm">
                          <MapPin className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
                          <span>
                            <span className="text-muted">Meet at </span>
                            {r.meetingPoint}
                          </span>
                        </p>
                        <p className="mt-2 text-sm text-muted">
                          Distances:{' '}
                          {[
                            ...new Set(
                              r.distanceOptionsM.map((d) =>
                                formatDistance(roundDistanceM(d, sport, units), sport, units),
                              ),
                            ),
                          ].join(' · ')}
                        </p>
                      </div>
                    </label>
                    {selected && (
                      <figure className="mt-2">
                        <Suspense
                          fallback={<div className="h-40 animate-pulse rounded-xl bg-hairline" />}
                        >
                          <RouteMap route={r} />
                        </Suspense>
                        <figcaption className="mt-1 text-xs text-muted">
                          Map of the public {r.path.length > 1 ? 'route' : 'venue'}. The dot marks
                          the meeting point.
                        </figcaption>
                      </figure>
                    )}
                  </li>
                )
              })}
              <li>
                <label
                  className={`block cursor-pointer rounded-2xl border-2 bg-surface p-4 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-strong ${form.routeId === CUSTOM ? 'border-primary-strong' : 'border-hairline hover:border-line/60'}`}
                >
                  <input
                    type="radio"
                    name="route"
                    className="sr-only"
                    checked={form.routeId === CUSTOM}
                    onChange={() => set({ routeId: CUSTOM })}
                  />
                  <p className="font-semibold">Somewhere else</p>
                  <p className="text-sm text-muted">
                    Enter a public meeting spot, like a trailhead or pool entrance.
                  </p>
                </label>
                {form.routeId === CUSTOM && (
                  <Field label="Public meeting spot" error={errors.customSpot} className="mt-3">
                    {(p) => (
                      <TextInput
                        {...p}
                        maxLength={100}
                        placeholder="e.g. Broad Ripple Park main lot"
                        value={form.customSpot}
                        onChange={(e) => set({ customSpot: e.target.value })}
                      />
                    )}
                  </Field>
                )}
              </li>
            </ul>
          </fieldset>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="mb-4 font-display text-2xl font-bold uppercase">3 · Distance & pace</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={`Distance (${distanceUnit(sport, units)})`} error={errors.distance}>
              {(p) => (
                <TextInput
                  {...p}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  value={form.distance}
                  onChange={(e) => set({ distance: e.target.value })}
                />
              )}
            </Field>
            <Field
              label={`Target ${sport === 'ride' ? 'speed' : 'pace'} (${paceUnit(sport, units)})`}
              hint={`Suggested from ${slower} comfortable pace, the slower of you two.`}
              error={errors.pace}
            >
              {(p) => (
                <TextInput
                  {...p}
                  inputMode={sport === 'ride' ? 'decimal' : 'text'}
                  value={form.pace}
                  onChange={(e) => set({ pace: e.target.value })}
                />
              )}
            </Field>
          </div>
          <p className="mt-4 flex items-start gap-2 text-sm text-muted">
            <Lightbulb className="mt-0.5 size-4 shrink-0" aria-hidden />
            First dates go best at conversation pace. Zone two, literally.
          </p>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="mb-4 font-display text-2xl font-bold uppercase">4 · When</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Day" error={errors.day}>
              {(p) => (
                <TextInput
                  {...p}
                  type="date"
                  min={todayISO()}
                  max={addDays(todayISO(), 60)}
                  value={form.day}
                  onChange={(e) => set({ day: e.target.value })}
                />
              )}
            </Field>
            <ChoiceGroup
              legend="Time of day"
              options={TIMES_OF_DAY.map((t) => ({ value: t, label: TOD_LABEL[t] }))}
              value={[form.timeOfDay]}
              onChange={([timeOfDay]) => set({ timeOfDay })}
            />
          </div>
        </Card>

        <div className="flex justify-end gap-3 pb-6">
          <Button variant="ghost" onClick={() => navigate(`/matches/${id}`)}>
            Cancel
          </Button>
          <Button type="submit" size="lg">
            <Send className="size-4" aria-hidden />{' '}
            {existing ? 'Send updated plan' : 'Send proposal'}
          </Button>
        </div>
      </form>
    </Page>
  )
}
