import { useQuery, useMutation } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type {
  SaudeObra,
  PadroesNCResponse,
  SugestaoTexto,
  EstruturarRDOResponse,
  ChatMensagem,
  ChatResponse,
} from "@/lib/types"

export function useSaudeObra(idObra?: string, enabled = true) {
  return useQuery({
    queryKey: ["ia", "saude", idObra],
    queryFn: () => api.get<SaudeObra>(`/ia/saude-obra/${idObra}`),
    enabled: !!idObra && enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePadroesNC(idObra?: string, enabled = true) {
  return useQuery({
    queryKey: ["ia", "padroes-nc", idObra],
    queryFn: () => api.get<PadroesNCResponse>(`/ia/padroes-nc/${idObra}`),
    enabled: !!idObra && enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useSugestaoTexto() {
  return useMutation({
    mutationFn: (data: { id_obra: string; data_relatorio: string }) =>
      api.post<SugestaoTexto>("/ia/sugestao-texto", data),
  })
}

export function useEstruturarRdo() {
  return useMutation({
    mutationFn: (data: {
      id_obra: string
      data_relatorio: string
      texto: string
    }) => api.post<EstruturarRDOResponse>("/ia/estruturar-rdo", data),
  })
}

export function useChat() {
  return useMutation({
    mutationFn: (data: { mensagem: string; historico: ChatMensagem[] }) =>
      api.post<ChatResponse>("/ia/chat", data),
  })
}
