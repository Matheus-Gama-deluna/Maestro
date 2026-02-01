---
name: specialist-desenvolvimento-backend
description: Implementação de services, controllers e testes seguindo clean code.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Desenvolvimento e Vibe Coding Estruturado · Skill do Especialista

## Missão
Construir serviços backend alinhados ao contrato, com testes e qualidade, usando IA como pair programmer estruturado.

## Quando ativar
- Fase: Fase 11 · Desenvolvimento Backend
- Workflows recomendados: /implementar-historia, /corrigir-bug, /refatorar-codigo
- Use quando precisar para histórias backend, integrações ou refatorações de serviços.

## Inputs obrigatórios
- Design Doc (`docs/03-ux/design-doc.md`)
- Modelo de Domínio (`docs/04-modelo/modelo-dominio.md`)
- Arquitetura (`docs/06-arquitetura/arquitetura.md`)
- Contrato de API (`docs/09-api/contrato-api.md`)
- Backlog/História (`docs/08-backlog/`)

## Outputs gerados
- Services, controllers e entities
- Testes unitários e de integração
- DTOs e types
- Documentação de API

## Quality Gate
- Código segue padrões do projeto
- Testes unitários implementados (> 80% cobertura)
- Testes de integração (fluxos críticos)
- Sem warnings/erros de linter
- Code review realizado
- PR pronto para merge

## Vibe Coding Estruturado: Fluxo por Blocos

Para **cada história de usuário**, implemente em **blocos ordenados** com validação entre cada um:

### Ordem de Implementação

| # | Bloco | O que fazer | Validação |
|---|-------|-------------|-----------|
| 1 | **DTO/Types** | Definir contratos de entrada/saída | Lint |
| 2 | **Entity** | Criar/alterar entidade (se necessário) | Lint |
| 3 | **Repository** | Camada de dados | Lint |
| 4 | **Service** | Regra de negócio | Testes unitários + Coverage ≥80% |
| 5 | **Controller** | Endpoints/handlers | Lint |
| 6 | **Testes E2E** | Fluxo completo | Todos passando |

> **REGRA:** Só avance para o próximo bloco após validar o atual.

### Fluxo Visual
```
US-007: Criar pedido

┌─────┐   ┌────────┐   ┌──────┐   ┌─────────┐   ┌──────────┐
│ DTO │ → │ Entity │ → │ Repo │ → │ Service │ → │Controller│
└──┬──┘   └───┬────┘   └──┬───┘   └────┬────┘   └────┬─────┘
   │          │           │            │              │
   ▼          ▼           ▼            ▼              ▼
[lint]     [lint]      [lint]    [testes+cov]     [lint]
   ✓          ✓           ✓            ✓              ✓
```

## Prompts por Camada

### Bloco 1: DTO/Types
```text
Stack: [STACK]
Arquitetura: [PADRÃO]
História: [COLE HISTÓRIA]

Gere APENAS os DTOs/Types:
- CreateXxxDto (entrada)
- XxxResponseDto (saída)
- Validações com decorators

Não gere service, controller ou qualquer outra camada.
```

### Bloco 2: Entity
```text
DTOs já definidos:
[COLE DTOS]

Gere APENAS a entidade/model para [NOME]:
- Campos com tipos
- Relacionamentos
- Decorators de ORM

Não gere repository nem service.
```

### Bloco 3: Repository
```text
Entity já definida:
[COLE ENTITY]

Gere APENAS o repository para [NOME]:
- Métodos CRUD
- Queries específicas
- Tipagem forte

Não gere service nem controller.
```

### Bloco 4: Service + Testes
```text
DTOs e Repository implementados:
[COLE]

Gere o SERVICE para [HISTÓRIA]:
- Regra de negócio
- Validações
- Tratamento de erros

TAMBÉM gere TESTES UNITÁRIOS:
- Caso de sucesso
- Entradas inválidas
- Casos de borda
```

### Bloco 5: Controller
```text
Service implementado e testado:
[COLE SERVICE]

Gere APENAS o controller:
- Rotas e verbos HTTP
- Validação via DTO
- Mapeamento de erros
- Documentação Swagger
```

### Bloco 6: Testes E2E
```text
Controller e Service implementados.

Gere testes de integração/E2E:
- Happy path completo
- Erro de validação
- Erro de negócio
```

## Guardrails Críticos

### NUNCA Faça
- **NUNCA** pule blocos do fluxo
- **NUNCA** avance sem validar o bloco atual
- **NUNCA** gere código sem testes (services)
- **NUNCA** ignore warnings do linter

### SEMPRE Faça
- **SEMPRE** consulte o Design Doc antes de implementar
- **SEMPRE** siga o mapa de navegação definido
- **SEMPRE** respeite os fluxos de usuário mapeados
- **SEMPRE** valide cobertura ≥ 80% para services

### Checklist por Bloco
Antes de avançar para o próximo bloco:
- [ ] Testes passando (`npm test`)
- [ ] Lint ok (`npm run lint`)
- [ ] Coverage ≥ 80% (para service)
- [ ] Código revisado

## Stack Guidelines por Linguagem

### Node.js + TypeScript
```typescript
// DTO com decorators
class CreateUserDto {
  @IsEmail()
  email: string;
  
  @IsString()
  @MinLength(3)
  name: string;
}

// Service com injeção de dependência
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}
}
```

### Python + FastAPI
```python
# Pydantic models
class CreateUserRequest(BaseModel):
    email: EmailStr
    name: constr(min_length=3)

# Service pattern
class UserService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo
```

### Java + Spring Boot
```java
// DTO com validações
public record CreateUserRequest(
    @NotBlank @Email String email,
    @NotBlank @Size(min = 3) String name
) {}

// Service com @Service
@Service
public class UserService {
    private final UserRepository userRepository;
}
```

## Context Flow

### Artefatos Obrigatórios para Iniciar
Cole no início:
1. Design Doc completo com wireframes
2. Modelo de domínio com entidades
3. Arquitetura com stack definida
4. Contrato de API (se existir)
5. História atual do backlog

### Prompt de Continuação
```
Atue como Engenheiro Backend Sênior.

Contexto do projeto:
[COLE docs/CONTEXTO.md]

Design Doc:
[COLE docs/03-ux/design-doc.md]

Modelo de Domínio:
[COLE docs/04-modelo/modelo-dominio.md]

Arquitetura:
[COLE docs/06-arquitetura/arquitetura.md]

História atual:
[COLE HISTÓRIA DO BACKLOG]

Preciso implementar esta história seguindo o fluxo estruturado.
```

### Ao Concluir Cada História
1. **Valide todos os blocos** usando checklist
2. **Execute testes completos** (unitários + integração)
3. **Verifique coverage** ≥ 80%
4. **Faça code review** dos artefatos
5. **Prepare PR** para merge

## Métricas de Qualidade

### Indicadores Obrigatórios
- **Coverage:** ≥ 80% para services
- **Lint:** Zero warnings/errors
- **Test Pass Rate:** 100%
- **Build Time:** < 2 minutos
- **Bundle Size:** Monitorar regressões

### Metas de Qualidade
- Coverage: ≥ 85%
- Lint: Zero issues
- Test Pass Rate: 100%
- Performance: < 200ms por request

## Skills complementares
- `clean-code`
- `nodejs-best-practices`
- `python-patterns`
- `api-patterns`
- `database-design`

## Referências essenciais
- **Especialista original:** `content/specialists/Especialista em Desenvolvimento e Vibe Coding Estruturado.md`
- **Artefatos alvo:**
  - Services, controllers e entities
  - Testes unitários e de integração
  - DTOs e types
  - Documentação de API