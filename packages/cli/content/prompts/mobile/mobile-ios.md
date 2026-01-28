# Prompt: Mobile iOS Development

> **Quando usar:** Desenvolver aplicativos iOS nativos ou cross-platform  
> **Especialista:** Desenvolvimento Mobile  
> **Nível:** Médio  
> **Pré-requisitos:** Design mobile aprovado, requisitos mobile definidos

---

## Fluxo de Contexto
**Inputs:** design-doc.md, requisitos mobile, API contracts  
**Outputs:** App iOS, testes, deploy na App Store  
**Especialista anterior:** UX Design  
**Especialista seguinte:** DevOps e Infraestrutura

---

## Prompt Completo

Atue como um **Mobile Developer Sênior** especializado em desenvolvimento iOS com Swift, SwiftUI e melhores práticas da Apple.

## Contexto do Projeto
[COLE CONTEÚDO DE docs/03-ux/design-doc.md]

[COLE REQUISITOS MOBILE ESPECÍFICOS]

[COLE CONTRATOS DE API RELEVANTES]

## Sua Missão
Desenvolver um **aplicativo iOS completo** seguindo as diretrizes da Apple, com UX nativo, performance otimizada e integração total com o backend existente.

### Arquitetura iOS

#### 1. Stack Tecnológico
- **Language:** Swift 5.9+
- **UI Framework:** SwiftUI (iOS 16+) + UIKit fallback
- **Architecture:** MVVM + Combine
- **Networking:** URLSession + Alamofire
- **Data Persistence:** Core Data + UserDefaults
- **Dependency Injection:** Swift Package Manager
- **Testing:** XCTest + Quick/Nimble

#### 2. Estrutura de Projeto
```
MyApp/
├── App/
│   ├── MyAppApp.swift          # App entry point
│   ├── ContentView.swift       # Root view
│   └── Info.plist             # App configuration
├── Core/
│   ├── Models/                # Data models
│   ├── Views/                 # SwiftUI views
│   ├── ViewModels/            # MVVM view models
│   ├── Services/              # Business logic
│   ├── Repositories/          # Data access
│   └── Utilities/             # Helper functions
├── Resources/
│   ├── Assets.xcassets        # Images, icons
│   ├── Localizable.strings    # Localization
│   └── Configuration/         # Config files
├── Features/
│   ├── Authentication/        # Feature modules
│   ├── Dashboard/
│   ├── Profile/
│   └── Settings/
└── Tests/
    ├── Unit/                  # Unit tests
    ├── Integration/           # Integration tests
    └── UI/                    # UI tests
```

#### 3. Arquitetura MVVM
```swift
// Model
struct User: Codable, Identifiable {
    let id: UUID
    let name: String
    let email: String
    let avatar: URL?
}

// ViewModel
@MainActor
class UserViewModel: ObservableObject {
    @Published var users: [User] = []
    @Published var isLoading = false
    @Published var error: NetworkError?
    
    private let repository: UserRepositoryProtocol
    
    init(repository: UserRepositoryProtocol) {
        self.repository = repository
    }
    
    func loadUsers() async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            users = try await repository.getUsers()
        } catch {
            self.error = error as? NetworkError
        }
    }
}

// View
struct UserListView: View {
    @StateObject private var viewModel = UserViewModel()
    
    var body: some View {
        NavigationView {
            Group {
                if viewModel.isLoading {
                    ProgressView("Loading...")
                } else if let error = viewModel.error {
                    Text("Error: \(error.localizedDescription)")
                } else {
                    List(viewModel.users) { user in
                        UserRow(user: user)
                    }
                }
            }
            .navigationTitle("Users")
            .task {
                await viewModel.loadUsers()
            }
        }
    }
}
```

### Componentes Principais

#### 1. Navigation Structure
```swift
// App Navigation
struct ContentView: View {
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            DashboardView()
                .tabItem {
                    Image(systemName: "house.fill")
                    Text("Home")
                }
                .tag(0)
            
            ProfileView()
                .tabItem {
                    Image(systemName: "person.fill")
                    Text("Profile")
                }
                .tag(1)
            
            SettingsView()
                .tabItem {
                    Image(systemName: "gear")
                    Text("Settings")
                }
                .tag(2)
        }
        .accentColor(.blue)
    }
}
```

#### 2. Authentication Flow
```swift
// Authentication View
struct AuthenticationView: View {
    @State private var email = ""
    @State private var password = ""
    @State private var isShowingSignUp = false
    @StateObject private var authViewModel = AuthenticationViewModel()
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                // Logo
                Image("AppLogo")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 120, height: 120)
                
                // Form fields
                VStack(spacing: 16) {
                    TextField("Email", text: $email)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                    
                    SecureField("Password", text: $password)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                }
                .padding(.horizontal)
                
                // Login button
                Button(action: {
                    Task {
                        await authViewModel.signIn(email: email, password: password)
                    }
                }) {
                    Text("Sign In")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                }
                .padding(.horizontal)
                .disabled(email.isEmpty || password.isEmpty)
                
                // Sign up link
                HStack {
                    Text("Don't have an account?")
                    Button("Sign Up") {
                        isShowingSignUp = true
                    }
                    .foregroundColor(.blue)
                }
                .padding(.top)
                
                Spacer()
            }
            .navigationTitle("Welcome")
            .navigationBarTitleDisplayMode(.large)
            .fullScreenCover(isPresented: $isShowingSignUp) {
                SignUpView()
            }
            .alert("Error", isPresented: $authViewModel.showError) {
                Button("OK") { }
            } message: {
                Text(authViewModel.errorMessage)
            }
        }
    }
}
```

#### 3. API Integration
```swift
// Network Service
protocol NetworkServiceProtocol {
    func request<T: Codable>(_ endpoint: APIEndpoint) async throws -> T
}

class NetworkService: NetworkServiceProtocol {
    private let session: URLSession
    private let baseURL: URL
    
    init(baseURL: URL) {
        self.baseURL = baseURL
        self.session = URLSession.shared
    }
    
    func request<T: Codable>(_ endpoint: APIEndpoint) async throws -> T {
        let request = try buildRequest(for: endpoint)
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw NetworkError.invalidResponse
        }
        
        return try JSONDecoder().decode(T.self, from: data)
    }
    
    private func buildRequest(for endpoint: APIEndpoint) throws -> URLRequest {
        let url = baseURL.appendingPathComponent(endpoint.path)
        var request = URLRequest(url: url)
        request.httpMethod = endpoint.method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Add auth token if available
        if let token = AuthManager.shared.accessToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        if let body = endpoint.body {
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        }
        
        return request
    }
}

// API Endpoints
enum APIEndpoint {
    case getUsers
    case createUser(User)
    case updateUser(UUID, User)
    case deleteUser(UUID)
    
    var path: String {
        switch self {
        case .getUsers:
            return "/api/users"
        case .createUser:
            return "/api/users"
        case .updateUser(let id, _):
            return "/api/users/\(id.uuidString)"
        case .deleteUser(let id):
            return "/api/users/\(id.uuidString)"
        }
    }
    
    var method: HTTPMethod {
        switch self {
        case .getUsers:
            return .GET
        case .createUser:
            return .POST
        case .updateUser:
            return .PUT
        case .deleteUser:
            return .DELETE
        }
    }
    
    var body: [String: Any]? {
        switch self {
        case .getUsers, .deleteUser:
            return nil
        case .createUser(let user), .updateUser(_, let user):
            return try? user.asDictionary()
        }
    }
}
```

#### 4. Data Persistence
```swift
// Core Data Manager
class CoreDataManager {
    lazy var persistentContainer: NSPersistentContainer = {
        let container = NSPersistentContainer(name: "MyApp")
        container.loadPersistentStores { _, error in
            if let error = error {
                fatalError("Core Data error: \(error)")
            }
        }
        return container
    }()
    
    var context: NSManagedObjectContext {
        persistentContainer.viewContext
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
    
    func fetch<T: NSManagedObject>(_ request: NSFetchRequest<T>) -> [T] {
        do {
            return try context.fetch(request)
        } catch {
            print("Fetch error: \(error)")
            return []
        }
    }
}

// User Entity
@objc(UserEntity)
public class UserEntity: NSManagedObject {
    @NSManaged public var id: UUID
    @NSManaged public var name: String
    @NSManaged public var email: String
    @NSManaged public var createdAt: Date
}

extension UserEntity {
    @nonobjc public class func fetchRequest() -> NSFetchRequest<UserEntity> {
        return NSFetchRequest<UserEntity>(entityName: "UserEntity")
    }
}

// Repository Pattern
class UserRepository: UserRepositoryProtocol {
    private let networkService: NetworkServiceProtocol
    private let coreDataManager: CoreDataManager
    
    init(networkService: NetworkServiceProtocol, coreDataManager: CoreDataManager) {
        self.networkService = networkService
        self.coreDataManager = coreDataManager
    }
    
    func getUsers() async throws -> [User] {
        // Try network first
        do {
            let users = try await networkService.request(APIEndpoint.getUsers)
            
            // Cache locally
            await cacheUsers(users)
            
            return users
        } catch {
            // Fallback to cached data
            return getCachedUsers()
        }
    }
    
    private func cacheUsers(_ users: [User]) async {
        await MainActor.run {
            // Clear existing cache
            let request: NSFetchRequest<UserEntity> = UserEntity.fetchRequest()
            let existingUsers = coreDataManager.fetch(request)
            for user in existingUsers {
                coreDataManager.context.delete(user)
            }
            
            // Add new users
            for user in users {
                let entity = UserEntity(context: coreDataManager.context)
                entity.id = user.id
                entity.name = user.name
                entity.email = user.email
                entity.createdAt = Date()
            }
            
            coreDataManager.save()
        }
    }
    
    private func getCachedUsers() -> [User] {
        let request: NSFetchRequest<UserEntity> = UserEntity.fetchRequest()
        let entities = coreDataManager.fetch(request)
        
        return entities.compactMap { entity in
            User(
                id: entity.id,
                name: entity.name,
                email: entity.email,
                avatar: nil
            )
        }
    }
}
```

### Features Implementadas

#### 1. Dashboard com Cards
```swift
struct DashboardView: View {
    @StateObject private var viewModel = DashboardViewModel()
    
    var body: some View {
        ScrollView {
            LazyVStack(spacing: 16) {
                // Stats cards
                LazyHGrid(rows: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                    StatCard(title: "Total Users", value: "\(viewModel.totalUsers)", icon: "person.2")
                    StatCard(title: "Revenue", value: "$\(viewModel.revenue)", icon: "dollarsign.circle")
                    StatCard(title: "Growth", value: "+\(viewModel.growth)%", icon: "arrow.up.right")
                    StatCard(title: "Active", value: "\(viewModel.activeUsers)", icon: "checkmark.circle")
                }
                .padding(.horizontal)
                
                // Recent activity
                VStack(alignment: .leading, spacing: 12) {
                    Text("Recent Activity")
                        .font(.headline)
                        .padding(.horizontal)
                    
                    LazyVStack(spacing: 8) {
                        ForEach(viewModel.recentActivities) { activity in
                            ActivityRow(activity: activity)
                        }
                    }
                    .padding(.horizontal)
                }
                
                // Charts
                VStack(alignment: .leading, spacing: 12) {
                    Text("Analytics")
                        .font(.headline)
                        .padding(.horizontal)
                    
                    // Chart implementation
                    ChartView(data: viewModel.chartData)
                        .frame(height: 200)
                        .padding(.horizontal)
                }
            }
        }
        .navigationTitle("Dashboard")
        .task {
            await viewModel.loadDashboardData()
        }
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(.blue)
                Spacer()
            }
            
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}
```

#### 2. Profile Management
```swift
struct ProfileView: View {
    @StateObject private var viewModel = ProfileViewModel()
    @State private var isShowingEditProfile = false
    
    var body: some View {
        List {
            // User info section
            Section {
                HStack(spacing: 16) {
                    AsyncImage(url: viewModel.user?.avatar) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Circle()
                            .fill(Color.gray.opacity(0.3))
                            .frame(width: 80, height: 80)
                    }
                    .frame(width: 80, height: 80)
                    .clipShape(Circle())
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text(viewModel.user?.name ?? "Loading...")
                            .font(.headline)
                        Text(viewModel.user?.email ?? "")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    Button("Edit") {
                        isShowingEditProfile = true
                    }
                    .font(.caption)
                }
                .padding(.vertical, 8)
            }
            
            // Settings section
            Section("Settings") {
                SettingRow(title: "Notifications", icon: "bell", isToggle: true, value: $viewModel.notificationsEnabled)
                SettingRow(title: "Dark Mode", icon: "moon", isToggle: true, value: $viewModel.darkModeEnabled)
                SettingRow(title: "Face ID", icon: "faceid", isToggle: true, value: $viewModel.faceIDEnabled)
            }
            
            // Account section
            Section("Account") {
                Button(action: {
                    viewModel.signOut()
                }) {
                    HStack {
                        Image(systemName: "arrow.right.square")
                            .foregroundColor(.red)
                        Text("Sign Out")
                            .foregroundColor(.red)
                    }
                }
                
                Button(action: {
                    viewModel.deleteAccount()
                }) {
                    HStack {
                        Image(systemName: "trash")
                            .foregroundColor(.red)
                        Text("Delete Account")
                            .foregroundColor(.red)
                    }
                }
            }
        }
        .navigationTitle("Profile")
        .task {
            await viewModel.loadProfile()
        }
        .sheet(isPresented: $isShowingEditProfile) {
            EditProfileView(user: viewModel.user)
        }
        .alert("Error", isPresented: $viewModel.showError) {
            Button("OK") { }
        } message: {
            Text(viewModel.errorMessage)
        }
    }
}

struct SettingRow: View {
    let title: String
    let icon: String
    let isToggle: Bool
    @Binding var value: Bool
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .frame(width: 24)
                .foregroundColor(.blue)
            
            Text(title)
            
            Spacer()
            
            if isToggle {
                Toggle("", isOn: $value)
            }
        }
    }
}
```

### Testes Automatizados

#### 1. Unit Tests
```swift
import XCTest
@testable import MyApp

class UserViewModelTests: XCTestCase {
    var viewModel: UserViewModel!
    var mockRepository: MockUserRepository!
    
    override func setUp() {
        super.setUp()
        mockRepository = MockUserRepository()
        viewModel = UserViewModel(repository: mockRepository)
    }
    
    func testLoadUsers_Success() async throws {
        // Given
        let expectedUsers = [
            User(id: UUID(), name: "John", email: "john@example.com"),
            User(id: UUID(), name: "Jane", email: "jane@example.com")
        ]
        mockRepository.usersToReturn = expectedUsers
        
        // When
        await viewModel.loadUsers()
        
        // Then
        XCTAssertEqual(viewModel.users.count, 2)
        XCTAssertEqual(viewModel.users[0].name, "John")
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.error)
    }
    
    func testLoadUsers_Error() async throws {
        // Given
        mockRepository.shouldThrowError = true
        
        // When
        await viewModel.loadUsers()
        
        // Then
        XCTAssertTrue(viewModel.users.isEmpty)
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNotNil(viewModel.error)
    }
}

class MockUserRepository: UserRepositoryProtocol {
    var usersToReturn: [User] = []
    var shouldThrowError = false
    
    func getUsers() async throws -> [User] {
        if shouldThrowError {
            throw NetworkError.invalidResponse
        }
        return usersToReturn
    }
}
```

#### 2. UI Tests
```swift
import XCTest
@testable import MyApp

class AuthenticationUITests: XCTestCase {
    var app: XCUIApplication!
    
    override func setUp() {
        super.setUp()
        app = XCUIApplication()
        app.launch()
    }
    
    func testSuccessfulLogin() {
        // Given
        let emailField = app.textFields["Email"]
        let passwordField = app.secureTextFields["Password"]
        let signInButton = app.buttons["Sign In"]
        
        // When
        emailField.tap()
        emailField.typeText("test@example.com")
        
        passwordField.tap()
        passwordField.typeText("password123")
        
        signInButton.tap()
        
        // Then
        let dashboardTitle = app.navigationBars["Dashboard"].firstMatch
        XCTAssertTrue(dashboardTitle.waitForExistence(timeout: 5))
    }
    
    func testInvalidEmailShowsError() {
        // Given
        let emailField = app.textFields["Email"]
        let signInButton = app.buttons["Sign In"]
        
        // When
        emailField.tap()
        emailField.typeText("invalid-email")
        signInButton.tap()
        
        // Then
        let errorAlert = app.alerts["Error"]
        XCTAssertTrue(errorAlert.waitForExistence(timeout: 2))
    }
}
```

### Deploy e Distribuição

#### 1. App Store Configuration
```xml
<!-- Info.plist key configurations -->
<key>CFBundleDisplayName</key>
<string>MyApp</string>
<key>CFBundleVersion</key>
<string>1.0.0</string>
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
<key>LSRequiresIPhoneOS</key>
<true/>
<key>UIRequiredDeviceCapabilities</key>
<array>
    <string>armv7</string>
</array>
<key>UISupportedInterfaceOrientations</key>
<array>
    <string>UIInterfaceOrientationPortrait</string>
    <string>UIInterfaceOrientationLandscapeLeft</string>
    <string>UIInterfaceOrientationLandscapeRight</string>
</array>
```

#### 2. Build Scripts
```bash
#!/bin/bash
# build-ios.sh

# Clean build folder
xcodebuild clean -workspace MyApp.xcworkspace -scheme MyApp

# Build for testing
xcodebuild build-for-testing \
  -workspace MyApp.xcworkspace \
  -scheme MyApp \
  -destination 'platform=iOS Simulator,name=iPhone 14'

# Run tests
xcodebuild test \
  -workspace MyApp.xcworkspace \
  -scheme MyApp \
  -destination 'platform=iOS Simulator,name=iPhone 14'

# Archive for App Store
xcodebuild archive \
  -workspace MyApp.xcworkspace \
  -scheme MyApp \
  -archivePath ./build/MyApp.xcarchive

# Export for App Store
xcodebuild -exportArchive \
  -archivePath ./build/MyApp.xcarchive \
  -exportPath ./build \
  -exportOptionsPlist ExportOptions.plist
```

## Resposta Esperada

### Estrutura da Resposta
1. **Arquitetura iOS** completa e justificada
2. **Código Swift** seguindo melhores práticas
3. **Integração com APIs** backend existentes
4. **Testes automatizados** abrangentes
5. **Deploy configuration** para App Store
6. **Documentação** para manutenção

### Formato
- **Swift** para código fonte
- **Markdown** para documentação
- **XML/JSON** para configurações
- **Bash** para scripts
- **Diagrams** para arquitetura

## Checklist Pós-Geração

### Validação do Código
- [ ] **Swift code** segue style guidelines
- [ ] **MVVM pattern** implementado corretamente
- [ ] **Memory management** sem leaks
- [ ] **Thread safety** garantido
- [ ] **Error handling** robusto

### Qualidade do App
- [ ] **UI/UX** segue guidelines Apple
- [ ] **Performance** otimizada
- [ ] **Accessibility** implementada
- [ ] **Security** considerations aplicadas
- [ ] **Localization** suportada

### Testes e Deploy
- [ ] **Unit tests** cobrem lógica principal
- [ ] **UI tests** validam fluxos críticos
- [ ] **Integration tests** testam APIs
- [ ] **Build scripts** funcionais
- [ ] **App Store compliance** verificada

---

## Notas Adicionais

### Best Practices iOS
- **SwiftUI first:** Preferir SwiftUI sobre UIKit
- **Async/await:** Usar concorrência moderna
- **Combine:** Para programação reativa
- **Core Data:** Para persistência local
- **Test Driven:** Desenvolver com testes

### Armadilhas Comuns
- **Memory leaks:** Retain cycles em closures
- **Main thread abuse:** UI updates em background
- **Poor error handling:** Crashes não tratados
- **Ignoring accessibility:** Excluir usuários com deficiência
- **Over-engineering:** Complexidade desnecessária

### Ferramentas Recomendadas
- **Xcode:** IDE oficial
- **SwiftLint:** Linting de código
- **Fastlane:** Automatização de deploy
- **TestFlight:** Beta testing
- **Firebase Analytics:** Analytics e crash reporting
