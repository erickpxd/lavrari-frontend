import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/stores/authStore"
import { useAuth } from "@/hooks/useAuth"
import { HardHat } from "lucide-react"

export function ProtectedRoute() {
  const token = useAuthStore((s) => s.access_token)
  const { isLoading, usuario } = useAuth()

  if (!token) return <Navigate to="/login" replace />

  if (isLoading && !usuario) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-bg">
        <HardHat className="size-10 animate-bounce text-accent" />
      </div>
    )
  }

  return <Outlet />
}
