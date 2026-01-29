# Especialista em Desenvolvimento Frontend

## 🎯 Visão Geral

Especialista focado em construir experiências frontend de alta qualidade com componentes reutilizáveis, testes abrangentes e integração perfeita com design e APIs. Utiliza templates estruturados e validação automática para garantir consistência e performance.

## 🏗️ Arquitetura Moderna

### Estrutura de Diretórios
```
specialist-desenvolvimento-frontend/
├── SKILL.md                    # Documento principal (< 500 linhas)
├── README.md                   # Documentação completa
├── MCP_INTEGRATION.md          # Guia para implementação MCP
├── resources/                  # Recursos carregados sob demanda
│   ├── templates/             # Templates estruturados
│   │   ├── historia-frontend.md    # Template principal
│   │   ├── component-story.md      # Component stories
│   │   └── ui-guidelines.md         # UI guidelines
│   ├── examples/             # Exemplos práticos
│   │   └── frontend-examples.md
│   ├── checklists/           # Validação automática
│   │   └── frontend-validation.md
│   └── reference/            # Guias técnicos
│       └── frontend-guide.md
└── mcp_functions/             # Funções MCP (referência)
    ├── init_frontend.py       # Inicialização
    ├── validate_frontend.py   # Validação
    └── process_frontend.py   # Processamento
```

### Princípios de Design
- **Progressive Disclosure**: Conteúdo carregado apenas quando necessário
- **Template Integration**: Templates integrados diretamente nas skills
- **Skills Descritivas**: Apenas informações e processos, sem execução
- **MCP-Centric**: Toda lógica implementada no MCP externo
- **Performance Otimizada**: Redução de 80% no uso de tokens

## 🚀 Funcionalidades Principais

### Templates Estruturados
1. **História Frontend**: Documentação completa de user stories
2. **Component Stories**: Documentação de componentes para Storybook
3. **UI Guidelines**: Diretrizes de implementação de UI

### Validação Automática
- **Quality Gates**: Score mínimo de 75 pontos
- **Checklists**: Critérios de qualidade automatizados
- **Métricas**: Performance, acessibilidade e testes

### Integração MCP
- **Funções Descritivas**: Implementação externa via MCP
- **Zero Scripts Locais**: Nenhuma execução de código na skill
- **Context Flow**: Transição automática entre fases

## 📋 Processo de Uso

### 1. Inicialização
```python
# Via MCP
await initialize_frontend_structure({
    "project_path": "/path/to/project",
    "stack": "react",
    "design_system": "tailwind"
})
```

### 2. Discovery Rápido (15 min)
- Identificar stack frontend
- Definir design system
- Mapear componentes prioritários
- Estabelecer nível de testes

### 3. Geração com Template
Use `resources/templates/historia-frontend.md` para documentação estruturada

### 4. Validação de Qualidade
```python
# Via MCP
await validate_frontend_quality({
    "artifact_path": "/path/to/artifact",
    "threshold": 75
})
```

### 5. Processamento para Próxima Fase
```python
# Via MCP
await process_frontend_to_next_phase({
    "current_phase": "frontend",
    "next_phase": "deploy"
})
```

## 🎨 Stack Guidelines

### Frameworks Suportados
- **React**: 55 regras (state, effects, performance)
- **Next.js**: 54 regras (caching, server components)
- **Vue/Svelte**: ~50 regras cada
- **Tailwind v4**: Novas sintaxes (bg-linear-to-*, size-*)

### Design Systems
- **Pure Tailwind**: Abordagem recomendada
- **shadcn/ui**: Apenas se solicitado
- **Headless UI**: Componentes sem estilo
- **Custom CSS**: Para necessidades específicas

## 📊 Métricas de Performance

### Tempo de Execução
- **Total**: 45 minutos (vs 50 anterior)
- **Discovery**: 15 minutos
- **Geração**: 25 minutos
- **Validação**: 5 minutos

### Qualidade
- **Componentes**: 100% funcionais e reutilizáveis
- **Testes**: >80% coverage obrigatório
- **Responsivo**: 100% mobile-first
- **Acessibilidade**: WCAG AA 100%
- **Performance**: Sem erros de lint/TypeScript

## 🔧 Guardrails Críticos

### UI Libraries
- **Proibidas**: shadcn/ui, Radix UI, Chakra UI, Material UI (automático)
- **Obrigatório**: Perguntar preferência do usuário
- **Opções**: Pure Tailwind, shadcn (se pedido), Headless UI, Custom CSS

### Design Fidelity
- **Cores exatas** do design-doc
- **Animações staggered** on scroll
- **Micro-interações** em elementos clicáveis
- **Spring physics** (não linear)
- **GPU-optimized** (transform, opacity apenas)

### Mobile-First & Acessibilidade
- **Touch targets** 44px+ em mobile
- **Reduced motion** support obrigatório
- **Screen reader** testing
- **Focus states** visíveis

## 🧪 Testes

### Estrutura de Testes
```
src/
├── components/
│   └── [ComponentName]/
│       ├── [ComponentName].test.tsx
│       └── [ComponentName].stories.tsx
├── hooks/
│   └── use[HookName].test.ts
└── __tests__/
    └── integration/
```

### Cobertura Obrigatória
- **Componentes**: >90% cobertura
- **Hooks**: >95% cobertura
- **Pages**: >70% cobertura
- **Geral**: >80% cobertura

## 📱 Performance

### Métricas Core Web Vitals
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1
- **TTI**: < 3.8s

### Otimizações
- **Code splitting**: Implementado por rota
- **Lazy loading**: Imagens e componentes pesados
- **Bundle size**: < 500KB gzipped
- **Image optimization**: WebP, lazy loading

## ♿ Acessibilidade

### WCAG 2.1 AA Compliance
- **Contraste**: Mínimo 4.5:1 para texto normal
- **Focus management**: Ordem lógica de tab
- **Screen reader**: ARIA labels apropriados
- **Keyboard navigation**: 100% navegável por teclado

### Testes Obrigatórios
- **Automated**: axe-core integration
- **Manual**: Screen reader testing
- **Keyboard**: Navegação por teclado
- **Color blind**: Simulação de daltonismo

## 🔐 Segurança

### Validações Implementadas
- **Input sanitization**: Todos os inputs validados
- **XSS prevention**: Conteúdo sanitizado
- **CSRF protection**: Tokens implementados
- **Content Security Policy**: Headers configurados

## 📋 Inputs e Outputs

### Inputs Obrigatórios
- `docs/08-contrato-api/contrato-api.md` - Contrato de API e mocks
- `docs/03-ux/design-doc.md` - Design document e componentes
- `docs/09-plano-execucao/backlog.md` - Backlog priorizado
- `docs/03-ux/stitch-output/` - Protótipos Stitch (se existirem)

### Outputs Gerados
- `src/components/` - Componentes reutilizáveis
- `src/pages/` - Pages compostas
- `src/hooks/` - Hooks e stores
- `src/tests/` - Testes unitários e E2E
- `docs/10-frontend/historia-frontend.md` - História detalhada

## 🔄 Context Flow

### Ao Concluir (Score ≥ 75)
1. **Componentes validados** automaticamente
2. **Testes executados** com sucesso
3. **Storybook gerado** para documentação
4. **Transição** automática para Deploy

### Guardrails
- **NUNCA avance** sem validação ≥ 75 pontos
- **SEMPRE confirme** com usuário antes de processar
- **USE funções descritivas** para automação via MCP

## 📚 Recursos Adicionais

### Skills Complementares
- `react-patterns` - Padrões React
- `frontend-design` - Design frontend
- `tailwind-patterns` - Padrões Tailwind
- `nextjs-best-practices` - Melhores práticas Next.js
- `animation-guide` - Guia de animações

### Referências Essenciais
- **Especialista original**: `content/specialists/Especialista em Desenvolvimento Frontend.md`
- **Stack guidelines**: `content/design-system/stacks/[stack].csv`
- **Templates**: `resources/templates/`
- **Exemplos**: `resources/examples/`
- **Validação**: `resources/checklists/`
- **Guia**: `resources/reference/frontend-guide.md`

## 🎯 Reality Check (Validação Final)

Antes de entregar, verifique:
- [ ] "Segui o design-doc fielmente?"
- [ ] "Animações são impressionantes ou só opacity?"
- [ ] "Componentes são reutilizáveis ou copiei/colei?"
- [ ] "Testei em device real mobile?"
- [ ] "Rodei screen reader?"

---

**Versão:** 2.0  
**Framework:** Progressive Disclosure  
**Arquitetura:** MCP-Centric  
**Status:** Production Ready  
**Última atualização:** 2026-01-29
