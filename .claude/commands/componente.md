---
description: Cria componente React com padrões Lavrari
argument-hint: [NomeComponente] [descrição do que faz]
allowed-tools: Read, Write, Edit, Bash
---

Crie o componente React `$ARGUMENTS` seguindo os padrões do projeto Lavrari.

## Regras obrigatórias

- TypeScript strict — tipar todas as props com interface
- Tailwind CSS apenas — sem CSS inline ou módulos
- Lucide React para ícones — nenhum emoji como ícone funcional
- shadcn/ui para primitivos (Button, Dialog, Card, Badge, etc.)
- Sem comentários óbvios — só comentar o "porquê" quando não óbvio
- Exportação nomeada, não default
- Props com valores padrão quando fizer sentido

## Design (cores SUAPE)

```
primary: #003366 / #004A8F / #0055A4
accent:  #F5A623
success: #16A34A
warning: #D97706
danger:  #DC2626
bg:      #F0F4F9
```

Fontes: `font-display` → Poppins (headings), `font-sans` → Inter (corpo), `font-mono` → JetBrains Mono (hash/código).

## Enums que pode precisar

```typescript
StatusRDO: "rascunho"|"revisao_externa"|"revisao_suape"|"aprovado"|"bloqueado"|"finalizado"
PerfilUsuario: "administrador"|"fiscal_suape"|"fiscal_externo"|"fornecedor"|"consulta"
SeveridadeAlerta: "baixa"|"media"|"alta"|"critica"
TipoAlerta: "saude_critica"|"padrao_nc"|"prazo_em_risco"
AcaoVersao: "criacao"|"edicao"|"envio_revisao"|"aprovacao_externa"|"reprovacao_externa"|"aprovacao_suape"|"reprovacao_suape"|"reabertura"|"finalizacao"
```

## Antes de escrever

1. Leia os arquivos relacionados que já existem na pasta do componente
2. Verifique se `src/lib/types.ts` já define os tipos necessários
3. Se o componente usa dados da API, PERGUNTE se deve criar também o hook `useQuery` ou apenas receber via props

## Entregue

O arquivo `.tsx` completo, pronto para uso, no caminho correto da estrutura do projeto.
