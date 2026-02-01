# Checklist de Validação - Prototipagem com Google Stitch

## 📋 Sistema de Pontuação

**Total de Pontos:** 100  
**Score Mínimo para Aprovação:** 75 pontos  
**Classificação:**
- 90-100: Excelente ✅
- 75-89: Bom ✅
- 60-74: Aceitável ⚠️ (requer aprovação manual)
- < 60: Insuficiente ❌ (bloqueado)

---

## 🎯 Componentes (40 pontos)

### Essenciais (30 pontos)

#### 1. Todos os Componentes Principais Presentes (20 pontos)
- [ ] **20 pontos:** Todos os componentes do Design Doc implementados
- [ ] **15 pontos:** 80-99% dos componentes implementados
- [ ] **10 pontos:** 60-79% dos componentes implementados
- [ ] **5 pontos:** 40-59% dos componentes implementados
- [ ] **0 pontos:** < 40% dos componentes implementados

**Validação:**
- Comparar lista de componentes do Design Doc com protótipo
- Verificar funcionalidade básica de cada componente
- Confirmar que componentes críticos estão presentes

---

#### 2. Componentes Seguem Design System (10 pontos)
- [ ] **10 pontos:** 100% aderência ao Design System
- [ ] **7 pontos:** 80-99% aderência
- [ ] **5 pontos:** 60-79% aderência
- [ ] **3 pontos:** 40-59% aderência
- [ ] **0 pontos:** < 40% aderência

**Validação:**
- Verificar cores (primárias, secundárias, feedback)
- Verificar tipografia (família, tamanhos, pesos)
- Verificar espaçamento (padding, margin, gap)
- Verificar componentes padrão do Design System

---

### Importantes (10 pontos)

#### 3. Estados de Componentes Implementados (5 pontos)
- [ ] **5 pontos:** Todos os estados implementados (default, hover, active, disabled, loading, error)
- [ ] **3 pontos:** Estados principais implementados (default, hover, active)
- [ ] **1 ponto:** Apenas estado default implementado
- [ ] **0 pontos:** Estados não implementados

**Validação:**
- Testar hover effects
- Testar estados de loading
- Testar estados de erro
- Testar estados disabled

---

#### 4. Componentes São Reutilizáveis (5 pontos)
- [ ] **5 pontos:** Componentes modulares e reutilizáveis
- [ ] **3 pontos:** Alguns componentes reutilizáveis
- [ ] **1 ponto:** Componentes específicos, pouca reutilização
- [ ] **0 pontos:** Componentes não reutilizáveis

**Validação:**
- Verificar se componentes podem ser usados em múltiplos contextos
- Verificar se há duplicação desnecessária
- Verificar se componentes são parametrizáveis

---

## 🔄 Fluxos (30 pontos)

### Essenciais (20 pontos)

#### 5. Fluxos Principais Funcionam Corretamente (15 pontos)
- [ ] **15 pontos:** Todos os fluxos principais funcionam perfeitamente
- [ ] **10 pontos:** 80-99% dos fluxos funcionam
- [ ] **7 pontos:** 60-79% dos fluxos funcionam
- [ ] **3 pontos:** 40-59% dos fluxos funcionam
- [ ] **0 pontos:** < 40% dos fluxos funcionam

**Validação:**
- Testar cada fluxo de ponta a ponta
- Verificar transições entre telas/componentes
- Confirmar que ações levam aos resultados esperados
- Validar fluxos críticos (login, checkout, etc.)

---

#### 6. Navegação é Intuitiva (5 pontos)
- [ ] **5 pontos:** Navegação extremamente intuitiva
- [ ] **3 pontos:** Navegação clara com pequenos ajustes
- [ ] **1 ponto:** Navegação confusa em alguns pontos
- [ ] **0 pontos:** Navegação não intuitiva

**Validação:**
- Testar com usuário sem contexto prévio
- Verificar clareza de labels e ícones
- Confirmar que caminhos são óbvios
- Validar breadcrumbs e indicadores de posição

---

### Importantes (10 pontos)

#### 7. Feedback Visual em Cada Etapa (5 pontos)
- [ ] **5 pontos:** Feedback visual claro em todas as etapas
- [ ] **3 pontos:** Feedback visual na maioria das etapas
- [ ] **1 ponto:** Feedback visual esporádico
- [ ] **0 pontos:** Sem feedback visual

**Validação:**
- Verificar loading states
- Verificar mensagens de sucesso/erro
- Verificar progress indicators
- Verificar confirmações de ações

---

#### 8. Tratamento de Erros (5 pontos)
- [ ] **5 pontos:** Tratamento completo de erros
- [ ] **3 pontos:** Tratamento básico de erros
- [ ] **1 ponto:** Tratamento mínimo de erros
- [ ] **0 pontos:** Sem tratamento de erros

**Validação:**
- Testar cenários de erro
- Verificar mensagens de erro claras
- Confirmar que usuário pode se recuperar de erros
- Validar validações de formulário

---

## 🎨 Design (20 pontos)

### Essenciais (10 pontos)

#### 9. Cores do Design System Aplicadas (5 pontos)
- [ ] **5 pontos:** Todas as cores corretas
- [ ] **3 pontos:** Cores principais corretas, pequenos desvios
- [ ] **1 ponto:** Cores parcialmente corretas
- [ ] **0 pontos:** Cores não seguem Design System

**Validação:**
- Verificar paleta de cores primárias
- Verificar paleta de cores secundárias
- Verificar cores de feedback (success, error, warning, info)
- Verificar contraste (WCAG 2.1 AA mínimo)

---

#### 10. Tipografia Consistente (5 pontos)
- [ ] **5 pontos:** Tipografia 100% consistente
- [ ] **3 pontos:** Tipografia majoritariamente consistente
- [ ] **1 ponto:** Tipografia parcialmente consistente
- [ ] **0 pontos:** Tipografia inconsistente

**Validação:**
- Verificar família de fonte
- Verificar tamanhos de fonte (headings, body, caption)
- Verificar pesos de fonte (regular, medium, bold)
- Verificar line-height e letter-spacing

---

### Importantes (10 pontos)

#### 11. Espaçamento Uniforme (5 pontos)
- [ ] **5 pontos:** Espaçamento perfeitamente uniforme
- [ ] **3 pontos:** Espaçamento majoritariamente uniforme
- [ ] **1 ponto:** Espaçamento parcialmente uniforme
- [ ] **0 pontos:** Espaçamento inconsistente

**Validação:**
- Verificar padding interno de componentes
- Verificar margin entre componentes
- Verificar gap em grids e flexbox
- Verificar alinhamento vertical e horizontal

---

#### 12. Responsividade Implementada (5 pontos)
- [ ] **5 pontos:** Totalmente responsivo (mobile, tablet, desktop)
- [ ] **3 pontos:** Responsivo para 2 breakpoints
- [ ] **1 ponto:** Responsivo para 1 breakpoint
- [ ] **0 pontos:** Não responsivo

**Validação:**
- Testar em mobile (< 768px)
- Testar em tablet (768px - 1024px)
- Testar em desktop (> 1024px)
- Verificar adaptações de layout

---

## ✅ Qualidade (10 pontos)

### Essenciais (8 pontos)

#### 13. Código Exportado Disponível (5 pontos)
- [ ] **5 pontos:** Código exportado completo e funcional
- [ ] **3 pontos:** Código exportado com pequenos ajustes necessários
- [ ] **1 ponto:** Código exportado parcial
- [ ] **0 pontos:** Código não exportado

**Validação:**
- Verificar se código foi exportado do Stitch
- Testar código exportado localmente
- Confirmar que código é utilizável
- Validar estrutura de arquivos

---

#### 14. Feedback dos Stakeholders Coletado (3 pontos)
- [ ] **3 pontos:** Feedback de todos os stakeholders coletado e documentado
- [ ] **2 pontos:** Feedback da maioria dos stakeholders coletado
- [ ] **1 ponto:** Feedback parcial coletado
- [ ] **0 pontos:** Sem feedback coletado

**Validação:**
- Verificar documento de feedback
- Confirmar que stakeholders principais revisaram
- Validar que feedback foi documentado
- Verificar que ações foram definidas

---

### Opcionais (2 pontos)

#### 15. Documentação Completa (2 pontos)
- [ ] **2 pontos:** Documentação completa (protótipo, decisões, feedback)
- [ ] **1 ponto:** Documentação parcial
- [ ] **0 pontos:** Sem documentação

**Validação:**
- Verificar prototipo-stitch.md preenchido
- Verificar decisões de design documentadas
- Verificar feedback documentado
- Verificar próximos passos definidos

---

## 📊 Cálculo de Score

### Fórmula
```
Score = Σ(pontos de cada critério)
```

### Exemplo de Cálculo

| Critério | Pontos Obtidos | Pontos Máximos |
|----------|----------------|----------------|
| 1. Componentes Principais | 20 | 20 |
| 2. Design System | 7 | 10 |
| 3. Estados | 5 | 5 |
| 4. Reutilização | 3 | 5 |
| 5. Fluxos | 15 | 15 |
| 6. Navegação | 5 | 5 |
| 7. Feedback Visual | 3 | 5 |
| 8. Tratamento de Erros | 3 | 5 |
| 9. Cores | 5 | 5 |
| 10. Tipografia | 5 | 5 |
| 11. Espaçamento | 3 | 5 |
| 12. Responsividade | 5 | 5 |
| 13. Código Exportado | 5 | 5 |
| 14. Feedback Stakeholders | 2 | 3 |
| 15. Documentação | 1 | 2 |
| **TOTAL** | **87** | **100** |

**Resultado:** 87/100 - **BOM** ✅ (Aprovado)

---

## 🚦 Ações por Score

### Score ≥ 90 (Excelente) ✅
- ✅ Aprovação automática
- ✅ Avançar para próxima fase
- ✅ Usar como referência para futuros protótipos

### Score 75-89 (Bom) ✅
- ✅ Aprovação automática
- ⚠️ Documentar itens com pontuação baixa
- ⚠️ Planejar melhorias para próxima iteração

### Score 60-74 (Aceitável) ⚠️
- ⚠️ Aprovação manual necessária
- ⚠️ Revisar itens com pontuação < 3
- ⚠️ Justificar por que pode avançar
- ⚠️ Criar plano de correção

### Score < 60 (Insuficiente) ❌
- ❌ Bloqueado - não pode avançar
- ❌ Revisar todos os itens com pontuação < 3
- ❌ Corrigir problemas críticos
- ❌ Re-validar após correções

---

## 📝 Template de Validação

```markdown
# Validação de Protótipo - [Nome do Projeto]

**Data:** [DD/MM/AAAA]  
**Validador:** [Nome]  
**Versão do Protótipo:** [1.0]

## Componentes (40 pontos)
- [ ] 1. Componentes Principais: __/20
- [ ] 2. Design System: __/10
- [ ] 3. Estados: __/5
- [ ] 4. Reutilização: __/5

## Fluxos (30 pontos)
- [ ] 5. Fluxos Principais: __/15
- [ ] 6. Navegação: __/5
- [ ] 7. Feedback Visual: __/5
- [ ] 8. Tratamento de Erros: __/5

## Design (20 pontos)
- [ ] 9. Cores: __/5
- [ ] 10. Tipografia: __/5
- [ ] 11. Espaçamento: __/5
- [ ] 12. Responsividade: __/5

## Qualidade (10 pontos)
- [ ] 13. Código Exportado: __/5
- [ ] 14. Feedback Stakeholders: __/3
- [ ] 15. Documentação: __/2

**SCORE TOTAL:** __/100

**RESULTADO:** [ ] Excelente [ ] Bom [ ] Aceitável [ ] Insuficiente

**APROVADO:** [ ] Sim [ ] Não (justificar)

**OBSERVAÇÕES:**
[Notas adicionais sobre a validação]

**PRÓXIMOS PASSOS:**
1. [Ação 1]
2. [Ação 2]
```

---

**Versão:** 1.0.0  
**Última Atualização:** 30/01/2026  
**Mantido por:** Maestro Team
