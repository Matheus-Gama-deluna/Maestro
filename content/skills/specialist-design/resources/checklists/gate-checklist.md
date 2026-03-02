# Gate Checklist — Design

> **Score mínimo para aprovação:** 70/100  
> **Itens críticos:** Devem TODOS estar ✅ para aprovar

## Itens Críticos

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 1 | **Jornada do usuário principal mapeada** | 15 | Etapas, ações, telas e emoções do fluxo principal completo |
| 2 | **Wireframes cobrem telas do MVP** | 20 | Cada tela com layout, componentes e interações descritas |
| 3 | **Design system definido** | 15 | Cores (primary, secondary, error), tipografia (3+ tamanhos), componentes base (5+) |

## Itens Importantes

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 4 | **Navegação e mapa de telas** | 10 | Hierarquia de URLs/telas, padrão de navegação por dispositivo |
| 5 | **Estados de UI documentados** | 10 | Loading, empty, error e success para fluxo principal |
| 6 | **Acessibilidade WCAG 2.1 AA** | 10 | Checklist com contraste, labels, keyboard nav, focus visible |
| 7 | **Responsividade mobile-first** | 10 | Breakpoints definidos, adaptação por dispositivo |

## Itens Desejáveis

| # | Item | Peso | Critério Pass |
|---|------|------|---------------|
| 8 | **Personas com cenários de UI** | 5 | Cada persona com cenário específico de interação |
| 9 | **Referências visuais citadas** | 3 | Apps/sites de referência mencionados |
| 10 | **Tom visual definido** | 2 | Personalidade e sensação do produto |

## Scoring

- **≥ 70:** Aprovado automaticamente
- **50-69:** Aprovação manual — wireframes incompletos ou design system parcial
- **< 50:** Bloqueado — wireframes ausentes ou sem design system

## Instruções de Correção

| Item Faltando | Como Corrigir |
|---------------|---------------|
| Jornada incompleta | Mapear etapa a etapa: entrada → orientação → ação → feedback → retorno |
| Wireframes faltando | Descrever cada tela: URL, layout ASCII, componentes, interações |
| Sem design system | Definir: 6+ cores com tokens, 4+ tamanhos de tipografia, 5+ componentes base |
| Sem estados de UI | Para cada fluxo: loading (skeleton), empty (ilustração + CTA), error (retry) |
| Sem acessibilidade | Aplicar checklist WCAG: contraste, labels, keyboard, focus, alt text |
