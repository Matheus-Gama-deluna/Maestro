# 📚 Guia Completo WCAG 2.1 AA

## 🎯 Visão Geral

Este guia aborda as Diretrizes de Acessibilidade para Conteúdo Web 2.1 Nível AA, fornecendo implementações práticas, exemplos de código e melhores práticas para garantir que seu site seja acessível a todos os usuários, incluindo pessoas com deficiências.

### O que é WCAG 2.1?

As WCAG (Web Content Accessibility Guidelines) são recomendações internacionais que tornam o conteúdo web mais acessível para pessoas com deficiências. Elas abrangem uma ampla gama de recomendações para tornar o conteúdo mais acessível.

### Estrutura das WCAG 2.1

As diretrizes são organizadas em 4 princípios fundamentais:

1. **Perceptível (Perceivable)** - Informações e componentes da interface do usuário devem ser apresentadas de formas que os usuários possam perceber.
2. **Operável (Operable)** - Componentes da interface e navegação devem ser operáveis.
3. **Compreensível (Understandable)** - Informações e operações da interface do usuário devem ser compreensíveis.
4. **Robusto (Robust)** - O conteúdo deve ser robusto o suficiente para ser interpretado de forma confiável por uma ampla variedade de agentes de usuário, incluindo tecnologias assistivas.

---

## 🔍 Princípio 1: Perceptível (Perceivable)

### 1.1 Alternativas em Texto

#### 1.1.1 Conteúdo Não Textual

**Requisito:** Todo conteúdo não textual que é apresentado ao usuário tem uma alternativa em texto que atende ao mesmo propósito.

**Implementação:**
```html
<!-- ✅ BOM: Imagem informativa com alt descritivo -->
<img src="produto.jpg" alt="Smartphone Samsung Galaxy S21, cor preta, 128GB de armazenamento">

<!-- ✅ BOM: Imagem decorativa com alt vazio -->
<img src="decoracao.jpg" alt="">

<!-- ✅ BOM: Ícone com texto adjacente -->
<button aria-label="Configurações">
  <svg aria-hidden="true">
    <path d="M10 12a2 2 0 100 4 2 2 0 000-4z"/>
  </svg>
  Configurações
</button>
```

#### 1.1.2 Legendas (Pré-gravado)

**Requisito:** Legendas são fornecidas para todo conteúdo de áudio pré-gravado em mídia sincronizada e todo conteúdo de vídeo pré-gravado.

**Implementação:**
```html
<video controls>
  <source src="video.mp4" type="video/mp4">
  <track kind="subtitles" src="legendas.vtt" srclang="pt" label="Português">
</video>
```

### 1.2 Adaptável

#### 1.2.1 Informações e Relacionamentos

**Requisito:** Informações, estrutura e relacionamentos transmitidos através de apresentação podem ser programaticamente determinadas.

**Implementação:**
```html
<header>
  <nav aria-label="Navegação principal">
    <ul>
      <li><a href="/">Início</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>Título Principal</h1>
  </article>
</main>
```

### 1.3 Distinguível

#### 1.3.1 Uso de Cor

**Requisito:** Cor não é usado como o único meio visual de transmitir informações.

**Implementação:**
```html
<!-- ✅ BOM: Texto + cor -->
<button class="btn-danger">
  <span class="icon">⚠️</span>
  <span class="text">Excluir</span>
</button>

<style>
.btn-primary {
  background-color: #0066cc;
  color: #ffffff; /* 8.59:1 contraste ✅ */
}
```

#### 1.3.3 Contraste (Mínimo)

**Requisito:** A apresentação visual de texto e imagens de texto tem uma taxa de contraste de pelo menos 4.5:1.

**Implementação:**
```css
.text-primary {
  color: #333333; /* Contra fundo branco */
  background-color: #ffffff;
}

.btn-primary {
  background-color: #0066cc;
  color: #ffffff; /* 8.59:1 contraste ✅ */
}
```

---

## ⌨️ Princípio 2: Operável (Operable)

### 2.1 Acessível por Teclado

#### 2.1.1 Teclado

**Requisito:** Toda funcionalidade do conteúdo é operável através de uma interface de teclado.

**Implementação:**
```html
<button onclick="handleClick()">Clique aqui</button>
<a href="/pagina">Link</a>
<input type="text" placeholder="Digite aqui">
```

#### 2.1.2 Sem Foco do Teclado

**Requisito:** O foco do teclado pode ser removido de um componente interativo.

**Implementação:**
```css
button:focus,
input:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
```

### 2.2 Tempo Suficiente

#### 2.2.1 Ajuste de Tempo

**Requisito:** Para cada limite de tempo, o usuário é avisado antes de expirar e pode estender o tempo.

**Implementação:**
```html
<div id="timeout-warning" style="display: none;">
  <p>Sua sessão expirará em <span id="countdown">60</span> segundos.</p>
  <button onclick="extendSession()">Estender sessão</button>
</div>
```

### 2.3 Navegação

#### 2.4.1 Ignorar Blocos

**Requisito:** Um mecanismo está disponível para ignorar blocos de conteúdo repetidos.

**Implementação:**
```html
<a href="#main-content" class="skip-link">
  Pular para o conteúdo principal
</a>
```

---

## 🧠 Princípio 3: Compreensível (Understandable)

### 3.1 Legível

#### 3.1.1 Idioma da Página

**Requisito:** O idioma programático de cada página pode ser programaticamente determinado.

**Implementação:**
```html
<html lang="pt-BR">
<head>
  <title>Página em Português</title>
</head>
```

### 3.2 Previsível

#### 3.2.1 Foco

**Requisito:** Quando qualquer componente recebe foco, ele não inicia uma mudança de contexto.

**Implementação:**
```html
<button onclick="showModal()">Abrir Modal</button>
<div id="modal" style="display: none;">
  <h2>Modal</h2>
  <button onclick="closeModal()">Fechar</button>
</div>
```

#### 3.2.2 Entrada do Usuário

**Requisito:** Ajuda do usuário para evitar e corrigir erros é fornecida quando apropriado.

**Implementação:**
```html
<form>
  <label for="email">Email:</label>
  <input 
    type="email" 
    id="email"
    aria-describedby="email-help email-error"
    required
  >
  <small id="email-help">Digite um email válido</small>
  <div id="email-error" class="error-message" role="alert"></div>
</form>
```

### 3.3 Assistência

#### 3.3.1 Identificação de Erros

**Requisito:** Se um erro de entrada for detectado automaticamente, o item é identificado e o erro é descrito ao usuário em texto.

**Implementação:**
```html
<input 
  type="email" 
  id="email"
  aria-describedby="email-error"
  aria-invalid="false"
>
<div id="email-error" class="error-message" role="alert">
  Email inválido. Verifique o formato.
</div>
```

#### 3.3.2 Rótulos ou Instruções

**Requisito:** Rótulos ou instruções são fornecidos quando o conteúdo requer entrada do usuário.

**Implementação:**
```html
<form>
  <fieldset>
    <legend>Informações Pessoais</legend>
    <label for="name">Nome Completo</label>
    <input type="text" id="name" required>
  </fieldset>
</form>
```

---

## 🔧 Princípio 4: Robusto (Robust)

### 4.1 Compatível

#### 4.1.1 Análise de Marcação

**Requisito:** O conteúdo é criado usando tecnologias de marcação que têm regras de análise gramatical.

**Implementação:**
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Título da Página</title>
</head>
<body>
  <header>
    <nav>
      <ul>
        <li><a href="/">Início</a></li>
      </ul>
    </nav>
  </header>
  <main>
    <article>
      <h1>Título Principal</h1>
    </article>
  </main>
</body>
</html>
```

#### 4.1.2 Nome, Função, Valor

**Requisito:** Para todos os componentes, o nome e a função podem ser programaticamente determinados.

**Implementação:**
```html
<button 
  id="submit-btn"
  name="submit"
  value="Enviar"
  aria-label="Enviar formulário"
>
</button>

<div 
  role="button"
  tabindex="0"
  aria-label="Botão customizado"
  aria-pressed="false"
>
  Botão Toggle
</div>
```

---

## 🛠️ Ferramentas e Recursos

### Ferramentas de Validação

- **axe-core:** Biblioteca para testes automatizados
- **WAVE:** Ferramenta online de validação
- **Lighthouse:** Auditoria completa incluindo acessibilidade
- **Color Contrast Analyzer:** Verificação de contraste de cores

### Recursos de Aprendizado

- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **Understanding WCAG 2.1:** https://www.w3.org/WAI/WCAG21/understanding/
- **A11y Project:** https://www.a11yproject.com/
- **WebAIM:** https://webaim.org/

---

## 📊 Métricas e KPIs

### Métricas de Conformidade
- **Score WCAG:** Percentual de conformidade com WCAG 2.1
- **Issues por Severidade:** Número de issues críticas, moderadas, leves
- **Cobertura de Testes:** Percentual de elementos testados
- **Tempo de Correção:** Tempo médio para corrigir issues

### KPIs de Negócio
- **Taxa de Conversão:** Taxa de conversão por usuários com deficiências
- **Engajamento:** Tempo de sessão e páginas visitadas
- **Satisfação:** Pesquisas de satisfação com acessibilidade

---

**Última atualização:** 30/01/2026  
**Versão:** v1.0  
**Próxima revisão:** 30/04/2026