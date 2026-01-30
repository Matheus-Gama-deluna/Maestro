# Prompts Otimizados para Google Stitch

## 📋 Visão Geral

Este documento contém templates de prompts otimizados para Google Stitch, organizados por tipo de componente e Design System. Use estes prompts como base e adapte conforme necessário para seu projeto específico.

---

## 🎨 Estrutura de Prompt Otimizado

### Template Base
```
Create a [Design System] [component type] with:
- [Feature 1]
- [Feature 2]
- [Feature 3]
- Responsive layout for [devices]
- Color scheme: Primary [#HEX], Secondary [#HEX]
- Typography: [Font family]
- [Additional requirements]
```

### Elementos Essenciais
- ✅ **Design System:** Especificar claramente (Material, Ant, Chakra, Custom)
- ✅ **Tipo de Componente:** Navigation, Data Display, Input, Feedback, Layout
- ✅ **Funcionalidades:** Lista clara e específica
- ✅ **Responsividade:** Dispositivos suportados
- ✅ **Cores:** Hexadecimal ou nome do Design System
- ✅ **Tipografia:** Família de fonte
- ✅ **Interações:** Hover, click, focus, etc.

---

## 📱 Prompts por Tipo de Componente

### 1. Navigation Components

#### Header/Navbar
```
Create a Material Design navigation header with:
- Logo on the left (placeholder image)
- Horizontal menu with 5 items (Home, Products, About, Contact, Login)
- User profile dropdown on the right
- Mobile hamburger menu for screens < 768px
- Sticky behavior on scroll
- Color scheme: Primary #1976D2, Background #FFFFFF
- Typography: Roboto font family
- Shadow on scroll
```

#### Sidebar
```
Create a Chakra UI sidebar navigation with:
- Collapsible menu (icon + text)
- 8 menu items with icons
- Active state highlighting
- Nested submenu support (2 levels)
- Toggle button to collapse/expand
- Width: 240px expanded, 60px collapsed
- Color scheme: Background #2D3748, Text #FFFFFF, Active #4299E1
- Typography: Inter font family
- Smooth transitions
```

#### Breadcrumbs
```
Create an Ant Design breadcrumb navigation with:
- Home icon as first item
- Separator: "/"
- Clickable items
- Current page in bold
- Responsive: collapse middle items on mobile
- Color scheme: Primary #1890FF, Text #595959
- Typography: system-ui font family
```

---

### 2. Data Display Components

#### Dashboard Widget
```
Create a Material Design dashboard widget with:
- Card container with shadow
- Title and subtitle
- Interactive line chart showing data trends (last 30 days)
- Date range filter dropdown (7/30/90 days)
- Export to CSV button (icon + text)
- Loading state skeleton
- Responsive layout for desktop and tablet
- Color scheme: Primary #1976D2, Secondary #FFC107, Background #FFFFFF
- Typography: Roboto font family
- Chart colors: #4CAF50 (success), #F44336 (error)
```

#### Data Table
```
Create a Chakra UI data table with:
- Column headers with sort icons
- 10 rows of sample data (Name, Email, Status, Actions)
- Pagination (10/25/50 per page)
- Search input above table
- Row hover effect
- Action buttons (Edit, Delete) per row
- Responsive: horizontal scroll on mobile
- Color scheme: Primary #3182CE, Background #FFFFFF, Hover #EDF2F7
- Typography: Inter font family
- Striped rows
```

#### Card Grid
```
Create an Ant Design card grid with:
- 3 columns on desktop, 2 on tablet, 1 on mobile
- Each card: image, title, description, button
- Hover effect: lift and shadow
- Equal height cards
- Gap: 24px
- Color scheme: Primary #1890FF, Background #FFFFFF
- Typography: system-ui font family
- Rounded corners: 8px
```

---

### 3. Input Components

#### Multi-Step Form
```
Create a Material Design multi-step form with:
- 3 steps: Personal Info, Address, Review
- Progress indicator at top
- Step 1: Name, Email, Phone inputs
- Step 2: Street, City, State, ZIP inputs
- Step 3: Summary of all data
- Next/Previous buttons
- Submit button on final step
- Validation messages below inputs
- Responsive layout
- Color scheme: Primary #1976D2, Error #F44336
- Typography: Roboto font family
- Disabled state for incomplete steps
```

#### Search Bar
```
Create a Chakra UI search bar with:
- Input field with search icon
- Autocomplete dropdown
- Recent searches section
- Clear button (X icon)
- Loading spinner during search
- Keyboard navigation (arrow keys)
- Responsive width: 100% on mobile, 400px on desktop
- Color scheme: Primary #3182CE, Background #FFFFFF
- Typography: Inter font family
- Debounced input (300ms)
```

#### File Upload
```
Create an Ant Design file upload component with:
- Drag and drop area
- Click to browse button
- File type validation (images only)
- Max size: 5MB
- Preview thumbnails
- Progress bar during upload
- Remove file button
- Multiple file support
- Color scheme: Primary #1890FF, Success #52C41A, Error #FF4D4F
- Typography: system-ui font family
- Dashed border on drag-over
```

---

### 4. Feedback Components

#### Toast Notifications
```
Create a Material Design toast notification system with:
- 4 types: Success, Error, Warning, Info
- Auto-dismiss after 5 seconds
- Close button (X icon)
- Icon for each type
- Slide-in animation from top-right
- Stack multiple notifications
- Responsive: full width on mobile
- Color scheme: Success #4CAF50, Error #F44336, Warning #FF9800, Info #2196F3
- Typography: Roboto font family
- Shadow and rounded corners
```

#### Modal Dialog
```
Create a Chakra UI modal dialog with:
- Overlay background (semi-transparent black)
- Centered modal
- Header with title and close button
- Content area (scrollable if needed)
- Footer with Cancel and Confirm buttons
- Keyboard support (ESC to close)
- Focus trap
- Responsive: full screen on mobile, 500px on desktop
- Color scheme: Primary #3182CE, Background #FFFFFF
- Typography: Inter font family
- Smooth fade-in animation
```

#### Loading Spinner
```
Create an Ant Design loading spinner with:
- Circular spinner
- 3 sizes: small (16px), medium (32px), large (48px)
- Optional text below spinner
- Centered in container
- Overlay mode (full screen with backdrop)
- Color scheme: Primary #1890FF
- Smooth rotation animation
```

---

### 5. Layout Components

#### Dashboard Layout
```
Create a Material Design dashboard layout with:
- Fixed header (64px height)
- Collapsible sidebar (240px/60px width)
- Main content area
- Footer (48px height)
- Responsive: sidebar becomes drawer on mobile
- Grid system: 12 columns
- Gutter: 24px
- Color scheme: Header #1976D2, Sidebar #263238, Content #F5F5F5
- Typography: Roboto font family
- Smooth transitions
```

#### Landing Page Hero
```
Create a Chakra UI landing page hero section with:
- Full viewport height
- Background gradient (top to bottom)
- Centered content: headline, subheadline, CTA button
- Hero image on the right (50% width on desktop)
- Responsive: stack vertically on mobile
- Scroll down indicator (animated arrow)
- Color scheme: Gradient from #3182CE to #805AD5, Text #FFFFFF
- Typography: Inter font family, Heading 48px, Subheading 20px
- CTA button with hover effect
```

---

## 🎨 Prompts por Design System

### Material Design

#### Complete Dashboard
```
Create a Material Design complete dashboard with:
- App bar with logo, title, search, and user menu
- Navigation drawer with icons and labels
- Main content area with:
  - 4 metric cards (icon, value, label, trend)
  - 2 charts (line chart and bar chart)
  - Data table with pagination
- Responsive layout (drawer becomes bottom navigation on mobile)
- Color scheme: Primary #1976D2, Secondary #FFC107, Background #FAFAFA
- Typography: Roboto font family
- Material elevation and shadows
- Smooth transitions
```

---

### Ant Design

#### E-commerce Product Page
```
Create an Ant Design e-commerce product page with:
- Breadcrumb navigation
- Product image gallery (main image + 4 thumbnails)
- Product details: title, price, rating, description
- Variant selector (size, color)
- Quantity input
- Add to cart button
- Tabs: Description, Reviews, Shipping
- Related products carousel
- Responsive layout
- Color scheme: Primary #1890FF, Success #52C41A, Text #262626
- Typography: system-ui font family
- Smooth image transitions
```

---

### Chakra UI

#### Social Media Feed
```
Create a Chakra UI social media feed with:
- Post cards with:
  - User avatar and name
  - Post timestamp
  - Post content (text + optional image)
  - Like, comment, share buttons
  - Comment count
- Infinite scroll loading
- Create post input at top
- Responsive layout
- Color scheme: Primary #3182CE, Background #FFFFFF, Border #E2E8F0
- Typography: Inter font family
- Hover effects on interactive elements
- Skeleton loading for new posts
```

---

## 💡 Dicas de Otimização

### Para Melhores Resultados

1. **Seja Específico**
   - Detalhe funcionalidades exatas
   - Especifique tamanhos e espaçamentos
   - Mencione estados (hover, active, disabled)

2. **Use Cores Hexadecimais**
   - Mais preciso que nomes de cores
   - Garante consistência visual
   - Facilita integração com Design System

3. **Mencione Responsividade**
   - Especifique breakpoints
   - Descreva adaptações por dispositivo
   - Use unidades relativas quando possível

4. **Inclua Interações**
   - Hover effects
   - Click behaviors
   - Keyboard navigation
   - Loading states

5. **Referencie Design System**
   - Componentes existentes
   - Padrões de espaçamento
   - Tipografia padrão
   - Paleta de cores

### Iteração Eficiente

1. **Comece Simples**
   - Prompt básico primeiro
   - Adicione detalhes gradualmente
   - Teste cada iteração

2. **Use Feedback Visual**
   - Observe resultado no Stitch
   - Ajuste prompt baseado no output
   - Documente o que funciona

3. **Mantenha Consistência**
   - Use mesmos termos
   - Siga mesma estrutura
   - Referencie componentes anteriores

---

## 🚫 Anti-Patterns

### Evite

❌ **Prompts Muito Vagos**
```
Create a nice dashboard
```

✅ **Prompts Específicos**
```
Create a Material Design dashboard with header, sidebar, 4 metric cards, and a line chart
```

---

❌ **Muitas Funcionalidades de Uma Vez**
```
Create a complete e-commerce website with all pages and features
```

✅ **Componentes Incrementais**
```
Create a product card component with image, title, price, and add to cart button
```

---

❌ **Sem Contexto de Design**
```
Create a button
```

✅ **Com Contexto Completo**
```
Create a Material Design primary button with Roboto font, #1976D2 background, white text, hover effect, and disabled state
```

---

## 📚 Recursos Adicionais

### Design Systems
- **Material Design:** https://material.io/design
- **Ant Design:** https://ant.design/
- **Chakra UI:** https://chakra-ui.com/

### Google Stitch
- **Documentação:** https://stitch.withgoogle.com/docs
- **Exemplos:** https://stitch.withgoogle.com/examples
- **Comunidade:** https://stitch.withgoogle.com/community

---

**Versão do Template:** 1.0.0  
**Última Atualização:** 30/01/2026  
**Mantido por:** Maestro Team
