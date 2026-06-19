import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Plus, Loader2, Building2, ImagePlus, X } from "lucide-react"
import {
  useEmpresas,
  useCreateEmpresa,
  useUploadEmpresaLogo,
} from "@/hooks/useEmpresas"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { cnpjMask, resizeImageToDataURL } from "@/lib/utils"
import { ApiError } from "@/lib/api"

const schema = z.object({
  razao_social: z.string().min(2, "Informe a razão social"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  logo_url: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export function Empresas() {
  const { data: empresas, isLoading } = useEmpresas()
  const createEmpresa = useCreateEmpresa()
  const [open, setOpen] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)
  const [logoLoading, setLogoLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const cnpj = watch("cnpj") ?? ""
  const logoUrl = watch("logo_url")

  async function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setLogoLoading(true)
    try {
      const dataUrl = await resizeImageToDataURL(file, 256)
      setValue("logo_url", dataUrl)
    } catch {
      toast.error("Não foi possível processar a imagem")
    } finally {
      setLogoLoading(false)
    }
  }

  async function onSubmit(data: FormData) {
    try {
      await createEmpresa.mutateAsync({
        razao_social: data.razao_social,
        cnpj: data.cnpj.replace(/\D/g, ""),
        logo_url: data.logo_url || undefined,
      })
      toast.success("Empresa cadastrada!")
      reset()
      setOpen(false)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Falha ao cadastrar")
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Empresas</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Nova Empresa
        </Button>
      </div>

      {isLoading ? (
        <RDOLoader label="Carregando empresas…" />
      ) : !empresas || empresas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Building2 className="size-10 text-text-muted" />
            <p className="text-sm text-text-secondary">
              Nenhuma empresa cadastrada.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Logo</TableHead>
                <TableHead>Razão Social</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead className="w-28 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empresas.map((e) => (
                <TableRow key={e.id_empresa}>
                  <TableCell>
                    <div className="flex size-10 items-center justify-center overflow-hidden rounded-lg border border-border bg-white">
                      {e.logo_url ? (
                        <img
                          src={e.logo_url}
                          alt={e.razao_social}
                          className="size-full object-contain p-0.5"
                        />
                      ) : (
                        <Building2 className="size-5 text-text-muted" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{e.razao_social}</TableCell>
                  <TableCell className="font-mono text-sm text-text-secondary">
                    {cnpjMask(e.cnpj)}
                  </TableCell>
                  <TableCell className="text-right">
                    <EmpresaLogoUpload id={e.id_empresa} />
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
            <DialogTitle>Nova Empresa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Razão social" required error={errors.razao_social?.message}>
              <Input {...register("razao_social")} />
            </Field>
            <Field label="CNPJ" required error={errors.cnpj?.message}>
              <Input
                value={cnpj}
                onChange={(e) => setValue("cnpj", cnpjMask(e.target.value))}
                placeholder="00.000.000/0000-00"
                inputMode="numeric"
              />
            </Field>
            <Field label="Logo da empresa (opcional)">
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                className="hidden"
                onChange={handleLogoFile}
              />
              <div className="flex items-center gap-3">
                <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-white">
                  {logoLoading ? (
                    <Loader2 className="size-5 animate-spin text-primary" />
                  ) : logoUrl ? (
                    <>
                      <img
                        src={logoUrl}
                        alt="Pré-visualização"
                        className="size-full object-contain p-1"
                      />
                      <button
                        type="button"
                        onClick={() => setValue("logo_url", undefined)}
                        className="absolute right-0.5 top-0.5 rounded-full bg-danger p-0.5 text-white"
                      >
                        <X className="size-3" />
                      </button>
                    </>
                  ) : (
                    <ImagePlus className="size-6 text-text-muted" />
                  )}
                </div>
                <div className="space-y-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                  >
                    <ImagePlus className="size-4" /> Enviar logo
                  </Button>
                  <p className="text-xs text-text-muted">
                    Ajustada para 256×256 sem distorcer.
                  </p>
                </div>
              </div>
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createEmpresa.isPending}>
                {createEmpresa.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Cadastrar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EmpresaLogoUpload({ id }: { id: string }) {
  const upload = useUploadEmpresaLogo(id)
  const ref = useRef<HTMLInputElement>(null)

  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    upload.mutate(file, {
      onSuccess: () => toast.success("Logo atualizada!"),
      onError: () => toast.error("Falha ao enviar logo"),
    })
  }

  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        className="hidden"
        onChange={handle}
      />
      <Button
        variant="outline"
        size="sm"
        disabled={upload.isPending}
        onClick={() => ref.current?.click()}
      >
        {upload.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ImagePlus className="size-4" />
        )}
        Logo
      </Button>
    </>
  )
}
