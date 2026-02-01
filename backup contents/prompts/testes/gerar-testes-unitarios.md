# Prompt: Gerar Testes Unitários

> **Quando usar**: Após implementar uma classe/função, para criar testes
> **Especialista**: [Análise de Testes](../../02-especialistas/Especialista%20em%20Análise%20de%20Testes.md)
> **Nível**: Simples a Médio

---

## Fluxo de Contexto

Antes de usar este prompt, tenha em mãos:
- Código da classe/função a ser testada
- Entendimento das regras de negócio

Após gerar, salve os testes em:
- `src/__tests__/` ou `tests/` conforme convenção do projeto

---

## Prompt Completo

```text
Atue como engenheiro de qualidade especializado em testes automatizados.

## Contexto do Projeto

[COLE BREVE CONTEXTO - O que o sistema faz]

## Código a Testar

```[LINGUAGEM]
[COLE O CÓDIGO DA CLASSE/FUNÇÃO]
```

## Stack de Testes

Framework: [Jest/Pytest/JUnit/xUnit/Vitest/etc]
Linguagem: [TypeScript/Python/Java/C#/etc]
Mocking: [jest.mock/unittest.mock/Mockito/etc]

---

## Sua Missão

Gere testes unitários completos seguindo boas práticas:

### 1. Estrutura dos Testes

Use o padrão AAA (Arrange, Act, Assert):
- **Arrange**: Preparar dados e mocks
- **Act**: Executar a ação
- **Assert**: Verificar resultado

### 2. Cenários Obrigatórios

Para cada método público, cubra:

#### Happy Path
- Fluxo de sucesso com dados válidos
- Retorno esperado correto

#### Edge Cases (Casos de Borda)
- Valores mínimos/máximos
- Listas vazias
- Strings vazias
- Null/undefined (se aplicável)
- Zero, números negativos

#### Error Cases
- Entradas inválidas
- Exceções esperadas
- Mensagens de erro corretas

#### Validation Cases
- Cada regra de validação testada
- Combinações de validações

### 3. Mocking

Para cada dependência (repositório, serviço externo):
- Mock da dependência
- Configurar retornos para cada cenário
- Verificar que foi chamado corretamente

### 4. Formato do Teste

```
describe('[NomeClasse]', () => {
  describe('[nomeMetodo]', () => {
    it('deve [fazer algo] quando [condição]', () => {
      // Arrange
      // Act  
      // Assert
    });
  });
});
```

### 5. Comentários

Para cada teste, inclua:
- Comentário de 1 linha explicando o que garante
- Anotação se é happy path, edge case ou error case

### 6. Coverage Mínimo

- Todas as branches (if/else)
- Todos os catches de exceção
- Todos os retornos possíveis
```

---

## Exemplo de Uso

```text
Atue como engenheiro de qualidade especializado em testes automatizados.

## Contexto do Projeto

Sistema de agendamento para salões de beleza.

## Código a Testar

```typescript
@Injectable()
export class AgendamentoService {
  constructor(
    private readonly repository: AgendamentoRepository,
    private readonly notificacao: NotificacaoService,
  ) {}

  async criar(dto: CriarAgendamentoDto): Promise<Agendamento> {
    if (dto.dataHora < new Date()) {
      throw new BadRequestException('Não é possível agendar no passado');
    }

    const conflito = await this.repository.findByHorario(dto.dataHora);
    if (conflito) {
      throw new ConflictException('Horário já ocupado');
    }

    const agendamento = await this.repository.create({
      ...dto,
      status: StatusAgendamento.PENDENTE,
    });

    await this.notificacao.enviarConfirmacao(agendamento);
    return agendamento;
  }

  async cancelar(id: string): Promise<void> {
    const agendamento = await this.repository.findById(id);
    
    const limite = new Date(agendamento.dataHora);
    limite.setHours(limite.getHours() - 2);
    
    if (new Date() > limite) {
      throw new BadRequestException('Cancelamento só até 2h antes');
    }

    await this.repository.updateStatus(id, StatusAgendamento.CANCELADO);
  }
}
```

## Stack de Testes

Framework: Jest
Linguagem: TypeScript
Mocking: jest.mock
```

---

## Resposta Esperada

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AgendamentoService } from './agendamento.service';
import { AgendamentoRepository } from './agendamento.repository';
import { NotificacaoService } from '../notificacao/notificacao.service';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { StatusAgendamento } from './enums/status-agendamento.enum';

describe('AgendamentoService', () => {
  let service: AgendamentoService;
  let repository: jest.Mocked<AgendamentoRepository>;
  let notificacao: jest.Mocked<NotificacaoService>;

  // Factory para criar DTOs de teste
  const criarDto = (overrides = {}) => ({
    clienteId: 'cliente-123',
    servicoId: 'servico-456',
    dataHora: new Date(Date.now() + 86400000), // amanhã
    ...overrides,
  });

  // Factory para criar entidade mock
  const criarAgendamento = (overrides = {}) => ({
    id: 'agendamento-789',
    ...criarDto(),
    status: StatusAgendamento.PENDENTE,
    criadoEm: new Date(),
    ...overrides,
  });

  beforeEach(async () => {
    // Arrange: Setup dos mocks
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgendamentoService,
        {
          provide: AgendamentoRepository,
          useValue: {
            findById: jest.fn(),
            findByHorario: jest.fn(),
            create: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
        {
          provide: NotificacaoService,
          useValue: {
            enviarConfirmacao: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AgendamentoService>(AgendamentoService);
    repository = module.get(AgendamentoRepository);
    notificacao = module.get(NotificacaoService);
  });

  describe('criar', () => {
    // ========== HAPPY PATH ==========
    
    // Garante que agendamento válido é criado com sucesso
    it('deve criar agendamento quando horário está disponível', async () => {
      // Arrange
      const dto = criarDto();
      const agendamentoCriado = criarAgendamento();
      repository.findByHorario.mockResolvedValue(null);
      repository.create.mockResolvedValue(agendamentoCriado);
      notificacao.enviarConfirmacao.mockResolvedValue(undefined);

      // Act
      const resultado = await service.criar(dto);

      // Assert
      expect(resultado).toEqual(agendamentoCriado);
      expect(resultado.status).toBe(StatusAgendamento.PENDENTE);
      expect(repository.create).toHaveBeenCalledWith({
        ...dto,
        status: StatusAgendamento.PENDENTE,
      });
    });

    // Garante que notificação é enviada após criar
    it('deve enviar notificação após criar agendamento', async () => {
      // Arrange
      const dto = criarDto();
      const agendamentoCriado = criarAgendamento();
      repository.findByHorario.mockResolvedValue(null);
      repository.create.mockResolvedValue(agendamentoCriado);

      // Act
      await service.criar(dto);

      // Assert
      expect(notificacao.enviarConfirmacao).toHaveBeenCalledWith(agendamentoCriado);
      expect(notificacao.enviarConfirmacao).toHaveBeenCalledTimes(1);
    });

    // ========== ERROR CASES ==========

    // Garante que data no passado é rejeitada
    it('deve lançar BadRequestException quando data é no passado', async () => {
      // Arrange
      const dto = criarDto({
        dataHora: new Date('2020-01-01'), // data no passado
      });

      // Act & Assert
      await expect(service.criar(dto)).rejects.toThrow(BadRequestException);
      await expect(service.criar(dto)).rejects.toThrow('Não é possível agendar no passado');
      expect(repository.create).not.toHaveBeenCalled();
    });

    // Garante que conflito de horário é tratado
    it('deve lançar ConflictException quando horário já está ocupado', async () => {
      // Arrange
      const dto = criarDto();
      const agendamentoExistente = criarAgendamento();
      repository.findByHorario.mockResolvedValue(agendamentoExistente);

      // Act & Assert
      await expect(service.criar(dto)).rejects.toThrow(ConflictException);
      await expect(service.criar(dto)).rejects.toThrow('Horário já ocupado');
      expect(repository.create).not.toHaveBeenCalled();
    });

    // ========== EDGE CASES ==========

    // Garante que data exatamente no momento atual é rejeitada
    it('deve rejeitar agendamento com data igual ao momento atual', async () => {
      // Arrange
      const agora = new Date();
      const dto = criarDto({ dataHora: agora });

      // Act & Assert
      await expect(service.criar(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelar', () => {
    // ========== HAPPY PATH ==========

    // Garante que cancelamento funciona quando dentro do limite
    it('deve cancelar agendamento quando falta mais de 2h', async () => {
      // Arrange
      const treHorasDepois = new Date(Date.now() + 3 * 60 * 60 * 1000);
      const agendamento = criarAgendamento({ dataHora: treHorasDepois });
      repository.findById.mockResolvedValue(agendamento);

      // Act
      await service.cancelar('agendamento-789');

      // Assert
      expect(repository.updateStatus).toHaveBeenCalledWith(
        'agendamento-789',
        StatusAgendamento.CANCELADO,
      );
    });

    // ========== ERROR CASES ==========

    // Garante que cancelamento tardio é rejeitado
    it('deve lançar BadRequestException quando falta menos de 2h', async () => {
      // Arrange
      const umaHoraDepois = new Date(Date.now() + 1 * 60 * 60 * 1000);
      const agendamento = criarAgendamento({ dataHora: umaHoraDepois });
      repository.findById.mockResolvedValue(agendamento);

      // Act & Assert
      await expect(service.cancelar('agendamento-789')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.cancelar('agendamento-789')).rejects.toThrow(
        'Cancelamento só até 2h antes',
      );
      expect(repository.updateStatus).not.toHaveBeenCalled();
    });

    // ========== EDGE CASES ==========

    // Garante que exatamente 2h antes ainda permite cancelar
    it('deve permitir cancelamento exatamente 2h antes', async () => {
      // Arrange
      const exatamenteDuasHoras = new Date(Date.now() + 2 * 60 * 60 * 1000 + 1000);
      const agendamento = criarAgendamento({ dataHora: exatamenteDuasHoras });
      repository.findById.mockResolvedValue(agendamento);

      // Act
      await service.cancelar('agendamento-789');

      // Assert
      expect(repository.updateStatus).toHaveBeenCalled();
    });
  });
});
```

---

## Variações por Framework

### Python + Pytest

```python
import pytest
from unittest.mock import Mock, AsyncMock
from datetime import datetime, timedelta
from app.services.agendamento_service import AgendamentoService
from app.exceptions import BadRequestError, ConflictError

class TestAgendamentoService:
    @pytest.fixture
    def repository(self):
        return Mock()
    
    @pytest.fixture
    def service(self, repository):
        return AgendamentoService(repository)
    
    # Garante que agendamento válido é criado
    async def test_criar_agendamento_sucesso(self, service, repository):
        # Arrange
        dto = {"data_hora": datetime.now() + timedelta(days=1)}
        repository.find_by_horario.return_value = None
        repository.create.return_value = {"id": "123", **dto}
        
        # Act
        resultado = await service.criar(dto)
        
        # Assert
        assert resultado["id"] == "123"
        repository.create.assert_called_once()
    
    # Garante que data passada é rejeitada
    async def test_criar_agendamento_data_passada(self, service):
        # Arrange
        dto = {"data_hora": datetime(2020, 1, 1)}
        
        # Act & Assert
        with pytest.raises(BadRequestError):
            await service.criar(dto)
```

### Java + JUnit

```java
@ExtendWith(MockitoExtension.class)
class AgendamentoServiceTest {
    
    @Mock
    private AgendamentoRepository repository;
    
    @InjectMocks
    private AgendamentoService service;
    
    // Garante que agendamento válido é criado
    @Test
    void deveCriarAgendamentoQuandoHorarioDisponivel() {
        // Arrange
        var dto = new CriarAgendamentoDto(LocalDateTime.now().plusDays(1));
        when(repository.findByHorario(any())).thenReturn(Optional.empty());
        when(repository.create(any())).thenReturn(new Agendamento());
        
        // Act
        var resultado = service.criar(dto);
        
        // Assert
        assertNotNull(resultado);
        verify(repository).create(any());
    }
    
    // Garante que data passada é rejeitada
    @Test
    void deveLancarExcecaoQuandoDataPassada() {
        // Arrange
        var dto = new CriarAgendamentoDto(LocalDateTime.of(2020, 1, 1, 10, 0));
        
        // Act & Assert
        assertThrows(BadRequestException.class, () -> service.criar(dto));
    }
}
```

---

## Checklist Pós-Geração

- [ ] Todos os métodos públicos têm pelo menos 1 teste
- [ ] Happy path testado para cada método
- [ ] Error cases testados (exceções)
- [ ] Edge cases testados (limites, vazios, nulls)
- [ ] Mocks configurados corretamente
- [ ] Padrão AAA seguido (Arrange, Act, Assert)
- [ ] Cada teste tem comentário explicando o que garante
- [ ] Factories criadas para dados de teste
- [ ] Nenhum teste depende de outro (isolamento)
- [ ] Rodar testes e verificar que passam
