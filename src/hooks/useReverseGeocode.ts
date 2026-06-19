import { useQuery } from "@tanstack/react-query"

interface NominatimAddress {
  road?: string
  pedestrian?: string
  suburb?: string
  neighbourhood?: string
  city?: string
  town?: string
  village?: string
  municipality?: string
  state?: string
}

/**
 * Reverse geocoding via OpenStreetMap Nominatim — converte lat/lon em
 * nome de rua/avenida + bairro/cidade. Cache agressivo (coordenadas não mudam).
 */
async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=pt-BR`
  const res = await fetch(url, {
    headers: { "Accept-Language": "pt-BR" },
  })
  if (!res.ok) throw new Error("Falha na geocodificação")
  const data = await res.json()
  const a: NominatimAddress = data.address ?? {}
  const rua = a.road ?? a.pedestrian
  const bairro = a.suburb ?? a.neighbourhood
  const cidade = a.city ?? a.town ?? a.village ?? a.municipality
  const partes = [rua, bairro, cidade].filter(Boolean)
  return partes.length > 0
    ? partes.join(", ")
    : (data.display_name ?? "Local não identificado")
}

export function useReverseGeocode(lat?: number | null, lon?: number | null) {
  return useQuery({
    queryKey: ["geocode", lat, lon],
    queryFn: () => reverseGeocode(lat as number, lon as number),
    enabled: lat != null && lon != null && !(lat === 0 && lon === 0),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  })
}
