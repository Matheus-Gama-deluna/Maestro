# ♿ Checklist de Acessibilidade WCAG 2.1 AA

## 📋 Metadados

**Projeto:** [Nome do Projeto]  
**Data da Auditoria:** [DD/MM/YYYY]  
**Auditor:** [Nome do Auditor]  
**Versão WCAG:** 2.1 AA  
**Status:** [Em Progresso|Concluído|Reprovado]  
**Score:** [XX]/100 pontos  

---

## 🎯 Visão Geral

### Objetivo da Auditoria
[ ] **Propósito:** [Descrição clara do propósito da auditoria]
[ ] **Escopo:** [O que está incluído e excluído]
[ ] **Público-Alvo:** [Usuários com deficiências contempladas]
[ ] **Plataformas:** [Web, Mobile, Desktop]
[ ] **Navegadores:** [Chrome, Firefox, Safari, Edge]
[ ] **Leitores de Tela:** [NVDA, VoiceOver, JAWS]

### Critérios de Avaliação
- **Conformidade:** WCAG 2.1 Nível AA
- **Metodologia:** Automática + Manual
- **Ferramentas:** axe-core, WAVE, Lighthouse
- **Testes Humanos:** Teclado, Leitores de Tela, Zoom

---

## 🔍 1. Perceptível (Perceivable)

### 1.1 Alternativas em Texto
[ ] **1.1.1 - Conteúdo Não Textual**
  - [ ] Imagens decorativas têm `alt=""`
  - [ ] Imagens informativas têm `alt` descritivo
  - [ ] Imagens complexas têm `longdesc` ou descrição adjacente
  - [ ] Ícones têm texto alternativo
  - [ ] Gráficos e diagramas têm descrições
  - **Score:** [ ]/5

[ ] **1.2.2 - Legendas (Pré-gravado)**
  - [ ] Vídeos têm legendas sincronizadas
  - [ ] Legendas são precisas e completas
  - [ ] Legendas identificam falantes
  - [ ] Legendas incluem sons importantes
  - [ ] Controles de legendas são acessíveis
  - **Score:** [ ]/5

[ ] **1.2.3 - Áudio Descrição ou Alternativa em Média (Pré-gravado)**
  - [ ] Vídeos têm descrição de áudio
  - [ ] Alternativa textual para áudio
  - [ ] Descrições são sincronizadas
  - [ ] Informações visuais críticas descritas
  - **Score:** [ ]/3

[ ] **1.2.4 - Legendas (Ao Vivo)**
  - [ ] Transmissões ao vivo têm legendas
  - [ ] Legendas são em tempo real
  - [ ] Qualidade das legendas adequada
  - **Score:** [ ]/2

[ ] **1.2.5 - Descrição de Áudio (Pré-gravado)**
  - [ ] Descrição de áudio disponível
  - [ ] Descrições são completas
  - **Score:** [ ]/2

### 1.2 Adaptável
[ ] **1.3.1 - Informações e Relacionamentos**
  - [ ] Estrutura lógica apresentada visualmente
  - [ ] Sequência de leitura clara
  - [ ] Relacionamentos entre conteúdo evidente
  - **Score:** [ ]/3

[ ] **1.3.2 - Sequência Significativa**
  - [ ] Ordem do conteúdo preservada
  - [ ] CSS não altera significado
  - [ ] Leitura linear faz sentido
  - **Score:** [ ]/2

[ ] **1.3.3 - Características Sensoriais**
  - [ ] Informações não dependem apenas de cor
  - [ ] Informações não dependem apenas de forma
  - [ ] Informações não dependem apenas de tamanho
  - [ ] Informações não dependem apenas de localização
  - [ ] Informações não dependem apenas de som
  - **Score:** [ ]/5

[ ] **1.4.1 - Uso de Cor**
  - [ ] Cor não é o único meio de identificação
  - [ ] Links têm indicadores além da cor
  - [ ] Campos de erro têm indicadores além da cor
  - [ ] Estados são identificáveis sem cor
  - **Score:** [ ]/3

[ ] **1.4.2 - Controle de Áudio**
  - [ ] Áudio automático tem controle
  - [ ] Volume pode ser controlado
  - [ ] Áudio pode ser pausado
  - [ ] Áudio de fundo pode ser desligado
  - **Score:** [ ]/3

### 1.3 Distinguível
[ ] **1.4.3 - Contraste (Mínimo)**
  - [ ] Texto normal: contraste ≥ 4.5:1
  - [ ] Texto grande: contraste ≥ 3:1
  - [ ] Componentes de UI: contraste ≥ 3:1
  - [ ] Gráficos: contraste adequado
  - **Score:** [ ]/5

[ ] **1.4.4 - Redimensionamento de Texto**
  - [ ] Texto redimensiona até 200%
  - [ ] Layout não quebra ao 200%
  - [ ] Funcionalidade preservada
  - [ ] Navegação funcional ao zoom
  - **Score:** [ ]/4

[ ] **1.4.5 - Texto como Imagem**
  - [ ] Texto como imagem só para decorativo
  - [ ] Logos têm alternativa textual
  - [ ] Captchas têm alternativas acessíveis
  - **Score:** [ ]/2

---

## ⌨️ 2. Operável (Operable)

### 2.1 Acessível por Teclado
[ ] **2.1.1 - Teclado**
  - [ ] Toda funcionalidade acessível por teclado
  - [ ] Sem teclado trap
  - [ ] Foco não fica preso
  - [ ] Modo de navegação claro
  - **Score:** [ ]/5

[ ] **2.1.2 - Sem Foco do Teclado**
  - [ ] Foco do teclado não desativado
  - [ ] Foco visível quando presente
  - [ ] Foco pode ser programaticamente detectado
  - **Score:** [ ]/3

[ ] **2.1.3 - Ordem do Foco (Exceção)**
  - [ ] Ordem do foco lógica e previsível
  - [ ] Foco segue ordem de leitura
  - [ ] Componentes complexos têm ordem interna
  - **Score:** [ ]/3

### 2.2 Tempo Suficiente
[ ] **2.2.1 - Ajuste de Tempo**
  - [ ] Tempo limite pode ser desativado
  - [ ] Usuário pode ajustar tempo
  - [ ] Aviso antes de expirar
  - [ ] Tempo mínimo de 20 segundos
  - **Score:** [ ]/5

[ ] **2.2.2 - Pausar, Parar, Ocultar**
  - [ ] Movimento automático pode ser pausado
  - [ ] Atualizações automáticas podem ser controladas
  - [ ] Conteúdo em movimento pode ser parado
  - **Score:** [ ]/3

### 2.3 Navegação
[ ] **2.4.1 - Ignorar Blocos**
  - [ ] Link para pular navegação
  - [ ] Blocos repetitivos podem ser ignorados
  - [ ] Múltiplas formas de navegar
  - **Score:** [ ]/3

[ ] **2.4.2 - Títulos de Página**
  - [ ] Cada página tem título descritivo
  - [ ] Títulos identificam conteúdo
  - [ ] Títulos são únicos no site
  - **Score:** [ ]/3

[ ] **2.4.3 - Foco e Ordem**
  - [ ] Foco visível e claro
  - [ ] Indicadores de foco acessíveis
  - [ ] Ordem do foco programaticamente determinável
  - **Score:** [ ]/3

### 2.4 Modos de Entrada
[ ] **2.5.1 - Ponteiros de Movimento**
  - [ ] Funcionalidade disponível sem ponteiro
  - [ ] Operações não exigem precisão
  - [ ] Alvos grandes o suficiente
  - [ ] Espaçamento adequado entre alvos
  - **Score:** [ ]/5

[ ] **2.5.2 - Ativação de Ponteiro**
  - [ ] Eventos disponíveis no down/up
  - [ ] Sem eventos dependentes de movimento
  - [ ] Cancelamento de ações possível
  - **Score:** [ ]/3

---

## 🧠 3. Compreensível (Understandable)

### 3.1 Legível
[ ] **3.1.1 - Idioma da Página**
  - [ ] Idioma principal programaticamente determinado
  - [ ] Mudanças de idioma marcadas
  - [ ] Lang codes corretos
  - **Score:** [ ]/3

[ ] **3.1.2 - Idioma de Partes**
  - [ ] Mudanças de idioma marcadas
  - [ ] Frases em outros idiomas identificadas
  - [ ] Citações em outros idiomas marcadas
  - **Score:** [ ]/2

[ ] **3.1.3 - Pronúncia**
  - [ ] Abreviações têm expansão
  - [ ] Termos técnicos têm definições
  - [ ] Pronúncia pode ser determinada
  - **Score:** [ ]/2

[ ] **3.1.4 - Abreviações**
  - [ ] Abreviações têm explicação
  - [ ] Acrônimos definidos no primeiro uso
  - [ ] Expansões disponíveis
  - **Score:** [ ]/2

[ ] **3.1.5 - Nível de Leitura**
  - [ ] Texto não requer mais que ensino médio
  - [ ] Termos complexos explicados
  - [ ] Ferramentas de ajuda disponíveis
  - **Score:** [ ]/3

[ ] **3.1.6 - Pronúncia**
  - [ ] Texto pode ser pronunciado corretamente
  - [ ] Conteúdo não ambíguo
  - [ ] Estrutura gramatical clara
  - **Score:** [ ]/2

### 3.2 Previsível
[ ] **3.2.1 - Foco**
  - [ ] Mudança de foco não causa mudança de contexto
  - [ ] Foco previsível e controlável
  - **Score:** [ ]/2

[ ] **3.2.2 - Entrada do Usuário**
  - [ ] Formulários não mudam ao preencher
  - [ ] Ajuda contextual disponível
  - [ ] Erros não causam perda de dados
  - **Score:** [ ]/3

[ ] **3.2.3 - Navegação Consistente**
  - [ ] Navegação consistente entre páginas
  - [ ] Componentes com mesma função têm mesmo nome
  - [ ] Ordem consistente de elementos
  - **Score:** [ ]/3

[ ] **3.2.4 - Identificação**
  - [ ] Componentes são claramente identificados
  - [ ] Propósito dos elementos evidente
  - [ ] Estado dos elementos claro
  - **Score:** [ ]/3

### 3.3 Assistência
[ ] **3.3.1 - Identificação de Erros**
  - [ ] Erros são claramente identificados
  - [ ] Mensagens de erro descritivas
  - [ ] Localização dos erros indicada
  - **Score:** [ ]/3

[ ] **3.3.2 - Rótulos ou Instruções**
  - [ ] Campos têm rótulos descritivos
  - [ ] Instruções claras disponíveis
  - [ ] Formatos de entrada especificados
  - [ ] Exemplos fornecidos quando necessário
  - **Score:** [ ]/4

[ ] **3.3.3 - Sugestões de Erro**
  - [ ] Sugestões para correção de erros
  - [ ] Formatos válidos explicados
  - [ ] Valores permitidos indicados
  - [ ] Ajuda contextual para correção
  - **Score:** [ ]/3

[ ] **3.3.4 - Prevenção de Erros (Legal, Financeiro, Dados)**
  - [ ] Confirmação para ações críticas
  - [ ] Reversão possível
  - [ ] Verificação de dados antes de enviar
  - [ ] Revisão final disponível
  - **Score:** [ ]/4

---

## 🔧 4. Robusto (Robust)

### 4.1 Compatível
[ ] **4.1.1 - Análise de Marcação**
  - [ ] HTML semântico utilizado
  - [ ] Elementos usados conforme propósito
  - [ ] Validação HTML sem erros
  - [ ] ARIA usado corretamente
  - **Score:** [ ]/5

[ ] **4.1.2 - Nome, Função, Valor**
  - [ ] Nome, função e valor programaticamente determináveis
  - [ ] Estados podem ser definidos programaticamente
  - [ ] Notificações podem ser definidas programaticamente
  - **Score:** [ ]/4

[ ] **4.1.3 - Anotações de Status**
  - [ ] Mudanças de estado anunciadas
  - [ ] Regiões live atualizadas
  - [ ] Mensagens de erro anunciadas
  - **Score:** [ ]/3

---

## 📊 Resumo da Auditoria

### Score por Princípio
| Princípio | Score Máximo | Score Obtido | Percentual |
|-----------|--------------|--------------|-----------|
| Perceptível | 38 | [ ] | [ ]% |
| Operável | 31 | [ ] | [ ]% |
| Compreensível | 30 | [ ] | [ ]% |
| Robusto | 12 | [ ] | [ ]% |
| **TOTAL** | **111** | **[ ]** | **[ ]%** |

### Nível de Conformidade
- [ ] **WCAG 2.1 AAA** (100%)
- [ ] **WCAG 2.1 AA** (≥ 80%)
- [ ] **WCAG 2.1 A** (≥ 60%)
- [ ] **Não Conforme** (< 60%)

### Issues Críticas (Prioridade Alta)
1. **[Issue 1]** - [Descrição breve]
   - **Local:** [Seção/Componente]
   - **WCAG:** [Critério específico]
   - **Impacto:** [Descrição do impacto]
   - **Recomendação:** [Solução sugerida]

2. **[Issue 2]** - [Descrição breve]
   - **Local:** [Seção/Componente]
   - **WCAG:** [Critério específico]
   - **Impacto:** [Descrição do impacto]
   - **Recomendação:** [Solução sugerida]

### Issues Moderadas (Prioridade Média)
1. **[Issue 1]** - [Descrição breve]
   - **Local:** [Seção/Componente]
   - **WCAG:** [Critério específico]
   - **Impacto:** [Descrição do impacto]
   - **Recomendação:** [Solução sugerida]

### Issues Leves (Prioridade Baixa)
1. **[Issue 1]** - [Descrição breve]
   - **Local:** [Seção/Componente]
   - **WCAG:** [Critério específico]
   - **Impacto:** [Descrição do impacto]
   - **Recomendação:** [Solução sugerida]

---

## 🚀 Plano de Ação

### Correções Imediatas (1-2 semanas)
- [ ] **[Correção 1]** - [Descrição]
  - Responsável: [Nome]
  - Prazo: [Data]
  - Prioridade: Alta

- [ ] **[Correção 2]** - [Descrição]
  - Responsável: [Nome]
  - Prazo: [Data]
  - Prioridade: Alta

### Melhorias de Médio Prazo (3-4 semanas)
- [ ] **[Melhoria 1]** - [Descrição]
  - Responsável: [Nome]
  - Prazo: [Data]
  - Prioridade: Média

### Otimizações de Longo Prazo (5-8 semanas)
- [ ] **[Otimização 1]** - [Descrição]
  - Responsável: [Nome]
  - Prazo: [Data]
  - Prioridade: Baixa

---

## 📋 Validação Final

### Testes Manuais Realizados
- [ ] **Navegação por Teclado** - [Resultado]
- [ ] **Leitor de Tela (NVDA)** - [Resultado]
- [ ] **Leitor de Tela (VoiceOver)** - [Resultado]
- [ ] **Zoom 200%** - [Resultado]
- [ ] **Modo Alto Contraste** - [Resultado]

### Ferramentas Automatizadas
- [ ] **axe-core** - [Violations encontradas]
- [ ] **WAVE** - [Errors/Alerts encontrados]
- [ ] **Lighthouse** - [Score obtido]
- [ ] **Color Contrast Checker** - [Issues encontrados]

### Aprovação
- [ ] **Score mínimo WCAG AA atingido** (80 pontos)
- [ ] **Issues críticas resolvidas**
- [ ] **Testes manuais aprovados**
- [ ] **Documentação completa**

---

## 📞 Contato e Suporte

### Equipe de Acessibilidade
- **Especialista:** [Nome e contato]
- **Desenvolvedor Responsável:** [Nome e contato]
- **Designer Responsável:** [Nome e contato]
- **QA Responsável:** [Nome e contato]

### Recursos Adicionais
- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices:** https://www.w3.org/TR/wai-aria-practices-1.1/
- **axe-core Documentation:** https://www.deque.com/axe/
- **WAVE Web Accessibility Tool:** https://wave.webaim.org/

---

**Status Final:** [ ] ✅ **APROVADO WCAG AA** | [ ] 🔄 **EM CORREÇÃO** | [ ] ❌ **REPROVADO**

**Score Final:** [ ]/111 pontos  
**Nível de Conformidade:** [WCAG 2.1 AA|A|AAA|Não Conforme]  
**Data da Próxima Revisão:** [DD/MM/YYYY]

---

*Este checklist deve ser atualizado regularmente para manter a conformidade WCAG contínua.*