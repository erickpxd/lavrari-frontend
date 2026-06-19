import { useState, useRef, useEffect } from "react"
import { Send, Mic, Wrench, Sparkles, Square } from "lucide-react"
import { useChat } from "@/hooks/useIA"
import { useVoice } from "@/hooks/useVoice"
import { TypingDots } from "@/components/ui/loaders"
import { Markdown } from "@/components/ui/markdown"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ChatMensagem } from "@/lib/types"

const SUGESTOES = [
  "Quais obras estão em risco?",
  "Alertas críticos hoje?",
]

export function ChatPanel({ className }: { className?: string }) {
  const [historico, setHistorico] = useState<ChatMensagem[]>([])
  const [toolsByMsg, setToolsByMsg] = useState<Record<number, string[]>>({})
  const [input, setInput] = useState("")
  const chat = useChat()
  const voice = useVoice()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [historico, chat.isPending])

  async function send(mensagem: string) {
    const texto = mensagem.trim()
    if (!texto || chat.isPending) return
    const novoHistorico = [
      ...historico,
      { role: "user", content: texto } as ChatMensagem,
    ]
    setHistorico(novoHistorico)
    setInput("")
    try {
      const res = await chat.mutateAsync({ mensagem: texto, historico })
      setHistorico((h) => {
        const idx = h.length
        setToolsByMsg((t) => ({ ...t, [idx]: res.tools_usadas }))
        return [...h, { role: "assistant", content: res.resposta }]
      })
    } catch {
      setHistorico((h) => [
        ...h,
        {
          role: "assistant",
          content: "Desculpe, não consegui responder agora. Tente novamente.",
        },
      ])
    }
  }

  async function handleMic() {
    if (voice.recording) {
      const texto = await voice.stop()
      if (texto) setInput((i) => (i ? `${i} ${texto}` : texto))
    } else {
      voice.start()
    }
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-primary-surface/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <span className="font-heading font-semibold text-primary">
            Assistente Lavrari
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium text-success">
          <span className="size-2 animate-pulse rounded-full bg-success" />
          IA ativa
        </span>
      </div>

      {/* Mensagens */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {historico.length === 0 && (
          <div className="space-y-3 pt-2">
            <p className="text-center text-sm text-text-secondary">
              🏗️ Pergunte sobre obras, RDOs, saúde e alertas.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGESTOES.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-primary/20 bg-white px-3 py-1.5 text-xs text-primary hover:bg-primary-surface"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {historico.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                msg.role === "user"
                  ? "bg-primary text-white"
                  : "border-l-2 border-primary bg-white text-text-primary shadow-sm"
              )}
            >
              {msg.role === "assistant" ? (
                <Markdown>{msg.content}</Markdown>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
              {toolsByMsg[i]?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {toolsByMsg[i].map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded bg-primary-surface px-1.5 py-0.5 text-[10px] font-medium text-primary"
                    >
                      <Wrench className="size-2.5" />
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {chat.isPending && (
          <div className="flex justify-start">
            <div className="rounded-2xl border-l-2 border-primary bg-white px-4 py-3 shadow-sm">
              <TypingDots />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        {voice.recording && (
          <p className="mb-2 text-center text-xs font-medium text-danger">
            ● Gravando… {voice.seconds}s — toque no microfone para parar
          </p>
        )}
        {voice.transcribing && (
          <p className="mb-2 text-center text-xs text-primary">
            Transcrevendo áudio…
          </p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua pergunta…"
            className="h-11 flex-1 rounded-full border border-border bg-surface px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <Button
            type="button"
            size="icon"
            variant={voice.recording ? "destructive" : "ghost"}
            onClick={handleMic}
            className="shrink-0 rounded-full"
          >
            {voice.recording ? (
              <Square className="size-4" />
            ) : (
              <Mic className="size-5" />
            )}
          </Button>
          <Button
            type="submit"
            size="icon"
            className="shrink-0 rounded-full"
            disabled={!input.trim() || chat.isPending}
          >
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
