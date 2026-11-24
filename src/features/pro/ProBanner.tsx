import { Link } from 'react-router'
import { ChevronRight, Crown } from 'lucide-react'

/** Subtle upsell to the (mock) Zone Two Pro page. */
export function ProBanner({ className = '' }: { className?: string }) {
  return (
    <Link
      to="/pro"
      className={`flex items-center gap-3 rounded-2xl bg-celebrate-soft px-4 py-3 text-sm transition-shadow hover:shadow-card ${className}`}
    >
      <Crown className="size-5 shrink-0 text-primary-strong" aria-hidden />
      <span className="flex-1">
        <span className="font-semibold">Zone Two Pro</span>
        <span className="text-muted"> · See who sent you a Pulse</span>
      </span>
      <ChevronRight className="size-4 text-muted" aria-hidden />
    </Link>
  )
}
