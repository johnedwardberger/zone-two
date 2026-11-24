import { describe, expect, it } from 'vitest'
import { CITIES, SAMPLE_PROFILE, SEED_ATHLETES, createSeedActivities } from './seed'
import { ROUTES } from './routes'
import { ageOn } from '../lib/dates'
import { haversineKm } from '../lib/geo'
import { isPlausiblePace, paceFrom } from '../lib/pace'

const today = '2026-11-24'

describe('seed data', () => {
  it('has 25–30 fictional athletes with unique ids', () => {
    expect(SEED_ATHLETES.length).toBeGreaterThanOrEqual(25)
    expect(SEED_ATHLETES.length).toBeLessThanOrEqual(30)
    expect(new Set(SEED_ATHLETES.map((a) => a.id)).size).toBe(SEED_ATHLETES.length)
  })

  it('varies ages 21–45, genders, sports and levels', () => {
    for (const a of SEED_ATHLETES) {
      const age = ageOn(a.birthDate, today)
      expect(age).toBeGreaterThanOrEqual(21)
      expect(age).toBeLessThanOrEqual(45)
    }
    expect(new Set(SEED_ATHLETES.map((a) => a.gender)).size).toBe(3)
    expect(new Set(SEED_ATHLETES.map((a) => a.level)).size).toBe(3)
    expect(new Set(SEED_ATHLETES.flatMap((a) => a.sports)).size).toBe(3)
  })

  it('has roughly 40% likesYou', () => {
    const share = SEED_ATHLETES.filter((a) => a.likesYou).length / SEED_ATHLETES.length
    expect(share).toBeGreaterThan(0.3)
    expect(share).toBeLessThan(0.5)
  })

  it('is mostly around Indianapolis, with a few farther away', () => {
    const indy = CITIES.find((c) => c.id === 'indianapolis')!
    const dist = (a: (typeof SEED_ATHLETES)[number]) =>
      haversineKm(
        indy,
        CITIES.find((c) => c.id === a.cityId)!,
      )
    const local = SEED_ATHLETES.filter((a) => dist(a) < 50).length
    expect(local / SEED_ATHLETES.length).toBeGreaterThan(0.7)
    expect(SEED_ATHLETES.some((a) => dist(a) > 150)).toBe(true)
  })

  it('uses only illustrated photos (never real photos)', () => {
    for (const a of [...SEED_ATHLETES, SAMPLE_PROFILE])
      for (const p of a.photos) expect(p.startsWith('art:')).toBe(true)
  })

  it('gives each athlete 3–8 activities with plausible metrics', () => {
    const acts = createSeedActivities(today)
    for (const a of SEED_ATHLETES) {
      const mine = acts.filter((x) => x.athleteId === a.id)
      expect(mine.length).toBeGreaterThanOrEqual(3)
      expect(mine.length).toBeLessThanOrEqual(8)
      for (const x of mine) {
        expect(a.sports).toContain(x.sport)
        expect(isPlausiblePace(x.sport, paceFrom(x.sport, x.distanceM, x.movingTimeS))).toBe(true)
        expect(x.date <= today).toBe(true)
      }
    }
  })

  it('keeps easy paces realistic for the level (e.g. 2:45 marathoner ≈ 7:30–8:15/mi)', () => {
    const maya = SEED_ATHLETES.find((a) => a.id === 'a01')!
    const perMile = (maya.paces.run! * 1609.344) / 1000
    expect(perMile).toBeGreaterThanOrEqual(450)
    expect(perMile).toBeLessThanOrEqual(495)
  })

  it('has 8–12 suggested routes, each with a meeting point and map data', () => {
    expect(ROUTES.length).toBeGreaterThanOrEqual(8)
    expect(ROUTES.length).toBeLessThanOrEqual(12)
    for (const r of ROUTES) {
      expect(r.meetingPoint).toBeTruthy()
      expect(r.path.length).toBeGreaterThan(0)
      expect(r.distanceOptionsM.length).toBeGreaterThan(0)
    }
    expect(ROUTES.some((r) => r.sports.includes('swim'))).toBe(true)
  })
})
