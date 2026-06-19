import { useState } from "react"
import { UserPlus, Settings2, Trash2, Loader2, Clock } from "lucide-react"
import { toast } from "sonner"
import {
  useObraUsuarios,
  useVincularUsuario,
  useDesvincularUsuario,
  useUpdatePermissoes,
} from "@/hooks/useObras"
import { useUsuarios } from "@/hooks/useUsuarios"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Field } from "@/components/ui/field"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { RDOLoader } from "@/components/ui/loaders"
import { PERFIL_USUARIO } from "@/lib/constants"
import { formatDate } from "@/lib/utils"
import { ApiError } from "@/lib/api"
import type {
  ObraUsuarioVinculo,
  PerfilUsuario,
  PermissoesExtras,
} from "@/lib/types"

const PERMISSOES: { key: keyof PermissoesExtras; label: string; desc: string }[] =
  [
    {
      key: "pode_adicionar_info",
      label: "Adicionar informações",
      desc: "Editar e complementar RDOs da obra",
    },
    {
      key: "pode_comentar",
      label: "Comentar",
      desc: "Adicionar pareceres e comentários",
    },
    {
      key: "pode_enviar_suape",
      label: "Enviar para SUAPE",
      desc: "Encaminhar RDOs para revisão SUAPE",
    },
  ]

const PERFIS: PerfilUsuario[] = [
  "fiscal_suape",
  "fiscal_externo",
  "fornecedor",
  "consulta",
]

export function UsuariosObraPanel({
  obraId,
  isAdmin,
}: {
  obraId: string
  isAdmin: boolean
}) {
  const { data: vinculos, isLoading } = useObraUsuarios(obraId)
  const { data: usuarios } = useUsuarios(isAdmin)
  const desvincular = useDesvincularUsuario(obraId)
  const [vincularOpen, setVincularOpen] = useState(false)
  const [editar, setEditar] = useState<ObraUsuarioVinculo | null>(null)

  if (isLoading) return <RDOLoader label="Carregando usuários…" />

  const nomePorId = new Map(
    (usuarios ?? []).map((u) => [u.id_usuario, u] as const)
  )

  function nomeDe(v: ObraUsuarioVinculo) {
    return v.nome ?? nomePorId.get(v.id_usuario)?.nome ?? v.id_usuario
  }
  function emailDe(v: ObraUsuarioVinculo) {
    return v.email ?? nomePorId.get(v.id_usuario)?.email
  }

  const vinculados = new Set((vinculos ?? []).map((v) => v.id_usuario))
  const disponiveis = (usuarios ?? []).filter((u) => !vinculados.has(u.id_usuario))

  return (
    <div className="space-y-3">
      {isAdmin && (
        <div className="flex justify-end">
          <Button onClick={() => setVincularOpen(true)}>
            <UserPlus className="size-4" /> Vincular usuário
          </Button>
        </div>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Permissões extras</TableHead>
              {isAdmin && <TableHead className="w-28 text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {!vinculos || vinculos.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 4 : 3}
                  className="py-6 text-center text-text-muted"
                >
                  Nenhum usuário vinculado.
                </TableCell>
              </TableRow>
            ) : (
              vinculos.map((v) => (
                <TableRow key={v.id_usuario}>
                  <TableCell className="font-medium">
                    {nomeDe(v)}
                    {emailDe(v) && (
                      <span className="block text-xs font-normal text-text-muted">
                        {emailDe(v)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className="border-primary/20 bg-primary-surface text-primary">
                      {PERFIL_USUARIO[v.perfil]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <PermissoesCell permissoes={v.permissoes_extras} />
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Gerenciar permissões"
                          onClick={() => setEditar(v)}
                        >
                          <Settings2 className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Desvincular"
                          disabled={desvincular.isPending}
                          onClick={() => {
                            if (confirm(`Desvincular ${nomeDe(v)} desta obra?`)) {
                              desvincular.mutate(v.id_usuario, {
                                onSuccess: () => toast.success("Usuário desvinculado"),
                                onError: () => toast.error("Falha ao desvincular"),
                              })
                            }
                          }}
                        >
                          <Trash2 className="size-4 text-danger" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {isAdmin && (
        <VincularDialog
          obraId={obraId}
          open={vincularOpen}
          onClose={() => setVincularOpen(false)}
          disponiveis={disponiveis}
        />
      )}
      {isAdmin && editar && (
        <PermissoesDialog
          obraId={obraId}
          vinculo={editar}
          nome={nomeDe(editar)}
          onClose={() => setEditar(null)}
        />
      )}
    </div>
  )
}

function PermissoesCell({
  permissoes,
}: {
  permissoes?: PermissoesExtras | null
}) {
  if (!permissoes) return <span className="text-xs text-text-muted">—</span>
  const ativos = PERMISSOES.filter((p) => permissoes[p.key] === true)
  const expirada =
    permissoes.expira_em != null &&
    new Date(permissoes.expira_em).getTime() < Date.now()

  if (ativos.length === 0)
    return <span className="text-xs text-text-muted">—</span>

  return (
    <div className="flex flex-wrap items-center gap-1">
      {ativos.map((p) => (
        <Badge
          key={p.key}
          className="border-accent/30 bg-accent/10 text-[11px] text-amber-700"
        >
          {p.label}
        </Badge>
      ))}
      {permissoes.expira_em && (
        <span
          className={`inline-flex items-center gap-1 text-[11px] ${
            expirada ? "text-danger" : "text-text-muted"
          }`}
        >
          <Clock className="size-3" />
          {expirada ? "Expirou" : "até"} {formatDate(permissoes.expira_em)}
        </span>
      )}
    </div>
  )
}

function VincularDialog({
  obraId,
  open,
  onClose,
  disponiveis,
}: {
  obraId: string
  open: boolean
  onClose: () => void
  disponiveis: { id_usuario: string; nome: string; email: string }[]
}) {
  const vincular = useVincularUsuario(obraId)
  const [uid, setUid] = useState("")
  const [perfil, setPerfil] = useState<PerfilUsuario>("fornecedor")

  async function submit() {
    if (!uid) {
      toast.error("Selecione um usuário")
      return
    }
    try {
      await vincular.mutateAsync({ id_usuario: uid, perfil })
      toast.success("Usuário vinculado!")
      setUid("")
      setPerfil("fornecedor")
      onClose()
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Falha ao vincular")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Vincular usuário à obra</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Usuário" required>
            <Select value={uid} onChange={(e) => setUid(e.target.value)}>
              <option value="">Selecione…</option>
              {disponiveis.map((u) => (
                <option key={u.id_usuario} value={u.id_usuario}>
                  {u.nome} — {u.email}
                </option>
              ))}
            </Select>
            {disponiveis.length === 0 && (
              <p className="mt-1 text-xs text-text-muted">
                Todos os usuários já estão vinculados.
              </p>
            )}
          </Field>
          <Field label="Perfil na obra" required>
            <Select
              value={perfil}
              onChange={(e) => setPerfil(e.target.value as PerfilUsuario)}
            >
              {PERFIS.map((p) => (
                <option key={p} value={p}>
                  {PERFIL_USUARIO[p]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={vincular.isPending}>
            {vincular.isPending && <Loader2 className="size-4 animate-spin" />}
            Vincular
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PermissoesDialog({
  obraId,
  vinculo,
  nome,
  onClose,
}: {
  obraId: string
  vinculo: ObraUsuarioVinculo
  nome: string
  onClose: () => void
}) {
  const update = useUpdatePermissoes(obraId)
  const atual = vinculo.permissoes_extras ?? {}
  const [flags, setFlags] = useState<Record<string, boolean>>({
    pode_adicionar_info: atual.pode_adicionar_info ?? false,
    pode_comentar: atual.pode_comentar ?? false,
    pode_enviar_suape: atual.pode_enviar_suape ?? false,
  })
  const [expira, setExpira] = useState(
    atual.expira_em ? atual.expira_em.slice(0, 10) : ""
  )

  async function submit() {
    try {
      await update.mutateAsync({
        uid: vinculo.id_usuario,
        data: {
          pode_adicionar_info: flags.pode_adicionar_info,
          pode_comentar: flags.pode_comentar,
          pode_enviar_suape: flags.pode_enviar_suape,
          expira_em: expira ? new Date(expira).toISOString() : null,
        },
      })
      toast.success("Permissões atualizadas!")
      onClose()
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Falha ao salvar")
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Permissões extras — {nome}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {PERMISSOES.map((p) => (
            <label
              key={p.key}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border p-3"
            >
              <div>
                <p className="text-sm font-medium">{p.label}</p>
                <p className="text-xs text-text-muted">{p.desc}</p>
              </div>
              <Switch
                checked={flags[p.key as string]}
                onCheckedChange={(c) =>
                  setFlags((f) => ({ ...f, [p.key as string]: c }))
                }
              />
            </label>
          ))}
          <Field label="Expira em (opcional — acesso temporário)">
            <Input
              type="date"
              value={expira}
              onChange={(e) => setExpira(e.target.value)}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={update.isPending}>
            {update.isPending && <Loader2 className="size-4 animate-spin" />}
            Salvar permissões
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
