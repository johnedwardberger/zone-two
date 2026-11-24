import type { City, Units } from '../types'
import { KM_PER_MI } from './units'

/** Great-circle distance in km. */
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function cityDistanceKm(cities: City[], fromId: string, toId: string): number {
  const a = cities.find((c) => c.id === fromId)
  const b = cities.find((c) => c.id === toId)
  if (!a || !b) return Infinity
  return haversineKm(a, b)
}

/**
 * Rounded, privacy-friendly distance: "Nearby" under 2 units, then whole
 * units up to 25, then nearest 5, then nearest 10 beyond 100.
 */
export function roundedDistanceLabel(km: number, units: Units): string {
  if (!Number.isFinite(km)) return ''
  const v = units === 'imperial' ? km / KM_PER_MI : km
  const u = units === 'imperial' ? 'mi' : 'km'
  if (v < 2) return 'Nearby'
  const step = v <= 25 ? 1 : v <= 100 ? 5 : 10
  return `${Math.round(v / step) * step} ${u} away`
}
