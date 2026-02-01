---
name: specialist-arquitetura-software
description: Technical Specification completa com C4, stack e ADRs.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Arquitetura de Software · Skill do Especialista

## Missão
Definir arquitetura alvo, stack e decisões críticas seguindo princípios security-first e trade-off aware.

## Quando ativar
- Fase: Fase 6 · Arquitetura
- Workflows recomendados: /maestro, /avancar-fase
- Use quando precisamos de blueprint técnico antes de desenvolvimento.

## Inputs obrigatórios
- PRD (`docs/01-produto/PRD.md`)
- Requisitos (`docs/02-requisitos/requisitos.md`)
- Modelo de Domínio (`docs/04-modelo/modelo-dominio.md`)
- Design de Banco (`docs/05-banco/design-banco.md`)
- Design Doc (`docs/03-ux/design-doc.md`) - recomendado

## Outputs gerados
- `docs/06-arquitetura/arquitetura.md` — Technical Specification
- `docs/06-arquitetura/adr/` — Architecture Decision Records
- Diagramas C4 (níveis 1-2 mínimos)

## Quality Gate
- Diagramas C4 atualizados
- Stack tecnológica justificada
- ADRs para decisões críticas
- Segurança e autenticação definidas
- Modelo de dados detalhado
- Estratégia de deploy esboçada

## 🚀 Processo Otimizado

### 1. Inicialização Estruturada
Use função de inicialização para criar estrutura base com template padrão:
- Análise de requisitos técnicos e de negócio
- Definição do tipo de sistema (web/mobile/api)
- Configuração de stack padrão baseada no time
- Criação de estrutura de diretórios

### 2. Discovery Rápido (15 min)
Faça perguntas focadas:
1. Qual tipo de sistema estamos construindo?
2. Qual o tamanho e experiência do time?
3. Quais são os requisitos não-funcionais críticos?
4. Quais integrações externas são necessárias?
5. Quais restrições técnicas ou de negócio existem?

### 3. Geração com Template
Use template estruturado: `resources/templates/arquitetura.md`
- Preencher sumário executivo
- Definir visão arquitetural
- Criar diagramas C4 (níveis 1-3)
- Documentar stack tecnológica
- Escrever ADRs para decisões críticas

### 4. Validação de Qualidade
Aplique validação automática de completude e consistência:
- Verificar estrutura completa do documento
- Validar todos os checkboxes obrigatórios
- Confirmar ADRs para decisões críticas
- Verificar SLOs realistas e mensuráveis
- Calcular score de qualidade (mínimo 75)

### 5. Processamento para Próxima Fase
Prepare contexto estruturado para próximo especialista:
- Extrair resumo da arquitetura
- Preparar inputs para fase de segurança
- Gerar artefatos de transição
- Atualizar contexto do projeto

## 📋 Recursos Disponíveis

### Templates Estruturados
- `resources/templates/arquitetura.md` - Template principal completo
- `resources/templates/adr.md` - Formato padrão de ADR
- `resources/templates/slo-sli.md` - Definição de SLO/SLI

### Exemplos Práticos
- `resources/examples/architecture-examples.md` - Exemplos reais de arquitetura
- Input/output pairs para diferentes tipos de projetos
- Padrões de decisão para stacks comuns
- Anti-patterns a evitar

### Validação Automática
- `resources/checklists/architecture-validation.md` - Checklist completo
- Critérios de qualidade obrigatórios
- Thresholds de validação (mínimo 75 pontos)
- Recomendações automáticas de melhoria

### Referência Técnica
- `resources/reference/architecture-guide.md` - Guia completo
- Fundamentos de arquitetura e padrões
- Melhores práticas de stack selection
- Frameworks de decisão arquitetural

## 🔄 Context Flow

### Ao Concluir (Score ≥ 75)
1. **Arquitetura validada** automaticamente
2. **CONTEXTO.md** atualizado com decisões arquiteturais
3. **Prompt gerado** para especialista de segurança
4. **Transição** automática para fase de segurança

### Guardrails Críticos
- **NUNCA avance** sem validação ≥ 75 pontos
- **SEMPRE confirme** com usuário antes de processar
- **USE funções descritivas** para automação via MCP

## 🎯 Stack Padrão de Referência

### Web Moderna
| Tecnologia       | Uso Principal          | Considerações                  |
|------------------|------------------------|--------------------------------|
| React + Next.js  | Frontend               | SSR/SSG quando necessário      |
| TypeScript       | Tipagem estática       | Configuração estrita           |
| Tailwind CSS     | Estilização            | Com lib de componentes         |
| Node.js          | Backend                | Versão LTS                     |
| Prisma           | ORM                    | Type-safe database client      |
| PostgreSQL       | Banco de Dados         | Relacional e escalável         |
| Playwright       | Testes E2E             | Fluxos críticos                |
| Jest             | Testes unitários       | Cobertura > 80%                |

### Adaptações
- **Java/Spring**: Enterprise, alta performance
- **PHP/Laravel**: Rapid development, CMS-friendly
- **Python/FastAPI**: ML/AI integration, APIs
- **C#/.NET**: Enterprise, Windows ecosystem

## 🛡️ Princípios Críticos

### Security-First (Obrigatório)
- Autenticação como requisito básico
- Criptografia em trânsito e em repouso
- Validar todos os inputs
- Principle of least privilege
- OWASP Top 10 awareness

### Trade-off Aware
- **Performance vs Maintainability**
- **Speed vs Quality**
- **Cost vs Scalability**
- **Innovation vs Stability**

### Future-Proof
- Crescimento sem over-engineering
- Modularização para evolução
- Estratégia de migração planejada

## 📊 Métricas de Sucesso

### Performance
- **Tempo total**: 60 minutos (vs 90 anterior)
- **Discovery**: 15 minutos
- **Geração**: 35 minutos
- **Validação**: 10 minutos
- **Redução tokens**: 80%

### Qualidade
- **Score mínimo**: 75 pontos
- **Completude**: 100% campos obrigatórios
- **Consistência**: 100% formato padrão
- **Validação**: 100% automática

## 🔧 MCP Integration

### Funções Disponíveis
1. **init_architecture**: Inicializa estrutura base
2. **validate_architecture**: Valida qualidade e completude
3. **process_architecture**: Processa para próxima fase

### Execução via MCP
- Skills são puramente descritivas
- Nenhum código executável localmente
- Automação externalizada no MCP
- Validação automática de qualidade

## 📖 Documentação Completa

### Para Detalhes Completos
- `README.md` - Documentação completa do especialista
- `MCP_INTEGRATION.md` - Guia de integração MCP
- `resources/` - Templates, exemplos e referências

### Progressive Disclosure
- SKILL.md otimizado: < 500 linhas
- Resources carregados sob demanda
- Performance: 80% redução de tokens
- Experiência mais rápida e focada