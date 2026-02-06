# 🚀 04. Guia de Implementação

Este guia detalha o roadmap para construir e evoluir o sistema gerenciado pelo Orquestrador MCP.

## Fases do Projeto

O Orquestrador divide o ciclo de vida do desenvolvimento em 5 fases estratégicas:

### Fase A: Análise e Descoberta (`analyze_project`)
- **Objetivo:** Entender o terreno.
- **Ações:**
    - Scan completo de diretórios e arquivos.
    - Detecção de frameworks (NestJS, React, etc.).
    - Identificação de "Bounded Contexts" existentes.
    - Análise de cobertura de testes e qualidade.

### Fase B: Planejamento Arquitetural (`design_architecture`)
- **Objetivo:** Definir o caminho antes de caminhar.
- **Ações:**
    - Definição do estilo arquitetural (Monólito Modular vs Microservices).
    - Escolha de tecnologias (PostgreSQL vs Mongo, RabbitMQ vs Kafka).
    - Criação do roadmap de implementação (Sprints e Milestones).

### Fase C: Implementação Controlada (`execute_plan`)
- **Objetivo:** Escrever código que funciona.
- **Ações:**
    - Criação de arquivos baseados em templates (Scaffolding).
    - TDD (Test Driven Development): Cria testes -> Falha -> Implementa -> Passa.
    - Implementação de camadas: Domínio -> Infra -> Aplicação -> Apresentação.

### Fase D: Validação e Qualidade (`validate_implementation`)
- **Objetivo:** Garantir que nada quebre.
- **Ações:**
    - Testes E2E (Ponta-a-Ponta).
    - Testes de Carga (k6 / JMeter).
    - Scan de segurança (dependências vulneráveis).

### Fase E: Deploy e Operação (`deploy_system`)
- **Objetivo:** Levar valor ao usuário.
- **Ações:**
    - Build de containers Docker.
    - Provisionamento de infraestrutura (Terraform).
    - Migrations de banco de dados.
    - Monitoramento de saúde (Health Checks).

---

## Roadmap de Sprints (Exemplo: E-Commerce)

Um exemplo prático de como o Orquestrador quebraria a implementação de um sistema de E-commerce.

### Milestone 1: Fundação (Semanas 1-2)
- [x] Configuração do Monorepo (Nx ou Turborepo).
- [x] Setup do CI/CD (GitHub Actions).
- [x] Infraestrutura base (Docker Compose com Postgres/Redis).
- [x] Configuração de Linters e Formatters estritos.

### Milestone 2: Core Domain - Catálogo e Carrinho (Semanas 3-6)
- [ ] **Módulo Catálogo**: Listagem de produtos, busca otimizada (CQRS).
- [ ] **Módulo Carrinho**: Gestão de sessão, cálculo de totais.
- [ ] **Testes de Contrato**: Garantir que o Carrinho consome o Catálogo corretamente.

### Milestone 3: Transações e Checkout (Semanas 7-10)
- [ ] **Módulo Pedidos (Orders)**: Máquina de estado de pedidos.
- [ ] **Módulo Pagamentos**: Integração com Gateway (Stripe/Pagar.me) + Circuit Breaker.
- [ ] **Módulo Estoque**: Controle de concorrência e reservas.

### Milestone 4: Produção e Escala (Semanas 11-12)
- [ ] Dashboards de Observabilidade (Grafana).
- [ ] Testes de Stress e ajuste de Auto-Scaling.
- [ ] Documentação final de API (Swagger/OpenAPI).

---

## Exemplo Detalhado: Implementando Módulo de Cupons

Quando você pede: *"Preciso criar um sistema de cupons"*, o Orquestrador executa:

1.  **Entendimento:** Analisa onde "Cupons" se encaixa. Decide criar um novo módulo `coupons` ou integrar ao `cart`. (Decisão: Novo Módulo).
2.  **Planejamento:**
    - Tarefa 1: Criar Entidade `Coupon` (Domínio).
    - Tarefa 2: Criar Repositório `CouponRepository` (Infra).
    - Tarefa 3: Criar UseCase `ApplyCoupon` (Aplicação).
    - Tarefa 4: Criar Endpoint `POST /coupons/apply` (Apresentação).
3.  **Execução (Faseada):**
    - Cria `coupon.entity.ts`.
    - Cria `coupon.entity.spec.ts` (Testes falhando).
    - Implementa lógica de validação (data, valor mínimo).
    - Roda testes -> Sucesso.
4.  **Integração:** Atualiza o módulo `Cart` para chamar o serviço de cupons.
