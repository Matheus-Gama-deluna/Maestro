# React Native Complete Guide

## 📱 Guia Completo de React Native

**Versão:** 2.0.0  
**React Native:** 0.73+  
**Última Atualização:** 31/01/2026

---

## 🎯 Visão Geral

React Native é um framework para desenvolvimento mobile cross-platform usando JavaScript/TypeScript e React. Permite compartilhar código entre iOS e Android mantendo performance próxima ao nativo.

### Quando Usar React Native

✅ **Ideal para:**
- MVPs e protótipos rápidos
- Apps com UI padrão (não muito customizada)
- Times com expertise JavaScript/React
- Necessidade de compartilhar código com web
- Budget limitado
- Time-to-market crítico

❌ **Evitar para:**
- Apps com performance crítica (jogos, AR/VR)
- Apps com UI muito customizada e animações complexas
- Apps que dependem muito de recursos nativos específicos
- Apps que precisam de tamanho de bundle mínimo

---

## 🏗️ Arquitetura

### Estrutura de Projeto Recomendada

```
src/
├── components/          # Componentes reutilizáveis
│   ├── atoms/          # Componentes básicos (Button, Input)
│   ├── molecules/      # Combinações de atoms (SearchBar)
│   └── organisms/      # Componentes complexos (Header, Card)
├── screens/            # Telas do app
│   ├── Home/
│   │   ├── HomeScreen.tsx
│   │   ├── HomeScreen.styles.ts
│   │   └── HomeScreen.test.tsx
│   └── Profile/
├── navigation/         # Configuração de navegação
│   ├── RootNavigator.tsx
│   ├── AuthNavigator.tsx
│   └── linking.ts
├── services/           # Lógica de negócio
│   ├── api/           # Chamadas de API
│   ├── auth/          # Autenticação
│   └── storage/       # Persistência local
├── hooks/              # Custom hooks
│   ├── useAuth.ts
│   ├── useApi.ts
│   └── useDebounce.ts
├── store/              # Estado global (Redux/Zustand)
│   ├── slices/
│   └── store.ts
├── utils/              # Funções utilitárias
│   ├── formatters.ts
│   ├── validators.ts
│   └── constants.ts
├── types/              # TypeScript types
│   ├── api.types.ts
│   └── navigation.types.ts
└── theme/              # Design system
    ├── colors.ts
    ├── typography.ts
    └── spacing.ts
```

---

## 🚀 Setup e Configuração

### Inicialização do Projeto

```bash
# Com React Native CLI (recomendado para apps nativos)
npx react-native@latest init MyApp --template react-native-template-typescript

# Com Expo (recomendado para prototipagem rápida)
npx create-expo-app MyApp --template
```

### Dependências Essenciais

```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.73.0",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/native-stack": "^6.9.17",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "react-native-screens": "^3.29.0",
    "react-native-safe-area-context": "^4.8.2",
    "@tanstack/react-query": "^5.17.9",
    "zustand": "^4.4.7",
    "axios": "^1.6.5",
    "react-native-mmkv": "^2.11.0"
  },
  "devDependencies": {
    "@testing-library/react-native": "^12.4.3",
    "jest": "^29.7.0",
    "detox": "^20.16.2",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "prettier": "^3.2.4"
  }
}
```

---

## 🎨 UI e Styling

### StyleSheet vs Styled Components

```typescript
// StyleSheet (recomendado para performance)
import { StyleSheet, View, Text } from 'react-native';

const MyComponent = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Hello</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
});

// Styled Components (mais flexível, menos performático)
import styled from 'styled-components/native';

const Container = styled.View`
  flex: 1;
  padding: 16px;
  background-color: #fff;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #000;
`;
```

### Design System

```typescript
// theme/colors.ts
export const colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  background: '#FFFFFF',
  surface: '#F2F2F7',
  text: {
    primary: '#000000',
    secondary: '#3C3C43',
    disabled: '#C7C7CC',
  },
};

// theme/typography.ts
export const typography = {
  h1: {
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 41,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

// theme/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Uso
import { colors, typography, spacing } from '../theme';

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
});
```

---

## 🧭 Navegação

### React Navigation Setup

```typescript
// navigation/types.ts
export type RootStackParamList = {
  Home: undefined;
  ProductDetails: { productId: string };
  Profile: { userId: string };
};

// navigation/RootNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Uso em componentes
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MyComponent = () => {
  const navigation = useNavigation<NavigationProp>();

  const handlePress = () => {
    navigation.navigate('ProductDetails', { productId: '123' });
  };

  return <Button title="Ver Produto" onPress={handlePress} />;
};
```

### Tab Navigation

```typescript
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName!} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
```

---

## 📡 Gerenciamento de Estado

### Zustand (Recomendado para simplicidade)

```typescript
// store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email, password) => {
        const { user, token } = await authService.login(email, password);
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Uso em componentes
const LoginScreen = () => {
  const { login, isAuthenticated } = useAuthStore();

  const handleLogin = async () => {
    await login(email, password);
  };

  return <Button title="Login" onPress={handleLogin} />;
};
```

### React Query para Server State

```typescript
// hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => api.getProducts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => api.getProduct(id),
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product: NewProduct) => api.createProduct(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// Uso
const ProductListScreen = () => {
  const { data: products, isLoading, error } = useProducts();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorView error={error} />;

  return (
    <FlatList
      data={products}
      renderItem={({ item }) => <ProductCard product={item} />}
      keyExtractor={(item) => item.id}
    />
  );
};
```

---

## ⚡ Performance

### Otimização de Listas

```typescript
import { FlatList, memo } from 'react-native';

// Memoize o componente do item
const ProductCard = memo(({ product }: { product: Product }) => {
  return (
    <View style={styles.card}>
      <FastImage source={{ uri: product.image }} style={styles.image} />
      <Text>{product.name}</Text>
    </View>
  );
});

// FlatList otimizada
const ProductList = ({ products }: { products: Product[] }) => {
  const renderItem = useCallback(
    ({ item }: { item: Product }) => <ProductCard product={item} />,
    []
  );

  const keyExtractor = useCallback((item: Product) => item.id, []);

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      // Performance optimizations
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
      // Pull to refresh
      onRefresh={refetch}
      refreshing={isRefetching}
      // Infinite scroll
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
    />
  );
};
```

### Otimização de Imagens

```typescript
import FastImage from 'react-native-fast-image';

// Use FastImage ao invés de Image
<FastImage
  source={{
    uri: imageUrl,
    priority: FastImage.priority.high,
    cache: FastImage.cacheControl.immutable,
  }}
  resizeMode={FastImage.resizeMode.cover}
  style={{ width: 200, height: 200 }}
  defaultSource={require('./placeholder.png')}
/>

// Pré-carregar imagens
FastImage.preload([
  { uri: 'https://example.com/image1.jpg' },
  { uri: 'https://example.com/image2.jpg' },
]);
```

### Hermes Engine

```javascript
// android/app/build.gradle
project.ext.react = [
    enableHermes: true,  // Habilitar Hermes
]

// Verificar se Hermes está ativo
const isHermes = () => !!global.HermesInternal;
console.log('Hermes enabled:', isHermes());
```

---

## 🧪 Testes

### Jest (Unit Tests)

```typescript
// __tests__/utils/formatters.test.ts
import { formatCurrency } from '../utils/formatters';

describe('formatCurrency', () => {
  it('should format number as BRL currency', () => {
    expect(formatCurrency(1234.56)).toBe('R$ 1.234,56');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('R$ 0,00');
  });
});

// __tests__/components/Button.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../components/Button';

describe('Button', () => {
  it('should render correctly', () => {
    const { getByText } = render(<Button title="Click me" />);
    expect(getByText('Click me')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Click me" onPress={onPress} />);
    
    fireEvent.press(getByText('Click me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

### Detox (E2E Tests)

```typescript
// e2e/login.test.ts
describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should login successfully', async () => {
    await element(by.id('email-input')).typeText('user@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should show error for invalid credentials', async () => {
    await element(by.id('email-input')).typeText('invalid@example.com');
    await element(by.id('password-input')).typeText('wrong');
    await element(by.id('login-button')).tap();

    await expect(element(by.text('Invalid credentials'))).toBeVisible();
  });
});
```

---

## 🔐 Segurança

### Armazenamento Seguro

```typescript
import * as Keychain from 'react-native-keychain';

// Salvar credenciais
await Keychain.setGenericPassword('username', 'password', {
  service: 'com.myapp.auth',
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
});

// Recuperar credenciais
const credentials = await Keychain.getGenericPassword({
  service: 'com.myapp.auth',
});

if (credentials) {
  console.log('Username:', credentials.username);
  console.log('Password:', credentials.password);
}

// Remover credenciais
await Keychain.resetGenericPassword({
  service: 'com.myapp.auth',
});
```

---

## 📦 Build e Deploy

### iOS

```bash
# Gerar build de produção
cd ios
pod install
cd ..
npx react-native run-ios --configuration Release

# Archive para App Store
xcodebuild -workspace ios/MyApp.xcworkspace \
  -scheme MyApp \
  -configuration Release \
  -archivePath build/MyApp.xcarchive \
  archive
```

### Android

```bash
# Gerar AAB para Google Play
cd android
./gradlew bundleRelease

# Gerar APK
./gradlew assembleRelease

# Output
# android/app/build/outputs/bundle/release/app-release.aab
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 📚 Recursos Adicionais

- **Documentação Oficial:** https://reactnative.dev
- **React Navigation:** https://reactnavigation.org
- **Expo:** https://expo.dev
- **Awesome React Native:** https://github.com/jondot/awesome-react-native

---

**Versão:** 2.0.0  
**Última Atualização:** 31/01/2026
