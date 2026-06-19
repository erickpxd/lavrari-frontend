import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { api, ApiError } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field"

const schema = z.object({
  nome: z.string().min(2, "Informe o nome completo"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "Mínimo de 6 caracteres"),
})
type FormData = z.infer<typeof schema>

export function Setup() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      await api.post("/auth/setup", data)
      toast.success("Administrador criado! Faça login.")
      navigate("/login")
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.status === 400
            ? "Já existe um administrador cadastrado"
            : e.message
          : "Falha no setup"
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img
            src="/assets/logos/logo-vertical.png"
            alt="Laurari"
            className="mx-auto mb-5 h-28 w-auto"
          />
          <h1 className="font-heading text-2xl font-bold text-text-primary">
            Configuração Inicial
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Crie o primeiro administrador do sistema
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xl sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Nome completo" htmlFor="nome" error={errors.nome?.message}>
              <Input id="nome" placeholder="João Silva" {...register("nome")} />
            </Field>
            <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                placeholder="admin@suape.pe.gov.br"
                {...register("email")}
              />
            </Field>
            <Field label="Senha" htmlFor="senha" error={errors.senha?.message}>
              <Input
                id="senha"
                type="password"
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
              Criar administrador
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-text-muted">
            Já tem conta?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
