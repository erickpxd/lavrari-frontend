import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { HardHat, Loader2 } from "lucide-react"
import { api, ApiError } from "@/lib/api"
import { useAuthStore } from "@/stores/authStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field"
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-dark-bg to-dark-surface p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-accent">
            <HardHat className="size-9 text-accent-foreground" />
          </span>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-white">
            LAVRARI
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Registro Diário de Obras · SUAPE
          </p>
        </div>

        <div className="rounded-2xl bg-surface p-6 shadow-2xl sm:p-8">
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
  )
}
