# Prompt: Análise de Acessibilidade

> **Quando usar**: Durante desenvolvimento de UI ou antes de ir para produção
> **Especialista**: UX/UI Design
> **Nível**: Médio

---

## Fluxo de Contexto

Antes de usar este prompt, tenha em mãos:
- URL do site/app ou código HTML/React
- Tipo de aplicação (web, mobile, desktop)

Após gerar, salve o resultado em:
- `docs/11-acessibilidade/analise-acessibilidade.md`

---

## Prompt Completo

```text
Atue como especialista em acessibilidade digital (WCAG).

## Contexto

Tipo de aplicação: [Web app / Mobile app / Site institucional]
Framework: [React/Vue/Angular/HTML puro]
Público-alvo: [Descreva o público, incluindo se há foco em usuários com deficiência]

## Código/URL a Analisar

```html
[COLE O CÓDIGO HTML OU COMPONENTE REACT/VUE]
```

Ou: [URL do site para análise]

---

## Sua Missão

Realize uma análise de acessibilidade baseada em WCAG 2.1:

### 1. Análise por Princípio WCAG

#### 1.1 Perceivable (Perceptível)
- Textos alternativos para imagens
- Legendas para vídeos e áudios
- Contraste de cores (mínimo 4.5:1)
- Redimensionamento de texto (até 200%)
- Conteúdo sem depender apenas de cor

#### 1.2 Operable (Operável)
- Navegação por teclado
- Tempo suficiente para leitura
- Sem elementos que causem convulsões (flashing)
- Skip links para conteúdo principal
- Títulos e labels claros

#### 1.3 Understandable (Compreensível)
- Texto legível e compreensível
- Comportamento previsível
- Ajuda na correção de erros
- Labels em formulários

#### 1.4 Robust (Robusto)
- Compatibilidade com tecnologias assistivas
- HTML semântico
- ARIA roles quando necessário

### 2. Checklist de Problemas

Para cada problema encontrado:

| Critério WCAG | Severidade | Elemento | Problema | Solução |
|---------------|------------|----------|----------|---------|
| [Ex: 1.1.1] | [A/AA/AAA] | [Elemento] | [Descrição] | [Como corrigir] |

### 3. Navegação por Teclado

- Tab order está lógico?
- Focus visible em todos os elementos?
- Todos os controles são acessíveis?
- Modais capturam foco corretamente?
- Atalhos de teclado documentados?

### 4. Screen Reader

- Headings hierárquicos (h1 > h2 > h3)?
- Landmarks definidos (main, nav, aside)?
- Live regions para conteúdo dinâmico?
- Formulários com labels associados?
- Tabelas com headers definidos?

### 5. Contraste e Cores

- Texto normal: 4.5:1 mínimo
- Texto grande: 3:1 mínimo
- Componentes UI: 3:1 mínimo
- Não depende apenas de cor

### 6. Formulários

- Todos os inputs têm labels
- Erros claramente identificados
- Instruções antes do campo
- Campos obrigatórios indicados
- Mensagens de erro associadas ao campo

### 7. Código Corrigido

Forneça exemplos de código corrigido para os principais problemas:

**Antes:**
```html
[Código com problema]
```

**Depois:**
```html
[Código corrigido com comentários]
```

### 8. Ferramentas de Teste

Recomende ferramentas para testar:
- Automatizadas (axe, WAVE, Lighthouse)
- Manuais (VoiceOver, NVDA, JAWS)
- Simuladores de daltonismo
```

---

## Exemplo de Uso

```text
Atue como especialista em acessibilidade digital (WCAG).

## Contexto

Tipo de aplicação: Web app
Framework: React + Next.js
Público-alvo: Clientes de salão de beleza, incluindo idosos

## Código a Analisar

```jsx
function AgendamentoForm() {
  return (
    <div>
      <div style={{color: '#999', background: '#fff'}}>
        <img src="/calendar.png" />
        <input type="text" placeholder="Seu nome" />
        <input type="tel" placeholder="Telefone" />
        <select>
          <option>Selecione um serviço</option>
          <option>Corte</option>
          <option>Manicure</option>
        </select>
        <div onClick={() => submit()} style={{background: 'red', color: 'white'}}>
          Agendar
        </div>
      </div>
    </div>
  );
}
```
```

---

## Resposta Esperada

### Problemas Identificados

| Critério | Severidade | Elemento | Problema | Solução |
|----------|------------|----------|----------|---------|
| 1.1.1 | A | img | Sem alt text | Adicionar alt="Ícone de calendário" |
| 1.4.3 | AA | texto | Contraste #999 no branco = 2.8:1 | Usar #666 ou mais escuro |
| 2.1.1 | A | div botão | Não acessível por teclado | Trocar por `<button>` |
| 1.3.1 | A | form | Inputs sem labels | Adicionar `<label>` |
| 4.1.2 | A | select | Sem identificação | Adicionar label/aria-label |

### Código Corrigido

```jsx
function AgendamentoForm() {
  return (
    <form 
      role="form" 
      aria-labelledby="form-title"
      onSubmit={handleSubmit}
    >
      <h2 id="form-title">Agendar horário</h2>
      
      {/* Imagem com alt text descritivo */}
      <img src="/calendar.png" alt="Ícone de calendário" />
      
      {/* Inputs com labels associados */}
      <div>
        <label htmlFor="nome">Seu nome</label>
        <input 
          type="text" 
          id="nome"
          name="nome"
          required
          aria-required="true"
        />
      </div>
      
      <div>
        <label htmlFor="telefone">Telefone</label>
        <input 
          type="tel" 
          id="telefone"
          name="telefone"
          required
          aria-required="true"
        />
      </div>
      
      <div>
        <label htmlFor="servico">Serviço</label>
        <select id="servico" name="servico" required>
          <option value="">Selecione um serviço</option>
          <option value="corte">Corte</option>
          <option value="manicure">Manicure</option>
        </select>
      </div>
      
      {/* Botão real em vez de div clicável */}
      <button 
        type="submit"
        style={{background: '#c00', color: 'white'}}
      >
        Agendar
      </button>
    </form>
  );
}
```

---

## Checklist Pós-Geração

- [ ] Todas as imagens têm alt text
- [ ] Contraste mínimo 4.5:1 verificado
- [ ] Navegação por teclado funciona
- [ ] Todos os inputs têm labels
- [ ] Headings hierárquicos
- [ ] Landmarks semânticos definidos
- [ ] Botões usam elemento correto
- [ ] Focus visible em todos os elementos
- [ ] Testado com screen reader
- [ ] Salvar em `docs/11-acessibilidade/analise-acessibilidade.md`
