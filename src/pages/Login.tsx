import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2, Brain, Activity, Workflow } from "lucide-react"
import { api, ApiError } from "@/lib/api"
import { useAuthStore } from "@/stores/authStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field"
import { Onboarding } from "./Onboarding"
import type { LoginResponse } from "@/lib/types"

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(1, "Informe a senha"),
})
type FormData = z.infer<typeof schema>

export function Login() {
  const navigate = useNavigate()
  const setTokens = useAuthStore((s) => s.setTokens)
  const [loading, setLoading] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem("onboarding_done")
  )
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      const res = await api.post<LoginResponse>("/auth/login", data)
      setTokens(res.access_token, res.refresh_token)
      toast.success("Bem-vindo de volta!")
      navigate("/dashboard")
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : "Falha ao entrar"
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (showOnboarding) {
    return (
      <Onboarding
        onDone={() => {
          localStorage.setItem("onboarding_done", "1")
          setShowOnboarding(false)
        }}
      />
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex w-full flex-col items-center justify-center p-4 lg:w-[45%]">
        <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img
            src="/assets/logos/logo-vertical.png"
            alt="Laurari"
            className="mx-auto mb-4 h-44 w-auto"
          />
          <p className="mt-1 text-sm text-text-secondary">
            Registro Diário de Obras · SUAPE
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xl sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                {...register("email")}
              />
            </Field>
            <Field label="Senha" htmlFor="senha" error={errors.senha?.message}>
              <Input
                id="senha"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("senha")}
              />
            </Field>
            <Button
              type="submit"
              size="field"
              className="w-full"
              disabled={loading}
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              Entrar
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-text-muted">
            Primeira vez no sistema?{" "}
            <Link to="/setup" className="font-medium text-primary hover:underline">
              Configurar administrador
            </Link>
          </p>
        </div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden lg:block lg:w-[55%]">
        <img
          src="/assets/images/imagem-capa.png"
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/30" />
        <div className="absolute inset-0 flex flex-col justify-end p-10 xl:p-16 2xl:p-24">
          <h3 className="max-w-2xl font-heading text-4xl font-bold leading-tight text-white xl:text-5xl">
            Sua obra em tempo real, sua gestão com total confiança.
          </h3>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 xl:text-lg">
            Registre, acompanhe e aprove RDOs com evidências
            georreferenciadas, apoio de IA e rastreabilidade do início ao
            fim.
          </p>
          <ul className="mt-8 flex flex-wrap gap-2.5">
            {[
              { icon: Brain, label: "IA para análise" },
              { icon: Activity, label: "Dados em tempo real" },
              { icon: Workflow, label: "Fluxo automatizado" },
            ].map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-sm font-medium text-white backdrop-blur xl:text-base"
              >
                <Icon className="size-4 text-accent xl:size-[18px]" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
