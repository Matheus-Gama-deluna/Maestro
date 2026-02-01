# Exemplos de UX Design - Input/Output Pairs

## 🎯 Exemplo 1: SaaS de Gestão Financeira

### Input do Usuário
```
Preciso de um design para um SaaS de gestão financeira para PMEs.
O PRD destaca 3 personas: CFO, Contador e CEO.
Temos requisitos de dashboard financeiro, fluxo de aprovação e relatórios.
A identidade visual deve ser confiável, moderna e clean.
```

### Output Gerado (Resumo)
```markdown
## Arquitetura de Informação
- Dashboard principal com 4 widgets (Receitas, Despesas, Caixa, Metas)
- Menu lateral com seções de relatórios, fluxo de aprovação e configurações
- Navegação resumida em breadcrumbs + tabs contextuais

## Wireframes
- WF-001: Dashboard → Overview financeiro com filtros rápidos
- WF-002: Fluxo de aprovação → Cards com status e ação rápida
- WF-003: Relatório detalhado → Tabelas com drill-down e exportação

## Design Visual
- Paleta: Azul petróleo (confiança) + tons neutros
- Tipografia: Inter + Space Grotesk
- Componentes: Botões com feedback, cards com tags de status

## Jornadas
1. CFO → Analisa KPIs → Aprova despesas → Gera relatório
2. Contador → Registra lançamentos → Anexa documentos → Atualiza status
3. CEO → Consulta indicadores → Valida metas → Compartilha insights

## Protótipo
- Link Figma: https://figma.com/file/ux-finance-saas
- Microinterações: Hover com context info, loading skeletons
- Acessibilidade: Contraste AA, navegação por teclado

## Validação
- 5 usuários testados (CFO/Contador)
- 92% entendimento na primeira tentativa
- Ajustes aplicados nos filtros e tooltips
```

---

## 🛒 Exemplo 2: App Mobile de Delivery

### Input do Usuário
```
Preciso criar o UX para um app mobile de delivery focado em restaurantes locais.
Teremos personas de Cliente Final, Entregador e Dono do Restaurante.
Requisitos incluem onboarding, catálogo de restaurantes e tracking em tempo real.
```

### Output Gerado (Resumo)
```markdown
## Arquitetura de Informação
- Flow mobile-first com bottom navigation (Home, Busca, Pedidos, Perfil)
- Sistema de cards com fotos grandes e rating dos restaurantes
- Tracking em tempo real com mapa e status do pedido

## Wireframes
- WF-001: Onboarding → 3 telas com benefits + personalização
- WF-002: Catálogo → Carrossel de categorias + filtros inteligentes
- WF-003: Detalhe do pedido → Linha do tempo + status do entregador

## Design Visual
- Paleta quente (laranjas + tons escuros)
- Tipografia circular para headlines + IBM Plex para texto
- Iconografia friendly, layout modular com sombras leves

## Jornadas
1. Cliente → Busca restaurante → Personaliza pedido → Acompanha entrega
2. Entregador → Recebe pedido → Navega com mapa → Conclui entrega
3. Dono → Avalia pedidos → Atualiza cardápio → Recebe feedback

## Protótipo
- Ferramenta: Figma (modo protótipo mobile)
- Interações: Swipe cards, drag para remover itens, pull-to-refresh
- Microcopy: Mensagens humanizadas ("Seu pedido está saindo do forno")

## Validação
- Teste com 6 usuários (Android/iOS)
- Ajustes em filtros de busca e CTA de reordenar
- NPS do fluxo: 62 → 74 após iterações
```

---

## 🏥 Exemplo 3: Plataforma de Telemedicina

### Input do Usuário
```
Preciso desenhar a interface para uma plataforma de telemedicina.
Personas: Paciente, Médico e Atendimento.
Funcionalidades: agendamento, videoconsulta, prontuário digital, prescrições.
Identidade visual precisa transmitir confiança e acolhimento.
```

### Output Gerado (Resumo)
```markdown
## Arquitetura de Informação
- Home com cards de "Próxima consulta" e "Agendar nova"
- Seções de exames, prescrições, histórico e mensagens
- Fluxo de videoconsulta integrado com chat e upload de arquivos

## Wireframes
- WF-001: Agenda → Calendário + cards de consulta
- WF-002: Videoconsulta → Tela dividida (vídeo + anotações)
- WF-003: Prontuário → Tabs por tipo de registro + timeline

## Design Visual
- Paleta em tons de azul + verde suave (confiança e acolhimento)
- Tipografia: Source Sans + Merriweather
- Componentes com cantos arredondados, espaçamento generoso

## Jornadas
1. Paciente → Entra → Agenda consulta → Recebe confirmação → Videoconsulta → Feedback
2. Médico → Consulta agenda → Sala virtual → Anotações → Prescreve medicamentos
3. Atendimento → Garante disponibilidade → Resolve problemas técnicos

## Protótipo
- Figma com flows completos desktop + mobile responsivo
- Integração de estados (esperando médico, conexão instável, consulta encerrada)
- Feedback visual em tempo real durante chamada

## Validação
- Testes moderados com 4 pacientes e 3 médicos
- Ajustes no fluxo de upload de exames
- Score SUS: 84/100
```

---

## 📊 Análise de Padrões

### Framework Aplicado
- **Personas → Jornadas → Wireframes → Design Visual → Protótipo → Validação**
- **Todo artefato carrega match direto com requisitos**
- **Microcopy humanizado** e alinhado ao tom da marca
- **Componentização** segue padrão Atomic Design

### Métricas Utilizadas
- **Tempo total** de jornada (from onboarding to goal)
- **Taxa de conversão** por etapa
- **NPS** pré e pós iteração
- **SUS** para usabilidade percebida

### Quality Gates
- **Cobertura completa** das personas e jornadas
- **WCAG AA** garantida nos componentes críticos
- **Feedback com usuários reais** antes de consolidar
- **Score ≥ 75** na validação automática

---

**Última atualização:** 2026-01-29  
**Framework:** Maestro Skills Modernas  
**Status:** ✅ Produção Ready