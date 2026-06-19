import { Mic, Square, Loader2 } from "lucide-react"
import { useVoice } from "@/hooks/useVoice"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface VoiceInputProps {
  onTranscription: (texto: string) => void
  label?: string
  /** Modo compacto: apenas o ícone de microfone (para células/campos). */
  iconOnly?: boolean
  className?: string
}

export function VoiceInput({
  onTranscription,
  label = "Preencher por voz",
  iconOnly,
  className,
}: VoiceInputProps) {
  const voice = useVoice()

  async function handleClick() {
    if (voice.recording) {
      const texto = await voice.stop()
      if (texto) {
        onTranscription(texto)
        toast.success("Áudio transcrito!")
      } else {
        toast.error("Não foi possível transcrever")
      }
    } else {
      voice.start()
    }
  }

  if (iconOnly) {
    return (
      <Button
        type="button"
        size="icon"
        variant={voice.recording ? "destructive" : "ghost"}
        onClick={handleClick}
        disabled={voice.transcribing}
        title={voice.recording ? `Parar (${voice.seconds}s)` : label}
        className={cn("shrink-0", className)}
      >
        {voice.transcribing ? (
          <Loader2 className="size-4 animate-spin" />
        ) : voice.recording ? (
          <Square className="size-4" />
        ) : (
          <Mic className="size-4" />
        )}
      </Button>
    )
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Button
        type="button"
        variant={voice.recording ? "destructive" : "outline"}
        onClick={handleClick}
        disabled={voice.transcribing}
      >
        {voice.transcribing ? (
          <Loader2 className="size-4 animate-spin" />
        ) : voice.recording ? (
          <Square className="size-4" />
        ) : (
          <Mic className="size-4" />
        )}
        {voice.transcribing
          ? "Transcrevendo…"
          : voice.recording
            ? `Parar (${voice.seconds}s)`
            : label}
      </Button>
      {voice.recording && (
        <span className="flex items-center gap-1.5 text-sm text-danger">
          <span className="flex gap-0.5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="w-1 animate-bounceDot rounded-full bg-danger"
                style={{
                  height: 8 + (i % 2) * 10,
                  animationDelay: `${i * 120}ms`,
                }}
              />
            ))}
          </span>
          gravando
        </span>
      )}
      {voice.error && <span className="text-xs text-danger">{voice.error}</span>}
    </div>
  )
}
