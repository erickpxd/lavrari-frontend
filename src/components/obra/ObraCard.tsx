import { useNavigate } from "react-router-dom"
import { MapPin, User, ArrowRight, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Obra } from "@/lib/types"

const COVER_FALLBACK = "/assets/images/imagem-capa.png"

interface ObraCardProps {
  obra: Obra
  percentualPrazo?: number
  fiscalNome?: string
  empresaNome?: string
  logoUrl?: string | null
  view?: "card" | "list"
}

function pad(n: number) {
  return String(n).padStart(2, "0")
}

function dateRange(inicio?: string | null, fim?: string | null): string {
  const a = inicio ? new Date(inicio) : null
  const b = fim ? new Date(fim) : null
  const dm = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`
  if (a && !isNaN(a.getTime()) && b && !isNaN(b.getTime()))
    return `${dm(a)} - ${dm(b)} ${b.getFullYear()}`
  return "—"
}

function obraStatus(obra: Obra): { label: string; dot: string } {
  const now = Date.now()
  const ini = new Date(obra.data_inicio_execucao).getTime()
  const fim = new Date(obra.data_fim_execucao).getTime()
  if (!isNaN(ini) && now < ini) return { label: "Planejada", dot: "bg-info" }
  if (!isNaN(fim) && now > fim)
    return { label: "Concluída", dot: "bg-text-muted" }
  return { label: "Ativo", dot: "bg-success" }
}

function computePct(obra: Obra, override?: number): number {
  if (override !== undefined) return Math.min(100, Math.max(0, override))
  const ini = new Date(obra.data_inicio_execucao).getTime()
  const fim = new Date(obra.data_fim_execucao).getTime()
  if (isNaN(ini) || isNaN(fim) || fim <= ini) return 0
  return Math.min(100, Math.max(0, ((Date.now() - ini) / (fim - ini)) * 100))
}

function StatusBadge({ obra }: { obra: Obra }) {
  const status = obraStatus(obra)
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
      <span className={cn("size-2 rounded-full", status.dot)} />
      {status.label}
    </span>
  )
}

export function ObraCard({
  obra,
  percentualPrazo,
  fiscalNome,
  empresaNome,
  logoUrl,
  view = "card",
}: ObraCardProps) {
  const navigate = useNavigate()
  const pct = computePct(obra, percentualPrazo)
  const subtitle = fiscalNome ?? empresaNome
  const logo = logoUrl ?? obra.logo_contratada_url
  const open = () => navigate(`/obras/${obra.id_obra}`)

  if (view === "list") {
    return (
      <div
        onClick={open}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && open()}
        className="group flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-surface p-3 transition-all duration-150 hover:shadow-md"
      >
        <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-white">
          {logo ? (
            <img
              src={logo}
              alt={empresaNome ?? ""}
              className="max-h-full max-w-full object-contain p-2"
            />
          ) : (
            <img
              src={COVER_FALLBACK}
              alt=""
              className="size-full object-cover"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-heading text-sm font-semibold">
              {obra.objeto_contratual}
            </h3>
            <span className="hidden sm:block">
              <StatusBadgePlain obra={obra} />
            </span>
          </div>
          <p className="flex items-center gap-1 truncate text-xs text-text-secondary">
            <MapPin className="size-3 shrink-0" />
            {obra.local_descricao}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-9 shrink-0 text-right text-[11px] font-medium text-text-secondary">
              {pct.toFixed(0)}%
            </span>
          </div>
        </div>
        <ChevronRight className="size-5 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
      </div>
    )
  }

  return (
    <div
      onClick={open}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && open()}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative h-36 w-full overflow-hidden">
        {logo ? (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary-surface to-secondary/25 p-4">
            <div className="flex h-24 w-32 items-center justify-center rounded-2xl bg-white p-3 shadow-sm">
              <img
                src={logo}
                alt={empresaNome ?? ""}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        ) : (
          <img
            src={COVER_FALLBACK}
            alt=""
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        )}
        <div className="absolute right-3 top-3">
          <StatusBadge obra={obra} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-heading text-base font-semibold leading-snug">
          {obra.objeto_contratual}
        </h3>
        {subtitle && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-text-secondary">
            <User className="size-4 shrink-0 text-text-muted" />
            {subtitle}
          </p>
        )}
        <p className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
          <MapPin className="size-4 shrink-0 text-text-muted" />
          {obra.local_descricao}
        </p>

        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-xs">
            <span className="text-text-muted">
              {dateRange(obra.data_inicio_execucao, obra.data_fim_execucao)}
            </span>
            <span className="font-semibold text-text-secondary">
              {pct.toFixed(0)}%
            </span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            open()
          }}
          className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 font-medium text-accent-foreground shadow-sm transition-colors hover:bg-accent-dark"
        >
          Abrir obra
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  )
}

function StatusBadgePlain({ obra }: { obra: Obra }) {
  const status = obraStatus(obra)
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-text-secondary">
      <span className={cn("size-1.5 rounded-full", status.dot)} />
      {status.label}
    </span>
  )
}
