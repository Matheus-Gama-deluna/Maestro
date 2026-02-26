# Prompt de Análise de Código - Maestro MCP v5.5.0

## 📋 Instrução Geral

Analise a base de código completa do projeto **Maestro MCP v5.5.0** e forneça uma avaliação técnica abrangente cobrindo: objetivo do projeto, estado atual, erros/aciertos, e recomendações estratégicas para evolução.

---

## 🎯 Contexto do Projeto

**Nome:** Maestro MCP Server  
**Versão:** v5.5.0 (transição para v6 - "Fat MCP")  
**Stack:** TypeScript, Node.js, MCP SDK  
**Propósito:** Orquestração autônoma de projetos de desenvolvimento via Model Context Protocol

**Conceitos-Chave:**
- **Fat MCP Approach:** Zero-API, toda lógica no servidor MCP (não em APIs externas)
- **TDD Invertido:** Documentos de orientação pré-gerados que a IA lê ANTES de codar
- **5 Core Tools Paradigm:** `maestro`, `executar`, `validar`, `analisar`, `contexto`
- **ValidationPipeline:** Watcher nativo event-driven para validação contínua
- **Auto-Flow:** Transições automáticas entre fases quando scores são atingidos

---

## 🔍 Escopo da Análise

### 1. Estrutura de Diretórios
```
c:\Users\gamam\OneDrive\Documentos\1- TramposTec\Guia Dev\Guia-dev-IA
├── src/                    # Código do servidor MCP
│   └── src/               # Código fonte TypeScript
│       ├── tools/         # Tools MCP (maestro, executar, validar, analisar, contexto)
│       ├── services/      # Serviços (state, flow-engine, validation)
│       ├── flows/         # Orquestradores de fluxo
│       ├── utils/         # Helpers e formatadores
│       └── types/         # Definições TypeScript
├── content/               # Conteúdo para IA (especialistas, templates, skills)
│   ├── specialists/       # Especialistas de IA por fase
│   ├── templates/         # Templates de documentos
│   ├── skills/            # Skills injetáveis no contexto
│   └── rules/             # Regras para IDEs
└── docs/                  # Documentação e roadmaps
```

### 2. Áreas Críticas de Análise

#### A. Arquitetura MCP
- **Entry Points:** `stdio.ts` (IDEs) vs `index.ts` (HTTP/SSE) - divergências?
- **Router Centralizado:** 8 tools públicas + 37 legadas - necessário refatorar?
- **Middleware Pipeline:** error→state→flow→persistence→skill - eficiência?

#### B. Fluxo de Onboarding (Foco - Falhas Conhecidas)
- **Arquivo:** `src/src/tools/maestro-tool.ts`
- **Problema 1:** Injeção de skills bloqueada por `!inOnboarding` (linhas 120, 168)
- **Problema 2:** Erro "Tool incorreta" na transição executar→maestro
- **Problema 3:** Inconsistência de caminhos (Windows vs normalizado)

#### C. Sistema de Fases
- Fases: `onboarding` → `produto` → `backend` → `frontend` → `deploy`
- Ficheiro de estado: `.maestro/estado.json`
- Especialistas injetados via `skill-loader.service.ts`

#### D. Validação e Gates
- `ValidationPipeline` com watcher event-driven
- TDD Invertido via `.orientacao-gate.md`
- Auto-correção injetada no retorno de erros

---

## 📊 Perguntas Específicas para Análise

### Arquitetura & Design
1. O pattern "Fat MCP" está corretamente implementado? Há vazamentos de lógica para fora?
2. Os 5 Core Tools são suficientes ou há tool sprawl (37 legadas)?
3. O middleware pipeline é eficiente ou cria gargalos?
4. Como está a separação de responsabilidades entre services/tools/flows?

### Qualidade de Código
5. Há código duplicado entre entry points (stdio.ts vs index.ts)?
6. Os serviços têm acoplamento excessivo?
7. Há uso adequado de async/await e tratamento de erros?
8. Como está a cobertura de tipos TypeScript?

### Bugs & Problemas Conhecidos
9. Analise as 4 falhas identificadas no diagnóstico técnico:
   - Injeção de skills bloqueada no onboarding
   - Mensagem "Tool incorreta" - origem no código?
   - Inconsistência de nomes ("teste" vs "CCCRJ")
   - Setup inicial pulado/possível
10. Há outros bugs potenciais nas transições de fase?

### Performance & Escalabilidade
11. O watcher event-driven é eficiente ou pode ter race conditions?
12. Como é gerenciada a memória/cache de skills?
13. Há problemas de I/O excessivo na persistência de estado?

### DevEx & Manutenibilidade
14. Como está a documentação inline vs docs/ externa?
15. Os nomes de funções/variáveis são claros?
16. Há testes unitários/integração? Cobertura?

---

## 📈 Entregáveis Esperados

### 1. Resumo Executivo (1-2 parágrafos)
- O projeto está no caminho certo?
- A arquitetura suporta os objetivos declarados?
- Qual o "health score" geral (0-100)?

### 2. Análise de Erros (Critico/Alto/Médio/Baixo)
Para cada erro encontrado:
- **Localização:** arquivo:linha
- **Descrição:** o que está errado
- **Impacto:** como afeta o usuário/sistema
- **Fix Sugerido:** código ou refatoração recomendada

### 3. Análise de Acertos
- O que está bem arquitetado?
- Quais patterns são elegantemente implementados?
- O que deveria ser mantido/preservado?

### 4. Análise do Próximo Passo (Roadmap Técnico)
Priorize em 3 categorias:

**🔥 URGENTE (corrigir agora):**
- Bugs que quebram o fluxo principal
- Inconsistências críticas de estado

**⚡ ALTA (próxima sprint):**
- Refatorações que reduzem débito técnico
- Melhorias de performance

**📅 MÉDIA (backlog):**
- Features novas
- Otimizações

### 5. Recomendações Estratégicas
- Devemos continuar com "Fat MCP" ou considerar hibridização?
- As 5 tools são suficientes para escalar?
- Qual seria a v6 ideal vs v5.5 atual?

---

## 🛠️ Como Executar a Análise

1. **Leitura Estratégica:**
   - Comece por `src/src/index.ts` e `src/src/stdio.ts` (entry points)
   - Revise `src/src/router.ts` (centralização)
   - Analise `src/src/tools/maestro-tool.ts` (foco dos bugs)

2. **Rastreamento de Fluxo:**
   - Siga o caminho: maestro → criar_projeto → onboarding → executar
   - Verifique as transições de fase

3. **Busca por Padrões:**
   - `grep -r "inOnboarding" src/` - verificar lógica condicional
   - `grep -r "Tool incorreta" src/` - origem do erro
   - `grep -r "next_action" src/` - consistência de transições

4. **Análise de Dependências:**
   - Mapeie imports cíclicos
   - Identifique serviços orfãos ou mal acoplados

---

## 📝 Formato de Resposta

Estruture sua resposta em Markdown com:

```markdown
# Análise Técnica - Maestro MCP v5.5.0

## 1. Resumo Executivo
...

## 2. Erros Encontrados
### 🔴 Crítico
#### ERRO-001: [Nome]
- **Arquivo:** `src/...`
- **Linha:** X
- **Descrição:** ...
- **Fix:** ```typescript ...```

### 🟠 Alto
...

## 3. Acertos
...

## 4. Próximos Passos
### 🔥 Urgente
1. [Descrição com link para erro]

### ⚡ Alta
...

## 5. Recomendações Estratégicas
...
```

---

## 🎯 Critério de Sucesso

A análise será considerada completa quando:
- [ ] Todos os 4 bugs conhecidos forem validados ou refutados
- [ ] Pelo menos 3 novos problemas potenciais forem identificados
- [ ] O health score geral for justificado com métricas
- [ ] O roadmap técnico tiver itens acionáveis com priorização clara

---

*Análise solicitada em: 25/02/2026*  
*Contexto: Diagnóstico técnico em andamento para estabilização do fluxo v5.5 → v6*
