/*
 * DEMO ONLY: simulates the fictional seeded athletes reacting to the user.
 * A real backend would replace this with server events calling the same
 * store actions (receiveKudos, requestAccepted, receiveMessage, …).
 */
import type { AppState } from './store'
import { cannedReply, dateAcceptedReply } from '../data/replies'

type GetState = () => AppState

let getState: GetState | null = null
const timers = new Map<string, number[]>()

const between = (min: number, max: number) => min + Math.random() * (max - min)

function schedule(key: string, delay: number, fn: () => void) {
  const id = window.setTimeout(() => {
    timers.set(
      key,
      (timers.get(key) ?? []).filter((t) => t !== id),
    )
    fn()
  }, delay)
  timers.set(key, [...(timers.get(key) ?? []), id])
}

function cancel(key: string) {
  for (const id of timers.get(key) ?? []) window.clearTimeout(id)
  timers.delete(key)
}

function athlete(id: string) {
  return getState?.().athletes.find((a) => a.id === id)
}

export const bots = {
  connect(fn: GetState) {
    getState = fn
  },

  /** A `likesYou` athlete "already liked your activity": reveal after a short delay. */
  scheduleMutual(athleteId: string) {
    const key = `mutual:${athleteId}`
    if (timers.has(key)) return
    schedule(key, between(1200, 2200), () => getState?.().receiveKudos(athleteId))
  },

  /** Seeded athletes accept match requests after 2–4 seconds. */
  scheduleAccept(requestId: string) {
    const req = getState?.().requests.find((r) => r.id === requestId)
    if (!req) return
    const key = `accept:${req.toId}`
    if (timers.has(key)) return
    schedule(key, between(2000, 4000), () => getState?.().requestAccepted(requestId))
  },

  /** Typing indicator, then a canned reply 1–3 s after the user's message. */
  scheduleReply(athleteId: string) {
    const key = `reply:${athleteId}`
    if (timers.has(key)) return
    const a = athlete(athleteId)
    if (!a) return
    const delay = between(1000, 3000)
    schedule(key, Math.min(400, delay / 2), () => getState?.().setTyping(athleteId, true))
    schedule(key, delay, () => {
      const s = getState?.()
      if (!s) return
      const me = s.me
      const shared = a.sports.find((sp) => me?.sports.includes(sp)) ?? a.sports[0]
      const count = (s.messages[athleteId] ?? []).filter(
        (m) => m.fromId === athleteId && m.text,
      ).length
      s.receiveMessage(athleteId, cannedReply(a.persona, count, shared))
    })
  },

  /** The seeded athlete accepts a date proposal and confirms in chat. */
  scheduleProposalAccept(athleteId: string, messageId: string) {
    const key = `date:${messageId}`
    if (timers.has(key)) return
    const a = athlete(athleteId)
    schedule(key, between(1800, 3000), () => {
      const s = getState?.()
      if (!s) return
      s.proposalAccepted(athleteId, messageId)
      s.setTyping(athleteId, true)
      window.setTimeout(
        () => getState?.().receiveMessage(athleteId, dateAcceptedReply(a?.persona)),
        900,
      )
    })
  },

  cancel,

  cancelFor(athleteId: string) {
    for (const key of [...timers.keys()]) if (key.endsWith(`:${athleteId}`)) cancel(key)
  },

  cancelAll() {
    for (const key of [...timers.keys()]) cancel(key)
  },
}
