import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { PenLine, Loader2, CheckCircle2 } from "lucide-react"
import { useAssinarRdo } from "@/hooks/useRdos"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Field } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import { PAPEL_ASSINATURA } from "@/lib/constants"
import { truncateHash, formatDateTime } from "@/lib/utils"
import { ApiError } from "@/lib/api"
import type { AssinaturaResponse, PapelAssinatura } from "@/lib/types"

const schema = z.object({
  senha: z.string().min(1, "Informe sua senha"),
  papel: z.enum(["CONSTRUTORA", "SUPERVISORA", "FISCAL_SUAPE", "FISCAL_EXTERNO"]),
  cargo: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export function AssinaturaModal({
  rdoId,
  open,
  onOpenChange,
}: {
  rdoId: string
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const assinar = useAssinarRdo(rdoId)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { papel: "CONSTRUTORA" },
  })

  async function onSubmit(data: FormData) {
    try {
      await assinar.mutateAsync({
        senha: data.senha,
        papel: data.papel as PapelAssinatura,
        cargo: data.cargo || undefined,
      })
      toast.success("Documento assinado!")
      reset()
      onOpenChange(false)
    } catch (e) {
      toast.error(
        e instanceof ApiError ? e.message : "Falha ao assinar (senha incorreta?)"
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenLine className="size-5 text-accent" /> Assinatura Eletrônica
          </DialogTitle>
          <DialogDescription>
            Confirme com sua senha para aplicar a assinatura digital.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Papel" required error={errors.papel?.message}>
            <Select {...register("papel")}>
              {Object.entries(PAPEL_ASSINATURA).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Cargo (opcional)">
            <Input placeholder="Engenheiro Civil" {...register("cargo")} />
          </Field>
          <Field label="Senha" required error={errors.senha?.message}>
            <Input type="password" placeholder="••••••••" {...register("senha")} />
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="accent" disabled={assinar.isPending}>
              {assinar.isPending && <Loader2 className="size-4 animate-spin" />}
              Assinar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function AssinaturaCard({
  assinatura,
  animate,
}: {
  assinatura: AssinaturaResponse
  animate?: boolean
}) {
  return (
    <div
      className={`rounded-xl border-2 border-success bg-green-50/50 p-4 ${
        animate ? "animate-stampIn" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <p className="font-heading font-semibold">{assinatura.nome_completo}</p>
        <span className="flex items-center gap-1 font-heading text-sm font-bold text-success">
          ASSINADO <CheckCircle2 className="size-4" />
        </span>
      </div>
      {assinatura.cargo && (
        <p className="text-sm text-text-secondary">{assinatura.cargo}</p>
      )}
      <Badge className="mt-1 border-primary/20 bg-primary-surface text-primary">
        {PAPEL_ASSINATURA[assinatura.papel]}
      </Badge>
      <p className="mt-2 text-xs text-text-muted">
        {formatDateTime(assinatura.criado_em)}
      </p>
      <p className="mt-0.5 font-mono text-xs text-text-muted">
        SHA: {truncateHash(assinatura.hash_documento)}
      </p>
    </div>
  )
}
