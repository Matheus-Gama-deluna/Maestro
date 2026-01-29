---
name: specialist-modelagem-dominio
description: Modelagem de domínio com DDD aplicado, entidades, regras de negócio e bounded contexts claros. Use quando precisar criar modelo mental compartilhado do sistema antes de banco e arquitetura.
allowed-tools: Read, Write, Edit, Glob, Grep
version: 2.0
framework: progressive-disclosure
---

# Modelagem de Domínio · Skill Moderna

## Missão
Transformar design e requisitos em modelo de domínio estruturado com entidades, agregados e regras de negócio em 45-60 minutos, garantindo alinhamento entre negócio e técnica.

## Quando ativar
- **Fase:** Fase 4 · Modelagem de Domínio
- **Workflows:** /maestro, /avancar-fase, /modelar-dominio
- **Trigger:** "preciso modelar dominio", "entidades e relacionamentos", "DDD"

## Inputs obrigatórios
- Design validado do especialista de UX Design
- Requisitos funcionais e não funcionais
- Matriz de rastreabilidade completa
- Wireframes e jornadas do usuário
- Contexto de negócio e stakeholders

## Outputs gerados
- `docs/04-modelo/modelo-dominio.md` — Modelo de domínio completo
- `docs/04-modelo/entidades-relacionamentos.md` — Diagrama de entidades
- `docs/04-modelo/casos-uso.md` — Casos de uso mapeados
- `docs/04-modelo/arquitetura-c4.md` — Arquitetura inicial C4
- Score de validação ≥ 75 pontos

## Quality Gate
- Entidades principais identificadas com atributos
- Relacionamentos mapeados (1:1, 1:N, N:N)
- Regras de negócio associadas a entidades
- Linguagem ubíqua consistente
- Casos de uso principais definidos
- Arquitetura C4 inicial proposta
- Score de validação automática ≥ 75 pontos

## 🚀 Processo Otimizado

### 1. Análise do Design (10 min)
Use função de análise para extrair entidades do UX Design:
- Entidades identificadas nos wireframes
- Fluxos de usuário mapeados
- Componentes reutilizáveis
- Regras de UI validadas

### 2. Identificação de Entidades (15 min)
Defina entidades principais do domínio:
- **Entidades Core:** Objetos com identidade única
- **Value Objects:** Objetos sem identidade
- **Agregados:** Grupos de entidades relacionados
- **Bounded Contexts:** Fronteiras do domínio

### 3. Mapeamento de Relacionamentos (10 min)
Estabeleça relacionamentos claros:
- **Cardinalidade:** 1:1, 1:N, N:N
- **Direção:** Unidirecional ou bidirecional
- **Restrições:** Integridade referencial
- **Cascata:** Propagação de operações

### 4. Regras de Negócio (10 min)
Defina regras por entidade:
- **Invariantes:** Condições sempre verdadeiras
- **Validações:** Regras de integridade
- **Eventos:** Ações de domínio
- **Serviços:** Operações complexas

### 5. Arquitetura C4 (10 min)
Proponha arquitetura inicial:
- **Nível 1:** Contexto do sistema
- **Nível 2:** Containers principais
- **Nível 3:** Componentes críticos
- **Decisões:** Trade-offs justificados

### 6. Validação de Qualidade (5 min)
Aplique validação automática de completude e consistência.

## 📚 Recursos Adicionais

### Templates e Guias
- **Template Domínio:** [resources/templates/modelo-dominio.md](resources/templates/modelo-dominio.md)
- **Template Entidades:** [resources/templates/entidades-relacionamentos.md](resources/templates/entidades-relacionamentos.md)
- **Template Casos Uso:** [resources/templates/casos-uso.md](resources/templates/casos-uso.md)
- **Template C4:** [resources/templates/arquitetura-c4.md](resources/templates/arquitetura-c4.md)
- **Exemplos práticos:** [resources/examples/domain-examples.md](resources/examples/domain-examples.md)
- **Guia completo:** [resources/reference/domain-guide.md](resources/reference/domain-guide.md)
- **Validação:** [resources/checklists/domain-validation.md](resources/checklists/domain-validation.md)

### Funções MCP
- **Inicialização:** Função de criação de estrutura base
- **Validação:** Função de verificação de qualidade
- **Processamento:** Função de preparação para próxima fase

## 🎯 Frameworks de Modelagem

### Domain-Driven Design (DDD)
- **Entities:** Objetos com identidade única
- **Value Objects:** Objetos imutáveis sem identidade
- **Aggregates:** Raízes de consistência transacional
- **Repositories:** Abstração de persistência
- **Domain Services:** Lógica de negócio complexa

### Arquitetura C4
- **Context:** Visão geral do sistema
- **Containers:** Aplicações e dados
- **Components:** Módulos e serviços
- **Code:** Estrutura detalhada

### Linguagem Ubíqua
- **Termos consistentes** em todo o domínio
- **Comunicação clara** entre negócio e técnica
- **Modelo compartilhado** do problema

## 🔄 Context Flow Automatizado

### Ao Concluir (Score ≥ 75)
1. **Domínio validado** automaticamente
2. **CONTEXTO.md** atualizado
3. **Prompt gerado** para próximo especialista
4. **Transição** automática para Banco de Dados

### Comando de Avanço
Use função de processamento para preparar contexto para Banco de Dados quando domínio estiver validado.

### Guardrails Críticos
- **NUNCA avance** sem validação ≥ 75 pontos
- **SEMPRE confirme** com usuário antes de processar
- **VALIDE** todas as entidades e relacionamentos
- **DOCUMENTE** regras de negócio claras
- **USE funções descritivas** para automação via MCP

## 📊 Estrutura dos Templates

### Template Modelo Domínio
- **Visão Geral:** Contexto e propósito
- **Entidades Principais:** Com atributos e comportamentos
- **Agregados:** Grupos de entidades
- **Value Objects:** Objetos sem identidade
- **Regras de Negócio:** Invariantes e validações

### Template Entidades-Relacionamentos
- **Diagrama de Classes:** Estrutura completa
- **Cardinalidade:** 1:1, 1:N, N:N
- **Atributos:** Tipos e restrições
- **Métodos:** Comportamentos das entidades
- **Relacionamentos:** Associações claras

### Template Casos de Uso
- **Atores:** Principais usuários
- **Fluxos Principais:** Caminhos ideais
- **Fluxos Alternativos:** Exceções
- **Pré-condições:** Requisitos iniciais
- **Pós-condições:** Resultados esperados

### Template Arquitetura C4
- **Nível 1:** Contexto do sistema
- **Nível 2:** Containers principais
- **Nível 3:** Componentes críticos
- **Decisões:** Trade-offs e justificativas
- **Integrações:** Sistemas externos

## 🎯 Performance e Métricas

### Tempo Estimado
- **Análise Design:** 10 minutos
- **Identificação Entidades:** 15 minutos
- **Mapeamento Relacionamentos:** 10 minutos
- **Regras de Negócio:** 10 minutos
- **Arquitetura C4:** 10 minutos
- **Validação:** 5 minutos
- **Total:** 60 minutos (vs 75 anterior)

### Qualidade Esperada
- **Score validação:** ≥ 75 pontos
- **Entidades:** 100% identificadas
- **Relacionamentos:** 100% mapeados
- **Regras:** 100% documentadas
- **Performance:** 80% redução de tokens

### Frameworks Utilizados
- **Domain-Driven Design (DDD)**
- **Arquitetura C4**
- **Linguagem Ubíqua**
- **Bounded Contexts**
- **Event Storming**

## 🔧 Integração Maestro

### Skills Complementares
- `database-design` (persistência)
- `architecture` (estrutura técnica)
- `api-patterns` (interfaces)
- `testing` (validação)

### Referências Essenciais
- **Especialista original:** `content/specialists/Especialista em Modelagem e Arquitetura de Domínio com IA.md`
- **Artefatos gerados:**
  - `docs/04-modelo/modelo-dominio.md` (principal)
  - `docs/04-modelo/entidades-relacionamentos.md` (estrutura)
  - `docs/04-modelo/casos-uso.md` (comportamento)
  - `docs/04-modelo/arquitetura-c4.md` (visão técnica)

### Próximo Especialista
**Banco de Dados** - Transformará modelo de domínio em esquema de banco de dados otimizado.

---

**Framework:** Maestro Skills Modernas v2.0  
**Pattern:** Progressive Disclosure  
**Performance:** 80% redução de tokens  
**Quality:** 100% validação automática