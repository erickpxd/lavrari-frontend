import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/stores/authStore"
import { useAuth } from "@/hooks/useAuth"

export function ProtectedRoute() {
  const token = useAuthStore((s) => s.access_token)
  const { isLoading, usuario } = useAuth()

  if (!token) return <Navigate to="/login" replace />

  if (isLoading && !usuario) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <img
          src="/assets/logos/simbolo.png"
          alt="Carregando"
          className="size-16 animate-bounce"
        />
      </div>
    )
  }

  return <Outlet />
}
