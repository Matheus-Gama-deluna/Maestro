---
name: specialist-desenvolvimento-mobile
description: Implementação mobile (React Native/Flutter/iOS/Android) com testes e deploy.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Desenvolvimento Mobile · Skill do Especialista

## Missão
Construir apps mobile alinhados aos requisitos e prontos para loja, seguindo design patterns nativos de cada plataforma e garantindo performance.

## Quando ativar
- Fase: Fase 16 · Mobile
- Workflows recomendados: /implementar-historia, /deploy
- Use quando precisar para histórias mobile dedicadas ou integrações mobile-first.

## Inputs obrigatórios
- Design Doc (`docs/03-ux/design-doc.md`)
- Arquitetura (`docs/06-arquitetura/arquitetura.md`)
- Contrato de API (`docs/09-api/contrato-api.md`)
- Backlog mobile (`docs/08-backlog/`)
- Assets e guidelines
- CONTEXTO.md do projeto

## Outputs gerados
- App mobile funcional
- Testes e builds para lojas
- Configuração de CI/CD mobile
- Documentação de deploy

## Quality Gate
- App funcionando em ambas plataformas
- Testes automatizados passando
- Checklist de publicação atendido
- Performance otimizada
- Guidelines de plataforma seguidas

## Platform Selection Framework

### Matrix de Decisão
| Framework | iOS | Android | Web Reuse | Performance | Time-to-Market | Quando Usar |
|-----------|-----|---------|-----------|-------------|----------------|-------------|
| **Native (Swift/Kotlin)** | | | | | Médio | Performance crítica, recursos nativos |
| **React Native** | | | Parcial | | Rápido | Time JavaScript, code sharing |
| **Flutter** | | | | | Médio | UI customizada, animações |
| **Ionic/Capacitor** | | | | | Muito rápido | Web app + wrapper |

### Critérios de Escolha
- **Performance crítica:** Native ou Flutter
- **Time-to-market:** React Native ou Ionic
- **UI customizada:** Flutter ou Native
- **Budget limitado:** Ionic ou React Native
- **Equipe JavaScript:** React Native
- **Equipe mobile nativa:** Native

## Platform Design Guidelines

### iOS (Human Interface Guidelines)
- **Navigation:** Tab Bar (bottom), Navigation Bar (top)
- **Gestures:** Swipe back, long press contextual menus
- **Typography:** SF Pro (system font)
- **Spacing:** 8pt grid system
- **Dark mode:** Support required
- **Safe Areas:** iPhone X+ notch consideration

### Android (Material Design 3)
- **Navigation:** Bottom Nav, Navigation Drawer, Top App Bar
- **Gestures:** Swipe actions, FAB (Floating Action Button)
- **Typography:** Roboto (default)
- **Spacing:** 4dp/8dp grid
- **Material You:** Dynamic color support
- **Navigation Component:** Fragment-based navigation

## Performance Patterns Mobile-Specific

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
  removeClippedSubviews={true}
/>
```

### 2. Image Optimization
```javascript
// Use react-native-fast-image
<FastImage
  source={{ uri: imageUrl }}
  resizeMode="cover"
  style={{ width: 200, height: 200 }}
  defaultSource={require('./placeholder.png')}
/>
```

### 3. State Management Eficiente
```javascript
// Evite inline functions em renders
 Bad:
<Button onPress={() => handleClick(item.id)} />

 Good:
const handlePress = useCallback(() => handleClick(item.id), [item.id]);
<Button onPress={handlePress} />
```

## Stack Guidelines Mobile

### React Native Guidelines
- Use FlatList para listas longas
- Evite inline functions em renders
- Use Hermes engine
- Image optimization (react-native-fast-image)
- Use memo para componentes puros
- Evite re-renders desnecessários

### Flutter Guidelines
- const constructors para performance
- ListView.builder para listas longas
- Evite rebuilds com keys
- Use Theme para consistência
- Use const para widgets imutáveis
- Avoid setState em build

### Native iOS (SwiftUI) Guidelines
- @State para estado local
- @StateObject para ObservableObject
- Evite trabalho pesado em body
- Use LazyVStack/LazyHStack para listas
- Use @ViewBuilder para views complexas

### Native Android (Jetpack Compose) Guidelines
- remember para estado
- LazyColumn para listas longas
- Evite recomposição com derivedStateOf
- Use Modifier corretamente
- Evite recriação desnecessária

## Processo de Desenvolvimento

### 1. Setup Inicial
Para stack [TECNOLOGIA]:
- Configure ambiente de desenvolvimento
- Setup emuladores/simuladores
- Configure CI/CD para mobile
- Prepare certificates para deploy

### 2. Implementação Core
Seguindo Design Doc:
[COLE DESIGN DOC]

Implemente:
- Navegação principal
- Componentes reutilizáveis
- Integração com API
- Gerenciamento de estado

### 3. Platform-Specific
Para cada plataforma:
- Adapte navegação (iOS Tab Bar vs Android Bottom Nav)
- Implemente gestures nativos
- Siga guidelines de design
- Otimize para performance

### 4. Testes e Deploy
Configure:
- Testes unitários (Jest, XCTest, etc.)
- Testes E2E (Detox, Appium)
- Build automatizado
- Deploy para stores (App Store, Play Store)

## Guardrails Críticos

### NUNCA Faça
- NUNCA ignore guidelines de plataforma
- NUNCA pule otimização de performance
- NUNCA use código web sem adaptação mobile
- NUNCA ignore safe areas (notch, etc.)

### SEMPRE Faça
- SEMPRE teste em múltiplos dispositivos
- SEMPRE otimize para bateria
- SEMPRE implemente gestures nativos
- SEMPRE siga guidelines de design

### Mobile-Specific Considerations
```javascript
// Safe Area handling
import { SafeAreaView, Platform } from 'react-native';

const App = () => (
  <SafeAreaView style={styles.container}>
    {/* Content */}
  </SafeAreaView>
);

// Platform-specific code
const Component = Platform.select({
  ios: () => <IOSComponent />,
  android: () => <AndroidComponent />,
  default: () => <FallbackComponent />
});
```

## Context Flow

### Artefatos Obrigatórios para Iniciar
Cole no início:
1. Design Doc com wireframes mobile
2. Arquitetura com stack definida
3. Contrato de API para integração
4. Backlog com histórias mobile
5. CONTEXTO.md com restrições

### Prompt de Continuação
```
Atue como Mobile Developer Sênior.

Contexto do projeto:
[COLE docs/CONTEXTO.md]

Design Doc:
[COLE docs/03-ux/design-doc.md]

Arquitetura:
[COLE docs/06-arquitetura/arquitetura.md]

Preciso implementar o app mobile seguindo as guidelines da plataforma.
```

### Ao Concluir Esta Fase
1. Implemente features core
2. Adapte para cada plataforma
3. Otimize performance
4. Configure CI/CD mobile
5. Teste em dispositivos reais
6. Prepare para stores

## Métricas de Qualidade Mobile

### Indicadores Obrigatórios
- Performance: < 100ms para interações
- Battery: < 5% consumo por hora
- Memory: < 150MB de uso
- Crash Rate: < 0.1%
- ANR Rate: < 0.05%

### Metas de Excelência
- Performance: < 60ms (p95)
- Battery: < 3% consumo
- Memory: < 100MB uso
- Crash Rate: < 0.05%
- User Rating: > 4.5 estrelas

## Templates Prontos

### React Native Structure
```javascript
// src/navigation/AppNavigator.js
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

const TabNavigator = () => (
  <BottomTab.Navigator>
    <BottomTab.Screen name="Home" component={HomeScreen} />
    <BottomTab.Screen name="Profile" component={ProfileScreen} />
  </BottomTab.Navigator>
);

// src/components/ListItem.js
import React, { memo } from 'react';
import { FastImage } from 'react-native-fast-image';

const ListItem = memo(({ item, onPress }) => (
  <TouchableOpacity onPress={() => onPress(item.id)}>
    <FastImage source={{ uri: item.image }} style={styles.image} />
    <Text style={styles.title}>{item.title}</Text>
  </TouchableOpacity>
));
```

### Flutter Structure
```dart
// lib/main.dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'My App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: TabNavigator(),
    );
  }
}

// lib/widgets/list_item.dart
class ListItem extends StatelessWidget {
  final Item item;
  final VoidCallback onTap;

  const ListItem({Key? key, required this.item, required this.onTap}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Image.network(item.imageUrl),
      title: Text(item.title),
      onTap: () => onTap(item.id),
    );
  }
}
```

### iOS Native (SwiftUI)
```swift
import SwiftUI

struct ContentView: View {
    @State private var items: [Item] = []
    
    var body: some View {
        NavigationView {
            List(items, id: \.id) { item in
                NavigationLink(destination: DetailView(item: item)) {
                    HStack {
                        AsyncImage(url: item.imageURL)
                            .frame(width: 50, height: 50)
                        Text(item.title)
                    }
                }
            }
            .navigationTitle("Items")
        }
    }
}
```

## Skills complementares
- `mobile-design`
- `game-development`
- `i18n-localization`
- `performance-profiling`
- `mobile-testing`

## Referências essenciais
- **Especialista original:** `content/specialists/Especialista em Desenvolvimento Mobile.md`
- **Design Guidelines:** `content/design-system/stacks/`
- **Artefatos alvo:**
  - App mobile funcional
  - Testes e builds para lojas
  - Configuração de CI/CD mobile
  - Documentação de deploy