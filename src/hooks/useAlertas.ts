import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { Alerta, AdminDashboard } from "@/lib/types"

export function useAlertas() {
  return useQuery({
    queryKey: ["alertas"],
    queryFn: () => api.get<Alerta[]>("/alertas"),
  })
}

export function useMarcarLido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch(`/alertas/${id}/lido`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alertas"] }),
  })
}

export function useAdminDashboard(enabled = true) {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => api.get<AdminDashboard>("/admin/dashboard"),
    enabled,
  })
}
