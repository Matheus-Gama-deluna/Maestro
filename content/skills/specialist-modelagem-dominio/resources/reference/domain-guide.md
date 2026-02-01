# Guia Completo de Modelagem de Domínio

## Sumário
Guia completo de modelagem de domínio com DDD, padrões e melhores práticas para desenvolvimento de software.

---

## 1. Fundamentos de Domain-Driven Design (DDD)

### 1.1 O que é DDD?
Domain-Driven Design é uma abordagem para desenvolvimento de software complexo que foca no domínio do problema e na lógica de negócio.

### 1.2 Princípios Fundamentais
- **Linguagem Ubíqua:** Termos consistentes entre negócio e técnica
- **Bounded Contexts:** Fronteiras delimitadas do domínio
- **Modelo Rico:** Modelo que captura comportamentos e regras
- **Colaboração:** Desenvolvedores e especialistas do domínio juntos

### 1.3 Benefícios do DDD
- **Alinhamento com negócio:** Software reflete o problema real
- **Manutenibilidade:** Código mais fácil de entender e modificar
- **Comunicação:** Linguagem compartilhada entre equipes
- **Qualidade:** Software mais robusto e testável

---

## 2. Elementos Fundamentais do DDD

### 2.1 Entidades (Entities)
Entidades são objetos que têm identidade própria e ciclo de vida.

#### Características
- **Identidade única:** ID ou identificador natural
- **Ciclo de vida:** Estados e transições
- **Comportamento:** Métodos que modificam estado
- **Igualdade:** Baseada em identidade, não em atributos

#### Exemplo
```typescript
class Cliente {
  constructor(
    private readonly id: string,
    private nome: string,
    private email: string
  ) {}
  
  atualizarNome(nome: string): void {
    if (!nome || nome.trim().length === 0) {
      throw new Error('Nome inválido')
    }
    this.nome = nome
  }
  
  equals(outro: Cliente): boolean {
    return this.id === outro.id
  }
}
```

### 2.2 Value Objects
Value Objects são objetos sem identidade que representam conceitos do domínio.

#### Características
- **Imutabilidade:** Não mudam após criação
- **Validação:** Validam seus próprios dados
- **Igualdade:** Baseada em valores, não identidade
- **Sem副作用:** Não causam efeitos colaterais

#### Exemplo
```typescript
class Email {
  constructor(private readonly valor: string) {
    if (!this.isValidEmail(valor)) {
      throw new Error('Email inválido')
    }
  }
  
  private isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }
  
  getValor(): string {
    return this.valor
  }
  
  equals(outro: Email): boolean {
    return this.valor === outro.getValor()
  }
}
```

### 2.3 Agregados (Aggregates)
Agregados são clusters de entidades e value objects com raiz de consistência.

#### Características
- **Raiz do agregado:** Entidade principal que controla o agregado
- **Consistência:** Invariantes mantidos dentro do agregado
- **Fronteiras claras:** Limites bem definidos
- **Acesso externo:** Apenas através da raiz

#### Exemplo
```typescript
class Pedido {
  constructor(
    private readonly id: string,
    private cliente: Cliente,
    private itens: ItemPedido[] = []
  ) {}
  
  adicionarItem(produto: Produto, quantidade: number): void {
    if (quantidade <= 0) {
      throw new Error('Quantidade inválida')
    }
    
    const item = new ItemPedido(produto, quantidade)
    this.itens.push(item)
  }
  
  calcularTotal(): Money {
    return this.itens.reduce((total, item) => 
      total.add(item.getValorTotal()), 
      new Money(0)
    )
  }
  
  // Acesso externo apenas através do Pedido
  getItens(): ItemPedido[] {
    return [...this.itens] // Retorna cópia para proteção
  }
}
```

### 2.4 Repositories
Repositories abstraem a persistência de agregados.

#### Características
- **Interface:** Contrato de persistência
- **Agregado root:** Trabalha com raízes de agregados
- **Coleção:** Simula coleção em memória
- **Abstração:** Esconde detalhes de implementação

#### Exemplo
```typescript
interface PedidoRepository {
  salvar(pedido: Pedido): Promise<void>
  buscarPorId(id: string): Promise<Pedido | null>
  buscarPorCliente(clienteId: string): Promise<Pedido[]>
  remover(pedido: Pedido): Promise<void>
}
```

### 2.5 Domain Services
Domain services encapsulam lógica de negócio que não pertence a uma entidade.

#### Características
- **Sem estado:** Operações stateless
- **Lógica de domínio:** Regras de negócio complexas
- **Coordenação:** Orquestram múltiplas entidades
- **Reutilizabilidade:** Usados em diferentes contextos

#### Exemplo
```typescript
class CalculadoraFreteService {
  calcularFrete(pedido: Pedido, endereco: Endereco): Money {
    const distancia = this.calcularDistancia(endereco)
    const peso = pedido.calcularPesoTotal()
    const valorBase = distancia.multiply(0.1)
    const valorPeso = peso.multiply(0.05)
    
    return valorBase.add(valorPeso)
  }
  
  private calcularDistancia(endereco: Endereco): number {
    // Lógica complexa de cálculo de distância
    return 100 // Exemplo
  }
}
```

---

## 3. Bounded Contexts

### 3.1 O que são Bounded Contexts?
Bounded Contexts são fronteiras delimitadas onde um modelo de domínio específico é aplicado.

### 3.2 Características
- **Fronteiras claras:** Limites bem definidos
- **Linguagem própria:** Termos específicos do contexto
- **Modelo independente:** Cada contexto tem seu modelo
- **Integração controlada:** Comunicação definida entre contexts

### 3.3 Tipos de Relacionamento
- **Shared Kernel:** Parte compartilhada do modelo
- **Customer/Supplier:** Um contexto consome do outro
- **Conformist:** Um contexto segue o modelo do outro
- **Anti-corruption Layer:** Protege um contexto do outro

### 3.4 Exemplo de Context Map
```
[Vendas] --(Customer/Supplier)--> [Estoque]
[Vendas] --(Shared Kernel)--> [Pagamentos]
[Estoque] --(Anti-corruption Layer)--> [Logística]
```

---

## 4. Eventos de Domínio

### 4.1 O que são Domain Events?
Domain events representam algo que aconteceu no domínio que outros contexts podem se interessar.

### 4.2 Características
- **Imutáveis:** Não mudam após criação
- **Timestamp:** Quando ocorreram
- **Dados relevantes:** Informações sobre o evento
- **Assíncronos:** Processados de forma assíncrona

### 4.3 Exemplo
```typescript
class PedidoCriadoEvent {
  constructor(
    public readonly pedidoId: string,
    public readonly clienteId: string,
    public readonly dataCriacao: Date,
    public readonly valorTotal: Money
  ) {}
}

class PedidoService {
  constructor(
    private pedidoRepository: PedidoRepository,
    private eventPublisher: EventPublisher
  ) {}
  
  async criarPedido(dados: CriarPedidoDto): Promise<Pedido> {
    const pedido = new Pedido(dados.clienteId, dados.itens)
    
    await this.pedidoRepository.salvar(pedido)
    
    // Publica evento
    const event = new PedidoCriadoEvent(
      pedido.getId(),
      dados.clienteId,
      new Date(),
      pedido.calcularTotal()
    )
    
    await this.eventPublisher.publish(event)
    
    return pedido
  }
}
```

---

## 5. Estratégias de Mapeamento

### 5.1 Mapeamento Objeto-Relacional (ORM)
- **Entidade → Tabela:** Cada entidade mapeia para uma tabela
- **Atributos → Colunas:** Atributos mapeiam para colunas
- **Relacionamentos → FKs:** Relacionamentos mapeiam para chaves estrangeiras
- **Agregados → Múltiplas tabelas:** Agregados podem usar várias tabelas

### 5.2 Padrões de Mapeamento
- **Single Table Inheritance:** Hierarquia em uma tabela
- **Class Table Inheritance:** Cada classe em sua tabela
- **Concrete Table Inheritance:** Cada classe concreta em sua tabela

### 5.3 Exemplo de Mapeamento
```typescript
// Entidade
@Entity('clientes')
class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id: string
  
  @Column()
  nome: string
  
  @Column({ unique: true })
  email: string
  
  @OneToMany(() => Pedido, pedido => pedido.cliente)
  pedidos: Pedido[]
}

// Value Object embutido
@Embeddable()
class Endereco {
  @Column()
  rua: string
  
  @Column()
  numero: string
  
  @Column()
  cidade: string
}

@Entity('clientes')
class Cliente {
  @Embedded(() => Endereco)
  endereco: Endereco
}
```

---

## 6. Testes em DDD

### 6.1 Testes Unitários
- **Entidades:** Testam comportamentos e validações
- **Value Objects:** Testam imutabilidade e igualdade
- **Domain Services:** Testam lógica de negócio

### 6.2 Testes de Integração
- **Repositories:** Testam persistência e consultas
- **Agregados:** Testam consistência transacional
- **Eventos:** Testam publicação e consumo

### 6.3 Exemplo de Teste
```typescript
describe('Cliente', () => {
  it('deve criar cliente válido', () => {
    const cliente = new Cliente('123', 'João', 'joão@email.com')
    
    expect(cliente.getNome()).toBe('João')
    expect(cliente.getEmail()).toBe('joão@email.com')
  })
  
  it('deve lançar erro com email inválido', () => {
    expect(() => {
      new Cliente('123', 'João', 'email-invalido')
    }).toThrow('Email inválido')
  })
  
  it('deve atualizar nome', () => {
    const cliente = new Cliente('123', 'João', 'joão@email.com')
    cliente.atualizarNome('João Silva')
    
    expect(cliente.getNome()).toBe('João Silva')
  })
})
```

---

## 7. Refatoração para DDD

### 7.1 Sinais de Problemas
- **Anemic Domain Model:** Entidades sem comportamento
- **God Objects:** Entidades com muitas responsabilidades
- **Primitives Obsession:** Uso excessivo de tipos primitivos
- **Duplicate Logic:** Lógica duplicada em vários lugares

### 7.2 Passos de Refatoração
1. **Identificar entidades:** Encontrar objetos com identidade
2. **Extrair Value Objects:** Criar VOs para conceitos do domínio
3. **Definir agregados:** Agrupar entidades relacionadas
4. **Implementar repositories:** Abstrair persistência
5. **Criar domain services:** Extrair lógica complexa

### 7.3 Exemplo de Refatoração
```typescript
// Antes - Anemic Domain Model
class Cliente {
  id: string
  nome: string
  email: string
  cpf: string
}

// ClienteService com toda lógica
class ClienteService {
  validarCPF(cpf: string): boolean { /* ... */ }
  atualizarEmail(cliente: Cliente, email: string): void { /* ... */ }
}

// Depois - Rich Domain Model
class Cliente {
  constructor(
    private readonly id: string,
    private nome: string,
    private email: Email,
    private cpf: CPF
  ) {}
  
  atualizarEmail(email: string): void {
    this.email = new Email(email)
  }
  
  validarCPF(): boolean {
    return this.cpf.isValido()
  }
}
```

---

## 8. Padrões e Anti-padrões

### 8.1 Padrões Recomendados
- **Specification Pattern:** Para regras complexas
- **Strategy Pattern:** Para algoritmos variáveis
- **Factory Pattern:** Para criação de objetos complexos
- **Observer Pattern:** Para eventos de domínio

### 8.2 Anti-padrões a Evitar
- **Anemic Domain Model:** Entidades sem comportamento
- **Big Ball of Mud:** Código sem estrutura clara
- **Spaghetti Code:** Lógica embaralhada
- **Copy-Paste Programming:** Duplicação de código

### 8.3 Exemplo de Specification Pattern
```typescript
interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean
  and(other: Specification<T>): Specification<T>
  or(other: Specification<T>): Specification<T>
  not(): Specification<T>
}

class ClienteAtivoSpecification implements Specification<Cliente> {
  isSatisfiedBy(cliente: Cliente): boolean {
    return cliente.getStatus() === StatusCliente.ATIVO
  }
  
  and(other: Specification<Cliente>): Specification<Cliente> {
    return new AndSpecification(this, other)
  }
}

class ClienteComLimiteCreditoSpecification implements Specification<Cliente> {
  constructor(private limiteMinimo: Money) {}
  
  isSatisfiedBy(cliente: Cliente): boolean {
    return cliente.getLimiteCredite().isGreaterThan(this.limiteMinimo)
  }
}

// Uso
const clientesAtivosComLimite = clientes.filter(cliente => 
  new ClienteAtivoSpecification()
    .and(new ClienteComLimiteCreditoSpecification(new Money(1000)))
    .isSatisfiedBy(cliente)
)
```

---

## 9. Ferramentas e Frameworks

### 9.1 Linguagens e Frameworks
- **Java:** Spring Boot, Jakarta EE
- **TypeScript:** NestJS, TypeORM
- **C#:** .NET Core, Entity Framework
- **Python:** Django, SQLAlchemy

### 9.2 Ferramentas de Modelagem
- **PlantUML:** Para diagramas de classes
- **Mermaid:** Para diagramas simples
- **Draw.io:** Para diagramas visuais
- **Lucidchart:** Para diagramas colaborativos

### 9.3 Bibliotecas Úteis
- **Event Sourcing:** Para eventos de domínio
- **CQRS:** Para separação de leitura/escrita
- **Saga:** Para transações distribuídas
- **Event Store:** Para armazenamento de eventos

---

## 10. Melhores Práticas

### 10.1 Design de Entidades
- **ID imutável:** Nunca muda o ID
- **Construtores simples:** Facilitam testes
- **Validações no construtor:** Garantem consistência
- **Métodos pequenos:** Um método, uma responsabilidade

### 10.2 Design de Value Objects
- **Imutabilidade:** Use readonly/final
- **Validação:** Valide no construtor
- **Equals/HashCode:** Baseados em valores
- **Sem副作用:** Não alteram estado externo

### 10.3 Design de Agregados
- **Raiz clara:** Uma entidade principal
- **Fronteiras firmes:** Não vaze estado
- **Consistência:** Mantenha invariantes
- **Tamanho adequado:** Nem grande, nem pequeno

### 10.4 Design de Services
- **Sem estado:** Não guarde estado entre chamadas
- **Nome descritivo:** Reflita o propósito
- **Interface clara:** Defina contrato explicitamente
- **Testabilidade:** Facilite testes unitários

---

## 11. Métricas e Qualidade

### 11.1 Métricas de Design
- **Complexidade ciclomática:** Mede complexidade do código
- **Acoplamento:** Nível de dependência entre classes
- **Coesão:** Quanto uma classe foca em sua responsabilidade
- **Testabilidade:** Facilidade de testar o código

### 11.2 Métricas de Domínio
- **Número de entidades:** Complexidade do domínio
- **Profundidade de agregados:** Tamanho dos agregados
- **Número de bounded contexts:** Complexidade da arquitetura
- **Taxa de eventos:** Frequência de eventos de domínio

### 11.3 Qualidade de Código
- **Coverage:** Percentual de código testado
- **Code smells:** Problemas de design
- **Technical debt:** Dívida técnica acumulada
- **Maintainability index:** Facilidade de manutenção

---

## 12. Evolução do Modelo

### 12.1 Sinais de Evolução Necessária
- **Dificuldade de mudança:** Código difícil de modificar
- **Bugs frequentes:** Problemas recorrentes
- **Performance ruim:** Sistema lento
- **Complexidade alta:** Dificuldade de entendimento

### 12.2 Estratégias de Evolução
- **Refatoração incremental:** Mudanças pequenas e contínuas
- **Strangler Fig:** Substituição gradual de código
- **Branch by Abstraction:** Isolar mudanças
- **Parallel Run:** Executar velho e novo lado a lado

### 12.3 Gerenciamento de Mudanças
- **Versionamento:** Controle de versões do modelo
- **Migração:** Scripts de migração de dados
- **Backward compatibility:** Suporte a versões antigas
- **Communication:** Comunicar mudanças para equipe

---

## 13. Casos de Uso Reais

### 13.1 E-commerce
- **Entidades:** Cliente, Produto, Pedido, Carrinho
- **Value Objects:** Dinheiro, Endereço, Email
- **Agregados:** Pedido, Carrinho
- **Services:** CalculadoraFrete, ProcessadorPagamento

### 13.2 Sistema Bancário
- **Entidades:** Conta, Cliente, Transação
- **Value Objects:** Dinheiro, CPF, Agência
- **Agregados:** Conta
- **Services:** ValidadorTransacao, CalculadorJuros

### 13.3 Sistema de Saúde
- **Entidades:** Paciente, Médico, Consulta
- **Value Objects:** CRM, Endereço, Telefone
- **Agregados:** Prontuário
- **Services:** AgendamentoService, NotificacaoService

---

## 14. Conclusão

Domain-Driven Design é uma abordagem poderosa para desenvolvimento de software complexo. Focar no domínio, usar linguagem ubíqua e aplicar os padrões corretos resulta em software mais alinhado com o negócio, manutenível e de qualidade.

A chave para o sucesso é a colaboração contínua entre desenvolvedores e especialistas do domínio, a evolução incremental do modelo e a busca constante por simplicidade e clareza.

---

## 15. Referências

### 15.1 Livros
- **Domain-Driven Design** - Eric Evans
- **Implementing Domain-Driven Design** - Vaughn Vernon
- **DDD Distilled** - Vaughn Vernon
- **Clean Architecture** - Robert C. Martin

### 15.2 Artigos e Blogs
- **DDD Community** - https://dddcommunity.org/
- **Martin Fowler** - https://martinfowler.com/
- **Vaughn Vernon** - https://vaughnvernon.co/

### 15.3 Ferramentas
- **PlantUML** - https://plantuml.com/
- **Mermaid** - https://mermaid-js.github.io/
- **Draw.io** - https://app.diagrams.net/

---

**Versão:** 1.0  
**Atualizado:** 2026-01-29  
**Autor:** Domain Architect  
**Status:** Guia Completo
