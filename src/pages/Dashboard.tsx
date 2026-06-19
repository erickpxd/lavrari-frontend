import { useNavigate } from "react-router-dom"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts"
import {
  Building2,
  FileWarning,
  PenLine,
  ShieldAlert,
  Plus,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useAdminDashboard, useAlertas, useMarcarLido } from "@/hooks/useAlertas"
import { useObras } from "@/hooks/useObras"
import { useRdos } from "@/hooks/useRdos"
import { ObraCardSmart } from "@/components/obra/ObraCardSmart"
import { AlertaRow } from "@/components/shared/AlertaBadge"
import { WorkflowBadge } from "@/components/rdo/WorkflowBadge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ObraLoader } from "@/components/ui/loaders"
import { STATUS_RDO } from "@/lib/constants"
import { formatDate } from "@/lib/utils"
import type { StatusRDO } from "@/lib/types"

export function Dashboard() {
  const { usuario, isAdmin } = useAuth()

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">
          Olá, {usuario?.nome?.split(" ")[0]} 👷
        </h1>
        <p className="text-sm text-text-secondary">
          {isAdmin
            ? "Painel de controle do sistema"
            : "Suas obras e atividades"}
        </p>
      </div>

      {isAdmin ? <AdminDashboard /> : <UserDashboard />}
    </div>
  )
}

function MetricCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: typeof Building2
  value: number | string
  label: string
  color: string
}) {
  return (
    <Card className="border-l-4" style={{ borderLeftColor: color }}>
      <CardContent className="flex items-center gap-3 p-4">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}1a`, color }}
        >
          <Icon className="size-5" />
        </span>
        <div>
          <p className="font-heading text-2xl font-bold leading-none">{value}</p>
          <p className="mt-1 text-xs text-text-secondary">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function AdminDashboard() {
  const { data, isLoading } = useAdminDashboard()
  const { data: alertas } = useAlertas()
  const marcarLido = useMarcarLido()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    )
  }

  if (!data) return null

  const statusData = Object.entries(data.rdos.por_status ?? {}).map(
    ([status, count]) => ({
      status,
      label: STATUS_RDO[status as StatusRDO]?.label ?? status,
      count,
      fill: colorForStatus(status as StatusRDO),
    })
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          icon={Building2}
          value={data.obras.cadastradas}
          label="Obras cadastradas"
          color="#003366"
        />
        <MetricCard
          icon={FileWarning}
          value={data.rdos.pendentes_correcao}
          label="RDOs pend. correção"
          color="#D97706"
        />
        <MetricCard
          icon={PenLine}
          value={data.assinaturas.aplicadas}
          label="Assinaturas aplicadas"
          color="#16A34A"
        />
        <MetricCard
          icon={ShieldAlert}
          value={data.conformidade.nao_conformidades_abertas}
          label="NCs abertas"
          color="#DC2626"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>RDOs por status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <p className="py-8 text-center text-sm text-text-muted">
                Nenhum RDO cadastrado ainda.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={statusData}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    cursor={{ fill: "#f1f5f9" }}
                    formatter={(value) => [value as number, "RDOs"]}
                    labelFormatter={(label) => String(label)}
                  />
                  <Bar dataKey="count" name="RDOs" radius={[6, 6, 0, 0]}>
                    {statusData.map((d) => (
                      <Cell key={d.status} fill={d.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!alertas || alertas.length === 0 ? (
              <p className="py-6 text-center text-sm text-text-muted">
                Nenhum alerta.
              </p>
            ) : (
              alertas
                .slice(0, 6)
                .map((a) => (
                  <AlertaRow
                    key={a.id_alerta}
                    alerta={a}
                    onMarcarLido={(id) => marcarLido.mutate(id)}
                  />
                ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function UserDashboard() {
  const navigate = useNavigate()
  const { data: obras, isLoading } = useObras()
  const { data: rascunhos } = useRdos({ status: "rascunho" })
  const { data: alertas } = useAlertas()
  const marcarLido = useMarcarLido()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold">Minhas obras</h2>
        {obras && obras.length > 0 && (
          <Button
            variant="accent"
            onClick={() => navigate(`/obras/${obras[0].id_obra}/rdos/novo`)}
          >
            <Plus className="size-4" /> Novo RDO
          </Button>
        )}
      </div>

      {isLoading ? (
        <ObraLoader />
      ) : !obras || obras.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-text-muted">
            Você ainda não está vinculado a nenhuma obra.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {obras.map((obra) => (
            <ObraCardSmart key={obra.id_obra} obra={obra} />
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>RDOs em rascunho</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!rascunhos || rascunhos.length === 0 ? (
              <p className="py-6 text-center text-sm text-text-muted">
                Nenhum RDO pendente.
              </p>
            ) : (
              rascunhos.slice(0, 6).map((rdo) => (
                <button
                  key={rdo.id_rdo}
                  onClick={() =>
                    navigate(`/obras/${rdo.id_obra}/rdos/${rdo.id_rdo}`)
                  }
                  className="flex w-full items-center justify-between rounded-lg border border-border p-3 text-left hover:bg-primary-surface/40"
                >
                  <div>
                    <p className="text-sm font-medium">RDO #{rdo.numero_registro}</p>
                    <p className="text-xs text-text-muted">
                      {formatDate(rdo.data_relatorio)}
                    </p>
                  </div>
                  <WorkflowBadge status={rdo.status} />
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!alertas || alertas.length === 0 ? (
              <p className="py-6 text-center text-sm text-text-muted">
                Nenhum alerta.
              </p>
            ) : (
              alertas
                .slice(0, 6)
                .map((a) => (
                  <AlertaRow
                    key={a.id_alerta}
                    alerta={a}
                    onMarcarLido={(id) => marcarLido.mutate(id)}
                  />
                ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function colorForStatus(status: StatusRDO): string {
  const map: Record<StatusRDO, string> = {
    rascunho: "#94A3B8",
    revisao_externa: "#3B82F6",
    revisao_suape: "#8B5CF6",
    aprovado: "#22C55E",
    bloqueado: "#F97316",
    finalizado: "#059669",
  }
  return map[status] ?? "#94A3B8"
}
