# Especialista em Desenvolvimento Mobile

**Versão:** 2.0  
**Última Atualização:** 31/01/2026  
**Status:** ✅ Estrutura Moderna Completa

---

## 📋 Visão Geral

Especialista em desenvolvimento de aplicativos mobile nativos e cross-platform (React Native, Flutter, Swift, Kotlin), com foco em performance, UX mobile, offline-first, e integração com APIs.

### **Quando Usar**

- **Fase:** Desenvolvimento Mobile
- **Após:** Design mobile, Contrato API, Arquitetura
- **Antes:** Testes mobile, Deploy em stores
- **Workflows:** `/implementar-historia`, `/nova-feature`

### **Valor Entregue**

- App mobile funcional (iOS/Android)
- Navegação e state management
- Integração com APIs
- Offline-first com cache
- Push notifications
- Deep linking
- Performance otimizada

---

## 📥 Artefatos de Entrada

| Artefato | Localização | Obrigatório |
|----------|-------------|-------------|
| **Design Mobile** | `docs/03-ux/design-mobile.md` | ✅ Sim |
| **Contrato API** | `docs/09-api/contrato-api.md` | ✅ Sim |
| **Arquitetura** | `docs/06-arquitetura/arquitetura.md` | ✅ Sim |
| **História Mobile** | `docs/08-backlog/features/MOB-*.md` | ✅ Sim |

---

## 📤 Artefatos de Saída

| Artefato | Localização | Descrição |
|----------|-------------|-----------|
| **Screens** | `src/screens/` | Telas do app |
| **Components** | `src/components/` | Componentes reutilizáveis |
| **Navigation** | `src/navigation/` | Navegação |
| **State** | `src/store/` ou `src/context/` | Gerenciamento de estado |
| **Services** | `src/services/` | Integração API |
| **Tests** | `src/**/*.test.tsx` | Testes |

---

## 🎯 Processo de Implementação

### **1. Setup Inicial**
- Configurar projeto (Expo, React Native CLI, Flutter)
- Estrutura de pastas
- Navegação (React Navigation, Flutter Navigator)

### **2. State Management**
- Redux/Zustand/Context API (React Native)
- Provider/Riverpod (Flutter)

### **3. Screens e Components**
- Implementar telas conforme design
- Componentes reutilizáveis
- Responsividade mobile

### **4. Integração API**
- Axios/Fetch para chamadas
- Cache com React Query/SWR
- Offline-first com AsyncStorage

### **5. Features Nativas**
- Push notifications (FCM)
- Camera, GPS, Biometria
- Deep linking

---

## ✅ Quality Gates

### **Checklist (Score Mínimo: 75/100)**

**Implementação (30 pontos):**
- [ ] Telas conforme design
- [ ] Navegação funcionando
- [ ] State management implementado

**Performance (25 pontos):**
- [ ] FPS >= 60
- [ ] Tempo de carregamento < 3s
- [ ] Bundle size otimizado

**UX Mobile (25 pontos):**
- [ ] Gestos nativos (swipe, pull-to-refresh)
- [ ] Feedback visual
- [ ] Loading states

**Testes (20 pontos):**
- [ ] Testes unitários
- [ ] Testes de componente
- [ ] Testes E2E (Detox/Maestro)

---

## 📚 Estrutura de Recursos

### **Templates** (`resources/templates/`)
- `mobile-screen.md` - Template de tela
- `native-module.md` - Módulo nativo
- `state-management.md` - Gerenciamento de estado

### **Examples** (`resources/examples/`)
- Login flow
- Lista com infinite scroll
- Camera integration
- Push notifications
- Offline-first

### **Checklists** (`resources/checklists/`)
- Validação mobile (100+ pontos)
- Performance checklist
- UX mobile patterns

### **Reference** (`resources/reference/`)
- React Native best practices
- Flutter patterns
- Mobile performance
- Store guidelines (App Store, Play Store)

---

## 🤖 Funções MCP

1. **init_mobile_app** - Inicializar app mobile
2. **validate_mobile_quality** - Validar performance e UX
3. **process_mobile_to_stores** - Preparar para deploy

Ver `MCP_INTEGRATION.md` para detalhes.

---

**Versão:** 2.0  
**Framework:** Skills Modernas com Progressive Disclosure  
**Arquitetura:** Skill Descritiva + Automação MCP
