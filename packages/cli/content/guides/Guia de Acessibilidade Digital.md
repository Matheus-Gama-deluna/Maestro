# Guia de Acessibilidade Digital

## Objetivo

Este guia fornece uma abordagem completa para implementação de acessibilidade digital em produtos digitais, garantindo que pessoas com deficiências possam acessar e utilizar sistemas web e mobile de forma equivalente.

## Contexto

O especialista em **Acessibilidade Digital** é responsável por garantir que produtos digitais sigam os padrões internacionais de acessibilidade, como as WCAG (Web Content Accessibility Guidelines), e que sejam utilizáveis por todas as pessoas, independentemente de suas capacidades físicas, sensoriais ou cognitivas.

## Metodologia

### 1. Fundamentos de Acessibilidade

#### 1.1. Princípios das WCAG 2.1
As WCAG são organizadas em 4 princípios fundamentais:

**PERCEBÍVEL (Perceivable)**
- Informações e componentes da interface devem ser apresentados de formas que todos os usuários possam perceber.

**OPERÁVEL (Operable)**
- Componentes da interface e navegação devem ser operáveis por todos os usuários.

**COMPREENSÍVEL (Understandable)**
- Informações e operações da interface devem ser compreensíveis.

**ROBUSTO (Robust)**
- Conteúdo deve ser robusto o suficiente para ser interpretado por diversas tecnologias assistivas.

#### 1.2. Níveis de Conformidade
- **Nível A**: Mínimo essencial de acessibilidade
- **Nível AA**: Padrão recomendado para maioria dos sites
- **Nível AAA**: Nível mais alto de acessibilidade (não aplicável a todo conteúdo)

### 2. Análise e Auditoria

#### 2.1. Ferramentas de Avaliação
```javascript
// Exemplo de configuração de axe-core para testes automatizados
const axe = require('axe-core');

// Configuração de regras para auditoria
const axeConfig = {
  rules: {
    // Regras WCAG 2.1 Nível AA
    'color-contrast': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'aria-labels': { enabled: true },
    'focus-management': { enabled: true },
    'heading-order': { enabled: true },
    'landmark-roles': { enabled: true },
    'skip-link': { enabled: true },
    'alt-text': { enabled: true }
  }
};

// Função de auditoria
async function runAccessibilityAudit() {
  const results = await axe.run(document, axeConfig);
  
  return {
    violations: results.violations,
    passes: results.passes,
    incomplete: results.incomplete,
    score: calculateAccessibilityScore(results)
  };
}

function calculateAccessibilityScore(results) {
  const totalTests = results.violations.length + results.passes.length;
  const passedTests = results.passes.length;
  return Math.round((passedTests / totalTests) * 100);
}
```

#### 2.2. Checklist de Auditoria Manual
```markdown
## Checklist de Acessibilidade WCAG 2.1 AA

### Perceptível
#### 1.1 Alternativas em Texto
- [ ] Todas as imagens têm alt text descritivo
- [ ] Imagens decorativas têm alt=""
- [ ] Gráficos e diagramas têm descrições detalhadas
- [ ] Vídeos têm legendas e transcrições

#### 1.2 Mídia Baseada em Tempo
- [ ] Vídeos têm legendas sincronizadas
- [ ] Áudio tem transcrição disponível
- [ ] Controles de mídia são acessíveis por teclado
- [ ] Não há conteúdo piscante (>3Hz)

#### 1.3 Adaptável
- [ ] Informações não são transmitidas apenas por cor
- [ ] Contraste de texto atende 4.5:1 (texto normal)
- [ ] Contraste de texto atende 3:1 (texto grande)
- [ ] Contraste de componentes não textuais atende 3:1
- [ ] Texto pode ser redimensionado até 200% sem perda de funcionalidade

#### 1.4 Distinguível
- [ ] Foco visível claro em todos elementos interativos
- [ ] Não há conteúdo que cause convulsões
- [ ] Múltiplas formas de navegação disponíveis

### Operável
#### 2.1 Acessível por Teclado
- [ ] Todos elementos interativos são acessíveis por teclado
- [ ] Não há armadilhas de foco (keyboard traps)
- [ ] Ordem de tabulação lógica e previsível
- [ ] Atalhos de teclado documentados

#### 2.2 Tempo Suficiente
- [ ] Usuários podem controlar timeouts
- [ ] Conteúdo em movimento pode ser pausado
- [ ] Não há limite de tempo para sessões críticas

#### 2.3 Convulsões e Reações Físicas
- [ ] Não há conteúdo piscante perigoso
- [ ] Componentes animados podem ser desativados

#### 2.4 Navegável
- [ ] Skip links implementados
- [ ] Títulos de página descritivos
- [ ] Ordem lógica de headings (h1, h2, h3...)
- [ ] Landmarks ARIA implementados
- [ ] Links contextuais e descritivos

### Compreensível
#### 3.1 Legível
- [ ] Idioma da página especificado
- [ ] Mudanças de idioma marcadas
- [ ] Texto pode ser lido por screen readers
- [ ] Pronúncia correta de palavras

#### 3.2 Previsível
- [ ] Comportamento consistente de componentes
- [ ] Navegação consistente no site
- [ ] Mudanças de contexto são iniciadas pelo usuário
- [ ] Identificação consistente de componentes

#### 3.3 Assistência de Entrada
- [ ] Ajuda contextual disponível
- [ ] Erros de validação claramente identificados
- [ ] Sugestões de correção para erros
- [ ] Confirmação antes de ações irreversíveis

### Robusto
#### 4.1 Compatível
- [ ] HTML semântico válido
- [ ] ARIA usada corretamente
- [ ] Tecnologias assistivas suportadas
- [ ] Compatibilidade cross-browser
```

### 3. Implementação Técnica

#### 3.1. HTML Semântico
```html
<!-- Exemplo de estrutura semântica acessível -->
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Título Descritivo da Página</title>
</head>
<body>
  <!-- Skip Link -->
  <a href="#main-content" class="skip-link">Pular para conteúdo principal</a>
  
  <!-- Header com landmark -->
  <header role="banner">
    <nav aria-label="Navegação principal">
      <ul>
        <li><a href="/" aria-current="page">Início</a></li>
        <li><a href="/sobre">Sobre</a></li>
        <li><a href="/contato">Contato</a></li>
      </ul>
    </nav>
  </header>
  
  <!-- Main content -->
  <main id="main-content" role="main">
    <h1>Título Principal da Página</h1>
    
    <section aria-labelledby="section-title">
      <h2 id="section-title">Título da Seção</h2>
      
      <!-- Imagem com alt text descritivo -->
      <img src="produto.jpg" 
           alt="Smartphone modelo X com tela de 6.5 polegadas na cor preta" 
           width="300" 
           height="200">
      
      <!-- Formulário acessível -->
      <form aria-labelledby="form-title">
        <h3 id="form-title">Formulário de Contato</h3>
        
        <div class="form-group">
          <label for="nome">Nome completo *</label>
          <input type="text" 
                 id="nome" 
                 name="nome" 
                 required 
                 aria-describedby="nome-help"
                 aria-invalid="false">
          <div id="nome-help" class="help-text">
            Digite seu nome completo como aparece no documento
          </div>
        </div>
        
        <div class="form-group">
          <label for="email">E-mail *</label>
          <input type="email" 
                 id="email" 
                 name="email" 
                 required 
                 aria-describedby="email-help email-error"
                 aria-invalid="false">
          <div id="email-help" class="help-text">
            Exemplo: nome@exemplo.com
          </div>
          <div id="email-error" class="error-message" role="alert" hidden>
            Por favor, digite um e-mail válido
          </div>
        </div>
        
        <fieldset>
          <legend>Tipo de mensagem</legend>
          <div class="radio-group">
            <input type="radio" id="duvida" name="tipo" value="duvida">
            <label for="duvida">Dúvida</label>
          </div>
          <div class="radio-group">
            <input type="radio" id="sugestao" name="tipo" value="sugestao">
            <label for="sugestao">Sugestão</label>
          </div>
          <div class="radio-group">
            <input type="radio" id="reclamacao" name="tipo" value="reclamacao">
            <label for="reclamacao">Reclamação</label>
          </div>
        </fieldset>
        
        <button type="submit" aria-describedby="submit-help">
          Enviar mensagem
        </button>
        <div id="submit-help" class="help-text">
          Após o envio, você receberá uma confirmação por e-mail
        </div>
      </form>
    </section>
  </main>
  
  <!-- Footer -->
  <footer role="contentinfo">
    <p>&copy; 2024 Nome da Empresa. Todos os direitos reservados.</p>
    <nav aria-label="Navegação rodapé">
      <ul>
        <li><a href="/privacidade">Política de Privacidade</a></li>
        <li><a href="/termos">Termos de Uso</a></li>
        <li><a href="/acessibilidade">Acessibilidade</a></li>
      </ul>
    </nav>
  </footer>
</body>
</html>
```

#### 3.2. CSS para Acessibilidade
```css
/* Estilos para foco visível */
:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* Skip link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}

/* Contraste de cores */
.text-high-contrast {
  color: #000000; /* Preto puro para máximo contraste */
}

.bg-high-contrast {
  background-color: #ffffff; /* Branco puro para máximo contraste */
}

/* Estados de foco e hover */
button:focus,
input:focus,
textarea:focus,
select:focus,
a:focus {
  outline: 3px solid #0066cc;
  outline-offset: 2px;
}

/* Redução de movimento */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Modo escuro */
@media (prefers-color-scheme: dark) {
  body {
    background-color: #121212;
    color: #ffffff;
  }
  
  .text-high-contrast {
    color: #ffffff;
  }
  
  .bg-high-contrast {
    background-color: #000000;
  }
}

/* Zoom até 200% */
@media (max-width: 1280px) {
  .container {
    max-width: 100%;
    padding: 0 20px;
  }
}

/* Tamanho mínimo de toque (44x44px) */
button,
input[type="submit"],
input[type="button"],
a {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
}

/* Texto redimensionável */
.resizable-text {
  font-size: clamp(16px, 2vw, 24px);
  line-height: 1.5;
}
```

### 4. Testes e Validação

#### 4.1. Testes Automatizados
```javascript
// Testes automatizados com axe-core
describe('Acessibilidade', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Deve passar na auditoria de acessibilidade', () => {
    cy.injectAxe();
    cy.checkA11y();
  });

  it('Deve ter contraste suficiente', () => {
    cy.injectAxe();
    cy.checkA11y(null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    });
  });

  it('Deve ser navegável por teclado', () => {
    cy.get('body').tab();
    cy.focused().should('be.visible');
    
    for (let i = 0; i < 10; i++) {
      cy.focused().tab();
      cy.focused().should('be.visible');
    }
  });
});
```

#### 4.2. Testes Manuais
- **Screen Readers**: NVDA, JAWS, VoiceOver
- **Teclado**: Navegação completa sem mouse
- **Zoom**: Teste com 200% de zoom
- **Contraste**: Verificar com ferramentas de contraste
- **Cores**: Testar em modo escala de cinza

## Templates e Exemplos

### Template de Relatório de Acessibilidade
```markdown
# Relatório de Auditoria de Acessibilidade
**Data**: [Data da Auditoria]
**Sistema**: [Nome do Sistema]
**URL**: [URL do Sistema]
**Nível WCAG**: [AA/AAA]

## Resumo Executivo
- **Score Geral**: [X]%
- **Violações Críticas**: [X]
- **Violações Menores**: [X]
- **Recomendações Principais**: [X]

## Métricas de Conformidade
| Critério | Status | Severidade | Descrição |
|----------|--------|------------|-----------|
| [Critério 1] | [Passou/Falhou] | [Crítica/Menor] | [Descrição] |
| [Critério 2] | [Passou/Falhou] | [Crítica/Menor] | [Descrição] |

## Violações Encontradas
### Críticas
1. **[Nome da Violação]**
   - **Descrição**: [Descrição detalhada]
   - **Impacto**: [Impacto no usuário]
   - **Localização**: [URL/Elemento]
   - **Recomendação**: [Como corrigir]

### Menores
1. **[Nome da Violação]**
   - **Descrição**: [Descrição detalhada]
   - **Impacto**: [Impacto no usuário]
   - **Localização**: [URL/Elemento]
   - **Recomendação**: [Como corrigir]

## Plano de Ação
### Imediato (1-2 semanas)
- [ ] [Ação 1]
- [ ] [Ação 2]
- [ ] [Ação 3]

### Curto Prazo (1 mês)
- [ ] [Ação 1]
- [ ] [Ação 2]
- [ ] [Ação 3]

### Longo Prazo (3 meses)
- [ ] [Ação 1]
- [ ] [Ação 2]
- [ ] [Ação 3]

## Recursos Necessários
- **Desenvolvedores**: [X] pessoas
- **Designers**: [X] pessoas
- **Testadores**: [X] pessoas
- **Orçamento Estimado**: [R$ X]

## Próximos Passos
1. Priorizar violações críticas
2. Implementar correções
3. Realizar testes com usuários
4. Nova auditoria de verificação
```

## Melhores Práticas

### 1. Design Inclusivo
- Envolva pessoas com deficiências no processo de design
- Teste com tecnologias assistivas reais
- Considere diferentes cenários de uso

### 2. Desenvolvimento
- Use HTML semântico corretamente
- Implemente ARIA de forma apropriada
- Garanta navegação por teclado completa
- Teste contraste de cores

### 3. Testes
- Automatize testes de acessibilidade
- Realize testes manuais com screen readers
- Teste com usuários reais com deficiências
- Verifique em diferentes dispositivos

### 4. Manutenção
- Monitore acessibilidade continuamente
- Treine equipe em acessibilidade
- Documente padrões e diretrizes
- Estabeleça processos de revisão

## Ferramentas e Recursos

### Ferramentas de Teste
- **axe-core**: Biblioteca de testes automatizados
- **WAVE**: Ferramenta de avaliação online
- **Colour Contrast Analyser**: Verificador de contraste
- **Screen Readers**: NVDA, JAWS, VoiceOver

### Frameworks e Bibliotecas
- **React Aria**: Componentes acessíveis para React
- **Vue Aria**: Componentes acessíveis para Vue
- **Bootstrap**: Framework com boa acessibilidade
- **Material-UI**: Componentes com acessibilidade integrada

### Recursos de Aprendizado
- **WCAG 2.1**: Diretrizes oficiais
- **A11y Project**: Recursos e guias práticos
- **WebAIM**: Artigos e tutoriais
- **MDN Web Accessibility**: Documentação técnica

## Checklist de Validação

### Planejamento
- [ ] Requisitos de acessibilidade definidos
- [ ] Padrão WCAG estabelecido (AA recomendado)
- [ ] Tecnologias assistivas identificadas
- [ ] Equipe treinada em acessibilidade

### Design
- [ ] Contraste de cores validado
- [ ] Tamanho de texto adequado
- [ ] Espaçamento suficiente
- [ ] Estados de foco desenhados

### Desenvolvimento
- [ ] HTML semântico implementado
- [ ] ARIA usado corretamente
- [ ] Navegação por teclado funcional
- [ ] Formulários acessíveis

### Testes
- [ ] Testes automatizados configurados
- [ ] Testes manuais realizados
- [ ] Screen readers testados
- [ ] Diferentes navegadores verificados

### Lançamento
- [ ] Documentação atualizada
- [ ] Política de acessibilidade publicada
- [ ] Canal de feedback estabelecido
- [ ] Monitoramento contínuo configurado

## Conclusão

A acessibilidade digital não é um recurso opcional, mas um direito fundamental. Implementar acessibilidade melhora a experiência para todos os usuários, expande o alcance do produto e demonstra compromisso com inclusão.

Lembre-se que acessibilidade é um processo contínuo de melhoria. Comece com o básico, valide com usuários reais e evolua gradualmente para níveis mais altos de conformidade.

---

**Próximos Passos Recomendados:**
1. Realizar auditoria inicial de acessibilidade
2. Priorizar correções críticas
3. Estabelecer processo de desenvolvimento acessível
4. Treinar equipe continuamente
5. Monitorar e melhorar continuamente
