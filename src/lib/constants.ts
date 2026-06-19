import type {
  StatusRDO,
  SeveridadeAlerta,
  TipoAlerta,
  PapelAssinatura,
  PerfilUsuario,
  FonteDado,
  TipoComentario,
} from "./types"

export const STATUS_RDO: Record<
  StatusRDO,
  { label: string; badge: string; dot: string }
> = {
  rascunho: {
    label: "Rascunho",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  },
  revisao_externa: {
    label: "Revisão Externa",
    badge: "bg-blue-100 text-blue-800 border-blue-200 animate-pulse",
    dot: "bg-blue-500",
  },
  revisao_suape: {
    label: "Revisão SUAPE",
    badge: "bg-purple-100 text-purple-800 border-purple-200 animate-pulse",
    dot: "bg-purple-500",
  },
  aprovado: {
    label: "Aprovado",
    badge: "bg-green-100 text-green-800 border-green-200",
    dot: "bg-green-500",
  },
  bloqueado: {
    label: "Bloqueado",
    badge: "bg-orange-100 text-orange-800 border-orange-200",
    dot: "bg-orange-500",
  },
  finalizado: {
    label: "Finalizado",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-600",
  },
}

// Ordem do pipeline de workflow
export const PIPELINE_ORDER: StatusRDO[] = [
  "rascunho",
  "revisao_externa",
  "revisao_suape",
  "aprovado",
  "bloqueado",
  "finalizado",
]

export const SEVERIDADE: Record<
  SeveridadeAlerta,
  { label: string; badge: string }
> = {
  baixa: { label: "Baixa", badge: "bg-blue-100 text-blue-800 border-blue-200" },
  media: {
    label: "Média",
    badge: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  alta: {
    label: "Alta",
    badge: "bg-orange-100 text-orange-800 border-orange-200",
  },
  critica: {
    label: "Crítica",
    badge: "bg-red-100 text-red-800 border-red-200 animate-pulse",
  },
}

export const TIPO_ALERTA: Record<TipoAlerta, string> = {
  saude_critica: "Saúde Crítica",
  padrao_nc: "Padrão de NC",
  prazo_em_risco: "Prazo em Risco",
}

export const PAPEL_ASSINATURA: Record<PapelAssinatura, string> = {
  CONSTRUTORA: "Construtora",
  SUPERVISORA: "Supervisora",
  FISCAL_SUAPE: "Fiscal SUAPE",
  FISCAL_EXTERNO: "Fiscal Externo",
}

export const PERFIL_USUARIO: Record<PerfilUsuario, string> = {
  administrador: "Administrador",
  fiscal_suape: "Fiscal SUAPE",
  fiscal_externo: "Fiscal Externo",
  fornecedor: "Fornecedor",
  consulta: "Consulta",
}

export const FONTE_DADO: Record<
  FonteDado,
  { label: string; badge: string }
> = {
  manual: { label: "Manual", badge: "bg-slate-100 text-slate-700" },
  transcricao: { label: "🎤 Voz", badge: "bg-blue-100 text-blue-700" },
  api_clima: { label: "🌤️ Automático", badge: "bg-green-100 text-green-700" },
}

export const TIPO_COMENTARIO: Record<
  TipoComentario,
  { label: string; badge: string }
> = {
  comentario: { label: "Comentário", badge: "bg-slate-100 text-slate-700" },
  parecer: { label: "Parecer", badge: "bg-blue-100 text-blue-700" },
  solicitacao_correcao: {
    label: "Solicitação de Correção",
    badge: "bg-orange-100 text-orange-700",
  },
  ai_sugestao: { label: "Sugestão IA", badge: "bg-purple-100 text-purple-700" },
}

export const EVENTOS_RESTRICAO_FLAGS = [
  { key: "pessoal", label: "Pessoal", icon: "Users" },
  { key: "equipamento", label: "Equipamento", icon: "Wrench" },
  { key: "instalacoes", label: "Instalações", icon: "Building" },
  { key: "cronograma_fisico", label: "Cronograma Físico", icon: "Calendar" },
  { key: "qualidade", label: "Qualidade", icon: "CheckSquare" },
  {
    key: "atendimento_fiscalizacao",
    label: "Atend. Fiscalização",
    icon: "ClipboardList",
  },
  { key: "administracao_obra", label: "Adm. da Obra", icon: "HardHat" },
  { key: "meio_ambiente", label: "Meio Ambiente", icon: "Leaf" },
] as const
