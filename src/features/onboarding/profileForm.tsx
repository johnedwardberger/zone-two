/*
 * Profile fields shared by onboarding (one group per step) and Edit Profile
 * (all groups on one page).
 */
import type { Athlete, Gender, Level, Sport, Units } from '../../types'
import { GENDERS, LEVELS, SPORTS } from '../../types'
import { CITIES } from '../../data/seed'
import { ageOn, isAdult, todayISO } from '../../lib/dates'
import { formatPaceValue, isPlausiblePace, parsePaceInput } from '../../lib/pace'
import { paceUnit } from '../../lib/units'
import { ChoiceGroup, Field, Select, TextArea, TextInput } from '../../components/ui'
import { PhotoPicker } from '../../components/PhotoPicker'
import { SportIcon, SPORT_LABEL } from '../../components/icons'
import { UnitsToggle } from '../../components/UnitsToggle'

export type ProfileDraft = {
  firstName: string
  birthDate: string
  cityId: string
  gender: Gender | null
  meet: Gender[]
  sports: Sport[]
  weeklyHours: string
  level: Level | null
  paceInputs: Record<Sport, string>
  photos: string[]
  bio: string
  idealDate: string
}

export const GENDER_LABEL: Record<Gender, string> = {
  woman: 'Woman',
  man: 'Man',
  nonbinary: 'Non-binary',
}
export const MEET_LABEL: Record<Gender, string> = {
  woman: 'Women',
  man: 'Men',
  nonbinary: 'Non-binary people',
}
export const LEVEL_LABEL: Record<Level, string> = {
  recreational: 'Recreational',
  competitive: 'Competitive',
  elite: 'Elite / pro',
}

export const emptyDraft = (): ProfileDraft => ({
  firstName: '',
  birthDate: '',
  cityId: '',
  gender: null,
  meet: [],
  sports: [],
  weeklyHours: '',
  level: null,
  paceInputs: { run: '', ride: '', swim: '' },
  photos: [],
  bio: '',
  idealDate: '',
})

export function draftFromAthlete(a: Athlete, units: Units): ProfileDraft {
  const paceInputs = { run: '', ride: '', swim: '' }
  for (const s of SPORTS) {
    const p = a.paces[s]
    if (p !== undefined) paceInputs[s] = formatPaceValue(s, p, units)
  }
  return {
    firstName: a.firstName,
    birthDate: a.birthDate,
    cityId: a.cityId,
    gender: a.gender,
    meet: a.meet,
    sports: a.sports,
    weeklyHours: String(a.weeklyHours),
    level: a.level,
    paceInputs,
    photos: a.photos,
    bio: a.bio,
    idealDate: a.idealDate,
  }
}

export function athleteFromDraft(d: ProfileDraft, units: Units): Athlete {
  const paces: Athlete['paces'] = {}
  for (const s of d.sports) paces[s] = parsePaceInput(s, d.paceInputs[s], units)
  const initial = d.firstName.trim()[0]?.toUpperCase() ?? 'Z'
  return {
    id: 'me',
    firstName: d.firstName.trim(),
    birthDate: d.birthDate,
    cityId: d.cityId,
    gender: d.gender ?? 'nonbinary',
    meet: d.meet,
    ageMin: 18,
    ageMax: 70,
    sports: d.sports,
    weeklyHours: Number(d.weeklyHours),
    level: d.level ?? 'recreational',
    paces,
    bio: d.bio.trim(),
    idealDate: d.idealDate.trim(),
    // Fall back to an illustrated avatar if no photos were added.
    photos: d.photos.length
      ? d.photos
      : [`art:avatar:${(initial.charCodeAt(0) * 37) % 360}:${initial}`],
  }
}

export type Errors = Partial<Record<string, string>>

export function validateBasics(d: ProfileDraft): Errors {
  const e: Errors = {}
  if (!d.firstName.trim()) e.firstName = 'Add your first name.'
  else if (d.firstName.trim().length > 30) e.firstName = 'Keep it under 30 characters.'
  if (!d.birthDate) e.birthDate = 'Add your date of birth.'
  else if (d.birthDate > todayISO() || ageOn(d.birthDate, todayISO()) > 100)
    e.birthDate = 'Check that date.'
  if (!d.cityId) e.cityId = 'Choose your city.'
  return e
}

export function isUnderage(d: ProfileDraft): boolean {
  return !!d.birthDate && d.birthDate <= todayISO() && !isAdult(d.birthDate, todayISO())
}

export function validatePreferences(d: ProfileDraft): Errors {
  const e: Errors = {}
  if (!d.gender) e.gender = 'Choose one.'
  if (!d.meet.length) e.meet = 'Choose at least one.'
  return e
}

export function validateTraining(d: ProfileDraft, units: Units): Errors {
  const e: Errors = {}
  if (!d.sports.length) e.sports = 'Pick at least one sport.'
  const h = Number(d.weeklyHours)
  if (!d.weeklyHours.trim() || !Number.isFinite(h)) e.weeklyHours = 'Add your typical weekly hours.'
  else if (h < 0) e.weeklyHours = 'Hours can’t be negative.'
  else if (h > 40) e.weeklyHours = 'That’s more than 40 hours a week. Double-check?'
  if (!d.level) e.level = 'Choose a level.'
  for (const s of d.sports) {
    const raw = d.paceInputs[s]
    const p = parsePaceInput(s, raw, units)
    if (!raw.trim()) e[`pace-${s}`] = 'Add your typical pace.'
    else if (!Number.isFinite(p))
      e[`pace-${s}`] = s === 'ride' ? 'Use a number, like 18.5.' : 'Use minutes:seconds, like 8:15.'
    else if (!isPlausiblePace(s, p))
      e[`pace-${s}`] = 'That pace isn’t physically realistic. Check the units?'
  }
  return e
}

export function validateAbout(d: ProfileDraft): Errors {
  const e: Errors = {}
  if (d.bio.length > 300) e.bio = 'Keep your bio to 300 characters.'
  if (d.idealDate.length > 120) e.idealDate = 'Keep it to 120 characters.'
  return e
}

type StepProps = {
  draft: ProfileDraft
  set: (patch: Partial<ProfileDraft>) => void
  errors: Errors
}

export function BasicsFields({ draft, set, errors }: StepProps) {
  return (
    <div className="space-y-5">
      <Field label="First name" error={errors.firstName}>
        {(p) => (
          <TextInput
            {...p}
            autoComplete="given-name"
            value={draft.firstName}
            onChange={(e) => set({ firstName: e.target.value })}
            maxLength={40}
          />
        )}
      </Field>
      <Field
        label="Date of birth"
        hint="You must be 18 or older. Only your age is shown."
        error={errors.birthDate}
      >
        {(p) => (
          <TextInput
            {...p}
            type="date"
            autoComplete="bday"
            max={todayISO()}
            value={draft.birthDate}
            onChange={(e) => set({ birthDate: e.target.value })}
          />
        )}
      </Field>
      <Field
        label="City"
        hint="Others see your city and a rounded distance, never your location."
        error={errors.cityId}
      >
        {(p) => (
          <Select {...p} value={draft.cityId} onChange={(e) => set({ cityId: e.target.value })}>
            <option value="">Choose a city</option>
            {CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}, {c.state}
              </option>
            ))}
          </Select>
        )}
      </Field>
    </div>
  )
}

export function PreferencesFields({ draft, set, errors }: StepProps) {
  return (
    <div className="space-y-6">
      <ChoiceGroup
        legend="I am a…"
        options={GENDERS.map((g) => ({ value: g, label: GENDER_LABEL[g] }))}
        value={draft.gender ? [draft.gender] : []}
        onChange={([g]) => set({ gender: g })}
        error={errors.gender}
      />
      <ChoiceGroup
        legend="I’d like to meet…"
        hint="Choose all that apply."
        multiple
        options={GENDERS.map((g) => ({ value: g, label: MEET_LABEL[g] }))}
        value={draft.meet}
        onChange={(meet) => set({ meet })}
        error={errors.meet}
      />
    </div>
  )
}

const PACE_PLACEHOLDER: Record<Sport, Record<Units, string>> = {
  run: { imperial: '8:15', metric: '5:10' },
  ride: { imperial: '18.5', metric: '29.5' },
  swim: { imperial: '1:45', metric: '1:55' },
}

export function TrainingFields({ draft, set, errors, units }: StepProps & { units: Units }) {
  return (
    <div className="space-y-6">
      <ChoiceGroup
        legend="Sports"
        multiple
        options={SPORTS.map((s) => ({ value: s, label: SPORT_LABEL[s] }))}
        value={draft.sports}
        onChange={(sports) => set({ sports })}
        error={errors.sports}
        renderOption={(o) => (
          <>
            <SportIcon sport={o.value} className="size-4" />
            {o.label}
          </>
        )}
      />
      <Field label="Typical weekly training hours" error={errors.weeklyHours}>
        {(p) => (
          <TextInput
            {...p}
            type="number"
            inputMode="decimal"
            min={0}
            max={40}
            step={0.5}
            value={draft.weeklyHours}
            onChange={(e) => set({ weeklyHours: e.target.value })}
            className="max-w-40"
          />
        )}
      </Field>
      <ChoiceGroup
        legend="Level"
        options={LEVELS.map((l) => ({ value: l, label: LEVEL_LABEL[l] }))}
        value={draft.level ? [draft.level] : []}
        onChange={([level]) => set({ level })}
        error={errors.level}
      />
      {draft.sports.length > 0 && (
        <div className="space-y-4 rounded-2xl bg-cream p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold">Typical easy pace</p>
            <UnitsToggle />
          </div>
          {SPORTS.filter((s) => draft.sports.includes(s)).map((s) => (
            <Field
              key={s}
              label={
                <span className="inline-flex items-center gap-2">
                  <SportIcon sport={s} className="size-4" /> {SPORT_LABEL[s]} (
                  {s === 'ride' ? 'average speed, ' : ''}
                  {paceUnit(s, units)})
                </span>
              }
              error={errors[`pace-${s}`]}
            >
              {(p) => (
                <div className="flex items-center gap-2">
                  <TextInput
                    {...p}
                    inputMode={s === 'ride' ? 'decimal' : 'text'}
                    placeholder={PACE_PLACEHOLDER[s][units]}
                    value={draft.paceInputs[s]}
                    onChange={(e) =>
                      set({ paceInputs: { ...draft.paceInputs, [s]: e.target.value } })
                    }
                    className="max-w-40"
                  />
                  <span className="text-sm text-muted">{paceUnit(s, units)}</span>
                </div>
              )}
            </Field>
          ))}
        </div>
      )}
    </div>
  )
}

export function AboutFields({ draft, set, errors }: StepProps) {
  return (
    <div className="space-y-6">
      <PhotoPicker
        label="Photos"
        hint="Up to 6. Photos stay in this browser only."
        max={6}
        photos={draft.photos}
        onChange={(photos) => set({ photos })}
      />
      <Field label="Bio" hint={`${draft.bio.length}/300`} error={errors.bio}>
        {(p) => (
          <TextArea
            {...p}
            maxLength={300}
            rows={4}
            placeholder="What are you training for? What do you love about it?"
            value={draft.bio}
            onChange={(e) => set({ bio: e.target.value })}
          />
        )}
      </Field>
      <Field label="Ideal first-date workout" error={errors.idealDate}>
        {(p) => (
          <TextInput
            {...p}
            maxLength={120}
            placeholder="e.g. An easy 5 miles on the Monon, then coffee"
            value={draft.idealDate}
            onChange={(e) => set({ idealDate: e.target.value })}
          />
        )}
      </Field>
    </div>
  )
}
