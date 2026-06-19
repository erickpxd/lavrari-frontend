import { lazy, Suspense, useState } from "react"
import { Search, MapPin, Sparkles, Map, Globe } from "lucide-react"
import { useEvolucaoVisual } from "@/hooks/useObras"
import { MapPicker } from "@/components/shared/MapPicker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field"
import { IALoader } from "@/components/ui/loaders"
import { cn, formatDate, formatDateTime } from "@/lib/utils"
import type { Obra, MidiaResponse } from "@/lib/types"

const CesiumGlobe = lazy(() =>
  import("./CesiumGlobe").then((m) => ({ default: m.CesiumGlobe }))
)

export function EvolucaoVisual({ obra }: { obra: Obra }) {
  const [lat, setLat] = useState<number | null>(obra.latitude_obra ?? null)
  const [lon, setLon] = useState<number | null>(obra.longitude_obra ?? null)
  const [raio, setRaio] = useState(50)
  const [buscar, setBuscar] = useState(false)
  const [foto, setFoto] = useState<MidiaResponse | null>(null)
  const [view, setView] = useState<"2d" | "3d">("2d")

  const { data, isLoading, isError } = useEvolucaoVisual(
    obra.id_obra,
    { lat: lat ?? undefined, lon: lon ?? undefined, raio_metros: raio },
    buscar
  )

  const fotosFlat = data?.evolucao.flatMap((g) => g.fotos) ?? []
  const centerLat = lat ?? obra.latitude_obra ?? 0
  const centerLon = lon ?? obra.longitude_obra ?? 0

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-text-secondary">
            {view === "2d"
              ? "Clique no mapa para escolher um ponto e ver a evolução das fotos."
              : "Globo 3D — clique nos pinos para ver cada evidência."}
          </p>
          <div className="flex shrink-0 overflow-hidden rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setView("2d")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium",
                view === "2d"
                  ? "bg-primary text-white"
                  : "bg-white text-text-secondary hover:bg-primary-surface"
              )}
            >
              <Map className="size-3.5" /> 2D
            </button>
            <button
              type="button"
              onClick={() => setView("3d")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium",
                view === "3d"
                  ? "bg-primary text-white"
                  : "bg-white text-text-secondary hover:bg-primary-surface"
              )}
            >
              <Globe className="size-3.5" /> 3D
            </button>
          </div>
        </div>
        {view === "2d" ? (
          <MapPicker
            lat={lat}
            lon={lon}
            onPick={(la, lo) => {
              setLat(la)
              setLon(lo)
              setBuscar(false)
            }}
            height={360}
          />
        ) : (
          <Suspense
            fallback={
              <div className="grid h-[360px] place-items-center rounded-lg border border-border bg-dark-bg">
                <IALoader label="Carregando globo 3D…" />
              </div>
            }
          >
            <CesiumGlobe
              centerLat={centerLat}
              centerLon={centerLon}
              fotos={fotosFlat}
              height={360}
            />
          </Suspense>
        )}
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Raio (metros)" className="w-32">
            <Input
              type="number"
              value={raio}
              onChange={(e) => setRaio(Number(e.target.value))}
            />
          </Field>
          <Button onClick={() => setBuscar(true)} disabled={lat == null}>
            <Search className="size-4" /> Buscar evolução
          </Button>
          {lat != null && (
            <span className="text-xs text-text-muted">
              <MapPin className="mr-1 inline size-3" />
              {lat.toFixed(5)}, {lon?.toFixed(5)}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {!buscar ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-text-muted">
            Selecione um ponto e clique em buscar.
          </p>
        ) : isLoading ? (
          <IALoader label="Buscando fotos…" />
        ) : isError ? (
          <p className="rounded-lg border border-danger/30 bg-red-50 p-4 text-center text-sm text-danger">
            Acesso restrito ou nenhum dado disponível.
          </p>
        ) : !data || data.total_fotos === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-text-muted">
            Nenhuma foto neste ponto.
          </p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-medium">
              {data.total_fotos} foto(s) · raio {data.raio_metros}m
            </p>
            {data.evolucao.map((grupo) => (
              <div key={grupo.data}>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
                  {formatDate(grupo.data)}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {grupo.fotos.map((f) => (
                    <button
                      key={f.id_midia}
                      onClick={() => setFoto(f)}
                      className="overflow-hidden rounded-lg border border-border"
                    >
                      <img
                        src={f.storage_url}
                        alt=""
                        loading="lazy"
                        className="aspect-square w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {foto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setFoto(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={foto.storage_url}
              alt=""
              className="w-full rounded-lg object-contain"
            />
            <div className="mt-3 space-y-1 text-sm">
              <p className="flex items-center gap-1 text-text-secondary">
                <MapPin className="size-3.5" />
                {foto.latitude.toFixed(5)}, {foto.longitude.toFixed(5)} ·{" "}
                {formatDateTime(foto.data_hora_captura)}
              </p>
              {foto.ai_analise && (
                <div className="rounded-lg bg-primary-surface p-3 text-sm">
                  <p className="mb-1 flex items-center gap-1 font-medium text-primary">
                    <Sparkles className="size-3.5" /> Análise IA
                  </p>
                  {foto.ai_analise}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
