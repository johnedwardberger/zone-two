import { ArrowRight, CalendarHeart, Send, Upload } from 'lucide-react'
import { Logo } from '../../components/Logo'
import { Photo } from '../../components/Photo'
import { KudosIcon, SportIcon } from '../../components/icons'
import { ButtonLink } from '../../components/ui'
import { useAppStore } from '../../store/store'
import type { Sport } from '../../types'

const STEPS = [
  {
    icon: <Upload className="size-6" aria-hidden />,
    title: 'Post your workout',
    body: 'Add the run, ride or swim you logged in Strava, Nike Run Club, Garmin or Apple Fitness. No GPS maps, ever.',
  },
  {
    icon: <KudosIcon className="size-6" />,
    title: 'Give Kudos',
    body: 'Like someone’s session? Give it Kudos. They’re private until they’re mutual.',
  },
  {
    icon: <Send className="size-6" aria-hidden />,
    title: 'Request a match',
    body: 'Mutual Kudos unlocks a match request. Add a note if you want to.',
  },
  {
    icon: <CalendarHeart className="size-6" aria-hidden />,
    title: 'Train together',
    body: 'Plan a first date that’s a workout, on a public route you both love.',
  },
]

const WHO: { sport: Sport; title: string; body: string }[] = [
  { sport: 'run', title: 'Runners', body: 'From marathon blocks to track Tuesdays.' },
  { sport: 'ride', title: 'Cyclists', body: 'Road, gravel, crits and long Saturday miles.' },
  { sport: 'swim', title: 'Swimmers', body: 'Masters lanes, open water and triathletes.' },
]

export function LandingPage() {
  const hasProfile = useAppStore((s) => !!s.me)
  const cta = hasProfile ? (
    <ButtonLink to="/discover" size="lg">
      Continue the demo <ArrowRight className="size-5" aria-hidden />
    </ButtonLink>
  ) : (
    <ButtonLink to="/onboarding" size="lg">
      Try the demo <ArrowRight className="size-5" aria-hidden />
    </ButtonLink>
  )

  return (
    <div className="min-h-dvh overflow-x-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 desk:px-10">
        <Logo className="h-7 desk:h-8" />
        <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted shadow-card">
          Demo
        </span>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pt-6 pb-16 desk:grid-cols-[1.1fr_1fr] desk:px-10 desk:pt-12 desk:pb-24">
          <div className="animate-rise">
            <h1 className="font-display text-6xl leading-[0.95] font-bold tracking-tight uppercase sm:text-7xl desk:text-8xl">
              Find someone <span className="text-primary-strong">in your zone.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted">
              Zone Two is dating for runners, cyclists and swimmers who train for real. Share your
              sessions, trade Kudos, and make your first date a workout.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {cta}
              <span className="text-sm text-muted">No sign-up. Takes about a minute.</span>
            </div>
          </div>

          <div aria-hidden className="relative mx-auto h-[27rem] w-full max-w-md sm:h-[31rem]">
            <HeroCard
              className="absolute top-6 left-0 w-[52%] -rotate-6"
              src="art:scene:run:0"
              stat="7:48"
              unit="/mi"
              label="Easy miles"
            />
            <HeroCard
              className="absolute top-0 right-0 w-[52%] rotate-3"
              src="art:scene:ride:4"
              stat="19.6"
              unit="mph"
              label="Coffee ride"
            />
            <HeroCard
              className="absolute bottom-0 left-[24%] w-[52%] rotate-[-1deg]"
              src="art:scene:swim:2"
              stat="1:32"
              unit="/100yd"
              label="Masters practice"
            />
            <span className="absolute bottom-[16%] left-[3%] flex size-16 animate-pop items-center justify-center rounded-full bg-celebrate text-white shadow-lift">
              <KudosIcon filled className="size-8" />
            </span>
          </div>
        </section>

        {/* How it works */}
        <section aria-labelledby="how" className="bg-surface py-16 desk:py-24">
          <div className="mx-auto max-w-6xl px-5 desk:px-10">
            <h2 id="how" className="font-display text-4xl font-bold uppercase desk:text-5xl">
              How it works
            </h2>
            <ol className="mt-8 grid gap-4 sm:grid-cols-2 desk:grid-cols-4">
              {STEPS.map((s, i) => (
                <li key={s.title} className="rounded-card bg-cream p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-strong">
                      {s.icon}
                    </span>
                    <span className="font-display text-5xl font-bold text-primary/50">{i + 1}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-muted">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Who it's for */}
        <section
          aria-labelledby="who"
          className="mx-auto max-w-6xl px-5 py-16 desk:px-10 desk:py-24"
        >
          <h2 id="who" className="font-display text-4xl font-bold uppercase desk:text-5xl">
            Built for people who train
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-muted">
            Runners, cyclists and swimmers who take training seriously, from dedicated amateurs to
            pros. Because fit people want to be with fit people.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {WHO.map((w) => (
              <li
                key={w.sport}
                className="flex items-center gap-4 rounded-card bg-surface p-5 shadow-card"
              >
                <span
                  className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${w.sport === 'run' ? 'bg-run text-run-ink' : w.sport === 'ride' ? 'bg-ride text-ride-ink' : 'bg-swim text-swim-ink'}`}
                >
                  <SportIcon sport={w.sport} className="size-7" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold">{w.title}</h3>
                  <p className="text-muted">{w.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-12 flex justify-center">{cta}</div>
        </section>
      </main>

      <footer className="border-t border-hairline px-5 py-8 text-center text-sm text-muted">
        <Logo className="mx-auto mb-3 h-6" markOnly />
        This is a demo. All profiles are fictional.
      </footer>
    </div>
  )
}

function HeroCard({
  className,
  src,
  stat,
  unit,
  label,
}: {
  className: string
  src: string
  stat: string
  unit: string
  label: string
}) {
  return (
    <div className={`overflow-hidden rounded-card bg-surface shadow-lift ${className}`}>
      <Photo src={src} alt="" className="aspect-[4/3] w-full" />
      <div className="px-4 py-3">
        <p className="text-xs font-medium text-muted">{label}</p>
        <p className="font-display text-3xl font-bold">
          {stat}
          <span className="ml-1 text-base text-muted">{unit}</span>
        </p>
      </div>
    </div>
  )
}
