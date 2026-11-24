import { describe, expect, it } from 'vitest'
import type { Activity, Athlete } from '../types'
import {
  PACE_FILTER_BOUNDS,
  broadFilters,
  closestOption,
  isMutual,
  latestActivity,
  passesFilters,
  routesForSport,
  sharedSports,
  suggestFirstDate,
  typicalDistanceM,
} from './matching'
import { trainingSnapshot } from './stats'
import { CITIES } from '../data/seed'
import { ROUTES } from '../data/routes'

const today = '2026-11-24'

const base: Athlete = {
  id: 'me',
  firstName: 'Test',
  birthDate: '1995-01-01', // 31
  gender: 'woman',
  meet: ['man'],
  ageMin: 25,
  ageMax: 40,
  cityId: 'indianapolis',
  sports: ['run', 'ride'],
  weeklyHours: 8,
  level: 'competitive',
  paces: { run: 300, ride: 28 },
  bio: '',
  idealDate: '',
  photos: [],
}
const them: Athlete = {
  ...base,
  id: 'x',
  firstName: 'Them',
  birthDate: '1992-01-01', // 34
  gender: 'man',
  meet: ['woman'],
  sports: ['run'],
  paces: { run: 330 },
  weeklyHours: 10,
}

function act(over: Partial<Activity>): Activity {
  return {
    id: Math.random().toString(36),
    athleteId: 'me',
    sport: 'run',
    title: 't',
    date: today,
    timeOfDay: 'morning',
    distanceM: 10000,
    movingTimeS: 3000,
    loggedWith: 'Strava',
    photos: [],
    basePulses: 0,
    comments: [],
    postedAt: 0,
    ...over,
  }
}

describe('passesFilters (two-way)', () => {
  const f = { ...broadFilters(['man']), ageMin: 25, ageMax: 40 }

  it('accepts a compatible athlete', () => {
    expect(passesFilters(base, them, f, CITIES, today)).toBe(true)
  })

  it('applies my gender and age preferences', () => {
    expect(passesFilters(base, { ...them, gender: 'woman' }, f, CITIES, today)).toBe(false)
    expect(passesFilters(base, { ...them, birthDate: '1980-01-01' }, f, CITIES, today)).toBe(false)
  })

  it('applies their gender and age preferences too', () => {
    expect(passesFilters(base, { ...them, meet: ['man'] }, f, CITIES, today)).toBe(false)
    expect(passesFilters(base, { ...them, ageMin: 35 }, f, CITIES, today)).toBe(false)
  })

  it('filters by distance from my city', () => {
    const far = { ...them, cityId: 'chicago' }
    expect(passesFilters(base, far, { ...f, radiusKm: 50 }, CITIES, today)).toBe(false)
    expect(passesFilters(base, far, { ...f, radiusKm: null }, CITIES, today)).toBe(true)
    expect(
      passesFilters(base, { ...them, cityId: 'carmel' }, { ...f, radiusKm: 50 }, CITIES, today),
    ).toBe(true)
  })

  it('filters by sport, level, weekly hours and pace', () => {
    expect(passesFilters(base, them, { ...f, sports: ['swim'] }, CITIES, today)).toBe(false)
    expect(passesFilters(base, them, { ...f, levels: ['elite'] }, CITIES, today)).toBe(false)
    expect(passesFilters(base, them, { ...f, minWeeklyHours: 12 }, CITIES, today)).toBe(false)
    const fastOnly = { ...f, paceRanges: { ...f.paceRanges, run: [180, 300] as [number, number] } }
    expect(passesFilters(base, them, fastOnly, CITIES, today)).toBe(false)
  })

  it('treats pace slider ends as open-ended', () => {
    const elite = { ...them, paces: { run: 170 } } // faster than the slider min
    expect(
      passesFilters(base, elite, { ...f, paceRanges: { ...PACE_FILTER_BOUNDS } }, CITIES, today),
    ).toBe(true)
  })
})

describe('pulse & date helpers', () => {
  it('needs a Pulse on both sides for a mutual', () => {
    expect(isMutual(true, true)).toBe(true)
    expect(isMutual(true, false)).toBe(false)
    expect(isMutual(false, true)).toBe(false)
  })

  it('finds shared sports', () => {
    expect(sharedSports(base, them)).toEqual(['run'])
  })

  it('picks the latest activity', () => {
    const acts = [
      act({ id: 'old', athleteId: 'x', date: '2026-11-20' }),
      act({ id: 'am', athleteId: 'x', date: '2026-11-23', timeOfDay: 'morning' }),
      act({ id: 'pm', athleteId: 'x', date: '2026-11-23', timeOfDay: 'evening' }),
    ]
    expect(latestActivity(acts, 'x')?.id).toBe('pm')
  })

  it('computes a median typical distance with defaults', () => {
    const acts = [8000, 12000, 10000].map((d) => act({ athleteId: 'x', distanceM: d }))
    expect(typicalDistanceM(acts, 'x', 'run')).toBe(10000)
    expect(typicalDistanceM(acts, 'x', 'swim')).toBe(2000)
  })

  it('suggests a first date at the slower partner’s pace and shorter distance', () => {
    const acts = [
      act({ athleteId: 'me', distanceM: 16000 }),
      act({ athleteId: 'x', distanceM: 8200 }),
    ]
    const s = suggestFirstDate(base, them, acts, ROUTES)
    expect(s.sport).toBe('run')
    expect(s.pace).toBe(330)
    expect(s.distanceM).toBe(8000)
    expect(s.route?.sports).toContain('run')
  })

  it('ranks routes by distance fit', () => {
    const swims = routesForSport(ROUTES, 'swim', 2000)
    expect(swims.length).toBeGreaterThan(0)
    expect(swims.every((r) => r.sports.includes('swim'))).toBe(true)
    expect(closestOption(swims[0], 2100)).toBe(2000)
  })
})

describe('trainingSnapshot', () => {
  it('summarizes weeks, totals and the longest session', () => {
    const acts = [
      act({ date: '2026-11-23', movingTimeS: 3600 }),
      act({ date: '2026-11-17', movingTimeS: 7200, sport: 'ride', distanceM: 60000 }),
      act({ date: '2026-10-01', movingTimeS: 1800 }), // outside 8 weeks
    ]
    const s = trainingSnapshot(acts, today)
    expect(s.weeks).toHaveLength(8)
    expect(s.weeks[7].hours).toBe(1)
    expect(s.weeks[6].hours).toBe(2)
    expect(s.avgWeeklyHours4).toBe(0.75)
    expect(s.totals.run.count).toBe(2)
    expect(s.totals.ride.distanceM).toBe(60000)
    expect(s.longest?.movingTimeS).toBe(7200)
  })
})
