import { useObraDashboard } from "@/hooks/useObras"
import { useSaudeObra } from "@/hooks/useIA"
import { useObraPerfil } from "@/hooks/useObraPerfil"
import { useEmpresas } from "@/hooks/useEmpresas"
import { useAuth } from "@/hooks/useAuth"
import { ObraCard } from "./ObraCard"
import type { Obra } from "@/lib/types"

/**
 * ObraCard que busca dashboard + saúde quando o usuário tem permissão
 * (admin ou fiscal_suape na obra). Para outros perfis, exibe o card simples.
 */
export function ObraCardSmart({
  obra,
  fiscalNome,
}: {
  obra: Obra
  fiscalNome?: string
}) {
  const { isAdmin } = useAuth()
  const { podeVerSaude } = useObraPerfil(obra.id_obra)
  const { data: dashboard } = useObraDashboard(obra.id_obra, podeVerSaude)
  const { data: saude } = useSaudeObra(obra.id_obra, podeVerSaude)
  const { data: empresas } = useEmpresas(isAdmin)

  const empresa = empresas?.find(
    (e) => e.id_empresa === obra.id_empresa_contratada
  )

  return (
    <ObraCard
      obra={obra}
      score={saude?.score}
      classificacao={saude?.classificacao}
      percentualPrazo={dashboard?.percentual_prazo}
      totalRdos={dashboard?.total_rdos}
      alertas={dashboard?.total_alertas_abertos}
      fiscalNome={fiscalNome}
      logoUrl={empresa?.logo_url}
      empresaNome={empresa?.razao_social}
    />
  )
}
