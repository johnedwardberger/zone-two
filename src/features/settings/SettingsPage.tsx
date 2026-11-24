import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { ChevronRight, Crown, RotateCcw, SquarePen } from 'lucide-react'
import type { Filters, Sport } from '../../types'
import { GENDERS, LEVELS, SPORTS } from '../../types'
import { useAppStore } from '../../store/store'
import { useDerived } from '../../store/hooks'
import { selectDeck } from '../../store/selectors'
import {
  Button,
  Card,
  ChoiceGroup,
  FictionalNote,
  Modal,
  Page,
  PageHeader,
} from '../../components/ui'
import { DualRange, SingleRange } from '../../components/RangeSliders'
import { UnitsToggle } from '../../components/UnitsToggle'
import { SportIcon, SPORT_LABEL } from '../../components/icons'
import { LEVEL_LABEL, MEET_LABEL } from '../onboarding/profileForm'
import { PACE_FILTER_BOUNDS, broadFilters } from '../../lib/matching'
import { displayToKm, kmToDisplay, longDistanceUnit, paceUnit } from '../../lib/units'
import { formatPaceValue } from '../../lib/pace'

const PACE_STEP: Record<Sport, number> = { run: 5, ride: 0.5, swim: 5 }
const RADIUS_MAX = 150 // display units; the max means "anywhere"

export function SettingsPage() {
  const navigate = useNavigate()
  const { hash } = useLocation()
  const filters = useAppStore((s) => s.filters)
  const units = useAppStore((s) => s.units)
  const me = useAppStore((s) => s.me)!
  const setFilters = useAppStore((s) => s.setFilters)
  const widen = useAppStore((s) => s.widenFilters)
  const resetDemo = useAppStore((s) => s.resetDemo)
  const deckSize = useDerived((s) => selectDeck(s).length)
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    if (hash === '#filters') document.getElementById('filters')?.scrollIntoView({ block: 'start' })
  }, [hash])

  const update = (patch: Partial<Filters>) => setFilters({ ...filters, ...patch })
  const unit = longDistanceUnit(units)
  const radiusDisplay =
    filters.radiusKm === null ? RADIUS_MAX : Math.round(kmToDisplay(filters.radiusKm, units))

  return (
    <Page>
      <PageHeader title="Settings" />

      <div className="space-y-6">
        <Card className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
          <div>
            <h2 className="font-display text-2xl font-bold uppercase">Units</h2>
            <p className="text-sm text-muted">Used for distances, paces and speeds everywhere.</p>
          </div>
          <UnitsToggle />
        </Card>

        <Card className="scroll-mt-6 p-5 sm:p-6">
          <section id="filters" aria-labelledby="filters-title" className="scroll-mt-6">
            <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="filters-title" className="font-display text-2xl font-bold uppercase">
                Discovery filters
              </h2>
              <p className="text-sm font-semibold text-primary-pressed" aria-live="polite">
                {deckSize} {deckSize === 1 ? 'athlete' : 'athletes'} to discover
              </p>
            </div>
            <p className="mb-6 text-sm text-muted">
              Changes apply right away. There’s no minimum activity requirement; training volume is
              just a filter.
            </p>

            <div className="space-y-7">
              <ChoiceGroup
                legend="Sports"
                multiple
                options={SPORTS.map((s) => ({ value: s, label: SPORT_LABEL[s] }))}
                value={filters.sports}
                onChange={(sports) => update({ sports })}
                error={filters.sports.length ? null : 'Pick at least one sport to see anyone.'}
                renderOption={(o) => (
                  <>
                    <SportIcon sport={o.value} className="size-4" />
                    {o.label}
                  </>
                )}
              />
              <DualRange
                label="Age range"
                min={18}
                max={70}
                value={[filters.ageMin, filters.ageMax]}
                onChange={([ageMin, ageMax]) => update({ ageMin, ageMax })}
                format={(v) => (v === 70 ? '70+' : String(v))}
                minLabel="Youngest"
                maxLabel="Oldest"
              />
              <ChoiceGroup
                legend="Show me"
                multiple
                options={GENDERS.map((g) => ({ value: g, label: MEET_LABEL[g] }))}
                value={filters.meet}
                onChange={(meet) => update({ meet })}
                error={filters.meet.length ? null : 'Choose at least one.'}
              />
              <SingleRange
                label={`Distance from ${me.cityId ? 'my city' : 'me'}`}
                min={5}
                max={RADIUS_MAX}
                step={5}
                value={radiusDisplay}
                onChange={(v) =>
                  update({ radiusKm: v >= RADIUS_MAX ? null : displayToKm(v, units) })
                }
                format={(v) => (v >= RADIUS_MAX ? 'Anywhere' : `Within ${v} ${unit}`)}
              />
              <SingleRange
                label="Minimum weekly training"
                min={0}
                max={20}
                value={filters.minWeeklyHours}
                onChange={(minWeeklyHours) => update({ minWeeklyHours })}
                format={(v) => (v === 0 ? 'Any' : `${v}+ h/week`)}
              />
              <ChoiceGroup
                legend="Level"
                multiple
                options={LEVELS.map((l) => ({ value: l, label: LEVEL_LABEL[l] }))}
                value={filters.levels}
                onChange={(levels) => update({ levels })}
                error={filters.levels.length ? null : 'Choose at least one level.'}
              />
              <div role="group" aria-labelledby="pace-title" className="space-y-6">
                <div>
                  <p id="pace-title" className="text-sm font-semibold">
                    Typical pace
                  </p>
                  <p className="text-sm text-muted">
                    “Any” at either end includes everyone faster or slower.
                  </p>
                </div>
                {SPORTS.filter((s) => filters.sports.includes(s)).map((s) => {
                  const [bLo, bHi] = PACE_FILTER_BOUNDS[s]
                  // Slider ends are open-ended, so they read "Any".
                  const fmt = (v: number) =>
                    v <= bLo || v >= bHi
                      ? 'Any'
                      : `${formatPaceValue(s, v, units)}${s === 'ride' ? ' ' : ''}${paceUnit(s, units)}`
                  return (
                    <DualRange
                      key={s}
                      label={`${SPORT_LABEL[s]} ${s === 'ride' ? 'speed' : 'pace'}`}
                      min={bLo}
                      max={bHi}
                      step={PACE_STEP[s]}
                      value={filters.paceRanges[s]}
                      onChange={(v) => update({ paceRanges: { ...filters.paceRanges, [s]: v } })}
                      format={fmt}
                      minLabel={s === 'ride' ? 'Slowest' : 'Fastest'}
                      maxLabel={s === 'ride' ? 'Fastest' : 'Slowest'}
                    />
                  )
                })}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setFilters(broadFilters(me.meet))}>
                Reset filters
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  widen()
                  navigate('/discover')
                }}
              >
                Widen filters & show passed athletes
              </Button>
            </div>
          </section>
        </Card>

        <Card as="div" className="divide-y divide-hairline overflow-hidden">
          <Link to="/pro" className="flex items-center gap-4 px-5 py-4 hover:bg-cream sm:px-6">
            <Crown className="size-5 text-primary-strong" aria-hidden />
            <span className="flex-1">
              <span className="block font-semibold">Zone Two Pro</span>
              <span className="text-sm text-muted">
                See who sent you a Pulse, boosts, travel mode
              </span>
            </span>
            <ChevronRight className="size-5 text-muted" aria-hidden />
          </Link>
          <Link
            to="/profile/edit"
            className="flex items-center gap-4 px-5 py-4 hover:bg-cream sm:px-6"
          >
            <SquarePen className="size-5 text-muted" aria-hidden />
            <span className="flex-1 font-semibold">Edit profile</span>
            <ChevronRight className="size-5 text-muted" aria-hidden />
          </Link>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-2xl font-bold uppercase">Reset demo</h2>
          <p className="mt-1 mb-4 text-sm text-muted">
            Clears your demo profile, swipes, matches and chats, and restores the original fictional
            athletes.
          </p>
          <Button variant="danger" onClick={() => setConfirmReset(true)}>
            <RotateCcw className="size-4" aria-hidden /> Reset demo
          </Button>
        </Card>
        <FictionalNote className="pb-6 text-center" />
      </div>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset the demo?">
        <p className="text-muted">
          Everything you’ve done in this browser will be cleared. This can’t be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmReset(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setConfirmReset(false)
              resetDemo()
              navigate('/')
            }}
          >
            Reset demo
          </Button>
        </div>
      </Modal>
    </Page>
  )
}
