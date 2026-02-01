---
name: specialist-documentacao-tecnica
description: Documentação técnica, API docs e guias de usuário consistentes com progressive disclosure.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# 📚 Documentação Técnica · Skill do Especialista

## 🎯 Missão
Produzir documentação técnica atualizada para desenvolvedores e usuários, transformando código, decisões arquiteturais e processos em documentação útil e mantida.

## ⚡ Quando Ativar
- **Fase:** Fase 14 · Documentação Técnica
- **Workflows:** /maestro, /deploy, /release
- **Trigger:** Finalizar funcionalidades ou preparar handoff

## 📥 Inputs Obrigatórios
- Artefatos técnicos atualizados
- Histórico de decisões (ADRs)
- Guidelines de comunicação
- Código fonte com comentários
- CONTEXTO.md do projeto

## 📤 Outputs Gerados
- Documentação técnica consolidada
- API docs e user guides
- README.md completo
- ADRs documentadas
- Diagramas e exemplos

## ✅ Quality Gate
Score ≥ 75 pontos para avanço automático:
- README.md atualizado com getting started (20 pts)
- API docs sincronizadas com código (20 pts)
- ADRs para decisões importantes (15 pts)
- Guia de usuário publicado (15 pts)
- Documentação versionada no Git (5 pts)

## 🏗️ Estratégia de Documentação (3 Tiers)

### Tier 1: Mínimo Viável (Todo Projeto)
- README.md com getting started
- .env.example com variáveis obrigatórias
- OpenAPI spec (se tiver API)
- Scripts básicos (dev, build, test)

### Tier 2: Projetos Médios/Complexos
- Architecture docs (C4 diagrams)
- ADRs para decisões importantes
- Contributing guide
- Troubleshooting guide
- Changelog (CHANGELOG.md)

### Tier 3: Open Source / Produtos
- Comprehensive guides
- Tutorials interativos
- Video walkthroughs
- FAQ
- Roadmap público

## 🛠️ Ferramentas Recomendadas

### Auto-Geração
- **Swagger/OpenAPI:** Gera API docs automaticamente
- **JSDoc/TypeDoc:** Gera docs de código TypeScript
- **Mermaid/C4-PlantUML:** Diagramas arquiteturais
- **Storybook:** Documentação de componentes UI

### Publicação
- **GitHub Pages:** Hospedagem automática
- **Vercel/Netlify:** Deploy automático
- **ReadTheDocs:** Documentação profissional

## 🔄 Context Flow

### Inputs de Especialistas Anteriores
- **Contrato API:** OpenAPI specs e exemplos
- **Desenvolvimento Backend:** Código documentado
- **Desenvolvimento Frontend:** Componentes documentados
- **DevOps:** Scripts de deploy e configuração

### Outputs para Próxima Fase
- **Documentação Completa:** Para handoff ao usuário
- **Guia de Deploy:** Para operações
- **API Documentation:** Para integrações

## 📋 Processo Otimizado

### 1. Inicialização Estruturada
Use função MCP para criar estrutura base:
```
init_documentation_structure({
  project_type: "web|api|mobile|library",
  tier: "1|2|3",
  audience: "developers|users|both"
})
```

### 2. Discovery Rápido (15 min)
Perguntas focadas:
1. Qual tipo de projeto? (web, api, mobile, library)
2. Qual tier de documentação necessário? (1, 2, 3)
3. Qual público-alvo principal? (developers, users, both)
4. Quais ferramentas de auto-geração disponíveis?

### 3. Geração com Templates
Use templates estruturados em `resources/templates/`:
- `guia-tecnico.md` para documentação completa
- `api-docs.md` para APIs
- `readme-template.md` para READMEs

### 4. Validação de Qualidade
Aplique validação automática via MCP:
```
validate_documentation_quality({
  completeness: 100,
  accuracy: 95,
  accessibility: 90,
  freshness: 100
})
```

### 5. Processamento para Publicação
Prepare para publicação automática:
```
process_documentation_for_publishing({
  platform: "github-pages|vercel|readthedocs",
  auto_sync: true,
  versioning: "semantic"
})
```

## 🚀 Guardrails Críticos

### ❌ NUNCA Faça
- Use Google Docs para documentação técnica
- Ignore atualizações de breaking changes
- Publique sem revisão técnica
- Documente features não implementadas

### ✅ SEMPRE Faça
- Inclua exemplos práticos
- Documente breaking changes
- Mantenha README atualizado
- Versione junto com código

## 📊 Recursos Adicionais

### Templates Disponíveis
- `resources/templates/guia-tecnico.md` - Documentação completa
- `resources/templates/api-docs.md` - Documentação de API
- `resources/templates/readme-template.md` - README padrão

### Exemplos Práticos
- `resources/examples/documentation-examples.md` - Input/output pairs
- `resources/examples/api-examples.md` - Exemplos de API docs

### Validação Automatizada
- `resources/checklists/documentation-validation.md` - Checklist completo
- Score mínimo: 75 pontos para avanço

### Guias Técnicos
- `resources/reference/documentation-guide.md` - Guia completo
- `resources/reference/writing-guidelines.md` - Melhores práticas

## 🔧 MCP Integration

### Funções MCP Disponíveis
1. **init_documentation_structure()** - Cria estrutura base
2. **validate_documentation_quality()** - Valida qualidade
3. **process_documentation_for_publishing()** - Prepara publicação
4. **sync_api_with_code()** - Sincroniza API com código
5. **generate_adr_template()** - Gera ADRs

### Execução via MCP
Todas as funções são executadas externamente via MCP. A skill fornece apenas:
- Descrição dos processos
- Templates estruturados
- Critérios de validação
- Exemplos práticos

## 📈 Métricas de Sucesso

### Performance
- Tempo total: < 45 minutos (vs 90 anterior)
- Descoberta: 15 minutos
- Geração: 25 minutos
- Validação: 5 minutos

### Qualidade
- Score mínimo: 75 pontos
- Completude: 100% campos obrigatórios
- Consistência: 100% formato padrão
- Validação: 100% automática

## 🎯 Ao Concluir (Score ≥ 75)
1. **Documentação validada** automaticamente
2. **README.md atualizado** com getting started
3. **API docs sincronizadas** com código
4. **ADRs criadas** para decisões importantes
5. **Publicação automática** configurada
6. **CONTEXTO.md atualizado** com status da documentação