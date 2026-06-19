import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import {
  Building2,
  FileText,
  FileWarning,
  PenLine,
  ShieldAlert,
  AlertTriangle,
  Bell,
  Check,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useAdminDashboard, useAlertas, useMarcarLido } from "@/hooks/useAlertas"
import { useObras } from "@/hooks/useObras"
import { useRdos } from "@/hooks/useRdos"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { SEVERIDADE, STATUS_RDO, TIPO_ALERTA } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Alerta, StatusRDO, AdminDashboard as AdminDashboardData } from "@/lib/types"

const STATUS_COLOR: Record<StatusRDO, string> = {
  rascunho: "#C9B8A8",
  revisao_externa: "#FFB76F",
  revisao_suape: "#D56644",
  aprovado: "#16A34A",
  bloqueado: "#DC2626",
  finalizado: "#8C4128",
}

export function Dashboard() {
  const { usuario, isAdmin } = useAuth()

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {isAdmin ? (
        <AdminDashboard nome={usuario?.nome} />
      ) : (
        <UserDashboard nome={usuario?.nome} />
      )}
    </div>
  )
}

function pad(value: number | string) {
  return typeof value === "number" && value < 10 ? `0${value}` : value
}

type Tone = "primary" | "accent" | "success" | "danger" | "neutral"

const TONES: Record<Tone, { tile: string; value: string }> = {
  primary: { tile: "bg-primary-surface text-primary", value: "text-primary" },
  accent: { tile: "bg-accent/15 text-accent-dark", value: "text-text-primary" },
  success: { tile: "bg-green-50 text-success", value: "text-text-primary" },
  danger: { tile: "bg-red-50 text-danger", value: "text-danger" },
  neutral: { tile: "bg-muted text-text-secondary", value: "text-text-primary" },
}

function MetricCard({
  icon: Icon,
  value,
  label,
  sub,
  tone = "neutral",
  onClick,
}: {
  icon: typeof Building2
  value: number | string
  label: string
  sub?: string
  tone?: Tone
  onClick?: () => void
}) {
  const t = TONES[tone]
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-border bg-surface p-5 text-left shadow-sm transition-all",
        onClick ? "hover:-translate-y-0.5 hover:shadow-md" : "cursor-default"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex size-12 items-center justify-center rounded-xl",
            t.tile
          )}
        >
          <Icon className="size-6" />
        </span>
        <span
          className={cn("font-heading text-3xl font-bold leading-none", t.value)}
        >
          {pad(value)}
        </span>
      </div>
      <p className="mt-4 text-sm font-semibold text-text-primary">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-text-secondary">{sub}</p>}
    </button>
  )
}

function Greeting({
  nome,
  action,
}: {
  nome?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-heading text-2xl font-bold">
          Olá, {nome?.split(" ")[0] ?? "bem-vindo"}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Confira o status das suas obras e relatórios hoje.
        </p>
      </div>
      {action}
    </div>
  )
}

function PendenciaRow({
  alerta,
  onMarcarLido,
}: {
  alerta: Alerta
  onMarcarLido: (id: string) => void
}) {
  const sev = SEVERIDADE[alerta.severidade]
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-surface p-3.5 transition-colors",
        alerta.lido && "opacity-60"
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full",
          sev.badge
        )}
      >
        <AlertTriangle className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text-primary">
          {alerta.titulo ?? TIPO_ALERTA[alerta.tipo]}
        </p>
        {(alerta.mensagem || alerta.descricao) && (
          <p className="truncate text-xs text-text-secondary">
            {alerta.mensagem ?? alerta.descricao}
          </p>
        )}
      </div>
      {alerta.lido ? (
        <Check className="size-5 shrink-0 text-success" />
      ) : (
        <button
          onClick={() => onMarcarLido(alerta.id_alerta)}
          className="shrink-0 text-xs font-medium text-primary hover:underline"
        >
          marcar lido
        </button>
      )}
    </div>
  )
}

function Pendencias({
  alertas,
  onMarcarLido,
}: {
  alertas?: Alerta[]
  onMarcarLido: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const abertos = (alertas ?? []).filter((a) => !a.lido)
  const lista = abertos.length > 0 ? abertos : (alertas ?? [])
  const LIMIT = 4
  const visiveis = expanded ? lista : lista.slice(0, LIMIT)
  const restantes = lista.length - LIMIT

  return (
    <section className="space-y-3">
      <h2 className="font-heading text-lg font-semibold">Pendências do dia</h2>
      {lista.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-6 text-sm text-text-secondary">
          <span className="flex size-10 items-center justify-center rounded-full bg-green-50 text-success">
            <Check className="size-5" />
          </span>
          Tudo em dia — nenhuma pendência no momento.
        </div>
      ) : (
        <>
          <div className="space-y-2.5">
            {visiveis.map((a) => (
              <PendenciaRow
                key={a.id_alerta}
                alerta={a}
                onMarcarLido={onMarcarLido}
              />
            ))}
          </div>
          {restantes > 0 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-surface py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary-surface/40"
            >
              {expanded ? (
                <>
                  Ver menos <ChevronUp className="size-4" />
                </>
              ) : (
                <>
                  Ver mais {restantes} <ChevronDown className="size-4" />
                </>
              )}
            </button>
          )}
        </>
      )}
    </section>
  )
}

function StatusChart({ porStatus }: { porStatus: Record<string, number> }) {
  const data = Object.entries(porStatus)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      status,
      count,
      label: STATUS_RDO[status as StatusRDO]?.label ?? status,
      fill: STATUS_COLOR[status as StatusRDO] ?? "#C9B8A8",
    }))
  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <h2 className="font-heading text-base font-semibold">RDOs por status</h2>
      {total === 0 ? (
        <p className="py-12 text-center text-sm text-text-muted">
          Nenhum RDO cadastrado ainda.
        </p>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-5">
          <div className="relative size-40">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="label"
                  innerRadius={52}
                  outerRadius={72}
                  paddingAngle={2}
                  stroke="none"
                >
                  {data.map((d) => (
                    <Cell key={d.status} fill={d.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-heading text-3xl font-bold leading-none">
                {total}
              </span>
              <span className="mt-1 text-[11px] text-text-muted">RDOs</span>
            </div>
          </div>
          <ul className="w-full space-y-2">
            {data.map((d) => (
              <li key={d.status} className="flex items-center gap-2 text-sm">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: d.fill }}
                />
                <span className="flex-1 truncate text-text-secondary">
                  {d.label}
                </span>
                <span className="font-semibold text-text-primary">
                  {d.count}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function DashboardBody({
  alertas,
  porStatus,
  onMarcarLido,
}: {
  alertas?: Alerta[]
  porStatus: Record<string, number>
  onMarcarLido: (id: string) => void
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Pendencias alertas={alertas} onMarcarLido={onMarcarLido} />
      </div>
      <StatusChart porStatus={porStatus} />
    </div>
  )
}

function UserDashboard({ nome }: { nome?: string }) {
  const navigate = useNavigate()
  const { data: obras, isLoading } = useObras()
  const { data: rdos } = useRdos()
  const { data: alertas } = useAlertas()
  const marcarLido = useMarcarLido()

  const rascunhos = (rdos ?? []).filter((r) => r.status === "rascunho")
  const naoLidos = (alertas ?? []).filter((a) => !a.lido).length
  const porStatus = (rdos ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <>
      <Greeting
        nome={nome}
        action={
          obras && obras.length > 0 ? (
            <Button
              onClick={() => navigate(`/obras/${obras[0].id_obra}/rdos/novo`)}
            >
              <Plus className="size-4" /> Novo RDO
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <MetricsSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard
            icon={Building2}
            value={obras?.length ?? 0}
            label="Minhas obras"
            sub="Canteiros sob sua supervisão"
            tone="primary"
            onClick={() => navigate("/obras")}
          />
          <MetricCard
            icon={FileText}
            value={rascunhos.length}
            label="RDOs em rascunho"
            sub="Aguardando envio"
            tone="accent"
          />
          <MetricCard
            icon={Bell}
            value={naoLidos}
            label="Alertas abertos"
            sub="Requerem sua atenção"
            tone={naoLidos > 0 ? "danger" : "neutral"}
          />
        </div>
      )}

      <DashboardBody
        alertas={alertas}
        porStatus={porStatus}
        onMarcarLido={(id) => marcarLido.mutate(id)}
      />
    </>
  )
}

function AdminDashboard({ nome }: { nome?: string }) {
  const navigate = useNavigate()
  const { data, isLoading } = useAdminDashboard()
  const { data: alertas } = useAlertas()
  const marcarLido = useMarcarLido()

  return (
    <>
      <Greeting
        nome={nome}
        action={
          <Button onClick={() => navigate("/obras/nova")}>
            <Plus className="size-4" /> Nova obra
          </Button>
        }
      />

      {isLoading || !data ? (
        <MetricsSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            icon={Building2}
            value={data.obras.cadastradas}
            label="Obras cadastradas"
            tone="primary"
            onClick={() => navigate("/obras")}
          />
          <MetricCard
            icon={FileWarning}
            value={data.rdos.pendentes_correcao}
            label="RDOs pend. correção"
            tone="accent"
          />
          <MetricCard
            icon={PenLine}
            value={data.assinaturas.aplicadas}
            label="Assinaturas aplicadas"
            tone="success"
          />
          <MetricCard
            icon={ShieldAlert}
            value={data.conformidade.nao_conformidades_abertas}
            label="NCs abertas"
            tone="danger"
          />
        </div>
      )}

      {data && <ResumoSistema data={data} />}

      <DashboardBody
        alertas={alertas}
        porStatus={data?.rdos.por_status ?? {}}
        onMarcarLido={(id) => marcarLido.mutate(id)}
      />
    </>
  )
}

function ResumoSistema({ data }: { data: AdminDashboardData }) {
  const stats = [
    { label: "OS cadastradas", value: data.obras.os_cadastradas },
    { label: "RDOs no total", value: data.rdos.cadastrados },
    { label: "Aprovados / finalizados", value: data.rdos.aprovados_finalizados },
    { label: "Bloqueados", value: data.rdos.bloqueados },
    { label: "Com fiscal externo", value: data.rdos.com_fiscal_externo },
    { label: "Com restrição", value: data.rdos.com_restricao },
    { label: "Evidências", value: data.evidencias.cadastradas },
    { label: "Reaberturas", value: data.auditoria.reaberturas },
  ]
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <h2 className="font-heading text-base font-semibold">Resumo do sistema</h2>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="font-heading text-2xl font-bold leading-none">
              {s.value}
            </p>
            <p className="mt-1 text-xs text-text-secondary">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function MetricsSkeleton({ count }: { count: number }) {
  return (
    <div
      className={cn(
        "grid gap-4",
        count === 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-2xl" />
      ))}
    </div>
  )
}
