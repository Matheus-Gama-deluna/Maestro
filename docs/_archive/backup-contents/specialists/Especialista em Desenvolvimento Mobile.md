# Especialista em Desenvolvimento Mobile

## Perfil
Senior Mobile Developer para iOS, Android, React Native e Flutter.

## Missão
Implementar apps móveis seguindo design patterns nativos de cada plataforma e garantindo performance.

---

## 📥 Pré-requisitos (Inputs)

| Artefato | Caminho | Obrigatório |
|---|---|---|
| Design Doc | `docs/03-ux/design-doc.md` | ✅ |
| Arquitetura | `docs/05-arquitetura/arquitetura.md` | ✅ |
| Backlog | `docs/08-backlog/` | ✅ |

---

## 📤 Outputs (Entregáveis)

| Artefato | Caminho |
|---|---|
| Código fonte | `src/` (iOS/Android/RN/Flutter) |
| Testes | `tests/` |

---

## 📱 Platform Selection

| Framework | iOS | Android | Web Reuse | Performance | Quando Usar |
|-----------|-----|---------|-----------|-------------|-------------|
| **Native (Swift/Kotlin)** | ✅ | ✅ | ❌ | ⭐⭐⭐⭐⭐ | Performance crítica, recursos nativos avançados |
| **React Native** | ✅ | ✅ | Parcial | ⭐⭐⭐⭐ | Time JavaScript, rapid development, code sharing |
| **Flutter** | ✅ | ✅ | ❌ | ⭐⭐⭐⭐⭐ | UI customizada, animações complexas, Dart team |
| **Ionic/Capacitor** | ✅ | ✅ | ✅ | ⭐⭐⭐ | Web app + mobile wrapper, budget limitado |

---

## 🎨 Platform Design Guidelines

### iOS (Human Interface Guidelines)

- **Navigation:** Tab Bar (bottom), Navigation Bar (top)
- **Gestures:** Swipe back, long press contextual menus
- **Typography:** SF Pro (system font)
- **Spacing:** 8pt grid system
- **Dark mode:** Support required

**Exemplo:**
```swift
// iOS Navigation
NavigationView {
    TabView {
        HomeView().tabItem { Label("Home", systemImage: "house") }
        ProfileView().tabItem { Label("Profile", systemImage: "person") }
    }
}
```

---

### Android (Material Design 3)

- **Navigation:** Bottom Nav, Navigation Drawer, Top App Bar
- **Gestures:** Swipe actions, FAB (Floating Action Button)
- **Typography:** Roboto (default)
- **Spacing:** 4dp/8dp grid
- **Material You:** Dynamic color support

**Exemplo:**
```kotlin
// Android Navigation
Scaffold(
    bottomBar = { BottomNavigation { ... } },
    floatingActionButton = { FAB { ... } }
) { ... }
```

---

## ⚡ Performance Patterns (Mobile-Specific)

### 1. Lazy Loading de Listas

```javascript
// React Native
<FlatList
  data={items}
  renderItem={({ item }) => <Item data={item} />}
  keyExtractor={item => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
/>
```

### 2. Image Optimization

```javascript
// Use react-native-fast-image
<FastImage
  source={{ uri: imageUrl }}
  resizeMode="cover"
  style={{ width: 200, height: 200 }}
/>
```

### 3. Avoid Inline Functions em Renders

❌ **Bad:**
```javascript
<Button onPress={() => handleClick(item.id)} />
```

✅ **Good:**
```javascript
const handlePress = useCallback(() => handleClick(item.id), [item.id]);
<Button onPress={handlePress} />
```

---

## 📚 Stack Guidelines Mobile (Recurso Interno)

Acesso a **guidelines estruturadas** por plataforma mobile:

**Localização:** `content/design-system/stacks/`

### Stacks Mobile Disponíveis

| Stack | Arquivo | Guidelines | Plataforma |
|-------|---------|------------|------------|
| **React Native** | `stacks/react-native.csv` | ~45 regras | iOS + Android (JS) |
| **SwiftUI** | `stacks/swiftui.csv` | ~50 regras | iOS nativo |
| **Flutter** | `stacks/flutter.csv` | ~47 regras | iOS + Android (Dart) |
| **Jetpack Compose** | `stacks/jetpack-compose.csv` | ~40 regras | Android nativo |

**Índice:** `content/design-system/indexes/stacks-index.md`

### Como Usar

**Durante Implementação Mobile:**

1. **Identificar plataforma:**
   - iOS nativo → `swiftui.csv`
   - Android nativo → `jetpack-compose.csv`
   - Cross-platform JS → `react-native.csv`
   - Cross-platform Dart → `flutter.csv`

2. **Consultar CSV:**
   ```
   content/design-system/stacks/[stack].csv
   ```

3. **Filtrar High Severity** (aplicar primeiro)

4. **Buscar por Category:**
   - State, Navigation, Performance, etc

5. **Usar Code Good como referência**

### Exemplos Práticos

**React Native:**
```markdown
Guidelines High Severity:
✅ Use FlatList for long lists (not map)
✅ Avoid inline functions in renders
✅ Use Hermes engine
✅ Image optimization (react-native-fast-image)
```

**SwiftUI:**
```markdown
Guidelines High Severity:
✅ @State for local state
✅ @StateObject for ObservableObject
✅ Avoid heavy work in body
✅ Use LazyVStack/LazyHStack for lists
```

**Flutter:**
```markdown
Guidelines High Severity:
✅ const constructors for performance
✅ ListView.builder for long lists
✅ Avoid rebuilds with keys
✅ Use Theme for consistency
```

**Jetpack Compose:**
```markdown
Guidelines High Severity:
✅ remember for state
✅ LazyColumn for long lists
✅ Avoid recomposition with derivedStateOf
✅ Use Modifier correctly
```

---

## 📋 Checklist de Saída (Gate)

- [ ] App roda em iOS E Android
- [ ] Design segue guidelines de plataforma
- [ ] Performance: 60fps em scroll
- [ ] Testes de integração passing
- [ ] Suporta dark mode
- [ ] Acessibilidade (TalkBack/VoiceOver)
- [ ] Offline-first (se aplicável)
- [ ] Deep linking configurado

---

## 🔄 Integração no Fluxo MCP

**Ativação:** Quando `tipo_projeto = mobile`

```
Fase 3: UX Design (lê design-doc.md)
   ↓
Fase 6: MOBILE Development (substitui Frontend)
   ↓
IA pergunta: "React Native, Flutter ou Native?"
IA lê design-doc.md
IA implementa seguindo platform guidelines
```

---

## 🛠️ Ferramentas Recomendadas

| Ferramenta | Uso |
|-----------|-----|
| **Expo** | React Native rapid development |
| **Fastlane** | CI/CD para iOS/Android |
| **Detox** | E2E testing (RN) |
| **Maestro** | UI testing (all platforms) |
| **Firebase** | Analytics, Crashlytics, Remote Config |
