import { useState } from "react"
import {
  Send,
  CheckCircle,
  XCircle,
  RotateCcw,
  Archive,
  FileDown,
  PenLine,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { useRdoWorkflow } from "@/hooks/useRdos"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import type { RDOResponse, PerfilUsuario } from "@/lib/types"

interface WorkflowActionsProps {
  rdo: RDOResponse
  isAdmin: boolean
  perfil: PerfilUsuario | null
  onAssinar: () => void
}

export function WorkflowActions({
  rdo,
  isAdmin,
  perfil,
  onAssinar,
}: WorkflowActionsProps) {
  const workflow = useRdoWorkflow(rdo.id_rdo)
  const [reasonModal, setReasonModal] = useState<{
    action: "reprovar-externo" | "reprovar-suape" | "reabrir"
    title: string
    field: "motivo" | "justificativa"
  } | null>(null)
  const [reason, setReason] = useState("")
  const [downloading, setDownloading] = useState(false)

  const status = rdo.status
  const isFiscalExterno = perfil === "fiscal_externo"
  const isFiscalSuape = perfil === "fiscal_suape"
  const isFornecedor = perfil === "fornecedor"

  async function run(action: string, body?: unknown, msg?: string) {
    try {
      await workflow.mutateAsync({ action: action as never, body })
      toast.success(msg ?? "Ação realizada!")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha na ação")
    }
  }

  async function confirmReason() {
    if (reason.trim().length < 3) {
      toast.error("Mínimo de 3 caracteres")
      return
    }
    const m = reasonModal!
    const body =
      m.field === "motivo"
        ? { motivo: reason.trim() }
        : { justificativa: reason.trim() }
    await run(m.action, body, "Ação registrada")
    setReasonModal(null)
    setReason("")
  }

  async function baixarPdf() {
    setDownloading(true)
    try {
      await api.download(`/rdos/${rdo.id_rdo}/pdf`, {
        filename: `rdo-${rdo.numero_registro}.pdf`,
      })
    } catch {
      toast.error("Falha ao baixar PDF")
    } finally {
      setDownloading(false)
    }
  }

  const buttons: React.ReactNode[] = []

  if (status === "rascunho" && (isFornecedor || isAdmin)) {
    buttons.push(
      <Button
        key="submeter"
        onClick={() => run("submeter", undefined, "Enviado para revisão")}
        disabled={workflow.isPending}
      >
        <Send className="size-4" /> Enviar para Revisão
      </Button>
    )
  }

  if (status === "revisao_externa" && (isFiscalExterno || isAdmin)) {
    buttons.push(
      <Button
        key="aprovar-ext"
        variant="success"
        onClick={() => run("aprovar-externo", undefined, "Aprovado")}
        disabled={workflow.isPending}
      >
        <CheckCircle className="size-4" /> Aprovar
      </Button>,
      <Button
        key="reprovar-ext"
        variant="destructive"
        onClick={() =>
          setReasonModal({
            action: "reprovar-externo",
            title: "Reprovar (fiscal externo)",
            field: "motivo",
          })
        }
      >
        <XCircle className="size-4" /> Reprovar
      </Button>
    )
  }

  if (status === "revisao_suape" && (isFiscalSuape || isAdmin)) {
    buttons.push(
      <Button
        key="aprovar-suape"
        variant="success"
        onClick={() => run("aprovar-suape", undefined, "Aprovado SUAPE")}
        disabled={workflow.isPending}
      >
        <CheckCircle className="size-4" /> Aprovar SUAPE
      </Button>,
      <Button
        key="reprovar-suape"
        variant="destructive"
        onClick={() =>
          setReasonModal({
            action: "reprovar-suape",
            title: "Reprovar (SUAPE)",
            field: "motivo",
          })
        }
      >
        <XCircle className="size-4" /> Reprovar
      </Button>
    )
  }

  if (status === "bloqueado" || status === "finalizado") {
    buttons.push(
      <Button key="pdf" variant="outline" onClick={baixarPdf} disabled={downloading}>
        {downloading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileDown className="size-4" />
        )}
        Baixar PDF
      </Button>,
      <Button key="assinar" variant="accent" onClick={onAssinar}>
        <PenLine className="size-4" /> Assinar
      </Button>
    )
    if (isAdmin || isFiscalSuape) {
      buttons.push(
        <Button
          key="reabrir"
          variant="outline"
          onClick={() =>
            setReasonModal({
              action: "reabrir",
              title: "Reabrir RDO",
              field: "justificativa",
            })
          }
        >
          <RotateCcw className="size-4" /> Reabrir
        </Button>
      )
    }
  }

  if (status === "aprovado" && isAdmin) {
    buttons.push(
      <Button
        key="finalizar"
        onClick={() => run("finalizar", undefined, "RDO finalizado")}
        disabled={workflow.isPending}
      >
        <Archive className="size-4" /> Finalizar
      </Button>
    )
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">{buttons}</div>

      <Dialog
        open={!!reasonModal}
        onOpenChange={(o) => {
          if (!o) {
            setReasonModal(null)
            setReason("")
          }
        }}
      >
        <DialogContent onClose={() => setReasonModal(null)}>
          <DialogHeader>
            <DialogTitle>{reasonModal?.title}</DialogTitle>
            <DialogDescription>
              Informe o{" "}
              {reasonModal?.field === "motivo" ? "motivo" : "a justificativa"}{" "}
              (mínimo 3 caracteres).
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Descreva…"
            rows={4}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReasonModal(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReason}
              disabled={workflow.isPending}
            >
              {workflow.isPending && <Loader2 className="size-4 animate-spin" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
