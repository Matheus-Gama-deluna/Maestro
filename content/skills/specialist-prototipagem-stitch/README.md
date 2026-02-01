# Especialista: Prototipagem com Google Stitch

## 📋 Visão Geral

Este especialista auxilia na criação rápida de protótipos interativos usando Google Stitch, transformando Design Docs e requisitos em interfaces funcionais que podem ser testadas e iteradas com feedback contínuo do usuário.

### Informações Básicas

- **Categoria:** Complementar
- **Complexidade:** Média
- **Tempo Estimado:** 85 minutos
- **Score Mínimo:** 75 pontos
- **Versão:** 1.0.0

### Tags
`prototipagem` `stitch` `ui` `ux` `design` `feedback` `human-in-the-loop` `prototyping`

### Dependências
- Design Doc (do especialista UX Design)
- Requisitos de UI (do especialista Engenharia de Requisitos)
- Design System (opcional, mas recomendado)

## 🎯 Quando Usar

### ✅ Use Este Especialista Quando:
- Após concluir o Design Doc e precisar validar conceitos visuais
- Stakeholders precisam visualizar a interface antes do desenvolvimento
- É necessário testar fluxos de usuário e interações rapidamente
- Precisa coletar feedback visual antes de codificar
- Quer reduzir retrabalho no desenvolvimento frontend
- Projeto possui interface visual complexa que beneficia de validação prévia

### ❌ Não Use Quando:
- Projeto não possui interface visual
- Design Doc ainda não foi aprovado
- Protótipo de alta fidelidade não é necessário
- Projeto é apenas backend/API
- Tempo é extremamente limitado (use wireframes simples)

## 📋 Processo de 4 Etapas

### Etapa 1: Análise (15 min)

**Objetivo:** Compreender requisitos e mapear componentes

**Ações:**
1. Revisar Design Doc completo
2. Identificar todos os componentes de UI necessários
3. Mapear fluxos de interação principais
4. Definir prioridades de prototipagem
5. Listar integrações com Design System (se existir)

**Perguntas-Chave:**
- Quais são os componentes principais da interface?
- Quais fluxos de usuário são críticos?
- Existe um Design System a seguir?
- Quais interações precisam ser validadas?

**Entregável:** Lista de componentes e fluxos mapeados

**Função MCP:** `initialize_stitch_prototype`

---

### Etapa 2: Geração (20 min)

**Objetivo:** Criar prompts otimizados para Stitch

**Ações:**
1. Gerar prompts estruturados usando template
2. Incluir contexto completo do projeto
3. Referenciar Design System (se existir)
4. Preparar instruções claras para Stitch
5. Organizar prompts por componente/tela

**Estrutura do Prompt:**
```
Contexto: [Descrição do projeto]
Design System: [Material/Ant/Chakra/Custom]
Componente: [Nome do componente]
Funcionalidades: [Lista de funcionalidades]
Interações: [Descrição de interações]
Estilo: [Cores, tipografia, espaçamento]
```

**Entregável:** Prompts otimizados prontos para uso

**Template:** Ver `resources/templates/prompt-stitch.md`

**Função MCP:** `generate_stitch_prompts`

---

### Etapa 3: Prototipagem (30 min)

**Objetivo:** Gerar protótipo interativo no Stitch

**Ações:**
1. Acessar Google Stitch (stitch.withgoogle.com)
2. Inserir prompts gerados
3. Iterar até obter componentes funcionais
4. Configurar interações e navegação
5. Testar fluxos principais
6. Exportar código HTML/CSS

**Dicas de Iteração:**
- Comece com componentes simples
- Valide cada componente antes de avançar
- Use feedback visual do Stitch para ajustes
- Teste interações em tempo real
- Documente decisões de design tomadas

**Entregável:** Protótipo funcional + código exportado

**Ferramentas:**
- Google Stitch (stitch.withgoogle.com)
- Browser para testes
- Ferramenta de captura de tela

---

### Etapa 4: Validação (20 min)

**Objetivo:** Coletar feedback e refinar

**Ações:**
1. Compartilhar protótipo com stakeholders
2. Coletar feedback estruturado
3. Documentar sugestões de melhoria
4. Iterar conforme necessário
5. Obter aprovação final
6. Validar score de qualidade (≥75)

**Checklist de Validação:**
- [ ] Todos os componentes principais estão presentes
- [ ] Fluxos de usuário funcionam corretamente
- [ ] Design System foi seguido (se aplicável)
- [ ] Interações são intuitivas
- [ ] Feedback dos stakeholders foi coletado
- [ ] Score de qualidade ≥ 75 pontos

**Entregável:** Protótipo aprovado + feedback documentado

**Template:** Ver `resources/templates/prototipo-stitch.md`

**Função MCP:** `validate_prototype_quality`

## 🔧 Funções MCP Disponíveis

### 1. initialize_stitch_prototype

**Descrição:** Inicializa estrutura do protótipo baseado no Design Doc.

**Quando usar:** Início da Etapa 1 (Análise)

**Parâmetros:**
- `design_doc_path`: Caminho para o Design Doc
- `requirements_path`: Caminho para requisitos de UI
- `design_system`: Nome do Design System (opcional)

**Saída:**
- Estrutura de componentes mapeados
- Lista de fluxos principais
- Próximos passos sugeridos

**Detalhes:** Ver `MCP_INTEGRATION.md`

---

### 2. generate_stitch_prompts

**Descrição:** Gera prompts otimizados para Google Stitch.

**Quando usar:** Durante Etapa 2 (Geração)

**Parâmetros:**
- `components`: Lista de componentes a prototipar
- `design_system`: Design System a seguir
- `context`: Contexto do projeto

**Saída:**
- Lista de prompts prontos para uso
- Ordem sugerida de implementação
- Dicas de otimização

**Detalhes:** Ver `MCP_INTEGRATION.md`

---

### 3. validate_prototype_quality

**Descrição:** Valida qualidade do protótipo contra checklist.

**Quando usar:** Ao final da Etapa 4 (Validação)

**Parâmetros:**
- `prototype_path`: Caminho para arquivos do protótipo
- `checklist_path`: Caminho para checklist de validação

**Saída:**
- Score de qualidade (0-100)
- Itens validados
- Itens pendentes
- Recomendações de melhoria

**Threshold:** Score ≥ 75 para aprovação

**Detalhes:** Ver `MCP_INTEGRATION.md`

## 📚 Recursos Disponíveis

### Templates
- **`resources/templates/prototipo-stitch.md`** - Estrutura do protótipo
- **`resources/templates/prompt-stitch.md`** - Prompts otimizados

### Exemplos Práticos
- **`resources/examples/stitch-examples.md`** - 5 cenários completos
  - Dashboard de Analytics
  - E-commerce Product Page
  - Social Media Feed
  - Multi-Step Form
  - Mobile App Navigation

### Checklists
- **`resources/checklists/stitch-validation.md`** - Sistema de pontuação (100 pontos)
  - Critérios por etapa
  - Score mínimo: 75 pontos

### Guias de Referência
- **`resources/reference/stitch-guide.md`** - Guia completo
  - Introdução ao Google Stitch
  - Técnicas de Prompt Engineering
  - Design System Integration
  - Human-in-the-Loop Best Practices
  - Anti-Patterns e Troubleshooting

## 💡 Exemplo Rápido

**Cenário:** Dashboard de Analytics

**Input:**
```
Design Doc: Dashboard com 4 widgets principais
Requisitos: Gráficos interativos, filtros por data, export CSV
Design System: Material Design
```

**Processo:**
1. **Análise (15 min):** Identificar 4 widgets + barra de filtros + botão export
2. **Geração (20 min):** Criar prompt com contexto Material Design
3. **Prototipagem (30 min):** Gerar no Stitch, iterar componentes
4. **Validação (20 min):** Coletar feedback, ajustar cores/layout

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
- **Score Mínimo:** 75 pontos

## ✅ Próximos Passos

Após aprovação do protótipo:

1. Compartilhar código exportado com equipe de desenvolvimento
2. Atualizar Design Doc com decisões visuais finais
3. Criar histórias de usuário baseadas nos fluxos validados
4. Iniciar desenvolvimento frontend com referência ao protótipo
5. Manter protótipo como documentação viva do projeto

## 🔗 Integração com Outros Especialistas

### Recebe de:
- **UX Design** → Design Doc completo
- **Engenharia de Requisitos** → Requisitos de UI
- **Modelagem de Domínio** → Entidades e relacionamentos (opcional)

### Entrega para:
- **Desenvolvimento Frontend** → Protótipo aprovado + código exportado
- **Plano de Execução** → Histórias baseadas em fluxos validados
- **Análise de Testes** → Casos de teste baseados em interações

## 🚀 Começando

1. **Leia o SKILL.md** para visão geral rápida
2. **Revise exemplos** em `resources/examples/stitch-examples.md`
3. **Use templates** em `resources/templates/`
4. **Consulte guia** em `resources/reference/stitch-guide.md` para dúvidas
5. **Valide qualidade** com `resources/checklists/stitch-validation.md`

## 📞 Suporte

Para dúvidas ou problemas:
- Consulte `resources/reference/stitch-guide.md` seção Troubleshooting
- Revise exemplos práticos em `resources/examples/`
- Verifique MCP_INTEGRATION.md para detalhes técnicos

---

**Versão:** 1.0.0  
**Última Atualização:** 30/01/2026  
**Mantido por:** Maestro Team
