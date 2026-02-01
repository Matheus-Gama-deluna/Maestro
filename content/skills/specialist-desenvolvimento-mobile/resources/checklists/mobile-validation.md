# Mobile Development Validation Checklist

## 📋 Checklist Automatizado de Validação Mobile

**Score Mínimo:** 80/100 pontos  
**Versão:** 2.0.0  
**Data:** 31/01/2026

---

## 🎨 UI/UX Mobile (20 pontos)

### Design System (5 pontos)
- [ ] **(1pt)** Componentes seguem design system definido
- [ ] **(1pt)** Cores consistentes em todo o app (primary, secondary, accent)
- [ ] **(1pt)** Tipografia padronizada (headings, body, captions)
- [ ] **(1pt)** Espaçamentos seguem grid system (4dp/8dp ou 8pt)
- [ ] **(1pt)** Ícones consistentes e apropriados para cada plataforma

### Platform Guidelines (5 pontos)
- [ ] **(2pt)** **iOS:** Segue Human Interface Guidelines
  - Tab Bar no bottom para navegação principal
  - Navigation Bar no top com título centralizado
  - Swipe back gesture funciona
  - SF Pro font (ou system font)
  - Safe areas respeitadas (notch, home indicator)
- [ ] **(2pt)** **Android:** Segue Material Design 3
  - Bottom Navigation ou Navigation Drawer
  - Top App Bar com título à esquerda
  - FAB posicionado corretamente
  - Roboto font (ou system font)
  - Material ripple effects
- [ ] **(1pt)** Navegação apropriada para cada plataforma

### Responsividade (5 pontos)
- [ ] **(2pt)** Funciona em diferentes tamanhos de tela
  - Small phones (< 5")
  - Regular phones (5-6")
  - Large phones (> 6")
- [ ] **(1pt)** Orientação portrait funciona perfeitamente
- [ ] **(1pt)** Orientação landscape funciona (se aplicável)
- [ ] **(1pt)** Tablets suportados adequadamente (se aplicável)

### Estados da UI (5 pontos)
- [ ] **(1pt)** Loading states implementados (spinners, skeletons)
- [ ] **(1pt)** Empty states implementados (ilustração + mensagem + CTA)
- [ ] **(1pt)** Error states implementados (mensagem clara + retry)
- [ ] **(1pt)** Success states implementados (feedback visual)
- [ ] **(1pt)** Offline states implementados (banner + funcionalidade limitada)

---

## ⚡ Performance (20 pontos)

### Tempo de Resposta (8 pontos)
- [ ] **(2pt)** App inicia em < 3 segundos (cold start)
- [ ] **(2pt)** Navegação entre telas < 300ms
- [ ] **(2pt)** Interações do usuário respondem em < 100ms
- [ ] **(2pt)** Animações rodam a 60 FPS consistentemente

### Otimizações (6 pontos)
- [ ] **(2pt)** Imagens otimizadas e com lazy loading
  - Formato apropriado (WebP, AVIF quando possível)
  - Múltiplas resoluções (@1x, @2x, @3x)
  - Placeholder durante carregamento
- [ ] **(2pt)** Listas longas virtualizadas (FlatList, LazyColumn, etc.)
- [ ] **(1pt)** Componentes memoizados quando apropriado (React.memo, const)
- [ ] **(1pt)** Debounce/throttle implementado em inputs de busca

### Memória e Bundle (6 pontos)
- [ ] **(2pt)** Consumo de memória < 150MB em uso normal
- [ ] **(2pt)** Sem memory leaks detectados (profiling realizado)
- [ ] **(2pt)** Bundle size otimizado
  - iOS: < 50MB (sem assets)
  - Android: < 30MB (sem assets)

---

## 🔌 Funcionalidade (15 pontos)

### Features Core (8 pontos)
- [ ] **(2pt)** Todas as features principais implementadas conforme requisitos
- [ ] **(2pt)** Navegação funciona corretamente (deep linking, back navigation)
- [ ] **(2pt)** Integração com backend funcional (API calls, error handling)
- [ ] **(2pt)** Autenticação/autorização funciona (login, logout, token refresh)

### Recursos Nativos (7 pontos)
- [ ] **(1pt)** Câmera funciona (se aplicável) - permissões + captura
- [ ] **(1pt)** Galeria funciona (se aplicável) - seleção de fotos
- [ ] **(1pt)** Geolocalização funciona (se aplicável) - permissões + tracking
- [ ] **(1pt)** Notificações push funcionam (se aplicável) - FCM/APNS
- [ ] **(1pt)** Armazenamento local funciona (AsyncStorage, SQLite, etc.)
- [ ] **(1pt)** Biometria funciona (se aplicável) - Face ID/Touch ID/Fingerprint
- [ ] **(1pt)** Deep linking funciona (se aplicável) - URLs customizadas

---

## 💾 Dados e Persistência (10 pontos)

### Armazenamento (5 pontos)
- [ ] **(2pt)** Dados persistidos corretamente (sobrevivem a restart do app)
- [ ] **(2pt)** Dados sensíveis criptografados (tokens, senhas, PII)
  - iOS: Keychain
  - Android: EncryptedSharedPreferences
- [ ] **(1pt)** Cache implementado adequadamente (imagens, dados de API)

### Sincronização (5 pontos)
- [ ] **(2pt)** App funciona offline (funcionalidade básica disponível)
- [ ] **(2pt)** Sincronização ao reconectar funciona (queue de ações)
- [ ] **(1pt)** Conflitos de dados resolvidos (last-write-wins ou merge)

---

## 🧪 Testes (15 pontos)

### Testes Automatizados (9 pontos)
- [ ] **(3pt)** Testes unitários implementados
  - Cobertura > 70%
  - Lógica de negócio testada
  - Utils e helpers testados
- [ ] **(3pt)** Testes de integração implementados
  - Fluxos principais testados
  - Integração com API mockada
  - Navegação testada
- [ ] **(3pt)** Testes E2E implementados (Detox, Appium, Maestro)
  - Fluxo de login testado
  - Fluxo principal do app testado
  - Casos críticos cobertos

### Testes Manuais (6 pontos)
- [ ] **(2pt)** Testado em iPhone [modelo] - iOS [versão]
  - iPhone 12/13/14 (ou mais recente)
  - iOS 15+ (ou versão mínima suportada)
- [ ] **(2pt)** Testado em Android [modelo] - Android [versão]
  - Samsung/Pixel (ou dispositivo popular)
  - Android 10+ (ou versão mínima suportada)
- [ ] **(2pt)** Testado em diferentes tamanhos de tela
  - Small, medium, large phones
  - Tablets (se aplicável)

---

## 🔐 Segurança (10 pontos)

### Proteção de Dados (5 pontos)
- [ ] **(2pt)** Tokens armazenados com segurança
  - iOS: Keychain
  - Android: EncryptedSharedPreferences
  - Nunca em AsyncStorage/SharedPreferences plain
- [ ] **(2pt)** Dados sensíveis criptografados (PII, cartões, etc.)
- [ ] **(1pt)** Comunicação via HTTPS (sem HTTP plain)

### Validações e Proteções (5 pontos)
- [ ] **(2pt)** Validação de inputs implementada (client-side + server-side)
- [ ] **(2pt)** Proteção contra ataques comuns
  - SQL Injection (se usar SQLite)
  - XSS (se usar WebView)
  - CSRF (tokens em requests)
- [ ] **(1pt)** SSL pinning implementado (se necessário para app crítico)

---

## ♿ Acessibilidade (10 pontos)

### Screen Readers (5 pontos)
- [ ] **(2pt)** iOS VoiceOver funciona corretamente
  - accessibilityLabel em todos os elementos interativos
  - accessibilityHint quando necessário
  - accessibilityTraits corretos
- [ ] **(2pt)** Android TalkBack funciona corretamente
  - contentDescription em todos os elementos
  - Ordem de navegação lógica
  - Roles corretos (button, header, etc.)
- [ ] **(1pt)** Labels descritivos em todos os elementos (não "botão", "imagem")

### Visual e Interação (5 pontos)
- [ ] **(2pt)** Contraste mínimo 4.5:1 (WCAG AA)
  - Texto normal: 4.5:1
  - Texto grande: 3:1
  - Elementos interativos: 3:1
- [ ] **(2pt)** Tamanhos de toque mínimos respeitados
  - iOS: 44pt x 44pt
  - Android: 48dp x 48dp
- [ ] **(1pt)** Suporte a tamanhos de fonte dinâmicos
  - iOS: Dynamic Type
  - Android: SP units

---

## 📦 Build e Deploy (10 pontos)

### Configuração (5 pontos)
- [ ] **(1pt)** Ícones configurados (todos os tamanhos necessários)
  - iOS: App Icon Set completo
  - Android: mipmap em todas as densidades
- [ ] **(1pt)** Splash screens configurados (adaptados para cada plataforma)
- [ ] **(1pt)** Metadata preparada (nome, descrição, keywords)
- [ ] **(1pt)** Screenshots preparados (tamanhos corretos para stores)
- [ ] **(1pt)** Políticas de privacidade incluídas (obrigatório)

### Builds e CI/CD (5 pontos)
- [ ] **(2pt)** Build de produção iOS gerado e testado
  - Archive criado
  - Assinado com certificado de produção
  - Testado via TestFlight
- [ ] **(2pt)** Build de produção Android gerado e testado
  - AAB/APK gerado
  - Assinado com keystore de produção
  - Testado via Internal Testing
- [ ] **(1pt)** CI/CD configurado (GitHub Actions, Bitrise, etc.)
  - Build automático em PRs
  - Testes automáticos
  - Deploy automático para beta

---

## 📊 Score Final e Aprovação

### Cálculo do Score

| Categoria | Pontos Obtidos | Pontos Máximos |
|-----------|----------------|----------------|
| UI/UX Mobile | ___ | 20 |
| Performance | ___ | 20 |
| Funcionalidade | ___ | 15 |
| Dados e Persistência | ___ | 10 |
| Testes | ___ | 15 |
| Segurança | ___ | 10 |
| Acessibilidade | ___ | 10 |
| Build e Deploy | ___ | 10 |
| **TOTAL** | **___** | **100** |

### Critérios de Aprovação

| Score | Status | Ação Requerida |
|-------|--------|----------------|
| 90-100 | ✅ **Excelente** | Pronto para produção imediata |
| 80-89 | ✅ **Bom** | Pronto com pequenos ajustes opcionais |
| 70-79 | ⚠️ **Regular** | Requer melhorias antes de produção |
| 60-69 | ❌ **Insuficiente** | Bloqueado - correções obrigatórias |
| < 60 | ❌ **Crítico** | Bloqueado - revisão completa necessária |

### Score Mínimo para Aprovação: **80 pontos**

---

## 🚨 Bloqueadores Críticos

### Itens que Bloqueiam Produção (Independente do Score)

- [ ] Crashes frequentes (crash rate > 1%)
- [ ] ANRs frequentes (ANR rate > 0.5%)
- [ ] Vazamento de dados sensíveis
- [ ] Violação de políticas das stores
- [ ] Performance inaceitável (> 5s para iniciar)
- [ ] Funcionalidade core quebrada

**Se qualquer item acima estiver presente, o app está BLOQUEADO para produção.**

---

## 📝 Plano de Ação

### Itens Pendentes (Score < 80)

| Item | Categoria | Pontos Perdidos | Ação | Responsável | Prazo |
|------|-----------|-----------------|------|-------------|-------|
| [Exemplo] | Performance | 2 | Otimizar imagens | [Nome] | [Data] |
| | | | | | |

### Melhorias Futuras (Score >= 80)

| Item | Categoria | Prioridade | Descrição |
|------|-----------|------------|-----------|
| [Exemplo] | Acessibilidade | Baixa | Melhorar contraste em tela X |
| | | | |

---

## ✅ Aprovações

### Checklist Validado Por:

- [ ] **Desenvolvedor Mobile:** _________________ Data: _______
- [ ] **QA/Tester:** _________________ Data: _______
- [ ] **Tech Lead:** _________________ Data: _______
- [ ] **Product Manager:** _________________ Data: _______
- [ ] **Designer:** _________________ Data: _______

---

## 📈 Métricas Coletadas

### Performance Metrics
- **Tempo de inicialização (cold start):** ___ms
- **Tempo de inicialização (warm start):** ___ms
- **Tempo médio de navegação:** ___ms
- **FPS médio:** ___ FPS
- **Consumo de memória (idle):** ___MB
- **Consumo de memória (uso ativo):** ___MB
- **Tamanho do bundle iOS:** ___MB
- **Tamanho do bundle Android:** ___MB

### Quality Metrics
- **Cobertura de testes:** ___%
- **Crash rate:** ___%
- **ANR rate (Android):** ___%
- **Número de issues conhecidos:** ___
- **Número de bloqueadores:** ___

### Store Readiness
- **App Store Review Guidelines:** [ ] Aprovado [ ] Pendente
- **Google Play Policies:** [ ] Aprovado [ ] Pendente
- **Privacy Policy:** [ ] Publicada [ ] Pendente
- **Terms of Service:** [ ] Publicados [ ] Pendente

---

## 🔄 Histórico de Validações

| Versão | Data | Score | Status | Observações |
|--------|------|-------|--------|-------------|
| 1.0.0 | [Data] | [Score] | [Status] | [Notas] |
| | | | | |

---

**Versão do Checklist:** 2.0.0  
**Última Atualização:** 31/01/2026  
**Próxima Revisão:** [Data]
