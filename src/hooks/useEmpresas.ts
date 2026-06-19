import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { Empresa } from "@/lib/types"

export function useEmpresas(enabled = true) {
  return useQuery({
    queryKey: ["empresas"],
    queryFn: () => api.get<Empresa[]>("/empresas"),
    enabled,
  })
}

export function useCreateEmpresa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      razao_social: string
      cnpj: string
      logo_url?: string
    }) => api.post<Empresa>("/empresas", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["empresas"] }),
  })
}

export function useUpdateEmpresa(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Empresa>) =>
      api.patch<Empresa>(`/empresas/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["empresas"] }),
  })
}
