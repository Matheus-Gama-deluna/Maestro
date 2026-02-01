# ⚙️ 03. Engenharia e Qualidade

O Orquestrador MCP impõe práticas de engenharia de software de nível "Expert" para garantir que o código gerado seja robusto, manutenível e escalável.

## Registros de Decisão de Arquitetura (ADRs)

Toda decisão arquitetural significativa é documentada automaticamente. Isso cria um histórico auditável do "porquê" das coisas.

### Estrutura de um ADR
O sistema gera arquivos Markdown em `docs/decisions/` seguindo este modelo:

1.  **Título e Data:** Identificador único (ex: `ADR-001`).
2.  **Contexto:** Qual era o problema? Quais eram as restrições?
3.  **Decisão:** O que escolhemos fazer.
4.  **Alternativas:** O que consideramos e descartamos (e por quê).
5.  **Consequências:** Impactos positivos e negativos (trade-offs).

> **Exemplo:** "Escolha do PostgreSQL sobre MongoDB para o módulo Financeiro devido à necessidade de transações ACID estritas."

## Fitness Functions (Testes de Arquitetura)

Para evitar a degradação arquitetural (o famoso "código espaguete"), o sistema implementa **Fitness Functions**. São testes automatizados que verificam regras estruturais.

Exemplos de regras validadas automaticamente:
- **Direção de Dependência:** A camada de Domínio *nunca* deve depender da Infraestrutura.
- **Isolamento de Módulos:** O módulo de 'Vendas' não pode importar diretamente classes internas de 'Estoque' (deve usar API pública).
- **Ciclos:** Não devem existir dependências circulares entre pacotes.

Ferramentas sugeridas: `ArchUnit` (Java) ou `TsArch` (TypeScript).

## Estratégia de Testes

O orquestrador segue a Pirâmide de Testes tradicional, priorizando velocidade e feedback rápido.

### 1. Testes Unitários (Base)
- **Foco:** Lógica de negócio pura, Classes de Domínio.
- **Ferramenta:** Jest / Vitest.
- **Cobertura:** Alta (>80%).
- **Execução:** A cada alteração de arquivo.

### 2. Testes de Integração (Meio)
- **Foco:** Interação entre componentes (Repository <-> Banco, Service <-> API Externa).
- **Ferramenta:** Testcontainers (para bancos reais em Docker).
- **Execução:** Ao finalizar uma tarefa ou milestone.

### 3. Testes Ponta-a-Ponta (Topo)
- **Foco:** Fluxos críticos do usuário (ex: "Checkout completo").
- **Ferramenta:** Playwright / Cypress.
- **Execução:** Antes do merge/deploy (Pipeline CI/CD).

## Observabilidade

Um sistema robusto precisa ser observável. O orquestrador configura automaticamente os 3 pilares:

1.  **Logs Estruturados:** JSON logs com IDs de correlação (TraceId) para rastrear requisições através de microserviços.
2.  **Métricas:** Instrumentação com Prometheus (apdex, latência, throughput, erros).
3.  **Tracing Distribuído:** OpenTelemetry + Jaeger para visualizar gargalos de performance.

## Gestão de Dívida Técnica

O orquestrador não ignora a dívida técnica; ele a gerencia. Se uma solução rápida ("gambiarra") for necessária para cumprir um prazo, o sistema:
1.  Registra a dívida no backlog.
2.  Define um prazo para pagamento.
3.  Calcula os "juros" (risco acumulado).
