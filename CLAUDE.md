# Lavrari Frontend

Sistema de RDO (Relatório Diário de Obra) — Hackathon SUAPE/DINFRA 2026.
Frontend PWA para uso em campo (celular com sol e luva de obra).

## Stack

- **Vite** + **React 18** + **TypeScript** (strict)
- **React Router v6** — roteamento client-side
- **Tailwind CSS** + **shadcn/ui** — componentes base
- **TanStack Query v5** — server state, cache, mutations
- **Zustand** — estado global (auth, tokens)
- **React Hook Form** + **Zod** — formulários
- **Leaflet** + **react-leaflet** — mapas GPS
- **Recharts** — gauge de saúde da obra
- **Lucide React** — ícones
- **vite-plugin-pwa** — PWA offline

## Comandos

```bash
npm run dev       # dev server → http://localhost:5173
npm run build     # build produção
npm run preview   # preview do build
```

O backend FastAPI roda em `http://localhost:8000`.

## API

```
Base URL: http://localhost:8000/lavrari/api/v1
Auth: Authorization: Bearer {access_token}
```

Tokens em `localStorage` via `authStore.ts` (Zustand).
Refresh automático no `lib/api.ts` quando 401.

**Trailing slash — regra exata:**
- COM slash: `/usuarios/`, `/empresas/`, `/obras/`, `/rdos/`, `/alertas/`, `/rdos/{id}/midias/`, `/rdos/{id}/comentarios/`
- SEM slash: tudo mais (`/auth/*`, `/obras/{id}`, `/rdos/{id}`, `/ia/*`, `/admin/dashboard`)

## Enums do backend (valores exatos)

```typescript
StatusRDO     = "rascunho"|"revisao_externa"|"revisao_suape"|"aprovado"|"bloqueado"|"finalizado"
PerfilUsuario = "administrador"|"fiscal_suape"|"fiscal_externo"|"fornecedor"|"consulta"
TipoAlerta    = "saude_critica"|"padrao_nc"|"prazo_em_risco"
SeveridadeAlerta = "baixa"|"media"|"alta"|"critica"
TipoComentario = "comentario"|"parecer"|"solicitacao_correcao"|"ai_sugestao"
AcaoVersao    = "criacao"|"edicao"|"envio_revisao"|"aprovacao_externa"|"reprovacao_externa"|"aprovacao_suape"|"reprovacao_suape"|"reabertura"|"finalizacao"
FonteDado     = "manual"|"transcricao"|"api_clima"
PapelAssinatura = "CONSTRUTORA"|"SUPERVISORA"|"FISCAL_SUAPE"|"FISCAL_EXTERNO"  // UPPERCASE, diferente de PerfilUsuario
```

## Design System

**Fontes:** Poppins (headings, Poppins 500/600/700) + Inter (corpo) + JetBrains Mono (hash, contratos)

**Paleta SUAPE:**
```
--primary:      #003366   azul escuro
--primary-mid:  #004A8F
--primary-light:#0055A4
--accent:       #F5A623   dourado SUAPE
--success:      #16A34A
--warning:      #D97706
--danger:       #DC2626
--background:   #F0F4F9
--dark-bg:      #0A1628   navy profundo (field mode)
```

## Convenções de código

- Componentes: PascalCase, arquivo = nome do componente (`ObraCard.tsx`)
- Hooks: `use` prefix, arquivo `useObraQuery.ts`
- Sem comentários desnecessários — código autoexplicativo
- Sem testes automatizados — testar manualmente no browser
- Sem `any` — tipar tudo com os tipos de `src/lib/types.ts`
- TanStack Query para TODOS os fetches — nada de `useEffect + fetch` manual
- Formulários sempre com React Hook Form + Zod
- Toast `top-center` para sucesso/erro (campo = não alcança bottom)
- Áreas de toque mínimo 56px (uso com luvas)
- Loading: skeleton, não spinner genérico
- Tailwind apenas — sem CSS modules ou styled-components

## Estrutura

```
src/
├── main.tsx
├── App.tsx              ← React Router v6 — todas as rotas
├── pages/
│   ├── Login.tsx
│   ├── Setup.tsx
│   ├── Dashboard.tsx
│   ├── obras/           ObrasList, ObraCreate, ObraDetail
│   ├── rdos/            RDOCreate, RDODetail
│   ├── ia/              Chat
│   └── admin/           Usuarios, Empresas
├── components/
│   ├── ui/              ← shadcn/ui (não editar)
│   ├── rdo/             WorkflowBadge, WorkflowActions, RDOForm, FotoUploader, VoiceInput, AssinaturaModal
│   ├── obra/            HealthGauge, EvolucaoVisual, ObraCard
│   └── shared/          ProtectedRoute, AppLayout, ChatWidget, AlertaBadge
├── lib/
│   ├── api.ts           ← cliente fetch com interceptor de auth
│   ├── types.ts         ← todos os tipos TypeScript do backend
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useGPS.ts        ← navigator.geolocation Promise-based
│   └── useVoice.ts      ← MediaRecorder API
└── stores/
    └── authStore.ts     ← Zustand: user, access_token, refresh_token
```

## Perfis e permissões

- `is_admin === true`: vê sidebar Admin, pode criar obras, gerenciar usuários
- `fiscal_suape`: vê dashboard, saúde, alertas, evolução visual, padrões NC
- `fornecedor`: cria/edita RDOs das suas obras
- `fiscal_externo`: edita RDO apenas com `permissoes_extras.pode_adicionar_info`
- Nunca chamar endpoint restrito sem verificar perfil — evita 403 desnecessário

## Contexto

- FRONTEND_PROMPT.md completo em `../lavrari/FRONTEND_PROMPT.md`
- Backend rodando em `../lavrari/` (FastAPI + MongoDB Atlas)
- OpenAPI disponível em `http://localhost:8000/docs`
