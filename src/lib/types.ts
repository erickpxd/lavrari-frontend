// Enums — valores exatos do backend (lowercase exceto papel da assinatura)
export type StatusRDO =
  | "rascunho"
  | "revisao_externa"
  | "revisao_suape"
  | "aprovado"
  | "bloqueado"
  | "finalizado"

export type PerfilUsuario =
  | "administrador"
  | "fiscal_suape"
  | "fiscal_externo"
  | "fornecedor"
  | "consulta"

export type TipoAlerta = "saude_critica" | "padrao_nc" | "prazo_em_risco"

export type SeveridadeAlerta = "baixa" | "media" | "alta" | "critica"

export type TipoComentario =
  | "comentario"
  | "parecer"
  | "solicitacao_correcao"
  | "ai_sugestao"

export type AcaoVersao =
  | "criacao"
  | "edicao"
  | "envio_revisao"
  | "aprovacao_externa"
  | "reprovacao_externa"
  | "aprovacao_suape"
  | "reprovacao_suape"
  | "reabertura"
  | "finalizacao"

export type FonteDado = "manual" | "transcricao" | "api_clima"

// ⚠️ AssinarRequest.papel usa UPPERCASE diferente de PerfilUsuario
export type PapelAssinatura =
  | "CONSTRUTORA"
  | "SUPERVISORA"
  | "FISCAL_SUAPE"
  | "FISCAL_EXTERNO"

// ── Auth / Usuário ───────────────────────────────────────────────
export interface Usuario {
  id_usuario: string
  nome: string
  email: string
  is_admin: boolean
  criado_em: string
  atualizado_em: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type?: string
}

// ── Empresa ──────────────────────────────────────────────────────
export interface Empresa {
  id_empresa: string
  razao_social: string
  cnpj: string
  logo_url?: string | null
  criado_em?: string
  atualizado_em?: string
}

// ── Obra ─────────────────────────────────────────────────────────
export interface ResponsavelObra {
  nome: string
  art?: string | null
  cargo?: string | null
  documento?: string | null
}

// Slots de logo do cabeçalho dos documentos da obra.
export type LogoSlotObra = "suape" | "contratada" | "fiscalizacao_externa"

export interface Obra {
  id_obra: string
  numero_contrato: string
  objeto_contratual: string
  tipologia: string
  local_descricao: string
  latitude_obra?: number | null
  longitude_obra?: number | null
  endereco?: string | null
  id_empresa_contratada: string
  id_empresa_supervisora?: string | null
  id_fiscal_suape: string
  art_fiscal_suape?: string | null
  id_fiscal_externo?: string | null
  art_fiscal_externo?: string | null
  responsaveis?: ResponsavelObra[]
  data_inicio_vigencia: string
  data_fim_vigencia: string
  data_inicio_execucao: string
  data_fim_execucao: string
  prazo_contratual_dias: number
  logo_suape_url?: string | null
  logo_contratada_url?: string | null
  logo_fiscalizacao_externa_url?: string | null
  criado_em?: string
  atualizado_em?: string
}

export interface ObraCreate {
  numero_contrato: string
  objeto_contratual: string
  tipologia: string
  local_descricao: string
  latitude_obra?: number | null
  longitude_obra?: number | null
  id_empresa_contratada: string
  id_empresa_supervisora?: string | null
  id_fiscal_suape: string
  art_fiscal_suape?: string | null
  id_fiscal_externo?: string | null
  art_fiscal_externo?: string | null
  responsaveis?: ResponsavelObra[]
  data_inicio_vigencia: string
  data_fim_vigencia: string
  data_inicio_execucao: string
  data_fim_execucao: string
  prazo_contratual_dias: number
  logo_suape_url?: string | null
  logo_contratada_url?: string | null
  logo_fiscalizacao_externa_url?: string | null
}

export interface VinculoUsuario {
  id_obra_usuario: string
  id_obra: string
  numero_contrato?: string | null
  objeto_contratual?: string | null
  perfil: PerfilUsuario
  permissoes_extras?: PermissoesExtras | null
  permissoes_ativas?: string[]
  expira_em?: string | null
  criado_em: string
  atualizado_em: string
}

export interface StatusDetalhe {
  status: string
  label: string
  quantidade: number
}

export interface EvidenciaMapa {
  id_midia: string
  id_rdo: string
  numero_registro?: number | null
  data_relatorio?: string | null
  latitude: number
  longitude: number
  endereco?: string | null
  storage_url: string
  data_hora_captura?: string | null
  ai_analise?: string | null
}

export interface MapaEvidencias {
  id_obra: string
  centro: { lat?: number | null; lon?: number | null }
  total: number
  evidencias: EvidenciaMapa[]
}

export interface ObraDashboard {
  id_obra: string
  total_rdos: number
  rdos_por_status: Record<string, number>
  dias_decorridos: number
  prazo_contratual_dias: number
  percentual_prazo: number
  total_alertas_abertos: number
}

export interface ObraUsuarioVinculo {
  id_usuario: string
  perfil: PerfilUsuario
  nome?: string
  email?: string
  permissoes_extras?: PermissoesExtras | null
}

export interface PermissoesExtras {
  pode_adicionar_info?: boolean
  pode_comentar?: boolean
  pode_enviar_suape?: boolean
  expira_em?: string | null
}

// ── RDO ──────────────────────────────────────────────────────────
export interface CondicaoClimatica {
  tempo: string
  praticavel: boolean
  fonte: FonteDado
}

export interface EventosRestricao {
  pessoal: boolean
  equipamento: boolean
  instalacoes: boolean
  cronograma_fisico: boolean
  qualidade: boolean
  atendimento_fiscalizacao: boolean
  administracao_obra: boolean
  meio_ambiente: boolean
  descricao?: string | null
}

export interface ItemPessoal {
  funcao: string
  quantidade: number
}

export interface Equipamento {
  nome: string
  quantidade: number
}

export interface Servico {
  descricao: string
  situacao: string
  grupo?: string | null
}

export interface RDOResponse {
  id_rdo: string
  id_obra: string
  numero_registro: number
  data_relatorio: string
  status: StatusRDO
  clima_manha?: CondicaoClimatica | null
  clima_tarde?: CondicaoClimatica | null
  pessoal_direto?: ItemPessoal[] | null
  pessoal_indireto?: ItemPessoal[] | null
  equipamentos?: Equipamento[] | null
  servicos?: Servico[] | null
  eventos_restricao?: EventosRestricao | null
  ocorrencias?: string | null
  resumo_dia?: string | null
  aprovado_em?: string | null
  enviado_em?: string | null
  criado_por: string
  criado_em: string
  atualizado_em: string
}

export type RDOUpdate = Partial<
  Pick<
    RDOResponse,
    | "clima_manha"
    | "clima_tarde"
    | "pessoal_direto"
    | "pessoal_indireto"
    | "equipamentos"
    | "servicos"
    | "eventos_restricao"
    | "ocorrencias"
    | "resumo_dia"
  >
>

export interface RDOVersao {
  versao: number
  acao: AcaoVersao
  criado_por: string
  criado_por_nome?: string
  criado_em: string
  justificativa?: string | null
  snapshot?: RDOResponse
}

// ── Mídia ────────────────────────────────────────────────────────
export interface MidiaResponse {
  id_midia: string
  id_rdo: string
  tipo: "foto"
  storage_url: string
  latitude: number
  longitude: number
  data_hora_captura: string
  ai_analise?: string | null
  criado_por: string
  criado_em: string
  atualizado_em: string
}

// ── Comentário ───────────────────────────────────────────────────
export interface ComentarioResponse {
  id_comentario: string
  id_rdo: string
  id_usuario: string
  conteudo: string
  tipo: TipoComentario
  criado_em: string
}

// ── Assinatura ───────────────────────────────────────────────────
export interface AssinaturaResponse {
  id_assinatura: string
  id_rdo: string
  versao_rdo: number
  nome_completo: string
  email: string
  cargo?: string | null
  papel: PapelAssinatura
  hash_documento: string
  pdf_url: string
  criado_em: string
}

// ── Alertas ──────────────────────────────────────────────────────
export interface Alerta {
  id_alerta: string
  id_obra: string
  tipo: TipoAlerta
  severidade: SeveridadeAlerta
  titulo?: string
  mensagem?: string
  descricao?: string
  lido: boolean
  criado_em: string
}

// ── IA ───────────────────────────────────────────────────────────
export interface SaudeObra {
  id_obra: string
  score: number
  classificacao: string
  breakdown: Record<string, number>
  rdos_analisados: number
  periodo: string
}

export interface PadraoNC {
  descricao: string
  severidade: SeveridadeAlerta
  ocorrencias: number
  recomendacao: string
}

export interface PadroesNCResponse {
  id_obra: string
  rdos_analisados: number
  gerado_em: string
  padroes_detectados: PadraoNC[]
}

export interface SugestaoTexto {
  ocorrencias: string
  resumo_dia: string
}

// Resposta de POST /ia/estruturar-rdo — todos os campos opcionais (merge no form).
export interface EstruturarRDOResponse {
  clima_manha?: CondicaoClimatica | null
  clima_tarde?: CondicaoClimatica | null
  pessoal_direto?: ItemPessoal[] | null
  pessoal_indireto?: ItemPessoal[] | null
  equipamentos?: Equipamento[] | null
  servicos?: Servico[] | null
  eventos_restricao?: Partial<EventosRestricao> | null
  ocorrencias?: string | null
  resumo_dia?: string | null
  campos_preenchidos?: string[]
  confianca?: number
  transcricao?: string
}

export interface ChatMensagem {
  role: "user" | "assistant"
  content: string
}

export interface ChatResponse {
  resposta: string
  tools_usadas: string[]
}

// ── Admin ────────────────────────────────────────────────────────
export interface AdminDashboard {
  obras: { cadastradas: number; os_cadastradas: number }
  rdos: {
    cadastrados: number
    pendentes_correcao: number
    aprovados_finalizados: number
    bloqueados: number
    com_fiscal_externo: number
    com_restricao: number
    por_status: Record<string, number>
    status_detalhado: StatusDetalhe[]
  }
  evidencias: { cadastradas: number; questionadas: number }
  assinaturas: { aplicadas: number; invalidas: number }
  auditoria: { eventos: number; reaberturas: number }
  conformidade: {
    nao_conformidades_abertas: number
    eventos_com_restricao: number
  }
}
