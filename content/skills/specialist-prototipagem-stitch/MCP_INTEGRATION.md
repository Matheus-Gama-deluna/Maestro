# MCP Integration - Prototipagem com Google Stitch

## 📋 Visão Geral

Este documento descreve como o MCP (Model Context Protocol) deve implementar as funções de automação para o especialista de Prototipagem com Google Stitch. As skills são **puramente descritivas** e não executam código localmente.

## 🎯 Princípios Fundamentais

### Skills Descritivas
- ✅ Skills contêm apenas conhecimento e processos
- ✅ Toda automação é implementada no MCP externo
- ❌ Skills NUNCA executam código localmente
- ❌ Sem dependências de runtime na skill

### Separação de Responsabilidades
- **Skill:** Descreve "o que" e "como" (processo)
- **MCP:** Implementa "execução" e "automação"
- **Usuário:** Experiência limpa sem detalhes técnicos

## 🔧 Funções MCP a Implementar

### 1. initialize_stitch_prototype

**Descrição:**  
Inicializa estrutura do protótipo baseado no Design Doc e requisitos de UI.

**Quando Chamar:**  
Início da Etapa 1 (Análise) do processo de prototipagem.

**Parâmetros:**
```typescript
interface InitializeStitchPrototypeParams {
  design_doc_path: string;        // Caminho para Design Doc
  requirements_path?: string;     // Caminho para requisitos de UI (opcional)
  design_system?: string;         // Nome do Design System (Material/Ant/Chakra/Custom)
  project_context?: string;       // Contexto adicional do projeto
}
```

**Implementação Sugerida:**
```python
async def initialize_stitch_prototype(params):
    """
    Inicializa estrutura do protótipo Stitch.
    
    Passos:
    1. Ler Design Doc do caminho fornecido
    2. Extrair componentes de UI mencionados
    3. Mapear fluxos de interação principais
    4. Identificar Design System (se especificado)
    5. Gerar estrutura inicial de componentes
    6. Criar lista de prioridades
    
    Returns:
        {
            "components": List[Component],
            "flows": List[UserFlow],
            "design_system": str,
            "priorities": List[str],
            "next_steps": List[str]
        }
    """
    # Ler Design Doc
    design_doc = read_file(params.design_doc_path)
    
    # Extrair componentes usando NLP/parsing
    components = extract_ui_components(design_doc)
    
    # Mapear fluxos
    flows = extract_user_flows(design_doc)
    
    # Identificar Design System
    design_system = params.design_system or detect_design_system(design_doc)
    
    # Priorizar componentes
    priorities = prioritize_components(components, flows)
    
    return {
        "components": components,
        "flows": flows,
        "design_system": design_system,
        "priorities": priorities,
        "next_steps": generate_next_steps(components)
    }
```

**Saída Esperada:**
```json
{
  "components": [
    {
      "name": "Header",
      "type": "navigation",
      "priority": "high",
      "features": ["logo", "menu", "user-profile"]
    },
    {
      "name": "Dashboard Widget",
      "type": "data-visualization",
      "priority": "high",
      "features": ["chart", "filters", "export"]
    }
  ],
  "flows": [
    {
      "name": "User Login",
      "steps": ["landing", "login-form", "dashboard"],
      "priority": "critical"
    }
  ],
  "design_system": "Material Design",
  "priorities": ["Header", "Dashboard Widget", "Login Form"],
  "next_steps": [
    "Gerar prompts para componentes prioritários",
    "Revisar Design System guidelines",
    "Preparar contexto para Stitch"
  ]
}
```

**Validação:**
- ✅ Design Doc existe e é legível
- ✅ Pelo menos 1 componente foi identificado
- ✅ Pelo menos 1 fluxo foi mapeado
- ✅ Design System foi identificado ou especificado

**Guardrails:**
- Se Design Doc não existir, retornar erro claro
- Se nenhum componente for identificado, solicitar clarificação
- Limitar a 20 componentes principais para evitar sobrecarga

---

### 2. generate_stitch_prompts

**Descrição:**  
Gera prompts otimizados para Google Stitch baseados nos componentes identificados.

**Quando Chamar:**  
Durante Etapa 2 (Geração) do processo de prototipagem.

**Parâmetros:**
```typescript
interface GenerateStitchPromptsParams {
  components: Component[];        // Lista de componentes a prototipar
  design_system: string;          // Design System a seguir
  project_context: string;        // Contexto do projeto
  flows?: UserFlow[];             // Fluxos de usuário (opcional)
}
```

**Implementação Sugerida:**
```python
async def generate_stitch_prompts(params):
    """
    Gera prompts otimizados para Google Stitch.
    
    Passos:
    1. Carregar template de prompt base
    2. Para cada componente:
       a. Gerar contexto específico
       b. Incluir referências ao Design System
       c. Adicionar funcionalidades e interações
       d. Otimizar para Stitch
    3. Ordenar prompts por prioridade
    4. Adicionar dicas de iteração
    
    Returns:
        {
            "prompts": List[Prompt],
            "order": List[str],
            "tips": List[str]
        }
    """
    prompts = []
    
    for component in params.components:
        prompt = generate_component_prompt(
            component=component,
            design_system=params.design_system,
            context=params.project_context
        )
        prompts.append(prompt)
    
    # Ordenar por prioridade
    ordered_prompts = sort_by_priority(prompts)
    
    # Gerar dicas
    tips = generate_iteration_tips(params.design_system)
    
    return {
        "prompts": ordered_prompts,
        "order": [p.component_name for p in ordered_prompts],
        "tips": tips
    }
```

**Saída Esperada:**
```json
{
  "prompts": [
    {
      "component_name": "Dashboard Widget",
      "prompt": "Create a Material Design dashboard widget with:\n- Interactive line chart showing data trends\n- Date range filter (last 7/30/90 days)\n- Export to CSV button\n- Responsive layout for desktop and tablet\n- Color scheme: Primary #1976D2, Secondary #FFC107\n- Typography: Roboto font family",
      "priority": "high",
      "estimated_iterations": 2
    }
  ],
  "order": ["Dashboard Widget", "Header", "Login Form"],
  "tips": [
    "Start with the highest priority component",
    "Test each component before moving to the next",
    "Use Stitch's preview feature to validate interactions",
    "Export code after each successful iteration"
  ]
}
```

**Validação:**
- ✅ Pelo menos 1 prompt foi gerado
- ✅ Prompts contêm contexto suficiente
- ✅ Design System está referenciado
- ✅ Ordem de implementação está clara

**Guardrails:**
- Limitar a 10 prompts por execução
- Validar que prompts não são muito longos (max 500 caracteres)
- Garantir que Design System é suportado

---

### 3. validate_prototype_quality

**Descrição:**  
Valida qualidade do protótipo contra checklist e calcula score.

**Quando Chamar:**  
Ao final da Etapa 4 (Validação) do processo de prototipagem.

**Parâmetros:**
```typescript
interface ValidatePrototypeQualityParams {
  prototype_path: string;         // Caminho para arquivos do protótipo
  checklist_path?: string;        // Caminho para checklist customizado (opcional)
  components_expected: string[];  // Lista de componentes esperados
  flows_expected: string[];       // Lista de fluxos esperados
}
```

**Implementação Sugerida:**
```python
async def validate_prototype_quality(params):
    """
    Valida qualidade do protótipo.
    
    Passos:
    1. Carregar checklist de validação
    2. Verificar presença de componentes esperados
    3. Validar fluxos de usuário
    4. Verificar aderência ao Design System
    5. Calcular score (0-100)
    6. Gerar recomendações
    
    Returns:
        {
            "score": int,
            "validated_items": List[str],
            "pending_items": List[str],
            "recommendations": List[str],
            "approved": bool
        }
    """
    # Carregar checklist
    checklist = load_checklist(params.checklist_path or DEFAULT_CHECKLIST)
    
    # Analisar protótipo
    prototype_analysis = analyze_prototype(params.prototype_path)
    
    # Validar itens
    validated = []
    pending = []
    
    for item in checklist:
        if validate_item(item, prototype_analysis):
            validated.append(item)
        else:
            pending.append(item)
    
    # Calcular score
    score = (len(validated) / len(checklist)) * 100
    
    # Gerar recomendações
    recommendations = generate_recommendations(pending, prototype_analysis)
    
    return {
        "score": score,
        "validated_items": validated,
        "pending_items": pending,
        "recommendations": recommendations,
        "approved": score >= 75  # Threshold
    }
```

**Saída Esperada:**
```json
{
  "score": 82,
  "validated_items": [
    "Todos os componentes principais presentes",
    "Fluxos de usuário funcionam corretamente",
    "Design System seguido",
    "Interações são intuitivas",
    "Código exportado disponível"
  ],
  "pending_items": [
    "Feedback dos stakeholders não coletado",
    "Testes de acessibilidade não realizados"
  ],
  "recommendations": [
    "Compartilhar protótipo com stakeholders para feedback",
    "Validar contraste de cores (WCAG 2.1 AA)",
    "Testar navegação por teclado"
  ],
  "approved": true
}
```

**Validação:**
- ✅ Score está entre 0-100
- ✅ Itens validados e pendentes somam total do checklist
- ✅ Recomendações são acionáveis
- ✅ Aprovação baseada em threshold (≥75)

**Guardrails:**
- Score mínimo para aprovação: 75 pontos
- Se score < 70, bloquear avanço e solicitar correções
- Se score 70-74, permitir avanço com aprovação manual
- Se score ≥ 75, aprovar automaticamente

---

## 📊 Quality Gates

### Threshold de Aprovação
- **Score Mínimo:** 75 pontos
- **Cálculo:** (itens_validados / total_itens) * 100

### Critérios de Validação

#### Essenciais (Bloqueantes)
- [ ] Todos os componentes principais presentes (20 pontos)
- [ ] Fluxos de usuário funcionam corretamente (20 pontos)
- [ ] Código exportado disponível (15 pontos)

#### Importantes (Recomendados)
- [ ] Design System seguido (15 pontos)
- [ ] Interações são intuitivas (10 pontos)
- [ ] Responsividade implementada (10 pontos)

#### Opcionais (Bônus)
- [ ] Feedback dos stakeholders coletado (5 pontos)
- [ ] Testes de acessibilidade realizados (3 pontos)
- [ ] Documentação de decisões de design (2 pontos)

### Ações por Score

| Score | Ação | Descrição |
|-------|------|-----------|
| < 70 | ❌ Bloqueado | Correções obrigatórias antes de avançar |
| 70-74 | ⚠️ Aprovação Manual | Pode avançar com justificativa |
| ≥ 75 | ✅ Aprovado | Avança automaticamente |

## 🔄 Context Flow

### Inputs (Recebe de)
- **UX Design** → `design-doc.md`
- **Engenharia de Requisitos** → `requisitos.md`
- **Modelagem de Domínio** → `modelo-dominio.md` (opcional)

### Outputs (Entrega para)
- **Desenvolvimento Frontend** → `prototipo-stitch.md` + código exportado
- **Plano de Execução** → Histórias baseadas em fluxos validados
- **Análise de Testes** → Casos de teste baseados em interações

### Estrutura de Dados

**Input Esperado:**
```json
{
  "design_doc": {
    "path": "docs/03-ux/design-doc.md",
    "components": ["Header", "Dashboard", "Footer"],
    "design_system": "Material Design"
  },
  "requirements": {
    "path": "docs/02-requisitos/requisitos.md",
    "ui_requirements": ["RF-001", "RF-005", "RF-012"]
  }
}
```

**Output Gerado:**
```json
{
  "prototype": {
    "path": "docs/04-prototipo/prototipo-stitch.md",
    "code_path": "docs/04-prototipo/exported-code/",
    "components_implemented": ["Header", "Dashboard", "Footer"],
    "score": 82,
    "approved": true
  },
  "next_phase": "Desenvolvimento Frontend"
}
```

## 🛡️ Guardrails e Validações

### Validações de Entrada
1. **Design Doc existe e é legível**
   - Verificar caminho válido
   - Validar formato markdown
   - Confirmar conteúdo mínimo

2. **Componentes identificáveis**
   - Pelo menos 1 componente encontrado
   - Componentes têm descrição clara
   - Prioridades definidas

3. **Design System suportado**
   - Material Design ✅
   - Ant Design ✅
   - Chakra UI ✅
   - Custom (com guidelines) ✅

### Validações de Processo
1. **Etapa 1 (Análise)**
   - Componentes mapeados
   - Fluxos identificados
   - Prioridades definidas

2. **Etapa 2 (Geração)**
   - Prompts gerados
   - Contexto incluído
   - Ordem de implementação clara

3. **Etapa 3 (Prototipagem)**
   - Protótipo criado
   - Código exportado
   - Interações testadas

4. **Etapa 4 (Validação)**
   - Score calculado
   - Feedback coletado
   - Aprovação obtida

### Validações de Saída
1. **Score ≥ 75**
   - Todos os itens essenciais validados
   - Maioria dos itens importantes validados
   - Pelo menos alguns itens opcionais

2. **Artefatos Completos**
   - `prototipo-stitch.md` criado
   - Código exportado disponível
   - Feedback documentado

3. **Próximos Passos Claros**
   - Especialista seguinte identificado
   - Artefatos de entrada preparados
   - Contexto transferido

## 🔒 Segurança e Privacidade

### Dados Sensíveis
- ❌ Não armazenar credenciais do Google Stitch
- ❌ Não compartilhar protótipos publicamente sem aprovação
- ✅ Manter código exportado em repositório privado
- ✅ Documentar decisões de design sem expor dados sensíveis

### Controle de Acesso
- Protótipos devem ser compartilhados apenas com stakeholders autorizados
- Código exportado deve seguir políticas de segurança do projeto
- Feedback deve ser coletado de forma estruturada e rastreável

## 📈 Métricas e Monitoramento

### Métricas de Performance
- **Tempo médio por etapa**
  - Análise: ~15 min
  - Geração: ~20 min
  - Prototipagem: ~30 min
  - Validação: ~20 min
  - **Total:** ~85 min

### Métricas de Qualidade
- **Score médio:** >80
- **Taxa de aprovação:** >90%
- **Iterações médias:** 2-3
- **Redução de retrabalho:** 60%

### Métricas de Adoção
- **Uso por projeto:** Tracking
- **Feedback de usuários:** Coleta contínua
- **Melhoria contínua:** Baseada em métricas

## 🔧 Troubleshooting

### Problema: Score < 75
**Causa:** Itens essenciais não validados  
**Solução:** Revisar checklist e completar itens pendentes

### Problema: Prompts não geram resultados esperados
**Causa:** Contexto insuficiente ou Design System não claro  
**Solução:** Enriquecer prompts com mais detalhes e exemplos

### Problema: Código exportado não funciona
**Causa:** Stitch gerou código com dependências não resolvidas  
**Solução:** Revisar código exportado e ajustar manualmente

## 📚 Referências

- **SKILL.md** - Visão geral rápida do especialista
- **README.md** - Documentação completa do processo
- **resources/templates/** - Templates estruturados
- **resources/examples/** - Exemplos práticos
- **resources/checklists/** - Checklists de validação
- **resources/reference/** - Guias técnicos completos

---

**Versão:** 1.0.0  
**Última Atualização:** 30/01/2026  
**Mantido por:** Maestro MCP Team
