# História de Usuário Mobile - [ID]

## 📱 Informações Básicas

**ID:** [US-XXX-MOBILE]  
**Título:** [Título descritivo da história]  
**Plataforma:** [ ] iOS  [ ] Android  [ ] Ambas  
**Framework:** [ ] React Native  [ ] Flutter  [ ] Native iOS  [ ] Native Android  
**Prioridade:** [ ] Alta  [ ] Média  [ ] Baixa  
**Estimativa:** [X] Story Points  
**Sprint:** [Número do Sprint]

---

## 👤 User Story

**Como** [tipo de usuário]  
**Quero** [ação/funcionalidade]  
**Para** [benefício/valor]

---

## 📋 Descrição Detalhada

[Descrição completa da funcionalidade mobile, incluindo contexto e motivação]

### Contexto Mobile
- **Cenário de uso:** [Quando e onde o usuário usará esta feature]
- **Dispositivos alvo:** [iPhone X+, Android 10+, tablets, etc.]
- **Conectividade:** [Online, offline, sincronização]
- **Orientação:** [ ] Portrait  [ ] Landscape  [ ] Ambas

---

## ✅ Critérios de Aceite

### Funcionalidade
```gherkin
Cenário: [Nome do cenário principal]
  Dado que [contexto inicial]
  Quando [ação do usuário]
  Então [resultado esperado]
  E [validação adicional]
```

### Platform-Specific

#### iOS
- [ ] Segue Human Interface Guidelines
- [ ] Navegação com swipe back funciona
- [ ] Safe areas respeitadas (notch, home indicator)
- [ ] Dark mode suportado
- [ ] Haptic feedback implementado
- [ ] Teclado iOS com done/return correto

#### Android
- [ ] Segue Material Design 3
- [ ] Back button funciona corretamente
- [ ] Navigation drawer (se aplicável)
- [ ] Material You dynamic colors (opcional)
- [ ] Ripple effects nos toques
- [ ] Teclado Android com IME actions

---

## 🎨 Design & UI

### Wireframes/Mockups
- **Figma/Sketch:** [Link para designs]
- **Protótipo:** [Link para protótipo interativo]

### Componentes UI
- [ ] [Componente 1] - [Descrição]
- [ ] [Componente 2] - [Descrição]
- [ ] [Componente 3] - [Descrição]

### Estados da UI
- [ ] Loading state
- [ ] Empty state
- [ ] Error state
- [ ] Success state
- [ ] Offline state

### Navegação
- **Tela anterior:** [Nome da tela]
- **Tela posterior:** [Nome da tela]
- **Tipo de navegação:** [ ] Push  [ ] Modal  [ ] Tab  [ ] Drawer

---

## 🔌 Integrações

### APIs
- **Endpoint:** `[METHOD] /api/endpoint`
- **Request:**
```json
{
  "campo": "valor"
}
```
- **Response:**
```json
{
  "data": []
}
```

### Recursos Nativos
- [ ] Câmera
- [ ] Galeria de fotos
- [ ] Geolocalização
- [ ] Notificações push
- [ ] Armazenamento local
- [ ] Biometria (Face ID / Fingerprint)
- [ ] Compartilhamento
- [ ] Deep linking

---

## 💾 Persistência Local

### Dados a Armazenar
- **Tipo:** [ ] AsyncStorage  [ ] SQLite  [ ] Realm  [ ] SecureStore
- **Dados:**
  - [Campo 1]: [Tipo] - [Descrição]
  - [Campo 2]: [Tipo] - [Descrição]

### Sincronização
- [ ] Offline-first
- [ ] Sync automático ao conectar
- [ ] Resolução de conflitos: [Estratégia]

---

## ⚡ Performance

### Métricas Alvo
- **Tempo de carregamento inicial:** < [X]ms
- **Tempo de resposta a interações:** < 100ms
- **Consumo de memória:** < 150MB
- **Tamanho do bundle:** Impacto de +[X]MB

### Otimizações
- [ ] Lazy loading de imagens
- [ ] Virtualização de listas longas
- [ ] Memoização de componentes
- [ ] Debounce em inputs
- [ ] Cache de dados

---

## 🧪 Testes

### Testes Unitários
```javascript
describe('[Componente/Feature]', () => {
  it('deve [comportamento esperado]', () => {
    // Teste
  });
});
```

### Testes de Integração
- [ ] Integração com API funciona
- [ ] Navegação entre telas funciona
- [ ] Persistência local funciona

### Testes E2E (Detox/Appium)
```javascript
describe('[Feature] E2E', () => {
  it('deve completar fluxo completo', async () => {
    await element(by.id('button-id')).tap();
    await expect(element(by.id('result'))).toBeVisible();
  });
});
```

### Testes em Dispositivos
- [ ] iPhone [modelo] - iOS [versão]
- [ ] Android [modelo] - Android [versão]
- [ ] Tablet [modelo]
- [ ] Diferentes tamanhos de tela

---

## 🔐 Segurança

- [ ] Dados sensíveis criptografados
- [ ] Tokens armazenados com segurança (SecureStore/Keychain)
- [ ] Validação de inputs
- [ ] HTTPS obrigatório
- [ ] Certificado SSL pinning (se necessário)

---

## ♿ Acessibilidade

### iOS VoiceOver
- [ ] Labels descritivos em todos os elementos
- [ ] Ordem de navegação lógica
- [ ] Hints quando necessário
- [ ] Traits corretos (button, header, etc.)

### Android TalkBack
- [ ] contentDescription em todos os elementos
- [ ] Ordem de navegação lógica
- [ ] Hints quando necessário
- [ ] Roles corretos

### Geral
- [ ] Contraste mínimo 4.5:1
- [ ] Tamanho de toque mínimo 44pt (iOS) / 48dp (Android)
- [ ] Suporte a tamanhos de fonte dinâmicos

---

## 📦 Dependências

### Bibliotecas Necessárias
- [ ] [Nome da lib] - [Versão] - [Propósito]
- [ ] [Nome da lib] - [Versão] - [Propósito]

### Histórias Relacionadas
- **Depende de:** [US-XXX]
- **Bloqueia:** [US-YYY]

---

## 🚀 Deploy & Release

### Checklist de Release
- [ ] Testes passando
- [ ] Code review aprovado
- [ ] Performance validada
- [ ] Acessibilidade validada
- [ ] Testado em dispositivos reais
- [ ] Screenshots atualizados (se necessário)

### Versão do App
- **iOS:** [Versão] (Build [número])
- **Android:** [Versão] (versionCode [número])

### Rollout
- [ ] Beta testing (TestFlight / Internal Testing)
- [ ] Staged rollout: [%] dos usuários
- [ ] Monitoramento de crashes
- [ ] Rollback plan definido

---

## 📝 Notas Técnicas

### Implementação
[Notas sobre abordagem técnica, decisões de design, trade-offs]

### Riscos Identificados
- [ ] [Risco 1] - Mitigação: [Como mitigar]
- [ ] [Risco 2] - Mitigação: [Como mitigar]

### Melhorias Futuras
- [ ] [Melhoria 1]
- [ ] [Melhoria 2]

---

## 📊 Métricas de Sucesso

### KPIs
- **Adoção:** [X]% dos usuários usam a feature
- **Engagement:** [X] interações por usuário
- **Performance:** < [X]ms tempo de resposta
- **Qualidade:** < [X]% crash rate

### Analytics
- [ ] Eventos de tracking definidos
- [ ] Dashboards configurados
- [ ] Alertas de erro configurados

---

**Criado em:** [Data]  
**Atualizado em:** [Data]  
**Responsável:** [Nome]  
**Revisor:** [Nome]
