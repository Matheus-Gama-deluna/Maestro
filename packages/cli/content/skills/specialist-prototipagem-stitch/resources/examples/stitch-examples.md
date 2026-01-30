# Exemplos Práticos - Prototipagem com Google Stitch

## 📋 Visão Geral

Este documento contém 5 cenários completos de prototipagem com Google Stitch, mostrando input/output pairs reais e processo detalhado para cada tipo de projeto.

---

## 🎯 Cenário 1: Dashboard de Analytics

### Contexto
**Projeto:** Dashboard de métricas de vendas  
**Design System:** Material Design  
**Complexidade:** Média  
**Tempo Estimado:** 85 minutos

### Input

**Design Doc:**
```markdown
# Dashboard de Vendas

## Componentes Principais
1. Header com logo e menu
2. 4 Cards de métricas (Vendas, Clientes, Conversão, Ticket Médio)
3. Gráfico de linha (vendas nos últimos 30 dias)
4. Gráfico de barras (vendas por categoria)
5. Tabela de últimas vendas
6. Filtros de data

## Requisitos
- Responsivo (desktop e tablet)
- Cores: Primary #1976D2, Secondary #FFC107
- Exportar dados para CSV
```

### Processo

#### Etapa 1: Análise (15 min)
**Componentes Mapeados:**
- Header (Navigation)
- 4 Metric Cards (Data Display)
- Line Chart (Data Visualization)
- Bar Chart (Data Visualization)
- Data Table (Data Display)
- Date Filter (Input)
- Export Button (Action)

**Fluxos Principais:**
1. Visualizar métricas gerais
2. Filtrar por período
3. Exportar dados

**Prioridades:**
1. Alta: Metric Cards, Line Chart
2. Média: Bar Chart, Data Table
3. Baixa: Export Button

#### Etapa 2: Geração (20 min)
**Prompts Gerados:**

1. **Header:**
```
Create a Material Design app bar with:
- Logo on the left
- Title "Dashboard de Vendas"
- User menu on the right
- Color: Primary #1976D2
- Typography: Roboto
- Shadow elevation 2
```

2. **Metric Cards:**
```
Create 4 Material Design metric cards with:
- Icon, value, label, trend indicator
- Grid layout: 4 columns on desktop, 2 on tablet
- Shadow elevation 1
- Hover effect: elevation 3
- Colors: Primary #1976D2, Success #4CAF50, Error #F44336
- Typography: Roboto, Value 32px bold, Label 14px
```

3. **Line Chart:**
```
Create a Material Design line chart widget with:
- Title "Vendas - Últimos 30 Dias"
- Interactive line chart
- Tooltip on hover
- Date range filter dropdown (7/30/90 days)
- Export CSV button
- Responsive layout
- Colors: Line #1976D2, Grid #E0E0E0
- Typography: Roboto
```

#### Etapa 3: Prototipagem (30 min)
**Iterações:**
1. Header: 1 iteração (ajuste de espaçamento)
2. Metric Cards: 2 iterações (ajuste de cores e ícones)
3. Line Chart: 3 iterações (ajuste de interatividade e tooltip)
4. Bar Chart: 2 iterações (ajuste de labels)
5. Data Table: 1 iteração (ajuste de paginação)

**Código Exportado:** ✅ HTML/CSS disponível

#### Etapa 4: Validação (20 min)
**Feedback Stakeholders:**
- ✅ Layout aprovado
- ⚠️ Ajustar cores do gráfico de barras (mais contraste)
- ✅ Funcionalidades completas

**Score:** 85/100
- Componentes: 38/40 ✅
- Fluxos: 28/30 ✅
- Design: 17/20 ⚠️ (cores ajustadas)
- Qualidade: 10/10 ✅

### Output

**Protótipo Aprovado:** ✅  
**Tempo Real:** 82 minutos  
**Iterações:** 9 total  
**Código Exportado:** ✅  
**Próximo Passo:** Desenvolvimento Frontend

---

## 🛒 Cenário 2: E-commerce Product Page

### Contexto
**Projeto:** Página de produto para loja online  
**Design System:** Ant Design  
**Complexidade:** Média  
**Tempo Estimado:** 90 minutos

### Input

**Design Doc:**
```markdown
# Página de Produto

## Componentes
1. Breadcrumb navigation
2. Image gallery (1 main + 4 thumbnails)
3. Product details (title, price, rating, description)
4. Variant selector (size, color)
5. Quantity input
6. Add to cart button
7. Tabs (Description, Reviews, Shipping)
8. Related products carousel

## Requisitos
- Mobile-first
- Cores: Primary #1890FF, Success #52C41A
- Integração com carrinho
```

### Processo

#### Etapa 1: Análise (15 min)
**Componentes:** 8 principais  
**Fluxos:** 3 (Visualizar, Selecionar variante, Adicionar ao carrinho)  
**Prioridades:** Alta (Image gallery, Product details, Add to cart)

#### Etapa 2: Geração (25 min)
**Prompts:** 8 prompts gerados (1 por componente)

#### Etapa 3: Prototipagem (35 min)
**Iterações:** 12 total  
**Desafios:** Image gallery interativa (4 iterações)

#### Etapa 4: Validação (15 min)
**Score:** 78/100  
**Aprovado:** ✅ (com pequenos ajustes)

### Output
**Tempo Real:** 88 minutos  
**Código Exportado:** ✅

---

## 📱 Cenário 3: Social Media Feed

### Contexto
**Projeto:** Feed de posts estilo rede social  
**Design System:** Chakra UI  
**Complexidade:** Alta  
**Tempo Estimado:** 95 minutos

### Input

**Design Doc:**
```markdown
# Social Feed

## Componentes
1. Create post input
2. Post cards (avatar, name, content, image, actions)
3. Like/Comment/Share buttons
4. Comment section
5. Infinite scroll

## Requisitos
- Real-time updates
- Cores: Primary #3182CE, Background #FFFFFF
- Skeleton loading
```

### Processo

#### Etapa 1: Análise (18 min)
**Componentes:** 5 principais + 3 secundários  
**Fluxos:** 4 (Criar post, Interagir, Comentar, Scroll)

#### Etapa 2: Geração (22 min)
**Prompts:** 8 prompts (componentes + estados)

#### Etapa 3: Prototipagem (40 min)
**Iterações:** 15 total  
**Desafios:** Infinite scroll simulation, Comment threading

#### Etapa 4: Validação (15 min)
**Score:** 82/100  
**Aprovado:** ✅

### Output
**Tempo Real:** 95 minutos  
**Código Exportado:** ✅

---

## 📝 Cenário 4: Multi-Step Form

### Contexto
**Projeto:** Formulário de cadastro em 3 etapas  
**Design System:** Material Design  
**Complexidade:** Baixa  
**Tempo Estimado:** 70 minutos

### Input

**Design Doc:**
```markdown
# Formulário de Cadastro

## Etapas
1. Dados Pessoais (nome, email, telefone)
2. Endereço (rua, cidade, estado, CEP)
3. Revisão e confirmação

## Requisitos
- Progress indicator
- Validação em tempo real
- Cores: Primary #1976D2, Error #F44336
```

### Processo

#### Etapa 1: Análise (12 min)
**Componentes:** 3 steps + progress indicator + navigation  
**Fluxos:** 1 linear (Step 1 → 2 → 3 → Submit)

#### Etapa 2: Geração (15 min)
**Prompts:** 5 prompts (3 steps + progress + validation)

#### Etapa 3: Prototipagem (28 min)
**Iterações:** 7 total  
**Desafios:** Validation feedback, Step transitions

#### Etapa 4: Validação (15 min)
**Score:** 88/100  
**Aprovado:** ✅

### Output
**Tempo Real:** 68 minutos  
**Código Exportado:** ✅

---

## 📲 Cenário 5: Mobile App Navigation

### Contexto
**Projeto:** Navegação de app mobile  
**Design System:** Custom (iOS-inspired)  
**Complexidade:** Média  
**Tempo Estimado:** 80 minutos

### Input

**Design Doc:**
```markdown
# Mobile Navigation

## Componentes
1. Bottom tab bar (5 tabs)
2. Top navigation bar
3. Drawer menu
4. Screen transitions

## Requisitos
- iOS design patterns
- Cores: Primary #007AFF, Background #F2F2F7
- Smooth animations
```

### Processo

#### Etapa 1: Análise (15 min)
**Componentes:** 4 principais  
**Fluxos:** 3 (Tab navigation, Drawer, Screen transitions)

#### Etapa 2: Geração (18 min)
**Prompts:** 6 prompts (componentes + animations)

#### Etapa 3: Prototipagem (32 min)
**Iterações:** 10 total  
**Desafios:** iOS-style animations, Drawer interactions

#### Etapa 4: Validação (15 min)
**Score:** 80/100  
**Aprovado:** ✅

### Output
**Tempo Real:** 78 minutos  
**Código Exportado:** ✅

---

## 📊 Comparação de Cenários

| Cenário | Complexidade | Tempo | Iterações | Score | Aprovado |
|---------|--------------|-------|-----------|-------|----------|
| Dashboard Analytics | Média | 82 min | 9 | 85/100 | ✅ |
| E-commerce Product | Média | 88 min | 12 | 78/100 | ✅ |
| Social Feed | Alta | 95 min | 15 | 82/100 | ✅ |
| Multi-Step Form | Baixa | 68 min | 7 | 88/100 | ✅ |
| Mobile Navigation | Média | 78 min | 10 | 80/100 | ✅ |

**Média Geral:**
- **Tempo:** 82 minutos
- **Iterações:** 10.6
- **Score:** 82.6/100
- **Taxa de Aprovação:** 100%

---

## 💡 Lições Aprendidas

### O Que Funciona Bem
1. **Prompts Específicos:** Quanto mais detalhado, melhor o resultado
2. **Iteração Incremental:** Começar simples e adicionar complexidade
3. **Design System Claro:** Referências explícitas melhoram consistência
4. **Feedback Visual:** Usar preview do Stitch para ajustes rápidos

### Desafios Comuns
1. **Interatividade Complexa:** Infinite scroll, drag-and-drop
2. **Animações Customizadas:** Requer múltiplas iterações
3. **Estados Múltiplos:** Loading, error, empty states
4. **Responsividade Avançada:** Breakpoints customizados

### Dicas de Otimização
1. **Reutilizar Prompts:** Manter biblioteca de prompts testados
2. **Documentar Iterações:** Anotar o que funcionou
3. **Testar Cedo:** Validar componentes antes de avançar
4. **Coletar Feedback:** Envolver stakeholders desde o início

---

**Versão:** 1.0.0  
**Última Atualização:** 30/01/2026  
**Mantido por:** Maestro Team
