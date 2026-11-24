import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { Link, type LinkProps } from 'react-router'
import { X } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const VARIANT: Record<Variant, string> = {
  primary:
    'bg-primary-strong text-white hover:bg-primary-pressed active:bg-primary-pressed shadow-card',
  secondary: 'bg-surface text-ink border border-hairline hover:border-line shadow-card',
  ghost: 'text-ink hover:bg-hairline/70',
  danger: 'bg-surface text-danger border border-danger/40 hover:bg-danger-soft',
}
const SIZE: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-[15px] gap-2',
  lg: 'h-14 px-7 text-base gap-2',
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', extra = '') {
  return [
    'inline-flex items-center justify-center rounded-full font-semibold transition-[background-color,border-color,transform] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 select-none',
    VARIANT[variant],
    SIZE[size],
    extra,
  ].join(' ')
}

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
>(function Button(
  { variant = 'primary', size = 'md', className = '', type = 'button', ...props },
  ref,
) {
  return (
    <button ref={ref} type={type} className={buttonClass(variant, size, className)} {...props} />
  )
})

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: LinkProps & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />
}

export function Card({
  className = '',
  children,
  as: As = 'section',
}: {
  className?: string
  children: ReactNode
  as?: 'section' | 'div' | 'article' | 'li'
}) {
  return <As className={`rounded-card bg-surface shadow-card ${className}`}>{children}</As>
}

// ── Form fields ──────────────────────────────────────────────────────

const inputBase =
  'w-full rounded-xl border border-line/60 bg-surface px-4 py-3 text-[16px] text-ink placeholder:text-muted/80 transition-colors hover:border-line focus-visible:border-primary-strong aria-[invalid=true]:border-danger'

type FieldProps = {
  label: ReactNode
  hint?: ReactNode
  error?: string | null
  children: (props: {
    id: string
    'aria-describedby'?: string
    'aria-invalid'?: boolean
  }) => ReactNode
  className?: string
}

/** Label + control + hint + error, wired for screen readers. */
export function Field({ label, hint, error, children, className = '' }: FieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errId = `${id}-err`
  const describedBy =
    [hint ? hintId : '', error ? errId : ''].filter(Boolean).join(' ') || undefined
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} className="mt-1.5 text-sm font-medium text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function TextInput({ className = '', ...props }, ref) {
    return <input ref={ref} className={`${inputBase} ${className}`} {...props} />
  },
)

export function TextArea({
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputBase} min-h-24 resize-y ${className}`} {...props} />
}

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${inputBase} appearance-none bg-[length:1rem] ${className}`} {...props} />
  )
}

/** A group of pill toggles (radio or checkbox) inside a fieldset. */
export function ChoiceGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
  multiple = false,
  error,
  hint,
  renderOption,
  className = '',
}: {
  legend: ReactNode
  options: { value: T; label: string }[]
  value: T[]
  onChange: (value: T[]) => void
  multiple?: boolean
  error?: string | null
  hint?: ReactNode
  renderOption?: (o: { value: T; label: string }, selected: boolean) => ReactNode
  className?: string
}) {
  const name = useId()
  return (
    <fieldset className={className} aria-describedby={error ? `${name}-err` : undefined}>
      <legend className="mb-2 text-sm font-semibold text-ink">{legend}</legend>
      {hint && <p className="-mt-1 mb-2 text-sm text-muted">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const selected = value.includes(o.value)
          return (
            <label
              key={o.value}
              className={[
                'relative inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-[15px] font-medium transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-strong',
                selected
                  ? 'border-primary-strong bg-primary-soft text-ink'
                  : 'border-line/60 bg-surface text-ink hover:border-line',
              ].join(' ')}
            >
              <input
                type={multiple ? 'checkbox' : 'radio'}
                name={name}
                className="sr-only"
                checked={selected}
                onChange={() => {
                  if (!multiple) onChange([o.value])
                  else onChange(selected ? value.filter((v) => v !== o.value) : [...value, o.value])
                }}
              />
              {renderOption ? renderOption(o, selected) : o.label}
            </label>
          )
        })}
      </div>
      {error && (
        <p id={`${name}-err`} className="mt-1.5 text-sm font-medium text-danger" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  )
}

// ── Modal (native <dialog>: focus trap, Escape, focus return) ─────────

export function Modal({
  open,
  onClose,
  title,
  children,
  className = '',
  hideTitle = false,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
  hideTitle?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const lastFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) {
      lastFocus.current = document.activeElement as HTMLElement | null
      d.showModal()
    } else if (!open && d.open) {
      d.close()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const toRestore = lastFocus
    return () => {
      // Return focus to whatever opened the dialog.
      toRestore.current?.focus?.()
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
      className={`m-auto w-[min(92vw,30rem)] rounded-card bg-surface p-0 text-ink shadow-lift backdrop:bg-ink/40 backdrop:backdrop-blur-sm ${className}`}
    >
      {open && (
        <div className="p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2
              id={titleId}
              className={
                hideTitle ? 'sr-only' : 'font-display text-2xl font-bold uppercase tracking-wide'
              }
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="-mt-1 -mr-2 flex size-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-hairline/70 hover:text-ink"
              aria-label="Close"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}

export function PageHeader({
  title,
  action,
  subtitle,
}: {
  title: string
  action?: ReactNode
  subtitle?: ReactNode
}) {
  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-4xl font-bold uppercase tracking-wide desk:text-5xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}

export function Page({
  children,
  className = '',
  wide = false,
}: {
  children: ReactNode
  className?: string
  wide?: boolean
}) {
  return (
    <div
      className={`mx-auto w-full ${wide ? 'max-w-5xl' : 'max-w-2xl'} px-4 pt-6 sm:px-6 desk:px-10 desk:pt-10 ${className}`}
    >
      {children}
    </div>
  )
}

export function FictionalNote({ className = '' }: { className?: string }) {
  return <p className={`text-xs text-muted ${className}`}>Demo · all profiles are fictional</p>
}
