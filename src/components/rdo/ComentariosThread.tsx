import { useState } from "react"
import { Send, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRdoComentarios, useCreateComentario } from "@/hooks/useRdos"
import { useUsuarios } from "@/hooks/useUsuarios"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TIPO_COMENTARIO } from "@/lib/constants"
import { formatDateTime, getInitials, cn } from "@/lib/utils"
import type { TipoComentario } from "@/lib/types"

export function ComentariosThread({
  rdoId,
  podeComentar,
}: {
  rdoId: string
  podeComentar: boolean
}) {
  const { usuario, isAdmin } = useAuth()
  const { data: comentarios } = useRdoComentarios(rdoId)
  // Best-effort: lista de usuários só funciona para admin; ignora erro.
  const { data: usuarios } = useUsuarios()
  const create = useCreateComentario(rdoId)
  const [conteudo, setConteudo] = useState("")
  const [tipo, setTipo] = useState<TipoComentario>("comentario")

  const nomePorId = new Map(
    (usuarios ?? []).map((u) => [u.id_usuario, u.nome])
  )

  async function enviar() {
    if (conteudo.trim().length < 1) return
    try {
      await create.mutateAsync({ conteudo: conteudo.trim(), tipo })
      setConteudo("")
      toast.success("Comentário adicionado")
    } catch {
      toast.error("Falha ao comentar")
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {!comentarios || comentarios.length === 0 ? (
          <p className="py-4 text-center text-sm text-text-muted">
            Nenhum comentário ainda.
          </p>
        ) : (
          comentarios.map((c) => {
            const nome =
              nomePorId.get(c.id_usuario) ??
              (c.id_usuario === usuario?.id_usuario ? usuario?.nome : null) ??
              "Usuário"
            const cfg = TIPO_COMENTARIO[c.tipo]
            const mine = c.id_usuario === usuario?.id_usuario
            return (
              <div key={c.id_comentario} className="flex gap-3">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    mine
                      ? "bg-primary text-white"
                      : "bg-primary-surface text-primary"
                  )}
                >
                  {getInitials(nome)}
                </span>
                <div className="min-w-0 flex-1 rounded-lg border border-border bg-surface p-3">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{nome}</span>
                    <Badge className={cn("border-transparent", cfg.badge)}>
                      {cfg.label}
                    </Badge>
                    <span className="text-xs text-text-muted">
                      {formatDateTime(c.criado_em)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{c.conteudo}</p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {podeComentar && (
        <div className="space-y-2 rounded-lg border border-border p-3">
          <Textarea
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            placeholder="Escreva um comentário…"
            rows={2}
          />
          <div className="flex items-center gap-2">
            <Select
              className="w-52"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoComentario)}
            >
              <option value="comentario">Comentário</option>
              <option value="parecer">Parecer</option>
              <option value="solicitacao_correcao">Solicitação de correção</option>
              {isAdmin && <option value="ai_sugestao">Sugestão IA</option>}
            </Select>
            <Button
              onClick={enviar}
              disabled={create.isPending || !conteudo.trim()}
              className="ml-auto"
            >
              {create.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Enviar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
