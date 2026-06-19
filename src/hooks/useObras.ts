import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type {
  Obra,
  ObraCreate,
  ObraDashboard,
  ObraUsuarioVinculo,
  PermissoesExtras,
  PerfilUsuario,
  LogoSlotObra,
  MapaEvidencias,
  Alerta,
} from "@/lib/types"

export function useObras() {
  return useQuery({
    queryKey: ["obras"],
    queryFn: () => api.get<Obra[]>("/obras", { skip: 0, limit: 100 }),
  })
}

export function useObra(id?: string) {
  return useQuery({
    queryKey: ["obras", id],
    queryFn: () => api.get<Obra>(`/obras/${id}`),
    enabled: !!id,
  })
}

export function useObraDashboard(id?: string, enabled = true) {
  return useQuery({
    queryKey: ["obras", id, "dashboard"],
    queryFn: () => api.get<ObraDashboard>(`/obras/${id}/dashboard`),
    enabled: !!id && enabled,
  })
}

export function useObraUsuarios(id?: string) {
  return useQuery({
    queryKey: ["obras", id, "usuarios"],
    queryFn: () => api.get<ObraUsuarioVinculo[]>(`/obras/${id}/usuarios`),
    enabled: !!id,
  })
}

export function useMapaEvidencias(id?: string) {
  return useQuery({
    queryKey: ["obras", id, "mapa-evidencias"],
    queryFn: () => api.get<MapaEvidencias>(`/obras/${id}/mapa-evidencias`),
    enabled: !!id,
  })
}

export function useObraAlertas(id?: string, enabled = true) {
  return useQuery({
    queryKey: ["obras", id, "alertas"],
    queryFn: () => api.get<Alerta[]>(`/obras/${id}/alertas`),
    enabled: !!id && enabled,
  })
}

export function useCreateObra() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ObraCreate) => api.post<Obra>("/obras", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["obras"] }),
  })
}

export function useUpdateObra(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<ObraCreate>) =>
      api.patch<Obra>(`/obras/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["obras", id] })
      qc.invalidateQueries({ queryKey: ["obras"] })
    },
  })
}

export function useVincularUsuario(obraId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      id_usuario: string
      perfil: string
      permissoes_extras?: PermissoesExtras
    }) => api.post(`/obras/${obraId}/usuarios`, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["obras", obraId, "usuarios"] }),
  })
}

export function useDesvincularUsuario(obraId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (uid: string) => api.delete(`/obras/${obraId}/usuarios/${uid}`),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["obras", obraId, "usuarios"] }),
  })
}

export interface EvolucaoVisualResponse {
  ponto: { lat: number; lon: number }
  raio_metros: number
  total_fotos: number
  evolucao: { data: string; fotos: import("@/lib/types").MidiaResponse[] }[]
}

export function useEvolucaoVisual(
  obraId: string,
  params: { lat?: number; lon?: number; raio_metros?: number; data_inicio?: string; data_fim?: string },
  enabled: boolean
) {
  return useQuery({
    queryKey: ["obras", obraId, "evolucao", params],
    queryFn: () =>
      api.get<EvolucaoVisualResponse>(`/obras/${obraId}/evolucao-visual`, params),
    enabled: enabled && !!obraId && params.lat != null && params.lon != null,
  })
}

export function useUpdatePermissoes(obraId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: PermissoesExtras }) =>
      api.patch(`/obras/${obraId}/usuarios/${uid}/permissoes`, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["obras", obraId, "usuarios"] }),
  })
}

export function useUpdatePerfilObra(obraId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ uid, perfil }: { uid: string; perfil: PerfilUsuario }) =>
      api.patch(`/obras/${obraId}/usuarios/${uid}`, { perfil }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["obras", obraId, "usuarios"] }),
  })
}

export function useUploadObraLogo(obraId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ slot, file }: { slot: LogoSlotObra; file: File }) => {
      const fd = new FormData()
      fd.append("arquivo", file)
      return api.postForm<Obra>(`/obras/${obraId}/logos/${slot}`, fd)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["obras", obraId] })
      qc.invalidateQueries({ queryKey: ["obras"] })
    },
  })
}
