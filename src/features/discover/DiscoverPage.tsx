import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { RotateCcw, SlidersHorizontal, X } from 'lucide-react'
import { useAppStore } from '../../store/store'
import { selectDeck } from '../../store/selectors'
import { useDerived } from '../../store/hooks'
import { PulseIcon } from '../../components/icons'
import { Button, ButtonLink, FictionalNote } from '../../components/ui'
import { Photo } from '../../components/Photo'
import { ProBanner } from '../pro/ProBanner'
import { SwipeCard, type SwipeCardHandle, type SwipeDir } from './SwipeCard'

export function DiscoverPage() {
  const navigate = useNavigate()
  const deck = useDerived(selectDeck)
  const me = useAppStore((s) => s.me)!
  const units = useAppStore((s) => s.units)
  const lastSwipe = useAppStore((s) => s.lastSwipe)
  const swipe = useAppStore((s) => s.swipe)
  const undo = useAppStore((s) => s.undoSwipe)
  const widen = useAppStore((s) => s.widenFilters)
  const topRef = useRef<SwipeCardHandle>(null)
  const [announce, setAnnounce] = useState('')
  const top = deck[0]

  function handleSwipe(dir: SwipeDir) {
    if (!top) return
    const action = dir === 'right' ? 'pulse' : 'pass'
    swipe(top.athlete.id, action)
    setAnnounce(
      action === 'pulse'
        ? `Pulse sent to ${top.athlete.firstName}.`
        : `Passed on ${top.athlete.firstName}.`,
    )
  }

  // Keyboard: ← pass, → Pulse (ignored while typing or when a dialog is open).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.defaultPrevented || e.altKey || e.metaKey || e.ctrlKey) return
      const t = e.target as HTMLElement
      if (t.closest('input, textarea, select, [contenteditable], dialog')) return
      if (e.key === 'ArrowLeft') topRef.current?.fling('left')
      else if (e.key === 'ArrowRight') topRef.current?.fling('right')
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const undoName = lastSwipe ? deckName(lastSwipe.athleteId) : ''
  function deckName(id: string) {
    return useAppStore.getState().athletes.find((a) => a.id === id)?.firstName ?? ''
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 pt-4 sm:pt-6 desk:pt-10">
      <header className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-wide uppercase">Discover</h1>
          <p className="text-sm text-muted" aria-live="polite">
            {deck.length === 0
              ? 'No one new right now'
              : `${deck.length} athlete${deck.length === 1 ? '' : 's'} to discover`}
          </p>
        </div>
        <Link
          to="/settings#filters"
          className="flex size-11 items-center justify-center rounded-full bg-surface text-ink shadow-card hover:bg-hairline/60"
          aria-label="Discovery filters"
        >
          <SlidersHorizontal className="size-5" aria-hidden />
        </Link>
      </header>

      <p className="sr-only" aria-live="assertive">
        {announce}
      </p>

      {top ? (
        <>
          <section
            aria-label="Activity cards"
            aria-describedby="deck-help"
            className="relative h-[calc(100dvh-19rem)] max-h-[36rem] min-h-[21rem] desk:h-[calc(100dvh-14rem)]"
          >
            <p id="deck-help" className="sr-only">
              Showing {top.athlete.firstName}’s latest activity. Press the left arrow to pass, the
              right arrow to send a Pulse, or open their profile.
            </p>
            {deck
              .slice(0, 3)
              .reverse()
              .map((c) => {
                const depth = deck.indexOf(c)
                return (
                  <SwipeCard
                    key={c.athlete.id}
                    ref={depth === 0 ? topRef : undefined}
                    athlete={c.athlete}
                    activity={c.activity}
                    myCityId={me.cityId}
                    units={units}
                    depth={depth}
                    onSwipe={handleSwipe}
                    onOpen={() => navigate(`/athlete/${c.athlete.id}`)}
                  />
                )
              })}
          </section>

          <div className="mt-5 flex items-center justify-center gap-5">
            <Button
              variant="ghost"
              className="size-12 rounded-full !p-0"
              onClick={() => {
                undo()
                setAnnounce(undoName ? `Brought back ${undoName}.` : '')
              }}
              disabled={!lastSwipe}
              aria-label={lastSwipe ? `Undo last swipe (${undoName})` : 'Undo last swipe'}
              title="Undo"
            >
              <RotateCcw className="size-5" aria-hidden />
            </Button>
            <button
              type="button"
              onClick={() => topRef.current?.fling('left')}
              className="flex size-16 items-center justify-center rounded-full bg-surface text-ink shadow-lift transition-transform hover:scale-105 active:scale-95"
              aria-label={`Pass on ${top.athlete.firstName}`}
              title="Pass (←)"
            >
              <X className="size-8" strokeWidth={2.5} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => topRef.current?.fling('right')}
              className="flex size-20 items-center justify-center rounded-full bg-celebrate-deep text-white shadow-lift transition-transform hover:scale-105 active:scale-95"
              aria-label={`Send a Pulse on ${top.athlete.firstName}’s ${top.activity.title}`}
              title="Send a Pulse (→)"
            >
              <PulseIcon filled className="size-10" />
            </button>
            <Link
              to={`/athlete/${top.athlete.id}`}
              className="flex size-12 items-center justify-center overflow-hidden rounded-full ring-2 ring-surface shadow-card"
              aria-label={`Open ${top.athlete.firstName}’s profile`}
            >
              <Photo src={top.athlete.photos[0]} alt="" className="size-full" />
            </Link>
          </div>
          <p className="mt-3 hidden text-center text-xs text-muted desk:block">
            Tip: use ← to pass and → to send a Pulse.
          </p>
        </>
      ) : (
        <section className="flex flex-col items-center rounded-card bg-surface px-6 py-12 text-center shadow-card">
          <span className="flex size-16 items-center justify-center rounded-full bg-primary-soft text-primary-strong">
            <PulseIcon className="size-8" />
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold uppercase">You’re all caught up</h2>
          <p className="mt-2 max-w-xs text-muted">
            You’ve seen everyone who fits your filters. Widen them to see more athletes, including
            anyone you passed.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={widen}>Widen filters</Button>
            <ButtonLink to="/settings#filters" variant="secondary">
              Adjust filters
            </ButtonLink>
          </div>
          {lastSwipe && (
            <Button variant="ghost" className="mt-3" onClick={undo}>
              <RotateCcw className="size-4" aria-hidden /> Undo last swipe
            </Button>
          )}
        </section>
      )}

      <ProBanner className="mt-6" />
      <FictionalNote className="mt-3 mb-4 text-center" />
    </div>
  )
}
