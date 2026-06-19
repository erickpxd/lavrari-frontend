# Lavrari — Frontend

Sistema de **RDO (Relatório Diário de Obra)** desenvolvido para o Hackathon
**SUAPE / DINFRA 2026**. PWA pensado para uso em campo (celular, sob sol e com
luva de obra): áreas de toque grandes, modo offline e captura de evidências
georreferenciadas.

> Marca: **Laurari** · Paleta terracota/marrom · Fonte Poppins + Inter.

---

## ✨ Principais funcionalidades

- **Onboarding** de 3 passos + **splash** com motion logo na primeira carga.
- **Autenticação** (login, refresh automático de token, logout) via Zustand.
- **Dashboard** com métricas, gráfico de RDOs por status (donut) e "Pendências
  do dia" (alertas gerados por IA).
- **Obras**: listagem (cards/lista), detalhe com abas (Visão geral, RDOs,
  Mapa de evidências, Usuários, Logos, Evolução visual, Alertas, Padrões NC,
  Dossiê), saúde da obra e responsáveis técnicos.
- **RDOs**: criação por formulário ou **por voz/IA** (transcrição + estruturação),
  workflow completo (rascunho → revisão externa/SUAPE → aprovação → assinatura),
  histórico de versões e geração de PDF.
- **Fotos georreferenciadas**: leitura de EXIF (data + GPS); sem GPS, o usuário
  marca o local num mapa. Mídias carregadas com fallback autenticado.
- **Mapa 3D** (Cesium) de evidências e mapa 2D (Leaflet) de pins.
- **Assistente de IA** (chat) com acesso aos dados reais das obras.
- **Administração**: usuários (cargos por obra + promover admin), empresas e
  upload de logos (empresa e obra, incl. fiscalização externa).
- **PWA** com service worker (offline básico) e ícones da marca.

---

## 🧱 Stack

- **Vite** + **React 18** + **TypeScript** (strict)
- **React Router v6** — roteamento client-side
- **Tailwind CSS** + **shadcn/ui** — UI
- **TanStack Query v5** — server state, cache e mutations
- **Zustand** — estado global (auth/tokens)
- **React Hook Form** + **Zod** — formulários e validação
- **Leaflet** / **react-leaflet** + **Cesium** / **resium** — mapas 2D/3D
- **Recharts** — gráficos
- **exifr** — leitura de metadados EXIF das fotos
- **Lucide React** — ícones · **sonner** — toasts
- **vite-plugin-pwa** — PWA offline

---

## 🚀 Como rodar

Pré-requisitos: **Node 18+** e npm.

```bash
npm install        # instala dependências
npm run dev        # dev server → http://localhost:5173
```

O backend (FastAPI) é consumido pela URL configurada em `src/lib/api.ts`
(`BASE`). Por padrão aponta para o ambiente de nuvem do projeto.

### Scripts

```bash
npm run dev        # servidor de desenvolvimento
npm run build      # build de produção (tsc -b && vite build)
npm run preview    # serve o build de produção localmente
npm run lint       # checagem de tipos (tsc --noEmit)
```

### Variáveis de ambiente

Crie um `.env` (veja `.env.example`):

```bash
# Token do Cesium Ion para o globo 3D com relevo/imagery premium.
# Opcional — sem ele o mapa 3D funciona com OpenStreetMap (sem relevo).
VITE_CESIUM_ION_ACCESS_TOKEN=
```

> Apenas variáveis com prefixo `VITE_` são expostas ao cliente.

---

## 🔌 API

```
Base URL: definida em src/lib/api.ts (BASE)
Auth:     Authorization: Bearer {access_token}
```

- Tokens ficam no `localStorage` via `stores/authStore.ts`.
- Refresh automático no `lib/api.ts` ao receber `401`.
- **Trailing slash** é normalizado automaticamente: coleções como
  `/usuarios/`, `/empresas/`, `/obras/`, `/rdos/`, `/alertas/`,
  `/rdos/{id}/midias/`, `/rdos/{id}/comentarios/` usam barra final; o resto não.
- `mediaUrl()` normaliza URLs de mídia (caminhos relativos + força https) e o
  componente `AuthImage` faz fallback autenticado para imagens protegidas.

---

## 📁 Estrutura

```
src/
├── main.tsx
├── App.tsx                 ← rotas (React Router) + splash
├── pages/
│   ├── Login.tsx · Onboarding.tsx · Setup.tsx · Dashboard.tsx · Perfil.tsx
│   ├── obras/   ObrasList · ObraCreate · ObraDetail
│   ├── rdos/    RDOCreate · RDODetail
│   ├── ia/      Chat
│   └── admin/   Usuarios · Empresas
├── components/
│   ├── ui/      shadcn/ui (base — não editar)
│   ├── rdo/     RDOForm · WorkflowActions · FotoUploader · VoiceInput · AssinaturaModal …
│   ├── obra/    HealthGauge · EvolucaoVisual · CesiumGlobe · MapaEvidencias · LogoUploader · ObraCard …
│   └── shared/  AppLayout · ProtectedRoute · Splash · ChatPanel · AuthImage · MapPicker …
├── hooks/       useAuth · useObras · useRdos · useUsuarios · useEmpresas · useIA · useGPS · useVoice …
├── lib/         api.ts · types.ts · utils.ts · constants.ts · photoMeta.ts
└── stores/      authStore.ts
```

---

## 👥 Perfis e permissões

- **Admin global** (`is_admin`): sidebar Admin, cria obras, gerencia usuários e empresas.
- **fiscal_suape**: dashboard, saúde, alertas, evolução visual, padrões NC.
- **fornecedor**: cria/edita RDOs das suas obras.
- **fiscal_externo**: edita/contribui conforme permissões temporárias
  (`pode_adicionar_info`, `pode_comentar`, `pode_enviar_suape`, com expiração).
- **consulta**: somente leitura.

Os cargos (exceto admin) são **por obra** — atribuídos na tela de Usuários
("Cargos") ou na aba Usuários da obra.

---

## 🎨 Design system

- **Fontes:** Poppins (títulos) · Inter (corpo) · JetBrains Mono (hashes/contratos)
- **Paleta:**

| Token                 | Cor        | Uso                                   |
| --------------------- | ---------- | ------------------------------------- |
| `--color-primary-500` | `#8C4128`  | Marrom — marca, títulos, destaques    |
| `--color-primary-200` | `#D56644`  | Terracota — estados secundários/hover |
| `--color-secondary`   | `#FFB76F`  | Pêssego — fundos suaves, badges       |
| `--color-yellow`      | `#FBB315`  | Amarelo — botões preenchidos          |
| `--color-background`  | `#FAF8F4`  | Fundo off-white do app                |

Botões preenchidos: fundo `#FBB315` com texto/ícone `#8C4128`.

---

## 🛠️ Convenções

- Componentes em PascalCase (arquivo = nome do componente).
- TanStack Query para **todos** os fetches (sem `useEffect + fetch`).
- Formulários com React Hook Form + Zod.
- Sem `any` — tipar com `src/lib/types.ts`.
- Tailwind apenas (sem CSS modules/styled-components).
- Toasts `top-center`; áreas de toque mínimas de 56px; loading com skeleton.

---

## ⚠️ Notas da POC

- A tela de login tem o botão **"Usar usuário de teste"** com credenciais fixas
  para a demonstração — **remover antes de produção**.
- O manifest PWA e ícones usam a marca; favicon = `simbolo-icon.png`.
