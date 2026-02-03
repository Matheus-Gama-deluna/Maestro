# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

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
