# Proposta de endpoint — `POST /ia/estruturar-rdo`

**Para:** time de backend Lavrari
**Origem:** frontend (Hackathon SUAPE/DINFRA 2026)
**Status:** proposta — não implementado no backend

## Problema

Em campo, o fiscal/fornecedor quer **falar uma vez** ("hoje teve 8 pedreiros, 2 serventes,
1 retroescavadeira, concretagem da laje do bloco B, choveu de manhã e parou à tarde…") e a
aplicação **preencher o RDO inteiro** automaticamente.

Hoje a API só oferece:

- `POST /ia/transcricao` → `{ texto }` — voz → texto puro.
- `POST /ia/sugestao-texto` → `{ ocorrencias, resumo_dia }` — apenas 2 campos.

Não existe extração **estruturada** (texto/áudio → RDO completo). O frontend implementou
ditado campo a campo como paliativo, mas o fluxo ideal exige este endpoint.

## Endpoint proposto

```
POST /lavrari/api/v1/ia/estruturar-rdo
Authorization: Bearer {access_token}
```

Aceita **uma** das duas entradas:

### Opção A — texto já transcrito (JSON)

```jsonc
{
  "id_obra": "string",
  "data_relatorio": "2026-06-18",
  "texto": "transcrição livre do dia inteiro…"
}
```

### Opção B — áudio direto (multipart/form-data)

```
arquivo: <audio.webm>      // back transcreve e estrutura em uma chamada
id_obra: string
data_relatorio: 2026-06-18
```

## Resposta — `EstruturarRDOResponse`

Espelha exatamente os campos editáveis do RDO (ver `src/lib/types.ts → RDOUpdate`).
Todos os campos são **opcionais**: a IA preenche só o que conseguiu inferir; o que vier
`null`/ausente o frontend mantém como está (merge, não overwrite).

```jsonc
{
  "clima_manha":   { "tempo": "Chuvoso", "praticavel": false, "fonte": "transcricao" },
  "clima_tarde":   { "tempo": "Nublado", "praticavel": true,  "fonte": "transcricao" },

  "pessoal_direto":   [{ "funcao": "Pedreiro", "quantidade": 8 },
                       { "funcao": "Servente", "quantidade": 2 }],
  "pessoal_indireto": [{ "funcao": "Encarregado", "quantidade": 1 }],

  "equipamentos": [{ "nome": "Retroescavadeira", "quantidade": 1 }],

  "servicos": [{ "descricao": "Concretagem da laje do bloco B",
                 "situacao": "em andamento", "grupo": "Estrutura" }],

  "eventos_restricao": {
    "cronograma_fisico": true,
    "descricao": "Chuva pela manhã interrompeu a concretagem"
  },

  "ocorrencias": "…",
  "resumo_dia":  "…",

  // metadados úteis para UX (opcionais)
  "campos_preenchidos": ["pessoal_direto", "equipamentos", "servicos", "clima_manha"],
  "confianca": 0.82,
  "transcricao": "texto bruto, quando a entrada foi áudio"
}
```

### Notas de contrato

- `fonte` dos blocos de clima deve ser `"transcricao"` (enum `FonteDado` já existente),
  para o frontend exibir o badge "🎤 Voz" e diferenciar de `"api_clima"`.
- `situacao`/`grupo` dos serviços: aceitar texto livre; se houver vocabulário controlado,
  documentar os valores aceitos.
- Idempotente e **sem efeito colateral**: não deve gravar o RDO. O frontend recebe a
  sugestão, faz merge com o formulário e o usuário confirma com o `PATCH /rdos/{id}`
  existente. Isso preserva o fluxo de revisão/assinatura.
- `campos_preenchidos` permite destacar visualmente o que a IA preencheu (revisão rápida).

## Como o frontend consumiria

Substituiria o botão "Sugerir com IA" / "Ditar tudo" no topo do `RDOForm`:

```ts
// hooks/useIA.ts
export function useEstruturarRdo() {
  return useMutation({
    mutationFn: (data: { id_obra: string; data_relatorio: string; texto: string }) =>
      api.post<EstruturarRDOResponse>("/ia/estruturar-rdo", data),
  })
}
```

```ts
// no RDOForm, após gravar o áudio:
const res = await estruturar.mutateAsync({ id_obra, data_relatorio, texto })
for (const [campo, valor] of Object.entries(res)) {
  if (valor != null) setValue(campo as keyof FormValues, valor) // merge
}
toast.success(`IA preencheu ${res.campos_preenchidos?.length ?? 0} campos — confira e salve`)
```

O usuário **revisa** o que foi preenchido e salva — nada é persistido sem confirmação.

## Resumo do esforço

- Backend: 1 endpoint, reusando o pipeline de transcrição existente + um prompt de
  extração estruturada (function calling / JSON mode) com o schema acima.
- Frontend: ~1 hook + trocar o handler do botão de voz no `RDOForm` (pronto para plugar
  assim que o endpoint existir).
