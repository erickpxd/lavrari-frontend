import { MapPin } from "lucide-react"
import { useReverseGeocode } from "@/hooks/useReverseGeocode"
import { cn } from "@/lib/utils"

interface LocationLabelProps {
  lat?: number | null
  lon?: number | null
  /** Conteúdo extra renderizado ao lado das coordenadas (ex: data/hora). */
  meta?: string
  className?: string
  iconClassName?: string
  /** Estilo compacto para overlays de foto (texto branco, menor). */
  compact?: boolean
}

export function LocationLabel({
  lat,
  lon,
  meta,
  className,
  iconClassName,
  compact,
}: LocationLabelProps) {
  const { data: nome, isLoading } = useReverseGeocode(lat, lon)
  const hasCoords = lat != null && lon != null

  const coordText = hasCoords
    ? `${lat!.toFixed(5)}, ${lon!.toFixed(5)}${meta ? ` · ${meta}` : ""}`
    : "Sem localização"

  return (
    <div className={cn("min-w-0", className)}>
      <p
        className={cn(
          "flex items-center gap-1 font-medium",
          compact ? "text-white" : "text-text-primary"
        )}
      >
        <MapPin
          className={cn("size-3.5 shrink-0", iconClassName)}
        />
        <span className="truncate">
          {isLoading
            ? "Localizando…"
            : (nome ?? (hasCoords ? "Local não identificado" : "Sem localização"))}
        </span>
      </p>
      {hasCoords && (
        <p
          className={cn(
            "pl-[18px] font-mono",
            compact ? "text-[10px] text-white/80" : "text-xs text-text-muted"
          )}
        >
          {coordText}
        </p>
      )}
    </div>
  )
}
