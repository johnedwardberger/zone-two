import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, CalendarHeart, Send, ShieldCheck } from 'lucide-react'
import { useAppStore } from '../../store/store'
import { useDerived } from '../../store/hooks'
import { athleteById, isMatched, isUnavailable } from '../../store/selectors'
import { ButtonLink, Card, Page } from '../../components/ui'
import { Photo } from '../../components/Photo'
import { chatTime } from '../../lib/dates'
import { SafetyMenu } from '../matches/SafetyMenu'
import { ProposalCard } from './ProposalCard'

const ICEBREAKERS = [
  'What are you training for right now?',
  'Favorite route in town?',
  'Coffee or post-workout tacos?',
]

export function ChatPage() {
  const { id = '' } = useParams()
  const core = useDerived((s) => s)
  const typing = useAppStore((s) => !!s.typing[id])
  const send = useAppStore((s) => s.sendMessage)
  const markRead = useAppStore((s) => s.markNotificationsRead)
  const [text, setText] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const athlete = athleteById(core, id)
  const thread = core.messages[id] ?? []

  // Keep the newest message in view (after the shell's scroll-to-top on navigation).
  useEffect(() => {
    const raf = requestAnimationFrame(() => endRef.current?.scrollIntoView({ block: 'end' }))
    return () => cancelAnimationFrame(raf)
  }, [thread.length, typing])

  useEffect(() => {
    markRead(undefined, id)
  }, [markRead, id])

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(t)
  }, [])

  if (!athlete || !isMatched(core, id) || isUnavailable(core, id)) {
    return (
      <Page>
        <Card className="p-8 text-center">
          <h1 className="font-display text-3xl font-bold uppercase">Chat not available</h1>
          <p className="mt-2 text-muted">You can only chat with your matches.</p>
          <ButtonLink to="/matches" className="mt-6">
            Back to Matches
          </ButtonLink>
        </Card>
      </Page>
    )
  }

  function submit(message = text) {
    if (!message.trim()) return
    send(id, message)
    setText('')
    inputRef.current?.focus()
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-7rem)] w-full max-w-2xl flex-col desk:min-h-dvh">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-hairline bg-cream/95 px-3 py-2.5 backdrop-blur sm:px-4">
        <Link
          to="/matches"
          className="flex size-10 items-center justify-center rounded-full hover:bg-hairline/70"
          aria-label="Back to Matches"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
        <Link
          to={`/athlete/${id}`}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl py-1 pr-2"
        >
          <span className="block size-10 shrink-0 overflow-hidden rounded-full bg-hairline">
            <Photo src={athlete.photos[0]} alt="" className="size-full" />
          </span>
          <span className="min-w-0">
            <h1 className="truncate font-semibold">{athlete.firstName}</h1>
            <span className="block text-xs text-muted">{typing ? 'typing…' : 'View profile'}</span>
          </span>
        </Link>
        <ButtonLink
          to={`/matches/${id}/plan`}
          size="sm"
          variant="secondary"
          aria-label="Plan a workout date"
        >
          <CalendarHeart className="size-4" aria-hidden />
          <span className="hidden sm:inline">Plan a workout date</span>
        </ButtonLink>
        <SafetyMenu athlete={athlete} matched />
      </header>

      {/* Messages */}
      <div
        role="log"
        aria-label={`Conversation with ${athlete.firstName}`}
        aria-live="polite"
        className="flex-1 space-y-1.5 px-3 py-4 sm:px-4"
      >
        {thread.length === 0 && (
          <div className="mx-auto mt-6 max-w-sm text-center">
            <span className="mx-auto block size-20 overflow-hidden rounded-full ring-4 ring-surface shadow-card">
              <Photo src={athlete.photos[0]} alt="" className="size-full" />
            </span>
            <p className="mt-4 font-display text-2xl font-bold uppercase">
              You matched with {athlete.firstName}
            </p>
            <p className="mt-1 text-muted">Say hi, or jump straight to planning a workout date.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {ICEBREAKERS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => submit(q)}
                  className="rounded-full border border-hairline bg-surface px-3.5 py-2 text-sm font-medium hover:border-line"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {thread.map((m, i) => {
          const mine = m.fromId === 'me'
          const next = thread[i + 1]
          const showTime = !next || next.fromId !== m.fromId || next.at - m.at > 5 * 60_000
          return (
            <div
              key={m.id}
              className={`flex flex-col ${mine ? 'items-end' : 'items-start'} ${showTime ? 'pb-2' : ''}`}
            >
              <span className="sr-only">{mine ? 'You' : athlete.firstName}:</span>
              {m.proposal ? (
                <ProposalCard
                  proposal={m.proposal}
                  mine={mine}
                  other={athlete}
                  units={core.units}
                  messageId={m.id}
                />
              ) : (
                <p
                  className={`max-w-[80%] rounded-3xl px-4 py-2.5 text-[15px] leading-snug whitespace-pre-wrap shadow-sm ${mine ? 'rounded-br-lg bg-primary-strong text-white' : 'rounded-bl-lg bg-surface text-ink'}`}
                >
                  {m.text}
                </p>
              )}
              {showTime && (
                <time className="mt-1 px-2 text-[11px] text-muted">{chatTime(m.at, now)}</time>
              )}
            </div>
          )
        })}

        {typing && (
          <div
            className="flex items-center gap-1 self-start rounded-3xl rounded-bl-lg bg-surface px-4 py-3.5 shadow-sm"
            aria-label={`${athlete.firstName} is typing`}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-2 animate-bounce-dot rounded-full bg-line"
                style={{ animationDelay: `${i * 160}ms` }}
              />
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Composer: sits above the mobile tab bar */}
      <div className="sticky bottom-[calc(3.8rem+env(safe-area-inset-bottom))] z-20 border-t border-hairline bg-cream/95 px-3 pt-3 pb-3 backdrop-blur sm:px-4 desk:bottom-0">
        <p className="mb-2 flex items-center gap-1.5 text-xs text-muted">
          <ShieldCheck className="size-3.5" aria-hidden /> Demo chat. {athlete.firstName} is
          fictional and replies automatically.
        </p>
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <label htmlFor="composer" className="sr-only">
            Message {athlete.firstName}
          </label>
          <textarea
            id="composer"
            ref={inputRef}
            rows={1}
            value={text}
            maxLength={1000}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
            placeholder={`Message ${athlete.firstName}…`}
            className="max-h-32 min-h-11 flex-1 resize-none rounded-3xl border border-line/60 bg-surface px-4 py-2.5 text-[16px] placeholder:text-muted/80 focus-visible:border-primary-strong"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-strong text-white transition-opacity disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="size-5" aria-hidden />
          </button>
        </form>
      </div>
    </div>
  )
}
