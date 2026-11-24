import { describe, expect, it } from 'vitest'
import {
  roundDistanceM,
  displayToKm,
  displayToMeters,
  distanceUnit,
  formatDistance,
  formatElevation,
  kmToDisplay,
  metersToDisplay,
  paceUnit,
} from './units'

describe('units', () => {
  it('labels distance and pace units per sport', () => {
    expect(distanceUnit('run', 'imperial')).toBe('mi')
    expect(distanceUnit('ride', 'metric')).toBe('km')
    expect(distanceUnit('swim', 'imperial')).toBe('yd')
    expect(distanceUnit('swim', 'metric')).toBe('m')
    expect(paceUnit('run', 'imperial')).toBe('/mi')
    expect(paceUnit('ride', 'imperial')).toBe('mph')
    expect(paceUnit('ride', 'metric')).toBe('km/h')
    expect(paceUnit('swim', 'imperial')).toBe('/100yd')
  })

  it('converts meters to display distance and back', () => {
    expect(metersToDisplay(1609.344, 'run', 'imperial')).toBeCloseTo(1)
    expect(metersToDisplay(10000, 'ride', 'metric')).toBe(10)
    expect(metersToDisplay(91.44, 'swim', 'imperial')).toBeCloseTo(100)
    for (const sport of ['run', 'ride', 'swim'] as const)
      for (const units of ['imperial', 'metric'] as const)
        expect(displayToMeters(metersToDisplay(4321, sport, units), sport, units)).toBeCloseTo(4321)
  })

  it('formats distances sensibly', () => {
    expect(formatDistance(42195, 'run', 'imperial')).toBe('26.2 mi')
    expect(formatDistance(5000, 'run', 'metric')).toBe('5 km')
    expect(formatDistance(8046.72, 'run', 'imperial')).toBe('5 mi')
    expect(formatDistance(160934, 'ride', 'imperial')).toBe('100 mi')
    expect(formatDistance(2000, 'swim', 'metric')).toBe('2,000 m')
    expect(formatDistance(1828.8, 'swim', 'imperial')).toBe('2,000 yd')
  })

  it('formats elevation', () => {
    expect(formatElevation(304.8, 'imperial')).toBe('1,000 ft')
    expect(formatElevation(250, 'metric')).toBe('250 m')
  })

  it('converts km for radius sliders', () => {
    expect(kmToDisplay(16.09344, 'imperial')).toBeCloseTo(10)
    expect(displayToKm(10, 'imperial')).toBeCloseTo(16.09344)
    expect(displayToKm(10, 'metric')).toBe(10)
  })

  it('rounds suggested distances to friendly numbers', () => {
    expect(formatDistance(roundDistanceM(8000, 'run', 'imperial'), 'run', 'imperial')).toBe('5 mi')
    expect(formatDistance(roundDistanceM(8000, 'run', 'metric'), 'run', 'metric')).toBe('8 km')
    expect(formatDistance(roundDistanceM(1850, 'swim', 'imperial'), 'swim', 'imperial')).toBe(
      '2,000 yd',
    )
  })
})
