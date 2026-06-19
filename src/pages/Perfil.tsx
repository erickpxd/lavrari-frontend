import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2, ShieldCheck, Building2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useUpdateUsuario } from "@/hooks/useUsuarios"
import { useObras } from "@/hooks/useObras"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import { getInitials } from "@/lib/utils"

const schema = z.object({
  nome: z.string().min(2, "Informe o nome"),
  email: z.string().email("E-mail inválido"),
})
type FormData = z.infer<typeof schema>

export function Perfil() {
  const { usuario, isAdmin } = useAuth()
  const update = useUpdateUsuario(usuario?.id_usuario ?? "")
  const { data: obras } = useObras()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: { nome: usuario?.nome ?? "", email: usuario?.email ?? "" },
  })

  useEffect(() => {
    if (usuario) reset({ nome: usuario.nome, email: usuario.email })
  }, [usuario, reset])

  async function onSubmit(data: FormData) {
    try {
      await update.mutateAsync(data)
      toast.success("Perfil atualizado!")
    } catch {
      toast.error("Falha ao atualizar")
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-accent font-heading text-xl font-bold text-accent-foreground">
          {getInitials(usuario?.nome)}
        </span>
        <div>
          <h1 className="font-heading text-2xl font-bold">{usuario?.nome}</h1>
          <p className="text-sm text-text-secondary">{usuario?.email}</p>
          {isAdmin && (
            <Badge className="mt-1 border-accent/30 bg-amber-50 text-accent-dark">
              <ShieldCheck className="size-3" /> Administrador
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Nome" error={errors.nome?.message}>
              <Input {...register("nome")} />
            </Field>
            <Field label="E-mail" error={errors.email?.message}>
              <Input type="email" {...register("email")} />
            </Field>
            <div className="flex justify-end">
              <Button type="submit" disabled={!isDirty || update.isPending}>
                {update.isPending && <Loader2 className="size-4 animate-spin" />}
                Salvar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Obras vinculadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {!obras || obras.length === 0 ? (
            <p className="text-sm text-text-muted">Nenhuma obra vinculada.</p>
          ) : (
            obras.map((o) => (
              <div
                key={o.id_obra}
                className="flex items-center gap-2 rounded-lg border border-border p-2.5 text-sm"
              >
                <Building2 className="size-4 text-primary" />
                <span className="font-medium">{o.objeto_contratual}</span>
                <span className="ml-auto font-mono text-xs text-text-muted">
                  {o.numero_contrato}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
