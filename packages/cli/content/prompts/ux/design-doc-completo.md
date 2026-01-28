# Prompt: Design Document Completo

> **Quando usar:** Criar documentação completa de UX Design para um projeto  
> **Especialista:** UX Design  
> **Nível:** Médio  
> **Pré-requisitos:** PRD aprovado, requisitos funcionais definidos

---

## Fluxo de Contexto
**Inputs:** PRD.md, requisitos.md  
**Outputs:** design-doc.md, mapa-navegacao.md  
**Especialista anterior:** Engenharia de Requisitos  
**Especialista seguinte:** Modelagem de Domínio

---

## Prompt Completo

Atue como um **UX Designer Sênior** com 12+ anos de experiência em produtos com milhões de usuários.

## Contexto do Projeto
[COLE CONTEÚDO DE docs/01-produto/PRD.md]

[COLE CONTEÚDO DE docs/02-requisitos/requisitos.md]

## Sua Missão
Criar um **Design Document completo** que servirá como guia para todo o desenvolvimento frontend. O documento deve ser abrangente, prático e seguir as melhores práticas de UX Design modernas.

### Estrutura Obrigatória do Design Document

#### 1. Visão Geral de UX e Princípios de Design
- **Filosofia de Design:** [Definir abordagem principal]
- **Princípios Core:** [3-5 princípios que guiarão o design]
- **Design Commitment:** [Declaração obrigatória de estilo escolhido]
- **Purple Ban:** [Confirmar proibição de roxo]
- **Safe Harbor:** [Confirmar evitar clichês de design]

#### 2. Personas e Jornadas (Mermaid)
- **Personas Detalhadas:** [Expandir personas do PRD com detalhes de UX]
- **Jornadas Principais:** [Mapear 3-5 jornadas críticas]
- **Pain Points:** [Identificar dores a serem resolvidas]
- **Opportunities:** [Oportunidades de melhoria]

#### 3. Arquitetura de Informação
- **Mapa do Site Completo:** [Estrutura hierárquica]
- **Taxonomia:** [Categorias e classificações]
- **Navegação Principal:** [Menu principal e submenus]
- **Breadcrumbs:** [Navegação estrutural]

#### 4. Mapa de Navegação Detalhado
- **Diagrama Completo:** [Mermaid com todas as telas]
- **Inventário de Telas:** [Tabela com ID, Nome, URL, Acesso, RFs]
- **Fluxos de Navegação:** [Como o usuário se move]
- **Deep Links:** [Links diretos importantes]

#### 5. Fluxos de Usuário (Mermaid)
- **Fluxos Principais:** [5-7 fluxos críticos]
- **Happy Paths:** [Caminhos ideais]
- **Edge Cases:** [Casos excepcionais]
- **Error Flows:** [Tratamento de erros]

#### 6. Wireframes (Descrição Detalhada)
- **Layout Base:** [Estrutura do grid, breakpoints]
- **Componentes Principais:** [Header, footer, sidebar, etc]
- **Estados:** [Loading, empty, error, success]
- **Responsive:** [Desktop, tablet, mobile]

#### 7. Design System
- **Cores:** [Paleta completa com hex codes e significado]
- **Tipografia:** [Fontes, tamanhos, pesos, line heights]
- **Espaçamento:** [Sistema de spacing consistente]
- **Componentes:** [Botões, forms, cards, modals]
- **Ícones:** [Sistema de ícones]
- **Database Design System:** [Se já utilizado]

#### 8. Acessibilidade (WCAG AA)
- **Nível de Conformidade:** [WCAG 2.1 AA como mínimo]
- **Contraste:** [Validação de todas as combinações]
- **Screen Readers:** [Suporte completo]
- **Navegação por Teclado:** [100% funcional]
- **ARIA Labels:** [Onde necessário]

#### 9. Responsividade
- **Breakpoints:** [Definir pontos de quebra]
- **Mobile First:** [Abordagem mobile-first]
- **Adaptive Layout:** [Como layout se adapta]
- **Touch Targets:** [Mínimo 44px]

#### 10. Interações e Micro-animações
- **Animações:** [Onde e como usar]
- **Transições:** [Entre estados e telas]
- **Feedback Visual:** [Respostas a ações]
- **Loading States:** [Indicadores de progresso]

#### 11. Conteúdo e Copy
- **Tom de Voz:** [Definir personalidade]
- **Mensagens de Sistema:** [Success, error, warning]
- **Help Text:** [Textos de ajuda]
- **Tooltip Strategy:** [Quando usar tooltips]

#### 12. Validação e Testes
- **Testes de Usabilidade:** [Planejar]
- **A/B Testing:** [O que testar]
- **Métricas de Sucesso:** [Como medir]
- **Feedback Loop:** [Coleta de feedback]

### Requisitos Específicos

#### Design Commitment (OBRIGATÓRIO)
```
Design escolhido: [Minimalista/Corporativo/Jogoso/etc]
Elementos únicos: [2-3 elementos que distinguem o design]
Inspirações: [Referências, não cópias]
Restrições: [O que NÃO fazer]
```

#### Purple Ban (OBRIGATÓRIO)
```
COR ROXO ESTÁ PROIBIDO neste projeto.
Razão: [Explicar brevemente]
Alternativas: [Sugerir cores substitutas]
```

#### Safe Harbor (OBRIGATÓRIO)
```
EVITAR clichês modernos:
- ❌ Bento Grid (a menos que justificado)
- ❌ Mesh Gradients genéricos
- ❌ Neumorphism sem propósito
- ❌ Dark mode forçado
- ❌ Micro-interações excessivas
```

### Diretrizes de Qualidade

#### Para Cada Seção
- [ ] **Completa:** Todas as informações necessárias
- [ ] **Clara:** Linguagem acessível
- [ ] **Acionável:** Orientações práticas
- [ ] **Consistente:** Coerência interna
- [ ] **Validável:** Possível de testar

#### Para o Documento Inteiro
- [ ] **Cobertura completa:** Todos os aspectos abordados
- [ ] **Cross-reference:** Links internos funcionando
- [ ] **Exemplos práticos:** Ilustrações concretas
- [ ] **Next steps:** Orientações para implementação

## Exemplo de Uso

### Input Típico
```
PRD: Sistema de gestão de tarefas
Requisitos: RF001-050 (CRUD de tarefas, equipes, relatórios)
Stack: Next.js + Tailwind + TypeScript
```

### Output Esperado
Design Document de 50+ páginas com:
- Sistema de design completo
- 20+ wireframes descritos
- 5+ fluxos mapeados
- Mapa de navegação completo
- Guia de implementação

## Resposta Esperada

### Estrutura da Resposta
1. **Confirmação do entendimento** do projeto
2. **Design Document completo** seguindo estrutura acima
3. **Mapa de navegação** como artefato separado
4. **Checklist de validação** do design
5. **Próximos passos** para prototipagem

### Formato
- **Markdown** com estrutura clara
- **Mermaid diagrams** para visualizações
- **Tabelas** para inventários
- **Code blocks** para exemplos
- **Checklists** para validação

## Checklist Pós-Geração

### Validação do Design Document
- [ ] **Design Commitment** preenchido
- [ ] **Purple Ban** respeitado
- [ ] **Safe Harbor** seguido
- [ ] **WCAG AA** compliance
- [ ] **Mobile first** implementado
- [ ] **Cross-reference** funcionando
- [ ] **Exemplos práticos** incluídos
- [ ] **Next steps** claros

### Qualidade do Conteúdo
- [ ] **Personas** detalhadas e realistas
- [ ] **Jornadas** completas e lógicas
- [ ] **Wireframes** descritos detalhadamente
- [ ] **Design system** consistente
- [ ] **Acessibilidade** integrada
- [ ] **Responsividade** planejada

### Implementação
- [ ] **Salvar** em `docs/03-ux/design-doc.md`
- [ ] **Criar** `docs/03-ux/mapa-navegacao.md`
- [ ] **Atualizar** `docs/CONTEXTO.md`
- [ ] **Notificar** próximo especialista

---

## Notas Adicionais

### Dicas do Especialista
- **ASK antes de assumir:** Sempre perguntar em vez de presumir preferências
- **THINK não memorize:** Focar em princípios, não em padrões fixos
- **Cada pixel tem propósito:** Justificar cada decisão de design
- **Restrição é luxo:** Usar limitações como vantagem criativa

### Armadilhas Comuns
- **Copiar tendências** sem justificativa
- **Ignorar acessibilidade** por "demorado"
- **Design excessivo** que prejudica usabilidade
- **Focar só em beleza** ignorando funcionalidade

### Sucesso do Projeto
- **Usuários conseguem** completar tarefas principais
- **Design é consistente** em todas as telas
- **Acessibilidade** é nativa, não add-on
- **Performance** não é sacrificada por design
