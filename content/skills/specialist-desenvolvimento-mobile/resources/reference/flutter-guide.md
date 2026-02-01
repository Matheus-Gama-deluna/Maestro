# Flutter Complete Guide

## 📱 Guia Completo de Flutter

**Versão:** 2.0.0  
**Flutter:** 3.16+  
**Dart:** 3.2+  
**Última Atualização:** 31/01/2026

---

## 🎯 Visão Geral

Flutter é um framework UI da Google para criar aplicações nativas compiladas para mobile, web e desktop a partir de uma única codebase. Usa a linguagem Dart e oferece widgets ricos e customizáveis.

### Quando Usar Flutter

✅ **Ideal para:**
- Apps com UI altamente customizada
- Performance próxima ao nativo necessária
- Animações complexas e fluidas
- Consistência visual entre plataformas
- Projetos de médio/longo prazo

❌ **Evitar para:**
- Time sem disposição para aprender Dart
- Necessidade de compartilhar código com web React
- Apps muito simples (overhead desnecessário)
- Dependência de muitas bibliotecas JavaScript

---

## 🏗️ Arquitetura

### Estrutura de Projeto Recomendada

```
lib/
├── main.dart
├── app.dart
├── core/
│   ├── constants/
│   ├── theme/
│   ├── utils/
│   └── errors/
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   ├── models/
│   │   │   ├── repositories/
│   │   │   └── datasources/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── repositories/
│   │   │   └── usecases/
│   │   └── presentation/
│   │       ├── pages/
│   │       ├── widgets/
│   │       └── providers/
│   └── products/
├── shared/
│   ├── widgets/
│   ├── models/
│   └── services/
└── routes/
    └── app_router.dart
```

---

## 🚀 Setup e Configuração

### Inicialização

```bash
# Criar novo projeto
flutter create my_app

# Com template específico
flutter create --org com.example my_app

# Verificar instalação
flutter doctor
```

### Dependências Essenciais

```yaml
# pubspec.yaml
dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  flutter_riverpod: ^2.4.9
  
  # Navigation
  go_router: ^13.0.0
  
  # HTTP & API
  dio: ^5.4.0
  retrofit: ^4.0.3
  
  # Local Storage
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  
  # UI
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.1
  
dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.1
  build_runner: ^2.4.7
  hive_generator: ^2.0.1
  mockito: ^5.4.4
```

---

## 🎨 UI e Widgets

### Material Design 3

```dart
import 'package:flutter/material.dart';

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'My App',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blue,
          brightness: Brightness.light,
        ),
        textTheme: const TextTheme(
          displayLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
          bodyLarge: TextStyle(fontSize: 16),
        ),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blue,
          brightness: Brightness.dark,
        ),
      ),
      home: HomeScreen(),
    );
  }
}
```

### Custom Widgets

```dart
class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final bool isLoading;

  const CustomButton({
    Key? key,
    required this.text,
    required this.onPressed,
    this.isLoading = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: isLoading ? null : onPressed,
      style: ElevatedButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      child: isLoading
          ? const SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : Text(text),
    );
  }
}
```

---

## 🧭 Navegação

### GoRouter

```dart
import 'package:go_router/go_router.dart';

final router = GoRouter(
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomeScreen(),
      routes: [
        GoRoute(
          path: 'product/:id',
          builder: (context, state) {
            final id = state.pathParameters['id']!;
            return ProductDetailsScreen(productId: id);
          },
        ),
        GoRoute(
          path: 'profile',
          builder: (context, state) => const ProfileScreen(),
        ),
      ],
    ),
  ],
  errorBuilder: (context, state) => const ErrorScreen(),
);

// Uso
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      routerConfig: router,
    );
  }
}

// Navegação
context.go('/product/123');
context.push('/profile');
context.pop();
```

---

## 📡 Gerenciamento de Estado

### Riverpod

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Provider simples
final counterProvider = StateProvider<int>((ref) => 0);

// Provider assíncrono
final productsProvider = FutureProvider<List<Product>>((ref) async {
  final repository = ref.watch(productRepositoryProvider);
  return repository.getProducts();
});

// StateNotifier para estado complexo
class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(const AuthState.unauthenticated());

  Future<void> login(String email, String password) async {
    state = const AuthState.loading();
    try {
      final user = await authService.login(email, password);
      state = AuthState.authenticated(user);
    } catch (e) {
      state = AuthState.error(e.toString());
    }
  }

  void logout() {
    state = const AuthState.unauthenticated();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});

// Uso em widgets
class LoginScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    return authState.when(
      unauthenticated: () => LoginForm(),
      loading: () => const CircularProgressIndicator(),
      authenticated: (user) => HomeScreen(user: user),
      error: (message) => ErrorView(message: message),
    );
  }
}
```

---

## ⚡ Performance

### Listas Otimizadas

```dart
class ProductList extends StatelessWidget {
  final List<Product> products;

  const ProductList({Key? key, required this.products}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: products.length,
      // Otimizações
      cacheExtent: 100,
      addAutomaticKeepAlives: true,
      addRepaintBoundaries: true,
      itemBuilder: (context, index) {
        final product = products[index];
        return ProductCard(
          key: ValueKey(product.id),
          product: product,
        );
      },
    );
  }
}

// Widget memoizado
class ProductCard extends StatelessWidget {
  final Product product;

  const ProductCard({Key? key, required this.product}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: CachedNetworkImage(
          imageUrl: product.imageUrl,
          width: 60,
          height: 60,
          fit: BoxFit.cover,
          placeholder: (context, url) => const CircularProgressIndicator(),
          errorWidget: (context, url, error) => const Icon(Icons.error),
        ),
        title: Text(product.name),
        subtitle: Text('R\$ ${product.price.toStringAsFixed(2)}'),
        onTap: () => context.go('/product/${product.id}'),
      ),
    );
  }
}
```

### Const Constructors

```dart
// Use const sempre que possível
const Text('Hello');
const SizedBox(height: 16);
const Icon(Icons.home);

// Em widgets customizados
class MyWidget extends StatelessWidget {
  const MyWidget({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return const Column(
      children: [
        Text('Title'),
        SizedBox(height: 16),
        Text('Body'),
      ],
    );
  }
}
```

---

## 🧪 Testes

### Widget Tests

```dart
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('Counter increments', (WidgetTester tester) async {
    await tester.pumpWidget(const MyApp());

    expect(find.text('0'), findsOneWidget);
    expect(find.text('1'), findsNothing);

    await tester.tap(find.byIcon(Icons.add));
    await tester.pump();

    expect(find.text('0'), findsNothing);
    expect(find.text('1'), findsOneWidget);
  });

  testWidgets('Button shows loading state', (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: CustomButton(
            text: 'Submit',
            onPressed: () {},
            isLoading: true,
          ),
        ),
      ),
    );

    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    expect(find.text('Submit'), findsNothing);
  });
}
```

### Integration Tests

```dart
import 'package:integration_test/integration_test.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Login flow', (WidgetTester tester) async {
    await tester.pumpWidget(const MyApp());

    // Enter email
    await tester.enterText(
      find.byKey(const Key('email-field')),
      'user@example.com',
    );

    // Enter password
    await tester.enterText(
      find.byKey(const Key('password-field')),
      'password123',
    );

    // Tap login button
    await tester.tap(find.byKey(const Key('login-button')));
    await tester.pumpAndSettle();

    // Verify navigation to home
    expect(find.byKey(const Key('home-screen')), findsOneWidget);
  });
}
```

---

## 📦 Build e Deploy

### Android

```bash
# Build AAB
flutter build appbundle --release

# Build APK
flutter build apk --release --split-per-abi

# Output
# build/app/outputs/bundle/release/app-release.aab
# build/app/outputs/flutter-apk/app-armeabi-v7a-release.apk
```

### iOS

```bash
# Build iOS
flutter build ios --release

# Archive (via Xcode)
open ios/Runner.xcworkspace
# Product > Archive
```

---

## 📚 Recursos Adicionais

- **Documentação:** https://flutter.dev
- **Pub.dev:** https://pub.dev
- **Flutter Awesome:** https://flutterawesome.com

---

**Versão:** 2.0.0  
**Última Atualização:** 31/01/2026
