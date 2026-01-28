# Prompt: Mobile Android Development

> **Quando usar:** Desenvolver aplicativos Android nativos ou cross-platform  
> **Especialista:** Desenvolvimento Mobile  
> **Nível:** Médio  
> **Pré-requisitos:** Design mobile aprovado, requisitos mobile definidos

---

## Fluxo de Contexto
**Inputs:** design-doc.md, requisitos mobile, API contracts  
**Outputs:** App Android, testes, deploy na Play Store  
**Especialista anterior:** UX Design  
**Especialista seguinte:** DevOps e Infraestrutura

---

## Prompt Completo

Atue como um **Mobile Developer Sênior** especializado em desenvolvimento Android com Kotlin, Jetpack Compose e melhores práticas do Google.

## Contexto do Projeto
[COLE CONTEÚDO DE docs/03-ux/design-doc.md]

[COLE REQUISITOS MOBILE ESPECÍFICOS]

[COLE CONTRATOS DE API RELEVANTES]

## Sua Missão
Desenvolver um **aplicativo Android completo** seguindo as diretrizes do Google, com UX nativo, performance otimizada e integração total com o backend existente.

### Arquitetura Android

#### 1. Stack Tecnológico
- **Language:** Kotlin 1.9+
- **UI Framework:** Jetpack Compose (BOM 2023.10+)
- **Architecture:** MVVM + Clean Architecture
- **Networking:** Retrofit + OkHttp
- **Data Persistence:** Room + DataStore
- **Dependency Injection:** Hilt
- **Async Programming:** Kotlin Coroutines + Flow
- **Testing:** JUnit 5 + Espresso + Mockk

#### 2. Estrutura de Projeto
```
app/
├── src/main/java/com/myapp/
│   ├── di/                     # Dependency injection modules
│   ├── data/
│   │   ├── local/             # Room database, DataStore
│   │   ├── remote/            # Retrofit APIs
│   │   └── repository/        # Repository implementations
│   ├── domain/
│   │   ├── model/             # Domain models
│   │   ├── repository/        # Repository interfaces
│   │   └── usecase/           # Business logic use cases
│   ├── presentation/
│   │   ├── ui/
│   │   │   ├── theme/         # Material 3 theme
│   │   │   ├── components/    # Reusable UI components
│   │   │   └── screens/       # Screen composables
│   │   ├── viewmodel/         # ViewModels
│   │   └── navigation/        # Navigation setup
│   └── util/                  # Utility functions
├── src/test/                   # Unit tests
├── src/androidTest/            # Integration tests
└── build.gradle.kts           # Build configuration
```

#### 3. Arquitetura MVVM + Clean
```kotlin
// Domain Model
data class User(
    val id: String,
    val name: String,
    val email: String,
    val avatar: String? = null
)

// Repository Interface
interface UserRepository {
    suspend fun getUsers(): Result<List<User>>
    suspend fun createUser(user: User): Result<User>
    suspend fun updateUser(user: User): Result<User>
    suspend fun deleteUser(id: String): Result<Unit>
}

// Use Case
class GetUsersUseCase @Inject constructor(
    private val repository: UserRepository
) {
    suspend operator fun invoke(): Result<List<User>> {
        return repository.getUsers()
    }
}

// ViewModel
@HiltViewModel
class UserViewModel @Inject constructor(
    private val getUsersUseCase: GetUsersUseCase
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(UserUiState())
    val uiState: StateFlow<UserUiState> = _uiState.asStateFlow()
    
    init {
        loadUsers()
    }
    
    private fun loadUsers() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            
            getUsersUseCase()
                .onSuccess { users ->
                    _uiState.update { 
                        it.copy(
                            isLoading = false,
                            users = users
                        )
                    }
                }
                .onFailure { error ->
                    _uiState.update { 
                        it.copy(
                            isLoading = false,
                            error = error.message
                        )
                    }
                }
        }
    }
}

data class UserUiState(
    val isLoading: Boolean = false,
    val users: List<User> = emptyList(),
    val error: String? = null
)

// Composable Screen
@Composable
fun UserScreen(
    viewModel: UserViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
    when {
        uiState.isLoading -> {
            LoadingScreen()
        }
        uiState.error != null -> {
            ErrorScreen(message = uiState.error)
        }
        else -> {
            UserListScreen(users = uiState.users)
        }
    }
}
```

### Componentes Principais

#### 1. Navigation Structure
```kotlin
// Navigation Setup
@Composable
fun MyAppNavigation() {
    val navController = rememberNavController()
    
    NavHost(
        navController = navController,
        startDestination = Screen.Dashboard.route
    ) {
        composable(Screen.Dashboard.route) {
            DashboardScreen(navController = navController)
        }
        composable(Screen.Profile.route) {
            ProfileScreen(navController = navController)
        }
        composable(Screen.Settings.route) {
            SettingsScreen(navController = navController)
        }
    }
}

// Bottom Navigation
@Composable
fun BottomNavigationBar(
    navController: NavController
) {
    val screens = listOf(
        Screen.Dashboard,
        Screen.Profile,
        Screen.Settings
    )
    
    BottomNavigation(
        backgroundColor = MaterialTheme.colorScheme.surface,
        elevation = 8.dp
    ) {
        screens.forEach { screen ->
            BottomNavigationItem(
                icon = { Icon(screen.icon, contentDescription = null) },
                label = { Text(screen.title) },
                selected = currentRoute(navController) == screen.route,
                onClick = {
                    navController.navigate(screen.route) {
                        popUpTo(navController.graph.findStartDestination().id) {
                            saveState = true
                        }
                        launchSingleTop = true
                        restoreState = true
                    }
                }
            )
        }
    }
}

@Composable
fun MainScreen() {
    val navController = rememberNavController()
    
    Scaffold(
        bottomBar = { BottomNavigationBar(navController) }
    ) { paddingValues ->
        MyAppNavigation()
    }
}
```

#### 2. Authentication Flow
```kotlin
@Composable
fun AuthenticationScreen(
    onAuthSuccess: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Logo
        Image(
            painter = painterResource(id = R.drawable.app_logo),
            contentDescription = "App Logo",
            modifier = Modifier
                .size(120.dp)
                .padding(bottom = 32.dp)
        )
        
        // Email Field
        OutlinedTextField(
            value = uiState.email,
            onValueChange = { viewModel.onEmailChange(it) },
            label = { Text("Email") },
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Email,
                imeAction = ImeAction.Next
            ),
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Password Field
        OutlinedTextField(
            value = uiState.password,
            onValueChange = { viewModel.onPasswordChange(it) },
            label = { Text("Password") },
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Password,
                imeAction = ImeAction.Done
            ),
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Sign In Button
        Button(
            onClick = { viewModel.signIn() },
            enabled = uiState.isFormValid && !uiState.isLoading,
            modifier = Modifier.fillMaxWidth()
        ) {
            if (uiState.isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    color = MaterialTheme.colorScheme.onPrimary
                )
            } else {
                Text("Sign In")
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Sign Up Link
        Row(
            horizontalArrangement = Arrangement.Center
        ) {
            Text("Don't have an account? ")
            TextButton(onClick = { /* Navigate to sign up */ }) {
                Text("Sign Up")
            }
        }
    }
    
    // Handle auth success
    LaunchedEffect(uiState.isAuthenticated) {
        if (uiState.isAuthenticated) {
            onAuthSuccess()
        }
    }
    
    // Show error
    uiState.error?.let { error ->
        LaunchedEffect(error) {
            // Show snackbar or dialog
        }
    }
}
```

#### 3. API Integration
```kotlin
// Network Module
@Module
@InstallIn(SingletonComponent)
object NetworkModule {
    
    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = if (BuildConfig.DEBUG) {
                    HttpLoggingInterceptor.Level.BODY
                } else {
                    HttpLoggingInterceptor.Level.NONE
                }
            })
            .addInterceptor(AuthInterceptor())
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
    }
    
    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl("https://api.example.com/")
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    
    @Provides
    @Singleton
    fun provideApiService(retrofit: Retrofit): ApiService {
        return retrofit.create(ApiService::class.java)
    }
}

// API Service
interface ApiService {
    @GET("users")
    suspend fun getUsers(): Response<List<UserDto>>
    
    @POST("users")
    suspend fun createUser(@Body user: CreateUserDto): Response<UserDto>
    
    @PUT("users/{id}")
    suspend fun updateUser(
        @Path("id") id: String,
        @Body user: UpdateUserDto
    ): Response<UserDto>
    
    @DELETE("users/{id}")
    suspend fun deleteUser(@Path("id") id: String): Response<Unit>
}

// Repository Implementation
@Singleton
class UserRepositoryImpl @Inject constructor(
    private val apiService: ApiService,
    private val userDao: UserDao,
    private val userMapper: UserMapper
) : UserRepository {
    
    override suspend fun getUsers(): Result<List<User>> {
        return try {
            // Try network first
            val response = apiService.getUsers()
            if (response.isSuccessful) {
                val users = response.body()?.map { userMapper.toDomain(it) } ?: emptyList()
                
                // Cache locally
                cacheUsers(users)
                
                Result.success(users)
            } else {
                // Fallback to cache
                val cachedUsers = getCachedUsers()
                Result.success(cachedUsers)
            }
        } catch (e: Exception) {
            // Network error, try cache
            val cachedUsers = getCachedUsers()
            if (cachedUsers.isNotEmpty()) {
                Result.success(cachedUsers)
            } else {
                Result.failure(e)
            }
        }
    }
    
    private suspend fun cacheUsers(users: List<User>) {
        userDao.clearAll()
        userDao.insertAll(users.map { userMapper.toEntity(it) })
    }
    
    private suspend fun getCachedUsers(): List<User> {
        return userDao.getAll().map { userMapper.toDomain(it) }
    }
}
```

#### 4. Database with Room
```kotlin
// Database Entities
@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val id: String,
    val name: String,
    val email: String,
    val avatar: String?,
    val createdAt: Long = System.currentTimeMillis()
)

// DAO
@Dao
interface UserDao {
    @Query("SELECT * FROM users")
    suspend fun getAll(): List<UserEntity>
    
    @Query("SELECT * FROM users WHERE id = :id")
    suspend fun getById(id: String): UserEntity?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(users: List<UserEntity>)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(user: UserEntity)
    
    @Query("DELETE FROM users")
    suspend fun clearAll()
    
    @Delete
    suspend fun delete(user: UserEntity)
}

// Database
@Database(
    entities = [UserEntity::class],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
    
    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null
        
        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "app_database"
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}

// Database Module
@Module
@InstallIn(SingletonComponent)
object DatabaseModule {
    
    @Provides
    @Singleton
    fun provideAppDatabase(@ApplicationContext context: Context): AppDatabase {
        return AppDatabase.getDatabase(context)
    }
    
    @Provides
    fun provideUserDao(database: AppDatabase): UserDao {
        return database.userDao()
    }
}
```

### Features Implementadas

#### 1. Dashboard com Cards
```kotlin
@Composable
fun DashboardScreen(
    navController: NavController,
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Stats Cards
        item {
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(uiState.stats) { stat ->
                    StatCard(
                        title = stat.title,
                        value = stat.value,
                        icon = stat.icon,
                        modifier = Modifier.width(160.dp)
                    )
                }
            }
        }
        
        // Recent Activity
        item {
            Text(
                text = "Recent Activity",
                style = MaterialTheme.typography.headlineSmall,
                modifier = Modifier.padding(vertical = 8.dp)
            )
        }
        
        items(uiState.recentActivities) { activity ->
            ActivityRow(activity = activity)
        }
        
        // Chart Section
        item {
            Text(
                text = "Analytics",
                style = MaterialTheme.typography.headlineSmall,
                modifier = Modifier.padding(vertical = 8.dp)
            )
            
            ChartCard(
                data = uiState.chartData,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp)
            )
        }
    }
}

@Composable
fun StatCard(
    title: String,
    value: String,
    icon: ImageVector,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(24.dp)
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = value,
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = title,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
```

#### 2. Profile Management
```kotlin
@Composable
fun ProfileScreen(
    navController: NavController,
    viewModel: ProfileViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp)
    ) {
        // User Info Section
        item {
            Card(
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    AsyncImage(
                        model = uiState.user?.avatar,
                        contentDescription = "Profile Picture",
                        modifier = Modifier
                            .size(80.dp)
                            .clipShape(CircleShape),
                        placeholder = painterResource(R.drawable.ic_person_placeholder),
                        error = painterResource(R.drawable.ic_person_placeholder)
                    )
                    
                    Spacer(modifier = Modifier.width(16.dp))
                    
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = uiState.user?.name ?: "Loading...",
                            style = MaterialTheme.typography.headlineSmall
                        )
                        
                        Spacer(modifier = Modifier.height(4.dp))
                        
                        Text(
                            text = uiState.user?.email ?: "",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    
                    IconButton(onClick = { /* Navigate to edit profile */ }) {
                        Icon(
                            imageVector = Icons.Default.Edit,
                            contentDescription = "Edit Profile"
                        )
                    }
                }
            }
        }
        
        // Settings Section
        item {
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = "Settings",
                style = MaterialTheme.typography.headlineSmall,
                modifier = Modifier.padding(vertical = 8.dp)
            )
        }
        
        item {
            Card(
                modifier = Modifier.fillMaxWidth()
            ) {
                Column {
                    SettingToggleRow(
                        title = "Notifications",
                        subtitle = "Receive push notifications",
                        icon = Icons.Default.Notifications,
                        checked = uiState.notificationsEnabled,
                        onCheckedChange = { viewModel.toggleNotifications() }
                    )
                    
                    Divider()
                    
                    SettingToggleRow(
                        title = "Dark Mode",
                        subtitle = "Use dark theme",
                        icon = Icons.Default.DarkMode,
                        checked = uiState.darkModeEnabled,
                        onCheckedChange = { viewModel.toggleDarkMode() }
                    )
                    
                    Divider()
                    
                    SettingToggleRow(
                        title = "Biometric Login",
                        subtitle = "Use fingerprint or face unlock",
                        icon = Icons.Default.Fingerprint,
                        checked = uiState.biometricEnabled,
                        onCheckedChange = { viewModel.toggleBiometric() }
                    )
                }
            }
        }
        
        // Account Section
        item {
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = "Account",
                style = MaterialTheme.typography.headlineSmall,
                modifier = Modifier.padding(vertical = 8.dp)
            )
        }
        
        item {
            Card(
                modifier = Modifier.fillMaxWidth()
            ) {
                Column {
                    SettingRow(
                        title = "Sign Out",
                        subtitle = "Sign out of your account",
                        icon = Icons.Default.Logout,
                        tint = MaterialTheme.colorScheme.error
                    ) {
                        viewModel.signOut()
                    }
                    
                    Divider()
                    
                    SettingRow(
                        title = "Delete Account",
                        subtitle = "Permanently delete your account",
                        icon = Icons.Default.Delete,
                        tint = MaterialTheme.colorScheme.error
                    ) {
                        viewModel.deleteAccount()
                    }
                }
            }
        }
    }
}

@Composable
fun SettingToggleRow(
    title: String,
    subtitle: String,
    icon: ImageVector,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            modifier = Modifier.size(24.dp)
        )
        
        Spacer(modifier = Modifier.width(16.dp))
        
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyLarge
            )
            
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange
        )
    }
}
```

### Testes Automatizados

#### 1. Unit Tests
```kotlin
@RunWith(MockitoJUnitRunner::class)
class UserViewModelTest {
    
    @Mock
    private lateinit var getUsersUseCase: GetUsersUseCase
    
    private lateinit var viewModel: UserViewModel
    
    @Before
    fun setup() {
        Dispatchers.setMain(StandardTestDispatcher())
        viewModel = UserViewModel(getUsersUseCase)
    }
    
    @Test
    fun `when loadUsers succeeds, update uiState with users`() = runTest {
        // Given
        val expectedUsers = listOf(
            User(id = "1", name = "John", email = "john@example.com"),
            User(id = "2", name = "Jane", email = "jane@example.com")
        )
        whenever(getUsersUseCase()).thenReturn(Result.success(expectedUsers))
        
        // When
        viewModel.loadUsers()
        
        // Then
        val uiState = viewModel.uiState.value
        assertFalse(uiState.isLoading)
        assertEquals(expectedUsers, uiState.users)
        assertNull(uiState.error)
    }
    
    @Test
    fun `when loadUsers fails, update uiState with error`() = runTest {
        // Given
        val errorMessage = "Network error"
        whenever(getUsersUseCase()).thenReturn(Result.failure(Exception(errorMessage)))
        
        // When
        viewModel.loadUsers()
        
        // Then
        val uiState = viewModel.uiState.value
        assertFalse(uiState.isLoading)
        assertTrue(uiState.users.isEmpty())
        assertEquals(errorMessage, uiState.error)
    }
}
```

#### 2. UI Tests
```kotlin
@RunWith(AndroidJUnit4::class)
class AuthenticationUITest {
    
    @get:Rule
    val composeTestRule = createComposeRule()
    
    @Test
    fun authenticationScreen_displaysCorrectly() {
        composeTestRule.setContent {
            AuthenticationScreen(onAuthSuccess = { })
        }
        
        composeTestRule
            .onNodeWithText("Email")
            .assertIsDisplayed()
        
        composeTestRule
            .onNodeWithText("Password")
            .assertIsDisplayed()
        
        composeTestRule
            .onNodeWithText("Sign In")
            .assertIsDisplayed()
    }
    
    @Test
    fun signInButton_enabled_whenFormIsValid() {
        composeTestRule.setContent {
            AuthenticationScreen(onAuthSuccess = { })
        }
        
        // Fill form
        composeTestRule
            .onNodeWithText("Email")
            .performTextInput("test@example.com")
        
        composeTestRule
            .onNodeWithText("Password")
            .performTextInput("password123")
        
        // Assert button is enabled
        composeTestRule
            .onNodeWithText("Sign In")
            .assertIsEnabled()
    }
    
    @Test
    fun signInButton_disabled_whenFormIsInvalid() {
        composeTestRule.setContent {
            AuthenticationScreen(onAuthSuccess = { })
        }
        
        // Fill invalid email
        composeTestRule
            .onNodeWithText("Email")
            .performTextInput("invalid-email")
        
        // Assert button is disabled
        composeTestRule
            .onNodeWithText("Sign In")
            .assertIsNotEnabled()
    }
}
```

### Deploy e Distribuição

#### 1. Build Configuration
```kotlin
// app/build.gradle.kts
android {
    namespace = "com.myapp"
    compileSdk = 34
    
    defaultConfig {
        applicationId = "com.myapp"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
        
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }
    
    buildTypes {
        debug {
            isDebuggable = true
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
        }
        
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            
            // Signing config for Play Store
            signingConfig = signingConfigs.getByName("release")
        }
    }
    
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    
    kotlinOptions {
        jvmTarget = "1.8"
    }
    
    buildFeatures {
        compose = true
    }
    
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.4"
    }
    
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // Compose BOM
    implementation(platform("androidx.compose:compose-bom:2023.10.01"))
    
    // Core Compose
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    
    // Navigation
    implementation("androidx.navigation:navigation-compose:2.7.4")
    
    // ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.6.2")
    
    // Hilt
    implementation("com.google.dagger:hilt-android:2.48")
    kapt("com.google.dagger:hilt-compiler:2.48")
    
    // Retrofit
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.11.0")
    
    // Room
    implementation("androidx.room:room-runtime:2.5.0")
    implementation("androidx.room:room-ktx:2.5.0")
    kapt("androidx.room:room-compiler:2.5.0")
    
    // Testing
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.mockito:mockito-core:5.5.0")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
    
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation("androidx.compose.ui:ui-test-junit4:4.2.0")
}
```

#### 2. Deploy Scripts
```bash
#!/bin/bash
# build-android.sh

# Clean project
./gradlew clean

# Run tests
./gradlew test
./gradlew connectedAndroidTest

# Build debug APK
./gradlew assembleDebug

# Build release APK
./gradlew assembleRelease

# Build release AAB (for Play Store)
./gradlew bundleRelease

echo "Build completed successfully!"
echo "Debug APK: app/build/outputs/apk/debug/app-debug.apk"
echo "Release APK: app/build/outputs/apk/release/app-release.apk"
echo "Release AAB: app/build/outputs/bundle/release/app-release.aab"
```

## Resposta Esperada

### Estrutura da Resposta
1. **Arquitetura Android** completa e justificada
2. **Código Kotlin** seguindo melhores práticas
3. **Integração com APIs** backend existentes
4. **Testes automatizados** abrangentes
5. **Deploy configuration** para Play Store
6. **Documentação** para manutenção

### Formato
- **Kotlin** para código fonte
- **Markdown** para documentação
- **Gradle** para build configuration
- **Bash** para scripts
- **Diagrams** para arquitetura

## Checklist Pós-Geração

### Validação do Código
- [ ] **Kotlin code** segue style guidelines
- [ ] **MVVM pattern** implementado corretamente
- [ ] **Coroutines** usadas adequadamente
- [ ] **Dependency injection** com Hilt funcionando
- [ ] **Error handling** robusto

### Qualidade do App
- [ ] **Material 3 design** aplicado corretamente
- [ ] **Performance** otimizada
- [ ] **Accessibility** implementada
- [ ] **Security** considerations aplicadas
- [ ] **Localization** suportada

### Testes e Deploy
- [ ] **Unit tests** cobrem lógica principal
- [ ] **UI tests** validam fluxos críticos
- [ ] **Integration tests** testam APIs
- [ ] **Build scripts** funcionais
- [ ] **Play Store compliance** verificada

---

## Notas Adicionais

### Best Practices Android
- **Jetpack Compose first:** Preferir Compose sobre Views
- **Kotlin Coroutines:** Para programação assíncrona
- **Clean Architecture:** Separação clara de camadas
- **Material 3:** Design system moderno
- **Test Driven:** Desenvolver com testes

### Armadilhas Comuns
- **Memory leaks:** Em coroutines e listeners
- **Main thread abuse:** Operações pesadas em UI
- **Poor error handling:** Crashes não tratados
- **Ignoring accessibility:** Excluir usuários com deficiência
- **Over-engineering:** Complexidade desnecessária

### Ferramentas Recomendadas
- **Android Studio:** IDE oficial
- **Detekt:** Linting estático para Kotlin
- **Firebase:** Analytics, crash reporting, auth
- **Gradle:** Build system
- **Fastlane:** Automatização de deploy
