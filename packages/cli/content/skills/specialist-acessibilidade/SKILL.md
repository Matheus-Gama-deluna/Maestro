---
name: specialist-acessibilidade
description: Garantia de conformidade WCAG, ARIA e testes com leitores de tela.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Acessibilidade · Skill do Especialista

## 🎯 Missão
Elevar o nível de acessibilidade em design e implementação, garantindo conformidade WCAG e inclusão digital.

## 🧭 Quando ativar
- Fase: Fase 14 · Documentação
- Workflows recomendados: /refatorar-codigo, /deploy
- Use quando precisar antes de releases públicos ou quando o produto precisa atender normas.

## 📥 Inputs obrigatórios
- Designs e componentes prontos
- Implementação frontend
- Requisitos legais e compliance
- CONTEXTO.md do projeto

## 📤 Outputs gerados
- Relatório de acessibilidade completo
- Backlog de ajustes prioritários
- Guia de implementação WCAG
- Testes automatizados de acessibilidade

## ✅ Quality Gate
- Conformidade WCAG 2.1 AA
- Testes com leitores de tela
- Issues de acessibilidade priorizadas
- Documentação de acessibilidade
- Treinamento da equipe

## 🔧 Padrões WCAG 2.1

### Nível AA (Obrigatório)
- **Perceptível:** Texto alternativo, contraste, legendas
- **Operável:** Navegação por teclado, tempo suficiente
- **Compreensível:** Linguagem clara, instruções
- **Robusto:** Compatibilidade com tecnologias assistivas

### Critérios Essenciais
- Contraste mínimo 4.5:1 (texto normal)
- Contraste mínimo 3:1 (texto grande)
- Navegação completa por teclado
- Foco visível e claro
- Texto alternativo para imagens

## 📋 Processo de Auditoria

### 1. Análise Automática
```text
Execute ferramentas automatizadas:
- axe-core (integrado em testes)
- WAVE (WebAIM)
- Lighthouse accessibility audit
- Color contrast checker
```

### 2. Testes Manuais
```text
Testes obrigatórios:
- Navegação por teclado (Tab, Shift+Tab)
- Leitores de tela (NVDA, VoiceOver)
- Zoom do navegador (200%)
- Modo alto contraste
```

### 3. Validação de Conteúdo
```text
Verifique:
- Textos alternativos descritivos
- Estrutura de cabeçalhos (h1-h6)
- Links descritivos
- Formulários com labels
- Tabelas com captions
```

## 🚨 Guardrails Críticos

### ❌ NUNCA Faça
- **NUNCA** ignore navegação por teclado
- **NUNCA** use apenas cor para传达信息
- **NUNCA** pule textos alternativos
- **NUNCA** use auto-playing sem controle

### ✅ SEMPRE Faça
- **SEMPRE** teste com leitores de tela
- **SEMPRE** verifique contraste de cores
- **SEMPRE** use semantic HTML
- **SEMPRE** inclua focus indicators

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

## 📊 Métricas de Acessibilidade

### Indicadores Obrigatórios
- **WCAG Compliance:** 100% AA
- **Keyboard Navigation:** 100% funcional
- **Screen Reader Support:** 100% compatível
- **Color Contrast:** 100% dentro dos limites
- **Error Rate:** < 5% de issues críticos

### Ferramentas de Teste
```javascript
// axe-core integration
import { axe, toHaveNoViolations } from 'jest-axe';

test('should be accessible', async () => {
  render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 🔄 Context Flow

### Artefatos Obrigatórios para Iniciar
Cole no início:
1. Design system completo
2. Componentes implementados
3. Requisitos de compliance
4. CONTEXTO.md com restrições

### Prompt de Continuação
```
Atue como Especialista em Acessibilidade.

Contexto do projeto:
[COLE docs/CONTEXTO.md]

Design e componentes:
[COLE DESIGN E COMPONENTES]

Preciso auditar e garantir acessibilidade WCAG 2.1 AA.
```

### Ao Concluir Esta Fase
1. **Execute auditoria** completa
2. **Crie backlog** de ajustes
3. **Implemente correções** críticas
4. **Documente guidelines** de acessibilidade
5. **Treine equipe** em práticas WCAG
6. **Configure testes** automatizados

## 📋 Templates Prontos

### Checklist de Acessibilidade
```markdown
## Checklist WCAG 2.1 AA

### Perceptível
- [ ] Imagens têm alt text descritivo
- [ ] Vídeos têm legendas
- [ ] Áudio tem transcrição
- [ ] Contraste de cores adequado
- [ ] Texto redimensionável até 200%

### Operável
- [ ] Todo conteúdo acessível por teclado
- [ ] Foco visível e claro
- [ ] Tempo suficiente para leitura
- [ ] Não usa elementos que piscam
- [ ] Navegação consistente

### Compreensível
- [ ] Idioma da página identificado
- [ ] Texto legível e compreensível
- [ ] Funcionalidade previsível
- [ ] Ajuda contextual disponível
- [ ] Correção de erros clara

### Robusto
- [ ] HTML semântico
- [ ] ARIA usado corretamente
- [ ] Compatível com tecnologias assistivas
- [ ] Não quebra com zoom
- [ ] Funciona em diferentes browsers
```

### Relatório de Acessibilidade
```markdown
# Relatório de Acessibilidade

## Resumo
- **Score Geral:** 85/100
- **Conformidade WCAG:** Parcialmente AA
- **Issues Críticas:** 5
- **Issues Moderadas:** 12
- **Issues Leves:** 8

## Issues Críticas
1. **Contraste insuficiente** - Botão primário
   - Local: Header, botão "Login"
   - Contraste: 3.2:1 (mínimo 4.5:1)
   - Prioridade: Alta

2. **Foco não visível** - Links de navegação
   - Local: Menu principal
   - Issue: Focus outline removido
   - Prioridade: Alta

## Recomendações
1. Corrigir contraste de cores imediatamente
2. Implementar focus indicators visíveis
3. Adicionar textos alternativos às imagens
4. Melhorar estrutura semântica do HTML

## Timeline
- **Semana 1:** Correções críticas
- **Semana 2:** Issues moderadas
- **Semana 3:** Validação final
```

## 🔗 Skills complementares
- `frontend-design`
- `webapp-testing`
- `ui-patterns`
- `css-optimization`

## 📂 Referências essenciais
- **Especialista original:** `content/specialists/Especialista em Acessibilidade.md`
- **Artefatos alvo:**
  - Relatório de acessibilidade completo
  - Backlog de ajustes prioritários
  - Guia de implementação WCAG
  - Testes automatizados de acessibilidade