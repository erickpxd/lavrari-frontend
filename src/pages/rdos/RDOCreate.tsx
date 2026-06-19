import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useCreateRdo } from "@/hooks/useRdos"
import { useObra } from "@/hooks/useObras"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toISODate } from "@/lib/utils"
import { ApiError } from "@/lib/api"

export function RDOCreate() {
  const { id: obraId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: obra } = useObra(obraId)
  const createRdo = useCreateRdo()
  const [data, setData] = useState(toISODate(new Date()))

  async function criar() {
    if (!obraId) return
    try {
      const rdo = await createRdo.mutateAsync({
        id_obra: obraId,
        data_relatorio: data,
      })
      toast.success("RDO criado em rascunho!")
      navigate(`/obras/${obraId}/rdos/${rdo.id_rdo}`)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Falha ao criar RDO")
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/obras/${obraId}`)}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold">Novo RDO</h1>
          {obra && (
            <p className="text-sm text-text-secondary">{obra.objeto_contratual}</p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5 text-primary" /> Criar relatório
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Data do relatório" required>
            <Input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </Field>
          <p className="text-sm text-text-muted">
            O RDO será criado em <strong>rascunho</strong>. Você poderá preencher
            clima, pessoal, equipamentos, serviços, fotos e mais na próxima tela —
            inclusive por voz e com sugestões da IA.
          </p>
          <Button
            size="field"
            className="w-full"
            onClick={criar}
            disabled={createRdo.isPending}
          >
            {createRdo.isPending && <Loader2 className="size-4 animate-spin" />}
            Criar e preencher
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
