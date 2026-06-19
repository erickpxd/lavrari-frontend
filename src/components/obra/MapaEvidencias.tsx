import { lazy, Suspense } from "react"
import { MapPin } from "lucide-react"
import { useMapaEvidencias } from "@/hooks/useObras"
import { Card, CardContent } from "@/components/ui/card"
import { IALoader } from "@/components/ui/loaders"
import type { Obra } from "@/lib/types"

const CesiumGlobe = lazy(() =>
  import("./CesiumGlobe").then((m) => ({ default: m.CesiumGlobe }))
)

export function MapaEvidencias({ obra }: { obra: Obra }) {
  const { data, isLoading } = useMapaEvidencias(obra.id_obra)

  if (isLoading) return <IALoader label="Carregando evidências…" />

  const evidencias = data?.evidencias ?? []
  const lat = data?.centro.lat ?? obra.latitude_obra ?? null
  const lon = data?.centro.lon ?? obra.longitude_obra ?? null

  if (evidencias.length === 0 || lat == null || lon == null) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-text-secondary">
          <MapPin className="size-8 text-text-muted" />
          <p className="text-sm">
            Nenhuma evidência georreferenciada nesta obra ainda.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center gap-2 border-b border-border p-3 text-sm text-text-secondary">
          <MapPin className="size-4 text-primary" />
          {data?.total} evidência(s) georreferenciada(s)
        </div>
        <Suspense
          fallback={
            <div className="grid h-[480px] place-items-center bg-dark-bg">
              <IALoader label="Carregando mapa 3D…" />
            </div>
          }
        >
          <CesiumGlobe
            centerLat={lat}
            centerLon={lon}
            fotos={evidencias}
            height={480}
          />
        </Suspense>
      </CardContent>
    </Card>
  )
}
