import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2, ShieldCheck, Building2, ChevronRight } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useUpdateUsuario, useMeusVinculos } from "@/hooks/useUsuarios"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import { PERFIL_USUARIO } from "@/lib/constants"
import { getInitials } from "@/lib/utils"

const schema = z.object({
  nome: z.string().min(2, "Informe o nome"),
  email: z.string().email("E-mail inválido"),
})
type FormData = z.infer<typeof schema>

const MAX_OBRAS = 3

export function Perfil() {
  const navigate = useNavigate()
  const { usuario, isAdmin } = useAuth()
  const update = useUpdateUsuario(usuario?.id_usuario ?? "")
  const { data: vinculos } = useMeusVinculos(usuario?.id_usuario)

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

  function close() {
    if (window.history.length > 1) navigate(-1)
    else navigate("/dashboard")
  }

  async function onSubmit(data: FormData) {
    try {
      await update.mutateAsync(data)
      toast.success("Perfil atualizado!")
    } catch {
      toast.error("Falha ao atualizar")
    }
  }

  const obrasVinculadas = vinculos ?? []
  const visiveis = obrasVinculadas.slice(0, MAX_OBRAS)
  const temMais = obrasVinculadas.length > MAX_OBRAS

  return (
    <Dialog open onOpenChange={(o) => !o && close()}>
      <DialogContent onClose={close} className="max-w-xl">
        {/* Cabeçalho do perfil */}
        <div className="flex items-center gap-4 pr-8">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-accent font-heading text-xl font-bold text-accent-foreground">
            {getInitials(usuario?.nome)}
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-heading text-2xl font-bold">
              {usuario?.nome}
            </h1>
            <p className="truncate text-sm text-text-secondary">
              {usuario?.email}
            </p>
            {isAdmin && (
              <Badge className="mt-1 border-accent/30 bg-amber-50 text-accent-dark">
                <ShieldCheck className="size-3" /> Administrador
              </Badge>
            )}
          </div>
        </div>

        {/* Dados pessoais */}
        <section className="mt-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Dados pessoais
          </h2>
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
        </section>

        {/* Obras vinculadas */}
        <section className="mt-6 border-t border-border pt-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Obras vinculadas
          </h2>
          {obrasVinculadas.length === 0 ? (
            <p className="text-sm text-text-muted">Nenhuma obra vinculada.</p>
          ) : (
            <div className="space-y-2">
              {visiveis.map((v) => (
                <button
                  key={v.id_obra_usuario}
                  onClick={() => navigate(`/obras/${v.id_obra}`)}
                  className="flex w-full items-center gap-3 rounded-lg border border-border p-2.5 text-left text-sm transition-colors hover:bg-primary-surface/40"
                >
                  <Building2 className="size-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {v.objeto_contratual ?? v.numero_contrato ?? "Obra"}
                    </p>
                    {v.numero_contrato && (
                      <p className="truncate font-mono text-xs text-text-muted">
                        {v.numero_contrato}
                        {v.permissoes_ativas && v.permissoes_ativas.length > 0 && (
                          <span> · {v.permissoes_ativas.length} permissão(ões)</span>
                        )}
                      </p>
                    )}
                  </div>
                  <Badge className="shrink-0 border-primary/20 bg-primary-surface text-primary">
                    {PERFIL_USUARIO[v.perfil]}
                  </Badge>
                  <ChevronRight className="size-4 shrink-0 text-text-muted" />
                </button>
              ))}
              {temMais && (
                <button
                  onClick={() => navigate("/obras")}
                  className="flex w-full items-center justify-center pt-1 text-sm font-medium text-primary transition-colors hover:underline"
                >
                  Ver todas as obras ({obrasVinculadas.length})
                </button>
              )}
            </div>
          )}
        </section>
      </DialogContent>
    </Dialog>
  )
}
