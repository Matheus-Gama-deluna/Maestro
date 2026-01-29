---
name: specialist-mobile-design-avancado
description: Arquitetura mobile enterprise com performance e segurança.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Mobile Design (Avançado) · Skill do Especialista

## Missão
Definir arquitetura mobile escalável para apps enterprise, aplicando patterns avançados, performance otimizada e segurança robusta para aplicações móveis críticas.

## Quando ativar
- Fase: Especialista Avançado
- Workflows recomendados: /nova-feature, /deploy
- Use quando precisar em projetos mobile críticos ou com requisitos avançados.

## Inputs obrigatórios
- Requisitos mobile complexos
- Stack e integrações
- Políticas de segurança
- Arquitetura existente
- CONTEXTO.md do projeto

## Outputs gerados
- Arquitetura mobile enterprise
- Guidelines de performance e segurança
- Patterns avançados mobile
- Estratégia de escalabilidade
- Framework de design system mobile

## Quality Gate
- Patterns mobile definidos
- Performance otimizada
- Segurança auditada
- Escalabilidade garantida
- Design system completo

## Arquitetura Mobile Enterprise

### 1. Clean Architecture Mobile
```text
Estrutura em camadas para apps enterprise:

Presentation Layer:
- UI Components (React Native/Flutter/SwiftUI)
- ViewModels/State Management
- Navigation Controllers

Domain Layer:
- Business Logic
- Use Cases
- Domain Models
- Repository Interfaces

Data Layer:
- Repository Implementations
- Data Sources (API, Local DB)
- Cache Management
- Network Layer
```

### 2. State Management Avançado
```javascript
// Redux Toolkit com RTK Query (React Native)
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: { user: null, loading: false, error: null },
  reducers: {
    logout: (state) => {
      state.user = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      });
  }
});
```

### 3. Dependency Injection
```typescript
// Flutter com GetIt
import 'package:get_it/get_it.dart';

final getIt = GetIt.instance;

void setupLocator() {
  // Services
  getIt.registerLazySingleton<ApiService>(() => ApiService());
  getIt.registerLazySingleton<DatabaseService>(() => DatabaseService());
  
  // Repositories
  getIt.registerLazySingleton<UserRepository>(() => UserRepositoryImpl());
  
  // Use Cases
  getIt.registerLazySingleton<GetUserUseCase>(() => GetUserUseCase());
}
```

## Performance Optimization

### 1. Image Optimization
```javascript
// React Native com FastImage
import FastImage from 'react-native-fast-image';

const OptimizedImage = ({ source, style }) => (
  <FastImage
    style={style}
    source={{
      uri: source.uri,
      priority: FastImage.priority.normal,
      cache: FastImage.cacheControl.immutable,
    }}
    resizeMode={FastImage.resizeMode.cover}
  />
);
```

### 2. List Performance
```javascript
// FlatList otimizado
const OptimizedList = ({ data }) => (
  <FlatList
    data={data}
    renderItem={renderItem}
    keyExtractor={item => item.id}
    initialNumToRender={10}
    maxToRenderPerBatch={10}
    windowSize={10}
    removeClippedSubviews={true}
    getItemLayout={(data, index) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    })}
  />
);
```

### 3. Memory Management
```typescript
// Flutter com Dispose Pattern
class MyWidget extends StatefulWidget {
  @override
  _MyWidgetState createState() => _MyWidgetState();
}

class _MyWidgetState extends State<MyWidget> {
  StreamSubscription? _subscription;

  @override
  void initState() {
    super.initState();
    _subscription = someStream.listen((data) {
      setState(() => _data = data);
    });
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }
}
```

## Security Patterns

### 1. Secure Storage
```javascript
// React Native com Keychain
import * as Keychain from 'react-native-keychain';

const secureStorage = {
  async set(key, value) {
    await Keychain.setInternetCredentials(
      'com.myapp',
      key,
      JSON.stringify(value)
    );
  },
  
  async get(key) {
    const credentials = await Keychain.getInternetCredentials('com.myapp');
    if (credentials.password) {
      return JSON.parse(credentials.password)[key];
    }
    return null;
  }
};
```

### 2. Network Security
```javascript
// SSL Pinning com React Native
import { Networking } from 'react-native-networking';

const secureNetworking = {
  setupSSL() {
    Networking.addPublicKeyPin(
      'api.example.com',
      ['sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=']
    );
  }
};
```

### 3. Biometric Authentication
```typescript
// Flutter com Local Authentication
import 'package:local_auth/local_auth.dart';

class BiometricService {
  final _localAuth = LocalAuthentication();

  Future<bool> authenticate() async {
    try {
      final isAvailable = await _localAuth.canCheckBiometrics;
      if (!isAvailable) return false;

      final didAuthenticate = await _localAuth.authenticate(
        localizedReason: 'Authenticate to access secure data',
        options: const AuthenticationOptions(
          biometricOnly: true,
          stickyAuth: true,
        ),
      );
      
      return didAuthenticate;
    } catch (e) {
      return false;
    }
  }
}
```

## Advanced UI Patterns

### 1. Custom Animations
```javascript
// React Native com Reanimated 2
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const AnimatedCard = ({ children }) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const handlePress = () => {
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
  };
  
  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <TouchableOpacity onPress={handlePress}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};
```

### 2. Gesture Handling
```typescript
// Flutter com GestureDetector
import 'package:flutter/gestures.dart';

class SwipeableCard extends StatefulWidget {
  @override
  _SwipeableCardState createState() => _SwipeableCardState();
}

class _SwipeableCardState extends State<SwipeableCard> {
  double _dragStartX = 0;
  double _dragOffset = 0;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onPanStart: (details) {
        _dragStartX = details.globalPosition.dx;
      },
      onPanUpdate: (details) {
        setState(() {
          _dragOffset = details.globalPosition.dx - _dragStartX;
        });
      },
      onPanEnd: (details) {
        if (_dragOffset > 100) {
          // Swipe right action
        } else if (_dragOffset < -100) {
          // Swipe left action
        }
        setState(() => _dragOffset = 0);
      },
      child: Transform.translate(
        offset: Offset(_dragOffset, 0),
        child: Card(child: _buildContent()),
      ),
    );
  }
}
```

### 3. Responsive Design
```javascript
// React Native com Dimensions API
import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const responsive = {
  isTablet: width >= 768,
  isSmallPhone: width < 375,
  getFontSize: (size) => {
    const baseSize = size;
    if (width < 375) return baseSize * 0.9;
    if (width >= 768) return baseSize * 1.2;
    return baseSize;
  },
  getPadding: (size) => {
    if (width < 375) return size * 0.8;
    if (width >= 768) return size * 1.5;
    return size;
  }
};
```

## Offline-First Architecture

### 1. Data Synchronization
```typescript
// Flutter com Hive e Sync
import 'package:hive/hive.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

class SyncService {
  final _hive = Hive.box('offline_data');
  final _connectivity = Connectivity();

  Future<void> syncData() async {
    final connectivityResult = await _connectivity.checkConnectivity();
    
    if (connectivityResult == ConnectivityResult.none) {
      return; // Offline mode
    }

    // Sync pending changes
    final pendingChanges = _hive.get('pending_changes') ?? [];
    for (final change in pendingChanges) {
      await _syncChange(change);
    }
    
    // Clear pending changes
    await _hive.delete('pending_changes');
  }

  Future<void> _syncChange(Map<String, dynamic> change) async {
    // Implement sync logic with API
  }
}
```

### 2. Cache Strategy
```javascript
// React Native com AsyncStorage e Cache
import AsyncStorage from '@react-native-async-storage/async-storage';

class CacheService {
  static async get(key) {
    try {
      const cachedData = await AsyncStorage.getItem(key);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const isExpired = Date.now() - timestamp > 5 * 60 * 1000; // 5 minutes
        
        if (!isExpired) {
          return data;
        }
      }
    } catch (error) {
      console.error('Cache error:', error);
    }
    return null;
  }

  static async set(key, data) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Cache error:', error);
    }
  }
}
```

## Context Flow

### Artefatos Obrigatórios para Iniciar
Cole no início:
1. Requisitos mobile complexos
2. Stack tecnológico definido
3. Políticas de segurança
4. Arquitetura existente
5. CONTEXTO.md com restrições

### Prompt de Continuação
```
Atue como Mobile Architect Sênior Especialista.

Contexto do projeto:
[COLE docs/CONTEXTO.md]

Requisitos mobile:
[COLE REQUISITOS MOBILE]

Stack tecnológico:
[COLE STACK DEFINIDO]

Preciso definir arquitetura mobile enterprise para [TIPO DE APP] com performance e segurança.
```

### Ao Concluir Esta Fase
1. **Defina** arquitetura mobile enterprise
2. **Implemente** patterns avançados
3. **Otimize** performance
4. **Garanta** segurança robusta
5. **Planeje** escalabilidade
6. **Crie** design system mobile

## Métricas de Qualidade

### Indicadores Obrigatórios
- **App Startup Time:** < 3 segundos
- **Screen Load Time:** < 1 segundo
- **Memory Usage:** < 150MB
- **Battery Impact:** < 5%/hora
- **Crash Rate:** < 0.1%
- **Security Score:** 100%

### Metas de Excelência
- App Startup Time: < 2 segundos
- Screen Load Time: < 500ms
- Memory Usage: < 100MB
- Battery Impact: < 3%/hora
- Crash Rate: < 0.05%
- Security Score: 100%

## Templates Prontos

### Mobile Architecture Template
```markdown
# Mobile Architecture: [App Name]

## Overview
- **Platform:** [iOS/Android/Cross-platform]
- **Framework:** [React Native/Flutter/SwiftUI]
- **Architecture Pattern:** [Clean/MVVM/MVI]
- **State Management:** [Redux/Provider/Bloc]

## Layer Structure
```
lib/
├── presentation/
│   ├── screens/
│   ├── widgets/
│   ├── viewmodels/
│   └── navigation/
├── domain/
│   ├── entities/
│   ├── usecases/
│   └── repositories/
├── data/
│   ├── repositories/
│   ├── datasources/
│   └── models/
└── core/
    ├── utils/
    ├── constants/
    └── extensions/
```

## Performance Targets
- **Startup Time:** < 3s
- **Screen Load:** < 1s
- **Memory Usage:** < 150MB
- **Battery Impact:** < 5%/hour

## Security Measures
- **Data Encryption:** AES-256
- **API Security:** OAuth 2.0 + JWT
- **Local Storage:** Keychain/Keystore
- **Network Security:** SSL Pinning
- **Biometric Auth:** TouchID/FaceID

## Offline Strategy
- **Cache Layer:** Redis/SQLite
- **Sync Strategy:** Eventual Consistency
- **Conflict Resolution:** Last Write Wins
- **Data Validation:** Schema Validation
```

### Performance Checklist
```markdown
# Mobile Performance Checklist

## Startup Optimization
- [ ] Lazy loading of screens
- [ ] Async initialization of services
- [ ] Optimized bundle size
- [ ] Code splitting by feature
- [ ] Preload critical data

## Runtime Performance
- [ ] List virtualization for long lists
- [ ] Image optimization and caching
- [ ] Memory leak prevention
- [ ] Efficient state management
- [ ] Background task optimization

## Network Performance
- [ ] Request batching
- [ ] Response caching
- [ ] Compression enabled
- [ ] Timeout handling
- [ ] Retry mechanisms

## UI Performance
- [ ] 60fps animations
- [ ] Smooth scrolling
- [ ] Efficient layouts
- [ ] Minimal re-renders
- [ ] Platform-specific optimizations
```

## Skills complementares
- `mobile-design`
- `frontend-design`
- `game-development`
- `i18n-localization`
- `performance-profiling`

## Referências essenciais
- **Especialista original:** `content/specialists/Especialista em Desenvolvimento Mobile.md`
- **Artefatos alvo:**
  - Arquitetura mobile enterprise
  - Guidelines de performance e segurança
  - Patterns avançados mobile
  - Estratégia de escalabilidade
  - Framework de design system mobile