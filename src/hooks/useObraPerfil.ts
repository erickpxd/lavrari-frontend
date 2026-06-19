import { useObraUsuarios } from "./useObras"
import { useAuth } from "./useAuth"
import type { PerfilUsuario } from "@/lib/types"

/**
 * Deriva o perfil do usuário autenticado em uma obra específica
 * a partir dos vínculos. Necessário porque /auth/me só expõe is_admin.
 */
export function useObraPerfil(obraId?: string): {
  perfil: PerfilUsuario | null
  isFiscalSuape: boolean
  podeVerSaude: boolean
  podeAdicionarInfo: boolean
  podeComentarExtra: boolean
  isLoading: boolean
} {
  const { usuario, isAdmin } = useAuth()
  const { data: vinculos, isLoading } = useObraUsuarios(obraId)

  const vinculo = vinculos?.find((v) => v.id_usuario === usuario?.id_usuario)
  const perfil = isAdmin ? "administrador" : (vinculo?.perfil ?? null)
  const isFiscalSuape = perfil === "fiscal_suape"
  const extras = vinculo?.permissoes_extras

  return {
    perfil,
    isFiscalSuape,
    podeVerSaude: isAdmin || isFiscalSuape,
    podeAdicionarInfo: extras?.pode_adicionar_info === true,
    podeComentarExtra: extras?.pode_comentar === true,
    isLoading,
  }
}
