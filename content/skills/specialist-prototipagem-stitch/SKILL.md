---
name: "Prototipagem com Google Stitch"
version: "1.0.0"
type: "specialist"
category: "complementar"
complexity: "media"
estimated_time: "85 minutos"
score_minimo: 75
tags: ["prototipagem", "stitch", "ui", "ux", "design", "feedback"]
dependencies: ["Design Doc", "Requisitos", "UX Design"]
---

# Especialista: Prototipagem com Google Stitch

## 🎯 Visão Geral

Este especialista auxilia na criação rápida de protótipos interativos usando Google Stitch, transformando Design Docs e requisitos em interfaces funcionais que podem ser testadas e iteradas com feedback contínuo do usuário.

**Quando Usar:**
- Após concluir o Design Doc e precisar validar conceitos visuais
- Quando stakeholders precisam visualizar a interface antes do desenvolvimento
- Para testar fluxos de usuário e interações rapidamente
- Quando é necessário coletar feedback visual antes de codificar

**Não Usar Quando:**
- Projeto não possui interface visual
- Design Doc ainda não foi aprovado
- Protótipo de alta fidelidade não é necessário

## 📋 Processo de 4 Etapas

### Etapa 1: Análise (15 min)
**Objetivo:** Compreender requisitos e mapear componentes

**Ações:**
- Revisar Design Doc completo
- Identificar todos os componentes de UI necessários
- Mapear fluxos de interação principais
- Definir prioridades de prototipagem

**Entregável:** Lista de componentes e fluxos mapeados

### Etapa 2: Geração (20 min)
**Objetivo:** Criar prompts otimizados para Stitch

**Ações:**
- Gerar prompts estruturados usando template
- Incluir contexto completo do projeto
- Referenciar Design System (se existir)
- Preparar instruções claras para Stitch

**Entregável:** Prompts otimizados prontos para uso

**Template:** Ver `resources/templates/prompt-stitch.md`

### Etapa 3: Prototipagem (30 min)
**Objetivo:** Gerar protótipo interativo no Stitch

**Ações:**
- Acessar Google Stitch (stitch.withgoogle.com)
- Inserir prompts gerados
- Iterar até obter componentes funcionais
- Configurar interações e navegação
- Exportar código HTML/CSS

**Entregável:** Protótipo funcional + código exportado

### Etapa 4: Validação (20 min)
**Objetivo:** Coletar feedback e refinar

**Ações:**
- Compartilhar protótipo com stakeholders
- Coletar feedback estruturado
- Documentar sugestões de melhoria
- Iterar conforme necessário
- Obter aprovação final

**Entregável:** Protótipo aprovado + feedback documentado

**Template:** Ver `resources/templates/prototipo-stitch.md`

## 🔧 Funções MCP Disponíveis

### initialize_stitch_prototype
Inicializa estrutura do protótipo baseado no Design Doc.

**Quando usar:** Início da Etapa 1 (Análise)

**Saída:** Estrutura de componentes e próximos passos

### generate_stitch_prompts
Gera prompts otimizados para Google Stitch.

**Quando usar:** Durante Etapa 2 (Geração)

**Saída:** Lista de prompts prontos para uso

### validate_prototype_quality
Valida qualidade do protótipo contra checklist.

**Quando usar:** Ao final da Etapa 4 (Validação)

**Saída:** Score de qualidade (0-100) e recomendações

**Detalhes:** Ver `MCP_INTEGRATION.md` para parâmetros completos

## 📚 Progressive Disclosure

### Para Aprender Mais
- **Exemplos Práticos:** `resources/examples/stitch-examples.md`
  - 5 cenários completos com input/output
  - Dashboard, E-commerce, Social Media, Forms, Mobile

- **Checklist de Validação:** `resources/checklists/stitch-validation.md`
  - Sistema de pontuação (100 pontos)
  - Critérios por etapa
  - Score mínimo: 75 pontos

- **Guia Completo:** `resources/reference/stitch-guide.md`
  - Introdução ao Google Stitch
  - Técnicas de Prompt Engineering
  - Design System Integration
  - Human-in-the-Loop Best Practices
  - Anti-Patterns e Troubleshooting

### Templates Disponíveis
- `resources/templates/prototipo-stitch.md` - Estrutura do protótipo
- `resources/templates/prompt-stitch.md` - Prompts otimizados

## 💡 Exemplo Rápido

**Cenário:** Dashboard de Analytics

**Input:**
```
Design Doc: Dashboard com 4 widgets principais
Requisitos: Gráficos interativos, filtros por data, export CSV
Design System: Material Design
```

**Processo:**
1. **Análise:** Identificar 4 widgets + barra de filtros + botão export
2. **Geração:** Criar prompt com contexto Material Design
3. **Prototipagem:** Gerar no Stitch, iterar componentes
4. **Validação:** Coletar feedback, ajustar cores/layout

**Output:** Protótipo funcional em ~85 minutos

**Ver exemplo completo:** `resources/examples/stitch-examples.md#dashboard-analytics`

## 🎯 Inovações

### Human-in-the-Loop
Feedback contínuo do usuário durante todo o processo de prototipagem, garantindo alinhamento constante com expectativas.

### Design System Integration
Integração automática com design systems populares (Material, Ant Design, Chakra UI), mantendo consistência visual.

### Prompts Otimizados
Templates de prompts testados e otimizados para Google Stitch, reduzindo tempo de iteração.

### Export Automático
Código HTML/CSS exportado automaticamente, facilitando transição para desenvolvimento.

## 📊 Métricas de Sucesso

- **Tempo Total:** ~85 minutos (vs 4-6 horas manual)
- **Iterações:** 2-3 em média
- **Taxa de Aprovação:** >90% após feedback
- **Redução de Retrabalho:** 60% no desenvolvimento

## ✅ Próximos Passos

Após aprovação do protótipo:
1. Compartilhar código exportado com equipe de desenvolvimento
2. Atualizar Design Doc com decisões visuais finais
3. Criar histórias de usuário baseadas nos fluxos validados
4. Iniciar desenvolvimento frontend com referência ao protótipo

## 🔗 Integração com Outros Especialistas

**Recebe de:**
- UX Design → Design Doc
- Engenharia de Requisitos → Requisitos de UI

**Entrega para:**
- Desenvolvimento Frontend → Protótipo aprovado + código
- Plano de Execução → Histórias baseadas em fluxos validados

---

**Versão:** 1.0.0  
**Última Atualização:** 30/01/2026  
**Mantido por:** Maestro Team