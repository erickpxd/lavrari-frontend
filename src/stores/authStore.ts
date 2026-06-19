import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Usuario } from "@/lib/types"

interface AuthState {
  user: Usuario | null
  access_token: string | null
  refresh_token: string | null
  setTokens: (access: string, refresh: string) => void
  setAccessToken: (access: string) => void
  setUser: (user: Usuario | null) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      access_token: null,
      refresh_token: null,
      setTokens: (access, refresh) =>
        set({ access_token: access, refresh_token: refresh }),
      setAccessToken: (access) => set({ access_token: access }),
      setUser: (user) => set({ user }),
      clear: () =>
        set({ user: null, access_token: null, refresh_token: null }),
    }),
    {
      name: "lavrari-auth",
      partialize: (s) => ({
        user: s.user,
        access_token: s.access_token,
        refresh_token: s.refresh_token,
      }),
    }
  )
)
