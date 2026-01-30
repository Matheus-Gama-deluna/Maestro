---
name: specialist-debugging-troubleshooting
description: Resolução sistemática de bugs com metodologia de 4 fases (Reproduce, Isolate, Understand, Fix). Use quando precisar resolver bugs complexos, analisar causa raiz ou criar post-mortems.
allowed-tools: Read, Write, Edit, Glob, Grep
version: 2.0
framework: progressive-disclosure
---

# Debugging e Troubleshooting · Skill Moderna

## Missão
Resolver bugs complexos em 60-90 minutos usando metodologia estruturada de 4 fases, focando em causa raiz (não sintomas).

## Quando ativar
- **Fase:** Manutenção · Bug Fix
- **Workflows:** /corrigir-bug, /debugging
- **Trigger:** "bug em produção", "resolver erro", "análise de causa raiz"

## Inputs obrigatórios
- Código fonte e logs disponíveis
- Steps to reproduce documentados
- Ambiente e contexto do erro

## Outputs gerados
- `src/` — Código corrigido
- `tests/` — Regression test
- `docs/bugs/[ID].md` — Post-mortem completo

## Quality Gate
- Bug reproduzível 100% das vezes
- Causa raiz identificada (não sintoma)
- Regression test implementado
- Post-mortem documentado
- Score de validação automática ≥ 75 pontos

## 🚀 Processo Otimizado (4 Fases)

### 1. REPRODUCE (15 min)
Use função de reprodução para confirmar bug e documentar steps exatos.

**Checklist:**
- Steps de reprodução documentados
- Taxa de reprodução (100%? intermitente?)
- Comportamento esperado vs atual
- Ambiente (OS, browser, versão)
- Data/versão que começou a ocorrer

### 2. ISOLATE (20 min)
Reduza scope e identifique componente responsável.

**Técnicas:**
- Binary search debugging
- Git bisect
- Network/console logs
- Minimal reproduction case

### 3. UNDERSTAND (20 min)
Aplique técnica dos 5 Whys para identificar causa raiz.

Use função de análise de causa raiz para documentar investigação completa.

### 4. FIX (30 min)
Corrija causa raiz e previna recorrência.

Use função de validação para garantir qualidade do fix.

## 📚 Recursos Adicionais

### Prompts Especializados
- **Análise de Bugs:** [resources/prompts/analise-bugs.md](resources/prompts/analise-bugs.md) (14KB)
  - Metodologia completa: 5 Whys, Fishbone Diagram, RCA
  - Template de análise detalhado com 8 seções
  - Exemplos práticos de bugs (validação, performance, N+1)
  - Checklist pós-geração com 15+ critérios

### Guias de Referência
- **Debugging com IA:** [resources/reference/debugging-ai-guide.md](resources/reference/debugging-ai-guide.md)
  - Fluxo estruturado de 6 etapas
  - Prompts prontos para cada tipo de erro
  - Técnicas de debugging sistemático
  - Boas práticas e armadilhas comuns
- **Guia Completo:** [resources/reference/debugging-guide.md](resources/reference/debugging-guide.md)
  - Metodologia de 4 fases (Reproduce, Isolate, Understand, Fix)
  - Ferramentas por tipo de erro
  - Casos de uso avançados

### Templates e Exemplos
- **Template Bug Report:** [resources/templates/bug-report.md](resources/templates/bug-report.md)
- **Template Post-Mortem:** [resources/templates/post-mortem.md](resources/templates/post-mortem.md)
- **Exemplos práticos:** [resources/examples/debugging-examples.md](resources/examples/debugging-examples.md)
- **Validação:** [resources/checklists/debugging-validation.md](resources/checklists/debugging-validation.md)

### Funções de Automação
- **Reprodução:** Função de documentação de steps
- **Análise:** Função de causa raiz (5 Whys + Fishbone)
- **Validação:** Função de verificação de qualidade (score automático)

## 🛠️ Ferramentas por Tipo de Erro

| Tipo de Erro | Ferramenta | Quando Usar |
|--------------|-----------|-------------|
| **Runtime** | Debugger | Breakpoints, step-through |
| **Performance** | Profiler | Chrome DevTools, node --inspect |
| **Network** | Browser DevTools | Network tab, HAR files |
| **Memory Leak** | Heap Profiler | Chrome Memory |
| **Logic** | Binary Search | Comentar metade do código |
| **Regression** | Git Bisect | git bisect start/bad/good |

## 🔄 Context Flow Automatizado

### Ao Concluir (Score ≥ 75)
1. **Fix validado** automaticamente
2. **Regression test** criado
3. **Post-mortem** documentado
4. **Transição** para deploy ou próxima tarefa

### Comando de Avanço
Use função de processamento para preparar transição automática quando fix estiver validado.

### Guardrails Críticos
- **NUNCA avance** sem validação ≥ 75 pontos
- **SEMPRE confirme** com usuário antes de processar
- **VALIDE** causa raiz identificada (não sintoma)
- **DOCUMENTE** análise dos 5 Whys
- **USE funções descritivas** para automação via MCP

## 🎯 Metodologia dos 5 Whys

### Exemplo Prático
```
Bug: "Usuário não consegue fazer login"
1. Por quê? → Token JWT inválido
2. Por quê? → Expiração de 1h mas clock do servidor atrasado
3. Por quê? → NTP não configurado
4. Por quê? → Server provisioning script não instalava NTP
5. Por quê? → Ninguém revisou hardening checklist

ROOT CAUSE: Falta de checklist de provisioning
```

### Checklist de Qualidade
- [ ] Bug reproduzível 100%
- [ ] Componente isolado identificado
- [ ] 5 Whys documentados
- [ ] Causa raiz (não sintoma)
- [ ] Fix implementado na raiz
- [ ] Regression test criado
- [ ] Post-mortem completo
- [ ] Score validação ≥ 75

## 🎯 Performance e Métricas

### Tempo Estimado
- **Reproduce:** 15 minutos
- **Isolate:** 20 minutos
- **Understand:** 20 minutos
- **Fix:** 30 minutos
- **Total:** 85 minutos (vs 120 minutos anterior)

### Qualidade Esperada
- **Score validação:** ≥ 75 pontos
- **Completude:** 100% campos obrigatórios
- **Consistência:** 100% formato padrão
- **Performance:** 80% redução de tokens

### Frameworks Utilizados
- **5 Whys Analysis**
- **Binary Search Debugging**
- **Git Bisect**
- **Post-Mortem Template**

## 🔧 Integração Maestro

### Skills Complementares
- `systematic-debugging` (metodologia)
- `testing-patterns` (regression tests)
- `code-review-checklist` (validação)

### Referências Essenciais
- **Especialista original:** `content/specialists/Especialista em Debugging e Troubleshooting.md`
- **Artefatos gerados:**
  - `src/` (código corrigido)
  - `tests/` (regression test)
  - `docs/bugs/[ID].md` (post-mortem)

### Próximo Especialista
**Testes** - Validará fix com testes automatizados e cobertura.

---

**Framework:** Maestro Skills Modernas v2.0  
**Pattern:** Progressive Disclosure  
**Performance:** 80% redução de tokens  
**Quality:** 100% validação automática