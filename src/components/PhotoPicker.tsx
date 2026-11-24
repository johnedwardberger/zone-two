import { useId, useState } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { compressImage } from '../lib/images'
import { Photo } from './Photo'

/** Upload up to `max` photos from the device; compressed and kept as data URLs. */
export function PhotoPicker({
  photos,
  onChange,
  max,
  label,
  hint,
}: {
  photos: string[]
  onChange: (photos: string[]) => void
  max: number
  label: string
  hint?: string
}) {
  const id = useId()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const remaining = max - photos.length

  async function add(files: FileList | null) {
    if (!files?.length) return
    setError(null)
    setBusy(true)
    const picked = [...files].slice(0, remaining)
    try {
      const urls = await Promise.all(picked.map((f) => compressImage(f)))
      onChange([...photos, ...urls])
      if (files.length > remaining) setError(`Only ${max} photos fit. Extra photos were skipped.`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That photo couldn’t be added.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div role="group" aria-labelledby={`${id}-label`}>
      <p id={`${id}-label`} className="mb-1.5 text-sm font-semibold text-ink">
        {label}{' '}
        <span className="font-normal text-muted">
          ({photos.length}/{max})
        </span>
      </p>
      {hint && <p className="mb-2 text-sm text-muted">{hint}</p>}
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.map((p, i) => (
          <li key={i} className="relative aspect-[4/5] overflow-hidden rounded-xl bg-hairline">
            <Photo src={p} alt={`Photo ${i + 1}`} className="size-full" />
            <button
              type="button"
              onClick={() => onChange(photos.filter((_, k) => k !== i))}
              className="absolute top-1.5 right-1.5 flex size-8 items-center justify-center rounded-full bg-ink/70 text-white hover:bg-ink"
              aria-label={`Remove photo ${i + 1}`}
            >
              <X className="size-4" aria-hidden />
            </button>
          </li>
        ))}
        {remaining > 0 && (
          <li>
            <label
              htmlFor={id}
              className="flex aspect-[4/5] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line/60 bg-surface text-sm font-medium text-muted transition-colors hover:border-primary-strong hover:text-ink has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-strong"
            >
              {busy ? (
                <Loader2 className="size-6 animate-spin" aria-hidden />
              ) : (
                <ImagePlus className="size-6" aria-hidden />
              )}
              {busy ? 'Adding…' : 'Add photo'}
              <input
                id={id}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => {
                  void add(e.target.files)
                  e.target.value = ''
                }}
              />
            </label>
          </li>
        )}
      </ul>
      {error && (
        <p className="mt-1.5 text-sm font-medium text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
