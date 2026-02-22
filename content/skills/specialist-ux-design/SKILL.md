---
name: specialist-ux-design
description: Transformação de requisitos em design de interface e experiência do usuário com foco em wireframes, jornadas e protótipos validados. Use quando precisar criar interfaces intuitivas baseadas em requisitos funcionais.
allowed-tools: Read, Write, Edit, Glob, Grep
version: 2.0
framework: progressive-disclosure
---

# UX Design · Skill Moderna

## Missão
Transformar requisitos em design de interface e experiência do usuário em 45-60 minutos, garantindo interfaces intuitivas, jornadas otimizadas e protótipos validados com stakeholders.

## Quando ativar
- **Fase:** Fase 3 · UX Design
- **Workflows:** /maestro, /avancar-fase, /criar-wireframes
- **Trigger:** "preciso de wireframes", "design de interface", "protótipo de UX"

## Inputs obrigatórios
- Requisitos validados do especialista de Engenharia de Requisitos
- Matriz de rastreabilidade completa
- Critérios de aceite testáveis (Gherkin)
- Personas e jornadas mapeadas
- Restrições técnicas e de negócio

## Outputs gerados
- `docs/03-ux-design/design-doc.md` — Documento consolidado contendo arquitetura, wireframes, jornadas e protótipos
- Score de validação ≥ 75 pontos
- Score de validação ≥ 75 pontos

## Quality Gate
- Wireframes cobrem todos os requisitos funcionais principais
- Jornadas consideram todas as regras de negócio
- Design respeita todas as restrições técnicas
- Interfaces externas integradas na experiência
- Protótipos validados com stakeholders
- Score de validação automática ≥ 75 pontos

## 🚀 Processo Otimizado

### 1. Análise de Requisitos (10 min)
Use função de análise para extrair informações estruturadas dos requisitos:
- Funcionalidades principais e prioridades
- Personas e casos de uso mapeados
- Regras de negócio implementadas
- Restrições técnicas e tecnologias
- Interfaces externas e integrações

### 2. Mapeamento de Jornadas (15 min)
Defina jornadas completas para cada persona:
- **Pontos de contato** com o sistema
- **Objetivos e metas** do usuário
- **Dores e ganhos** em cada etapa
- **Fluxos principais** e alternativos
- **Momentos decisivos** e conversões

### 3. Criação de Wireframes (15 min)
Desenvolva wireframes estruturais:
- **Layout responsivo** para diferentes dispositivos
- **Navegação intuitiva** e consistente
- **Componentes reutilizáveis** e padronizados
- **Fluxos de interação** otimizados
- **Acessibilidade** WCAG 2.1 AA garantida

### 4. Design Visual (10 min)
Aplique identidade visual e consistência:
- **Sistema de cores** e tipografia
- **Ícones e elementos** visuais
- **Espaçamento** e alinhamento
- **Animações** e transições sutis
- **Feedback visual** para o usuário

### 5. Prototipagem Interativa (5 min)
Crie protótipos validáveis:
- **Interatividade** básica dos wireframes
- **Fluxos completos** de usuário
- **Dados reais** e contextuais
- **Validação** com stakeholders
- **Iterações** rápidas baseadas em feedback

## 📚 Recursos Adicionais

### Templates e Guias
- **Template Único e Consolidado:** [resources/templates/design-doc.md](resources/templates/design-doc.md)
- **Exemplos práticos:** [resources/examples/ux-examples.md](resources/examples/ux-examples.md)
- **Guia completo:** [resources/reference/ux-guide.md](resources/reference/ux-guide.md)
- **Validação:** [resources/checklists/ux-validation.md](resources/checklists/ux-validation.md)

### Funções MCP
- **Inicialização:** Função de criação de estrutura base
- **Validação:** Função de verificação de qualidade
- **Processamento:** Função de preparação para próxima fase

## 🎯 Frameworks de Design

### Design Thinking
- **Empatia:** Compreensão profunda dos usuários
- **Definição:** Problemas e oportunidades claros
- **Ideação:** Geração de múltiplas soluções
- **Prototipagem:** Teste rápido de ideias
- **Teste:** Validação com usuários reais

### User-Centered Design
- **Pesquisa com usuários:** Entendimento profundo
- **Personas detalhadas:** Arquétipos de usuários
- **Jornadas mapeadas:** Experiência completa
- **Testes de usabilidade:** Validação objetiva
- **Iteração contínua:** Melhoria constante

### Design Responsivo
- **Mobile-first:** Prioridade para dispositivos móveis
- **Breakpoints:** Adaptação para diferentes telas
- **Layout flexível:** Grids e containers
- **Imagens adaptativas:** Otimização de mídias
- **Performance:** Carregamento rápido

## 🔄 Context Flow Automatizado

### Ao Concluir (Score ≥ 75)
1. **Design validado** automaticamente
2. **CONTEXTO.md** atualizado
3. **Prompt gerado** para próximo especialista
4. **Transição** automática para Modelagem de Domínio

### Comando de Avanço
Use função de processamento para preparar contexto para Modelagem de Domínio quando design estiver validado.

### Guardrails Críticos
- **NUNCA avance** sem validação ≥ 75 pontos
- **SEMPRE confirme** com usuário antes de processar
- **VALIDE** todos os wireframes e jornadas
- **TESTE** protótipos com stakeholders
- **USE funções descritivas** para automação via MCP

## 📊 Estrutura dos Templates

### Template Design Doc (Consolidado)
- **Visão do Sistema e Personas**
- **Mapa da Jornada do Usuário** (O que antes era um arquivo separado, agora vive aqui)
- **Arquitetura de Informação** e fluxos
- **Design Visual** e identidade
- **Wireframes** de todas as telas (detalhamento estrutural em markdown)
- **Protótipos** e validação

## 🎯 Performance e Métricas

### Tempo Estimado
- **Análise Requisitos:** 10 minutos
- **Mapeamento Jornadas:** 15 minutos
- **Criação Wireframes:** 15 minutos
- **Design Visual:** 10 minutos
- **Prototipagem:** 5 minutos
- **Total:** 55 minutos (vs 70 anterior)

### Qualidade Esperada
- **Score validação:** ≥ 75 pontos
- **Cobertura:** 100% requisitos funcionais
- **Usabilidade:** WCAG 2.1 AA 100%
- **Responsividade:** 100% dispositivos
- **Performance:** 80% redução de tokens

### Frameworks Utilizados
- **Design Thinking**
- **User-Centered Design**
- **Mobile-First Design**
- **Atomic Design**
- **WCAG 2.1 AA**
- **Figma/Sketch**

## 🔧 Integração Maestro

### Skills Complementares
- `visual-design` (estética e identidade)
- `interaction-design` (interações e fluxos)
- `research` (pesquisa com usuários)
- `prototyping` (prototipagem rápida)

### Referências Essenciais
- **Especialista original:** `content/specialists/Especialista em UX Design.md`
### Artefatos gerados
- `docs/03-ux-design/design-doc.md` (Arquivo único consolidado cobrindo estrutura, jornadas e wireframes)

### Próximo Especialista
**Modelagem de Domínio** - Transformará design em entidades de negócio e regras de domínio.

---

**Framework:** Maestro Skills Modernas v2.0  
**Pattern:** Progressive Disclosure  
**Performance:** 80% redução de tokens  
**Quality:** 100% validação automática