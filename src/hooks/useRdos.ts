import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type {
  RDOResponse,
  RDOUpdate,
  RDOVersao,
  StatusRDO,
  MidiaResponse,
  ComentarioResponse,
  AssinaturaResponse,
  TipoComentario,
  PapelAssinatura,
} from "@/lib/types"

interface RDOFilters {
  id_obra?: string
  status?: StatusRDO
  data_inicio?: string
  data_fim?: string
  skip?: number
  limit?: number
}

export function useRdos(filters?: RDOFilters) {
  return useQuery({
    queryKey: ["rdos", filters],
    queryFn: () =>
      api.get<RDOResponse[]>("/rdos", filters as Record<string, unknown>),
  })
}

export function useRdo(id?: string) {
  return useQuery({
    queryKey: ["rdos", id],
    queryFn: () => api.get<RDOResponse>(`/rdos/${id}`),
    enabled: !!id,
  })
}

export function useCreateRdo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { id_obra: string; data_relatorio: string }) =>
      api.post<RDOResponse>("/rdos", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rdos"] }),
  })
}

export function useUpdateRdo(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RDOUpdate) => api.patch<RDOResponse>(`/rdos/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rdos", id] }),
  })
}

export function useDeleteRdo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/rdos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rdos"] }),
  })
}

// ── Workflow ──────────────────────────────────────────────────────
type WorkflowAction =
  | "submeter"
  | "aprovar-externo"
  | "reprovar-externo"
  | "aprovar-suape"
  | "reprovar-suape"
  | "reabrir"
  | "finalizar"

export function useRdoWorkflow(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      action,
      body,
    }: {
      action: WorkflowAction
      body?: unknown
    }) => api.post<RDOResponse>(`/rdos/${id}/${action}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rdos", id] })
      qc.invalidateQueries({ queryKey: ["rdos"] })
      qc.invalidateQueries({ queryKey: ["rdos", id, "versoes"] })
    },
  })
}

// ── Versões ───────────────────────────────────────────────────────
export function useRdoVersoes(id?: string) {
  return useQuery({
    queryKey: ["rdos", id, "versoes"],
    queryFn: () => api.get<RDOVersao[]>(`/rdos/${id}/versoes`),
    enabled: !!id,
  })
}

// ── Mídias ────────────────────────────────────────────────────────
export function useRdoMidias(id?: string) {
  return useQuery({
    queryKey: ["rdos", id, "midias"],
    queryFn: () => api.get<MidiaResponse[]>(`/rdos/${id}/midias`),
    enabled: !!id,
  })
}

export function useUploadMidia(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (form: FormData) =>
      api.postForm<MidiaResponse>(`/rdos/${id}/midias`, form),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["rdos", id, "midias"] }),
  })
}

export function useDeleteMidia(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (mid: string) => api.delete(`/rdos/${id}/midias/${mid}`),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["rdos", id, "midias"] }),
  })
}

// ── Comentários ───────────────────────────────────────────────────
export function useRdoComentarios(id?: string) {
  return useQuery({
    queryKey: ["rdos", id, "comentarios"],
    queryFn: () => api.get<ComentarioResponse[]>(`/rdos/${id}/comentarios`),
    enabled: !!id,
  })
}

export function useCreateComentario(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { conteudo: string; tipo: TipoComentario }) =>
      api.post<ComentarioResponse>(`/rdos/${id}/comentarios`, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["rdos", id, "comentarios"] }),
  })
}

// ── Assinaturas ───────────────────────────────────────────────────
export function useRdoAssinaturas(id?: string) {
  return useQuery({
    queryKey: ["rdos", id, "assinaturas"],
    queryFn: () => api.get<AssinaturaResponse[]>(`/rdos/${id}/assinaturas`),
    enabled: !!id,
  })
}

export function useAssinarRdo(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      senha: string
      papel: PapelAssinatura
      cargo?: string
    }) => api.post<AssinaturaResponse>(`/rdos/${id}/assinar`, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["rdos", id, "assinaturas"] }),
  })
}
