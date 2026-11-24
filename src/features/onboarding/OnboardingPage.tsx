import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { Logo } from '../../components/Logo'
import { Button } from '../../components/ui'
import { useAppStore } from '../../store/store'
import {
  AboutFields,
  BasicsFields,
  PreferencesFields,
  TrainingFields,
  athleteFromDraft,
  emptyDraft,
  isUnderage,
  validateAbout,
  validateBasics,
  validatePreferences,
  validateTraining,
  type Errors,
  type ProfileDraft,
} from './profileForm'

const STEPS = [
  { title: 'The basics', subtitle: 'Just enough to set up your demo profile.' },
  { title: 'Who you are', subtitle: 'And who you’d like to meet.' },
  { title: 'Your training', subtitle: 'This helps find people who train like you.' },
  { title: 'Show yourself', subtitle: 'Photos, a short bio and your ideal first date.' },
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const units = useAppStore((s) => s.units)
  const complete = useAppStore((s) => s.completeOnboarding)
  const loadSample = useAppStore((s) => s.loadSampleProfile)
  const toast = useAppStore((s) => s.toast)
  const hasProfile = useAppStore((s) => !!s.me)
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<ProfileDraft>(emptyDraft)
  const [errors, setErrors] = useState<Errors>({})
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (hasProfile) navigate('/discover', { replace: true })
  }, [hasProfile, navigate])

  useEffect(() => {
    headingRef.current?.focus()
  }, [step])

  const set = (patch: Partial<ProfileDraft>) => {
    setDraft((d) => ({ ...d, ...patch }))
    setErrors((e) => {
      const next = { ...e }
      for (const k of Object.keys(patch)) delete next[k]
      if ('paceInputs' in patch)
        for (const k of Object.keys(next)) if (k.startsWith('pace-')) delete next[k]
      return next
    })
  }

  const underage = step === 0 && isUnderage(draft)
  const validators = [
    validateBasics,
    validatePreferences,
    (d: ProfileDraft) => validateTraining(d, units),
    validateAbout,
  ]

  function next() {
    const e = validators[step](draft)
    if (Object.keys(e).length) {
      setErrors(e)
      return
    }
    if (underage) return
    if (step < STEPS.length - 1) {
      setStep(step + 1)
      setErrors({})
      return
    }
    complete(athleteFromDraft(draft, units))
    finish()
  }

  function finish() {
    toast('Welcome to Zone Two! You have 2 match requests waiting.', {
      label: 'View',
      to: '/matches',
    })
    navigate('/discover')
  }

  function skip() {
    loadSample()
    finish()
  }

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-xl items-center justify-between px-5 py-5">
        <Logo className="h-6 sm:h-7" />
        <button
          type="button"
          onClick={skip}
          className="-mr-3 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold whitespace-nowrap text-primary-strong hover:bg-primary-soft"
        >
          <Sparkles className="hidden size-4 sm:block" aria-hidden /> Skip: use a sample profile
        </button>
      </header>

      <main className="mx-auto max-w-xl px-5 pb-16">
        {/* Progress */}
        <div className="mb-6">
          <p className="mb-2 text-sm font-medium text-muted" id="progress-label">
            Step {step + 1} of {STEPS.length}
          </p>
          <div
            role="progressbar"
            aria-labelledby="progress-label"
            aria-valuemin={1}
            aria-valuemax={STEPS.length}
            aria-valuenow={step + 1}
            className="flex gap-1.5"
          >
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= step ? 'bg-primary-strong' : 'bg-hairline'}`}
              />
            ))}
          </div>
        </div>

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            next()
          }}
          className="animate-rise rounded-card bg-surface p-6 shadow-card sm:p-8"
          key={step}
        >
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-4xl font-bold uppercase outline-none"
          >
            {STEPS[step].title}
          </h1>
          <p className="mt-1 mb-6 text-muted">{STEPS[step].subtitle}</p>

          {step === 0 && <BasicsFields draft={draft} set={set} errors={errors} />}
          {step === 1 && <PreferencesFields draft={draft} set={set} errors={errors} />}
          {step === 2 && <TrainingFields draft={draft} set={set} errors={errors} units={units} />}
          {step === 3 && <AboutFields draft={draft} set={set} errors={errors} />}

          {underage && (
            <div role="alert" className="mt-6 rounded-2xl bg-primary-soft p-4 text-ink">
              <p className="font-semibold">Zone Two is for adults 18 and over.</p>
              <p className="mt-1 text-sm">
                Thanks for your interest! Keep training, and come back when you turn 18.
              </p>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="size-4" aria-hidden /> Back
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" disabled={underage}>
              {step === STEPS.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
        </form>
        <p className="mt-6 text-center text-xs text-muted">
          This is a demo. Everything stays in your browser, and all other profiles are fictional.
        </p>
      </main>
    </div>
  )
}
