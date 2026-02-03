# Plano de Adaptação dos Gates com Templates

## 📋 Sumário Executivo

**Objetivo:** Modernizar o sistema de validação de gates do Maestro para usar os templates estruturados das skills de especialistas, aumentando assertividade e flexibilidade sem perder qualidade.

**Status:** Em Planejamento  
**Data:** 2026-02-03  
**Responsável:** Sistema Maestro

---

## 1. Análise do Sistema Atual

### 1.1 Como Funciona Hoje

#### Estrutura de Validação Atual
- **Localização:** `src/src/gates/`
- **Arquivos principais:**
  - `estrutura.ts`: Define seções obrigatórias por fase (regex de headers, tamanhos mínimos)
  - `validator.ts`: Lógica de validação, checklists por tier
  - `tiers.ts`: Checklists separados por tier (essencial/base/avançado)

#### Método de Validação Atual
1. **Checklist genérico:** Lista de strings verificadas manualmente
2. **Validação de estrutura:** Regex para encontrar headers (ex: `^#{1,2}\\s*problema`)
3. **Tamanho mínimo:** Caracteres mínimos por tier
4. **Score:** Cálculo baseado em seções encontradas + tamanho

#### Limitações Identificadas
- ❌ Checklists são strings genéricas sem estrutura
- ❌ Validação de estrutura é superficial (apenas headers)
- ❌ Não valida conteúdo real das seções
- ❌ Não aproveita templates detalhados das skills
- ❌ Feedback limitado (apenas "encontrado" ou "faltando")
- ❌ Não valida checkboxes dos templates
- ❌ Sem validação de qualidade de conteúdo

### 1.2 Templates Disponíveis nas Skills

#### Mapeamento Fase → Skill → Templates

| Fase | Skill | Templates Disponíveis |
|------|-------|----------------------|
| Produto | specialist-gestao-produto | PRD.md |
| Requisitos | specialist-engenharia-requisitos-ia | requisitos.md, criterios-aceite.md, matriz-rastreabilidade.md |
| UX Design | specialist-ux-design | design-doc.md, jornada-usuario.md, wireframes.md |
| Modelo de Domínio | specialist-modelagem-dominio | modelo-dominio.md, entidades-relacionamentos.md, casos-uso.md, arquitetura-c4.md |
| Banco de Dados | specialist-banco-dados | design-banco.md, indices.md, migracoes.md, constraints.md |
| Arquitetura | specialist-arquitetura-software | arquitetura.md, adr.md, slo-sli.md |
| Segurança | specialist-seguranca-informacao | checklist-seguranca.md, threat-modeling.md, slo-sli.md |
| Backlog | specialist-plano-execucao-ia | backlog.md, historia-usuario.md, historia-frontend.md, historia-backend.md |
| Contrato API | specialist-contrato-api | contrato-api.md |

#### Características dos Templates
- ✅ Estrutura com checkboxes `[ ]` para validação
- ✅ Seções hierárquicas bem definidas
- ✅ Checklist de qualidade no final
- ✅ Campos obrigatórios marcados
- ✅ Exemplos e instruções inline
- ✅ Adaptáveis por complexidade

---

## 2. Proposta de Solução

### 2.1 Visão Geral

**Conceito:** Transformar templates em "contratos de validação" que definem estrutura esperada e critérios de qualidade.

### 2.2 Nova Arquitetura de Validação

#### Componentes Propostos

```
src/src/gates/
├── estrutura.ts (mantido, atualizado)
├── validator.ts (mantido, atualizado)
├── tiers.ts (mantido)
├── template-parser.ts (NOVO)
├── template-validator.ts (NOVO)
└── quality-scorer.ts (NOVO)
```

#### Fluxo de Validação Proposto

```
1. Carregar template da skill da fase
   ↓
2. Parsear template (extrair seções, checkboxes, campos obrigatórios)
   ↓
3. Validar estrutura do entregável contra template
   ↓
4. Validar conteúdo das seções (presença, qualidade)
   ↓
5. Validar checkboxes preenchidos
   ↓
6. Calcular score de qualidade
   ↓
7. Gerar feedback detalhado
```

### 2.3 Níveis de Validação

#### Nível 1: Estrutura (mantido e melhorado)
- Verifica presença de seções obrigatórias
- Valida hierarquia de headers
- Checa tamanho mínimo por seção

#### Nível 2: Conteúdo (NOVO)
- Valida campos obrigatórios preenchidos
- Verifica checkboxes marcados
- Detecta placeholders não substituídos (ex: `[Nome do Produto]`)
- Valida formato de tabelas e listas

#### Nível 3: Qualidade (NOVO)
- Score baseado em completude
- Análise de densidade de informação
- Validação de exemplos e dados concretos
- Checklist de qualidade do template

### 2.4 Sistema de Tiers Adaptativo

#### Tier Essencial
- Valida apenas seções críticas do template
- Aceita checkboxes parcialmente preenchidos (>50%)
- Tamanho mínimo reduzido

#### Tier Base
- Valida todas as seções principais
- Requer checkboxes principais preenchidos (>75%)
- Tamanho padrão

#### Tier Avançado
- Valida todas as seções incluindo opcionais
- Requer todos os checkboxes preenchidos (>90%)
- Valida qualidade de conteúdo
- Checklist de qualidade completo

---

## 3. Plano de Implementação

### 3.1 Fase 1: Parser de Templates (2-3h)

#### Objetivo
Criar sistema para extrair estrutura de validação dos templates.

#### Tarefas
1. **Criar `template-parser.ts`**
   - Função `parseTemplate(templatePath)` → `TemplateStructure`
   - Extrair seções com regex melhorado
   - Identificar checkboxes e campos obrigatórios
   - Detectar tabelas e listas
   - Extrair checklist de qualidade

2. **Definir tipos TypeScript**
   ```typescript
   interface TemplateStructure {
     secoes: TemplateSection[];
     checkboxes: TemplateCheckbox[];
     camposObrigatorios: string[];
     checklistQualidade: string[];
     metadata: TemplateMetadata;
   }
   
   interface TemplateSection {
     nivel: number;
     titulo: string;
     obrigatorio: boolean;
     tierMinimo: TierGate;
     subsecoes: TemplateSection[];
     checkboxes: TemplateCheckbox[];
   }
   
   interface TemplateCheckbox {
     secao: string;
     texto: string;
     obrigatorio: boolean;
     tierMinimo: TierGate;
   }
   ```

3. **Testes unitários**
   - Testar parsing de cada template
   - Validar extração de checkboxes
   - Verificar hierarquia de seções

### 3.2 Fase 2: Validador Baseado em Template (3-4h)

#### Objetivo
Implementar validação usando estrutura extraída do template.

#### Tarefas
1. **Criar `template-validator.ts`**
   - Função `validarContraTemplate(entregavel, template, tier)`
   - Validar estrutura de seções
   - Validar checkboxes preenchidos
   - Detectar placeholders não substituídos
   - Validar campos obrigatórios

2. **Integrar com `validator.ts` existente**
   - Manter compatibilidade com sistema atual
   - Adicionar modo "template" vs "legacy"
   - Fallback para validação antiga se template não existir

3. **Implementar feedback detalhado**
   - Listar seções faltantes com contexto
   - Mostrar checkboxes não preenchidos
   - Indicar placeholders a substituir
   - Sugerir melhorias específicas

### 3.3 Fase 3: Score de Qualidade (2h)

#### Objetivo
Calcular score mais preciso baseado em múltiplos critérios.

#### Tarefas
1. **Criar `quality-scorer.ts`**
   - Score de estrutura (30%)
   - Score de conteúdo (40%)
   - Score de checkboxes (20%)
   - Score de qualidade (10%)

2. **Implementar critérios de qualidade**
   - Densidade de informação (chars/seção)
   - Ausência de placeholders
   - Presença de dados concretos
   - Checklist de qualidade completo

3. **Gerar relatório de qualidade**
   - Breakdown do score por critério
   - Sugestões de melhoria priorizadas
   - Comparação com tier esperado

### 3.4 Fase 4: Atualização de Tools (1-2h)

#### Objetivo
Atualizar `validar-gate.ts` para usar novo sistema.

#### Tarefas
1. **Atualizar `validar-gate.ts`**
   - Carregar template da skill da fase
   - Usar novo validador se template existir
   - Exibir feedback enriquecido
   - Mostrar progresso de checkboxes

2. **Melhorar output da tool**
   - Seção "Template Usado"
   - Progresso visual de checkboxes (ex: ✅ 15/20)
   - Breakdown do score
   - Link para template de referência

3. **Adicionar modo de ajuda**
   - Mostrar template vazio se não houver entregável
   - Sugerir estrutura mínima
   - Listar checkboxes obrigatórios

### 3.5 Fase 5: Migração de Estruturas (2h)

#### Objetivo
Atualizar `estrutura.ts` para usar templates como fonte.

#### Tarefas
1. **Gerar estruturas dinamicamente**
   - Ler templates em tempo de build/runtime
   - Extrair seções obrigatórias
   - Manter cache de estruturas

2. **Manter compatibilidade**
   - Fallback para estruturas hardcoded
   - Modo híbrido (template + estrutura)

3. **Documentar mapeamento**
   - Fase → Template principal
   - Templates alternativos por tier

### 3.6 Fase 6: Testes e Documentação (2h)

#### Objetivo
Garantir qualidade e documentar mudanças.

#### Tarefas
1. **Testes de integração**
   - Testar validação de cada fase
   - Validar com entregáveis reais
   - Testar todos os tiers

2. **Atualizar documentação**
   - Guia de uso do novo sistema
   - Como criar/atualizar templates
   - Troubleshooting

3. **Criar exemplos**
   - Entregáveis válidos por fase
   - Casos de erro comuns
   - Progressão de qualidade

---

## 4. Benefícios Esperados

### 4.1 Para Usuários
- ✅ Feedback mais claro e acionável
- ✅ Validação mais precisa e justa
- ✅ Templates como guia de preenchimento
- ✅ Menos retrabalho

### 4.2 Para o Sistema
- ✅ Validação baseada em contratos
- ✅ Fácil manutenção (atualizar template = atualizar validação)
- ✅ Extensível (novos templates = novas validações)
- ✅ Consistência entre skills e gates

### 4.3 Para Qualidade
- ✅ Entregáveis mais completos
- ✅ Padrão de qualidade claro
- ✅ Rastreabilidade de requisitos
- ✅ Melhoria contínua baseada em templates

---

## 5. Riscos e Mitigações

### 5.1 Riscos Técnicos

#### Risco: Templates inconsistentes entre skills
- **Probabilidade:** Média
- **Impacto:** Médio
- **Mitigação:** Criar template padrão e guia de criação

#### Risco: Performance ao parsear templates
- **Probabilidade:** Baixa
- **Impacto:** Baixo
- **Mitigação:** Cache de estruturas parseadas

#### Risco: Quebra de compatibilidade
- **Probabilidade:** Média
- **Impacto:** Alto
- **Mitigação:** Manter modo legacy, migração gradual

### 5.2 Riscos de Adoção

#### Risco: Validação muito rígida
- **Probabilidade:** Média
- **Impacto:** Médio
- **Mitigação:** Sistema de tiers flexível, modo "sugestão"

#### Risco: Curva de aprendizado
- **Probabilidade:** Baixa
- **Impacto:** Baixo
- **Mitigação:** Templates como guia, exemplos claros

---

## 6. Cronograma

| Fase | Duração | Dependências | Entregável |
|------|---------|--------------|------------|
| 1. Parser de Templates | 2-3h | - | `template-parser.ts` + testes |
| 2. Validador Template | 3-4h | Fase 1 | `template-validator.ts` + integração |
| 3. Score de Qualidade | 2h | Fase 2 | `quality-scorer.ts` |
| 4. Atualização Tools | 1-2h | Fase 2, 3 | `validar-gate.ts` atualizado |
| 5. Migração Estruturas | 2h | Fase 1, 2 | `estrutura.ts` atualizado |
| 6. Testes e Docs | 2h | Todas | Documentação + exemplos |
| **TOTAL** | **12-15h** | - | Sistema completo |

---

## 7. Critérios de Sucesso

### 7.1 Técnicos
- [ ] Parser extrai 100% das seções de templates
- [ ] Validação detecta 95%+ dos problemas reais
- [ ] Score correlaciona com qualidade percebida
- [ ] Performance < 100ms por validação
- [ ] Cobertura de testes > 80%

### 7.2 Funcionais
- [ ] Todas as 13 fases têm validação por template
- [ ] Feedback é acionável (usuário sabe o que fazer)
- [ ] Sistema de tiers funciona corretamente
- [ ] Compatibilidade com sistema anterior

### 7.3 Qualidade
- [ ] Entregáveis validados têm qualidade superior
- [ ] Redução de retrabalho em 50%+
- [ ] Usuários entendem requisitos claramente
- [ ] Templates são referência de qualidade

---

## 8. Próximos Passos Imediatos

1. ✅ **Criar este documento de planejamento**
2. ⏳ **Implementar Fase 1: Parser de Templates**
3. ⏳ **Implementar Fase 2: Validador Template**
4. ⏳ **Implementar Fase 3: Score de Qualidade**
5. ⏳ **Implementar Fase 4: Atualização Tools**
6. ⏳ **Implementar Fase 5: Migração Estruturas**
7. ⏳ **Implementar Fase 6: Testes e Documentação**
8. ⏳ **Solicitar revisão final**

---

## 9. Notas de Implementação

### 9.1 Decisões de Design

#### Por que parsear templates em runtime?
- Templates podem ser atualizados sem rebuild
- Facilita contribuições da comunidade
- Permite customização por projeto

#### Por que manter sistema legacy?
- Compatibilidade com projetos existentes
- Fallback se template não existir
- Migração gradual e segura

#### Por que sistema de tiers?
- Flexibilidade para diferentes contextos
- Não impõe burocracia desnecessária
- Escala com complexidade do projeto

### 9.2 Extensões Futuras

- [ ] Validação de conteúdo com IA (GPT-4)
- [ ] Sugestões automáticas de melhoria
- [ ] Templates dinâmicos por stack
- [ ] Validação de diagramas e imagens
- [ ] Integração com CI/CD
- [ ] Dashboard de qualidade de entregáveis

---

**Versão:** 1.0  
**Última atualização:** 2026-02-03  
**Status:** Aprovado para Implementação
