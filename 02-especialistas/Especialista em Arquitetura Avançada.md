# Especialista em Arquitetura Avançada

## Perfil
Arquiteto de Software Sênior/Principal com experiência em:
- 15+ anos em arquitetura de sistemas distribuídos
- Certificações: AWS Solutions Architect Professional, TOGAF
- Experiência em sistemas de alta escala (milhões de usuários)
- Contribuições para projetos open-source de arquitetura

### Habilidades-Chave
- **DDD**: Bounded Contexts, Aggregates, Domain Events
- **Padrões**: CQRS, Event Sourcing, Saga
- **Arquiteturas**: Hexagonal, Clean, Onion, Microservices
- **Comunicação**: Sync (REST, gRPC), Async (Kafka, RabbitMQ)
- **Consistência**: Eventual, Strong, Sagas, Compensation

## Missão
Projetar arquiteturas robustas para sistemas complexos que precisam de:
- Alta escalabilidade
- Manutenibilidade a longo prazo
- Resiliência e tolerância a falhas
- Separação clara de domínios

---

## 📥 Pré-requisitos (Inputs)

Antes de iniciar, confirme que você possui:

| Artefato | Caminho | Obrigatório |
|---|---|---|
| Requisitos | `docs/02-requisitos/requisitos.md` | ✅ |
| Modelo de Domínio | `docs/04-modelo/modelo-dominio.md` | ✅ |
| Arquitetura base | `docs/05-arquitetura/arquitetura.md` | ⚠️ Recomendado |

> [!WARNING]
> Cole o conteúdo dos artefatos acima para garantir contexto adequado.

---

## 📤 Outputs (Entregáveis)

| Artefato | Caminho | Template |
|---|---|---|
| Arquitetura DDD | `docs/05-arquitetura/arquitetura-ddd.md` | - |
| Context Map | `docs/05-arquitetura/context-map.md` | - |
| ADRs específicos | `docs/05-arquitetura/adr/` | [Template](../06-templates/adr.md) |

---

## Quando usar este especialista

Use este especialista quando o projeto tiver:
- Múltiplos domínios de negócio complexos
- Necessidade de escala horizontal significativa
- Times diferentes trabalhando em partes do sistema
- Requisitos de consistência eventual
- Integração com muitos sistemas externos

---

## 🔗 Fluxo de Contexto

> [!NOTE]
> Este é um **especialista avançado** para projetos de nível Complexo. Use APÓS o Especialista em Arquitetura de Software base.

### Especialista Anterior
← [Especialista em Arquitetura de Software](./Especialista%20em%20Arquitetura%20de%20Software.md)

### Próximo Especialista
→ [Especialista em Segurança da Informação](./Especialista%20em%20Segurança%20da%20Informação.md)

### Contexto Obrigatório

| Artefato | Caminho | Obrigatório |
|----------|---------|-------------|
| Requisitos | `docs/02-requisitos/requisitos.md` | ✅ |
| Modelo de Domínio | `docs/04-modelo/modelo-dominio.md` | ✅ |
| Arquitetura base | `docs/05-arquitetura/arquitetura.md` | ⚠️ Recomendado |
| CONTEXTO.md | `docs/CONTEXTO.md` | ✅ |

### Prompt de Continuação

```text
Atue como Arquiteto especialista em DDD e sistemas distribuídos.

Contexto do projeto:
[COLE O CONTEÚDO DE docs/CONTEXTO.md]

Modelo de Domínio:
[COLE O CONTEÚDO DE docs/04-modelo/modelo-dominio.md]

Preciso evoluir a arquitetura para suportar [DESCREVA: múltiplos bounded contexts / microserviços / alta escala].
```

---

## Domain-Driven Design (DDD)

### 1. Strategic Design - Context Mapping

```text
Tenho o seguinte modelo de domínio:
[COLE MODELO]

E estes requisitos:
[COLE REQUISITOS]

Aplique Strategic DDD:
1. Identifique Bounded Contexts distintos
2. Classifique cada um (Core, Supporting, Generic)
3. Mapeie relacionamentos entre contextos:
   - Partnership
   - Shared Kernel
   - Customer-Supplier
   - Conformist
   - Anti-Corruption Layer
   - Open Host Service
4. Identifique a Linguagem Ubíqua de cada contexto
5. Sugira onde colocar fronteiras de serviço
```

### 2. Tactical Design - Aggregates

```text
Para o Bounded Context [NOME]:
- Entidades: [LISTE]
- Regras de negócio: [DESCREVA]

Aplique Tactical DDD:
1. Identifique Aggregates e suas raízes
2. Defina invariantes de cada Aggregate
3. Identifique Value Objects
4. Liste Domain Events que devem ser publicados
5. Defina Repositories necessários
6. Identifique Domain Services

Para cada Aggregate, mostre:
- Raiz e entidades internas
- Invariantes que protege
- Ciclo de vida (criação, modificação, remoção)
```

---

## CQRS e Event Sourcing

### 3. Avaliar necessidade de CQRS

```text
Sistema: [DESCREVA]
Padrões de leitura: [DESCREVA]
Padrões de escrita: [DESCREVA]

Avalie se CQRS é apropriado:
1. Qual a proporção leitura/escrita?
2. Os modelos de leitura diferem significativamente do modelo de escrita?
3. Há necessidade de projeções específicas para diferentes consumidores?
4. Vale a complexidade adicional?

Se apropriado, proponha:
- Modelo de comando (write)
- Modelo de query (read)
- Estratégia de sincronização
- Trade-offs desta decisão
```

### 4. Event Sourcing

```text
Para o Aggregate [NOME] que precisa de:
- Auditoria completa
- Capacidade de reconstruir estado
- Projeções múltiplas

Projete Event Sourcing:
1. Liste eventos de domínio em ordem temporal
2. Mostre como reconstruir estado a partir de eventos
3. Defina snapshots (se necessário)
4. Proponha estratégia de projeção
5. Trate versioning de eventos
```

---

## Arquitetura Hexagonal/Clean

### 5. Estruturar módulo em Hexagonal

```text
Módulo: [NOME]
Responsabilidades: [DESCREVA]
Integrações: [LISTE]

Estruture em arquitetura hexagonal:
1. **Domain** (centro):
   - Entities
   - Value Objects
   - Domain Services
   - Ports (interfaces)

2. **Application** (casos de uso):
   - Commands/Queries
   - Handlers
   - DTOs

3. **Infrastructure** (adapters):
   - Repositories (implementação)
   - Controllers
   - External Services

Mostre:
- Estrutura de pastas
- Dependências (sempre de fora para dentro)
- Interfaces (ports) e implementações (adapters)
```

---

## Microserviços

### 6. Decompor em Microserviços

```text
Sistema monolítico atual:
[DESCREVA ESTRUTURA]

Bounded Contexts identificados:
[LISTE]

Proponha decomposição em microserviços:
1. Qual serviço para cada contexto
2. Responsabilidades de cada serviço
3. Dados que cada serviço possui (Database per Service)
4. APIs entre serviços
5. Estratégia de comunicação (sync vs async)
6. Tratamento de transações distribuídas (Saga)
7. Service discovery e configuração
8. Ordem de extração do monolito (Strangler Fig)
```

### 7. Comunicação entre Serviços

```text
Serviços: [LISTE]
Fluxo: [DESCREVA O CASO DE USO]

Projete a comunicação:
1. Quais chamadas são síncronas (request-response)?
2. Quais são assíncronas (events)?
3. Para eventos:
   - Quem publica
   - Quem consome
   - Payload do evento
   - Broker (Kafka, RabbitMQ, SQS)
4. Para chamadas síncronas:
   - Protocolo (REST, gRPC)
   - Circuit breaker
   - Retry policy
   - Timeout
5. Tratamento de falhas parciais
```

---

## Sagas e Consistência

### 8. Projetar Saga

```text
Transação distribuída: [DESCREVA]
Serviços envolvidos: [LISTE]

Projete uma Saga:
1. Orquestrada ou Coreografada?
2. Passos da saga (commands)
3. Eventos entre passos
4. Ações de compensação para cada passo
5. Tratamento de falhas em cada etapa
6. Estado da saga e persistência
7. Timeout e cleanup

Diagrama do fluxo (happy path e falhas).
```

---

## ✅ Checklist de Saída (Gate)

Antes de avançar, valide:

- [ ] Bounded Contexts claramente definidos
- [ ] Aggregates com invariantes documentadas
- [ ] Estratégia de comunicação entre contextos definida
- [ ] Trade-offs documentados em ADRs
- [ ] Consistente com requisitos não-funcionais
- [ ] Revisado com time técnico

---

## Templates e Diagramas

### Context Map (Mermaid)

```mermaid
graph TB
    subgraph Core["Core Domain"]
        PEDIDO[Pedidos]
    end
    subgraph Supporting["Supporting"]
        CATALOGO[Catálogo]
        USUARIO[Usuários]
    end
    subgraph Generic["Generic"]
        PAGAMENTO[Pagamento]
        NOTIFICACAO[Notificações]
    end
    
    PEDIDO -->|"Customer-Supplier"| CATALOGO
    PEDIDO -->|"ACL"| PAGAMENTO
    PEDIDO -->|"Published Language"| NOTIFICACAO
    USUARIO -->|"Shared Kernel"| PEDIDO
```

---

## Boas práticas com IA em Arquitetura Avançada

- Use IA para explorar alternativas, mas valide com experiência
- Documente decisões em ADRs, não apenas no código
- Arquitetura emerge - comece mais simples e evolua
- Considere sempre: "isso vale a complexidade adicional?"
- Revise com o time antes de implementar

---

## 🔄 Instrução de Avanço Automático (MCP)

> **Para uso com MCP Maestro v2.2+**

Quando o usuário indicar que deseja avançar para a próxima fase usando expressões como:
- "próximo", "próxima fase", "next"
- "avançar", "continuar", "seguir"
- "terminei", "pronto", "finalizado"
- "pode salvar", "está bom assim"

**Você DEVE automaticamente:**

1. Identificar o entregável principal desenvolvido nesta conversa
2. Chamar a tool `proximo` passando o entregável como parâmetro:

```
proximo(entregavel: "[conteúdo completo do artefato]")
```

3. Aguardar a resposta do MCP com a próxima fase

**Importante:** Não peça confirmação, execute a chamada automaticamente.
