import { AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SEVERIDADE, TIPO_ALERTA } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Alerta } from "@/lib/types"

export function AlertaBadge({ alerta }: { alerta: Alerta }) {
  const sev = SEVERIDADE[alerta.severidade]
  return (
    <Badge className={cn(sev.badge)}>
      <AlertTriangle className="size-3" />
      {TIPO_ALERTA[alerta.tipo]} · {sev.label}
    </Badge>
  )
}

export function AlertaRow({
  alerta,
  onMarcarLido,
}: {
  alerta: Alerta
  onMarcarLido?: (id: string) => void
}) {
  const sev = SEVERIDADE[alerta.severidade]
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3",
        alerta.lido ? "border-border bg-surface opacity-60" : sev.badge
      )}
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">
          {alerta.titulo ?? TIPO_ALERTA[alerta.tipo]}
        </p>
        {(alerta.mensagem || alerta.descricao) && (
          <p className="mt-0.5 text-xs opacity-90">
            {alerta.mensagem ?? alerta.descricao}
          </p>
        )}
      </div>
      {!alerta.lido && onMarcarLido && (
        <button
          onClick={() => onMarcarLido(alerta.id_alerta)}
          className="shrink-0 text-xs font-medium underline-offset-2 hover:underline"
        >
          marcar lido
        </button>
      )}
    </div>
  )
}
