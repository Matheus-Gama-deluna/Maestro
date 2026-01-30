# 📚 Relação Especialistas × Prompts Maestro

**Versão:** 2.0  
**Data:** 2026-01-30  
**Objetivo:** Mapear cada especialista documentado no catálogo do Maestro ao(s) prompt(s) oficial(is) que ele deve usar para acelerar sua atividade, indicando cobertura e lacunas.

---

## 🔎 Como interpretar
- **Prompt Principal:** prompt obrigatório ou mais usado pelo especialista para gerar seu artefato principal.
- **Prompts Secundários:** prompts complementares que o especialista pode usar para refinar ou validar seu trabalho.
- **Status:** indica se já existe prompt padronizado para o especialista ou se há lacuna a ser preenchida.
- **Prioridade:** ⭐⭐⭐⭐⭐ (Crítica) a ⭐ (Baixa)

---

## 🧭 Matriz Completa - 25 Especialistas

### **FASE 1: Especialistas Críticos (8 especialistas)**

| # | Especialista | Prompt Principal | Prompts Secundários | Prioridade | Status |
|---|--------------|------------------|---------------------|------------|--------|
| 1 | **Gestão de Produto** | `produto/discovery-inicial.md` | *(nenhum)* | ⭐⭐⭐ | ✅ Coberto |
| 2 | **Engenharia de Requisitos** | `requisitos/refinar-requisitos.md` | `requisitos/backlog-execucao.md` | ⭐⭐⭐ | ✅ Coberto |
| 3 | **UX Design** | `ux/design-doc-completo.md` | `ux/gerar-ui-stitch.md` | ⭐⭐⭐⭐ | ✅ Coberto |
| 4 | **Modelagem de Domínio** | `arquitetura/modelo-dominio.md` | `arquitetura/ddd-bounded-contexts.md`, `arquitetura/ddd-cqrs.md` | ⭐⭐⭐⭐⭐ | ✅ 🔗 **INTEGRADO** |
| 5 | **Banco de Dados** | `database/otimizacao-queries.md` | `database/migrations-zero-downtime.md` | ⭐⭐⭐⭐ | ✅ Coberto |
| 6 | **Arquitetura de Software** | `arquitetura/arquitetura-c4-completo.md` | `arquitetura/clean-architecture.md`, `arquitetura/multi-tenancy.md` | ⭐⭐⭐⭐⭐ | ✅ **CRÍTICO** |
| 7 | **Segurança da Informação** | `seguranca/analise-seguranca.md` | `seguranca/threat-modeling.md`, `seguranca/revisao-lgpd.md`, `seguranca/pentest-checklist.md`, `seguranca/rate-limiting.md` | ⭐⭐⭐⭐⭐ | ✅ **CRÍTICO** |
| 8 | **Desenvolvimento Frontend** | `desenvolvimento/componentes-hooks.md` | `ux/gerar-ui-stitch.md`, `desenvolvimento/code-review.md` | ⭐⭐⭐⭐ | ✅ Coberto |

---

### **FASE 2: Especialistas Principais (9 especialistas)**

| # | Especialista | Prompt Principal | Prompts Secundários | Prioridade | Status |
|---|--------------|------------------|---------------------|------------|--------|
| 9 | **Análise de Testes** | `testes/gerar-testes-unitarios.md` | `testes/testes-integracao.md`, `testes/testes-e2e.md`, `testes/testes-performance.md`, `testes/contract-testing.md` | ⭐⭐⭐⭐⭐ | ✅ **CRÍTICO** |
| 10 | **Plano de Execução** | `requisitos/backlog-execucao.md` | *(nenhum)* | ⭐⭐⭐ | ✅ Coberto |
| 11 | **Contrato de API** | `apis/design-api-rest.md` | `apis/idempotencia.md`, `apis/versionamento.md`, `testes/contract-testing.md` | ⭐⭐⭐⭐⭐ | ✅ **CRÍTICO** |
| 12 | **Desenvolvimento Backend** | `desenvolvimento/gerar-servico.md` | `desenvolvimento/code-review.md`, `apis/idempotencia.md` | ⭐⭐⭐ | ✅ Coberto |
| 13 | **DevOps e Infraestrutura** | `devops/pipeline-cicd.md` | `devops/docker-compose.md`, `devops/kubernetes-deploy.md`, `devops/terraform-iac.md`, `devops/feature-flags.md` | ⭐⭐⭐⭐⭐ | ✅ **CRÍTICO** |
| 14 | **Dados e Analytics** | `dados/dashboards-analytics.md` | `documentacao/guia-tecnico.md` | ⭐⭐⭐⭐ | ✅ Coberto |
| 15 | **Documentação Técnica** | `documentacao/guia-tecnico.md` | *(nenhum)* | ⭐⭐⭐ | ✅ Coberto |
| 16 | **Acessibilidade** | `acessibilidade/analise-acessibilidade.md` | `seguranca/checklist-seguranca.md`, `ux/design-doc-completo.md` | ⭐⭐⭐⭐⭐ | ✅ **CRÍTICO** |
| 17 | **Debugging e Troubleshooting** | `debugging/analise-bugs.md` (14KB) ⭐⭐ | `desenvolvimento/code-review.md` | ⭐⭐⭐⭐⭐ | ✅ 🔗 **INTEGRADO** |

---

### **FASE 3: Especialistas Complementares (5 especialistas)**

| # | Especialista | Prompt Principal | Prompts Secundários | Prioridade | Status |
|---|--------------|------------------|---------------------|------------|--------|
| 18 | **Prototipagem com Stitch** | `ux/gerar-ui-stitch.md` | `acessibilidade/analise-acessibilidade.md` | ⭐⭐⭐⭐⭐ | ✅ **CRÍTICO** |
| 19 | **Desenvolvimento Mobile** | `mobile/mobile-ios.md`, `mobile/mobile-android.md` | `ux/gerar-ui-stitch.md` | ⭐⭐⭐⭐⭐ | ✅ **CRÍTICO** |
| 20 | **Exploração de Codebase** | `exploracao/codebase-exploration.md` | `debugging/analise-bugs.md` | ⭐⭐⭐⭐ | ✅ Coberto |
| 21 | **Migração e Modernização** | `arquitetura/plano-migracao.md` | `database/migrations-zero-downtime.md` | ⭐⭐⭐⭐ | ✅ Coberto |
| 22 | **Mobile Design Avançado** | `mobile/mobile-ios.md`, `mobile/mobile-android.md` | `ux/design-doc-completo.md` | ⭐⭐⭐⭐ | ✅ Coberto |

---

### **FASE 4: Especialistas Avançados (3 especialistas)**

| # | Especialista | Prompt Principal | Prompts Secundários | Prioridade | Status |
|---|--------------|------------------|---------------------|------------|--------|
| 23 | **Arquitetura Avançada** | `arquitetura/ddd-bounded-contexts.md` | `arquitetura/ddd-cqrs.md`, `arquitetura/multi-tenancy.md` | ⭐⭐⭐⭐⭐ | ✅ **CRÍTICO** |
| 24 | **Performance e Escalabilidade** | `escalabilidade/analise-performance.md` | `escalabilidade/caching.md`, `testes/testes-performance.md`, `observabilidade/slos.md` | ⭐⭐⭐⭐⭐ | ✅ **CRÍTICO** |
| 25 | **Observabilidade** | `observabilidade/estrategia-observabilidade.md` | `observabilidade/slos.md`, `observabilidade/chaos-testing.md` | ⭐⭐⭐⭐⭐ | ✅ **CRÍTICO** |

---

## 📊 Estatísticas de Cobertura

### Por Prioridade
- **⭐⭐⭐⭐⭐ Crítica:** 13 especialistas (52%)
- **⭐⭐⭐⭐ Importante:** 6 especialistas (24%)
- **⭐⭐⭐ Média:** 6 especialistas (24%)

### Por Status
- **✅ 🔗 Integrado:** 2 especialistas (8%) - Debugging, Modelagem de Domínio
- **✅ Coberto:** 23 especialistas (92%)
- **⚠️ Lacuna:** 0 especialistas (0%)

### Prompts Mais Utilizados
1. **Segurança** - 5 prompts (analise-seguranca, threat-modeling, revisao-lgpd, pentest-checklist, rate-limiting)
2. **Testes** - 5 prompts (gerar-testes-unitarios, testes-integracao, testes-e2e, testes-performance, contract-testing)
3. **DevOps** - 5 prompts (pipeline-cicd, docker-compose, kubernetes-deploy, terraform-iac, feature-flags)
4. **Arquitetura** - 7 prompts (modelo-dominio, arquitetura-c4, clean-architecture, ddd-bounded-contexts, ddd-cqrs, multi-tenancy, plano-migracao)
5. **APIs** - 4 prompts (design-api-rest, idempotencia, versionamento, contract-testing)

### Prompts por Categoria

| Categoria | Quantidade | Especialistas Atendidos |
|-----------|------------|------------------------|
| **Segurança** | 5 | Segurança da Informação, Acessibilidade |
| **Testes** | 5 | Análise de Testes, Contrato de API, Performance |
| **DevOps** | 5 | DevOps e Infraestrutura |
| **Arquitetura** | 7 | Modelagem, Arquitetura, Arquitetura Avançada, Migração |
| **APIs** | 3 | Contrato de API, Backend |
| **Observabilidade** | 4 | Observabilidade, Performance |
| **Escalabilidade** | 3 | Performance e Escalabilidade |
| **Database** | 2 | Banco de Dados, Migração |
| **Mobile** | 2 | Desenvolvimento Mobile, Mobile Design |
| **UX** | 2 | UX Design, Prototipagem Stitch |
| **Desenvolvimento** | 3 | Frontend, Backend |
| **Requisitos** | 2 | Engenharia de Requisitos, Plano de Execução |
| **Produto** | 1 | Gestão de Produto |
| **Dados** | 1 | Dados e Analytics |
| **Documentação** | 1 | Documentação Técnica |
| **Acessibilidade** | 1 | Acessibilidade |
| **Debugging** | 1 | Debugging e Troubleshooting |
| **Exploração** | 1 | Exploração de Codebase |

**Total:** 48 prompts únicos

---

## 📌 Notas Importantes

### Prompts Críticos (>10KB ou metodologia completa)
1. **debugging/analise-bugs.md** (14KB) ⭐⭐
   - Metodologia completa: 5 Whys, Fishbone Diagram, RCA
   - Template de análise detalhado
   - Exemplos práticos de bugs

### Prompts com Múltiplos Secundários
1. **Segurança da Informação** - 4 prompts secundários
2. **Análise de Testes** - 4 prompts secundários
3. **DevOps e Infraestrutura** - 4 prompts secundários
4. **Contrato de API** - 3 prompts secundários
5. **Arquitetura de Software** - 2 prompts secundários

### Estrutura Padrão dos Prompts
Todos os prompts seguem a mesma estrutura:
```markdown
# Prompt: [Nome]

> **Quando usar**: [Contexto]
> **Especialista**: [Link para especialista]
> **Nível**: [Simples/Médio/Complexo]

---

## Fluxo de Contexto
[Documentos de entrada e saída]

## Prompt Completo
[Prompt para copiar]

## Exemplo de Uso
[Exemplo preenchido]

## Resposta Esperada
[Exemplo de saída]

## Checklist Pós-Geração
[Validações do resultado]
```

### Integração com Resources
Todos os prompts devem ser copiados para `resources/prompts/` dos especialistas correspondentes para facilitar acesso e uso.

---

## ✅ Próximos Passos Sugeridos

### Prioridade CRÍTICA
1. **Integrar prompts nos resources/** dos especialistas
2. **Validar prompts críticos** (>10KB ou metodologia completa)
3. **Criar exemplos preenchidos** para prompts principais

### Prioridade ALTA
4. **Publicar exemplos práticos** para todos os prompts
5. **Criar scripts de validação** para os prompts de análise
6. **Integrar prompts com templates** para automação maior

### Prioridade MÉDIA
7. **Treinar equipe** sobre o uso dos prompts
8. **Monitorar adoção** e coletar feedback para melhorias
9. **Manter documentação atualizada** com evoluções

---

## 🎯 Plano de Integração

### Fase 1: Integração Imediata (17 especialistas implementados)
Copiar prompts relevantes para `resources/prompts/` de cada especialista:

**Críticos (⭐⭐⭐⭐⭐):**
- Modelagem de Domínio (3 prompts)
- Arquitetura de Software (3 prompts)
- Segurança da Informação (5 prompts)
- Análise de Testes (5 prompts)
- Contrato de API (4 prompts)
- DevOps e Infraestrutura (5 prompts)
- Acessibilidade (1 prompt)
- Debugging e Troubleshooting (1 prompt)

**Importantes (⭐⭐⭐⭐):**
- UX Design (2 prompts)
- Banco de Dados (2 prompts)
- Desenvolvimento Frontend (2 prompts)
- Dados e Analytics (1 prompt)

**Médios (⭐⭐⭐):**
- Gestão de Produto (1 prompt)
- Engenharia de Requisitos (2 prompts)
- Plano de Execução (1 prompt)
- Desenvolvimento Backend (2 prompts)
- Documentação Técnica (1 prompt)

### Fase 2: Uso como Base (8 especialistas a implementar)
Usar prompts como referência para criar examples e checklists:

**Críticos (⭐⭐⭐⭐⭐):**
- Prototipagem com Stitch (1 prompt)
- Desenvolvimento Mobile (2 prompts)
- Arquitetura Avançada (3 prompts)
- Performance e Escalabilidade (4 prompts)
- Observabilidade (3 prompts)

**Importantes (⭐⭐⭐⭐):**
- Exploração de Codebase (1 prompt)
- Migração e Modernização (2 prompts)
- Mobile Design Avançado (2 prompts)

---

## 📈 Impacto da Integração

### Benefícios Esperados
1. **Aceleração:** Prompts prontos reduzem tempo de criação em 50-70%
2. **Qualidade:** Templates garantem consistência e completude
3. **Padronização:** Todos seguem mesma estrutura e metodologia
4. **Aprendizado:** Exemplos práticos facilitam entendimento

### Métricas de Sucesso
- **Cobertura:** 100% dos especialistas com prompts (✅ Alcançado)
- **Uso:** >80% dos especialistas usando prompts regularmente
- **Qualidade:** Score médio >85 nos entregáveis gerados
- **Tempo:** Redução de 50% no tempo de criação de artefatos

---

**Versão:** 2.0  
**Última Atualização:** 2026-01-30  
**Cobertura:** 100% (25/25 especialistas)  
**Prompts Totais:** 48 prompts únicos  
**Integração:** 8% (2/25 especialistas, 4 prompts integrados) - Debugging, Modelagem de Domínio  
**Próxima Revisão:** Após integração dos 6 especialistas críticos restantes (20 prompts)
