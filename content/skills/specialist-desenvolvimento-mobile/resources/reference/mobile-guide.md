# Guia - Desenvolvimento Mobile

## React Native Best Practices

### Performance
- Use FlatList para listas longas
- Memoize componentes com React.memo
- Otimize imagens (WebP, lazy loading)

### Navigation
```tsx
const Stack = createNativeStackNavigator();

<Stack.Navigator>
  <Stack.Screen name="Home" component={HomeScreen} />
  <Stack.Screen name="Details" component={DetailsScreen} />
</Stack.Navigator>
```

### State Management
- Context API para estado global simples
- Redux/Zustand para apps complexos
- React Query para cache de API

---

## Flutter Patterns

### Widget Tree
```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: HomeScreen(),
    );
  }
}
```

### State Management
- Provider para injeção de dependência
- Riverpod para estado reativo
- BLoC para apps complexos

---

## Mobile Performance

### Otimizações
1. Code splitting
2. Lazy loading de telas
3. Image optimization
4. Bundle size reduction
5. Hermes engine (React Native)

### Métricas
- FPS: >= 60
- TTI (Time to Interactive): < 3s
- Bundle size: < 20MB

---

## Store Guidelines

### App Store (iOS)
- Screenshots (6.5", 5.5")
- App icon (1024x1024)
- Privacy policy
- Review guidelines compliance

### Play Store (Android)
- Screenshots (phone, tablet)
- Feature graphic (1024x500)
- App icon (512x512)
- Content rating
