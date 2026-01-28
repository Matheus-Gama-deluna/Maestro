# Guia de Desenvolvimento Mobile

## Objetivo

Este guia fornece uma abordagem completa para desenvolvimento de aplicativos mobile nativos e híbridos, cobrindo desenvolvimento para iOS e Android, melhores práticas de arquitetura, performance e experiência do usuário.

## Contexto

O especialista em **Desenvolvimento Mobile** é responsável por criar aplicativos móveis de alta qualidade que ofereçam excelente performance, usabilidade e experiência do usuário em dispositivos iOS e Android. Este guia aborda desde o planejamento até o deploy e manutenção de aplicativos mobile.

## Metodologia

### 1. Planejamento e Arquitetura

#### 1.1. Escolha da Plataforma
```markdown
## Critérios de Escolha da Plataforma

### Nativo vs Híbrido vs Cross-Platform

| Critério | Nativo | Híbrido | Cross-Platform |
|----------|--------|----------|-----------------|
| Performance | Excelente | Boa | Boa a Excelente |
| Acesso a APIs Nativas | Total | Limitado | Bom |
| Custo de Desenvolvimento | Alto | Médio | Médio |
| Tempo de Desenvolvimento | Alto | Baixo | Médio |
| Experiência do Usuário | Excelente | Boa | Boa a Excelente |
| Manutenção | Complexa | Simples | Média |

### Recomendações:
- **Apps com performance crítica**: Nativo
- **Apps simples e rápidos**: Híbrido
- **Apps complexos com orçamento limitado**: Cross-Platform
```

#### 1.2. Arquitetura Mobile Recomendada
```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   Views     │  │  ViewModels │  │   States    │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                  Business Logic                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │  Use Cases  │  │ Repositories│  │   Models    │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   APIs      │  │   Database  │  │    Cache    │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────────────────────┘
```

### 2. Desenvolvimento iOS

#### 2.1. Swift e SwiftUI
```swift
// Exemplo de estrutura MVVM com SwiftUI
import SwiftUI
import Combine

// Model
struct User: Codable, Identifiable {
    let id: UUID
    let name: String
    let email: String
    let avatar: URL
}

// ViewModel
class UserViewModel: ObservableObject {
    @Published var users: [User] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let userRepository: UserRepository
    private var cancellables = Set<AnyCancellable>()
    
    init(userRepository: UserRepository = UserRepository()) {
        self.userRepository = userRepository
        loadUsers()
    }
    
    func loadUsers() {
        isLoading = true
        errorMessage = nil
        
        userRepository.fetchUsers()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] users in
                    self?.users = users
                }
            )
            .store(in: &cancellables)
    }
}

// View
struct UserListView: View {
    @StateObject private var viewModel = UserViewModel()
    
    var body: some View {
        NavigationView {
            Group {
                if viewModel.isLoading {
                    ProgressView("Carregando...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let errorMessage = viewModel.errorMessage {
                    VStack {
                        Text("Erro ao carregar usuários")
                        Button("Tentar novamente") {
                            viewModel.refreshUsers()
                        }
                        .buttonStyle(.borderedProminent)
                    }
                    .padding()
                } else {
                    List(viewModel.users) { user in
                        UserRowView(user: user)
                    }
                    .refreshable {
                        viewModel.refreshUsers()
                    }
                }
            }
            .navigationTitle("Usuários")
        }
    }
}
```

#### 2.2. Core Data para Persistência
```swift
import CoreData

// Core Data Manager
class CoreDataManager {
    static let shared = CoreDataManager()
    
    lazy var persistentContainer: NSPersistentContainer = {
        let container = NSPersistentContainer(name: "DataModel")
        container.loadPersistentStores { _, error in
            if let error = error as NSError? {
                fatalError("Core Data error: \(error), \(error.userInfo)")
            }
        }
        return container
    }()
    
    var context: NSManagedObjectContext {
        return persistentContainer.viewContext
    }
    
    func save() {
        if context.hasChanges {
            do {
                try context.save()
            } catch {
                print("Save error: \(error)")
            }
        }
    }
}

// User Entity
@objc(User)
public class User: NSManagedObject {
    @NSManaged public var id: UUID
    @NSManaged public var name: String
    @NSManaged public var email: String
    @NSManaged public var createdAt: Date
}
```

### 3. Desenvolvimento Android

#### 3.1. Kotlin e Jetpack Compose
```kotlin
// Exemplo de estrutura MVVM com Jetpack Compose
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

// Data Class
data class User(
    val id: String,
    val name: String,
    val email: String,
    val avatar: String
)

// ViewModel
class UserViewModel(
    private val userRepository: UserRepository = UserRepository()
) : ViewModel() {
    
    private val _users = MutableStateFlow<List<User>>(emptyList())
    val users: StateFlow<List<User>> = _users
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading
    
    init {
        loadUsers()
    }
    
    fun loadUsers() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val users = userRepository.fetchUsers()
                _users.value = users
            } catch (e: Exception) {
                // Handle error
            } finally {
                _isLoading.value = false
            }
        }
    }
}

// User List Screen
@Composable
fun UserListScreen(
    viewModel: UserViewModel = androidx.lifecycle.viewmodel.compose.viewModel()
) {
    val users by viewModel.users.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    
    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Usuários") })
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when {
                isLoading -> {
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                else -> {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(users) { user ->
                            UserRow(user = user)
                        }
                    }
                }
            }
        }
    }
}
```

#### 3.2. Room Database para Persistência
```kotlin
// Entity
@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val id: String,
    val name: String,
    val email: String,
    val avatar: String,
    val createdAt: Long = System.currentTimeMillis()
)

// DAO
@Dao
interface UserDao {
    @Query("SELECT * FROM users ORDER BY name ASC")
    fun getAllUsers(): Flow<List<UserEntity>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUser(user: UserEntity)
    
    @Delete
    suspend fun deleteUser(user: UserEntity)
}

// Database
@Database(
    entities = [UserEntity::class],
    version = 1
)
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
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
```

### 4. Performance e Otimização

#### 4.1. Performance iOS
```swift
// Image Caching
class ImageCache {
    static let shared = ImageCache()
    
    private let cache = NSCache<NSString, UIImage>()
    
    private init() {
        cache.countLimit = 100
        cache.totalCostLimit = 50 * 1024 * 1024 // 50MB
    }
    
    func image(for url: URL) -> UIImage? {
        let key = url.absoluteString as NSString
        return cache.object(forKey: key)
    }
    
    func setImage(_ image: UIImage, for url: URL) {
        let key = url.absoluteString as NSString
        cache.setObject(image, forKey: key)
    }
}

// Performance Monitoring
class PerformanceMonitor {
    static let shared = PerformanceMonitor()
    
    func measureTime<T>(operation: () throws -> T) rethrows -> (result: T, time: TimeInterval) {
        let startTime = CFAbsoluteTimeGetCurrent()
        let result = try operation()
        let timeElapsed = CFAbsoluteTimeGetCurrent() - startTime
        return (result, timeElapsed)
    }
    
    func logPerformance<T>(operation: String, block: () throws -> T) rethrows -> T {
        let (_, time) = try measureTime(operation: block)
        print("⏱️ \(operation): \(String(format: "%.3f", time))s")
        return try block()
    }
}
```

#### 4.2. Performance Android
```kotlin
// Performance Monitor
object PerformanceMonitor {
    inline fun <T> measureTime(operation: String, block: () -> T): T {
        val startTime = System.nanoTime()
        val result = block()
        val endTime = System.nanoTime()
        val timeElapsed = (endTime - startTime) / 1_000_000.0 // Convert to milliseconds
        
        Log.d("Performance", "⏱️ $operation: ${String.format("%.3f", timeElapsed)}ms")
        return result
    }
    
    fun logMemoryUsage() {
        val runtime = Runtime.getRuntime()
        val usedMemory = runtime.totalMemory() - runtime.freeMemory()
        val maxMemory = runtime.maxMemory()
        val memoryUsagePercent = (usedMemory.toDouble() / maxMemory) * 100
        
        Log.d("Memory", "📊 Memory usage: ${String.format("%.1f", memoryUsagePercent)}%")
    }
}
```

### 5. Testes

#### 5.1. Testes iOS
```swift
import XCTest
import Combine
@testable import YourApp

class UserViewModelTests: XCTestCase {
    var viewModel: UserViewModel!
    var mockUserRepository: MockUserRepository!
    
    override func setUp() {
        super.setUp()
        mockUserRepository = MockUserRepository()
        viewModel = UserViewModel(userRepository: mockUserRepository)
    }
    
    func testLoadUsersSuccess() {
        // Given
        let expectedUsers = [
            User(id: UUID(), name: "John Doe", email: "john@example.com", avatar: URL(string: "https://example.com/avatar1.jpg")!)
        ]
        mockUserRepository.usersToReturn = expectedUsers
        
        let expectation = XCTestExpectation(description: "Users loaded")
        
        // When
        viewModel.$users
            .dropFirst()
            .sink { users in
                // Then
                XCTAssertEqual(users.count, 1)
                XCTAssertEqual(users[0].name, "John Doe")
                expectation.fulfill()
            }
            .store(in: &viewModel.cancellables)
        
        viewModel.loadUsers()
        
        wait(for: [expectation], timeout: 1.0)
    }
}
```

#### 5.2. Testes Android
```kotlin
import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import kotlinx.coroutines.test.runTest
import org.junit.Assert.*
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.mockito.Mock
import org.mockito.Mockito.*

class UserViewModelTest {
    
    @get:Rule
    val instantExecutorRule = InstantTaskExecutorRule()
    
    @Mock
    private lateinit var mockUserRepository: UserRepository
    
    private lateinit var viewModel: UserViewModel
    
    @Before
    fun setup() {
        viewModel = UserViewModel(mockUserRepository)
    }
    
    @Test
    fun `when loadUsers is called, then users are loaded successfully`() = runTest {
        // Given
        val expectedUsers = listOf(
            User("1", "John Doe", "john@example.com", "avatar1.jpg")
        )
        `when`(mockUserRepository.fetchUsers()).thenReturn(expectedUsers)
        
        // When
        viewModel.loadUsers()
        
        // Then
        assertEquals(expectedUsers, viewModel.users.value)
        assertFalse(viewModel.isLoading.value)
    }
}
```

## Templates e Exemplos

### Template de Projeto Mobile
```markdown
# Projeto Mobile: [Nome do App]

## 1. Visão Geral
- **Objetivo**: [Descrição do objetivo]
- **Plataformas**: [iOS/Android/Ambos]
- **Arquitetura**: [MVVM/MVC/Clean Architecture]
- **Stack Tecnológico**: [SwiftUI/Kotlin Compose/etc]

## 2. Requisitos Funcionais
### 2.1. Funcionalidades Principais
- [Funcionalidade 1]: [Descrição]
- [Funcionalidade 2]: [Descrição]
- [Funcionalidade 3]: [Descrição]

## 3. Requisitos Técnicos
### 3.1. Performance
- Tempo de carregamento: < 3 segundos
- Uso de memória: < 100MB
- Tamanho do app: < 50MB

### 3.2. Compatibilidade
- iOS: Versão 14+
- Android: Versão 7.0+
- Tamanhos de tela: Suporte completo

## 4. Arquitetura
### 4.1. Estrutura de Pastas
```
src/
├── presentation/
│   ├── views/
│   ├── viewmodels/
│   └── components/
├── domain/
│   ├── models/
│   ├── usecases/
│   └── repositories/
├── data/
│   ├── repositories/
│   ├── datasources/
│   └── database/
└── core/
    ├── network/
    ├── utils/
    └── constants/
```

## 5. Implementação
### 5.1. Fases
1. [Fase 1]: [Descrição e deliverables]
2. [Fase 2]: [Descrição e deliverables]
3. [Fase 3]: [Descrição e deliverables]

## 6. Testes
### 6.1. Tipos de Testes
- Unit Tests: [Cobertura esperada]
- Integration Tests: [Cenários]
- UI Tests: [Fluxos críticos]

## 7. Deploy
### 7.1. App Store
- [ ] Certificados configurados
- [ ] Metadados preenchidos
- [ ] Screenshots prontos
- [ ] Política de privacidade

### 7.2. Google Play
- [ ] Assinatura do app configurada
- [ ] Metadados preenchidos
- [ ] Screenshots prontos
- [ ] Política de privacidade
```

## Melhores Práticas

### 1. Arquitetura
- Use padrões de arquitetura consistentes (MVVM, Clean Architecture)
- Separe responsabilidades claramente
- Implemente injeção de dependências
- Use repositórios para abstrair fontes de dados

### 2. Performance
- Otimize imagens e recursos
- Implemente caching estratégico
- Monitore uso de memória e CPU
- Teste performance em dispositivos variados

### 3. UX/UI
- Siga as guidelines de cada plataforma
- Implemente navegação intuitiva
- Garanta responsividade em diferentes tamanhos de tela
- Teste acessibilidade

### 4. Segurança
- Implemente autenticação segura
- Use HTTPS para comunicação
- Proteja dados sensíveis
- Valide inputs do usuário

### 5. Manutenção
- Documente código e arquitetura
- Implemente logging adequado
- Monitore crashes e performance
- Mantenha dependências atualizadas

## Ferramentas e Recursos

### Ferramentas de Desenvolvimento
- **iOS**: Xcode, Swift Playgrounds, Instruments
- **Android**: Android Studio, Kotlin Playground, Profiler
- **Cross-Platform**: React Native, Flutter, Xamarin

### Ferramentas de Teste
- **iOS**: XCTest, Quick/Nimble, Firebase Test Lab
- **Android**: JUnit, Espresso, Firebase Test Lab

### Ferramentas de Deploy
- **iOS**: App Store Connect, Fastlane
- **Android**: Google Play Console, Fastlane

### Recursos de Aprendizado
- Documentação oficial (Apple, Google)
- Cursos online (Udemy, Coursera)
- Comunidades (Stack Overflow, Reddit)
- Blogs e canais do YouTube

## Checklist de Validação

### Planejamento
- [ ] Plataformas definidas
- [ ] Arquitetura desenhada
- [ ] Stack tecnológico selecionado
- [ ] Requisitos detalhados

### Desenvolvimento
- [ ] Estrutura de projeto criada
- [ ] Componentes reutilizáveis implementados
- [ ] Persistência de dados configurada
- [ ] Networking implementado

### Testes
- [ ] Testes unitários escritos
- [ ] Testes de integração realizados
- [ ] Testes de UI automatizados
- [ ] Testes manuais executados

### Performance
- [ ] Performance otimizada
- [ ] Memory leaks verificados
- [ ] Bateria otimizada
- [ ] Tamanho do app otimizado

### Deploy
- [ ] Certificados configurados
- [ ] Metadados preenchidos
- [ ] Screenshots prontos
- [ ] Política de privacidade criada

### Manutenção
- [ ] Monitoramento configurado
- [ ] Analytics implementado
- [ ] Crash reporting ativo
- [ ] Feedback system pronto

## Conclusão

O desenvolvimento mobile requer atenção especial à performance, usabilidade e experiência do usuário. Este guia fornece uma base sólida para criar aplicativos de alta qualidade que atendam às expectativas dos usuários e seguem as melhores práticas da indústria.

Lembre-se que o desenvolvimento mobile é um processo iterativo. Comece com um MVP, colete feedback dos usuários e evolua o produto continuamente.

---

**Próximos Passos Recomendados:**
1. Definir claramente os requisitos do app
2. Escolher a plataforma e stack tecnológico
3. Criar protótipos e testar com usuários
4. Implementar MVP
5. Coletar feedback e iterar
