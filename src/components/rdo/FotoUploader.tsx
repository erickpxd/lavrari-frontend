import { useRef, useState } from "react"
import { Camera, MapPin, Loader2, CheckCircle2, Trash2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { getGPS } from "@/hooks/useGPS"
import { useRdoMidias, useUploadMidia, useDeleteMidia } from "@/hooks/useRdos"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { Icon } from "leaflet"
import { LocationLabel } from "@/components/shared/LocationLabel"
import { MapPicker } from "@/components/shared/MapPicker"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { formatDateTime } from "@/lib/utils"
import { AuthImage } from "@/components/shared/AuthImage"
import { readPhotoMeta } from "@/lib/photoMeta"

const pinIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

type Stage = "idle" | "reading" | "uploading"

export function FotoUploader({
  rdoId,
  editable,
  obraLat,
  obraLon,
}: {
  rdoId: string
  editable: boolean
  obraLat?: number | null
  obraLon?: number | null
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [stage, setStage] = useState<Stage>("idle")
  const [pending, setPending] = useState<{ file: File; date: string } | null>(
    null
  )
  const [picked, setPicked] = useState<{ lat: number; lon: number } | null>(
    null
  )
  const { data: midias } = useRdoMidias(rdoId)
  const upload = useUploadMidia(rdoId)
  const del = useDeleteMidia(rdoId)

  async function doUpload(
    file: File,
    lat: number,
    lon: number,
    date: string
  ) {
    setStage("uploading")
    try {
      const form = new FormData()
      form.append("arquivo", file)
      form.append("latitude", String(lat))
      form.append("longitude", String(lon))
      form.append("data_hora_captura", date)
      await upload.mutateAsync(form)
      toast.success("Foto enviada — IA analisando em segundo plano")
    } catch {
      toast.error("Falha no upload da foto")
    } finally {
      setStage("idle")
      setPending(null)
      setPicked(null)
    }
  }

  function closeMap() {
    setPending(null)
    setPicked(null)
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    setStage("reading")
    const meta = await readPhotoMeta(file)

    if (meta.lat != null && meta.lon != null) {
      // localização veio dos metadados da foto
      await doUpload(file, meta.lat, meta.lon, meta.date)
      return
    }

    // sem GPS nos metadados → abrir mapa para o usuário marcar o local
    setStage("idle")
    try {
      const g = await getGPS()
      setPicked({ lat: g.lat, lon: g.lon })
    } catch {
      setPicked(null)
    }
    setPending({ file, date: meta.date })
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
            {stage === "reading" ? (
              <>
                <span className="relative flex size-10 items-center justify-center">
                  <span className="absolute inline-flex size-10 animate-ping rounded-full bg-primary/30" />
                  <MapPin className="size-7" />
                </span>
                <span className="text-sm font-medium">Lendo metadados…</span>
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
                  Data e local lidos da foto — sem GPS, você marca no mapa
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
                <AuthImage
                  src={m.storage_url}
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
                key={pins[pins.length - 1].id_midia}
                center={[
                  pins[pins.length - 1].latitude,
                  pins[pins.length - 1].longitude,
                ]}
                zoom={16}
                scrollWheelZoom
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
                        <AuthImage
                          src={m.storage_url}
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

      <Dialog
        open={pending !== null}
        onOpenChange={(o) => !o && closeMap()}
      >
        <DialogContent onClose={closeMap}>
          <DialogHeader>
            <DialogTitle>Marque o local da foto</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-secondary">
            Esta foto não tem localização nos metadados. Toque no mapa para
            indicar onde ela foi tirada — a data foi lida automaticamente.
          </p>
          <div className="mt-3 overflow-hidden rounded-lg border border-border">
            <MapPicker
              lat={picked?.lat}
              lon={picked?.lon}
              initialCenter={
                obraLat != null && obraLon != null
                  ? [obraLat, obraLon]
                  : undefined
              }
              onPick={(lat, lon) => setPicked({ lat, lon })}
              height={300}
            />
          </div>
          {picked && (
            <p className="mt-2 text-xs text-text-muted">
              Local: {picked.lat.toFixed(5)}, {picked.lon.toFixed(5)}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeMap}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (!pending || !picked) {
                  toast.error("Toque no mapa para marcar o local")
                  return
                }
                doUpload(pending.file, picked.lat, picked.lon, pending.date)
              }}
              disabled={!picked || stage === "uploading"}
            >
              {stage === "uploading" && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Enviar foto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
