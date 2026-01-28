# Checklist de Acessibilidade

**Versão:** 1.0  
**Data:** [DATA]  
**Projeto:** [NOME DO PROJETO]  
**Status:** [RASCUNHO/REVISÃO/APROVADO]

---

## 📋 **Contexto**

**Especialista Responsável:** Acessibilidade  
**Fase:** 14 - Documentação  
**Artefatos Anteriores:** Design Doc, Implementação  
**Referências:** WCAG 2.1 AA, Section 508, EN 301 549

---

## 🎯 **Visão Geral**

### **Nível de Conformidade**
- [ ] **WCAG 2.1 AA** (Padrão mínimo)
- [ ] **WCAG 2.1 AAA** (Quando aplicável)
- [ ] **Section 508** (Requisitos EUA)
- [ ] **EN 301 549** (Requisitos Europa)

### **Escopo**
- **Aplicação:** [Nome da aplicação]
- **Páginas:** [Número de páginas avaliadas]
- **Componentes:** [Tipos de componentes]
- **Dispositivos:** [Desktop, Mobile, Tablet]

---

## 📱 **Perceptível**

### **1. Alternativas Textuais**
- [ ] **Imagens decorativas** têm `alt=""` ou `role="presentation"`
- [ ] **Imagens informativas** têm `alt` descritivo
- [ ] **Imagens complexas** têm `longdesc` ou descrição adjacente
- [ ] **Ícones** têm `aria-label` ou texto visível
- [ ] **Gráficos e diagramas** têm descrição textual
- [ ] **CAPTCHAs** oferecem alternativa auditiva

### **2. Conteúdo Adaptável**
- [ ] **Layout responsivo** funciona em todos os dispositivos
- [ ] **Orientação** não bloqueia uso (portrait/landscape)
- [ ] **Zoom** até 200% sem perda de funcionalidade
- [ ] **Reflow** mantém leitura em 320px de largura
- [ ] **Texto** pode ser ajustado sem quebrar layout

### **3. Distinguibilidade**
- [ ] **Cores** não são o único meio de传达 informação
- [ ] **Contraste** mínimo 4.5:1 para texto normal
- [ ] **Contraste** mínimo 3:1 para texto grande (18pt+)
- [ ] **Contraste** mínimo 3:1 para componentes UI
- [ ] **Links** têm estilo adicional além da cor
- [ ] **Focus indicators** são visíveis e claros
- [ ] **Blinking** não causa seizures (max 3 flashes/segundo)

---

## 🎮 **Operável**

### **4. Navegável por Teclado**
- [ ] **Todos elementos interativos** são alcançáveis por teclado
- [ ] **Tab order** é lógico e intuitivo
- [ ] **Skip links** para conteúdo principal
- [ ] **Focus trapping** em modals e dialogs
- [ ] **Escape key** fecha overlays
- [ ] **Arrow keys** navegam em menus e listas
- [ ] **No keyboard trap** em nenhum componente

### **5. Tempo Suficiente**
- [ ] **Timeouts** podem ser desabilitados ou estendidos
- [ ] **Moving content** pode ser pausado
- [ ] **Autocomplete** tem tempo razoável
- [ ] **Re-authentication** mantém sessão
- [ ] **Progress indicators** mostram tempo restante

### **6. Epilepsia**
- [ ] **Não usa conteúdo piscante** acima de 3Hz
- [ ] **Flashing content** tem menos de 3 flashes/segundo
- [ ] **Red flash thresholds** respeitados
- [ ] **Warning** para conteúdo potencialmente perigoso

### **7. Navegável**
- [ ] **Page titles** são descritivos e únicos
- [ ] **Focus order** preserva significado
- [ ] **Multiple ways** de navegar (search, sitemap, links)
- [ ] **Headings** formam estrutura hierárquica
- [ ] **Labels** descrevem propósito dos controles
- [ ] **Breadcrumbs** mostram localização

---

## 🧠 **Compreensível**

### **8. Legível**
- [ ] **Idioma** da página é especificado (`lang`)
- [ ] **Mudanças de idioma** são indicadas
- [ ] **Texto** é legível e compreensível
- [ ] **Pronunciation** é clara quando necessário
- [ ] **Abbreviations** são explicadas na primeira ocorrência
- [ ] **Definitions** são fornecidas para termos técnicos

### **9. Previsível**
- [ ] **Funcionalidade** é consistente
- [ ] **Context changes** são previsíveis
- [ ] **Focus não muda** inesperadamente
- [ ] **Input assistance** está disponível
- [ ] **Error identification** é clara
- [ ] **Labels e instruções** são claras

### **10. Assistência de Entrada**
- [ ] **Error messages** identificam o problema
- [ ] **Suggestions** para correção de erros
- [ ] **Context-sensitive help** está disponível
- [ ] **Validation** previne erros quando possível
- [ ] **Recovery** de dados após erros
- [ ] **Confirmation** para ações irreversíveis

---

## 🤝 **Robusto**

### **11. Compatível**
- [ ] **HTML semântico** é usado corretamente
- [ ] **ARIA landmarks** definem regiões importantes
- [ ] **Screen readers** funcionam corretamente
- [ ] **Voice control** pode operar a interface
- [ ] **Custom controls** têm accessibility API
- [ ] **Markup validation** passa sem erros

### **12. Tecnologias Assistivas**
- [ ] **Screen readers** (NVDA, JAWS, VoiceOver)
- [ ] **Voice control** (Dragon, Siri, Google Assistant)
- [ ] **Switch devices** funcionam
- [ ] **Braille displays** são suportados
- [ ] **Screen magnifiers** funcionam bem
- [ ] **Alternative input devices** funcionam

---

## 🧪 **Testes de Acessibilidade**

### **Automatizados**
- [ ] **axe-core** passando em todas as páginas
- [ ] **Lighthouse** accessibility score > 90
- [ ] **WAVE** sem erros críticos
- [ ] **Color contrast analyzer** passando
- [ ] **HTML validator** sem erros

### **Manuais**
- [ ] **Keyboard navigation** testado completamente
- [ ] **Screen reader** testado em múltiplas ferramentas
- [ ] **Zoom test** até 200% e 400%
- [ ] **Mobile accessibility** testado
- [ ] **Voice control** testado
- [ ] **Cognitive load** avaliado

### **Usuários Reais**
- [ ] **Testes com pessoas com deficiência visual**
- [ ] **Testes com pessoas com deficiência motora**
- [ ] **Testes com pessoas com deficiência auditiva**
- [ ] **Testes com pessoas com deficiência cognitiva**
- [ ] **Feedback incorporado** nas melhorias

---

## 📊 **Métricas e KPIs**

### **WCAG Compliance**
| Critério | Status | Observações |
|----------|--------|-------------|
| Perceptível | [✅/⚠️/❌] | [detalhes] |
| Operável | [✅/⚠️/❌] | [detalhes] |
| Compreensível | [✅/⚠️/❌] | [detalhes] |
| Robusto | [✅/⚠️/❌] | [detalhes] |

### **Ferramentas**
| Ferramenta | Score | Issues |
|------------|--------|--------|
| axe-core | [score] | [n] issues |
| Lighthouse | [score] | [n] issues |
| WAVE | [n] errors | [n] alerts |
| Contrast Checker | [score] | [n] failures |

### **Cobertura**
- **Páginas testadas:** [n]/[total]
- **Componentes testados:** [n]/[total]
- **User flows testados:** [n]/[total]
- **Dispositivos testados:** [lista]

---

## 🚨 **Issues Críticos**

### **Priority 1 - Blockers**
- [ ] **Keyboard trap** em [componente]
- [ ] **Missing alt text** em [imagem]
- [ ] **No focus indicator** em [elemento]
- [ ] **Contraste insuficiente** em [texto]

### **Priority 2 - Major**
- [ ] **Missing labels** em [form]
- [ ] **Poor heading structure** em [página]
- [ ] **No ARIA landmarks** em [seção]
- [ ] **Auto-playing content** sem controle

### **Priority 3 - Minor**
- [ ] **Missing skip links**
- [ ] **Empty buttons** sem contexto
- [ ] **Invalid HTML** semântico
- [ ] **Missing page titles**

---

## 📝 **Plano de Remediação**

### **Sprint 1 - Critical Fixes**
- [ ] [Issue 1] - [Responsável] - [Deadline]
- [ ] [Issue 2] - [Responsável] - [Deadline]

### **Sprint 2 - Major Improvements**
- [ ] [Issue 1] - [Responsável] - [Deadline]
- [ ] [Issue 2] - [Responsável] - [Deadline]

### **Sprint 3 - Minor Polish**
- [ ] [Issue 1] - [Responsável] - [Deadline]
- [ ] [Issue 2] - [Responsável] - [Deadline]

---

## 🔄 **Monitoramento Contínuo**

### **Automated Monitoring**
- [ ] **CI/CD integration** com axe-core
- [ ] **Scheduled scans** semanais
- [ ] **Regression testing** automático
- [ ] **Performance impact** monitorado

### **Manual Testing**
- [ ] **Monthly accessibility audits**
- [ ] **New feature reviews** com checklist
- [ ] **User testing** trimestral
- [ ] **Training updates** mensal

### **Documentation**
- [ ] **Accessibility guidelines** atualizadas
- [ ] **Component library** com propriedades a11y
- [ ] **Design system** com tokens de contraste
- [ ] **Knowledge base** para desenvolvedores

---

## ✅ **Checklist Final**

### **Lançamento**
- [ ] **Todos os testes** passando
- [ ] **Documentação completa**
- [ ] **Treinamento realizado**
- [ ] **Monitoramento ativo**
- [ ] **Feedback process** definido

### **Manutenção**
- [ ] **Regular audits** agendados
- [ ] **Issue tracking** implementado
- [ ] **Team training** contínuo
- [ ] **Technology updates** monitorados
- [ ] **Legal compliance** verificado

---

## 📞 **Recursos e Contatos**

### **Equipe de Acessibilidade**
- **Líder:** [Nome] - [email]
- **Desenvolvedores:** [Nomes]
- **QA:** [Nomes]
- **Design:** [Nomes]

### **Ferramentas**
- **Testing:** axe-core, Lighthouse, WAVE
- **Screen Readers:** NVDA, JAWS, VoiceOver
- **Voice Control:** Dragon, Siri, Google Assistant
- **Validation:** HTML validator, Contrast checker

### **Referências**
- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [Section 508 Standards](https://www.section508.gov/)
- [ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices-1.1/)
- [Accessibility Guidelines](https://www.a11yproject.com/)

---

## 📈 **Histórico de Revisões**

| Versão | Data | Autor | Mudanças |
|--------|------|-------|----------|
| 1.0.0 | [DATA] | [AUTOR] | Versão inicial |

---

**Aprovado por:** [Nome/Assinatura]  
**Data:** [DATA]  
**Próxima Revisão:** [DATA + 3 meses]  
**WCAG Level:** [AA/AAA]
