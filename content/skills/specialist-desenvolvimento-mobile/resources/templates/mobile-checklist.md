# Mobile Development Quality Checklist

## 📱 Checklist de Qualidade Mobile

**Projeto:** [Nome do Projeto]  
**Versão:** [Versão do App]  
**Data:** [Data da Verificação]  
**Responsável:** [Nome]

---

## 🎨 UI/UX (20 pontos)

### Design System (5 pontos)
- [ ] (1pt) Componentes seguem design system definido
- [ ] (1pt) Cores consistentes em todo o app
- [ ] (1pt) Tipografia padronizada
- [ ] (1pt) Espaçamentos seguem grid system
- [ ] (1pt) Ícones consistentes e apropriados

### Platform Guidelines (5 pontos)
- [ ] (2pt) iOS: Segue Human Interface Guidelines
- [ ] (2pt) Android: Segue Material Design 3
- [ ] (1pt) Navegação apropriada para cada plataforma

### Responsividade (5 pontos)
- [ ] (2pt) Funciona em diferentes tamanhos de tela
- [ ] (1pt) Orientação portrait funciona
- [ ] (1pt) Orientação landscape funciona (se aplicável)
- [ ] (1pt) Tablets suportados (se aplicável)

### Estados da UI (5 pontos)
- [ ] (1pt) Loading states implementados
- [ ] (1pt) Empty states implementados
- [ ] (1pt) Error states implementados
- [ ] (1pt) Success states implementados
- [ ] (1pt) Offline states implementados

---

## ⚡ Performance (20 pontos)

### Tempo de Resposta (8 pontos)
- [ ] (2pt) App inicia em < 3 segundos
- [ ] (2pt) Navegação entre telas < 300ms
- [ ] (2pt) Interações respondem em < 100ms
- [ ] (2pt) Animações a 60 FPS

### Otimizações (6 pontos)
- [ ] (2pt) Imagens otimizadas e com lazy loading
- [ ] (2pt) Listas longas virtualizadas
- [ ] (1pt) Componentes memoizados quando apropriado
- [ ] (1pt) Debounce/throttle em inputs

### Memória (6 pontos)
- [ ] (2pt) Consumo de memória < 150MB em uso normal
- [ ] (2pt) Sem memory leaks detectados
- [ ] (2pt) Recursos liberados corretamente

---

## 🔌 Funcionalidade (15 pontos)

### Features Core (8 pontos)
- [ ] (2pt) Todas as features principais implementadas
- [ ] (2pt) Navegação funciona corretamente
- [ ] (2pt) Integração com backend funcional
- [ ] (2pt) Autenticação/autorização funciona

### Recursos Nativos (7 pontos)
- [ ] (1pt) Câmera funciona (se aplicável)
- [ ] (1pt) Galeria funciona (se aplicável)
- [ ] (1pt) Geolocalização funciona (se aplicável)
- [ ] (1pt) Notificações push funcionam (se aplicável)
- [ ] (1pt) Armazenamento local funciona
- [ ] (1pt) Biometria funciona (se aplicável)
- [ ] (1pt) Deep linking funciona (se aplicável)

---

## 💾 Dados e Persistência (10 pontos)

### Armazenamento (5 pontos)
- [ ] (2pt) Dados persistidos corretamente
- [ ] (2pt) Dados sensíveis criptografados
- [ ] (1pt) Cache implementado adequadamente

### Sincronização (5 pontos)
- [ ] (2pt) Funciona offline
- [ ] (2pt) Sincronização ao reconectar funciona
- [ ] (1pt) Conflitos de dados resolvidos

---

## 🧪 Testes (15 pontos)

### Testes Automatizados (9 pontos)
- [ ] (3pt) Testes unitários implementados (cobertura > 70%)
- [ ] (3pt) Testes de integração implementados
- [ ] (3pt) Testes E2E implementados

### Testes Manuais (6 pontos)
- [ ] (2pt) Testado em iPhone [modelo] - iOS [versão]
- [ ] (2pt) Testado em Android [modelo] - Android [versão]
- [ ] (2pt) Testado em diferentes tamanhos de tela

---

## 🔐 Segurança (10 pontos)

### Proteção de Dados (5 pontos)
- [ ] (2pt) Tokens armazenados com segurança
- [ ] (2pt) Dados sensíveis criptografados
- [ ] (1pt) Comunicação via HTTPS

### Validações (5 pontos)
- [ ] (2pt) Validação de inputs implementada
- [ ] (2pt) Proteção contra ataques comuns
- [ ] (1pt) SSL pinning (se necessário)

---

## ♿ Acessibilidade (10 pontos)

### Screen Readers (5 pontos)
- [ ] (2pt) iOS VoiceOver funciona
- [ ] (2pt) Android TalkBack funciona
- [ ] (1pt) Labels descritivos em todos os elementos

### Visual (5 pontos)
- [ ] (2pt) Contraste mínimo 4.5:1
- [ ] (2pt) Tamanhos de toque mínimos (44pt/48dp)
- [ ] (1pt) Suporte a tamanhos de fonte dinâmicos

---

## 📦 Build e Deploy (10 pontos)

### Configuração (5 pontos)
- [ ] (1pt) Ícones configurados
- [ ] (1pt) Splash screens configurados
- [ ] (1pt) Metadata preparada
- [ ] (1pt) Screenshots preparados
- [ ] (1pt) Políticas de privacidade incluídas

### Builds (5 pontos)
- [ ] (2pt) Build de produção iOS gerado
- [ ] (2pt) Build de produção Android gerado
- [ ] (1pt) CI/CD configurado

---

## 📊 Score Final

### Cálculo
- **UI/UX:** [X]/20 pontos
- **Performance:** [X]/20 pontos
- **Funcionalidade:** [X]/15 pontos
- **Dados:** [X]/10 pontos
- **Testes:** [X]/15 pontos
- **Segurança:** [X]/10 pontos
- **Acessibilidade:** [X]/10 pontos
- **Build/Deploy:** [X]/10 pontos

### **TOTAL: [X]/100 pontos**

---

## 🎯 Critérios de Aprovação

### Score Mínimo: 80 pontos

| Score | Status | Ação |
|-------|--------|------|
| 90-100 | ✅ Excelente | Pronto para produção |
| 80-89 | ✅ Bom | Pronto com pequenos ajustes |
| 70-79 | ⚠️ Regular | Requer melhorias antes de produção |
| < 70 | ❌ Insuficiente | Bloqueado - requer correções |

---

## 📋 Itens Críticos (Bloqueadores)

### Bloqueadores Identificados
- [ ] [Item 1]
- [ ] [Item 2]
- [ ] [Item 3]

### Plano de Ação
1. [Ação para resolver bloqueador 1]
2. [Ação para resolver bloqueador 2]
3. [Ação para resolver bloqueador 3]

---

## 🐛 Issues Conhecidos

### Issues Não-Bloqueadores
| ID | Descrição | Severidade | Plano |
|----|-----------|------------|-------|
| 1 | [Descrição] | [ ] Alta [ ] Média [ ] Baixa | [Quando resolver] |
| 2 | [Descrição] | [ ] Alta [ ] Média [ ] Baixa | [Quando resolver] |

---

## 📈 Métricas Coletadas

### Performance
- **Tempo de inicialização:** [X]ms
- **Tempo de navegação:** [X]ms
- **FPS médio:** [X] FPS
- **Consumo de memória:** [X]MB
- **Tamanho do bundle:** [X]MB

### Qualidade
- **Cobertura de testes:** [X]%
- **Crash rate:** [X]%
- **ANR rate:** [X]%

---

## ✅ Aprovações

### Checklist Aprovado Por:
- [ ] **Desenvolvedor:** _________________ Data: _______
- [ ] **QA:** _________________ Data: _______
- [ ] **Tech Lead:** _________________ Data: _______
- [ ] **Product Manager:** _________________ Data: _______

---

## 📝 Notas Adicionais

[Observações, contexto adicional, decisões tomadas, etc.]

---

**Versão do Checklist:** 2.0  
**Última Atualização:** 31/01/2026
