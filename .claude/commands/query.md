---
description: Cria hook TanStack Query para endpoint da API Lavrari
argument-hint: [endpoint ou recurso, ex: obras, rdos/{id}/midias]
allowed-tools: Read, Write, Edit
---

Crie um hook TanStack Query v5 para o recurso `$ARGUMENTS` da API Lavrari.

## Contexto da API

```
Base URL: http://localhost:8000/lavrari/api/v1
Auth: Authorization: Bearer {access_token}  (injetado pelo lib/api.ts)
```

**Trailing slash — obrigatório para collections:**
`/usuarios/`, `/empresas/`, `/obras/`, `/rdos/`, `/alertas/`, `/rdos/{id}/midias/`, `/rdos/{id}/comentarios/`

Tudo mais: sem trailing slash.

## Antes de criar

Leia os arquivos existentes:
- `src/lib/api.ts` — como o cliente HTTP está configurado
- `src/lib/types.ts` — tipos disponíveis
- `src/hooks/` — hooks já existentes para evitar duplicata

## Padrão de hooks a seguir

```typescript
// Query (GET) — retorna dados
export function useObras(params?: { skip?: number; limit?: number }) {
  return useQuery({
    queryKey: ['obras', params],
    queryFn: () => api.get<ObraResponse[]>('/obras/', params),
  })
}

// Mutation (POST/PATCH/DELETE) — modifica dados
export function useCriarObra() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dados: ObraCreate) => api.post<ObraResponse>('/obras/', dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obras'] })
    },
  })
}
```

## Regras obrigatórias

- TanStack Query v5 — usar `useQuery`, `useMutation`, `useQueryClient`
- `queryKey` sempre array com recurso + parâmetros variáveis
- `onSuccess` em mutations: invalidar as queries relacionadas
- Tipos explícitos em todos os retornos — sem `any`
- Arquivo em `src/hooks/use[NomeRecurso].ts`
- Exportação nomeada, não default

## Entregue

O hook completo em `src/hooks/` com todos os casos de uso do endpoint (listar, buscar por ID, criar, atualizar, deletar — o que for aplicável).
