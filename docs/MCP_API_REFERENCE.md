# Maestro MCP v5.1.0 — API Reference

## Visão Geral

O Maestro MCP é um servidor Model Context Protocol que orquestra desenvolvimento de software assistido por IA. Suporta dois transportes:

- **stdio** — Para IDEs (Windsurf, Cursor, VS Code)
- **HTTP/SSE** — Para clients web e custom

**Protocol Version:** `2025-03-26`

---

## Tools (8 públicas)

### `maestro`
Entry point inteligente. Detecta contexto e guia o próximo passo.

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `diretorio` | string | ✅ | Diretório absoluto do projeto |
| `input` | string | | Texto livre do usuário |
| `acao` | string | | Ação específica a executar |
| `estado_json` | string | | Estado do projeto (auto-carrega se omitido) |
| `respostas` | object | | Respostas de formulário |

### `avancar`
Avança no fluxo. Em onboarding: próximo bloco. Em desenvolvimento: submete entregável.

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `diretorio` | string | ✅ | Diretório absoluto do projeto |
| `entregavel` | string | | Conteúdo do entregável (obrigatório para dev) |
| `estado_json` | string | | Estado do projeto |
| `respostas` | object | | Respostas para onboarding/brainstorm |
| `auto_flow` | boolean | | Modo automático (pula confirmações) |

### `status`
Retorna status completo do projeto.

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `estado_json` | string | ✅ | Estado do projeto |
| `diretorio` | string | ✅ | Diretório absoluto do projeto |

### `validar`
Valida gate, entregável ou compliance. Auto-detecta tipo.

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `diretorio` | string | ✅ | Diretório absoluto do projeto |
| `tipo` | enum | | `gate` \| `entregavel` \| `compliance` |
| `entregavel` | string | | Conteúdo para validar |
| `fase` | number | | Fase para validar gate |
| `standard` | enum | | `LGPD` \| `PCI-DSS` \| `HIPAA` |
| `code` | string | | Código para compliance |

### `contexto`
Retorna contexto acumulado do projeto.

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `estado_json` | string | ✅ | Estado do projeto |
| `diretorio` | string | ✅ | Diretório absoluto do projeto |

### `salvar`
Salva conteúdo sem avançar de fase.

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `conteudo` | string | ✅ | Conteúdo a salvar |
| `tipo` | enum | ✅ | `rascunho` \| `anexo` \| `entregavel` |
| `estado_json` | string | ✅ | Estado do projeto |
| `diretorio` | string | ✅ | Diretório absoluto do projeto |
| `nome_arquivo` | string | | Nome do arquivo (auto-gerado se omitido) |

### `checkpoint`
Gerencia checkpoints e rollbacks.

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `diretorio` | string | ✅ | Diretório absoluto do projeto |
| `acao` | enum | | `criar` \| `rollback` \| `rollback_parcial` \| `listar` |
| `reason` | string | | Motivo (para criar) |
| `checkpointId` | string | | ID do checkpoint (para rollback) |
| `modules` | string[] | | Módulos (para rollback parcial) |

### `analisar`
Análise de código (segurança, qualidade, performance, dependências).

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `diretorio` | string | ✅ | Diretório absoluto do projeto |
| `code` | string | | Código para analisar |
| `tipo` | enum | | `seguranca` \| `qualidade` \| `performance` \| `dependencias` \| `completo` |
| `language` | enum | | `typescript` \| `javascript` \| `python` |

---

## Resources

| URI | Descrição |
|-----|-----------|
| `maestro://especialista/{nome}` | Conteúdo do especialista |
| `maestro://template/{nome}` | Template de entregável |
| `maestro://guia/{nome}` | Guia de referência |
| `maestro://system-prompt` | System prompt da IA |

---

## Prompts (4)

| Nome | Descrição | Argumentos |
|------|-----------|------------|
| `maestro-specialist` | Persona + instruções do especialista da fase atual | `diretorio` |
| `maestro-context` | Contexto completo do projeto | `diretorio` |
| `maestro-template` | Template do entregável esperado | `diretorio` |
| `maestro-sessao` | Sessão completa (specialist + context + template + tools) | `diretorio` |

---

## Compatibilidade com IDEs

| Feature | Windsurf | Cursor | VS Code | Claude.ai |
|---------|----------|--------|---------|-----------|
| Tools | ✅ | ✅ | ✅ | ✅ |
| Resources | ✅ | ✅ | ✅ | ✅ |
| Prompts | ✅ | ✅ | ✅ | ✅ |
| Elicitation | ❌ (fallback) | ❌ (fallback) | ❌ (fallback) | ✅ |
| Sampling | ❌ (fallback) | ❌ (fallback) | ❌ (fallback) | ✅ |
| Annotations | ❌ (fallback) | ❌ (fallback) | ❌ (fallback) | ✅ |

> Para features sem suporte nativo, o Maestro gera fallbacks em Markdown estruturado.

---

## Arquitetura de Serviços (v5.1)

```
src/src/
├── constants.ts                    # Versão, nome, protocol (ÚNICO ponto)
├── index.ts                        # Entry point HTTP/SSE
├── stdio.ts                        # Entry point STDIO (IDEs)
├── server.ts                       # Factory do Server MCP
├── router.ts                       # Roteador centralizado (8 public + 37 legacy)
├── handlers/
│   └── shared-resource-handler.ts  # Handlers compartilhados de resources
├── middleware/
│   └── index.ts                    # Pipeline: error→state→flow→persist→skill
├── services/
│   ├── client-capabilities.service.ts   # Detecção de capabilities do client
│   ├── skill-cache.service.ts           # Cache de skills em memória (TTL 1h)
│   ├── elicitation-fallback.service.ts  # Fallback de elicitation
│   ├── sampling-fallback.service.ts     # Fallback de sampling
│   ├── annotations-fallback.service.ts  # Annotations com fallback
│   ├── structured-content.service.ts    # Structured content com fallback
│   └── system-prompt.service.ts         # System prompt dinâmico
├── utils/
│   └── response-formatter.ts       # Formatação Markdown estruturada
└── tools/
    ├── maestro-tool.ts             # Entry point inteligente
    ├── status.ts                   # Status do projeto
    ├── contexto.ts                 # Contexto acumulado
    ├── salvar.ts                   # Salvar conteúdo
    └── consolidated/
        ├── avancar.ts              # Avançar fluxo
        ├── validar.ts              # Validações
        ├── checkpoint-tool.ts      # Checkpoints
        └── analisar.ts             # Análise de código
```
