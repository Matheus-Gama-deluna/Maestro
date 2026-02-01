# ✅ Checklist de Validação de Acessibilidade

## 📊 Sistema de Score Automatizado

### Cálculo do Score
```
Score Total = WCAG Compliance (40) + Keyboard Navigation (20) + Screen Reader (20) + Color Contrast (10) + Semantic HTML (10)
Mínimo para avanço: 80/100 pontos
```

---

## 🔍 Seção 1: WCAG Compliance (40 pontos)

### 1.1 Perceptível (15 pontos)
- [ ] **1.1.1 Non-text Content (3 pts)**
  - [ ] Imagens informativas têm alt text descritivo
  - [ ] Imagens decorativas têm alt=""
  - [ ] Ícones e botões têm texto alternativo
  - [ ] Gráficos e diagramas têm descrições
  - [ ] Vídeos têm legendas ou transcrições

- [ ] **1.2.2 Captions (Prerecorded) (2 pts)**
  - [ ] Vídeos têm legendas sincronizadas
  - [ ] Legendas identificam falantes
  - [ ] Legendas incluem sons importantes
  - [ ] Controles de legendas são acessíveis

- [ ] **1.2.4 Captions (Live) (1 pt)**
  - [ ] Transmissões ao vivo têm legendas
  - [ ] Legendas são em tempo real
  - [ ] Qualidade das legendas adequada

- [ ] **1.3.3 Sensory Characteristics (3 pts)**
  - [ ] Informações não dependem apenas de cor
  - [ ] Informações não dependem apenas de forma
  - [ ] Informações não dependem apenas de tamanho
  - [ ] Links têm indicadores além da cor
  - [ ] Estados são identificáveis sem cor

- [ ] **1.4.3 Contrast (Minimum) (3 pts)**
  - [ ] Texto normal: contraste ≥ 4.5:1
  - [ ] Texto grande: contraste ≥ 3:1
  - [ ] Componentes de UI: contraste ≥ 3:1
  - [ ] Gráficos: contraste adequado

- [ ] **1.4.4 Resize Text (3 pts)**
  - [ ] Texto redimensiona até 200%
  - [ ] Layout não quebra ao 200%
  - [ ] Funcionalidade preservada
  - [ ] Navegação funcional ao zoom

### 1.2 Operable (10 pontos)
- [ ] **2.1.1 Keyboard (3 pts)**
  - [ ] Toda funcionalidade acessível por teclado
  - [ ] Sem teclado trap
  - [ ] Foco não fica preso
  - [ ] Modo de navegação claro

- [ ] **2.1.2 No Keyboard Trap (1 pt)**
  - [ ] Foco do teclado não desativado
  - [ ] Foco visível quando presente
  - [ ] Foco pode ser programaticamente detectado

- [ ] **2.2.1 Timing Adjustable (3 pts)**
  - [ ] Tempo limite pode ser desativado
  - [ ] Usuário pode ajustar tempo
  - [ ] Aviso antes de expirar
  - [ ] Tempo mínimo de 20 segundos

- [ ] **2.4.1 Bypass Blocks (1 pt)**
  - [ ] Link para pular navegação
  - [ ] Blocos repetitivos podem ser ignorados
  - [ ] Múltiplas formas de navegar

- [ ] **2.4.2 Page Titled (1 pt)**
  - [ ] Cada página tem título descritivo
  - [ ] Títulos identificam conteúdo
  - [ ] Títulos são únicos no site

- [ ] **2.4.3 Focus Order (1 pt)**
  - [ ] Foco visível e claro
  - [ ] Indicadores de foco acessíveis
  - [ ] Ordem do foco programaticamente determinável

### 1.3 Understandable (10 pontos)
- [ ] **3.1.1 Language of Page (2 pts)**
  - [ ] Idioma principal programaticamente determinado
  - [ ] Mudanças de idioma marcadas
  - [ ] Lang codes corretos

- [ ] **3.2.1 On Focus (1 pt)**
  - [ ] Mudança de foco não causa mudança de contexto
  - [ ] Foco previsível e controlável

- [ ] **3.2.2 Input Assistance (2 pts)**
  - [ ] Formulários não mudam ao preencher
  - [ ] Ajuda contextual disponível
  - [ ] Erros não causam perda de dados

- [ ] **3.3.1 Error Identification (2 pts)**
  - [ ] Erros são claramente identificados
  - [ ] Mensagens de erro descritivas
  - [ ] Localização dos erros indicada

- [ ] **3.3.2 Labels or Instructions (3 pts)**
  - [ ] Campos têm rótulos descritivos
  - [ ] Instruções claras disponíveis
  - [ ] Formatos de entrada especificados
  - [ ] Exemplos fornecidos quando necessário

### 1.4 Robust (5 pontos)
- [ ] **4.1.1 Parsing (2 pts)**
  - [ ] HTML semântico utilizado
  - [ ] Elementos usados conforme propósito
  - [ ] Validação HTML sem erros
  - [ ] ARIA usado corretamente

- [ ] **4.1.2 Name, Role, Value (3 pts)**
  - [ ] Nome, função e valor programaticamente determináveis
  - [ ] Estados podem ser definidos programaticamente
  - [ ] Notificações podem ser definidas programaticamente

---

## ⌨️ Seção 2: Keyboard Navigation (20 pontos)

### 2.1 Navigation Testing (10 pontos)
- [ ] **Tab Navigation (3 pts)**
  - [ ] Tab navigation funciona em todas as páginas
  - [ ] Ordem lógica de navegação
  - [ ] Todos os elementos interativos alcançáveis
  - [ ] Sem elementos inacessíveis

- [ ] **Shift+Tab Navigation (2 pts)**
  - [ ] Navegação reversa funciona
  - [ ] Ordem reversa consistente
  - [ ] Sem quebra na navegação reversa

- [ ] **Enter/Space Activation (2 pts)**
  - [ ] Enter ativa botões e links
  - [ ] Space ativa checkboxes e radios
  - [ ] Comportamento consistente com mouse

- [ ] **Escape Functionality (2 pts)**
  - [ ] Escape fecha modais e dialogs
  - [ ] Escape cancela operações
  - [ ] Escape retorna ao estado anterior

- [ ] **Arrow Key Navigation (1 pt)**
  - [ ] Arrow keys funcionam em menus
  - [ ] Arrow keys funcionam em listas
  - [ ] Arrow keys funcionam em sliders

### 2.2 Focus Management (10 pontos)
- [ ] **Visible Focus (4 pts)**
  - [ ] Foco visível em todos os elementos
  - [ ] Indicadores de foco claros
  - [ ] Contraste de foco adequado
  - [ ] Tamanho de foco adequado

- [ ] **Focus Traps (3 pts)**
  - [ ] Sem focus traps em modais
  - [ ] Focus retorna ao local correto
  - [ ] Focus management em componentes complexos

- [ ] **Skip Links (3 pts)**
  - [ ] Skip links presentes e funcionais
  - [ ] Skip links visíveis ao foco
  - [ ] Skip links descritivos

---

## 🎧 Seção 3: Screen Reader Support (20 pontos)

### 3.1 Semantic Structure (8 pontos)
- [ ] **Heading Structure (3 pts)**
  - [ ] Uso correto de h1-h6
  - [ ] Hierarquia lógica de cabeçalhos
  - [ ] Sem cabeçalhos pulados
  - [ ] Cabeçalhos descritivos

- [ ] **Lists and Navigation (2 pts)**
  - [ ] Listas semânticas usadas corretamente
  - [ ] Menus de navegação semânticos
  - [ ] Estrutura de navegação clara

- [ ] **Tables (3 pts)**
  - [ ] Tabelas têm captions
  - [ ] Headers de tabela corretos
  - [ ] Associação correta headers/cells
  - [ ] Tabelas simples quando possível

### 3.2 ARIA Implementation (7 pontos)
- [ ] **ARIA Labels (2 pts)**
  - [ ] aria-label usado corretamente
  - [ ] aria-labelledby usado corretamente
  - [ ] Labels descritivos e únicos

- [ ] **ARIA Roles (2 pts)**
  - [ ] role atribuídos corretamente
  - [ ] landmark roles implementados
  - [ ] Roles não redundantes

- [ ] **ARIA States (3 pts)**
  - [ ] aria-expanded usado corretamente
  - [ ] aria-selected usado corretamente
  - [ ] aria-disabled usado corretamente
  - [ ] Estados sincronizados com JavaScript

### 3.3 Alternative Text (5 pontos)
- [ ] **Image Alt Text (3 pts)**
  - [ ] Imagens informativas têm alt descritivo
  - [ ] Imagens decorativas têm alt=""
  - [ ] Imagens complexas têm longdesc
  - [ ] Ícones têm texto alternativo

- [ ] **Form Labels (2 pts)**
  - [ ] Todos os campos têm labels
  - [ ] Labels são descritivos
  - [ ] Labels associados corretamente
  - [ ] Placeholders não substituem labels

---

## 🎨 Seção 4: Color Contrast (10 pontos)

### 4.1 Text Contrast (6 pontos)
- [ ] **Normal Text (3 pts)**
  - [ ] Contraste ≥ 4.5:1 para texto normal
  - [ ] Contraste verificado com ferramenta
  - [ ] Texto legível em todos os contextos
  - [ ] Sem texto sobre fundo de baixo contraste

- [ ] **Large Text (2 pts)**
  - [ ] Contraste ≥ 3:1 para texto grande
  - [ ] Texto grande definido corretamente
  - [ ] Contraste adequado em títulos
  - [ ] Contraste adequado em legendas

- [ ] **UI Components (1 pt)**
  - [ ] Contraste ≥ 3:1 para componentes
  - [ ] Estados de foco com contraste adequado
  - [ ] Estados disabled com contraste adequado

### 4.2 Non-Text Contrast (4 pontos)
- [ ] **Icons and Graphics (2 pts)**
  - [ ] Ícones têm contraste suficiente
  - [ ] Gráficos são distinguíveis
  - [ ] Indicadores visuais claros
  - [ ] Sem dependência apenas de cor

- [ ] **Border and Focus (2 pts)**
  - [ ] Borders têm contraste adequado
  - [ ] Focus indicators visíveis
  - [ ] Estados hover com contraste adequado
  - [ ] Estados active com contraste adequado

---

## 🏗️ Seção 5: Semantic HTML (10 pontos)

### 5.1 HTML5 Semantic Elements (6 pontos)
- [ ] **Structural Elements (3 pts)**
  - [ ] header, nav, main, footer usados
  - [ ] section, article, aside usados
  - [ ] figure, figcaption usados
  - [ ] Uso correto de elementos semânticos

- [ ] **Form Elements (3 pts)**
  - [ ] form, fieldset, legend usados
  - [ ] label, input, textarea usados
  - [ ] button, select, option usados
  - [ ] Validação HTML5 implementada

### 5.2 ARIA Semantic (4 pontos)
- [ ] **Landmarks (2 pts)**
  - [ ] banner, navigation, main implementados
  - [ ] contentinfo, search implementados
  - [ ] region usados quando apropriado
  - [ ] Sem landmarks redundantes

- [ ] **Live Regions (2 pts)**
  - [ ] aria-live usado corretamente
  - [ ] aria-atomic usado quando necessário
  [ ] aria-busy usado para atualizações
  - [ ] aria-relevant para mudanças de contexto

---

## 📊 Relatório de Validação

### Score por Seção
| Seção | Score Máximo | Score Obtido | Percentual | Status |
|-------|--------------|--------------|-----------|--------|
| WCAG Compliance | 40 | [ ] | [ ]% | [✅|⚠️|❌] |
| Keyboard Navigation | 20 | [ ] | [ ]% | [✅|⚠️|❌] |
| Screen Reader | 20 | [ ] | [ ]% | [✅|⚠️|❌] |
| Color Contrast | 10 | [ ] | [ ]% | [✅|⚠️|❌] |
| Semantic HTML | 10 | [ ] | [ ]% | [✅|⚠️|❌] |
| **TOTAL** | **100** | **[ ]** | **[ ]%** | **[Status Final]** |

### Nível de Conformidade
- [ ] **WCAG 2.1 AAA** (95-100)
- [ ] **WCAG 2.1 AA** (80-94)
- [ ] **WCAG 2.1 A** (60-79)
- [ ] **Não Conforme** (< 60)

### Issues Críticas (Bloqueiam Aprovação)
1. **[Issue 1]** - [Descrição]
   - **Seção:** [Nome da seção]
   - **Impacto:** [Descrição do impacto]
   - **Recomendação:** [Solução]

2. **[Issue 2]** - [Descrição]
   - **Seção:** [Nome da seção]
   - **Impacto:** [Descrição do impacto]
   - **Recomendação:** [Solução]

### Issues Moderadas (Recomendadas Correção)
1. **[Issue 1]** - [Descrição]
   - **Seção:** [Nome da seção]
   - **Impacto:** [Descrição do impacto]
   - **Recomendação:** [Solução]

---

## 🚀 Scripts de Validação Automatizada

### 1. Verificação de Contraste
```bash
# Verificar contraste de cores
npm run check:contrast

# Output esperado:
✅ Text contrast: 95% pass
✅ Component contrast: 88% pass
⚠️ Button contrast: 78% pass (2 warnings)
❌ Link contrast: 65% fail (3 errors)
```

### 2. Validação HTML Semântico
```bash
# Validar HTML semântico
npm run validate:semantic

# Output esperado:
✅ Semantic structure: 92% pass
✅ ARIA implementation: 85% pass
❌ Missing landmarks: 3 errors
⚠️ Redundant ARIA: 2 warnings
```

### 3. Teste de Navegação por Teclado
```bash
# Testar navegação por teclado
npm run test:keyboard

# Output esperado:
✅ Tab navigation: 100% pass
✅ Focus management: 95% pass
❌ Focus trap detected: 1 error
⚠️ Missing skip links: 2 warnings
```

### 4. Validação com Leitor de Tela
```bash
# Testar com leitor de tela
npm run test:screenreader

# Output esperado:
✅ NVDA compatibility: 88% pass
✅ VoiceOver compatibility: 85% pass
❌ Missing labels: 3 errors
⚠️ Poor heading structure: 2 warnings
```

---

## 🔧 Ferramentas de Validação

### Ferramentas Automatizadas
- **axe-core:** Integração com testes unitários
- **WAVE:** Validação online
- **Lighthouse:** Auditoria completa
- **Color Contrast Analyzer:** Verificação de contraste

### Ferramentas Manuais
- **NVDA:** Leitor de tela Windows
- **VoiceOver:** Leitor de tela macOS
- **JAWS:** Leitor de tela profissional
- **ZoomText:** Teste de zoom do navegador

### Extensões de Browser
- **axe DevTools:** Debug de acessibilidade
- **WAVE Extension:** Validação em tempo real
- **Color Contrast Analyzer:** Medição de contraste
- **Keyboard Navigation Tester:** Teste de teclado

---

## 📋 Processo de Validação

### 1. Validação Automática (30 minutos)
```bash
# Executar todas as validações automatizadas
npm run validate:accessibility

# Gerar relatório
npm run report:accessibility
```

### 2. Validação Manual (60 minutos)
- Navegação por teclado completa
- Teste com leitor de tela
- Verificação de contraste
- Teste de zoom e alto contraste

### 3. Revisão e Documentação (30 minutos)
- Compilar resultados
- Gerar relatório detalhado
- Documentar issues encontrados
- Criar plano de ação

---

## 🎯 Critérios de Aprovação

### ✅ Aprovado (Score ≥ 80)
- WCAG 2.1 AA compliance
- Sem issues críticas
- Issues moderadas documentadas
- Testes manuais aprovados

### ⚠️ Aprovado com Reservas (Score 70-79)
- WCAG 2.1 A compliance
- Issues críticas limitadas
- Plano de correção definido
- Timeline estabelecida

### ❌ Reprovado (Score < 70)
- Não conformidade WCAG
- Issues críticas múltiplas
- Risco legal ou de usabilidade
- Revisão completa necessária

---

**Status Final:** [ ] ✅ **APROVADO** | [ ] ⚠️ **APROVADO COM RESERVAS** | [ ] ❌ **REPROVADO**

**Score Final:** [ ]/100 pontos  
**Nível de Conformidade:** [WCAG 2.1 AA|A|AAA|Não Conforme]  
**Data da Próxima Validação:** [DD/MM/YYYY]

---

*Este checklist deve ser executado regularmente para manter a conformidade WCAG contínua e garantir a acessibilidade para todos os usuários.*