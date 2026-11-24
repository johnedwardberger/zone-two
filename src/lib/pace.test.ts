import { describe, expect, it } from 'vitest'
import {
  formatClock,
  formatDuration,
  formatPaceValue,
  isPlausiblePace,
  paceFrom,
  paceFromDisplay,
  paceToDisplay,
  parseClock,
  parsePaceInput,
  slowerPace,
  timeFor,
} from './pace'

describe('pace & speed', () => {
  it('computes run pace (s/km) and formats per mile', () => {
    // Marathon in 2:45:00 → 3:54.6/km → 6:17.7/mi
    const p = paceFrom('run', 42195, 2 * 3600 + 45 * 60)
    expect(p).toBeCloseTo(234.6, 1)
    expect(formatPaceValue('run', p, 'metric')).toBe('3:55')
    expect(formatPaceValue('run', p, 'imperial')).toBe('6:18')
  })

  it('computes ride speed in km/h and mph', () => {
    const v = paceFrom('ride', 64373.76, 3 * 3600) // 40 mi in 3 h
    expect(paceToDisplay('ride', v, 'imperial')).toBeCloseTo(13.33, 2)
    expect(formatPaceValue('ride', v, 'metric')).toBe('21.5')
  })

  it('computes swim pace per 100 m and per 100 yd', () => {
    const p = paceFrom('swim', 2000, 30 * 60) // 1:30/100m
    expect(p).toBe(90)
    expect(formatPaceValue('swim', p, 'metric')).toBe('1:30')
    expect(formatPaceValue('swim', p, 'imperial')).toBe('1:22')
  })

  it('round-trips display ↔ canonical', () => {
    for (const sport of ['run', 'ride', 'swim'] as const)
      expect(paceFromDisplay(sport, paceToDisplay(sport, 123, 'imperial'), 'imperial')).toBeCloseTo(
        123,
      )
  })

  it('computes time for a distance at a pace', () => {
    expect(timeFor('run', 10000, 300)).toBe(3000)
    expect(timeFor('ride', 30000, 30)).toBe(3600)
    expect(timeFor('swim', 1500, 100)).toBe(1500)
  })

  it('returns NaN for zero or negative inputs', () => {
    expect(paceFrom('run', 0, 100)).toBeNaN()
    expect(paceFrom('run', 100, -1)).toBeNaN()
    expect(formatPaceValue('run', NaN, 'metric')).toBe('–')
  })

  it('formats clocks and durations', () => {
    expect(formatClock(65)).toBe('1:05')
    expect(formatClock(3725)).toBe('1:02:05')
    expect(formatDuration(45 * 60)).toBe('45m')
    expect(formatDuration(5400)).toBe('1h 30m')
    expect(formatDuration(7200)).toBe('2h')
  })

  it('parses clock inputs', () => {
    expect(parseClock('7:45')).toBe(465)
    expect(parseClock('1:02:03')).toBe(3723)
    expect(parseClock('45')).toBe(2700)
    expect(parseClock('7:75')).toBeNaN()
    expect(parseClock('abc')).toBeNaN()
    expect(parseClock('-5')).toBeNaN()
    expect(parseClock('')).toBeNaN()
  })

  it('parses pace inputs in display units', () => {
    expect(parsePaceInput('run', '8:00', 'imperial')).toBeCloseTo(298.26, 1)
    expect(parsePaceInput('ride', '20', 'imperial')).toBeCloseTo(32.19, 1)
    expect(parsePaceInput('swim', '1:30', 'metric')).toBe(90)
    expect(parsePaceInput('ride', '0', 'metric')).toBeNaN()
  })

  it('flags physically impossible paces', () => {
    expect(isPlausiblePace('run', 120)).toBe(false) // 2:00/km
    expect(isPlausiblePace('run', 300)).toBe(true)
    expect(isPlausiblePace('ride', 80)).toBe(false)
    expect(isPlausiblePace('ride', 30)).toBe(true)
    expect(isPlausiblePace('swim', 30)).toBe(false)
    expect(isPlausiblePace('swim', 95)).toBe(true)
  })

  it('picks the slower pace (speed-aware for rides)', () => {
    expect(slowerPace('run', 300, 330)).toBe(330)
    expect(slowerPace('swim', 90, 85)).toBe(90)
    expect(slowerPace('ride', 30, 26)).toBe(26)
  })
})
