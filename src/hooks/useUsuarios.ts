import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { Usuario } from "@/lib/types"

export function useUsuarios(enabled = true) {
  return useQuery({
    queryKey: ["usuarios"],
    queryFn: () => api.get<Usuario[]>("/usuarios"),
    enabled,
  })
}

export function useCreateUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      nome: string
      email: string
      senha: string
      is_admin?: boolean
    }) => api.post<Usuario>("/usuarios", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["usuarios"] }),
  })
}

export function useUpdateUsuario(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { nome?: string; email?: string }) =>
      api.patch<Usuario>(`/usuarios/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["usuarios"] })
      qc.invalidateQueries({ queryKey: ["auth", "me"] })
    },
  })
}

export function usePromoverAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post(`/usuarios/${id}/promover-admin`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["usuarios"] }),
  })
}
