# 📚 Guia Completo de Desenvolvimento Frontend

## 🎯 Visão Geral

Este guia completo aborda todos os aspectos do desenvolvimento frontend moderno, desde conceitos fundamentais até práticas avançadas. É o recurso de referência para o especialista em Desenvolvimento Frontend do Maestro.

## 🏗️ Arquitetura Frontend Moderna

### Princípios Fundamentais
- **Component-First**: Desenvolvimento orientado a componentes
- **Mobile-First**: Design responsivo começando pelo mobile
- **Performance-First**: Otimização de performance desde o início
- **Accessibility-First**: Acessibilidade como requisito, não como afterthought
- **TypeScript-First**: Tipagem forte para melhor manutenção

### Stack Tecnológico Recomendado
```json
{
  "framework": "React 18+",
  "language": "TypeScript",
  "styling": "Tailwind CSS v4",
  "state": "Zustand / React Query",
  "testing": "Vitest + Testing Library",
  "build": "Vite",
  "linting": "ESLint + Prettier",
  "documentation": "Storybook",
  "monitoring": "Sentry + Analytics"
}
```

---

## 🧩 Componentes React

### Estrutura Padrão de Componente
```typescript
// src/components/ComponentName/ComponentName.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ComponentNameProps {
  // Props tipadas
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  onClick
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-green-600 text-white hover:bg-green-700'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <motion.button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
};

export default ComponentName;
```

### Padrões de Componentes

#### 1. Container Components
```typescript
// Componentes que gerenciam estado e lógica
export const ProductListContainer: React.FC = () => {
  const { products, loading, error } = useProducts();
  
  if (loading) return <ProductListSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  return <ProductList products={products} />;
};
```

#### 2. Presentation Components
```typescript
// Componentes que apenas apresentam dados
interface ProductListProps {
  products: Product[];
}

export const ProductList: React.FC<ProductListProps> = ({ products }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

#### 3. Higher-Order Components
```typescript
// HOC para adicionar funcionalidades
export const withLoading = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P & { loading?: boolean }) => {
    const { loading, ...rest } = props;
    
    if (loading) {
      return <LoadingSpinner />;
    }
    
    return <Component {...(rest as P)} />;
  };
};
```

#### 4. Custom Hooks
```typescript
// Hooks para lógica reutilizável
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue] as const;
};
```

---

## 🎨 Styling com Tailwind CSS v4

### Configuração Otimizada
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          // ... custom gray scale
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'stagger': 'stagger 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        stagger: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};

export default config;
```

### Padrões de Styling

#### 1. Component Variants
```typescript
const buttonVariants = {
  variant: {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
  },
  size: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }
};
```

#### 2. Responsive Design
```typescript
// Mobile-first approach
<div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
  <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl">
    Responsive Typography
  </h3>
</div>
```

#### 3. Dark Mode
```typescript
// Suporte a dark mode
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <button className="bg-primary-600 dark:bg-primary-500 text-white">
    Dark Mode Button
  </button>
</div>
```

---

## 🔄 State Management

### Zustand para Estado Global
```typescript
// src/store/useProductStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

interface ProductStore {
  products: Product[];
  cart: Product[];
  filters: {
    category: string;
    priceRange: [number, number];
    search: string;
  };
  setProducts: (products: Product[]) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  setFilters: (filters: Partial<ProductStore['filters']>) => void;
  clearCart: () => void;
}

export const useProductStore = create<ProductStore>()(
  devtools(
    persist(
      (set, get) => ({
        products: [],
        cart: [],
        filters: {
          category: '',
          priceRange: [0, 1000],
          search: '',
        },
        
        setProducts: (products) => set({ products }),
        
        addToCart: (product) => set((state) => ({
          cart: [...state.cart, product],
        })),
        
        removeFromCart: (productId) => set((state) => ({
          cart: state.cart.filter((p) => p.id !== productId),
        })),
        
        setFilters: (newFilters) => set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
        
        clearCart: () => set({ cart: [] }),
      }),
      {
        name: 'product-store',
        partialize: (state) => ({ cart: state.cart }),
      }
    )
  )
);
```

### React Query para Server State
```typescript
// src/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/productService';

export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: productService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
```

---

## 🧪 Testes Abrangentes

### Configuração do Vitest
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Testes de Componentes
```typescript
// src/components/Button/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct variant classes', () => {
    render(<Button variant="primary">Primary Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary-600');
  });

  it('is accessible', () => {
    render(<Button disabled>Disabled Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });
});
```

### Testes de Hooks
```typescript
// src/hooks/useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());
    
    expect(result.current.count).toBe(0);
  });

  it('should increment count', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });

  it('should decrement count', () => {
    const { result } = renderHook(() => useCounter(5));
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(4);
  });
});
```

### Testes E2E com Playwright
```typescript
// tests/e2e/product-list.spec.ts
import { test, expect } from '@playwright/test';

test('product list loads correctly', async ({ page }) => {
  await page.goto('/products');
  
  // Check if products are loaded
  await expect(page.locator('[data-testid="product-card"]')).toHaveCount(12);
  
  // Check if first product is visible
  await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
});

test('product filtering works', async ({ page }) => {
  await page.goto('/products');
  
  // Select category filter
  await page.selectOption('[data-testid="category-filter"]', 'electronics');
  
  // Wait for products to update
  await page.waitForTimeout(1000);
  
  // Check if filtered products are shown
  const products = page.locator('[data-testid="product-card"]');
  await expect(products).toHaveCountLessThan(12);
});
```

---

## ⚡ Performance Optimization

### Code Splitting
```typescript
// Lazy loading de componentes
const ProductList = lazy(() => import('./ProductList'));
const ProductDetails = lazy(() => import('./ProductDetails'));

// Suspense boundary
<Suspense fallback={<ProductListSkeleton />}>
  <ProductList />
</Suspense>
```

### Virtualization
```typescript
// react-window para listas longas
import { FixedSizeList as List } from 'react-window';

const VirtualizedProductList: React.FC<{ products: Product[] }> = ({ products }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <ProductCard product={products[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={products.length}
      itemSize={200}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

### Image Optimization
```typescript
// next/image para otimização automática
import Image from 'next/image';

const OptimizedImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
  <Image
    src={src}
    alt={alt}
    width={300}
    height={200}
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,..."
    loading="lazy"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  />
);
```

### Memoization
```typescript
// React.memo para componentes
export const ProductCard = React.memo<ProductCardProps>(({ product }) => {
  return (
    <div className="product-card">
      {/* Component content */}
    </div>
  );
});

// useMemo para valores computados
const filteredProducts = useMemo(() => {
  return products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [products, searchTerm]);

// useCallback para funções
const handleAddToCart = useCallback((product: Product) => {
  addToCart(product);
}, [addToCart]);
```

---

## ♿ Acessibilidade (WCAG 2.1 AA)

### Semantic HTML
```typescript
// Uso correto de elementos semânticos
const ProductPage: React.FC = () => (
  <main role="main" aria-label="Product listing">
    <header>
      <h1>Our Products</h1>
      <nav aria-label="Product filters">
        {/* Filter controls */}
      </nav>
    </header>
    
    <section aria-labelledby="products-heading">
      <h2 id="products-heading" className="sr-only">Product list</h2>
      <div role="grid" aria-label="Products grid">
        {/* Product grid */}
      </div>
    </section>
  </main>
);
```

### ARIA Labels
```typescript
// Botões com descrições acessíveis
<button
  onClick={() => addToCart(product)}
  aria-label={`Add ${product.name} to cart`}
  aria-describedby={`product-${product.id}-price`}
>
  Add to Cart
</button>

<div id={`product-${product.id}-price`} className="sr-only">
  Price: ${product.price}
</div>
```

### Focus Management
```typescript
// Modal com gerenciamento de foco
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  return isOpen ? (
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className="modal-content"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  ) : null;
};
```

### Keyboard Navigation
```typescript
// Suporte completo a teclado
const DropdownMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
    if (event.key === 'ArrowDown') {
      // Navigate to next item
    }
    if (event.key === 'ArrowUp') {
      // Navigate to previous item
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div ref={menuRef} className="dropdown">
      {/* Dropdown content */}
    </div>
  );
};
```

---

## 🔐 Segurança Frontend

### XSS Prevention
```typescript
// Sanitização de conteúdo
import DOMPurify from 'dompurify';

const SafeHTML: React.FC<{ html: string }> = ({ html }) => {
  const cleanHTML = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: cleanHTML }} />;
};

// Validação de inputs
const validateInput = (input: string): string => {
  // Remove potentially dangerous characters
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};
```

### Content Security Policy
```typescript
// Configuração de CSP
const ContentSecurityPolicy: React.FC = () => {
  useEffect(() => {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://api.example.com",
    ].join('; ');

    document.head.appendChild(
      Object.assign(document.createElement('meta'), {
        httpEquiv: 'Content-Security-Policy',
        content: csp,
      })
    );
  }, []);

  return null;
};
```

### Secure Storage
```typescript
// Armazenamento seguro de dados sensíveis
const secureStorage = {
  set: (key: string, value: any) => {
    const encrypted = btoa(JSON.stringify(value));
    localStorage.setItem(key, encrypted);
  },
  
  get: (key: string) => {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    
    try {
      return JSON.parse(atob(encrypted));
    } catch {
      return null;
    }
  },
  
  remove: (key: string) => {
    localStorage.removeItem(key);
  },
};
```

---

## 📱 Progressive Web App (PWA)

### Service Worker
```typescript
// public/sw.js
const CACHE_NAME = 'v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
```

### Web App Manifest
```json
{
  "name": "My App",
  "short_name": "MyApp",
  "description": "A progressive web app",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 📊 Monitoramento e Analytics

### Error Tracking com Sentry
```typescript
// src/utils/sentry.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Error boundary
export const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
    {children}
  </Sentry.ErrorBoundary>
);
```

### Performance Monitoring
```typescript
// Web Vitals monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const sendToAnalytics = (metric: any) => {
  // Send to analytics service
  gtag('event', metric.name, {
    value: Math.round(metric.value),
    event_category: 'Web Vitals',
  });
};

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

---

## 🚀 Deploy e CI/CD

### GitHub Actions Workflow
```yaml
# .github/workflows/frontend.yml
name: Frontend CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      
      - name: Deploy to staging
        if: github.ref == 'refs/heads/develop'
        run: |
          # Deploy to staging
          
      - name: Deploy to production
        if: github.ref == 'refs/heads/main'
        run: |
          # Deploy to production
```

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 📚 Melhores Práticas e Padrões

### Code Organization
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components
│   ├── forms/          # Form components
│   └── layout/         # Layout components
├── pages/              # Page components
├── hooks/              # Custom hooks
├── services/           # API services
├── store/              # State management
├── utils/              # Utility functions
├── types/              # TypeScript types
├── styles/             # Global styles
├── assets/             # Static assets
└── test/               # Test utilities
```

### Naming Conventions
- **Components**: PascalCase (ProductCard, UserList)
- **Files**: kebab-case (product-card.tsx, user-list.test.tsx)
- **Variables**: camelCase (userName, productList)
- **Constants**: UPPER_SNAKE_CASE (API_BASE_URL, MAX_ITEMS)
- **CSS Classes**: kebab-case (product-card, user-list)

### Git Workflow
```bash
# Feature branch workflow
git checkout -b feature/product-search
# Develop feature
git add .
git commit -m "feat: add product search functionality"
git push origin feature/product-search
# Create pull request
# Code review
# Merge to develop
# Deploy to staging
# Merge to main
# Deploy to production
```

---

## 🔧 Ferramentas e Recursos

### Essential Tools
- **VS Code**: Editor com extensões React/TypeScript
- **React DevTools**: Debugging de componentes
- **Redux DevTools**: Debugging de estado
- **Lighthouse**: Auditoria de performance
- **axe DevTools**: Testes de acessibilidade

### Browser Extensions
- **React Developer Tools**
- **Redux DevTools**
- **WAVE**: Acessibilidade evaluation
- **Lighthouse**: Performance audit
- **ColorZilla**: Color picker

### Online Tools
- **Figma**: Design e prototipagem
- **Storybook**: Documentação de componentes
- **Bundle Analyzer**: Análise de bundle
- **Can I Use**: Compatibilidade de browsers
- **Web.dev**: Guias de performance

---

## 📖 Referências Adicionais

### Documentação Oficial
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Testing Library](https://testing-library.com/)

### Comunidade e Tutoriais
- [React Patterns](https://reactpatterns.com/)
- [Frontend Masters](https://frontendmasters.com/)
- [CSS Tricks](https://css-tricks.com/)
- [Smashing Magazine](https://www.smashingmagazine.com/)
- [Web.dev](https://web.dev/)

### Livros Recomendados
- "Clean Code" - Robert C. Martin
- "Refactoring" - Martin Fowler
- "Design Patterns" - Gang of Four
- "You Don't Know JS" - Kyle Simpson
- "JavaScript: The Good Parts" - Douglas Crockford

---

**Versão:** 1.0  
**Data:** 2026-01-29  
**Status:** Production Ready  
**Próxima Atualização:** 2026-02-29  
**Responsável:** Frontend Team
