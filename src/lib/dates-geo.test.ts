import { describe, expect, it } from 'vitest'
import { addDays, ageOn, coarseWhen, dayLabel, daysBetween, isAdult, weekStart } from './dates'
import { haversineKm, roundedDistanceLabel } from './geo'
import { CITIES } from '../data/seed'

describe('dates', () => {
  const today = '2026-11-24' // a Tuesday

  it('computes ages and the 18+ rule', () => {
    expect(ageOn('2000-11-24', today)).toBe(26)
    expect(ageOn('2000-11-25', today)).toBe(25)
    expect(isAdult('2008-11-24', today)).toBe(true)
    expect(isAdult('2008-11-25', today)).toBe(false)
  })

  it('gives coarse, privacy-friendly activity times', () => {
    expect(coarseWhen(today, 'morning', today)).toBe('This morning')
    expect(coarseWhen(addDays(today, -1), 'evening', today)).toBe('Yesterday evening')
    expect(coarseWhen('2026-11-21', 'afternoon', today)).toBe('Saturday afternoon')
    expect(coarseWhen('2026-11-10', 'morning', today)).toBe('Nov 10 · morning')
  })

  it('labels future days', () => {
    expect(dayLabel(today, today)).toBe('Today')
    expect(dayLabel('2026-11-25', today)).toBe('Tomorrow')
    expect(dayLabel('2026-11-28', today)).toBe('Saturday, Nov 28')
  })

  it('does date arithmetic across months', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01')
    expect(daysBetween('2026-11-20', today)).toBe(4)
    expect(weekStart(today)).toBe('2026-11-23')
    expect(weekStart('2026-11-29')).toBe('2026-11-23') // Sunday
  })
})

describe('geo', () => {
  const city = (id: string) => CITIES.find((c) => c.id === id)!

  it('measures city distances', () => {
    const d = haversineKm(city('indianapolis'), city('carmel'))
    expect(d).toBeGreaterThan(20)
    expect(d).toBeLessThan(30)
    expect(haversineKm(city('indianapolis'), city('chicago'))).toBeGreaterThan(250)
  })

  it('rounds distances for privacy', () => {
    expect(roundedDistanceLabel(1.2, 'imperial')).toBe('Nearby')
    expect(roundedDistanceLabel(13, 'imperial')).toBe('8 mi away')
    expect(roundedDistanceLabel(13, 'metric')).toBe('13 km away')
    expect(roundedDistanceLabel(57, 'metric')).toBe('55 km away')
    expect(roundedDistanceLabel(263, 'imperial')).toBe('160 mi away')
  })
})
