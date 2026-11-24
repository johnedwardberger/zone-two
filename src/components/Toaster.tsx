import { useEffect } from 'react'
import { Link } from 'react-router'
import { X } from 'lucide-react'
import { useAppStore } from '../store/store'

/** Global toast stack (polite live region). */
export function Toaster() {
  const toasts = useAppStore((s) => s.toasts)
  const dismiss = useAppStore((s) => s.dismissToast)
  const toast = useAppStore((s) => s.toast)

  useEffect(() => {
    const onFull = () => toast('Your browser storage is full. Try fewer or smaller photos.')
    window.addEventListener('zone-two:storage-full', onFull)
    return () => window.removeEventListener('zone-two:storage-full', onFull)
  }, [toast])

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4 desk:top-auto desk:bottom-6 desk:left-64"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="pointer-events-auto flex w-full max-w-md animate-rise items-center gap-3 rounded-2xl bg-ink py-3 pr-2 pl-4 text-[15px] text-white shadow-lift"
        >
          <span className="flex-1">{t.text}</span>
          {t.action && (
            <Link
              to={t.action.to}
              onClick={() => dismiss(t.id)}
              className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold whitespace-nowrap hover:bg-white/25"
            >
              {t.action.label}
            </Link>
          )}
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-white/15"
            aria-label="Dismiss notification"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ))}
    </div>
  )
}
