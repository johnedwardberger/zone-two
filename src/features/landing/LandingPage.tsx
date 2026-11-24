import { Link } from 'react-router'
import { Logo } from '../../components/Logo'

/** Placeholder landing; the full page arrives in Phase 3. */
export function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <h1>
        <Logo className="h-12 desk:h-16" />
      </h1>
      <p className="font-display text-3xl font-semibold text-ink desk:text-4xl">
        Find someone in your zone.
      </p>
      <Link
        to="/discover"
        className="rounded-full bg-primary-strong px-8 py-4 text-lg font-semibold text-white shadow-card transition-colors hover:bg-primary-pressed active:bg-primary-pressed"
      >
        Try the demo
      </Link>
      <p className="mt-8 text-sm text-muted">This is a demo. All profiles are fictional.</p>
    </div>
  )
}
