import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAuthStore } from "@/stores/authStore"
import type { Usuario } from "@/lib/types"

export function useAuth() {
  const { access_token, user, setUser, clear, refresh_token } = useAuthStore()

  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const me = await api.get<Usuario>("/auth/me")
      setUser(me)
      return me
    },
    enabled: !!access_token,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  async function logout() {
    try {
      if (refresh_token) await api.post("/auth/logout", { refresh_token })
    } catch {
      // ignore
    } finally {
      clear()
      window.location.href = "/login"
    }
  }

  const usuario = query.data ?? user

  return {
    usuario,
    isAdmin: usuario?.is_admin === true,
    isAuthenticated: !!access_token,
    isLoading: query.isLoading,
    logout,
  }
}
