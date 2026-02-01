# Android Native Development Guide (Kotlin/Jetpack Compose)

## 📱 Guia Completo de Desenvolvimento Android Nativo

**Versão:** 2.0.0  
**Kotlin:** 1.9+  
**Android:** 10.0+ (API 29+)  
**Android Studio:** Hedgehog+  
**Última Atualização:** 31/01/2026

---

## 🎯 Visão Geral

Desenvolvimento Android nativo com Kotlin e Jetpack Compose oferece performance máxima e acesso completo às APIs do Android. Jetpack Compose é o framework declarativo moderno do Google para construir interfaces de usuário.

### Quando Usar Android Nativo

✅ **Ideal para:**
- Performance crítica
- Integração com Google Services
- Recursos específicos do Android
- Apps Android-first ou Android-only
- Controle total sobre a plataforma

❌ **Evitar para:**
- Necessidade de iOS também (custo duplicado)
- Time sem expertise Android
- Budget limitado
- Time-to-market muito crítico

---

## 🏗️ Arquitetura MVVM com Jetpack Compose

```
app/
├── src/main/
│   ├── java/com/example/myapp/
│   │   ├── MainActivity.kt
│   │   ├── MyApplication.kt
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── ui/
│   │   │   │   │   ├── LoginScreen.kt
│   │   │   │   │   └── SignUpScreen.kt
│   │   │   │   ├── viewmodel/
│   │   │   │   │   └── AuthViewModel.kt
│   │   │   │   ├── data/
│   │   │   │   │   ├── repository/
│   │   │   │   │   └── model/
│   │   │   │   └── domain/
│   │   │   │       └── usecase/
│   │   │   └── products/
│   │   ├── core/
│   │   │   ├── network/
│   │   │   ├── database/
│   │   │   └── util/
│   │   ├── ui/
│   │   │   ├── components/
│   │   │   ├── theme/
│   │   │   └── navigation/
│   │   └── di/
│   └── res/
│       ├── values/
│       ├── drawable/
│       └── mipmap/
```

---

## 🚀 Jetpack Compose Basics

### Composables

```kotlin
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier

@Composable
fun CounterScreen() {
    var count by remember { mutableStateOf(0) }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Count: $count",
            style = MaterialTheme.typography.headlineLarge
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Button(onClick = { count++ }) {
            Text("Increment")
        }
    }
}

// Custom Composable
@Composable
fun CustomCard(
    title: String,
    content: String,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleLarge
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = content,
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}
```

### State Management

```kotlin
// ViewModel com StateFlow
class ProductViewModel @Inject constructor(
    private val repository: ProductRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow<ProductUiState>(ProductUiState.Loading)
    val uiState: StateFlow<ProductUiState> = _uiState.asStateFlow()
    
    init {
        loadProducts()
    }
    
    fun loadProducts() {
        viewModelScope.launch {
            _uiState.value = ProductUiState.Loading
            try {
                val products = repository.getProducts()
                _uiState.value = ProductUiState.Success(products)
            } catch (e: Exception) {
                _uiState.value = ProductUiState.Error(e.message ?: "Unknown error")
            }
        }
    }
}

sealed class ProductUiState {
    object Loading : ProductUiState()
    data class Success(val products: List<Product>) : ProductUiState()
    data class Error(val message: String) : ProductUiState()
}

// Uso no Composable
@Composable
fun ProductListScreen(viewModel: ProductViewModel = hiltViewModel()) {
    val uiState by viewModel.uiState.collectAsState()
    
    when (uiState) {
        is ProductUiState.Loading -> LoadingIndicator()
        is ProductUiState.Success -> {
            val products = (uiState as ProductUiState.Success).products
            LazyColumn {
                items(products) { product ->
                    ProductCard(product = product)
                }
            }
        }
        is ProductUiState.Error -> {
            val message = (uiState as ProductUiState.Error).message
            ErrorView(message = message)
        }
    }
}
```

---

## 🧭 Navegação

### Navigation Compose

```kotlin
// Navigation Graph
@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    
    NavHost(
        navController = navController,
        startDestination = "home"
    ) {
        composable("home") {
            HomeScreen(
                onProductClick = { productId ->
                    navController.navigate("product/$productId")
                }
            )
        }
        
        composable(
            route = "product/{productId}",
            arguments = listOf(navArgument("productId") { type = NavType.StringType })
        ) { backStackEntry ->
            val productId = backStackEntry.arguments?.getString("productId")
            ProductDetailScreen(
                productId = productId,
                onBack = { navController.popBackStack() }
            )
        }
        
        composable("profile") {
            ProfileScreen()
        }
    }
}

// Bottom Navigation
@Composable
fun MainScreen() {
    val navController = rememberNavController()
    
    Scaffold(
        bottomBar = {
            NavigationBar {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route
                
                NavigationBarItem(
                    icon = { Icon(Icons.Filled.Home, contentDescription = "Home") },
                    label = { Text("Home") },
                    selected = currentRoute == "home",
                    onClick = { navController.navigate("home") }
                )
                
                NavigationBarItem(
                    icon = { Icon(Icons.Filled.Search, contentDescription = "Search") },
                    label = { Text("Search") },
                    selected = currentRoute == "search",
                    onClick = { navController.navigate("search") }
                )
                
                NavigationBarItem(
                    icon = { Icon(Icons.Filled.Person, contentDescription = "Profile") },
                    label = { Text("Profile") },
                    selected = currentRoute == "profile",
                    onClick = { navController.navigate("profile") }
                )
            }
        }
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = "home",
            modifier = Modifier.padding(paddingValues)
        ) {
            composable("home") { HomeScreen() }
            composable("search") { SearchScreen() }
            composable("profile") { ProfileScreen() }
        }
    }
}
```

---

## 📡 Networking

### Retrofit + Coroutines

```kotlin
// API Service
interface ApiService {
    @GET("products")
    suspend fun getProducts(): List<Product>
    
    @GET("products/{id}")
    suspend fun getProduct(@Path("id") id: String): Product
    
    @POST("products")
    suspend fun createProduct(@Body product: NewProduct): Product
}

// Retrofit Setup
object RetrofitClient {
    private const val BASE_URL = "https://api.example.com/"
    
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        })
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()
    
    val apiService: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}

// Repository
class ProductRepository @Inject constructor(
    private val apiService: ApiService
) {
    suspend fun getProducts(): List<Product> {
        return withContext(Dispatchers.IO) {
            apiService.getProducts()
        }
    }
    
    suspend fun getProduct(id: String): Product {
        return withContext(Dispatchers.IO) {
            apiService.getProduct(id)
        }
    }
}
```

---

## 💾 Persistência

### Room Database

```kotlin
// Entity
@Entity(tableName = "products")
data class ProductEntity(
    @PrimaryKey val id: String,
    val name: String,
    val price: Double,
    val imageUrl: String
)

// DAO
@Dao
interface ProductDao {
    @Query("SELECT * FROM products")
    fun getAllProducts(): Flow<List<ProductEntity>>
    
    @Query("SELECT * FROM products WHERE id = :id")
    suspend fun getProduct(id: String): ProductEntity?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProducts(products: List<ProductEntity>)
    
    @Delete
    suspend fun deleteProduct(product: ProductEntity)
}

// Database
@Database(entities = [ProductEntity::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun productDao(): ProductDao
    
    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null
        
        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "app_database"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
```

### DataStore (Preferences)

```kotlin
// DataStore Setup
val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

class SettingsRepository(private val context: Context) {
    private val THEME_KEY = booleanPreferencesKey("dark_theme")
    
    val isDarkTheme: Flow<Boolean> = context.dataStore.data
        .map { preferences ->
            preferences[THEME_KEY] ?: false
        }
    
    suspend fun setDarkTheme(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[THEME_KEY] = enabled
        }
    }
}
```

---

## 🧪 Testes

### Unit Tests

```kotlin
class ProductViewModelTest {
    @get:Rule
    val instantExecutorRule = InstantTaskExecutorRule()
    
    private lateinit var viewModel: ProductViewModel
    private lateinit var repository: ProductRepository
    
    @Before
    fun setup() {
        repository = mockk()
        viewModel = ProductViewModel(repository)
    }
    
    @Test
    fun `loadProducts should update uiState to Success`() = runTest {
        val products = listOf(
            Product("1", "Product 1", 10.0, "url1"),
            Product("2", "Product 2", 20.0, "url2")
        )
        coEvery { repository.getProducts() } returns products
        
        viewModel.loadProducts()
        
        val uiState = viewModel.uiState.value
        assertTrue(uiState is ProductUiState.Success)
        assertEquals(products, (uiState as ProductUiState.Success).products)
    }
}
```

### UI Tests (Compose)

```kotlin
class LoginScreenTest {
    @get:Rule
    val composeTestRule = createComposeRule()
    
    @Test
    fun loginButton_isDisabled_whenFieldsAreEmpty() {
        composeTestRule.setContent {
            LoginScreen()
        }
        
        composeTestRule
            .onNodeWithTag("login-button")
            .assertIsNotEnabled()
    }
    
    @Test
    fun loginButton_isEnabled_whenFieldsAreFilled() {
        composeTestRule.setContent {
            LoginScreen()
        }
        
        composeTestRule
            .onNodeWithTag("email-field")
            .performTextInput("user@example.com")
        
        composeTestRule
            .onNodeWithTag("password-field")
            .performTextInput("password123")
        
        composeTestRule
            .onNodeWithTag("login-button")
            .assertIsEnabled()
    }
}
```

---

## 📦 Build e Deploy

### Gradle Configuration

```kotlin
// build.gradle.kts (app)
android {
    namespace = "com.example.myapp"
    compileSdk = 34
    
    defaultConfig {
        applicationId = "com.example.myapp"
        minSdk = 29
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }
    
    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
}
```

### Build Commands

```bash
# Build AAB (Google Play)
./gradlew bundleRelease

# Build APK
./gradlew assembleRelease

# Output
# app/build/outputs/bundle/release/app-release.aab
# app/build/outputs/apk/release/app-release.apk
```

---

## 📚 Recursos Adicionais

- **Documentação:** https://developer.android.com
- **Jetpack Compose:** https://developer.android.com/jetpack/compose
- **Material Design 3:** https://m3.material.io

---

**Versão:** 2.0.0  
**Última Atualização:** 31/01/2026
