import { useNavigate } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useCreateObra } from "@/hooks/useObras"
import { useEmpresas } from "@/hooks/useEmpresas"
import { useUsuarios } from "@/hooks/useUsuarios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Field } from "@/components/ui/field"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPicker } from "@/components/shared/MapPicker"
import { ApiError } from "@/lib/api"

const schema = z.object({
  numero_contrato: z.string().min(1, "Obrigatório"),
  objeto_contratual: z.string().min(3, "Descreva o objeto"),
  tipologia: z.string().min(1, "Obrigatório"),
  local_descricao: z.string().min(1, "Obrigatório"),
  latitude_obra: z.coerce.number().optional().nullable(),
  longitude_obra: z.coerce.number().optional().nullable(),
  id_empresa_contratada: z.string().min(1, "Selecione a empresa"),
  id_empresa_supervisora: z.string().optional(),
  id_fiscal_suape: z.string().min(1, "Selecione o fiscal SUAPE"),
  id_fiscal_externo: z.string().optional(),
  data_inicio_vigencia: z.string().min(1, "Obrigatório"),
  data_fim_vigencia: z.string().min(1, "Obrigatório"),
  data_inicio_execucao: z.string().min(1, "Obrigatório"),
  data_fim_execucao: z.string().min(1, "Obrigatório"),
  prazo_contratual_dias: z.coerce.number().int().positive("Informe os dias"),
  logo_suape_url: z.string().optional(),
  logo_contratada_url: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export function ObraCreate() {
  const navigate = useNavigate()
  const createObra = useCreateObra()
  const { data: empresas } = useEmpresas()
  const { data: usuarios } = useUsuarios()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const lat = watch("latitude_obra")
  const lon = watch("longitude_obra")

  async function onSubmit(data: FormData) {
    try {
      const payload = {
        ...data,
        id_empresa_supervisora: data.id_empresa_supervisora || undefined,
        id_fiscal_externo: data.id_fiscal_externo || undefined,
        logo_suape_url: data.logo_suape_url || undefined,
        logo_contratada_url: data.logo_contratada_url || undefined,
      }
      const obra = await createObra.mutateAsync(payload)
      toast.success("Obra criada com sucesso!")
      navigate(`/obras/${obra.id_obra}`)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Falha ao criar obra")
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="font-heading text-2xl font-bold">Nova Obra</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados do contrato</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Número do contrato" required error={errors.numero_contrato?.message}>
              <Input placeholder="CTR-2024/0456" {...register("numero_contrato")} />
            </Field>
            <Field label="Tipologia" required error={errors.tipologia?.message}>
              <Input placeholder="Rodovia, Porto, Edificação…" {...register("tipologia")} />
            </Field>
            <Field
              label="Objeto contratual"
              required
              error={errors.objeto_contratual?.message}
              className="sm:col-span-2"
            >
              <Textarea
                placeholder="Descrição do serviço contratado"
                {...register("objeto_contratual")}
              />
            </Field>
            <Field
              label="Local (descrição)"
              required
              error={errors.local_descricao?.message}
              className="sm:col-span-2"
            >
              <Input placeholder="Ipojuca, PE" {...register("local_descricao")} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Localização (opcional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-text-muted">
              Clique no mapa para definir as coordenadas da obra.
            </p>
            <MapPicker
              lat={lat}
              lon={lon}
              onPick={(la, lo) => {
                setValue("latitude_obra", la)
                setValue("longitude_obra", lo)
              }}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Latitude">
                <Input
                  type="number"
                  step="any"
                  placeholder="-8.3958"
                  {...register("latitude_obra")}
                />
              </Field>
              <Field label="Longitude">
                <Input
                  type="number"
                  step="any"
                  placeholder="-34.9619"
                  {...register("longitude_obra")}
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Partes envolvidas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Empresa contratada"
              required
              error={errors.id_empresa_contratada?.message}
            >
              <Controller
                control={control}
                name="id_empresa_contratada"
                render={({ field }) => (
                  <Select {...field}>
                    <option value="">Selecione…</option>
                    {empresas?.map((e) => (
                      <option key={e.id_empresa} value={e.id_empresa}>
                        {e.razao_social}
                      </option>
                    ))}
                  </Select>
                )}
              />
            </Field>
            <Field label="Empresa supervisora">
              <Controller
                control={control}
                name="id_empresa_supervisora"
                render={({ field }) => (
                  <Select {...field}>
                    <option value="">Nenhuma</option>
                    {empresas?.map((e) => (
                      <option key={e.id_empresa} value={e.id_empresa}>
                        {e.razao_social}
                      </option>
                    ))}
                  </Select>
                )}
              />
            </Field>
            <Field
              label="Fiscal SUAPE"
              required
              error={errors.id_fiscal_suape?.message}
            >
              <Controller
                control={control}
                name="id_fiscal_suape"
                render={({ field }) => (
                  <Select {...field}>
                    <option value="">Selecione…</option>
                    {usuarios?.map((u) => (
                      <option key={u.id_usuario} value={u.id_usuario}>
                        {u.nome}
                      </option>
                    ))}
                  </Select>
                )}
              />
            </Field>
            <Field label="Fiscal externo">
              <Controller
                control={control}
                name="id_fiscal_externo"
                render={({ field }) => (
                  <Select {...field}>
                    <option value="">Nenhum</option>
                    {usuarios?.map((u) => (
                      <option key={u.id_usuario} value={u.id_usuario}>
                        {u.nome}
                      </option>
                    ))}
                  </Select>
                )}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prazos</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Início vigência" required error={errors.data_inicio_vigencia?.message}>
              <Input type="date" {...register("data_inicio_vigencia")} />
            </Field>
            <Field label="Fim vigência" required error={errors.data_fim_vigencia?.message}>
              <Input type="date" {...register("data_fim_vigencia")} />
            </Field>
            <Field label="Início execução" required error={errors.data_inicio_execucao?.message}>
              <Input type="date" {...register("data_inicio_execucao")} />
            </Field>
            <Field label="Fim execução" required error={errors.data_fim_execucao?.message}>
              <Input type="date" {...register("data_fim_execucao")} />
            </Field>
            <Field
              label="Prazo contratual (dias)"
              required
              error={errors.prazo_contratual_dias?.message}
            >
              <Input type="number" placeholder="365" {...register("prazo_contratual_dias")} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logos (opcional)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Logo SUAPE (URL)">
              <Input placeholder="https://…" {...register("logo_suape_url")} />
            </Field>
            <Field label="Logo contratada (URL)">
              <Input placeholder="https://…" {...register("logo_contratada_url")} />
            </Field>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createObra.isPending}>
            {createObra.isPending && <Loader2 className="size-4 animate-spin" />}
            Criar obra
          </Button>
        </div>
      </form>
    </div>
  )
}
