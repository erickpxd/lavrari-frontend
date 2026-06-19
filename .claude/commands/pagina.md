---
description: Scaffolda página completa com data fetching e layout
argument-hint: [rota, ex: /obras/:id ou /dashboard]
allowed-tools: Read, Write, Edit, Bash
---

Crie a página para a rota `$ARGUMENTS` do projeto Lavrari.

## Antes de criar

Leia estes arquivos para entender o contexto atual:
- `src/App.tsx` — rotas existentes
- `src/components/shared/AppLayout.tsx` — layout base
- `src/lib/types.ts` — tipos disponíveis
- `src/hooks/` — hooks de data fetching já criados
- A pasta `src/pages/` correspondente se já existir

## O que uma página deve ter

1. **Loading state**: skeleton cards/linhas — NUNCA spinner genérico
2. **Error state**: mensagem clara com botão de retry (`refetch`)
3. **Empty state**: mensagem direcionada à ação ("Nenhuma obra. Criar primeira obra →")
4. **Data state**: conteúdo real
5. **Autenticação**: não buscar dados sem verificar token — usar `useAuth()`

## Padrão de página

```tsx
export function NomePagina() {
  const { data, isLoading, isError, refetch } = useNomeQuery()

  if (isLoading) return <NomePaginaSkeleton />
  if (isError)   return <ErrorState onRetry={refetch} />

  return (
    <div className="...">
      {/* conteúdo */}
    </div>
  )
}
```

## Controle de acesso por perfil

```typescript
const { usuario } = useAuth()
const isAdmin = usuario?.is_admin === true
const isFiscalSuape = perfil === "fiscal_suape"  // verificar via ObraUsuario

// Esconder seções por perfil — não apenas desabilitar botões
// Ex: gauge de saúde só para admin|fiscal_suape
```

## Design obrigatório

- Mobile-first — testar layout em 375px de largura
- Poppins para headings (class `font-display`)
- Cores SUAPE: `#003366` primário, `#F5A623` acento
- Áreas de toque mínimo 56px (campo com luvas)
- Toast `top-center` (não bottom) para feedback

## Perfis Lavrari (PerfilUsuario enum — lowercase)

```
"administrador" | "fiscal_suape" | "fiscal_externo" | "fornecedor" | "consulta"
```

## Entregue

- Arquivo da página em `src/pages/[caminho].tsx`
- Skeleton component inline ou separado se complexo
- Atualização de `src/App.tsx` se a rota ainda não estiver registrada
