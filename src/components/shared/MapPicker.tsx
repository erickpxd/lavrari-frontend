import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import { Icon } from "leaflet"

const markerIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

// Centro padrão: SUAPE / Ipojuca-PE
const DEFAULT_CENTER: [number, number] = [-8.3958, -34.9619]

function ClickHandler({
  onPick,
}: {
  onPick: (lat: number, lon: number) => void
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

interface MapPickerProps {
  lat?: number | null
  lon?: number | null
  onPick?: (lat: number, lon: number) => void
  height?: number
  interactive?: boolean
  /** Centro inicial do mapa quando não há ponto marcado (não cria marcador). */
  initialCenter?: [number, number]
}

export function MapPicker({
  lat,
  lon,
  onPick,
  height = 280,
  interactive = true,
  initialCenter,
}: MapPickerProps) {
  const hasPoint = typeof lat === "number" && typeof lon === "number"
  const center: [number, number] = hasPoint
    ? [lat as number, lon as number]
    : (initialCenter ?? DEFAULT_CENTER)

  return (
    <div
      className="overflow-hidden rounded-lg border border-border"
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={hasPoint ? 15 : initialCenter ? 14 : 12}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={interactive}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {interactive && onPick && <ClickHandler onPick={onPick} />}
        {hasPoint && (
          <Marker position={[lat as number, lon as number]} icon={markerIcon} />
        )}
      </MapContainer>
    </div>
  )
}
