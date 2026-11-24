import 'leaflet/dist/leaflet.css'
import { latLngBounds } from 'leaflet'
import { CircleMarker, MapContainer, Polyline, TileLayer } from 'react-leaflet'
import type { Route } from '../../types'

/**
 * Small Leaflet map of a PUBLIC suggested route or venue (never a user's
 * own workout). OpenStreetMap tiles with the required attribution.
 * Colors come from theme tokens via the CSS classes in index.css.
 */
export default function RouteMap({ route }: { route: Route }) {
  const single = route.path.length === 1
  const bounds = latLngBounds(route.path).pad(0.25)
  return (
    <MapContainer
      {...(single ? { center: route.path[0], zoom: 15 } : { bounds })}
      scrollWheelZoom={false}
      className="h-40 w-full rounded-xl"
      attributionControl
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />
      {!single && (
        <Polyline positions={route.path} pathOptions={{ className: 'route-line', weight: 4 }} />
      )}
      <CircleMarker
        center={route.meetingLatLng}
        radius={8}
        pathOptions={{ className: 'route-meet', weight: 3, fillOpacity: 1 }}
      />
    </MapContainer>
  )
}
