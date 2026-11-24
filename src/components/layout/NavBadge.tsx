import { useAppStore } from '../../store/store'

/** Unread count for the Matches tab (requests, mutual Kudos, new matches). */
export function NavBadge({ className = '' }: { className?: string }) {
  const count = useAppStore((s) => s.notifications.filter((n) => !n.read).length)
  if (!count) return null
  return (
    <span
      className={`flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-strong px-1.5 text-[11px] font-bold text-white ring-2 ring-surface ${className}`}
    >
      {count}
      <span className="sr-only"> new</span>
    </span>
  )
}
