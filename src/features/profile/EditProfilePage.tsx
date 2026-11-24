import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAppStore } from '../../store/store'
import { Button, Card, Page, PageHeader } from '../../components/ui'
import {
  AboutFields,
  BasicsFields,
  PreferencesFields,
  TrainingFields,
  athleteFromDraft,
  draftFromAthlete,
  isUnderage,
  validateAbout,
  validateBasics,
  validatePreferences,
  validateTraining,
  type Errors,
  type ProfileDraft,
} from '../onboarding/profileForm'

export function EditProfilePage() {
  const navigate = useNavigate()
  const me = useAppStore((s) => s.me)!
  const units = useAppStore((s) => s.units)
  const update = useAppStore((s) => s.updateProfile)
  const toast = useAppStore((s) => s.toast)
  const [draft, setDraft] = useState<ProfileDraft>(() => draftFromAthlete(me, units))
  const [errors, setErrors] = useState<Errors>({})
  const set = (patch: Partial<ProfileDraft>) => setDraft((d) => ({ ...d, ...patch }))

  function save() {
    const e = {
      ...validateBasics(draft),
      ...validatePreferences(draft),
      ...validateTraining(draft, units),
      ...validateAbout(draft),
    }
    if (isUnderage(draft)) e.birthDate = 'Zone Two is for adults 18 and over.'
    setErrors(e)
    if (Object.keys(e).length) {
      window.setTimeout(
        () => (document.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus(),
        0,
      )
      return
    }
    const next = athleteFromDraft(draft, units)
    update({ ...next, ageMin: me.ageMin, ageMax: me.ageMax })
    toast('Profile saved')
    navigate('/profile')
  }

  const sections = [
    { title: 'The basics', body: <BasicsFields draft={draft} set={set} errors={errors} /> },
    { title: 'Who you are', body: <PreferencesFields draft={draft} set={set} errors={errors} /> },
    {
      title: 'Training',
      body: <TrainingFields draft={draft} set={set} errors={errors} units={units} />,
    },
    { title: 'Photos & bio', body: <AboutFields draft={draft} set={set} errors={errors} /> },
  ]

  return (
    <Page>
      <PageHeader title="Edit profile" />
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
        className="space-y-6"
      >
        {sections.map((s) => (
          <Card key={s.title} className="p-5 sm:p-6">
            <h2 className="mb-5 font-display text-2xl font-bold uppercase">{s.title}</h2>
            {s.body}
          </Card>
        ))}
        <div className="flex justify-end gap-3 pb-6">
          <Button variant="ghost" onClick={() => navigate('/profile')}>
            Cancel
          </Button>
          <Button type="submit" size="lg">
            Save profile
          </Button>
        </div>
      </form>
    </Page>
  )
}
