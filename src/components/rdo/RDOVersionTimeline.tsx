import {
  Plus,
  Pencil,
  Send,
  CheckCircle,
  XCircle,
  ShieldCheck,
  ShieldX,
  RotateCcw,
  Archive,
  type LucideIcon,
} from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import { cn } from "@/lib/utils"
import type { AcaoVersao, RDOVersao } from "@/lib/types"

const ACAO_CONFIG: Record<
  AcaoVersao,
  { icon: LucideIcon; color: string; label: string }
> = {
  criacao: { icon: Plus, color: "text-blue-600 bg-blue-100", label: "Criado" },
  edicao: { icon: Pencil, color: "text-slate-600 bg-slate-100", label: "Editado" },
  envio_revisao: {
    icon: Send,
    color: "text-blue-600 bg-blue-100",
    label: "Enviado para revisão",
  },
  aprovacao_externa: {
    icon: CheckCircle,
    color: "text-emerald-600 bg-emerald-100",
    label: "Aprovado (externo)",
  },
  reprovacao_externa: {
    icon: XCircle,
    color: "text-red-600 bg-red-100",
    label: "Reprovado (externo)",
  },
  aprovacao_suape: {
    icon: ShieldCheck,
    color: "text-green-600 bg-green-100",
    label: "Aprovado SUAPE",
  },
  reprovacao_suape: {
    icon: ShieldX,
    color: "text-red-600 bg-red-100",
    label: "Reprovado SUAPE",
  },
  reabertura: {
    icon: RotateCcw,
    color: "text-amber-600 bg-amber-100",
    label: "Reaberto",
  },
  finalizacao: {
    icon: Archive,
    color: "text-gray-600 bg-gray-100",
    label: "Finalizado",
  },
}

export function RDOVersionTimeline({ versoes }: { versoes: RDOVersao[] }) {
  if (versoes.length === 0)
    return (
      <p className="py-6 text-center text-sm text-text-muted">
        Nenhuma versão registrada.
      </p>
    )

  return (
    <div className="relative space-y-0 pl-2">
      {versoes.map((v, i) => {
        const cfg = ACAO_CONFIG[v.acao] ?? ACAO_CONFIG.edicao
        const Icon = cfg.icon
        const last = i === versoes.length - 1
        return (
          <div key={`${v.versao}-${i}`} className="flex gap-3 pb-5">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full",
                  cfg.color
                )}
              >
                <Icon className="size-4" />
              </span>
              {!last && <span className="my-1 w-px flex-1 bg-border" />}
            </div>
            <div className="pb-1">
              <p className="text-sm font-medium">
                {cfg.label}{" "}
                <span className="text-text-muted">· v{v.versao}</span>
              </p>
              <p className="text-xs text-text-secondary">
                {v.criado_por_nome ?? v.criado_por} ·{" "}
                {formatDateTime(v.criado_em)}
              </p>
              {v.justificativa && (
                <p className="mt-1 rounded-md bg-muted px-2 py-1 text-xs text-text-secondary">
                  {v.justificativa}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
