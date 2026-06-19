import { useEmpresas } from "@/hooks/useEmpresas"
import { useAuth } from "@/hooks/useAuth"
import { ObraCard } from "./ObraCard"
import type { Obra } from "@/lib/types"

/**
 * Resolve o nome da empresa contratada (quando o usuário é admin) e repassa
 * para o ObraCard. A saúde da obra é exibida apenas na página de detalhe.
 */
export function ObraCardSmart({
  obra,
  fiscalNome,
  view = "card",
}: {
  obra: Obra
  fiscalNome?: string
  view?: "card" | "list"
}) {
  const { isAdmin } = useAuth()
  const { data: empresas } = useEmpresas(isAdmin)

  const empresa = empresas?.find(
    (e) => e.id_empresa === obra.id_empresa_contratada
  )

  return (
    <ObraCard
      obra={obra}
      fiscalNome={fiscalNome}
      empresaNome={empresa?.razao_social}
      logoUrl={empresa?.logo_url}
      view={view}
    />
  )
}
