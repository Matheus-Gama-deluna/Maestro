# Prompt: Code Review Automatizado

> **Quando usar**: Durante Pull Requests ou revisão de código
> **Especialista**: [Desenvolvimento Backend](../../02-especialistas/Especialista%20em%20Desenvolvimento%20e%20Vibe%20Coding%20Estruturado.md) ou Tech Lead
> **Nível**: Médio

---

## Fluxo de Contexto

Antes de usar este prompt, tenha em mãos:
- Código a ser revisado (diff ou arquivo completo)
- Contexto do projeto e padrões existentes

Após revisão, crie comentários inline no PR ou salve em:
- Comentários no sistema de versionamento (GitHub, GitLab)

---

## Prompt Completo

```text
Atue como desenvolvedor sênior realizando code review.

## Contexto do Projeto

[BREVE DESCRIÇÃO DO PROJETO E STACK]

## Padrões do Projeto

- Linguagem: [TypeScript/Python/Java/etc]
- Framework: [NestJS/FastAPI/Spring/etc]
- Style Guide: [Airbnb/Google/PEP8/etc]
- Arquitetura: [Clean/Hexagonal/MVC/etc]
- Padrões específicos: [Liste convenções do projeto]

## Código para Revisar

```[LINGUAGEM]
[COLE O CÓDIGO - Pode ser diff ou arquivo completo]
```

## Tipo de Mudança

- [ ] Nova feature
- [ ] Bug fix
- [ ] Refactoring
- [ ] Performance
- [ ] Documentação

---

## Sua Missão

Realize um code review completo analisando:

### 1. Categorize os Comentários

Use prefixos para categorizar:
- 🔴 **BLOCKER**: Erro crítico, impede aprovação
- 🟡 **WARN**: Problema que deveria ser corrigido
- 🟢 **SUGGESTION**: Melhoria opcional
- 💬 **QUESTION**: Dúvida que precisa esclarecimento
- 👍 **PRAISE**: Destaque positivo

### 2. Checklist de Revisão

#### Correção
- [ ] Código faz o que deveria fazer?
- [ ] Edge cases tratados?
- [ ] Erros tratados adequadamente?
- [ ] Null/undefined handling?

#### Legibilidade
- [ ] Nomes de variáveis/funções claros?
- [ ] Código autoexplicativo ou comentado?
- [ ] Magic numbers/strings evitados?
- [ ] Complexidade ciclomática aceitável?

#### Manutenibilidade
- [ ] DRY (Don't Repeat Yourself)?
- [ ] Single Responsibility?
- [ ] Baixo acoplamento?
- [ ] Testável?

#### Performance
- [ ] N+1 queries evitados?
- [ ] Loops desnecessários?
- [ ] Memória bem gerenciada?
- [ ] Operações bloqueantes?

#### Segurança
- [ ] Input sanitizado?
- [ ] Dados sensíveis protegidos?
- [ ] Authorization verificada?
- [ ] Logs sem dados sensíveis?

#### Testes
- [ ] Testes unitários incluídos?
- [ ] Casos de erro testados?
- [ ] Coverage adequado?

### 3. Formato dos Comentários

Para cada comentário, inclua:
- Linha(s) afetada(s)
- Categoria (BLOCKER/WARN/SUGGESTION)
- Problema identificado
- Sugestão de correção com código

### 4. Resumo

No final, forneça:
- Aprovado / Aprovar com mudanças / Solicitar mudanças
- Lista priorizada das mudanças necessárias
- Pontos positivos do código
```

---

## Exemplo de Uso

```text
Atue como desenvolvedor sênior realizando code review.

## Contexto do Projeto

API de agendamento para salões de beleza, NestJS.

## Padrões do Projeto

- Linguagem: TypeScript
- Framework: NestJS
- Style Guide: ESLint + Prettier
- Arquitetura: Clean Architecture
- Padrões: Injeção de dependência, DTOs, Repository pattern

## Código para Revisar

```typescript
@Controller('agendamentos')
export class AgendamentoController {
  constructor(private agendamentoService: any) {}

  @Post()
  async criar(@Body() body) {
    if (!body.clienteId) {
      throw new Error('Cliente obrigatorio');
    }
    
    const result = await this.agendamentoService.criar(body);
    console.log('Agendamento criado:', result.id);
    return result;
  }
  
  @Get()
  async listar() {
    const agendamentos = await this.agendamentoService.repository.findAll();
    return agendamentos;
  }
}
```

## Tipo de Mudança

- [x] Nova feature
```

---

## Resposta Esperada

### Comentários de Código

**Linha 3**
🔴 **BLOCKER**: Tipo `any` para o serviço

O uso de `any` quebra a tipagem e pode causar bugs em runtime.

```typescript
// ❌ Antes
constructor(private agendamentoService: any) {}

// ✅ Depois
constructor(private readonly agendamentoService: AgendamentoService) {}
```

---

**Linha 6**
🔴 **BLOCKER**: Body sem tipagem e validação

Sem DTO, não há validação de input, vulnerável a payloads maliciosos.

```typescript
// ❌ Antes
async criar(@Body() body) {

// ✅ Depois
async criar(@Body() dto: CriarAgendamentoDto) {
```

E criar o DTO:
```typescript
export class CriarAgendamentoDto {
  @IsUUID()
  clienteId: string;
  
  @IsDate()
  dataHora: Date;
}
```

---

**Linha 7-9**
🟡 **WARN**: Validação manual no controller

Validação deveria estar no DTO com class-validator, não manual.

```typescript
// ❌ Antes (validação manual)
if (!body.clienteId) {
  throw new Error('Cliente obrigatorio');
}

// ✅ Depois (remover, DTO com @IsNotEmpty() cuida disso)
```

---

**Linha 12**
🔴 **BLOCKER**: Console.log em código de produção

Logs devem usar o sistema de logging do NestJS.

```typescript
// ❌ Antes
console.log('Agendamento criado:', result.id);

// ✅ Depois
this.logger.log(`Agendamento criado: ${result.id}`);
```

---

**Linha 17**
🔴 **BLOCKER**: Acesso direto ao repository do service

Controller acessando `service.repository` viola encapsulamento.

```typescript
// ❌ Antes
const agendamentos = await this.agendamentoService.repository.findAll();

// ✅ Depois
const agendamentos = await this.agendamentoService.listar();
```

---

**Linha 16**
🟡 **WARN**: Endpoint sem paginação

Listar todos os registros pode ser problemático com muitos dados.

```typescript
// ✅ Sugerir
@Get()
async listar(@Query() query: PaginacaoDto) {
  return this.agendamentoService.listar(query.page, query.limit);
}
```

---

### Resumo

**Decisão**: 🔴 **Solicitar mudanças**

**Prioridade de Correções:**
1. Tipar service e remover `any`
2. Criar DTO com class-validator
3. Remover console.log
4. Não acessar repository diretamente
5. Adicionar paginação

**Pontos Positivos:**
- Estrutura básica de controller correta
- Uso de async/await adequado

---

## Checklist Pós-Geração

- [ ] Todos os BLOCKERs corrigidos
- [ ] WARNs revisados e priorizados
- [ ] Sugestões consideradas
- [ ] Testes adicionados se necessário
- [ ] Código refatorado aprovado
- [ ] PR atualizado com correções
