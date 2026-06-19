import { useForm, useFieldArray } from "react-hook-form"
import {
  Users,
  Wrench,
  Building,
  Calendar,
  CheckSquare,
  ClipboardList,
  HardHat,
  Leaf,
  Plus,
  Trash2,
  Save,
  Sparkles,
  Loader2,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"
import { useUpdateRdo } from "@/hooks/useRdos"
import { useSugestaoTexto } from "@/hooks/useIA"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import { VoiceInput } from "./VoiceInput"
import { PreencherPorVoz } from "./PreencherPorVoz"
import { FONTE_DADO, EVENTOS_RESTRICAO_FLAGS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { ApiError } from "@/lib/api"
import type {
  RDOResponse,
  EventosRestricao,
  EstruturarRDOResponse,
} from "@/lib/types"

const FLAG_ICONS: Record<string, LucideIcon> = {
  Users,
  Wrench,
  Building,
  Calendar,
  CheckSquare,
  ClipboardList,
  HardHat,
  Leaf,
}

interface FormValues {
  pessoal_direto: { funcao: string; quantidade: number }[]
  pessoal_indireto: { funcao: string; quantidade: number }[]
  equipamentos: { nome: string; quantidade: number }[]
  servicos: { descricao: string; situacao: string; grupo: string }[]
  eventos_restricao: EventosRestricao
  ocorrencias: string
  resumo_dia: string
}

const EMPTY_EVENTOS: EventosRestricao = {
  pessoal: false,
  equipamento: false,
  instalacoes: false,
  cronograma_fisico: false,
  qualidade: false,
  atendimento_fiscalizacao: false,
  administracao_obra: false,
  meio_ambiente: false,
  descricao: "",
}

function mergeEventos(
  atual: EventosRestricao,
  novo?: Partial<EventosRestricao> | null
): EventosRestricao {
  if (!novo) return atual
  const merged: EventosRestricao = { ...atual }
  const flags = merged as unknown as Record<string, unknown>
  for (const f of EVENTOS_RESTRICAO_FLAGS) {
    const k = f.key as keyof EventosRestricao
    if (novo[k] === true) flags[f.key] = true
  }
  merged.descricao = [atual.descricao, novo.descricao]
    .filter(Boolean)
    .join(" ")
    .trim()
  return merged
}

export function RDOForm({ rdo }: { rdo: RDOResponse }) {
  const update = useUpdateRdo(rdo.id_rdo)
  const sugestao = useSugestaoTexto()

  const { register, control, handleSubmit, watch, setValue, getValues, reset } =
    useForm<FormValues>({
      defaultValues: {
        pessoal_direto: rdo.pessoal_direto ?? [],
        pessoal_indireto: rdo.pessoal_indireto ?? [],
        equipamentos: rdo.equipamentos ?? [],
        servicos: (rdo.servicos ?? []).map((s) => ({
          descricao: s.descricao,
          situacao: s.situacao,
          grupo: s.grupo ?? "",
        })),
        eventos_restricao: rdo.eventos_restricao ?? EMPTY_EVENTOS,
        ocorrencias: rdo.ocorrencias ?? "",
        resumo_dia: rdo.resumo_dia ?? "",
      },
    })

  const eventos = watch("eventos_restricao")
  const algumEvento = EVENTOS_RESTRICAO_FLAGS.some(
    (f) => eventos[f.key as keyof EventosRestricao]
  )

  async function onSubmit(v: FormValues) {
    try {
      await update.mutateAsync({
        pessoal_direto: v.pessoal_direto,
        pessoal_indireto: v.pessoal_indireto,
        equipamentos: v.equipamentos,
        servicos: v.servicos.map((s) => ({
          descricao: s.descricao,
          situacao: s.situacao,
          grupo: s.grupo || null,
        })),
        eventos_restricao: v.eventos_restricao,
        ocorrencias: v.ocorrencias,
        resumo_dia: v.resumo_dia,
      })
      toast.success("RDO salvo!")
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Falha ao salvar")
    }
  }

  async function sugerir() {
    try {
      const res = await sugestao.mutateAsync({
        id_obra: rdo.id_obra,
        data_relatorio: rdo.data_relatorio,
      })
      setValue("ocorrencias", res.ocorrencias)
      setValue("resumo_dia", res.resumo_dia)
      toast.success("Sugestão da IA aplicada!")
    } catch {
      toast.error("Falha ao gerar sugestão")
    }
  }

  function aplicarEstruturado(res: EstruturarRDOResponse) {
    const atual = getValues()
    const append = (a?: string | null, b?: string | null) =>
      [a, b].filter(Boolean).join(" ").trim()

    reset({
      ...atual,
      pessoal_direto: [...atual.pessoal_direto, ...(res.pessoal_direto ?? [])],
      pessoal_indireto: [
        ...atual.pessoal_indireto,
        ...(res.pessoal_indireto ?? []),
      ],
      equipamentos: [...atual.equipamentos, ...(res.equipamentos ?? [])],
      servicos: [
        ...atual.servicos,
        ...(res.servicos ?? []).map((s) => ({
          descricao: s.descricao,
          situacao: s.situacao,
          grupo: s.grupo ?? "",
        })),
      ],
      eventos_restricao: mergeEventos(atual.eventos_restricao, res.eventos_restricao),
      ocorrencias: append(atual.ocorrencias, res.ocorrencias),
      resumo_dia: append(atual.resumo_dia, res.resumo_dia),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Preencher tudo por voz — fluxo principal em campo */}
      <PreencherPorVoz
        idObra={rdo.id_obra}
        dataRelatorio={rdo.data_relatorio}
        onResult={aplicarEstruturado}
      />

      {/* Ocorrências + Resumo (ditar é o fluxo principal em campo) */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Ocorrências & Resumo</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={sugerir}
            disabled={sugestao.isPending}
          >
            {sugestao.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Sugerir com IA
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Ocorrências">
            <div className="mb-2">
              <VoiceInput
                label="Ditar ocorrências"
                onTranscription={(t) =>
                  setValue("ocorrencias", (watch("ocorrencias") + " " + t).trim())
                }
              />
            </div>
            <Textarea rows={3} {...register("ocorrencias")} />
          </Field>
          <Field label="Resumo do dia">
            <div className="mb-2">
              <VoiceInput
                label="Ditar resumo"
                onTranscription={(t) =>
                  setValue("resumo_dia", (watch("resumo_dia") + " " + t).trim())
                }
              />
            </div>
            <Textarea rows={3} {...register("resumo_dia")} />
          </Field>
        </CardContent>
      </Card>

      {/* Pessoal */}
      <DynamicTable
        title="Pessoal Direto"
        control={control}
        register={register}
        setValue={setValue}
        getValues={getValues}
        name="pessoal_direto"
        columns={[
          { key: "funcao", label: "Função", type: "text" },
          { key: "quantidade", label: "Qtd", type: "number", width: "w-24" },
        ]}
        empty={{ funcao: "", quantidade: 1 }}
      />
      <DynamicTable
        title="Pessoal Indireto"
        control={control}
        register={register}
        setValue={setValue}
        getValues={getValues}
        name="pessoal_indireto"
        columns={[
          { key: "funcao", label: "Função", type: "text" },
          { key: "quantidade", label: "Qtd", type: "number", width: "w-24" },
        ]}
        empty={{ funcao: "", quantidade: 1 }}
      />
      <DynamicTable
        title="Equipamentos"
        control={control}
        register={register}
        setValue={setValue}
        getValues={getValues}
        name="equipamentos"
        columns={[
          { key: "nome", label: "Nome", type: "text" },
          { key: "quantidade", label: "Qtd", type: "number", width: "w-24" },
        ]}
        empty={{ nome: "", quantidade: 1 }}
      />
      <DynamicTable
        title="Serviços"
        control={control}
        register={register}
        setValue={setValue}
        getValues={getValues}
        name="servicos"
        columns={[
          { key: "descricao", label: "Descrição", type: "text" },
          { key: "grupo", label: "Grupo", type: "text", width: "w-36" },
          { key: "situacao", label: "Situação", type: "text", width: "w-36" },
        ]}
        empty={{ descricao: "", grupo: "", situacao: "" }}
      />

      {/* Eventos com Restrição */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos com Restrição</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {EVENTOS_RESTRICAO_FLAGS.map((f) => {
              const Icon = FLAG_ICONS[f.icon]
              const active = eventos[f.key as keyof EventosRestricao] as boolean
              return (
                <button
                  type="button"
                  key={f.key}
                  onClick={() =>
                    setValue(
                      `eventos_restricao.${f.key as keyof EventosRestricao}` as never,
                      !active as never
                    )
                  }
                  className={cn(
                    "flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-lg border-2 p-2 text-center text-xs font-medium transition-colors",
                    active
                      ? "border-danger bg-red-50 text-danger"
                      : "border-border bg-white text-text-secondary"
                  )}
                >
                  <Icon className="size-5" />
                  {f.label}
                </button>
              )
            })}
          </div>
          {algumEvento && (
            <Field label="Descrição dos eventos">
              <div className="mb-2">
                <VoiceInput
                  label="Ditar descrição"
                  onTranscription={(t) =>
                    setValue(
                      "eventos_restricao.descricao",
                      (
                        (watch("eventos_restricao.descricao") ?? "") +
                        " " +
                        t
                      ).trim()
                    )
                  }
                />
              </div>
              <Textarea
                placeholder="Descreva os eventos com restrição…"
                {...register("eventos_restricao.descricao")}
              />
            </Field>
          )}
        </CardContent>
      </Card>

      {/* Clima — capturado automaticamente da localização das fotos */}
      <Card>
        <CardHeader>
          <CardTitle>Condições climáticas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <ClimaBlock titulo="Manhã" clima={rdo.clima_manha} />
            <ClimaBlock titulo="Tarde" clima={rdo.clima_tarde} />
          </div>
          <p className="flex items-center gap-1.5 text-xs text-text-muted">
            <Sparkles className="size-3.5 text-accent" />
            Capturado automaticamente a partir da localização e do horário das
            fotos enviadas.
          </p>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 flex justify-end">
        <Button type="submit" size="lg" disabled={update.isPending} className="shadow-lg">
          {update.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Salvar RDO
        </Button>
      </div>
    </form>
  )
}

function ClimaBlock({
  titulo,
  clima,
}: {
  titulo: string
  clima?: import("@/lib/types").CondicaoClimatica | null
}) {
  const fonteCfg = clima?.fonte ? FONTE_DADO[clima.fonte] : null
  return (
    <div className="rounded-lg border border-border bg-slate-50/60 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium">{titulo}</span>
        {fonteCfg && (
          <Badge className={cn("border-transparent", fonteCfg.badge)}>
            {fonteCfg.label}
          </Badge>
        )}
      </div>
      <p className="text-sm font-medium text-text-primary">
        {clima?.tempo || "Aguardando captura"}
      </p>
      {clima && (
        <span
          className={cn(
            "mt-1 inline-flex items-center gap-1 text-xs font-medium",
            clima.praticavel ? "text-success" : "text-danger"
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              clima.praticavel ? "bg-success" : "bg-danger"
            )}
          />
          {clima.praticavel ? "Praticável" : "Não praticável"}
        </span>
      )}
    </div>
  )
}

interface Column {
  key: string
  label: string
  type: "text" | "number"
  width?: string
}

function DynamicTable({
  title,
  control,
  register,
  setValue,
  getValues,
  name,
  columns,
  empty,
}: {
  title: string
  control: ReturnType<typeof useForm<FormValues>>["control"]
  register: ReturnType<typeof useForm<FormValues>>["register"]
  setValue: ReturnType<typeof useForm<FormValues>>["setValue"]
  getValues: ReturnType<typeof useForm<FormValues>>["getValues"]
  name: "pessoal_direto" | "pessoal_indireto" | "equipamentos" | "servicos"
  columns: Column[]
  empty: Record<string, string | number>
}) {
  const { fields, append, remove } = useFieldArray({ control, name: name as never })
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>{title}</CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => append(empty as never)}
        >
          <Plus className="size-4" /> Adicionar
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {fields.length === 0 && (
          <p className="text-sm text-text-muted">Nenhum item.</p>
        )}
        {fields.map((f, idx) => (
          <div key={f.id} className="flex items-center gap-2">
            {columns.map((col) => {
              const path = `${name}.${idx}.${col.key}` as const
              return (
                <div
                  key={col.key}
                  className={cn(
                    "relative flex items-center",
                    col.width ?? "flex-1"
                  )}
                >
                  <Input
                    type={col.type}
                    placeholder={col.label}
                    className={cn("w-full", col.type === "text" && "pr-9")}
                    {...register(
                      path as never,
                      col.type === "number" ? { valueAsNumber: true } : {}
                    )}
                  />
                  {col.type === "text" && (
                    <VoiceInput
                      iconOnly
                      label={`Ditar ${col.label.toLowerCase()}`}
                      className="absolute right-0 size-9"
                      onTranscription={(t) => {
                        const atual =
                          (getValues(path as never) as unknown as string) ?? ""
                        setValue(
                          path as never,
                          (atual ? `${atual} ${t}` : t).trim() as never
                        )
                      }}
                    />
                  )}
                </div>
              )
            })}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(idx)}
            >
              <Trash2 className="size-4 text-danger" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
