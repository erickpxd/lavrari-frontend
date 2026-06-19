import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Calendar, ImageIcon, History, PenLine, MessageSquare } from "lucide-react"
import { useRdo, useRdoVersoes, useRdoAssinaturas } from "@/hooks/useRdos"
import { useObra } from "@/hooks/useObras"
import { useObraPerfil } from "@/hooks/useObraPerfil"
import { useAuth } from "@/hooks/useAuth"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { WorkflowBadge, WorkflowPipeline } from "@/components/rdo/WorkflowBadge"
import { WorkflowActions } from "@/components/rdo/WorkflowActions"
import { RDOForm } from "@/components/rdo/RDOForm"
import { FotoUploader } from "@/components/rdo/FotoUploader"
import { ComentariosThread } from "@/components/rdo/ComentariosThread"
import { RDOVersionTimeline } from "@/components/rdo/RDOVersionTimeline"
import {
  AssinaturaModal,
  AssinaturaCard,
} from "@/components/rdo/AssinaturaModal"
import { RDOReadView } from "@/components/rdo/RDOReadView"
import { formatDate } from "@/lib/utils"

export function RDODetail() {
  const { id: obraId, idRdo } = useParams<{ id: string; idRdo: string }>()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { data: rdo, isLoading } = useRdo(idRdo)
  const { data: obra } = useObra(obraId)
  const { perfil, podeAdicionarInfo, podeComentarExtra } = useObraPerfil(obraId)
  const [assinarOpen, setAssinarOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-16" />
        <Skeleton className="h-64" />
      </div>
    )
  }
  if (!rdo) return null

  const isRascunho = rdo.status === "rascunho"
  const podeEditar =
    isRascunho &&
    (isAdmin ||
      perfil === "fornecedor" ||
      (perfil === "fiscal_externo" && podeAdicionarInfo))

  const podeComentar =
    isAdmin ||
    perfil === "fornecedor" ||
    perfil === "fiscal_suape" ||
    (perfil === "fiscal_externo" && podeComentarExtra)

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/obras/${obraId}`)}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl font-bold">
              RDO #{rdo.numero_registro}
            </h1>
            <WorkflowBadge status={rdo.status} />
          </div>
          <p className="flex items-center gap-1 text-sm text-text-secondary">
            <Calendar className="size-3.5" />
            {formatDate(rdo.data_relatorio)}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <WorkflowPipeline status={rdo.status} />
          <WorkflowActions
            rdo={rdo}
            isAdmin={isAdmin}
            perfil={perfil}
            onAssinar={() => setAssinarOpen(true)}
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="dados">
        <TabsList>
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="fotos">
            <ImageIcon className="mr-1 size-4" /> Fotos
          </TabsTrigger>
          <TabsTrigger value="comentarios">
            <MessageSquare className="mr-1 size-4" /> Comentários
          </TabsTrigger>
          <TabsTrigger value="versoes">
            <History className="mr-1 size-4" /> Versões
          </TabsTrigger>
          <TabsTrigger value="assinaturas">
            <PenLine className="mr-1 size-4" /> Assinaturas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dados">
          {podeEditar ? <RDOForm rdo={rdo} /> : <RDOReadView rdo={rdo} />}
        </TabsContent>
        <TabsContent value="fotos">
          <Card>
            <CardHeader>
              <CardTitle>Fotos do RDO</CardTitle>
            </CardHeader>
            <CardContent>
              <FotoUploader
                rdoId={rdo.id_rdo}
                editable={podeEditar}
                obraLat={obra?.latitude_obra}
                obraLon={obra?.longitude_obra}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="comentarios">
          <Card>
            <CardContent className="pt-5">
              <ComentariosThread
                rdoId={rdo.id_rdo}
                podeComentar={podeComentar}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="versoes">
          <Card>
            <CardContent className="pt-5">
              <VersoesTab rdoId={rdo.id_rdo} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="assinaturas">
          <AssinaturasTab rdoId={rdo.id_rdo} />
        </TabsContent>
      </Tabs>

      <AssinaturaModal
        rdoId={rdo.id_rdo}
        open={assinarOpen}
        onOpenChange={setAssinarOpen}
      />
    </div>
  )
}

function VersoesTab({ rdoId }: { rdoId: string }) {
  const { data: versoes } = useRdoVersoes(rdoId)
  return <RDOVersionTimeline versoes={versoes ?? []} />
}

function AssinaturasTab({ rdoId }: { rdoId: string }) {
  const { data: assinaturas } = useRdoAssinaturas(rdoId)
  if (!assinaturas || assinaturas.length === 0)
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-text-muted">
          Nenhuma assinatura aplicada. Assine RDOs em status Bloqueado ou
          Finalizado.
        </CardContent>
      </Card>
    )
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {assinaturas.map((a) => (
        <AssinaturaCard key={a.id_assinatura} assinatura={a} />
      ))}
    </div>
  )
}
