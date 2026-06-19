import { useState } from "react"
import { Mic, Square, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { useVoice } from "@/hooks/useVoice"
import { useEstruturarRdo } from "@/hooks/useIA"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { EstruturarRDOResponse } from "@/lib/types"

export function PreencherPorVoz({
  idObra,
  dataRelatorio,
  onResult,
}: {
  idObra: string
  dataRelatorio: string
  onResult: (res: EstruturarRDOResponse) => void
}) {
  const voice = useVoice()
  const estruturar = useEstruturarRdo()
  const [texto, setTexto] = useState("")

  const busy = voice.transcribing || estruturar.isPending

  async function handleClick() {
    if (voice.recording) {
      const t = await voice.stop()
      if (!t) {
        toast.error("Não foi possível transcrever o áudio")
        return
      }
      setTexto(t)
      try {
        const res = await estruturar.mutateAsync({
          id_obra: idObra,
          data_relatorio: dataRelatorio,
          texto: t,
        })
        onResult(res)
        const n = res.campos_preenchidos?.length
        toast.success(
          n != null
            ? `IA preencheu ${n} campo(s) — confira e salve`
            : "IA preencheu o RDO — confira e salve"
        )
      } catch {
        toast.error("Falha ao estruturar o RDO")
      }
    } else {
      setTexto("")
      voice.start()
    }
  }

  return (
    <Card className="border-accent/30 bg-accent/5">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-heading font-semibold text-primary">
            <Sparkles className="size-4 text-accent" />
            Preencher RDO falando
          </p>
          <p className="text-xs text-text-secondary">
            Fale o dia inteiro (pessoal, equipamentos, serviços, ocorrências) e a
            IA preenche os campos automaticamente.
          </p>
          {voice.recording && (
            <p className="mt-1 text-xs font-medium text-danger">
              ● Gravando… {voice.seconds}s
            </p>
          )}
          {estruturar.isPending && (
            <p className="mt-1 text-xs font-medium text-primary">
              Estruturando com IA…
            </p>
          )}
          {texto && !busy && (
            <p className="mt-1 line-clamp-2 text-xs italic text-text-muted">
              “{texto}”
            </p>
          )}
        </div>
        <Button
          type="button"
          size="lg"
          variant={voice.recording ? "destructive" : "accent"}
          onClick={handleClick}
          disabled={busy}
          className="shrink-0"
        >
          {busy ? (
            <Loader2 className="size-5 animate-spin" />
          ) : voice.recording ? (
            <Square className="size-5" />
          ) : (
            <Mic className="size-5" />
          )}
          {busy
            ? "Processando…"
            : voice.recording
              ? `Parar (${voice.seconds}s)`
              : "Falar"}
        </Button>
      </CardContent>
    </Card>
  )
}
