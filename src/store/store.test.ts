import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppStore } from './store'
import { selectDeck, selectFeed, selectIncomingRequests, selectMutuals } from './selectors'

const s = () => useAppStore.getState()

describe('store: the core demo flow', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    s().resetDemo()
    s().useSampleProfile()
  })
  afterEach(() => vi.useRealTimers())

  it('onboards with a sample profile, activities and 2 incoming requests', () => {
    expect(s().me?.firstName).toBe('Alex')
    expect(s().activities.filter((a) => a.athleteId === 'me')).toHaveLength(5)
    expect(selectIncomingRequests(s())).toHaveLength(2)
    expect(selectDeck(s()).length).toBeGreaterThan(5)
  })

  it('Kudos to a likesYou athlete becomes Mutual Kudos after a delay', () => {
    const card = selectDeck(s()).find((c) => c.athlete.likesYou)!
    s().swipe(card.athlete.id, 'kudos')
    expect(selectMutuals(s()).map((a) => a.id)).not.toContain(card.athlete.id)
    vi.advanceTimersByTime(2500)
    expect(selectMutuals(s()).map((a) => a.id)).toContain(card.athlete.id)
    expect(selectDeck(s()).some((c) => c.athlete.id === card.athlete.id)).toBe(false)
  })

  it('Kudos to others never becomes mutual; pass removes from deck', () => {
    const card = selectDeck(s()).find((c) => !c.athlete.likesYou)!
    s().swipe(card.athlete.id, 'kudos')
    vi.advanceTimersByTime(5000)
    expect(selectMutuals(s())).toHaveLength(0)
    const next = selectDeck(s())[0]
    s().swipe(next.athlete.id, 'pass')
    expect(selectDeck(s()).some((c) => c.athlete.id === next.athlete.id)).toBe(false)
  })

  it('undo restores the last card and cancels a pending mutual', () => {
    const card = selectDeck(s()).find((c) => c.athlete.likesYou)!
    s().swipe(card.athlete.id, 'kudos')
    s().undoSwipe()
    vi.advanceTimersByTime(5000)
    expect(selectDeck(s()).some((c) => c.athlete.id === card.athlete.id)).toBe(true)
    expect(selectMutuals(s())).toHaveLength(0)
  })

  it('a match request is accepted in 2–4 s and opens the celebration', () => {
    const card = selectDeck(s()).find((c) => c.athlete.likesYou)!
    s().swipe(card.athlete.id, 'kudos')
    vi.advanceTimersByTime(2500)
    s().sendMatchRequest(card.athlete.id, 'Easy miles Saturday?')
    vi.advanceTimersByTime(1900)
    expect(s().matches).toHaveLength(0)
    vi.advanceTimersByTime(2200)
    expect(s().matches.map((m) => m.athleteId)).toEqual([card.athlete.id])
    expect(s().celebration).toBe(card.athlete.id)
    expect(selectMutuals(s())).toHaveLength(0)
  })

  it('accepting an incoming request matches; declining is silent', () => {
    const [a, b] = selectIncomingRequests(s())
    s().respondToRequest(a.id, true)
    s().respondToRequest(b.id, false)
    expect(s().matches.map((m) => m.athleteId)).toEqual([a.fromId])
    expect(selectIncomingRequests(s())).toHaveLength(0)
  })

  it('chat replies arrive in 1–3 s; date proposals get accepted', () => {
    const [req] = selectIncomingRequests(s())
    s().respondToRequest(req.id, true)
    const id = req.fromId
    s().sendMessage(id, 'Hi!')
    vi.advanceTimersByTime(3100)
    const thread = s().messages[id]
    expect(thread).toHaveLength(2)
    expect(thread[1].fromId).toBe(id)
    s().sendProposal(id, {
      sport: 'run',
      routeId: 'monon',
      distanceM: 8000,
      pace: 330,
      day: '2026-11-28',
      timeOfDay: 'morning',
    })
    vi.advanceTimersByTime(4500)
    const proposal = s().messages[id].find((m) => m.proposal)!
    expect(proposal.proposal?.status).toBe('accepted')
  })

  it('feed shows my posts and my matches’ activities', () => {
    const [req] = selectIncomingRequests(s())
    s().respondToRequest(req.id, true)
    const posted = s().postActivity({
      sport: 'swim',
      title: 'New swim',
      date: s().seededOn,
      timeOfDay: 'evening',
      distanceM: 2000,
      movingTimeS: 1900,
      loggedWith: 'Other',
      photos: [],
    })
    const feed = selectFeed(s())
    expect(feed.some((a) => a.id === posted)).toBe(true)
    expect(feed.some((a) => a.athleteId === req.fromId)).toBe(true)
    expect(feed.every((a) => a.athleteId === 'me' || a.athleteId === req.fromId)).toBe(true)
  })

  it('blocking removes the person everywhere', () => {
    const [req] = selectIncomingRequests(s())
    s().respondToRequest(req.id, true)
    s().sendMessage(req.fromId, 'Hi')
    s().block(req.fromId)
    expect(s().matches).toHaveLength(0)
    expect(s().messages[req.fromId]).toBeUndefined()
    expect(selectFeed(s()).some((a) => a.athleteId === req.fromId)).toBe(false)
    expect(selectDeck(s()).some((c) => c.athlete.id === req.fromId)).toBe(false)
  })
})
