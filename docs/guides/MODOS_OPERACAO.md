# Guia de Modos de Operação - Maestro v2.0

**Versão:** 2.0.0  
**Última Atualização:** 02/02/2026

---

## 📋 Visão Geral

O Maestro v2.0 introduz **3 modos de operação** que permitem otimizar o uso de prompts/créditos em IDEs pagas (Cursor, Windsurf, GitHub Copilot) sem sacrificar a qualidade dos entregáveis.

---

## 🎯 Os 3 Modos

### 💰 Economy Mode

**Quando Usar:**
- POCs (Proof of Concept)
- Protótipos rápidos
- MVPs iniciais
- Projetos de aprendizado
- Orçamento limitado de créditos

**Características:**
- ✅ **Economia:** ~70% menos prompts
- ✅ **Velocidade:** ~50% mais rápido
- ⚠️ **Qualidade:** ~85% (ainda muito boa)
- ✅ **Prompts/Projeto:** 40-60 (vs 130-180)

**Otimizações Ativas:**
- ✅ Batch Questions (consolida perguntas)
- ✅ Context Caching (reutiliza contexto)
- ✅ Template Compression (templates compactos)
- ✅ Smart Validation (validação incremental)
- ✅ One-Shot Generation (geração completa)
- ✅ Differential Updates (apenas diffs)

**Quality Threshold:** 70%  
**Auto-fix:** ✅ Ativado  
**Checkpoints:** Apenas fases críticas

---

### ⚖️ Balanced Mode (Padrão)

**Quando Usar:**
- Projetos internos
- Aplicações de médio porte
- Produtos simples
- Maioria dos casos de uso

**Características:**
- ✅ **Economia:** ~45% menos prompts
- ✅ **Velocidade:** ~25% mais rápido
- ✅ **Qualidade:** ~95% (excelente)
- ✅ **Prompts/Projeto:** 80-100 (vs 130-180)

**Otimizações Ativas:**
- ✅ Batch Questions
- ✅ Context Caching
- ❌ Template Compression (usa templates completos)
- ✅ Smart Validation
- ✅ One-Shot Generation
- ✅ Differential Updates

**Quality Threshold:** 75%  
**Auto-fix:** ✅ Ativado  
**Checkpoints:** Fases críticas

---

### ⭐ Quality Mode

**Quando Usar:**
- Produtos complexos
- Aplicações críticas
- Compliance rigoroso (PCI-DSS, HIPAA, SOC2)
- Projetos de longo prazo
- Quando qualidade é prioridade absoluta

**Características:**
- ⚠️ **Economia:** 0% (sem otimizações)
- ⚠️ **Velocidade:** Baseline (100%)
- ✅ **Qualidade:** ~100% (máxima)
- ⚠️ **Prompts/Projeto:** 130-180

**Otimizações Ativas:**
- ❌ Batch Questions (perguntas iterativas)
- ✅ Context Caching (apenas cache)
- ❌ Template Compression
- ❌ Smart Validation (validação completa)
- ❌ One-Shot Generation
- ❌ Differential Updates

**Quality Threshold:** 80%  
**Auto-fix:** ❌ Desativado  
**Checkpoints:** Todas as fases

---

## 🚀 Como Usar

### Configurar Modo no Início do Projeto

```bash
# Ao iniciar projeto
/mcp-start

# Maestro perguntará:
"Qual modo de operação deseja usar?
1. Economy (70% economia, ideal para POCs)
2. Balanced (45% economia, ideal para projetos internos) [PADRÃO]
3. Quality (0% economia, máxima qualidade)"
```

**Ou configurar explicitamente:**

```typescript
// Ler estado atual
const estadoJson = await fs.readFile('.maestro/estado.json', 'utf-8');

// Configurar modo
await configurar_modo({
  mode: "economy", // ou "balanced" ou "quality"
  estado_json: estadoJson,
  diretorio: process.cwd()
});

// Salvar estado atualizado
await fs.writeFile('.maestro/estado.json', novoEstadoJson);
```

### Mudar Modo Durante o Projeto

```typescript
// É possível mudar o modo a qualquer momento
await configurar_modo({
  mode: "quality", // Mudar para quality antes de fase crítica
  estado_json: estadoJson,
  diretorio: process.cwd()
});
```

**Exemplo de Uso:**
```
Fases 1-5: Economy (design e planejamento)
Fases 6-9: Balanced (arquitetura e testes)
Fases 10-13: Quality (implementação crítica)
```

---

## 📊 Comparação Detalhada

### Prompts por Fase

| Fase | Quality | Balanced | Economy |
|------|---------|----------|---------|
| 1. Produto | 10-12 | 6-8 | 3-4 |
| 2. Requisitos | 12-15 | 7-9 | 3-5 |
| 3. UX Design | 10-12 | 6-8 | 3-4 |
| 4. Modelagem | 12-15 | 7-9 | 4-5 |
| 5. Database | 10-12 | 6-8 | 3-4 |
| 6. Arquitetura | 15-18 | 9-11 | 4-6 |
| 7. Segurança | 10-12 | 6-8 | 3-4 |
| 8. Testes | 10-12 | 6-8 | 3-4 |
| 9. Plano Exec | 12-15 | 7-9 | 4-5 |
| 10. Contrato API | 10-12 | 6-8 | 3-4 |
| 11. Frontend | 20-25 | 12-15 | 5-7 |
| 12. Backend | 20-25 | 12-15 | 5-7 |
| 13. Integração | 10-12 | 6-8 | 3-4 |
| **TOTAL** | **130-180** | **80-100** | **40-60** |

### Tempo de Execução

| Atividade | Quality | Balanced | Economy |
|-----------|---------|----------|---------|
| Perguntas/Respostas | 100% | 60% | 30% |
| Geração de Código | 100% | 70% | 40% |
| Validação | 100% | 80% | 50% |
| Correções | 100% | 70% | 40% |
| **TOTAL** | **100%** | **70%** | **50%** |

### Qualidade dos Entregáveis

| Aspecto | Quality | Balanced | Economy |
|---------|---------|----------|---------|
| Completude | 100% | 95% | 85% |
| Detalhamento | 100% | 90% | 75% |
| Consistência | 100% | 95% | 90% |
| Validação | 100% | 95% | 85% |
| **MÉDIA** | **100%** | **94%** | **84%** |

---

## 💡 Recomendações por Tipo de Projeto

### POC / Protótipo
**Modo Recomendado:** 💰 Economy

**Justificativa:**
- Velocidade é crítica
- Orçamento limitado
- Qualidade 85% é suficiente
- Pode refinar depois

**Exemplo:**
```
Projeto: Validar ideia de marketplace
Prazo: 1 semana
Orçamento: 100 créditos
Modo: Economy
Resultado: MVP funcional em 3 dias, 45 créditos usados
```

### Aplicação Interna
**Modo Recomendado:** ⚖️ Balanced

**Justificativa:**
- Equilíbrio perfeito
- Qualidade 95% é excelente
- Economia significativa
- Padrão para maioria dos casos

**Exemplo:**
```
Projeto: Sistema de gestão de tarefas interno
Prazo: 1 mês
Orçamento: 300 créditos
Modo: Balanced
Resultado: Sistema completo em 3 semanas, 180 créditos usados
```

### Produto SaaS Simples
**Modo Recomendado:** ⚖️ Balanced → ⭐ Quality (fases finais)

**Justificativa:**
- Balanced para design/planejamento
- Quality para implementação crítica
- Otimiza custo sem comprometer qualidade

**Exemplo:**
```
Projeto: SaaS de agendamento
Prazo: 2 meses
Orçamento: 500 créditos
Modo: Balanced (fases 1-9) + Quality (fases 10-13)
Resultado: Produto robusto, 320 créditos usados
```

### Fintech / Healthcare
**Modo Recomendado:** ⭐ Quality

**Justificativa:**
- Compliance rigoroso
- Segurança crítica
- Qualidade não negociável
- Auditoria necessária

**Exemplo:**
```
Projeto: Plataforma de pagamentos (PCI-DSS)
Prazo: 6 meses
Orçamento: Ilimitado
Modo: Quality
Resultado: Sistema compliant, auditável, seguro
```

---

## 🔧 Otimizações Explicadas

### 1. Batch Questions

**O que faz:**
Consolida múltiplas perguntas em um único prompt.

**Antes (Quality):**
```
Prompt 1: "Qual o problema?"
Prompt 2: "Quem são os usuários?"
Prompt 3: "Quais funcionalidades?"
Prompt 4: "Qual métrica de sucesso?"
Prompt 5: "Gerar PRD"
Total: 5 prompts
```

**Depois (Economy/Balanced):**
```
Prompt 1: "Responda todas:
1. Qual o problema?
2. Quem são os usuários?
3. Quais funcionalidades?
4. Qual métrica de sucesso?"

Prompt 2: "Gerar PRD com respostas"
Total: 2 prompts (-60%)
```

### 2. Context Caching

**O que faz:**
Reutiliza especialistas e templates por 1 hora.

**Economia:**
- Especialista: ~2000 tokens
- Template: ~1500 tokens
- Total: ~3500 tokens por fase
- Cache: Carrega 1x, usa 10x

### 3. Template Compression

**O que faz:**
Usa versões compactas de templates (apenas Economy).

**Exemplo:**
```markdown
# Template Completo (Quality/Balanced)
## 1. Visão do Produto
[Descrição detalhada de 3-5 parágrafos...]
## 2. Problema
[Análise profunda com dados...]
... (20+ seções)

# Template Compacto (Economy)
## Visão: [1 parágrafo]
## Problema: [bullet points]
## Solução: [bullet points]
... (8 seções essenciais)
```

**Economia:** ~60% menos tokens

### 4. Smart Validation

**O que faz:**
Validação incremental com early exit.

**Camadas:**
1. Estrutura (sempre)
2. Checklist (se estrutura >= 50%)
3. Qualidade (se checklist >= 70%)
4. Arquitetura (se qualidade >= 70%)
5. Segurança (se arquitetura >= 70%)

**Economia:** ~40% menos validações

### 5. One-Shot Generation

**O que faz:**
Gera código completo em um único prompt.

**Antes (Quality):**
```
Prompt 1: "Criar componente"
Prompt 2: "Adicionar props"
Prompt 3: "Adicionar estilos"
Prompt 4: "Adicionar testes"
Total: 4 prompts
```

**Depois (Economy/Balanced):**
```
Prompt 1: "Criar componente completo com:
- Props: [...]
- Estilos: TailwindCSS
- Testes: Jest + RTL
- Acessibilidade: ARIA
Contexto: [patterns, stack, dependencies]"
Total: 1 prompt (-75%)
```

### 6. Differential Updates

**O que faz:**
Envia apenas diff das mudanças.

**Economia:** ~80% menos tokens em correções

---

## 📈 Métricas e Monitoramento

### Ver Estatísticas do Modo Atual

```typescript
await status({
  estado_json: estadoJson,
  diretorio: process.cwd()
});

// Retorna:
// - Modo atual
// - Prompts usados até agora
// - Economia estimada
// - Fases concluídas
// - Quality score médio
```

### Comparar Modos

```typescript
// Simular economia em diferentes modos
const simulation = {
  economy: { prompts: 45, time: "50%", quality: "85%" },
  balanced: { prompts: 90, time: "70%", quality: "95%" },
  quality: { prompts: 150, time: "100%", quality: "100%" }
};
```

---

## ⚠️ Limitações e Trade-offs

### Economy Mode

**Limitações:**
- Templates mais simples (menos detalhamento)
- Menos iterações de refinamento
- Validação menos rigorosa
- Pode precisar ajustes manuais

**Quando NÃO Usar:**
- Compliance rigoroso
- Sistemas críticos
- Produtos complexos
- Quando qualidade é prioridade absoluta

### Balanced Mode

**Limitações:**
- Não é o mais rápido
- Não é o mais econômico
- Não é o mais completo

**Quando NÃO Usar:**
- POCs rápidos (use Economy)
- Sistemas críticos (use Quality)

### Quality Mode

**Limitações:**
- Mais lento
- Mais caro
- Mais verboso

**Quando NÃO Usar:**
- Orçamento limitado
- Prazo apertado
- POCs/Protótipos

---

## 🎯 Conclusão

**Recomendação Geral:**
- **80% dos projetos:** Balanced
- **15% dos projetos:** Economy (POCs)
- **5% dos projetos:** Quality (críticos)

**Dica de Ouro:**
Comece com **Balanced** e ajuste conforme necessário. Você sempre pode mudar o modo durante o projeto.

---

**Próximo:** [Guia de Frontend-First](./FRONTEND_FIRST.md)
