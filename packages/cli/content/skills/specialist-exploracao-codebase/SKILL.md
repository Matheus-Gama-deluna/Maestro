---
name: specialist-exploracao-codebase
description: Mapeamento de codebases legadas e documentação de insights.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Exploração de Codebase · Skill do Especialista

## Missão
Entender rapidamente uma codebase existente e produzir recomendações, criando mapa completo do projeto antes de fazer mudanças.

## Quando ativar
- Fase: Fase 17 · Exploração
- Workflows recomendados: /maestro, /refatorar-codigo
- Use quando precisar em due diligences, auditorias ou repasses de projetos.

## Inputs obrigatórios
- Código fonte existente
- Documentação disponível
- Objetivos de análise
- CONTEXTO.md do projeto
- package.json/requirements.txt/composer.json

## Outputs gerados
- Relatório de exploração completo
- Mapa de dependências e riscos
- Codebase Map estruturado
- Technical Debt Report
- Recomendações priorizadas

## Quality Gate
- Codebase mapeada completamente
- Arquitetura identificada
- Débito técnico quantificado
- Riscos documentados
- Ações recomendadas priorizadas

## Processo de Exploração (3 Fases)

### Fase 1: Estrutura Geral
```bash
# 1. Árvore de diretórios
tree -L 3 -I 'node_modules|vendor|dist|.git'

# 2. Arquivos principais
ls -lh *.{json,yaml,md,config.*}

# 3. Dependências
cat package.json | jq '.dependencies'
cat requirements.txt
cat composer.json | jq '.require'

# 4. Identificar stack
find . -name "*.js" -o -name "*.ts" -o -name "*.php" -o -name "*.py" | head -20
```

**Output:** Entendimento de estrutura de pastas e tech stack.

### Fase 2: Análise de Código
```bash
# Lines of Code por linguagem
cloc .

# Complexidade ciclomática
lizard -l javascript src/
lizard -l python src/
lizard -l php src/

# Code duplication
jscpd src/

# Test coverage
npm run test:coverage
pytest --cov=.
```

**Thresholds de alerta:**
- Complexidade > 10 → Refactor urgente
- Duplicação > 5% → DRY violation
- Test coverage < 70% → Risco alto
- LOC por arquivo > 500 → Refactor necessário

### Fase 3: Dependências e Riscos
```bash
# Dependências desatualizadas
npm outdated
pip list --outdated
composer outdated

# Vulnerabilidades
npm audit
safety check
pip-audit

# Análise de arquitetura
madge --circular src/
dependency-cruiser src/
```

## Checklist de Análise

### Estrutura e Organização
- [ ] Estrutura de pastas mapeada
- [ ] Entry points identificados
- [ ] Arquitetura detectada (MVC, Clean, Monolith, Microservices)
- [ ] Padrões de código documentados
- [ ] Convenções de nomenclatura
- [ ] Separação de responsabilidades clara

### Qualidade de Código
- [ ] Métricas de complexidade analisadas
- [ ] Code duplication identificada
- [ ] Test coverage medido
- [ ] Code smells detectados
- [ ] Performance bottlenecks identificados
- [ ] Dead code removido

### Dependências e Segurança
- [ ] Package manager identificado
- [ ] Dependências desatualizadas listadas
- [ ] Vulnerabilidades conhecidas verificadas
- [ Licenças compatíveis
- [ ] Dependências críticas atualizadas
- [ ] Supply chain security avaliada

### Documentação
- [ ] README.md completo
- [ ] Documentação de arquitetura
- [ ] API docs atualizadas
- [ ] Guia de setup disponível
- [ ] Changelog mantido
- [ ] Contributing guide existente

## Output: Codebase Map Template

```markdown
# Codebase Map: [Nome do Projeto]

## Visão Geral
- **Tipo:** [Monolith/Microservices/Híbrido]
- **Stack Principal:** [Tecnologias principais]
- **Ano de Criação:** [Ano]
- **Equipe Atual:** [Tamanho da equipe]
- **Manutenção:** [Ativa/Parada/Legada]

## Stack Tecnológico
### Frontend
- **Framework:** [React/Vue/Angular/etc]
- **Linguagem:** [JavaScript/TypeScript/etc]
- **Build Tool:** [Webpack/Vite/etc]
- **CSS Framework:** [Tailwind/Bootstrap/etc]
- **State Management:** [Redux/Vuex/etc]

### Backend
- **Framework:** [Laravel/Django/Spring/etc]
- **Linguagem:** [PHP/Python/Java/etc]
- **Banco de Dados:** [MySQL/PostgreSQL/etc]
- **Cache:** [Redis/Memcached/etc]
- **Queue:** [Redis SQS/etc]

### Infraestrutura
- **Cloud:** [AWS/Azure/GCP/On-premise]
- **Containerização:** [Docker/Kubernetes]
- **CI/CD:** [GitHub Actions/Jenkins/etc]
- **Monitoramento:** [Datadog/New Relic/etc]

## Estrutura de Diretórios
```
src/
├── controllers/          # Controllers/Handlers
├── services/            # Business logic
├── models/              # Data models
├── views/               # UI components
├── utils/               # Helper functions
├── tests/               # Test files
├── config/              # Configuration
└── docs/                # Documentation
```

## Entry Points
- **Principal:** [arquivo principal]
- **API:** [entry point da API]
- **Frontend:** [entry point do frontend]
- **CLI:** [scripts de linha de comando]
- **Worker:** [background jobs]

## Padrões Identificados
- **Arquitetural:** [MVC/Clean/Hexagonal/etc]
- **Design Patterns:** [Repository/Service/Factory/etc]
- **Code Patterns:** [Singleton/Observer/etc]
- **Frontend:** [Custom Hooks/Context/etc]
- **Backend:** [Repository/Service/Controller/etc]

## Métricas de Qualidade
- **Total LOC:** [número total de linhas]
- **Por Linguagem:**
  - [Linguagem 1]: [número de linhas]
  - [Linguagem 2]: [número de linhas]
  - [Linguagem 3]: [número de linhas]
- **Complexidade Média:** [valor médio]
- **Test Coverage:** [percentual]
- **Code Duplication:** [percentual]

## Débito Técnico
### 🔴 Críticos (Ação Imediata)
- [ ] [Descrição do débito crítico]
- [ ] [Localização no código]
- [ ] [Impacto no negócio]

### 🟡 Médios (Planejar)
- [ ] [Descrição do débito médio]
- [ ] [Localização no código]
- [ ] [Timeline para correção]

### 🟢 Baixos (Monitorar)
- [ ] [Descrição do débito baixo]
- [ ] [Localização no código]

## Riscos Identificados
### 🔴 Críticos
- **Segurança:** [descrição do risco]
- **Performance:** [descrição do risco]
- **Manutenibilidade:** [descrição do risco]
- **Escalabilidade:** [descrição do risco]

### 🟡 Médios
- **Tecnologia:** [descrição do risco]
- **Time-to-Market:** [descrição do risco]
- **Equipe:** [descrição do risco]

### 🟢 Baixos
- **Compliance:** [descrição do risco]
- **Documentação:** [descrição do risco]

## Recomendações Priorizadas

### 1. Imediato (1-2 semanas)
- [ ] [Ação 1 crítica]
- [ ] [Ação 2 crítica]
- [ ] [Ação 3 crítica]

### 2. Curto Prazo (1 mês)
- [ ] [Ação 1 média]
- [ ] [Ação 2 média]
- [ ] [Ação 3 média]

### 3. Médio Prazo (2-3 meses)
- [ ] [Ação 1 baixa]
- [ ] [Ação 2 baixa]
- [ ] [Ação 3 baixa]

## Próximos Passos
1. **Priorizar** ações críticas
2. **Planejar** refatoração em fases
3. **Alocar** recursos adequados
4. **Monitorar** progresso
5. **Validar** melhorias

## Guardrails Críticos

### ❌ NUNCA Faça
- **NUNCA** faça mudanças sem entender contexto
- **NUNCA** ignore métricas de qualidade
- **NUNCA** pule análise de dependências
- **NUNCA** refatore sem testes

### ✅ SEMPRE Faça
- **SEMPRE** mapeie antes de modificar
- **SEMPRE** documente descobertas
- **SEMPRE** meça impacto das mudanças
- **SEMPRE** envolva equipe nas decisões

## Ferramentas Recomendadas

### Análise de Código
```bash
# Métricas básicas
cloc .                    # Lines of code
lizard -l src/             # Complexidade
jscpd src/                  # Duplicação
sonarcloud --sonarcloud src/  # Bugs de segurança

# Visualização
madge --circular src/        # Dependências circulares
dependency-cruiser src/      # Grafo de dependências
```

### Dependências
```bash
# Node.js
npm outdated                # Dependências desatualizadas
npm audit                  # Vulnerabilidades
npm ls                     # Árvore de dependências

# Python
pip list --outdated          # Dependências desatualizadas
pip-audit                  # Vulnerabilidades
pip freeze                 # Congela dependências

# PHP
composer outdated            # Dependências desatualizadas
composer validate            # Validação de dependências
```

### Testes
```bash
# JavaScript
npm test                    # Rodar todos os testes
npm run test:coverage        # Cobertura de código

# Python
pytest                     # Rodar testes
pytest --cov=.           # Cobertura de código

# PHP
php artisan test             # Rodar testes
phpunit --coverage-html     # Cobertura de código
```

## Context Flow

### Artefatos Obrigatórios para Iniciar
Cole no início:
1. Código fonte completo
2. Documentação disponível
3. Objetivos da análise
4. CONTEXTO.md com contexto
5. Dependências listadas

### Prompt de Continuação
```
Atue como Arqueito de Código Especialista.

Contexto do projeto:
[COLE docs/CONTEXTO.md]

Código fonte:
[COLE CÓDIGO FONTE]

Objetivos da análise:
[COLE OBJETIVOS]

Preciso mapear esta codebase e identificar riscos e oportunidades.
```

### Ao Concluir Esta Fase
1. **Mapeie** estrutura completa
2. **Analise** qualidade e padrões
3. **Identifique** riscos e débitos
4. **Documente** descobertas
5. **Priorize** ações
6. **Apresente** recomendações

## Templates Prontos

### Technical Debt Report
```markdown
# Technical Debt Report

## Resumo Executivo
- **Débito Total:** [valor estimado em dias-homem]
- **Risco Crítico:** [descrição]
- **Impacto no Negócio:** [descrição]
- **Timeline para Correção:** [timeline]

## Débito por Categoria

### 🔴 Críticos (Ação Imediata)
1. **[Débito 1]**
   - **Local:** [arquivo:linha]
   - **Descrição:** [descrição detalhada]
   - **Impacto:** [impacto]
   - **Estimativa:** [dias-homem]
   - **Prioridade:** Alta

### 🟡 Médios (Planejar)
1. **[Débito 2]**
   - **Local:** [arquivo:linha]
   - **Descrição:** [descrição detalhada]
   - **Impacto:** [impacto]
   - **Estimativa:** [dias-homem]
   - **Prioridade:** Média

## Plano de Ação
### Fase 1 (Semanas 1-2)
- [ ] Corrigir débitos críticos
- [ ] Atualizar dependências de segurança
- [ ] Aumentar test coverage

### Fase 2 (Semanas 3-4)
- [ ] Refatorar arquitetura
- [ ] Implementar padrões de código
- [ ] Melhorar documentação

### Fase 3 (Semanas 5-6)
- [ ] Otimizar performance
- [] Reduzir complexidade
- [] Implementar monitoramento
```

## Skills complementares
- `clean-code`
- `systematic-debugging`
- `code-review-checklist`
- `architecture-patterns`
- `performance-profiling`

## Referências essenciais
- **Especialista original:** `content/specialists/Especialista em Exploração de Codebase.md`
- **Artefatos alvo:**
  - Relatório de exploração completo
  - Codebase Map estruturado
  - Technical Debt Report
  - Mapa de dependências e riscos
  - Recomendações priorizadas