---
description: Aplica diretrizes de design diferenciado para Lavrari/SUAPE
argument-hint: [componente ou tela a redesenhar]
allowed-tools: Read, Write, Edit, Bash
---

Aplique design diferenciado ao componente/tela `$ARGUMENTS` do Lavrari.

## Contexto do produto

**Lavrari** é um sistema de Registro Diário de Obra (RDO) para o Porto de Suape (Pernambuco). Usuários primários: fiscais e engenheiros no campo — celular, sol de 40°C, às vezes com luvas. Identidade: seriedade institucional da SUAPE + modernidade de ferramenta SaaS de campo.

**Missão visual**: parecer uma ferramenta profissional de campo, não um portal de prefeitura.

## Design Lead — instrução de abordagem

Aja como designer de um estúdio pequeno que cobra caro por identidade visual que não pode ser confundida com nenhuma outra. Faça escolhas deliberadas e justificadas. Tome um risco estético real.

O cluster genérico a EVITAR: card branco com sombra + tabela azul + spinner circular + sidebar cinza. Qualquer equipe do hackathon vai produzir isso.

## Token system Lavrari

```
CORES:
  Navy profundo:   #0A1628  (backgrounds dark, sidebar)
  Navy médio:      #003366  (primary SUAPE)
  Navy claro:      #0055A4
  Dourado:         #F5A623  (accent SUAPE — usar com parcimônia)
  Superfície:      #F0F4F9  (bg principal — azulado, não branco puro)
  Glass:           rgba(255,255,255,0.07) + backdrop-blur (cards sobre dark)

TIPO:
  Display:  Poppins 600/700 — headings, títulos de seção, número grande de gauge
  Body:     Inter 400/500 — labels, tabelas, corpo de texto
  Mono:     JetBrains Mono — hash SHA-256, número de contrato, coordenadas GPS

ASSINATURA do produto:
  O gauge de saúde animado — RadialBar que preenche de 0→score em 800ms easeOut.
  Cor dinâmica por score. É o elemento mais memorável.
```

## Antes de redesenhar

1. Leia o componente/arquivo atual se já existir
2. Identifique o que está genérico (branco, cinza, tabela simples)
3. Brainstorm rápido: qual o "subject" real desse elemento? (obra, RDO, assinatura, GPS)
4. Escolha UM elemento que vai ser memorável — deixe o resto quieto

## Regras de execução

- Tailwind CSS — sem CSS modules
- Lucide React — sem emoji como ícone funcional
- shadcn/ui como primitivo base — customizar via `className`, não reescrever
- Mobile-first — testar mentalmente em 375px
- Áreas de toque 56px mínimo
- Animações com `transition-` e `animate-` do Tailwind; CSS custom apenas se necessário
- `@keyframes` custom no `tailwind.config` quando precisar de algo não disponível

## Auto-crítica antes de entregar

- Este design poderia ser de qualquer sistema institucional genérico? → Revisar
- O elemento "assinatura" está presente e justificado para este contexto específico?
- O texto (labels, estados vazios, erros) está no registro correto — direto, ativo, sem jargão?
- Funciona em dark (navy background)?

## Entregue

Código atualizado com design diferenciado, com 1-2 linhas explicando a escolha da "assinatura visual" do elemento redesenhado.
