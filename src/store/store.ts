/*
 * The single app store (Zustand), persisted to localStorage.
 *
 * UI code reads state through selectors (store/selectors.ts) and changes it
 * only through the actions below. That action surface is the "data
 * interface": a real backend could implement the same actions later without
 * touching components. Demo-only behavior (seeded athletes reacting) lives
 * in store/bots.ts and is triggered from these actions.
 */
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type {
  Activity,
  Athlete,
  DateProposal,
  Filters,
  Match,
  MatchRequest,
  Message,
  Notification,
  Units,
} from '../types'
import {
  CITIES,
  SAMPLE_PROFILE,
  SEED_ATHLETES,
  createSeedActivities,
  generateActivities,
} from '../data/seed'
import { todayISO } from '../lib/dates'
import { broadFilters, latestActivity, passesFilters } from '../lib/matching'
import { uid } from '../lib/random'
import { bots } from './bots'

export type Toast = {
  id: string
  text: string
  action?: { label: string; to: string }
}

export type Report = { athleteId: string; reason: string; details?: string; at: number }

export type SwipeAction = 'pass' | 'kudos'

type PersistedState = {
  seededOn: string
  me: Athlete | null
  athletes: Athlete[]
  activities: Activity[]
  units: Units
  filters: Filters
  /** Discover decisions by athlete id. */
  swipes: Record<string, SwipeAction>
  /** Activity ids I gave (private) Kudos to, by athlete id. */
  kudosGiven: Record<string, string[]>
  /** Athletes who gave Kudos to one of my activities. */
  kudosReceived: Record<string, true>
  /** My friendly Kudos on Feed posts, by activity id. */
  feedKudos: Record<string, true>
  requests: MatchRequest[]
  matches: Match[]
  messages: Record<string, Message[]>
  /** Unmatched athletes (hidden from Discover / Mutual Kudos). */
  hidden: string[]
  blocked: string[]
  reports: Report[]
  notifications: Notification[]
  lastSwipe: { athleteId: string; action: SwipeAction; activityId?: string } | null
}

type TransientState = {
  typing: Record<string, boolean>
  celebration: string | null
  toasts: Toast[]
}

type Actions = {
  completeOnboarding: (profile: Athlete, opts?: { sample?: boolean }) => void
  loadSampleProfile: () => void
  updateProfile: (patch: Partial<Athlete>) => void
  resetDemo: () => void

  swipe: (athleteId: string, action: SwipeAction) => void
  undoSwipe: () => void
  giveKudos: (athleteId: string, activityId: string) => void
  /** Demo/back-end event: an athlete gave Kudos to one of my activities. */
  receiveKudos: (athleteId: string) => void

  sendMatchRequest: (athleteId: string, note?: string) => void
  respondToRequest: (requestId: string, accept: boolean) => void
  /** Demo/back-end event: my outgoing request was accepted. */
  requestAccepted: (requestId: string) => void
  dismissCelebration: () => void

  sendMessage: (athleteId: string, text: string) => void
  sendProposal: (athleteId: string, proposal: Omit<DateProposal, 'status'>) => void
  /** Demo/back-end event: an athlete sent me a message. */
  receiveMessage: (athleteId: string, text: string) => void
  /** Demo/back-end event: my date proposal was accepted. */
  proposalAccepted: (athleteId: string, messageId: string) => void
  setTyping: (athleteId: string, typing: boolean) => void

  unmatch: (athleteId: string) => void
  block: (athleteId: string) => void
  report: (athleteId: string, reason: string, details?: string) => void

  postActivity: (
    activity: Omit<Activity, 'id' | 'athleteId' | 'postedAt' | 'baseKudos' | 'comments'>,
  ) => string
  toggleFeedKudos: (activityId: string) => void
  addComment: (activityId: string, text: string) => void

  setUnits: (units: Units) => void
  setFilters: (filters: Filters) => void
  widenFilters: () => void

  markNotificationsRead: (kind?: Notification['kind']) => void
  toast: (text: string, action?: Toast['action']) => void
  dismissToast: (id: string) => void
  /** Re-schedule demo reactions that were pending when the page was closed. */
  resumeDemo: () => void
}

export type AppState = PersistedState & TransientState & Actions

function freshState(): PersistedState {
  const today = todayISO()
  return {
    seededOn: today,
    me: null,
    athletes: SEED_ATHLETES,
    activities: createSeedActivities(today),
    units: 'imperial',
    filters: broadFilters(['man', 'woman', 'nonbinary']),
    swipes: {},
    kudosGiven: {},
    kudosReceived: {},
    feedKudos: {},
    requests: [],
    matches: [],
    messages: {},
    hidden: [],
    blocked: [],
    reports: [],
    notifications: [],
    lastSwipe: null,
  }
}

const notify = (kind: Notification['kind'], athleteId: string): Notification => ({
  id: uid('n'),
  kind,
  athleteId,
  at: Date.now(),
  read: false,
})

/** localStorage wrapper that never throws (quota, private mode, etc.). */
const safeStorage = {
  getItem: (k: string) => {
    try {
      return localStorage.getItem(k)
    } catch {
      return null
    }
  },
  setItem: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v)
    } catch {
      window.dispatchEvent(new CustomEvent('zone-two:storage-full'))
    }
  },
  removeItem: (k: string) => {
    try {
      localStorage.removeItem(k)
    } catch {
      /* ignore */
    }
  },
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...freshState(),
      typing: {},
      celebration: null,
      toasts: [],

      // ── Profile ──────────────────────────────────────────────────────
      completeOnboarding: (profile, opts) => {
        const s = get()
        const me = { ...profile, id: 'me' }
        const filters = broadFilters(me.meet)
        const mine = opts?.sample ? generateActivities(me, s.seededOn, 5) : []
        // Seed two incoming match requests from local athletes who fit both ways.
        const today = todayISO()
        const local = { ...filters, radiusKm: 60 }
        const candidates = s.athletes
          .filter((a) => passesFilters(me, a, local, CITIES, today))
          .sort((a, b) => Number(!!a.likesYou) - Number(!!b.likesYou))
          .slice(0, 2)
        const requests: MatchRequest[] = candidates.map((a, i) => ({
          id: uid('rq'),
          fromId: a.id,
          toId: 'me',
          note:
            i === 0 ? 'Your long-run pace is my easy pace. Want to test that theory?' : undefined,
          status: 'pending',
          at: Date.now() - (i + 1) * 3_600_000,
        }))
        set({
          me,
          filters,
          activities: [...mine, ...s.activities.filter((a) => a.athleteId !== 'me')],
          requests: [...s.requests, ...requests],
          notifications: [...s.notifications, ...requests.map((r) => notify('request', r.fromId))],
        })
      },
      loadSampleProfile: () => get().completeOnboarding(SAMPLE_PROFILE, { sample: true }),
      updateProfile: (patch) => {
        const me = get().me
        if (me) set({ me: { ...me, ...patch, id: 'me' } })
      },
      resetDemo: () => {
        bots.cancelAll()
        set({ ...freshState(), typing: {}, celebration: null, toasts: [] })
      },

      // ── Discover & Kudos ─────────────────────────────────────────────
      swipe: (athleteId, action) => {
        const s = get()
        let activityId: string | undefined
        if (action === 'kudos') {
          activityId = latestActivity(s.activities, athleteId)?.id
          if (activityId) get().giveKudos(athleteId, activityId)
        }
        set((st) => ({
          swipes: { ...st.swipes, [athleteId]: action },
          lastSwipe: { athleteId, action, activityId },
        }))
      },
      undoSwipe: () => {
        const s = get()
        const last = s.lastSwipe
        if (!last) return
        const swipes = { ...s.swipes }
        delete swipes[last.athleteId]
        const kudosGiven = { ...s.kudosGiven }
        if (last.action === 'kudos' && last.activityId) {
          const left = (kudosGiven[last.athleteId] ?? []).filter((id) => id !== last.activityId)
          if (left.length) kudosGiven[last.athleteId] = left
          else delete kudosGiven[last.athleteId]
          bots.cancel(`mutual:${last.athleteId}`)
        }
        const stillMutual = !!kudosGiven[last.athleteId] && !!s.kudosReceived[last.athleteId]
        set({
          swipes,
          kudosGiven,
          lastSwipe: null,
          notifications: stillMutual
            ? s.notifications
            : s.notifications.filter(
                (n) => !(n.kind === 'mutual' && n.athleteId === last.athleteId),
              ),
        })
      },
      giveKudos: (athleteId, activityId) => {
        const s = get()
        const prev = s.kudosGiven[athleteId] ?? []
        if (prev.includes(activityId)) return
        set({ kudosGiven: { ...s.kudosGiven, [athleteId]: [...prev, activityId] } })
        const athlete = s.athletes.find((a) => a.id === athleteId)
        if (s.kudosReceived[athleteId]) announceMutual(athleteId)
        else if (athlete?.likesYou) bots.scheduleMutual(athleteId)
      },
      receiveKudos: (athleteId) => {
        const s = get()
        if (s.kudosReceived[athleteId]) return
        set({ kudosReceived: { ...s.kudosReceived, [athleteId]: true } })
        if (s.kudosGiven[athleteId]?.length) announceMutual(athleteId)
      },

      // ── Match requests & matches ─────────────────────────────────────
      sendMatchRequest: (athleteId, note) => {
        const s = get()
        if (
          s.requests.some(
            (r) => r.fromId === 'me' && r.toId === athleteId && r.status === 'pending',
          )
        )
          return
        const req: MatchRequest = {
          id: uid('rq'),
          fromId: 'me',
          toId: athleteId,
          note: note?.trim() ? note.trim().slice(0, 140) : undefined,
          status: 'pending',
          at: Date.now(),
        }
        set({ requests: [...s.requests, req] })
        get().toast('Match request sent')
        bots.scheduleAccept(req.id)
      },
      respondToRequest: (requestId, accept) => {
        const s = get()
        const req = s.requests.find((r) => r.id === requestId)
        if (!req || req.status !== 'pending') return
        set({
          requests: s.requests.map((r) =>
            r.id === requestId ? { ...r, status: accept ? 'accepted' : 'declined' } : r,
          ),
          notifications: s.notifications.filter(
            (n) => !(n.kind === 'request' && n.athleteId === req.fromId),
          ),
        })
        if (accept) createMatch(req.fromId)
      },
      requestAccepted: (requestId) => {
        const s = get()
        const req = s.requests.find((r) => r.id === requestId)
        if (!req || req.status !== 'pending' || s.blocked.includes(req.toId)) return
        set({
          requests: s.requests.map((r) => (r.id === requestId ? { ...r, status: 'accepted' } : r)),
        })
        createMatch(req.toId)
      },
      dismissCelebration: () => set({ celebration: null }),

      // ── Chat ─────────────────────────────────────────────────────────
      sendMessage: (athleteId, text) => {
        const t = text.trim()
        if (!t) return
        const msg: Message = { id: uid('m'), fromId: 'me', at: Date.now(), text: t }
        set((s) => ({
          messages: { ...s.messages, [athleteId]: [...(s.messages[athleteId] ?? []), msg] },
        }))
        bots.scheduleReply(athleteId)
      },
      sendProposal: (athleteId, proposal) => {
        const msg: Message = {
          id: uid('m'),
          fromId: 'me',
          at: Date.now(),
          proposal: { ...proposal, status: 'pending' },
        }
        set((s) => ({
          messages: { ...s.messages, [athleteId]: [...(s.messages[athleteId] ?? []), msg] },
        }))
        bots.scheduleProposalAccept(athleteId, msg.id)
      },
      receiveMessage: (athleteId, text) => {
        const s = get()
        if (s.blocked.includes(athleteId) || !s.matches.some((m) => m.athleteId === athleteId))
          return
        const msg: Message = { id: uid('m'), fromId: athleteId, at: Date.now(), text }
        set({
          messages: { ...s.messages, [athleteId]: [...(s.messages[athleteId] ?? []), msg] },
          typing: { ...s.typing, [athleteId]: false },
        })
      },
      proposalAccepted: (athleteId, messageId) => {
        const s = get()
        const thread = s.messages[athleteId]
        if (!thread) return
        set({
          messages: {
            ...s.messages,
            [athleteId]: thread.map((m) =>
              m.id === messageId && m.proposal
                ? { ...m, proposal: { ...m.proposal, status: 'accepted' } }
                : m,
            ),
          },
        })
      },
      setTyping: (athleteId, typing) =>
        set((s) => ({ typing: { ...s.typing, [athleteId]: typing } })),

      // ── Safety ───────────────────────────────────────────────────────
      unmatch: (athleteId) => {
        bots.cancelFor(athleteId)
        set((s) => {
          const messages = { ...s.messages }
          delete messages[athleteId]
          return {
            matches: s.matches.filter((m) => m.athleteId !== athleteId),
            messages,
            hidden: [...new Set([...s.hidden, athleteId])],
            requests: s.requests.filter((r) => r.fromId !== athleteId && r.toId !== athleteId),
            notifications: s.notifications.filter((n) => n.athleteId !== athleteId),
            celebration: s.celebration === athleteId ? null : s.celebration,
          }
        })
      },
      block: (athleteId) => {
        get().unmatch(athleteId)
        set((s) => ({ blocked: [...new Set([...s.blocked, athleteId])] }))
      },
      report: (athleteId, reason, details) =>
        set((s) => ({ reports: [...s.reports, { athleteId, reason, details, at: Date.now() }] })),

      // ── Activities & Feed ────────────────────────────────────────────
      postActivity: (input) => {
        const id = uid('act')
        const activity: Activity = {
          ...input,
          id,
          athleteId: 'me',
          postedAt: Date.now(),
          baseKudos: 0,
          comments: [],
        }
        set((s) => ({ activities: [activity, ...s.activities] }))
        return id
      },
      toggleFeedKudos: (activityId) =>
        set((s) => {
          const feedKudos = { ...s.feedKudos }
          if (feedKudos[activityId]) delete feedKudos[activityId]
          else feedKudos[activityId] = true
          return { feedKudos }
        }),
      addComment: (activityId, text) => {
        const t = text.trim()
        if (!t) return
        set((s) => ({
          activities: s.activities.map((a) =>
            a.id === activityId
              ? {
                  ...a,
                  comments: [
                    ...a.comments,
                    { id: uid('c'), authorId: 'me', text: t, at: Date.now() },
                  ],
                }
              : a,
          ),
        }))
      },

      // ── Settings ─────────────────────────────────────────────────────
      setUnits: (units) => set({ units }),
      setFilters: (filters) => set({ filters }),
      widenFilters: () =>
        set((s) => {
          const swipes: Record<string, SwipeAction> = {}
          for (const [id, a] of Object.entries(s.swipes)) if (a === 'kudos') swipes[id] = a
          return {
            filters: broadFilters(s.me?.meet ?? ['man', 'woman', 'nonbinary']),
            swipes,
            lastSwipe: null,
          }
        }),

      // ── Notifications & toasts ───────────────────────────────────────
      markNotificationsRead: (kind) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            !kind || n.kind === kind ? { ...n, read: true } : n,
          ),
        })),
      toast: (text, action) => {
        const t: Toast = { id: uid('t'), text, action }
        set((s) => ({ toasts: [...s.toasts.slice(-2), t] }))
        window.setTimeout(() => get().dismissToast(t.id), action ? 6000 : 3500)
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      resumeDemo: () => {
        const s = get()
        for (const [athleteId, given] of Object.entries(s.kudosGiven)) {
          const a = s.athletes.find((x) => x.id === athleteId)
          if (given.length && a?.likesYou && !s.kudosReceived[athleteId])
            bots.scheduleMutual(athleteId)
        }
        for (const r of s.requests)
          if (r.fromId === 'me' && r.status === 'pending') bots.scheduleAccept(r.id)
        for (const [athleteId, thread] of Object.entries(s.messages)) {
          for (const m of thread)
            if (m.fromId === 'me' && m.proposal?.status === 'pending')
              bots.scheduleProposalAccept(athleteId, m.id)
          const last = thread[thread.length - 1]
          if (last?.fromId === 'me' && last.text) bots.scheduleReply(athleteId)
        }
      },
    }),
    {
      name: 'zone-two-demo',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s): PersistedState => ({
        seededOn: s.seededOn,
        me: s.me,
        athletes: s.athletes,
        activities: s.activities,
        units: s.units,
        filters: s.filters,
        swipes: s.swipes,
        kudosGiven: s.kudosGiven,
        kudosReceived: s.kudosReceived,
        feedKudos: s.feedKudos,
        requests: s.requests,
        matches: s.matches,
        messages: s.messages,
        hidden: s.hidden,
        blocked: s.blocked,
        reports: s.reports,
        notifications: s.notifications,
        lastSwipe: s.lastSwipe,
      }),
    },
  ),
)

function announceMutual(athleteId: string) {
  const s = useAppStore.getState()
  if (s.notifications.some((n) => n.kind === 'mutual' && n.athleteId === athleteId)) return
  const name = s.athletes.find((a) => a.id === athleteId)?.firstName ?? 'someone'
  useAppStore.setState({ notifications: [...s.notifications, notify('mutual', athleteId)] })
  s.toast(`Mutual Kudos with ${name}!`, { label: 'Request to match', to: `/athlete/${athleteId}` })
}

function createMatch(athleteId: string) {
  const s = useAppStore.getState()
  if (s.matches.some((m) => m.athleteId === athleteId)) return
  useAppStore.setState({
    matches: [...s.matches, { athleteId, at: Date.now() }],
    notifications: [...s.notifications, notify('match', athleteId)],
    celebration: athleteId,
  })
}

bots.connect(() => useAppStore.getState())
