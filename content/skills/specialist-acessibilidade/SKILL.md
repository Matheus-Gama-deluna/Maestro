---
name: specialist-acessibilidade
description: Garantia de conformidade WCAG 2.1 AA, ARIA e testes com leitores de tela para inclusão digital.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# ♿ Acessibilidade · Skill do Especialista

## 🎯 Missão
Elevar o nível de acessibilidade em design e implementação, garantindo conformidade WCAG 2.1 AA e inclusão digital completa.

## ⚡ Quando Ativar
- **Fase:** Fase 14 · Acessibilidade e Compliance
- **Workflows:** /refatorar-codigo, /deploy, /release
- **Trigger:** Antes de releases públicos ou quando necessário atender normas

## 📥 Inputs Obrigatórios
- Designs e componentes prontos
- Implementação frontend atual
- Requisitos legais e compliance
- CONTEXTO.md do projeto

## 📤 Outputs Gerados
- Relatório de acessibilidade completo
- Backlog de ajustes priorizados
- Guia de implementação WCAG
- Testes automatizados de acessibilidade

## ✅ Quality Gate
Score ≥ 80 pontos para avanço automático:
- Conformidade WCAG 2.1 AA (25 pts)
- Testes com leitores de tela (20 pts)
- Issues priorizadas documentadas (15 pts)
- Guidelines de implementação (10 pts)
- Testes automatizados configurados (10 pts)

## 🏗️ Padrões WCAG 2.1 AA

### Princípios Fundamentais
- **Perceptível:** Informações apresentadas de forma detectável
- **Operável:** Interface navegável e operável
- **Compreensível:** Informações e UI compreensíveis
- **Robusto:** Compatível com tecnologias assistivas

### Critérios Essenciais
- Contraste mínimo 4.5:1 (texto normal)
- Contraste mínimo 3:1 (texto grande)
- Navegação completa por teclado
- Foco visível e claro
- Texto alternativo para imagens

## 📋 Processo de Auditoria Otimizado

### 1. Inicialização Estruturada
Use função MCP para criar estrutura base:
```
init_accessibility_audit({
  project_type: "web|mobile|desktop",
  wcag_level: "AA|AAA",
  target_browsers: ["chrome", "firefox", "safari"],
  screen_readers: ["nvda", "voiceover", "jaws"]
})
```

### 2. Discovery Rápido (15 min)
Perguntas focadas:
1. Qual tipo de aplicação? (web, mobile, desktop)
2. Qual nível WCAG necessário? (AA, AAA)
3. Quais tecnologias assistivas priorizar?
4. Quais requisitos legais aplicar?

### 3. Auditoria Automatizada
Use ferramentas integradas:
- axe-core (testes automatizados)
- WAVE (WebAIM)
- Lighthouse accessibility
- Color contrast checker

### 4. Validação Manual
Testes obrigatórios:
- Navegação por teclado (Tab, Shift+Tab)
- Leitores de tela (NVDA, VoiceOver)
- Zoom do navegador (200%)
- Modo alto contraste

### 5. Geração de Relatório
Use template estruturado:
```
generate_accessibility_report({
  audit_results: audit_data,
  wcag_level: "AA",
  priority_matrix: "critical|high|medium|low"
})
```

### 6. Validação de Qualidade
Aplique validação automática:
```
validate_accessibility_compliance({
  wcag_compliance: 100,
  keyboard_navigation: 100,
  screen_reader_support: 100,
  color_contrast: 100,
  error_rate: 5
})
```

## 🚀 Guardrails Críticos

### ❌ NUNCA Faça
- Ignore navegação por teclado
- Use apenas cor para传达信息
- Pule textos alternativos
- Use auto-playing sem controle

### ✅ SEMPRE Faça
- Teste com leitores de tela
- Verifique contraste de cores
- Use semantic HTML
- Inclua focus indicators

### 🔧 ARIA Guidelines
```html
<!-- ✅ BOM: ARIA usado semanticamente -->
<button aria-label="Fechar modal">×</button>
<div role="dialog" aria-modal="true">
  <h2 id="modal-title">Título do Modal</h2>
  <p id="modal-description">Descrição do modal</p>
</div>

<!-- ❌ RUIM: ARIA redundante -->
<nav role="navigation"> <!-- nav já tem role implícito -->
```

## 🔄 Context Flow

### Inputs de Especialistas Anteriores
- **UX Design:** Componentes e wireframes
- **Desenvolvimento Frontend:** Código implementado
- **Segurança:** Requisitos de compliance

### Outputs para Próxima Fase
- **Relatório de Acessibilidade:** Para stakeholders
- **Backlog de Ajustes:** Para equipe de desenvolvimento
- **Guidelines WCAG:** Para documentação técnica

## 📊 Recursos Adicionais

### Templates Disponíveis
- `resources/templates/checklist-acessibilidade.md` - Checklist completo WCAG
- `resources/templates/relatorio-acessibilidade.md` - Template de relatório
- `resources/templates/guia-wcag.md` - Guia de implementação

### Exemplos Práticos
- `resources/examples/accessibility-examples.md` - Input/output pairs
- `resources/examples/aria-patterns.md` - Padrões ARIA

### Validação Automatizada
- `resources/checklists/accessibility-validation.md` - Checklist completo
- Score mínimo: 80 pontos para avanço

### Guias Técnicos
- `resources/reference/wcag-guide.md` - Guia completo WCAG 2.1
- `resources/reference/aria-guide.md` - Guia ARIA prático
- `resources/reference/testing-guide.md` - Guia de testes

## 🔧 MCP Integration

### Funções MCP Disponíveis
1. **init_accessibility_audit()** - Inicia auditoria
2. **run_accessibility_tests()** - Executa testes
3. **generate_accessibility_report()** - Gera relatório
4. **validate_wcag_compliance()** - Valida conformidade
5. **create_accessibility_backlog()** - Cria backlog de ajustes

### Execução via MCP
Todas as funções são executadas externamente via MCP. A skill fornece:
- Descrição dos processos de auditoria
- Templates estruturados para relatórios
- Critérios de validação WCAG
- Exemplos práticos de implementação

## 📈 Métricas de Sucesso

### Performance
- Tempo total: < 90 minutos (vs 180 anterior)
- Descoberta: 15 minutos
- Auditoria: 45 minutos
- Relatório: 30 minutos

### Qualidade
- Score mínimo: 80 pontos
- WCAG Compliance: 100% AA
- Test Coverage: 100% critérios
- Validation: 100% automática

## 🎯 Ao Concluir (Score ≥ 80)
1. **Auditoria concluída** com score WCAG
2. **Backlog priorizado** criado
3. **Guidelines WCAG** documentadas
4. **Testes automatizados** configurados
5. **CONTEXTO.md atualizado** com status de acessibilidade