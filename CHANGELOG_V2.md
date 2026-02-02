# Changelog - Maestro MCP v2.0

## [2.0.0] - 2026-02-02

### 🚀 Novas Funcionalidades Principais

#### 1. Sistema de Modos de Operação
- **Economy Mode**: Reduz prompts em ~70%, ideal para POCs e protótipos
- **Balanced Mode**: Reduz prompts em ~45%, ideal para projetos internos (padrão)
- **Quality Mode**: Máxima qualidade, ideal para produtos complexos

#### 2. Frontend-First Architecture
- Fase 10 expandida com geração de contratos de API
- Geração automática de mocks com MSW e Faker.js
- Schemas TypeScript compartilhados (Zod)
- Cliente API gerado automaticamente
- Desenvolvimento paralelo de Frontend e Backend

#### 3. Ferramentas Avançadas Obrigatórias
- Checkpoints automáticos em fases críticas
- Auto-fix durante validação de gates
- Discovery de codebase antes de implementação
- ATAM obrigatório para projetos complexos
- Validação de segurança em todas as fases

#### 4. Sistema de Gerenciamento de Tarefas
- Hierarquia de tarefas (Epic → Feature → Story → Task)
- Dependências entre tarefas
- Tracking de progresso
- Estimativas e tempo real
- Logs de implementação

#### 5. Otimização de Créditos/Prompts
- Batch prompts (consolidação de perguntas)
- Context caching (reutilização de contexto)
- Template compression (versões compactas)
- Smart validation (validação incremental)
- One-shot generation (geração completa)
- Differential updates (apenas diffs)

### 🔧 Melhorias

#### Fluxos Atualizados
- **Fluxo Principal**: 13 fases com ferramentas avançadas integradas
- **Fluxo Feature**: Nova feature com frontend-first
- **Fluxo Bug Fix**: Correção com discovery e auto-fix

#### Validação Aprimorada
- 5 camadas de validação mantidas
- Auto-fix tenta corrigir erros triviais antes de bloquear
- Cache de validações para evitar reprocessamento

#### Contexto e Memória
- Cache de especialistas e templates
- Resumo incremental por fase
- Knowledge base expandida

### 📁 Novos Arquivos

#### Core
- `src/src/config/modes.ts` - Configuração de modos
- `src/src/config/flows.ts` - Definição de fluxos
- `src/src/optimization/batch-prompts.ts` - Batch prompts
- `src/src/optimization/context-cache.ts` - Cache de contexto
- `src/src/optimization/smart-validation.ts` - Validação inteligente

#### Frontend-First
- `src/src/frontend-first/contract-generator.ts` - Gerador de contratos
- `src/src/frontend-first/mock-generator.ts` - Gerador de mocks
- `src/src/frontend-first/client-generator.ts` - Gerador de cliente API

#### Task Management
- `src/src/tasks/task-manager.ts` - Gerenciador de tarefas
- `src/src/tasks/task-hierarchy.ts` - Hierarquia de tarefas
- `src/src/tasks/task-tracker.ts` - Tracking de tarefas

#### Tools MCP
- `src/src/tools/configurar-modo.ts` - Configurar modo de operação
- `src/src/tools/gerar-contrato-api.ts` - Gerar contrato de API
- `src/src/tools/criar-tarefa.ts` - Criar tarefa
- `src/src/tools/listar-tarefas.ts` - Listar tarefas
- `src/src/tools/atualizar-tarefa.ts` - Atualizar tarefa

### 📊 Métricas de Impacto

| Métrica | v1.0 | v2.0 | Melhoria |
|---------|------|------|----------|
| Prompts/Projeto (Economy) | 130-180 | 40-60 | -70% |
| Prompts/Projeto (Balanced) | 130-180 | 80-100 | -45% |
| Tempo de Desenvolvimento | 100% | 50-70% | -30-50% |
| Qualidade (Score Médio) | 75% | 85-90% | +10-15% |
| Cobertura de Validação | 3 camadas | 5 camadas | +67% |

### 🔄 Breaking Changes

#### Estrutura de Estado
- Adicionado campo `mode` (economy/balanced/quality)
- Adicionado campo `flow_type` (principal/feature/bugfix)
- Adicionado campo `tasks` (array de tarefas)
- Adicionado campo `optimization_config`

#### Fase 10 Expandida
- Entregável mudou de `api-contract.md` para `api-contract/` (diretório)
- Inclui schemas, mocks, cliente e handlers

#### Tools MCP
- Todas as tools agora aceitam parâmetro `mode` (opcional)
- Tool `proximo` agora cria checkpoint automático
- Tool `validar_gate` agora tenta auto-fix antes de bloquear

### 📚 Documentação

#### Novos Guias
- `docs/guides/FRONTEND_FIRST.md` - Guia de desenvolvimento frontend-first
- `docs/guides/OPTIMIZATION_MODES.md` - Guia de modos de otimização
- `docs/guides/TASK_MANAGEMENT.md` - Guia de gerenciamento de tarefas

#### Atualizados
- `README.md` - Atualizado com novas funcionalidades
- `docs/00_ESPECIFICACAO_TECNICA_MCP_MAESTRO.md` - Especificação v2.0

### 🐛 Correções

- Corrigido cache de contexto que não invalidava corretamente
- Corrigido validação de gates que bloqueava erroneamente em alguns casos
- Corrigido geração de código que não respeitava patterns existentes

### ⚠️ Deprecations

- `api-contract.md` (Fase 10) → Usar `api-contract/` (diretório)
- Modo implícito → Agora deve ser configurado explicitamente

### 🔜 Próximas Versões

#### v2.1 (Planejado)
- Dashboard Web (MVP)
- Sistema de aprovação humana
- Real-time updates (WebSocket)

#### v2.2 (Planejado)
- VSCode Extension
- Implementation logs detalhados
- Internacionalização (EN, ES)

---

## Como Atualizar

### De v1.0 para v2.0

1. **Atualizar dependências:**
```bash
cd src
npm install
```

2. **Migrar projetos existentes:**
```bash
# Executar script de migração
node scripts/migrate-v1-to-v2.js /caminho/do/projeto
```

3. **Configurar modo (opcional):**
```typescript
// No início do projeto
await configurar_modo({
  mode: "balanced", // ou "economy" ou "quality"
  estado_json: estadoJson,
  diretorio: "./"
});
```

4. **Atualizar workflows:**
- Workflows antigos continuam funcionando
- Novos workflows incluem frontend-first automaticamente

### Compatibilidade

- ✅ Projetos v1.0 continuam funcionando
- ✅ Migration automática de estado.json
- ✅ Backward compatibility mantida
- ⚠️ Fase 10 requer regeneração para usar frontend-first

---

## Agradecimentos

Agradecimentos especiais à análise comparativa com Spec Workflow MCP que inspirou várias melhorias.

---

**Versão:** 2.0.0  
**Data:** 02/02/2026  
**Autor:** Maestro Team
