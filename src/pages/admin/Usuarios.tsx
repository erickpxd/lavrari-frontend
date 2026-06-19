import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Plus, ShieldCheck, Loader2, UserCog } from "lucide-react"
import {
  useUsuarios,
  useCreateUsuario,
  usePromoverAdmin,
} from "@/hooks/useUsuarios"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { ApiError } from "@/lib/api"

const schema = z.object({
  nome: z.string().min(2, "Informe o nome"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "Mínimo 6 caracteres"),
})
type FormData = z.infer<typeof schema>

export function Usuarios() {
  const { data: usuarios, isLoading } = useUsuarios()
  const createUsuario = useCreateUsuario()
  const promover = usePromoverAdmin()
  const [open, setOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

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
    </div>
  )
}
