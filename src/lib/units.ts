import type { Sport, Units } from '../types'

export const M_PER_MI = 1609.344
export const M_PER_KM = 1000
export const M_PER_YD = 0.9144
export const M_PER_FT = 0.3048
export const KM_PER_MI = M_PER_MI / M_PER_KM

/** Unit labels for a sport's distance, given the viewer's units. */
export function distanceUnit(sport: Sport, units: Units): string {
  if (sport === 'swim') return units === 'imperial' ? 'yd' : 'm'
  return units === 'imperial' ? 'mi' : 'km'
}

/** Pace/speed label, e.g. "/mi", "mph", "/100yd". */
export function paceUnit(sport: Sport, units: Units): string {
  if (sport === 'run') return units === 'imperial' ? '/mi' : '/km'
  if (sport === 'ride') return units === 'imperial' ? 'mph' : 'km/h'
  return units === 'imperial' ? '/100yd' : '/100m'
}

/** Meters → the sport's display distance unit (mi/km, or yd/m for swims). */
export function metersToDisplay(meters: number, sport: Sport, units: Units): number {
  if (sport === 'swim') return units === 'imperial' ? meters / M_PER_YD : meters
  return units === 'imperial' ? meters / M_PER_MI : meters / M_PER_KM
}

/** Inverse of metersToDisplay. */
export function displayToMeters(value: number, sport: Sport, units: Units): number {
  if (sport === 'swim') return units === 'imperial' ? value * M_PER_YD : value
  return units === 'imperial' ? value * M_PER_MI : value * M_PER_KM
}

export function formatDistance(meters: number, sport: Sport, units: Units): string {
  const v = metersToDisplay(meters, sport, units)
  if (sport === 'swim')
    return `${Math.round(v).toLocaleString('en-US')} ${distanceUnit(sport, units)}`
  const digits = v >= 100 ? 0 : v >= 10 ? 1 : 2
  return `${trimZeros(v.toFixed(digits))} ${distanceUnit(sport, units)}`
}

export function formatElevation(meters: number, units: Units): string {
  return units === 'imperial'
    ? `${Math.round(meters / M_PER_FT).toLocaleString('en-US')} ft`
    : `${Math.round(meters).toLocaleString('en-US')} m`
}

export function kmToDisplay(km: number, units: Units): number {
  return units === 'imperial' ? km / KM_PER_MI : km
}

export function displayToKm(value: number, units: Units): number {
  return units === 'imperial' ? value * KM_PER_MI : value
}

export function longDistanceUnit(units: Units): 'mi' | 'km' {
  return units === 'imperial' ? 'mi' : 'km'
}

function trimZeros(s: string): string {
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s
}

/** Round a distance to a friendly whole number in the viewer's units (100s for swims). */
export function roundDistanceM(meters: number, sport: Sport, units: Units): number {
  const step = sport === 'swim' ? 100 : 1
  const v = Math.max(step, Math.round(metersToDisplay(meters, sport, units) / step) * step)
  return displayToMeters(v, sport, units)
}
