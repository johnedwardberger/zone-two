import type { ReactNode } from 'react'

type PlaceholderPageProps = {
  title: string
  phase: number
  children?: ReactNode
  action?: ReactNode
}

/** Temporary page body used until each feature's phase is built. */
export function PlaceholderPage({ title, phase, children, action }: PlaceholderPageProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pt-8 desk:px-10 desk:pt-12">
      <header className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-bold tracking-wide uppercase desk:text-5xl">
          {title}
        </h1>
        {action}
      </header>
      <section className="rounded-card bg-surface p-6 shadow-card">
        {children}
        <p className="text-muted">Coming in Phase {phase}.</p>
      </section>
    </div>
  )
}
