import { useRef, useState } from "react"
import { Camera, MapPin, Loader2, CheckCircle2, Trash2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { getGPS } from "@/hooks/useGPS"
import { useRdoMidias, useUploadMidia, useDeleteMidia } from "@/hooks/useRdos"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { Icon } from "leaflet"
import { LocationLabel } from "@/components/shared/LocationLabel"
import { formatDateTime } from "@/lib/utils"

const pinIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

type Stage = "idle" | "gps" | "uploading"

export function FotoUploader({
  rdoId,
  editable,
}: {
  rdoId: string
  editable: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [stage, setStage] = useState<Stage>("idle")
  const { data: midias } = useRdoMidias(rdoId)
  const upload = useUploadMidia(rdoId)
  const del = useDeleteMidia(rdoId)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    setStage("gps")
    let gps
    try {
      gps = await getGPS()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "GPS indisponível")
      setStage("idle")
      return
    }

    setStage("uploading")
    try {
      const form = new FormData()
      form.append("arquivo", file)
      form.append("latitude", String(gps.lat))
      form.append("longitude", String(gps.lon))
      form.append("data_hora_captura", new Date().toISOString())
      await upload.mutateAsync(form)
      toast.success("Foto enviada — IA analisando em segundo plano")
    } catch {
      toast.error("Falha no upload da foto")
    } finally {
      setStage("idle")
    }
  }

  const pins = (midias ?? []).filter(
    (m) => m.latitude !== 0 && m.longitude !== 0
  )

  return (
    <div className="space-y-4">
      {editable && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            capture="environment"
            className="hidden"
            onChange={handleFile}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={stage !== "idle"}
            className="field-touch flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/30 bg-primary-surface/40 py-8 text-primary transition-colors hover:bg-primary-surface disabled:opacity-60"
          >
            {stage === "gps" ? (
              <>
                <span className="relative flex size-10 items-center justify-center">
                  <span className="absolute inline-flex size-10 animate-ping rounded-full bg-primary/30" />
                  <MapPin className="size-7" />
                </span>
                <span className="text-sm font-medium">Obtendo localização…</span>
              </>
            ) : stage === "uploading" ? (
              <>
                <Loader2 className="size-8 animate-spin" />
                <span className="text-sm font-medium">Enviando foto…</span>
              </>
            ) : (
              <>
                <Camera className="size-8" />
                <span className="text-sm font-medium">
                  Tirar foto ou selecionar
                </span>
                <span className="text-xs text-text-muted">
                  GPS obrigatório — capturado automaticamente
                </span>
              </>
            )}
          </button>
        </>
      )}

      {midias && midias.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            {midias.map((m) => (
              <div
                key={m.id_midia}
                className="group relative overflow-hidden rounded-lg border border-border"
              >
                <img
                  src={m.storage_url}
                  alt=""
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1.5">
                  <LocationLabel
                    lat={m.latitude}
                    lon={m.longitude}
                    meta={formatDateTime(m.data_hora_captura)}
                    compact
                  />
                </div>
                {m.ai_analise && (
                  <div className="absolute right-1 top-1">
                    <span
                      className="flex size-6 items-center justify-center rounded-full bg-primary text-white"
                      title={m.ai_analise}
                    >
                      <Sparkles className="size-3.5" />
                    </span>
                  </div>
                )}
                {!m.ai_analise && (
                  <CheckCircle2 className="absolute right-1.5 top-1.5 size-5 text-success drop-shadow" />
                )}
                {editable && (
                  <button
                    onClick={() => del.mutate(m.id_midia)}
                    className="absolute left-1.5 top-1.5 rounded-full bg-danger p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {pins.length > 0 && (
            <div className="h-56 overflow-hidden rounded-lg border border-border">
              <MapContainer
                center={[pins[0].latitude, pins[0].longitude]}
                zoom={16}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {pins.map((m) => (
                  <Marker
                    key={m.id_midia}
                    position={[m.latitude, m.longitude]}
                    icon={pinIcon}
                  >
                    <Popup>
                      <div className="w-44 space-y-1.5">
                        <img
                          src={m.storage_url}
                          alt=""
                          className="aspect-video w-full rounded object-cover"
                        />
                        <LocationLabel
                          lat={m.latitude}
                          lon={m.longitude}
                          className="text-xs"
                        />
                        <p className="text-[11px] text-text-muted">
                          {formatDateTime(m.data_hora_captura)}
                        </p>
                        {m.ai_analise && (
                          <p className="flex items-start gap-1 text-[11px] text-primary">
                            <Sparkles className="mt-0.5 size-3 shrink-0" />
                            {m.ai_analise}
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}
        </>
      ) : (
        <p className="py-4 text-center text-sm text-text-muted">
          Nenhuma foto registrada.
        </p>
      )}
    </div>
  )
}
