import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Plus, ShieldCheck, Loader2, UserCog, Briefcase, Trash2 } from "lucide-react"
import {
  useUsuarios,
  useCreateUsuario,
  usePromoverAdmin,
  useMeusVinculos,
} from "@/hooks/useUsuarios"
import { useObras } from "@/hooks/useObras"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Field } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
import { api, ApiError } from "@/lib/api"
import type { PerfilUsuario, Usuario } from "@/lib/types"

const schema = z.object({
  nome: z.string().min(2, "Informe o nome"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "Mínimo 6 caracteres"),
})
type FormData = z.infer<typeof schema>

// administrador é global (is_admin); estes são os cargos por obra.
const PERFIS_OBRA: PerfilUsuario[] = [
  "fiscal_suape",
  "fiscal_externo",
  "fornecedor",
  "consulta",
]

export function Usuarios() {
  const { data: usuarios, isLoading } = useUsuarios()
  const createUsuario = useCreateUsuario()
  const promover = usePromoverAdmin()
  const [open, setOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [cargosUser, setCargosUser] = useState<Usuario | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    try {
      await createUsuario.mutateAsync({ ...data, is_admin: isAdmin })
      toast.success("Usuário criado!")
      reset()
      setIsAdmin(false)
      setOpen(false)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Falha ao criar")
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Usuários</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Novo Usuário
        </Button>
      </div>

      {isLoading ? (
        <RDOLoader label="Carregando usuários…" />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios?.map((u) => (
                <TableRow key={u.id_usuario}>
                  <TableCell className="font-medium">{u.nome}</TableCell>
                  <TableCell className="text-text-secondary">{u.email}</TableCell>
                  <TableCell>
                    {u.is_admin ? (
                      <Badge className="border-accent/30 bg-amber-50 text-accent-dark">
                        <ShieldCheck className="size-3" /> Admin
                      </Badge>
                    ) : (
                      <Badge className="border-border bg-slate-50 text-text-secondary">
                        Usuário
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCargosUser(u)}
                      >
                        <Briefcase className="size-4" /> Cargos
                      </Button>
                      {!u.is_admin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            promover.mutate(u.id_usuario, {
                              onSuccess: () => toast.success("Promovido a admin"),
                              onError: () => toast.error("Falha ao promover"),
                            })
                          }}
                        >
                          <UserCog className="size-4" /> Promover
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClose={() => setOpen(false)}>
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Nome" required error={errors.nome?.message}>
              <Input {...register("nome")} />
            </Field>
            <Field label="E-mail" required error={errors.email?.message}>
              <Input type="email" {...register("email")} />
            </Field>
            <Field label="Senha" required error={errors.senha?.message}>
              <Input type="password" {...register("senha")} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={isAdmin} onCheckedChange={setIsAdmin} />
              Administrador global
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createUsuario.isPending}>
                {createUsuario.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Criar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {cargosUser && (
        <CargosDialog
          usuario={cargosUser}
          onClose={() => setCargosUser(null)}
        />
      )}
    </div>
  )
}

function CargosDialog({
  usuario,
  onClose,
}: {
  usuario: Usuario
  onClose: () => void
}) {
  const qc = useQueryClient()
  const { data: vinculos } = useMeusVinculos(usuario.id_usuario)
  const { data: obras } = useObras()
  const [obraId, setObraId] = useState("")
  const [perfil, setPerfil] = useState<PerfilUsuario>("fornecedor")

  function invalidate(obra: string) {
    qc.invalidateQueries({
      queryKey: ["usuarios", usuario.id_usuario, "vinculos"],
    })
    qc.invalidateQueries({ queryKey: ["obras", obra, "usuarios"] })
  }

  const vincular = useMutation({
    mutationFn: (v: { obra: string; perfil: PerfilUsuario }) =>
      api.post(`/obras/${v.obra}/usuarios`, {
        id_usuario: usuario.id_usuario,
        perfil: v.perfil,
      }),
    onSuccess: (_d, v) => invalidate(v.obra),
  })
  const desvincular = useMutation({
    mutationFn: (v: { obra: string }) =>
      api.delete(`/obras/${v.obra}/usuarios/${usuario.id_usuario}`),
    onSuccess: (_d, v) => invalidate(v.obra),
  })

  const jaVinculadas = new Set((vinculos ?? []).map((v) => v.id_obra))
  const disponiveis = (obras ?? []).filter((o) => !jaVinculadas.has(o.id_obra))

  async function add() {
    if (!obraId) {
      toast.error("Selecione uma obra")
      return
    }
    try {
      await vincular.mutateAsync({ obra: obraId, perfil })
      toast.success("Cargo atribuído!")
      setObraId("")
      setPerfil("fornecedor")
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Falha ao atribuir")
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Cargos de {usuario.nome}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {usuario.is_admin && (
            <p className="rounded-lg bg-amber-50 p-2.5 text-xs text-accent-dark">
              Administrador global: já tem acesso a todas as obras. Os cargos
              abaixo são específicos por obra.
            </p>
          )}

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Cargos por obra
            </p>
            {!vinculos || vinculos.length === 0 ? (
              <p className="text-sm text-text-muted">
                Nenhum cargo atribuído.
              </p>
            ) : (
              vinculos.map((v) => (
                <div
                  key={v.id_obra_usuario}
                  className="flex items-center gap-2 rounded-lg border border-border p-2.5 text-sm"
                >
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {v.objeto_contratual ?? v.numero_contrato ?? "Obra"}
                  </span>
                  <Badge className="border-primary/20 bg-primary-surface text-primary">
                    {PERFIL_USUARIO[v.perfil]}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Remover cargo"
                    disabled={desvincular.isPending}
                    onClick={() => {
                      if (confirm("Remover este cargo da obra?"))
                        desvincular.mutate(
                          { obra: v.id_obra },
                          {
                            onSuccess: () => toast.success("Cargo removido"),
                            onError: () => toast.error("Falha ao remover"),
                          }
                        )
                    }}
                  >
                    <Trash2 className="size-4 text-danger" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Atribuir novo cargo
            </p>
            <Field label="Obra">
              <Select
                value={obraId}
                onChange={(e) => setObraId(e.target.value)}
              >
                <option value="">Selecione…</option>
                {disponiveis.map((o) => (
                  <option key={o.id_obra} value={o.id_obra}>
                    {o.objeto_contratual}
                  </option>
                ))}
              </Select>
              {disponiveis.length === 0 && (
                <p className="mt-1 text-xs text-text-muted">
                  Usuário já está vinculado a todas as obras.
                </p>
              )}
            </Field>
            <Field label="Cargo">
              <Select
                value={perfil}
                onChange={(e) => setPerfil(e.target.value as PerfilUsuario)}
              >
                {PERFIS_OBRA.map((p) => (
                  <option key={p} value={p}>
                    {PERFIL_USUARIO[p]}
                  </option>
                ))}
              </Select>
            </Field>
            <Button onClick={add} disabled={vincular.isPending || !obraId}>
              {vincular.isPending && <Loader2 className="size-4 animate-spin" />}
              Atribuir cargo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
