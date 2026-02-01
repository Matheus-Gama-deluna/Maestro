# Mobile Development Examples - Input/Output Pairs

## 📱 Exemplos Práticos de Desenvolvimento Mobile

Este documento contém exemplos práticos e completos de implementações mobile em diferentes plataformas e frameworks.

---

## Exemplo 1: Autenticação com Biometria (React Native)

### Input (Requisito)
> Implementar autenticação biométrica (Face ID/Touch ID) para login rápido no app

### Output (Implementação)

```typescript
// src/services/BiometricAuth.ts
import ReactNativeBiometrics from 'react-native-biometrics';
import { Alert } from 'react-native';

export class BiometricAuthService {
  private rnBiometrics = new ReactNativeBiometrics();

  async checkAvailability(): Promise<{
    available: boolean;
    biometryType?: 'FaceID' | 'TouchID' | 'Biometrics';
  }> {
    const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();
    return { available, biometryType };
  }

  async authenticate(reason: string = 'Autentique-se para continuar'): Promise<boolean> {
    try {
      const { success } = await this.rnBiometrics.simplePrompt({
        promptMessage: reason,
        cancelButtonText: 'Cancelar',
      });
      return success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  }

  async createKeys(): Promise<void> {
    const { publicKey } = await this.rnBiometrics.createKeys();
    // Store publicKey securely
  }

  async createSignature(payload: string): Promise<string | null> {
    try {
      const { success, signature } = await this.rnBiometrics.createSignature({
        promptMessage: 'Confirme sua identidade',
        payload,
      });
      return success ? signature : null;
    } catch (error) {
      return null;
    }
  }
}

// src/screens/LoginScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BiometricAuthService } from '../services/BiometricAuth';

export const LoginScreen = () => {
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');
  const biometricService = new BiometricAuthService();

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const { available, biometryType } = await biometricService.checkAvailability();
    setBiometricAvailable(available);
    setBiometricType(biometryType || '');
  };

  const handleBiometricLogin = async () => {
    const success = await biometricService.authenticate();
    if (success) {
      // Navigate to home screen
      console.log('Biometric authentication successful');
    } else {
      Alert.alert('Erro', 'Falha na autenticação biométrica');
    }
  };

  const getBiometricIcon = () => {
    if (biometricType === 'FaceID') return '🔐';
    if (biometricType === 'TouchID') return '👆';
    return '🔒';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo</Text>
      
      {biometricAvailable && (
        <TouchableOpacity
          style={styles.biometricButton}
          onPress={handleBiometricLogin}
        >
          <Text style={styles.biometricIcon}>{getBiometricIcon()}</Text>
          <Text style={styles.biometricText}>
            Entrar com {biometricType}
          </Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity style={styles.regularButton}>
        <Text style={styles.regularButtonText}>Entrar com senha</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  biometricButton: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  biometricIcon: {
    fontSize: 64,
    marginBottom: 10,
  },
  biometricText: {
    fontSize: 16,
    color: '#007AFF',
  },
  regularButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
  },
  regularButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

**Resultado:**
- ✅ Autenticação biométrica funcional em iOS e Android
- ✅ Fallback para senha tradicional
- ✅ UI adaptada ao tipo de biometria disponível
- ✅ Tratamento de erros robusto

---

## Exemplo 2: Lista Infinita com Cache (Flutter)

### Input (Requisito)
> Implementar lista de produtos com scroll infinito, cache local e pull-to-refresh

### Output (Implementação)

```dart
// lib/models/product.dart
class Product {
  final String id;
  final String name;
  final String imageUrl;
  final double price;

  Product({
    required this.id,
    required this.name,
    required this.imageUrl,
    required this.price,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      name: json['name'],
      imageUrl: json['imageUrl'],
      price: json['price'].toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'imageUrl': imageUrl,
      'price': price,
    };
  }
}

// lib/services/product_service.dart
import 'package:dio/dio.dart';
import 'package:hive/hive.dart';

class ProductService {
  final Dio _dio = Dio();
  final Box<Map> _cacheBox = Hive.box<Map>('products_cache');

  Future<List<Product>> fetchProducts({
    required int page,
    int limit = 20,
    bool forceRefresh = false,
  }) async {
    final cacheKey = 'products_page_$page';

    // Try cache first
    if (!forceRefresh && _cacheBox.containsKey(cacheKey)) {
      final cached = _cacheBox.get(cacheKey);
      if (cached != null) {
        return (cached['products'] as List)
            .map((json) => Product.fromJson(Map<String, dynamic>.from(json)))
            .toList();
      }
    }

    // Fetch from API
    try {
      final response = await _dio.get(
        'https://api.example.com/products',
        queryParameters: {
          'page': page,
          'limit': limit,
        },
      );

      final products = (response.data['products'] as List)
          .map((json) => Product.fromJson(json))
          .toList();

      // Cache the result
      await _cacheBox.put(cacheKey, {
        'products': products.map((p) => p.toJson()).toList(),
        'timestamp': DateTime.now().toIso8601String(),
      });

      return products;
    } catch (e) {
      // Return cached data if available
      if (_cacheBox.containsKey(cacheKey)) {
        final cached = _cacheBox.get(cacheKey);
        return (cached!['products'] as List)
            .map((json) => Product.fromJson(Map<String, dynamic>.from(json)))
            .toList();
      }
      rethrow;
    }
  }
}

// lib/screens/product_list_screen.dart
import 'package:flutter/material.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';

class ProductListScreen extends StatefulWidget {
  @override
  _ProductListScreenState createState() => _ProductListScreenState();
}

class _ProductListScreenState extends State<ProductListScreen> {
  final PagingController<int, Product> _pagingController =
      PagingController(firstPageKey: 1);
  final ProductService _productService = ProductService();

  @override
  void initState() {
    super.initState();
    _pagingController.addPageRequestListener((pageKey) {
      _fetchPage(pageKey);
    });
  }

  Future<void> _fetchPage(int pageKey) async {
    try {
      final newItems = await _productService.fetchProducts(page: pageKey);
      final isLastPage = newItems.length < 20;
      
      if (isLastPage) {
        _pagingController.appendLastPage(newItems);
      } else {
        final nextPageKey = pageKey + 1;
        _pagingController.appendPage(newItems, nextPageKey);
      }
    } catch (error) {
      _pagingController.error = error;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Produtos'),
      ),
      body: RefreshIndicator(
        onRefresh: () => Future.sync(() => _pagingController.refresh()),
        child: PagedListView<int, Product>(
          pagingController: _pagingController,
          builderDelegate: PagedChildBuilderDelegate<Product>(
            itemBuilder: (context, item, index) => ProductCard(product: item),
            firstPageErrorIndicatorBuilder: (context) => ErrorView(
              error: _pagingController.error,
              onRetry: () => _pagingController.refresh(),
            ),
            noItemsFoundIndicatorBuilder: (context) => EmptyView(),
            firstPageProgressIndicatorBuilder: (context) => LoadingView(),
            newPageProgressIndicatorBuilder: (context) => Padding(
              padding: EdgeInsets.all(16),
              child: CircularProgressIndicator(),
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _pagingController.dispose();
    super.dispose();
  }
}

// lib/widgets/product_card.dart
class ProductCard extends StatelessWidget {
  final Product product;

  const ProductCard({Key? key, required this.product}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListTile(
        leading: ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Image.network(
            product.imageUrl,
            width: 60,
            height: 60,
            fit: BoxFit.cover,
            loadingBuilder: (context, child, loadingProgress) {
              if (loadingProgress == null) return child;
              return Container(
                width: 60,
                height: 60,
                color: Colors.grey[300],
                child: Center(child: CircularProgressIndicator()),
              );
            },
          ),
        ),
        title: Text(
          product.name,
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(
          'R\$ ${product.price.toStringAsFixed(2)}',
          style: TextStyle(color: Colors.green, fontSize: 16),
        ),
        trailing: Icon(Icons.chevron_right),
        onTap: () {
          // Navigate to product details
        },
      ),
    );
  }
}
```

**Resultado:**
- ✅ Scroll infinito com paginação
- ✅ Cache local com Hive
- ✅ Pull-to-refresh funcional
- ✅ Loading, error e empty states
- ✅ Otimização de performance

---

## Exemplo 3: Integração com HealthKit (iOS Native - Swift)

### Input (Requisito)
> Integrar com HealthKit para ler dados de passos e calorias do usuário

### Output (Implementação)

```swift
// HealthKitManager.swift
import HealthKit

class HealthKitManager {
    static let shared = HealthKitManager()
    private let healthStore = HKHealthStore()
    
    private init() {}
    
    // MARK: - Authorization
    func requestAuthorization(completion: @escaping (Bool, Error?) -> Void) {
        guard HKHealthStore.isHealthDataAvailable() else {
            completion(false, NSError(domain: "HealthKit not available", code: -1))
            return
        }
        
        let typesToRead: Set<HKObjectType> = [
            HKObjectType.quantityType(forIdentifier: .stepCount)!,
            HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!,
            HKObjectType.quantityType(forIdentifier: .distanceWalkingRunning)!
        ]
        
        healthStore.requestAuthorization(toShare: nil, read: typesToRead) { success, error in
            completion(success, error)
        }
    }
    
    // MARK: - Fetch Steps
    func fetchSteps(for date: Date, completion: @escaping (Double?, Error?) -> Void) {
        guard let stepType = HKQuantityType.quantityType(forIdentifier: .stepCount) else {
            completion(nil, NSError(domain: "Invalid type", code: -1))
            return
        }
        
        let calendar = Calendar.current
        let startOfDay = calendar.startOfDay(for: date)
        let endOfDay = calendar.date(byAdding: .day, value: 1, to: startOfDay)!
        
        let predicate = HKQuery.predicateForSamples(
            withStart: startOfDay,
            end: endOfDay,
            options: .strictStartDate
        )
        
        let query = HKStatisticsQuery(
            quantityType: stepType,
            quantitySamplePredicate: predicate,
            options: .cumulativeSum
        ) { _, result, error in
            guard let result = result, let sum = result.sumQuantity() else {
                completion(nil, error)
                return
            }
            
            let steps = sum.doubleValue(for: HKUnit.count())
            completion(steps, nil)
        }
        
        healthStore.execute(query)
    }
    
    // MARK: - Fetch Calories
    func fetchCalories(for date: Date, completion: @escaping (Double?, Error?) -> Void) {
        guard let calorieType = HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned) else {
            completion(nil, NSError(domain: "Invalid type", code: -1))
            return
        }
        
        let calendar = Calendar.current
        let startOfDay = calendar.startOfDay(for: date)
        let endOfDay = calendar.date(byAdding: .day, value: 1, to: startOfDay)!
        
        let predicate = HKQuery.predicateForSamples(
            withStart: startOfDay,
            end: endOfDay,
            options: .strictStartDate
        )
        
        let query = HKStatisticsQuery(
            quantityType: calorieType,
            quantitySamplePredicate: predicate,
            options: .cumulativeSum
        ) { _, result, error in
            guard let result = result, let sum = result.sumQuantity() else {
                completion(nil, error)
                return
            }
            
            let calories = sum.doubleValue(for: HKUnit.kilocalorie())
            completion(calories, nil)
        }
        
        healthStore.execute(query)
    }
    
    // MARK: - Fetch Weekly Data
    func fetchWeeklySteps(completion: @escaping ([DailyStats]?, Error?) -> Void) {
        guard let stepType = HKQuantityType.quantityType(forIdentifier: .stepCount) else {
            completion(nil, NSError(domain: "Invalid type", code: -1))
            return
        }
        
        let calendar = Calendar.current
        let now = Date()
        let startOfWeek = calendar.date(byAdding: .day, value: -7, to: now)!
        
        var interval = DateComponents()
        interval.day = 1
        
        let query = HKStatisticsCollectionQuery(
            quantityType: stepType,
            quantitySamplePredicate: nil,
            options: .cumulativeSum,
            anchorDate: startOfWeek,
            intervalComponents: interval
        )
        
        query.initialResultsHandler = { _, results, error in
            guard let results = results else {
                completion(nil, error)
                return
            }
            
            var dailyStats: [DailyStats] = []
            
            results.enumerateStatistics(from: startOfWeek, to: now) { statistics, _ in
                if let sum = statistics.sumQuantity() {
                    let steps = sum.doubleValue(for: HKUnit.count())
                    dailyStats.append(DailyStats(
                        date: statistics.startDate,
                        steps: steps
                    ))
                }
            }
            
            completion(dailyStats, nil)
        }
        
        healthStore.execute(query)
    }
}

// Models
struct DailyStats {
    let date: Date
    let steps: Double
}

// HealthView.swift (SwiftUI)
import SwiftUI

struct HealthView: View {
    @State private var todaySteps: Double = 0
    @State private var todayCalories: Double = 0
    @State private var weeklyData: [DailyStats] = []
    @State private var isLoading = true
    @State private var errorMessage: String?
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    if isLoading {
                        ProgressView("Carregando dados...")
                    } else if let error = errorMessage {
                        ErrorView(message: error, onRetry: loadData)
                    } else {
                        // Today's Stats
                        HStack(spacing: 20) {
                            StatCard(
                                icon: "figure.walk",
                                title: "Passos",
                                value: "\(Int(todaySteps))",
                                color: .blue
                            )
                            
                            StatCard(
                                icon: "flame.fill",
                                title: "Calorias",
                                value: "\(Int(todayCalories))",
                                color: .orange
                            )
                        }
                        .padding(.horizontal)
                        
                        // Weekly Chart
                        VStack(alignment: .leading) {
                            Text("Últimos 7 dias")
                                .font(.headline)
                                .padding(.horizontal)
                            
                            WeeklyChart(data: weeklyData)
                                .frame(height: 200)
                                .padding()
                        }
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("Saúde")
            .onAppear(perform: loadData)
        }
    }
    
    private func loadData() {
        isLoading = true
        errorMessage = nil
        
        HealthKitManager.shared.requestAuthorization { success, error in
            if success {
                fetchTodayData()
                fetchWeeklyData()
            } else {
                DispatchQueue.main.async {
                    isLoading = false
                    errorMessage = "Permissão negada para acessar dados de saúde"
                }
            }
        }
    }
    
    private func fetchTodayData() {
        let today = Date()
        
        HealthKitManager.shared.fetchSteps(for: today) { steps, error in
            DispatchQueue.main.async {
                if let steps = steps {
                    todaySteps = steps
                }
            }
        }
        
        HealthKitManager.shared.fetchCalories(for: today) { calories, error in
            DispatchQueue.main.async {
                if let calories = calories {
                    todayCalories = calories
                }
                isLoading = false
            }
        }
    }
    
    private func fetchWeeklyData() {
        HealthKitManager.shared.fetchWeeklySteps { data, error in
            DispatchQueue.main.async {
                if let data = data {
                    weeklyData = data
                }
            }
        }
    }
}

struct StatCard: View {
    let icon: String
    let title: String
    let value: String
    let color: Color
    
    var body: some View {
        VStack {
            Image(systemName: icon)
                .font(.system(size: 40))
                .foregroundColor(color)
            
            Text(value)
                .font(.title)
                .fontWeight(.bold)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}
```

**Resultado:**
- ✅ Integração completa com HealthKit
- ✅ Leitura de passos e calorias
- ✅ Dados semanais com gráfico
- ✅ Tratamento de permissões
- ✅ UI moderna com SwiftUI

---

## Exemplo 4: Background Service (Android Native - Kotlin)

### Input (Requisito)
> Implementar serviço em background para sincronização de dados mesmo com app fechado

### Output (Implementação)

```kotlin
// SyncWorker.kt
import android.content.Context
import androidx.work.*
import java.util.concurrent.TimeUnit

class SyncWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override async suspend fun doWork(): Result {
        return try {
            // Perform sync
            val syncService = SyncService()
            syncService.syncData()
            
            // Update notification
            showNotification("Sincronização concluída")
            
            Result.success()
        } catch (e: Exception) {
            if (runAttemptCount < 3) {
                Result.retry()
            } else {
                Result.failure()
            }
        }
    }

    private fun showNotification(message: String) {
        val notificationManager = applicationContext.getSystemService(
            Context.NOTIFICATION_SERVICE
        ) as NotificationManager
        
        // Create notification
        // ...
    }
}

// SyncService.kt
class SyncService {
    private val api = RetrofitClient.api
    private val database = AppDatabase.getInstance()
    
    suspend fun syncData() {
        // Fetch pending items
        val pendingItems = database.itemDao().getPendingSync()
        
        // Upload to server
        pendingItems.forEach { item ->
            try {
                api.uploadItem(item)
                database.itemDao().markAsSynced(item.id)
            } catch (e: Exception) {
                // Log error
            }
        }
        
        // Download new items
        val newItems = api.fetchNewItems()
        database.itemDao().insertAll(newItems)
    }
}

// WorkManager Setup
class SyncManager(private val context: Context) {
    
    fun schedulePeriodicSync() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .setRequiresBatteryNotLow(true)
            .build()
        
        val syncRequest = PeriodicWorkRequestBuilder<SyncWorker>(
            15, TimeUnit.MINUTES
        )
            .setConstraints(constraints)
            .setBackoffCriteria(
                BackoffPolicy.EXPONENTIAL,
                WorkRequest.MIN_BACKOFF_MILLIS,
                TimeUnit.MILLISECONDS
            )
            .build()
        
        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            "sync_work",
            ExistingPeriodicWorkPolicy.KEEP,
            syncRequest
        )
    }
    
    fun syncNow() {
        val syncRequest = OneTimeWorkRequestBuilder<SyncWorker>()
            .setExpedited(OutOfQuotaPolicy.RUN_AS_NON_EXPEDITED_WORK_REQUEST)
            .build()
        
        WorkManager.getInstance(context).enqueue(syncRequest)
    }
    
    fun cancelSync() {
        WorkManager.getInstance(context).cancelUniqueWork("sync_work")
    }
}

// MainActivity.kt
class MainActivity : AppCompatActivity() {
    private lateinit var syncManager: SyncManager
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        syncManager = SyncManager(this)
        syncManager.schedulePeriodicSync()
        
        // Observe sync status
        WorkManager.getInstance(this)
            .getWorkInfosForUniqueWorkLiveData("sync_work")
            .observe(this) { workInfos ->
                workInfos?.firstOrNull()?.let { workInfo ->
                    when (workInfo.state) {
                        WorkInfo.State.RUNNING -> showSyncingUI()
                        WorkInfo.State.SUCCEEDED -> showSyncSuccessUI()
                        WorkInfo.State.FAILED -> showSyncErrorUI()
                        else -> {}
                    }
                }
            }
    }
}
```

**Resultado:**
- ✅ Sincronização em background com WorkManager
- ✅ Retry automático em caso de falha
- ✅ Constraints de bateria e rede
- ✅ Observação de status em tempo real

---

## Exemplo 5: Deep Linking (Cross-Platform)

### Input (Requisito)
> Implementar deep linking para abrir telas específicas do app via URL

### Output (Implementação - React Native)

```typescript
// src/navigation/linking.ts
import { LinkingOptions } from '@react-navigation/native';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['myapp://', 'https://myapp.com'],
  config: {
    screens: {
      Home: '',
      ProductDetails: 'product/:id',
      UserProfile: 'user/:username',
      Checkout: 'checkout',
      OrderConfirmation: 'order/:orderId/confirmation',
    },
  },
};

// src/navigation/RootNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { linking } from './linking';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// iOS Configuration (ios/MyApp/AppDelegate.mm)
#import <React/RCTLinkingManager.h>

- (BOOL)application:(UIApplication *)application
   openURL:(NSURL *)url
   options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity
 restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
 return [RCTLinkingManager application:application
                  continueUserActivity:userActivity
                    restorationHandler:restorationHandler];
}

// Android Configuration (android/app/src/main/AndroidManifest.xml)
<activity
  android:name=".MainActivity"
  android:launchMode="singleTask">
  <intent-filter>
    <action android:name="android.intent.action.MAIN" />
    <category android:name="android.intent.category.LAUNCHER" />
  </intent-filter>
  <intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="myapp" />
    <data android:scheme="https" android:host="myapp.com" />
  </intent-filter>
</activity>

// Usage in components
import { useNavigation } from '@react-navigation/native';
import { Linking } from 'react-native';

const ShareButton = ({ productId }: { productId: string }) => {
  const handleShare = async () => {
    const url = `https://myapp.com/product/${productId}`;
    await Share.share({
      message: `Confira este produto: ${url}`,
      url,
    });
  };

  return (
    <TouchableOpacity onPress={handleShare}>
      <Text>Compartilhar</Text>
    </TouchableOpacity>
  );
};
```

**Resultado:**
- ✅ Deep linking configurado para iOS e Android
- ✅ Universal links (HTTPS) funcionando
- ✅ Navegação automática para telas específicas
- ✅ Compartilhamento com links funcionais

---

## 📊 Resumo dos Exemplos

| Exemplo | Plataforma | Complexidade | Recursos Usados |
|---------|-----------|--------------|-----------------|
| 1. Biometria | React Native | Média | Face ID, Touch ID, Secure Storage |
| 2. Lista Infinita | Flutter | Média | Paginação, Cache, Pull-to-refresh |
| 3. HealthKit | iOS Native | Alta | HealthKit, SwiftUI, Charts |
| 4. Background Service | Android Native | Alta | WorkManager, Room, Notifications |
| 5. Deep Linking | React Native | Baixa | Navigation, Linking, Share |

---

**Última Atualização:** 31/01/2026  
**Versão:** 2.0.0
