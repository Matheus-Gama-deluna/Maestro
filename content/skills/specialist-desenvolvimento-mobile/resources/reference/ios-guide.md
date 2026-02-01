# iOS Native Development Guide (Swift/SwiftUI)

## 📱 Guia Completo de Desenvolvimento iOS Nativo

**Versão:** 2.0.0  
**Swift:** 5.9+  
**iOS:** 15.0+  
**Xcode:** 15.0+  
**Última Atualização:** 31/01/2026

---

## 🎯 Visão Geral

Desenvolvimento iOS nativo com Swift e SwiftUI oferece performance máxima e acesso completo às APIs da Apple. SwiftUI é o framework declarativo moderno da Apple para construir interfaces de usuário.

### Quando Usar iOS Nativo

✅ **Ideal para:**
- Performance crítica
- Integração profunda com ecossistema Apple
- Recursos específicos do iOS (HealthKit, ARKit, etc.)
- Apps iOS-first ou iOS-only
- Experiência de usuário premium

❌ **Evitar para:**
- Necessidade de Android também (custo duplicado)
- Time sem expertise iOS
- Budget limitado
- Time-to-market muito crítico

---

## 🏗️ Arquitetura MVVM com SwiftUI

```
MyApp/
├── App/
│   ├── MyApp.swift
│   └── ContentView.swift
├── Features/
│   ├── Auth/
│   │   ├── Views/
│   │   │   ├── LoginView.swift
│   │   │   └── SignUpView.swift
│   │   ├── ViewModels/
│   │   │   └── AuthViewModel.swift
│   │   └── Models/
│   │       └── User.swift
│   └── Products/
│       ├── Views/
│       ├── ViewModels/
│       └── Models/
├── Core/
│   ├── Network/
│   │   ├── APIClient.swift
│   │   └── Endpoints.swift
│   ├── Storage/
│   │   └── UserDefaults+Extensions.swift
│   └── Extensions/
├── Shared/
│   ├── Components/
│   └── Modifiers/
└── Resources/
    ├── Assets.xcassets
    └── Localizable.strings
```

---

## 🚀 SwiftUI Basics

### Views e Modifiers

```swift
import SwiftUI

struct ContentView: View {
    @State private var count = 0
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Count: \(count)")
                .font(.largeTitle)
                .fontWeight(.bold)
            
            Button("Increment") {
                count += 1
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}

// Custom Modifier
struct CardModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(radius: 4)
    }
}

extension View {
    func cardStyle() -> some View {
        modifier(CardModifier())
    }
}

// Uso
Text("Hello")
    .cardStyle()
```

### Property Wrappers

```swift
// @State - Estado local da view
@State private var isPresented = false

// @Binding - Referência a estado de outra view
struct ChildView: View {
    @Binding var text: String
    
    var body: some View {
        TextField("Enter text", text: $text)
    }
}

// @StateObject - ObservableObject owned pela view
@StateObject private var viewModel = ProductViewModel()

// @ObservedObject - ObservableObject passado de fora
@ObservedObject var viewModel: ProductViewModel

// @EnvironmentObject - Objeto compartilhado globalmente
@EnvironmentObject var authManager: AuthManager

// @Published - Propriedade que notifica mudanças
class ProductViewModel: ObservableObject {
    @Published var products: [Product] = []
    @Published var isLoading = false
}
```

---

## 🧭 Navegação

### NavigationStack (iOS 16+)

```swift
struct ContentView: View {
    @State private var path = NavigationPath()
    
    var body: some View {
        NavigationStack(path: $path) {
            List(products) { product in
                NavigationLink(value: product) {
                    ProductRow(product: product)
                }
            }
            .navigationTitle("Products")
            .navigationDestination(for: Product.self) { product in
                ProductDetailView(product: product)
            }
        }
    }
}

// Navegação programática
path.append(product)
path.removeLast()
```

### TabView

```swift
struct MainTabView: View {
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
                .tag(0)
            
            SearchView()
                .tabItem {
                    Label("Search", systemImage: "magnifyingglass")
                }
                .tag(1)
            
            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person.fill")
                }
                .tag(2)
        }
    }
}
```

---

## 📡 Networking

### URLSession + Async/Await

```swift
actor APIClient {
    static let shared = APIClient()
    
    private let baseURL = "https://api.example.com"
    private let session: URLSession
    
    private init() {
        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = 30
        self.session = URLSession(configuration: configuration)
    }
    
    func fetch<T: Decodable>(_ endpoint: String) async throws -> T {
        guard let url = URL(string: baseURL + endpoint) else {
            throw APIError.invalidURL
        }
        
        let (data, response) = try await session.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw APIError.serverError
        }
        
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return try decoder.decode(T.self, from: data)
    }
    
    func post<T: Encodable, R: Decodable>(
        _ endpoint: String,
        body: T
    ) async throws -> R {
        guard let url = URL(string: baseURL + endpoint) else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        request.httpBody = try encoder.encode(body)
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw APIError.serverError
        }
        
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return try decoder.decode(R.self, from: data)
    }
}

enum APIError: Error {
    case invalidURL
    case serverError
    case decodingError
}

// Uso no ViewModel
@MainActor
class ProductViewModel: ObservableObject {
    @Published var products: [Product] = []
    @Published var isLoading = false
    @Published var error: String?
    
    func fetchProducts() async {
        isLoading = true
        error = nil
        
        do {
            let response: ProductsResponse = try await APIClient.shared.fetch("/products")
            products = response.products
        } catch {
            self.error = error.localizedDescription
        }
        
        isLoading = false
    }
}

// Uso na View
struct ProductListView: View {
    @StateObject private var viewModel = ProductViewModel()
    
    var body: some View {
        List(viewModel.products) { product in
            ProductRow(product: product)
        }
        .task {
            await viewModel.fetchProducts()
        }
    }
}
```

---

## 💾 Persistência

### UserDefaults

```swift
extension UserDefaults {
    enum Keys {
        static let hasSeenOnboarding = "hasSeenOnboarding"
        static let userToken = "userToken"
    }
    
    var hasSeenOnboarding: Bool {
        get { bool(forKey: Keys.hasSeenOnboarding) }
        set { set(newValue, forKey: Keys.hasSeenOnboarding) }
    }
}

// Uso
UserDefaults.standard.hasSeenOnboarding = true
```

### Keychain (Dados Sensíveis)

```swift
import Security

class KeychainManager {
    static let shared = KeychainManager()
    
    func save(_ value: String, forKey key: String) throws {
        let data = value.data(using: .utf8)!
        
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlocked
        ]
        
        SecItemDelete(query as CFDictionary)
        
        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw KeychainError.saveFailed
        }
    }
    
    func get(forKey key: String) throws -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        guard status == errSecSuccess,
              let data = result as? Data,
              let value = String(data: data, encoding: .utf8) else {
            return nil
        }
        
        return value
    }
    
    func delete(forKey key: String) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key
        ]
        
        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw KeychainError.deleteFailed
        }
    }
}

enum KeychainError: Error {
    case saveFailed
    case deleteFailed
}

// Uso
try KeychainManager.shared.save("token123", forKey: "authToken")
let token = try KeychainManager.shared.get(forKey: "authToken")
```

---

## 🧪 Testes

### Unit Tests

```swift
import XCTest
@testable import MyApp

final class ProductViewModelTests: XCTestCase {
    var viewModel: ProductViewModel!
    
    override func setUp() {
        super.setUp()
        viewModel = ProductViewModel()
    }
    
    override func tearDown() {
        viewModel = nil
        super.tearDown()
    }
    
    func testFetchProducts() async {
        await viewModel.fetchProducts()
        
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertFalse(viewModel.products.isEmpty)
        XCTAssertNil(viewModel.error)
    }
}
```

### UI Tests

```swift
import XCTest

final class LoginUITests: XCTestCase {
    let app = XCUIApplication()
    
    override func setUp() {
        super.setUp()
        continueAfterFailure = false
        app.launch()
    }
    
    func testLoginFlow() {
        let emailField = app.textFields["email-field"]
        emailField.tap()
        emailField.typeText("user@example.com")
        
        let passwordField = app.secureTextFields["password-field"]
        passwordField.tap()
        passwordField.typeText("password123")
        
        app.buttons["login-button"].tap()
        
        XCTAssertTrue(app.otherElements["home-screen"].waitForExistence(timeout: 5))
    }
}
```

---

## 📦 Build e Deploy

### Configuração

```swift
// Info.plist
<key>CFBundleDisplayName</key>
<string>My App</string>
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
<key>CFBundleVersion</key>
<string>1</string>
```

### Archive e Upload

```bash
# Via Xcode
# Product > Archive
# Distribute App > App Store Connect

# Via Command Line
xcodebuild -workspace MyApp.xcworkspace \
  -scheme MyApp \
  -configuration Release \
  -archivePath build/MyApp.xcarchive \
  archive

xcodebuild -exportArchive \
  -archivePath build/MyApp.xcarchive \
  -exportPath build \
  -exportOptionsPlist ExportOptions.plist
```

---

## 📚 Recursos Adicionais

- **Documentação:** https://developer.apple.com/documentation
- **Human Interface Guidelines:** https://developer.apple.com/design/human-interface-guidelines
- **SwiftUI Tutorials:** https://developer.apple.com/tutorials/swiftui

---

**Versão:** 2.0.0  
**Última Atualização:** 31/01/2026
