# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [5.5.0] - 2026-02-20

### 🚀 V6 "Fat MCP" - Zero API Architecture (Sprint 5)
- **Event-Driven Watcher Integrado:** A `ValidationPipeline` agora roda de forma totalmente autônoma e silenciosa ouvindo saves nos arquivos Markdown usando `chokidar`.
- **Auto-Correção e TDD Invertido (Sinais 1 a 4):** IA é orientada ativamente pelo Node.js via System Prompts imperativos nos erros do Gate.
- **Estado Compulsório:** Sistema restringe a divagação da IA para rotas de erro até que os Gates passem, bloqueando execução leviana de ferramentas.
- **Smart Auto-Flow:** O servidor avança silenciosamente e assume payloads das próximas etapas sem parar a execução em "fases derivadas" e "fases técnicas".
- Refinamentos no `WatcherConfig` e `proximo.ts` para enviar o `tier` o `gate_checklist` corretamente para o watcher passivo.

---

## [5.4.7] - 2026-02-18

### 🤖 Onboarding V3 e Classificação Progressiva
- Transformação do `ClassificadorProgressivo` para reavaliar dinamicamente ao longo das fases.
- Reestruturação global do modelo e tipagens (`EstadoProjeto`).
- Adição silenciosa de metadados em ferramentas chave para evitar leaks de contexto MCP.

---

## [2.3.0] - 2026-02-01

### 🤖 Modern Skills v2.0
- **Adaptação Completa**: MCP Server adaptado para usar skills locais injetadas
- **Zero Dependência MCP**: Remoção do uso de resources `maestro://` em favor de arquivos locais
- **Progressive Disclosure**: IDE gerencia descoberta de skills via `.agent/skills/`
- **Skills Mapping**: Novo sistema de mapeamento fase → skill local
- **Tools Atualizados**: `iniciar_projeto`, `proximo`, `status`, `validar_gate`, `contexto` agora suportam skills locais
- **Rules v2**: `GEMINI.md` atualizado com novos protocolos de carregamento e estrutura de arquivos

---

## [2.2.0] - 2026-01-07

### 🎼 Renomeação do Projeto
- Projeto renomeado de "Guia-dev-IA" para **Maestro**
- URIs atualizadas de `guia://` para `maestro://`
- Pasta de estado atualizada de `.guia/` para `.maestro/`

### Adicionado
- **RULES_TEMPLATE.md**: Template de regras para configurar IAs (Cursor, Claude, Copilot)
- **Resource `maestro://system-prompt`**: Injeção automática de rules no MCP
- **Especialista em Contrato de API**: Padrão Contract First
- **Especialista em Desenvolvimento Frontend**: Fluxo Frontend First
- Fluxo Frontend First: Contrato → FE/BE paralelo → Integração
- Templates de histórias (frontend, backend, integração)
- Instrução de Avanço Automático em todos os especialistas

### Corrigido
- Links absolutos antigos em prompts convertidos para paths relativos

---

## [2.0.0] - 2024-12-19

### Adicionado
- Sistema de Gates de qualidade entre fases
- Classificador de complexidade (Simples/Médio/Complexo)
- 3 Especialistas Avançados: Arquitetura Avançada, Performance, Observabilidade
- MCP_ESPECIFICACAO.md com design completo do MCP Server
- 16 Templates de artefatos
- Prompts avançados para arquitetura C4, DDD, escalabilidade

---

## [1.0.0] - 2024-12-18

### Adicionado
- Playbook de Desenvolvimento com IA (8 etapas)
- 9 Especialistas: Gestão de Produto, Requisitos, UX, Modelagem, Arquitetura, Segurança, Testes, Plano de Execução, Desenvolvimento
- Guias: Adição de Novas Funcionalidades, Catálogo de Stacks
- Rules Base para configuração de assistentes
- 4 Exemplos: NestJS, Java/Spring, Laravel/Filament, Laravel/Livewire
- README com fluxo recomendado
- QUICKSTART para onboarding rápido

### Estrutura
```
├── 01-playbook/
├── 02-especialistas/
├── 03-guias/
└── 04-exemplos/
```
