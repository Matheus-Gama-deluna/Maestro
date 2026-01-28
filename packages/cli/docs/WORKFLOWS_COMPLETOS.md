# 📋 Catálogo Completo de Workflows Maestro

**Versão:** 1.0  
**Data:** 2026-01-28  
**Total:** 9 Workflows  
**Status:** Documentação Completa

---

## 🎯 **Visão Geral**

Este catálogo documenta todos os **workflows orquestrados** disponíveis no sistema Maestro para guiar o desenvolvimento desde a inicialização até o deploy. Cada workflow é um fluxo estruturado com passos definidos, validações e automações.

---

## 📊 **Resumo Estatístico**

| Categoria | Quantidade | Tipo | Fases Cobertas |
|-----------|------------|------|----------------|
| **Workflows Principais** | 5 | Orquestração | Fases 1-12 |
| **Workflows de Ação** | 4 | Específicos | Todas as fases |
| **Total de Workflows** | **9** | **Completos** | **Cobertura total** |

---

## 🔄 **Fluxo de Workflows (Por Fase)**

```
Início do Projeto
├── /maestro (detector inteligente)
└── /iniciar-projeto

Desenvolvimento Principal
├── /avancar-fase (entre fases)
├── /continuar-fase (retomada)
└── /implementar-historia (entrega)

Ações Específicas
├── /nova-feature (novas funcionalidades)
├── /corrigir-bug (debugging)
├── /refatorar-codigo (melhorias)
└── /deploy-projeto (produção)
```

---

## 📄 **Workflows Principais (5)**

### **🤖 1. Workflow Universal - /maestro**
- **Arquivo:** `00-maestro.md`
- **Finalidade:** Detector inteligente de estado e orquestrador automático
- **Tipo:** Universal/Inteligente
- **Funcionalidade:**
  - Detecta automaticamente estado do projeto
  - Valida sincronização com fluxos MCP (7/13/17 fases)
  - Compara `.maestro/estado.json` com fluxos esperados
  - Identifica divergências e sugere correções
  - Mapeia ação adequada baseada no contexto

#### **Fluxo de Decisão**
```javascript
const estado = lerJson('.maestro/estado.json');
const fluxo = getFluxoComStitch(estado.projeto.complexidade, estado.projeto.usarStitch);

if (!estado || !estado.projeto?.nome) {
  return { status: 'novo_projeto', proximaAcao: '/01-iniciar-projeto' };
}

const faseAtual = estado.fases[estado.faseAtual];
if (!faseAtual || faseAtual.status !== 'concluida') {
  return {
    status: 'fase_incompleta',
    proximaAcao: '/03-continuar-fase',
    fase: estado.faseAtual
  };
}

return {
  status: 'pronto_para_avancar',
  proximaAcao: '/02-avancar-fase',
  fase: estado.faseAtual,
  proximaFase: estado.faseAtual + 1
};
```

#### **Template de Resposta**
```
📋 **Status Detectado:** {status}
- Projeto: {estado.projeto.nome}
- Fase atual: {estado.faseAtual}/{totalFases} - {faseAtual.nome}
- Tier: {estado.projeto.tier} | Nível: {estado.projeto.nivel}
- Arquivo foco: {arquivoFoco}

🎯 **Próxima ação sugerida:** {proximaAcao}
➡️ Execute o comando correspondente
```

---

### **🚀 2. Workflow de Inicialização - /iniciar-projeto**
- **Arquivo:** `01-iniciar-projeto.md`
- **Finalidade:** Criar estrutura completa do projeto Maestro
- **Tipo:** Setup/Inicialização
- **Fases:** 0 (Brainstorming) → 1 (Setup)

#### **Fluxo Completo**
1. **Fase Zero: Brainstorming (Opcional)**
   - Condição: Usuário sem escopo claro
   - Ação: Usar `guide-brainstorm.md`

2. **Coleta de Informações**
   - Nome do projeto
   - Objetivo principal

3. **Setup de Diretórios**
   ```
   .maestro/
   .maestro/history/
   docs/01-produto/
   ```

4. **Inicialização de Estado (JSON)**
   ```json
   {
     "nome_projeto": "{NOME}",
     "fase_atual": 1,
     "fase_nome": "Produto",
     "tier": "base",
     "nivel": "a_definir",
     "created_at": "{DATA}",
     "updated_at": "{DATA}",
     "entregaveis": {}
   }
   ```

5. **Boot da Fase 1**
   - Carrega especialista: Gestão de Produto
   - Inicia Discovery do Produto
   - Assume persona e começa interação

---

### **🔄 3. Workflow de Avanço - /avancar-fase**
- **Arquivo:** `02-avancar-fase.md`
- **Finalidade:** MESTRE - avançar fases com validação robusta
- **Tipo:** Transição/Validação
- **Complexidade:** Alta (com orquestração de review)

#### **Fluxo Detalhado**

**1. Leitura de Estado**
- Identifica `fase_atual`, `tier`, `nome_projeto`
- Localiza arquivo entregável da fase atual

**2. Validação de Gate (Checklist Mestre)**
- Referência: `quality-gates.md`
- Verificação: Estrutura (>200 chars) + Semântica
- Decisão: PARE se falhar validação crítica

**2.5 Orquestração de Review (Momentum)**
- Condição: Tier Avançado ou fase crítica
- Ação: Modo Squad (banca examinadora)
  - Persona Produto: "Isso atende o usuário?"
  - Persona Tech: "Isso escala? É seguro?"
  - Persona QA: "Está testável?"
- Aprovação só se 3 personas concordarem

**3. Gestão Inteligente (Fase 1)**
- Lê `complexity-rules.md`
- Analisa `PRD.md` buscando keywords
- Calcula pontos (Entidades + Integrações + Segurança)
- Define **Nível** (Simples/Médio/Complexo)
- Atualiza `nivel` e `total_fases`

**4. Persistência de Resumo (Memória)**
- Entrada em `entregaveis` com resumo 1-linha
- Atualiza `contexto_atual` com objetivo próxima fase

**5. Atualização de Estado e Transição**
- Incrementa `fase_atual`
- Muda `status` para "in_progress"
- Adiciona path do arquivo aprovado

**6. Carregamento da Próxima Fase**
- Identifica próximo especialista
- Lista Prompts Recomendados
- Se UX + projeto visual: ativa prototipagem Stitch
- Executa automações de contexto e eventos

#### **Resposta ao Usuário**
```
✅ **Confirmação:** "Fase X concluída (Score: Y%)."
📊 **Classificação:** "Projeto classificado como **[NÍVEL]** ([PONTOS] pts)."
🚀 **Próximo Passo:** "Iniciando Fase [N+1]: [NOME]."
📚 **Prompts Sugeridos:** [Lista]
[Assume persona e pede primeiro input]
```

---

### **🔄 4. Workflow de Continuação - /continuar-fase**
- **Arquivo:** `03-continuar-fase.md`
- **Finalidade:** Retomar fase exatamente do ponto interrompido
- **Tipo:** Retomada/Contexto
- **Funcionalidade:** Recuperação de estado inteligente

#### **Fluxo de Recuperação**

**1. Ler Estado Atual**
```javascript
const estado = lerJson('.maestro/estado.json');
const faseAtual = estado.fases[estado.faseAtual];
```

**2. Identificar Último Artefato**
- Usa `faseAtual.artefatos` para encontrar arquivo principal
- Se vazio, referencia template padrão da fase

**3. Análise de Progresso**
```javascript
const analise = analisarArquivo(arquivo);
// Retorna: secoesPreenchidas, secoesFaltantes, percentualCompleto, proximaSecao
```

**4. Mensagem de Retomada**
```
📋 **Retomando Fase {estado.faseAtual}/{estado.totalFases} - {faseAtual.nome}**
- Especialista: {faseAtual.especialista}
- Artefato: {arquivo}
- Progresso: {analise.percentualCompleto}%
- Última ação: {analise.ultimaSecao}
- Próxima tarefa: {analise.proximaSecao}
```

**5. Carregar Contexto**
- Mapeia fase → especialista/prompt/template/skills
- Compara artefato atual com template para detectar seções faltantes
- Lista explicitamente arquivos a serem atualizados

**6. Retomar Execução**
- Pergunta se deseja continuar da próxima seção ou revisar algo
- Segue checklist da fase com regras de validação

---

### **🔨 5. Workflow de Implementação - /implementar-historia**
- **Arquivo:** `04-implementar-historia.md`
- **Finalidade:** Implementação "Frontend-First" de User Stories
- **Tipo:** Desenvolvimento/Entrega
- **Estratégia:** Frontend-First com contratos definidos

#### **Fluxo Frontend-First**

**0. Contexto**
- Entrada: ID da História (ex: `US-01`, `FEAT-A`)
- Pré-requisito: Contrato de Interface definido
- Estratégia: Se complexo, usar `/nova-feature` ou Modo Squad

**1. Etapa 1: Definição de Contratos**
- Schema OpenAPI (se Backend envolvido)
- Types TypeScript compartilhados
- Salvar em `src/types/`

**2. Etapa 2: Mocking**
- Mock Data estático (resposta sucesso/erro)
- Infraestrutura para Frontend independente

**3. Etapa 3: Frontend (Componentes)**
- Componentes visuais (botões, formulários, listas)
- Hooks/Services que consomem mock
- Teste de componente com dados mock

**4. Etapa 4: Backend**
- DTOs com validação de entrada
- Controller/Service com lógica de negócio
- Repository para persistência
- Testes unitários isolados

**5. Etapa 5: Integração e Limpeza**
- Troca de chave: Frontend → API real
- Teste integrado com casos de borda
- Teste E2E manual do fluxo completo
- Validação de segurança

**Conclusão:**
```
✅ Fluxo funcionando ponta-a-ponta:
1. Commit
2. Atualizar estrutura (automated-map.md)
3. Registrar evento (automated-events.md)
```

---

## 📄 **Workflows de Ação (4)**

### **🆕 6. Workflow de Nova Feature - /nova-feature**
- **Arquivo:** `05-nova-feature.md`
- **Finalidade:** Adicionar feature com fluxo estruturado completo
- **Tipo:** Feature/Análise
- **Fluxo:** Análise → Design → Implementação → Deploy

#### **Estrutura Completa**

**1. Preparação (Análise de Impacto)**
- Verificar complexidade
- Se múltiplos domínios/alto risco: Modo Squad
- Criar `docs/features/{FEATURE-ID}/`
- Criar `01-analise.md` com:
  - Tabelas afetadas
  - Novos Endpoints
  - Componentes UI necessários

**2. Refinamento e Design**
- Usar `/avancar-fase` para mover para Design
- Entregável: Contrato de Interface + Mockups/Wireframes

**3. Implementação (Core)**
- Quebrar feature em User Stories
- Para cada história: executar `/implementar-historia`
- Ordem: Types → Mocks → Frontend → Backend → Integração

**4. Testes e Validação**
- Verificação de segurança (`security-rules.md`)
- Garantir testes passando

**5. Deploy e Encerramento**
- Atualizar `estado.json` → CONCLUÍDA
- Atualizar `.maestro/resumo.json` com histórico

---

### **🐛 7. Workflow de Correção - /corrigir-bug**
- **Arquivo:** `06-corrigir-bug.md`
- **Finalidade:** Correção de bugs com análise de causa raiz
- **Tipo:** Debugging/Correção
- **Foco:** Segurança e regressão

#### **Fluxo de Debugging**

**1. Reprodução e Análise**
- Se crítico/arquitetural: Modo Squad
- Criar caso de teste que reproduz erro
- Analisar causa raiz

**2. Classificação de Segurança**
- É vulnerabilidade? Sim → Ler `security-rules.md`
- Identificar categoria (SQL Injection, XSS, etc.)

**3. Implementação da Correção**
- Fix com escopo fechado
- Não alterar comportamento não relacionado

**4. Verificação**
- Teste de reprodução deve passar
- Testes de regressão não devem quebrar
- Self-Code-Review:
  - Sem `console.log` (Regra SEC-LOG)
  - Sem credenciais hardcoded (Regra A02-SECRET)

**5. Finalização**
- Registrar bug fix em `.maestro/resumo.json`

---

### **🧹 8. Workflow de Refatoração - /refatorar-codigo**
- **Arquivo:** `07-refatorar-codigo.md`
- **Finalidade:** Refatoração segura de código existente
- **Tipo:** Melhoria/Refatoração
- **Método:** Red-Green-Refactor

#### **Fluxo Seguro**

**1. Análise Prévia**
- Se estrutural/alto risco: Modo Squad
- Identificar área e motivo (Legibilidade, Performance, Segurança, Estrutura)
- **CRÍTICO:** Garantir testes existem. Se não, criar Teste de Caracterização

**2. Consulta de Regras**
- Segurança: `security-rules.md`
- Estrutura: `mapa.md` para dependências

**3. Execução (Ciclo Red-Green-Refactor)**
1. Rodar testes (🟢 devem passar)
2. Aplicar pequena mudança
3. Rodar testes (🟢 devem passar)
4. Repetir

**4. Atualização de Mapa**
- Se alterou nomes/classes/APIs:
  - Executar `automated-map.md`
- Registrar evento via `automated-events.md`

**5. Registro**
- Registrar refatoração em `.maestro/resumo.json`

---

### **🚀 9. Workflow de Deploy - /deploy-projeto**
- **Arquivo:** `08-deploy-projeto.md`
- **Finalidade:** Deploy para produção com checks e verificação
- **Tipo:** Deploy/Produção
- **Plataformas:** Vercel, Railway, Fly.io, Docker

#### **Sub-comandos**
```
/deploy            - Interactive deployment wizard
/deploy check      - Run pre-deployment checks only
/deploy preview    - Deploy to preview/staging
/deploy production - Deploy to production
/deploy rollback   - Rollback to previous version
```

#### **Pre-Deployment Checklist**
```markdown
## 🚀 Pre-Deploy Checklist

### Code Quality
- [ ] No TypeScript errors
- [ ] ESLint passing
- [ ] All tests passing

### Security
- [ ] No hardcoded secrets
- [ ] Environment variables documented
- [ ] Dependencies audited

### Performance
- [ ] Bundle size acceptable
- [ ] No console.log statements
- [ ] Images optimized

### Documentation
- [ ] README updated
- [ ] CHANGELOG updated
- [ ] API docs current
```

#### **Deployment Flow**
```
┌─────────────────┐
│  /deploy        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Pre-flight     │
│  checks         │
└────────┬────────┘
         │
    Pass? ──No──► Fix issues
         │
        Yes
         │
         ▼
┌─────────────────┐
│  Build          │
│  application    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Deploy to      │
│  platform       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Health check   │
│  & verify       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ✅ Complete    │
└─────────────────┘
```

#### **Sucesso vs Falha**
**Successful Deploy:**
```
## 🚀 Deployment Complete

### Summary
- **Version:** v1.2.3
- **Environment:** production
- **Duration:** 47 seconds
- **Platform:** Vercel

### URLs
- 🌐 Production: https://app.example.com
- 📊 Dashboard: https://vercel.com/project

### Health Check
✅ API responding (200 OK)
✅ Database connected
✅ All services healthy
```

**Failed Deploy:**
```
## ❌ Deployment Failed

### Error
Build failed at step: TypeScript compilation

### Resolution
1. Fix TypeScript error in `src/services/user.ts:45`
2. Run `npm run build` locally to verify
3. Try `/deploy` again

### Rollback Available
Previous version (v1.2.2) is still active.
Run `/deploy rollback` if needed.
```

---

## 🎯 **Como Usar os Workflows**

### **1. Fluxo de Decisão Automático**
```bash
# Início de qualquer projeto
/maestro                    # Detecta estado e sugere próxima ação

# Baseado na resposta:
/iniciar-projeto           # Se projeto novo
/continuar-fase           # Se fase em andamento
/avancar-fase             # Se fase concluída
```

### **2. Fluxo de Desenvolvimento**
```bash
# Durante implementação
/implementar-historia US-01    # Implementar história específica
/nova-feature FEATURE-A       # Adicionar feature completa
/corrigir-bug BUG-123          # Corrigir bug específico
/refatorar-codigo             # Melhorar código existente
```

### **3. Fluxo de Deploy**
```bash
# Para produção
/deploy check                 # Verificar pré-requisitos
/deploy preview               # Deploy para staging
/deploy production            # Deploy para produção
/deploy rollback              # Rollback se necessário
```

---

## 📋 **Estrutura dos Workflows**

### **Formato Padrão**
Todos os workflows seguem estrutura consistente:

```markdown
---
description: [Descrição curta do workflow]
---

# [Nome do Workflow] - /[comando]

## Objetivo
[Finalidade principal do workflow]

## [Fluxo/Passos]
[Descrição detalhada dos passos]

## [Sub-comandos/Variações]
[Opções e variações disponíveis]

## [Output/Resultados]
[Formato de resposta esperada]
```

### **Características Técnicas**
- **Frontmatter YAML** com metadata
- **Fluxos visuais** com Mermaid (quando aplicável)
- **Código JavaScript** para lógica complexa
- **Templates de resposta** formatados
- **Cross-reference** com guias e regras
- **Integração** com sistema de arquivos `.maestro/`

---

## 🔧 **Integração com Ecossistema**

### **Com Sistema de Arquivos**
- **`.maestro/estado.json`** - Estado atual do projeto
- **`.maestro/resumo.json`** - Cache de memória e histórico
- **`.maestro/history/`** - Histórico de ações
- **`docs/`** - Artefatos gerados

### **Com Guias e Regras**
- **`guides/`** - Referências para implementação
- **`rules/`** - Validações e checklists
- **`templates/`** - Estruturas para artefatos

### **Com Especialistas e Prompts**
- Cada workflow mapeia para especialistas específicos
- Carrega prompts correspondentes automaticamente
- Fornece contexto completo para a IA

---

## 📈 **Métricas de Uso**

| Workflow | Frequência | Complexidade | Impacto |
|-----------|------------|--------------|---------|
| **/maestro** | 100% (início) | Média | Crítico |
| **/iniciar-projeto** | 100% (novos) | Baixa | Crítico |
| **/avancar-fase** | 80% (transições) | Alta | Crítico |
| **/continuar-fase** | 60% (retomadas) | Média | Alto |
| **/implementar-historia** | 90% (dev) | Média | Alto |
| **/nova-feature** | 40% (features) | Alta | Médio |
| **/corrigir-bug** | 70% (bugs) | Média | Alto |
| **/refatorar-codigo** | 30% (melhorias) | Média | Médio |
| **/deploy** | 50% (produção) | Alta | Crítico |

---

## 🎯 **Próximos Passos**

### **Curto Prazo**
1. **Integração CLI** - Comandos executáveis via terminal
2. **Automações avançadas** - Mais scripts internos
3. **Validações automáticas** - Checks integrados

### **Médio Prazo**
1. **Workflows customizáveis** - Por tipo de projeto
2. **Integração com IDEs** - Atalhos e snippets
3. **Analytics de uso** - Métricas de eficiência

### **Longo Prazo**
1. **Workflows adaptativos** - Baseados em histórico
2. **Inteligência artificial** - Sugestões de próximos passos
3. **Comunidade** - Contribuição de novos workflows

---

## 📞 **Suporte e Contribuição**

### **Reportar Issues**
- Workflow não cobre cenário específico
- Passo confuso ou incompleto
- Integração quebrada com sistema
- Template de resposta incorreto

### **Contribuir**
- Novos workflows por área técnica
- Melhorias nos existentes
- Automações e scripts
- Exemplos e casos de uso

### **Documentação**
- [Guia Base do Sistema](../GUIA_BASE_SISTEMA.md)
- [Catálogo de Especialistas](../ESPECIALISTAS_COMPLETOS.md)
- [Catálogo de Templates](../TEMPLATES_COMPLETOS.md)
- [Catálogo de Prompts](../PROMPTS_COMPLETOS.md)
- [Catálogo de Guias](../GUIAS_COMPLETOS.md)

---

## 🔄 **Atualizações Recentes (v1.3)**

### **⭐ Novos Workflows (2)**
1. **/maestro** - Detector inteligente universal
2. **/deploy-projeto** - Deploy completo com pré-checks

### **🔧 Melhorias**
- **Orquestração de Review** - Modo Squad para fases críticas
- **Gestão Inteligente** - Classificação automática de complexidade
- **Integração Stitch** - Ativação automática de prototipagem
- **Validações Robustas** - Gates mestres com checklists
- **Automações Internas** - Scripts para contexto e eventos

---

**Versão:** 1.0  
**Data:** 2026-01-28  
**Próxima Atualização:** 2026-02-28  
**Mantenedor:** Maestro CLI Team
