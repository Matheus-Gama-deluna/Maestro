# Exemplos Práticos de Modelagem de Domínio

## Sumário
Este documento contém exemplos práticos de modelagem de domínio para diferentes tipos de sistemas, servindo como referência para implementação.

---

## Exemplo 1: Sistema de E-commerce

### Contexto
Sistema de vendas online com gestão de produtos, pedidos e clientes.

### Entidades Principais

#### Cliente
```typescript
class Cliente {
  id: string
  nome: string
  email: string
  cpf: string
  dataNascimento: Date
  endereco: Endereco[]
  telefones: string[]
  
  // Comportamentos
  adicionarEndereco(endereco: Endereco): void
  atualizarDados(dados: Partial<Cliente>): void
  validarCPF(): boolean
}
```

#### Produto
```typescript
class Produto {
  id: string
  nome: string
  descricao: string
  preco: Money
  estoque: Estoque
  categoria: Categoria
  imagens: Imagem[]
  
  // Comportamentos
  atualizarPreco(novoPreco: Money): void
  diminuirEstoque(quantidade: number): void
  verificarDisponibilidade(quantidade: number): boolean
}
```

#### Pedido
```typescript
class Pedido {
  id: string
  cliente: Cliente
  itens: ItemPedido[]
  status: StatusPedido
  dataCriacao: Date
  dataEntrega: Date
  enderecoEntrega: Endereco
  pagamento: Pagamento
  
  // Comportamentos
  adicionarItem(produto: Produto, quantidade: number): void
  calcularTotal(): Money
  confirmar(): void
  cancelar(motivo: string): void
}
```

### Value Objects

#### Money
```typescript
class Money {
  constructor(
    private readonly amount: number,
    private readonly currency: string = 'BRL'
  ) {}
  
  add(other: Money): Money
  subtract(other: Money): Money
  multiply(factor: number): Money
  isGreaterThan(other: Money): boolean
}
```

#### Endereco
```typescript
class Endereco {
  constructor(
    public readonly rua: string,
    public readonly numero: string,
    public readonly bairro: string,
    public readonly cidade: string,
    public readonly estado: string,
    public readonly cep: string
  ) {}
  
  validarCEP(): boolean
  formatarEndereco(): string
}
```

### Relacionamentos
```
Cliente 1 --- N Pedido
Pedido 1 --- N ItemPedido
ItemPedido N --- 1 Produto
Produto N --- 1 Categoria
Cliente 1 --- N Endereco
```

### Casos de Uso
- **UC-001:** Realizar pedido
- **UC-002:** Consultar produtos
- **UC-003:** Gerenciar carrinho
- **UC-004:** Rastrear pedido

---

## Exemplo 2: Sistema de Gestão Escolar

### Contexto
Sistema para gestão de instituições de ensino com alunos, professores e disciplinas.

### Entidades Principais

#### Aluno
```typescript
class Aluno {
  id: string
  nome: string
  matricula: string
  dataNascimento: Date
  turma: Turma
  notas: Nota[]
  frequencia: Frequencia[]
  
  // Comportamentos
  matricular(turma: Turma): void
  adicionarNota(disciplina: Disciplina, valor: number): void
  calcularMedia(): number
  verificarAprovacao(disciplina: Disciplina): boolean
}
```

#### Professor
```typescript
class Professor {
  id: string
  nome: string
  email: string
  especialidades: string[]
  disciplinas: Disciplina[]
  turmas: Turma[]
  
  // Comportamentos
  atribuirDisciplina(disciplina: Disciplina): void
  lancarNota(aluno: Aluno, disciplina: Disciplina, nota: number): void
  registrarFrequencia(turma: Turma, data: Date, presencas: Map<string, boolean>): void
}
```

#### Disciplina
```typescript
class Disciplina {
  id: string
  nome: string
  cargaHoraria: number
  ementa: string
  professor: Professor
  turmas: Turma[]
  
  // Comportamentos
  definirProfessor(professor: Professor): void
  adicionarTurma(turma: Turma): void
  verificarCargaHoraria(): boolean
}
```

### Value Objects

#### Nota
```typescript
class Nota {
  constructor(
    public readonly valor: number,
    public readonly data: Date,
    public readonly disciplina: Disciplina
  ) {
    if (valor < 0 || valor > 10) {
      throw new Error('Nota deve estar entre 0 e 10')
    }
  }
  
  isAprovacao(): boolean {
    return this.valor >= 7
  }
}
```

#### Frequencia
```typescript
class Frequencia {
  constructor(
    public readonly data: Date,
    public readonly presente: boolean,
    public readonly justificativa?: string
  ) {}
}
```

### Relacionamentos
```
Aluno N --- 1 Turma
Turma N --- N Aluno
Professor 1 --- N Disciplina
Disciplina N --- 1 Professor
Turma N --- N Disciplina
Aluno 1 --- N Nota
Aluno 1 --- N Frequencia
```

### Casos de Uso
- **UC-001:** Matricular aluno
- **UC-002:** Lançar notas
- **UC-003:** Registrar frequência
- **UC-004:** Gerar boletim

---

## Exemplo 3: Sistema de Reservas de Hotel

### Contexto
Sistema para gestão de reservas de hotel com quartos, hóspedes e reservas.

### Entidades Principais

#### Hospede
```typescript
class Hospede {
  id: string
  nome: string
  email: string
  telefone: string
  documento: DocumentoIdentidade
  historicoReservas: Reserva[]
  
  // Comportamentos
  fazerReserva(quarto: Quarto, dataInicio: Date, dataFim: Date): Reserva
  cancelarReserva(reserva: Reserva): void
  verificarHistorico(): Reserva[]
}
```

#### Quarto
```typescript
class Quarto {
  id: string
  numero: string
  tipo: TipoQuarto
  capacidade: number
  precoDiaria: Money
  status: StatusQuarto
  reservas: Reserva[]
  
  // Comportamentos
  verificarDisponibilidade(dataInicio: Date, dataFim: Date): boolean
  reservar(hospede: Hospede, dataInicio: Date, dataFim: Date): Reserva
  liberar(): void
  calcularPrecoTotal(dataInicio: Date, dataFim: Date): Money
}
```

#### Reserva
```typescript
class Reserva {
  id: string
  hospede: Hospede
  quarto: Quarto
  dataInicio: Date
  dataFim: Date
  status: StatusReserva
  pagamento: Pagamento
  
  // Comportamentos
  confirmar(): void
  cancelar(): void
  calcularTotalDias(): number
  calcularTotal(): Money
}
```

### Value Objects

#### DocumentoIdentidade
```typescript
class DocumentoIdentidade {
  constructor(
    public readonly tipo: 'CPF' | 'RG' | 'Passaporte',
    public readonly numero: string,
    public readonly emissao: Date,
    public readonly validade: Date
  ) {}
  
  isValido(): boolean
  estaExpirado(): boolean
}
```

#### TipoQuarto
```typescript
class TipoQuarto {
  constructor(
    public readonly nome: string,
    public readonly descricao: string,
    public readonly comodidades: string[]
  ) {}
}
```

### Relacionamentos
```
Hospede 1 --- N Reserva
Quarto 1 --- N Reserva
Reserva N --- 1 Pagamento
Quarto N --- 1 TipoQuarto
Hospede 1 --- 1 DocumentoIdentidade
```

### Casos de Uso
- **UC-001:** Fazer reserva
- **UC-002:** Consultar disponibilidade
- **UC-003:** Check-in
- **UC-004:** Check-out

---

## Exemplo 4: Sistema de Gestão Financeira

### Contexto
Sistema para gestão financeira pessoal com contas, transações e categorias.

### Entidades Principais

#### Conta
```typescript
class Conta {
  id: string
  nome: string
  tipo: TipoConta
  saldo: Money
  banco: string
  agencia: string
  numero: string
  transacoes: Transacao[]
  
  // Comportamentos
  creditar(valor: Money, descricao: string): Transacao
  debitar(valor: Money, descricao: string): Transacao
  transferir(destino: Conta, valor: Money): Transacao
  calcularSaldo(): Money
}
```

#### Transacao
```typescript
class Transacao {
  id: string
  conta: Conta
  valor: Money
  data: Date
  descricao: string
  categoria: Categoria
  tipo: TipoTransacao
  
  // Comportamentos
  estornar(): Transacao
  categorizar(categoria: Categoria): void
  validarValor(): boolean
}
```

#### Categoria
```typescript
class Categoria {
  id: string
  nome: string
  tipo: TipoCategoria
  orcamento: Money
  pai?: Categoria
  filhas: Categoria[]
  
  // Comportamentos
  adicionarFilha(categoria: Categoria): void
  calcularGastoPeriodo(dataInicio: Date, dataFim: Date): Money
  verificarOrcamento(): boolean
}
```

### Value Objects

#### TipoConta
```typescript
enum TipoConta {
  CORRENTE = 'corrente',
  POUPANCA = 'poupanca',
  INVESTIMENTO = 'investimento',
  CARTAO = 'cartao'
}
```

#### TipoTransacao
```typescript
enum TipoTransacao {
  CREDITO = 'credito',
  DEBITO = 'debito',
  TRANSFERENCIA = 'transferencia'
}
```

### Relacionamentos
```
Conta 1 --- N Transacao
Transacao N --- 1 Categoria
Categoria 1 --- N Categoria (hierarquia)
Transacao 1 --- 1 Conta (origem/destino)
```

### Casos de Uso
- **UC-001:** Registrar transação
- **UC-002:** Consultar saldo
- **UC-003:** Gerar relatório
- **UC-004:** Definir orçamento

---

## Padrões e Boas Práticas

### 1. Identificação de Entidades
- **Identidade única:** Toda entidade deve ter um identificador único
- **Ciclo de vida:** Entidades têm ciclo de vida bem definido
- **Comportamento:** Entidades devem ter comportamentos próprios

### 2. Value Objects
- **Imutabilidade:** Value objects devem ser imutáveis
- **Validação:** Devem validar seus próprios dados
- **Sem identidade:** Não têm identidade própria

### 3. Agregados
- **Raiz do agregado:** Uma entidade principal controla o agregado
- **Consistência:** Invariantes mantidos dentro do agregado
- **Fronteiras claras:** Limites bem definidos do agregado

### 4. Relacionamentos
- **Cardinalidade:** Definir claramente 1:1, 1:N, N:N
- **Direção:** Unidirecional vs bidirecional
- **Cascata:** Definir comportamento de cascata

### 5. Nomenclatura
- **Linguagem ubíqua:** Usar termos do negócio
- **Consistência:** Manter padrão de nomes
- **Clareza:** Nomes devem ser autoexplicativos

---

## Exercícios Práticos

### Exercício 1: Sistema de Biblioteca
Modelar um sistema de biblioteca com:
- Livros, autores, categorias
- Empréstimos e devoluções
- Usuários e multas

### Exercício 2: Sistema de Delivery
Modelar um sistema de delivery com:
- Restaurantes, pratos, categorias
- Pedidos e entregadores
- Clientes e endereços

### Exercício 3: Sistema de Recursos Humanos
Modelar um sistema de RH com:
- Funcionários, departamentos, cargos
- Folha de pagamento e benefícios
- Avaliações de desempenho

---

## Ferramentas Úteis

### Diagramação
- **PlantUML:** Para diagramas de classes
- **Mermaid:** Para diagramas simples
- **Draw.io:** Para diagramas visuais

### Validação
- **Checklists:** Para verificar qualidade
- **Code review:** Para revisão do modelo
- **Testes:** Para validar comportamentos

### Documentação
- **ADR:** Para decisões arquiteturais
- **Wiki:** Para documentação viva
- **Comentários:** Para detalhes de implementação
