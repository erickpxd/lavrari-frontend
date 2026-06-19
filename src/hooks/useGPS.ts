import { useState, useCallback } from "react"

export interface GPSCoords {
  lat: number
  lon: number
  accuracy?: number
}

export async function getGPS(): Promise<GPSCoords> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocalização não suportada neste dispositivo"))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords
        if (latitude === 0 && longitude === 0) {
          reject(new Error("GPS retornou coordenadas inválidas (0,0)"))
          return
        }
        resolve({ lat: latitude, lon: longitude, accuracy })
      },
      () => reject(new Error("GPS indisponível — verifique as permissões")),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  })
}

export function useGPS() {
  const [coords, setCoords] = useState<GPSCoords | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const capture = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const c = await getGPS()
      setCoords(c)
      return c
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao obter GPS"
      setError(msg)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { coords, loading, error, capture }
}
