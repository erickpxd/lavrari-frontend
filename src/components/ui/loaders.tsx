import { HardHat, FileText, Brain } from "lucide-react"
import { cn } from "@/lib/utils"

export function ObraLoader({ label = "Carregando obras…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-text-secondary">
      <HardHat className="size-8 animate-bounce text-accent" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function RDOLoader({ label = "Carregando RDO…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-text-secondary">
      <FileText className="size-8 animate-pulse text-primary" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function IALoader({ label = "Analisando…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 text-text-secondary">
      <Brain className="size-7 animate-spin text-primary-light" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function TypingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-2 rounded-full bg-primary-light animate-bounceDot"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  )
}
