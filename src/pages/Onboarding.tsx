import { useState } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = [
  {
    img: "/assets/images/1.png",
    title: "Registre o dia da obra",
    desc: "Capture atividades, fotos e medições em minutos — direto do canteiro, mesmo sem internet.",
  },
  {
    img: "/assets/images/2.png",
    title: "Acompanhe em tempo real",
    desc: "GPS e evidências georreferenciadas mantêm cada registro rastreável de ponta a ponta.",
  },
  {
    img: "/assets/images/3.png",
    title: "Aprove com confiança",
    desc: "Fluxo de revisão e assinaturas digitais conduzem o relatório do rascunho à finalização.",
  },
]

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const isLast = step === STEPS.length - 1
  const current = STEPS[step]

  function next() {
    if (isLast) onDone()
    else setStep((s) => s + 1)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex w-full flex-col lg:w-[45%]">
      {/* Topo: voltar + pular */}
      <div className="flex items-center justify-between p-4 sm:p-6">
        {step > 0 ? (
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="flex size-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary-surface"
            aria-label="Voltar"
          >
            <ArrowLeft className="size-5" />
          </button>
        ) : (
          <span className="size-10" />
        )}
        <button
          onClick={onDone}
          className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-primary"
        >
          Pular
        </button>
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-8 text-center">
        <div className="flex w-full max-w-md flex-1 items-center justify-center">
          <img
            src={current.img}
            alt=""
            className="max-h-64 w-auto object-contain sm:max-h-80"
          />
        </div>
        <h1 className="mt-6 font-heading text-2xl font-bold text-text-primary sm:text-3xl">
          {current.title}
        </h1>
        <p className="mt-3 max-w-md text-base leading-relaxed text-text-secondary">
          {current.desc}
        </p>

        {/* Indicadores */}
        <div className="mt-8 flex items-center gap-2">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-2 rounded-full transition-all",
                i === step ? "w-6 bg-primary" : "w-2 bg-primary/25"
              )}
            />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-8 sm:pb-10">
        <button
          onClick={next}
          className="mx-auto flex min-h-[56px] w-full max-w-md items-center justify-center gap-2 rounded-xl bg-accent px-6 text-base font-semibold text-accent-foreground shadow-sm transition-colors hover:bg-accent-dark"
        >
          {isLast ? "Começar" : "Próximo"}
          <ArrowRight className="size-5" />
        </button>
      </div>
      </div>

      <div className="relative hidden overflow-hidden lg:block lg:w-[55%]">
        <img
          src="/assets/images/imagem-capa.png"
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/30" />
      </div>
    </div>
  )
}
