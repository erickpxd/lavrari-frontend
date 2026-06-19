import { useNavigate } from "react-router-dom"
import { MapPin, FileText, AlertTriangle, Building2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { HealthGauge } from "./HealthGauge"
import { healthColor, formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"
import type { Obra } from "@/lib/types"

interface ObraCardProps {
  obra: Obra
  score?: number
  classificacao?: string
  percentualPrazo?: number
  totalRdos?: number
  alertas?: number
  fiscalNome?: string
  logoUrl?: string | null
  empresaNome?: string
}

export function ObraCard({
  obra,
  score,
  classificacao,
  percentualPrazo,
  totalRdos,
  alertas,
  fiscalNome,
  logoUrl,
  empresaNome,
}: ObraCardProps) {
  const navigate = useNavigate()
  const borderColor =
    score !== undefined ? healthColor(score).hex : "#CBD5E1"
  const pct = Math.min(100, Math.max(0, percentualPrazo ?? 0))
  const logo = logoUrl ?? obra.logo_contratada_url

  return (
    <button
      onClick={() => navigate(`/obras/${obra.id_obra}`)}
      style={{ borderLeftColor: borderColor }}
      className={cn(
        "group w-full rounded-xl border border-l-4 border-border bg-surface p-4 text-left shadow-sm transition-all duration-150",
        "hover:-translate-y-0.5 hover:shadow-lg"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-white">
          {logo ? (
            <img
              src={logo}
              alt={empresaNome ?? "Logo da empresa"}
              className="size-full object-contain p-1"
            />
          ) : (
            <Building2 className="size-7 text-text-muted" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge className="border-primary/20 bg-primary-surface text-primary">
              {obra.tipologia}
            </Badge>
            <span className="font-mono text-xs text-text-muted">
              {obra.numero_contrato}
            </span>
          </div>
          <h3 className="mt-1 font-heading text-base font-semibold leading-snug">
            {obra.objeto_contratual}
          </h3>
          {empresaNome && (
            <p className="text-xs font-medium text-text-secondary">
              {empresaNome}
            </p>
          )}
          <p className="mt-0.5 flex items-center gap-1 text-xs text-text-secondary">
            <MapPin className="size-3 shrink-0" />
            {obra.local_descricao}
          </p>
        </div>

        {score !== undefined && (
          <HealthGauge
            score={score}
            classificacao={classificacao}
            size={68}
            compact
          />
        )}
      </div>

      {percentualPrazo !== undefined && (
        <div className="mt-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-text-muted">
            <span>{formatDate(obra.data_inicio_execucao)}</span>
            <span className="font-medium text-text-secondary">
              {pct.toFixed(0)}% decorrido
            </span>
            <span>{formatDate(obra.data_fim_execucao)}</span>
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-2.5 text-xs text-text-secondary">
        {totalRdos !== undefined && (
          <span className="flex items-center gap-1">
            <FileText className="size-3.5" /> {totalRdos} RDOs
          </span>
        )}
        {alertas !== undefined && alertas > 0 && (
          <span className="flex items-center gap-1 text-warning">
            <AlertTriangle className="size-3.5" /> {alertas} alertas
          </span>
        )}
        {fiscalNome && <span>Fiscal: {fiscalNome}</span>}
      </div>
    </button>
  )
}
