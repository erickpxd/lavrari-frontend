import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Plus,
  MapPin,
  FileDown,
  Loader2,
  Sparkles,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"
import { useObra, useObraDashboard, useObraAlertas } from "@/hooks/useObras"
import { useObraPerfil } from "@/hooks/useObraPerfil"
import { useRdos } from "@/hooks/useRdos"
import { useSaudeObra, usePadroesNC } from "@/hooks/useIA"
import { useMarcarLido } from "@/hooks/useAlertas"
import { useAuth } from "@/hooks/useAuth"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { HealthGauge } from "@/components/obra/HealthGauge"
import { UsuariosObraPanel } from "@/components/obra/UsuariosObraPanel"
import { LocationLabel } from "@/components/shared/LocationLabel"
import { EvolucaoVisual } from "@/components/obra/EvolucaoVisual"
import { WorkflowBadge } from "@/components/rdo/WorkflowBadge"
import { AlertaRow } from "@/components/shared/AlertaBadge"
import { RDOLoader, IALoader } from "@/components/ui/loaders"
import { Skeleton } from "@/components/ui/skeleton"
import { SEVERIDADE } from "@/lib/constants"
import { formatDate } from "@/lib/utils"
import { api } from "@/lib/api"
import type { StatusRDO } from "@/lib/types"

export function ObraDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { data: obra, isLoading } = useObra(id)
  const { podeVerSaude } = useObraPerfil(id)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40" />
      </div>
    )
  }
  if (!obra) return null

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/obras")}>
          <ArrowLeft className="size-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <Badge className="mb-1 border-primary/20 bg-primary-surface text-primary">
            {obra.tipologia}
          </Badge>
          <h1 className="font-heading text-2xl font-bold leading-tight">
            {obra.objeto_contratual}
          </h1>
          <p className="font-mono text-xs text-text-muted">
            {obra.numero_contrato}
          </p>
        </div>
        <Button onClick={() => navigate(`/obras/${id}/rdos/novo`)}>
          <Plus className="size-4" /> Novo RDO
        </Button>
      </div>

      <Tabs defaultValue="geral">
        <TabsList>
          <TabsTrigger value="geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="rdos">RDOs</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          {podeVerSaude && (
            <>
              <TabsTrigger value="evolucao">Evolução Visual</TabsTrigger>
              <TabsTrigger value="alertas">Alertas</TabsTrigger>
              <TabsTrigger value="nc">Padrões NC</TabsTrigger>
              <TabsTrigger value="dossie">Dossiê</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="geral">
          <VisaoGeral obraId={id!} obra={obra} podeVerSaude={podeVerSaude} />
        </TabsContent>
        <TabsContent value="rdos">
          <RdosTab obraId={id!} />
        </TabsContent>
        <TabsContent value="usuarios">
          <UsuariosObraPanel obraId={id!} isAdmin={isAdmin} />
        </TabsContent>
        {podeVerSaude && (
          <>
            <TabsContent value="evolucao">
              <EvolucaoVisual obra={obra} />
            </TabsContent>
            <TabsContent value="alertas">
              <AlertasTab obraId={id!} />
            </TabsContent>
            <TabsContent value="nc">
              <PadroesNCTab obraId={id!} />
            </TabsContent>
            <TabsContent value="dossie">
              <DossieTab obraId={id!} contrato={obra.numero_contrato} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}

function VisaoGeral({
  obraId,
  obra,
  podeVerSaude,
}: {
  obraId: string
  obra: import("@/lib/types").Obra
  podeVerSaude: boolean
}) {
  const { data: dashboard } = useObraDashboard(obraId, podeVerSaude)
  const { data: saude } = useSaudeObra(obraId, podeVerSaude)

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Dados da obra</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <Info label="Local" value={obra.local_descricao} />
          <Info label="Tipologia" value={obra.tipologia} />
          <Info label="Início execução" value={formatDate(obra.data_inicio_execucao)} />
          <Info label="Fim execução" value={formatDate(obra.data_fim_execucao)} />
          <Info label="Vigência" value={`${formatDate(obra.data_inicio_vigencia)} → ${formatDate(obra.data_fim_vigencia)}`} />
          <Info label="Prazo contratual" value={`${obra.prazo_contratual_dias} dias`} />
          {obra.latitude_obra != null && (
            <div className="sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-text-muted">
                Localização
              </p>
              <LocationLabel
                lat={obra.latitude_obra}
                lon={obra.longitude_obra}
                className="mt-0.5"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {podeVerSaude && (
        <Card>
          <CardHeader>
            <CardTitle>Saúde da obra</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {saude ? (
              <HealthGauge
                score={saude.score}
                classificacao={saude.classificacao}
                periodo={saude.periodo}
                rdos_analisados={saude.rdos_analisados}
              />
            ) : (
              <IALoader label="Calculando saúde…" />
            )}
            {dashboard && (
              <div className="grid w-full grid-cols-2 gap-2 text-center text-sm">
                <Metric value={dashboard.total_rdos} label="RDOs" />
                <Metric value={dashboard.total_alertas_abertos} label="Alertas" />
                <Metric value={dashboard.dias_decorridos} label="Dias decorridos" />
                <Metric
                  value={`${dashboard.percentual_prazo.toFixed(0)}%`}
                  label="Prazo"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Info({ label, value, icon }: { label: string; value: string; icon?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-text-muted">{label}</p>
      <p className="flex items-center gap-1 font-medium">
        {icon && <MapPin className="size-3.5 text-text-muted" />}
        {value}
      </p>
    </div>
  )
}

function Metric({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-lg bg-primary-surface p-2">
      <p className="font-heading text-lg font-bold text-primary">{value}</p>
      <p className="text-xs text-text-secondary">{label}</p>
    </div>
  )
}

function RdosTab({ obraId }: { obraId: string }) {
  const navigate = useNavigate()
  const [status, setStatus] = useState<StatusRDO | "">("")
  const { data: rdos, isLoading } = useRdos({
    id_obra: obraId,
    status: status || undefined,
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Select
          className="w-52"
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusRDO | "")}
        >
          <option value="">Todos os status</option>
          <option value="rascunho">Rascunho</option>
          <option value="revisao_externa">Revisão Externa</option>
          <option value="revisao_suape">Revisão SUAPE</option>
          <option value="aprovado">Aprovado</option>
          <option value="bloqueado">Bloqueado</option>
          <option value="finalizado">Finalizado</option>
        </Select>
      </div>
      {isLoading ? (
        <RDOLoader />
      ) : !rdos || rdos.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-text-muted">
            Nenhum RDO encontrado.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RDO</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rdos.map((rdo) => (
                <TableRow
                  key={rdo.id_rdo}
                  className="cursor-pointer"
                  onClick={() => navigate(`/obras/${obraId}/rdos/${rdo.id_rdo}`)}
                >
                  <TableCell className="font-medium">
                    RDO #{rdo.numero_registro}
                  </TableCell>
                  <TableCell>{formatDate(rdo.data_relatorio)}</TableCell>
                  <TableCell>
                    <WorkflowBadge status={rdo.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}

function AlertasTab({ obraId }: { obraId: string }) {
  const { data: alertas, isLoading } = useObraAlertas(obraId)
  const marcarLido = useMarcarLido()
  if (isLoading) return <IALoader />
  return (
    <div className="space-y-2">
      {!alertas || alertas.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-text-muted">
            Nenhum alerta para esta obra.
          </CardContent>
        </Card>
      ) : (
        alertas.map((a) => (
          <AlertaRow
            key={a.id_alerta}
            alerta={a}
            onMarcarLido={(id) => marcarLido.mutate(id)}
          />
        ))
      )}
    </div>
  )
}

function PadroesNCTab({ obraId }: { obraId: string }) {
  const { data, isLoading, isError } = usePadroesNC(obraId)
  if (isLoading) return <IALoader label="Detectando padrões…" />
  if (isError)
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-text-muted">
          Não foi possível carregar os padrões.
        </CardContent>
      </Card>
    )
  if (!data || data.padroes_detectados.length === 0)
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-text-muted">
          Nenhum padrão de não conformidade detectado.
        </CardContent>
      </Card>
    )
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {data.padroes_detectados.map((p, i) => {
        const sev = SEVERIDADE[p.severidade]
        return (
          <Card key={i}>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="flex items-center gap-1.5 font-heading font-semibold">
                  <AlertTriangle className="size-4 text-warning" />
                  {p.descricao}
                </p>
                <Badge className={sev.badge}>{sev.label}</Badge>
              </div>
              <p className="text-xs text-text-muted">
                {p.ocorrencias} ocorrência(s)
              </p>
              <div className="rounded-lg bg-primary-surface p-2.5 text-sm">
                <span className="font-medium text-primary">Recomendação: </span>
                {p.recomendacao}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function DossieTab({ obraId, contrato }: { obraId: string; contrato: string }) {
  const [loading, setLoading] = useState(false)
  async function gerar() {
    setLoading(true)
    try {
      await api.download(`/obras/${obraId}/dossie`, {
        method: "POST",
        body: {},
        filename: `dossie-${contrato.replace(/\//g, "-")}.pdf`,
      })
      toast.success("Dossiê gerado!")
    } catch {
      toast.error("Falha ao gerar dossiê")
    } finally {
      setLoading(false)
    }
  }
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <Sparkles className="size-10 text-accent" />
        <div>
          <p className="font-heading font-semibold">Dossiê consolidado</p>
          <p className="text-sm text-text-secondary">
            Gera um PDF com todos os dados da obra, consolidado por IA.
          </p>
        </div>
        <Button onClick={gerar} disabled={loading}>
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <FileDown className="size-4" />
          )}
          Gerar Dossiê PDF
        </Button>
      </CardContent>
    </Card>
  )
}
