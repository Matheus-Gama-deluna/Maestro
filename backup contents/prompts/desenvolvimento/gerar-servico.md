# Prompt: Gerar Serviço de Aplicação

> **Quando usar**: Durante implementação, para gerar services/use cases
> **Especialista**: [Desenvolvimento Backend](../../02-especialistas/Especialista%20em%20Desenvolvimento%20e%20Vibe%20Coding%20Estruturado.md)
> **Nível**: Médio

---

## Fluxo de Contexto

Antes de usar este prompt, tenha em mãos:
- `docs/CONTEXTO.md` - Entendimento atual do projeto
- `docs/05-arquitetura/arquitetura.md` - Arquitetura definida
- `docs/04-modelo/modelo-dominio.md` - Entidades e regras

Após gerar, salve o código em:
- `src/application/services/` ou equivalente na sua estrutura

---

## Prompt Completo

```text
Atue como desenvolvedor sênior especializado em Clean Architecture.

## Contexto do Projeto

[COLE O CONTEÚDO DE docs/CONTEXTO.md]

## Arquitetura

[COLE RESUMO DA ARQUITETURA - Padrão usado, camadas]

## Entidade Alvo

Nome: [NOME DA ENTIDADE]
Campos: [LISTE OS CAMPOS]

## Regras de Negócio

[DESCREVA AS VALIDAÇÕES E REGRAS]

## Stack

Linguagem: [TypeScript/Python/Java/Go/etc]
Framework: [NestJS/FastAPI/Spring/etc]
ORM/Database: [Prisma/TypeORM/SQLAlchemy/etc]

---

## Sua Missão

Gere o código do serviço/classe de aplicação com:

### 1. Estrutura do Serviço
- Injeção de dependências (Repository, outros Services)
- Tipagem correta de DTOs de entrada e saída

### 2. Métodos Principais
Para cada operação CRUD + regras específicas:
- Assinatura com tipos
- Documentação JSDoc/Docstring
- Lógica do happy path
- Tratamento de erros com exceções específicas
- Validações de negócio

### 3. Padrões a Seguir
- Separação entre Application Service e Domain Service (se aplicável)
- DTOs para entrada/saída (nunca expor entidade diretamente)
- Repository interface (não implementação)
- Unit of Work pattern para transações (se aplicável)

### 4. Não Gere
- Controllers/Rotas
- Implementação de Repository
- Migrations
- Configurações de framework

### 5. Formato
Retorne código pronto para uso com:
- Imports necessários
- Types/Interfaces auxiliares
- Comentários explicando decisões
```

---

## Exemplo de Uso

```text
Atue como desenvolvedor sênior especializado em Clean Architecture.

## Contexto do Projeto

Sistema de agendamento para salões de beleza.

## Arquitetura

Clean Architecture com camadas: Domain, Application, Infrastructure, Interface.
Services na camada Application orquestram casos de uso.

## Entidade Alvo

Nome: Agendamento
Campos:
- id: UUID
- clienteId: UUID
- servicoId: UUID
- dataHora: DateTime
- status: enum (PENDENTE, CONFIRMADO, CANCELADO, CONCLUIDO)

## Regras de Negócio

1. Não pode agendar no passado
2. Não pode haver conflito de horário para o mesmo prestador
3. Cancelamento só até 2h antes
4. Após criar, enviar notificação ao cliente

## Stack

Linguagem: TypeScript
Framework: NestJS
ORM: Prisma
```

---

## Resposta Esperada

```typescript
import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { AgendamentoRepository } from '../ports/agendamento.repository';
import { NotificacaoService } from './notificacao.service';
import { CriarAgendamentoDto, AgendamentoResponseDto } from '../dtos/agendamento.dto';
import { StatusAgendamento } from '../../domain/enums/status-agendamento.enum';

/**
 * Service responsável por orquestrar casos de uso de Agendamento.
 * Não contém regras de domínio, apenas coordena operações.
 */
@Injectable()
export class AgendamentoService {
  constructor(
    private readonly agendamentoRepository: AgendamentoRepository,
    private readonly notificacaoService: NotificacaoService,
  ) {}

  /**
   * Cria um novo agendamento validando regras de negócio.
   * @throws BadRequestException - Data no passado
   * @throws ConflictException - Horário já ocupado
   */
  async criar(dto: CriarAgendamentoDto): Promise<AgendamentoResponseDto> {
    // Validar: não pode ser no passado
    if (dto.dataHora < new Date()) {
      throw new BadRequestException('Não é possível agendar no passado');
    }

    // Validar: horário disponível
    const conflito = await this.agendamentoRepository.findByHorarioEPrestador(
      dto.dataHora,
      dto.prestadorId,
    );
    if (conflito) {
      throw new ConflictException('Horário já ocupado para este prestador');
    }

    // Criar agendamento
    const agendamento = await this.agendamentoRepository.create({
      ...dto,
      status: StatusAgendamento.PENDENTE,
    });

    // Side effect: notificar cliente
    await this.notificacaoService.enviarConfirmacaoAgendamento(agendamento);

    return AgendamentoResponseDto.fromEntity(agendamento);
  }

  /**
   * Cancela um agendamento respeitando a regra de 2h.
   * @throws BadRequestException - Menos de 2h para o horário
   */
  async cancelar(id: string, motivo: string): Promise<void> {
    const agendamento = await this.agendamentoRepository.findById(id);
    
    // Validar: limite de 2h
    const duasHorasAntes = new Date(agendamento.dataHora);
    duasHorasAntes.setHours(duasHorasAntes.getHours() - 2);
    
    if (new Date() > duasHorasAntes) {
      throw new BadRequestException(
        'Cancelamento só é permitido até 2 horas antes do horário',
      );
    }

    await this.agendamentoRepository.updateStatus(id, StatusAgendamento.CANCELADO);
    await this.notificacaoService.enviarCancelamento(agendamento, motivo);
  }
}
```

---

## Variações por Stack

### Python + FastAPI

```python
from fastapi import HTTPException, status
from app.repositories.agendamento_repository import AgendamentoRepository
from app.services.notificacao_service import NotificacaoService
from app.schemas.agendamento import CriarAgendamentoDto, AgendamentoResponse

class AgendamentoService:
    def __init__(
        self,
        repository: AgendamentoRepository,
        notificacao: NotificacaoService,
    ):
        self._repository = repository
        self._notificacao = notificacao

    async def criar(self, dto: CriarAgendamentoDto) -> AgendamentoResponse:
        if dto.data_hora < datetime.now():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível agendar no passado"
            )
        # ... resto da lógica
```

### Java + Spring

```java
@Service
@Transactional
public class AgendamentoService {
    
    private final AgendamentoRepository repository;
    private final NotificacaoService notificacao;
    
    public AgendamentoService(
        AgendamentoRepository repository,
        NotificacaoService notificacao
    ) {
        this.repository = repository;
        this.notificacao = notificacao;
    }
    
    public AgendamentoResponse criar(CriarAgendamentoDto dto) {
        if (dto.getDataHora().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Não é possível agendar no passado");
        }
        // ... resto da lógica
    }
}
```

---

## Checklist Pós-Geração

- [ ] Service não contém lógica de domínio complexa (mover para Domain Service se necessário)
- [ ] Todas as dependências são injetadas (não há `new` de repositórios)
- [ ] DTOs separados para entrada e saída
- [ ] Exceções são específicas (não genéricas)
- [ ] Validações de negócio estão presentes
- [ ] Side effects (notificações, eventos) estão isolados
- [ ] Código está tipado corretamente
- [ ] Comentários explicam o "porquê", não o "como"
