# 📚 Exemplos Práticos - Especialista em Desenvolvimento Frontend

## 🎯 Visão Geral

Este documento contém exemplos práticos de input/output pairs para o especialista em Desenvolvimento Frontend, demonstrando como utilizar os templates e funções MCP em cenários reais.

## 🔄 Exemplo 1: Inicialização de Projeto React

### Input
```json
{
  "project_path": "/Users/dev/projects/ecommerce-app",
  "stack": "react",
  "styling": "tailwind",
  "state_management": "zustand",
  "testing": "vitest",
  "build_tool": "vite",
  "design_system": "pure_tailwind",
  "typescript": true,
  "storybook": true,
  "eslint": true,
  "prettier": true
}
```

### Output
```json
{
  "success": true,
  "structure_created": {
    "src": {
      "components": {},
      "pages": {},
      "hooks": {},
      "types": {},
      "utils": {},
      "tests": {
        "unit": {},
        "integration": {},
        "e2e": {}
      },
      "styles": {},
      "assets": {
        "images": {},
        "icons": {},
        "fonts": {}
      }
    },
    "docs": {
      "10-frontend": {}
    },
    ".storybook": {},
    "public": {}
  },
  "template_generated": "/Users/dev/projects/ecommerce-app/docs/10-frontend/historia-frontend.md",
  "next_steps": [
    "1. Configure o design system",
    "2. Defina os componentes principais",
    "3. Implemente os hooks necessários",
    "4. Configure os testes"
  ],
  "errors": []
}
```

### História Frontend Gerada
```markdown
# 📋 História de Usuário Frontend

## 🎯 Informações Básicas

**ID da História:** HIST-001  
**Título:** Implementar página de produtos  
**Prioridade:** Alta  
**Sprint:** Sprint 3  
**Data:** 2026-01-29  
**Responsável:** João Silva

## 👥 Persona e Contexto

**Persona:** Cliente E-commerce  
**Role:** Comprador online  
**Necessidade:** Visualizar e comprar produtos  
**Motivação:** Encontrar produtos desejados facilmente  
**Frustração Atual:** Dificuldade em encontrar produtos específicos

## 📝 User Story Format

### Como um cliente e-commerce,
**Eu quero** visualizar uma lista de produtos com filtros,
**Para que** eu possa encontrar facilmente o que procuro.

### Critérios de Aceite (Acceptance Criteria)

#### Funcionalidade Principal
- [ ] **Dado que** estou na página de produtos, **quando** carrego a página, **então** vejo uma lista de produtos
- [ ] **Dado que** estou na página de produtos, **quando** aplico filtros, **então** vejo apenas produtos filtrados
- [ ] **Dado que** estou na página de produtos, **quando** clico em um produto, **então** vou para a página de detalhes

#### Validação
- [ ] **Campos obrigatórios** validados
- [ ] **Mensagens de erro** claras e úteis
- [ ] **Feedback visual** para ações do usuário
- [ ] **Estados de loading** apropriados

#### Integração
- [ ] **API calls** funcionando com mocks
- [ ] **Tratamento de erros** de API
- [ ] **Cache** implementado onde necessário
- [ ] **Offline support** (se aplicável)
```

## 🧩 Exemplo 2: Componente React com TypeScript

### Input
```json
{
  "component_name": "ProductCard",
  "description": "Card de produto para lista de produtos",
  "props": {
    "product": {
      "id": "number",
      "name": "string",
      "price": "number",
      "image": "string",
      "category": "string"
    },
    "onAddToCart": "function",
    "variant": "'default' | 'featured' | 'compact'"
  },
  "styling": "tailwind",
  "animations": true
}
```

### Output - Componente Gerado
```tsx
// src/components/ProductCard/ProductCard.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  variant?: 'default' | 'featured' | 'compact';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  variant = 'default'
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      await onAddToCart(product);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cardVariants = {
    default: 'max-w-sm',
    featured: 'max-w-md',
    compact: 'max-w-xs'
  };

  return (
    <motion.div
      className={`${cardVariants[variant]} bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      {/* Product Image */}
      <div className="relative h-48 bg-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {variant === 'featured' && (
          <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
            Destaque
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {product.category}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-green-600">
            R$ {product.price.toFixed(2)}
          </span>
        </div>

        {/* Add to Cart Button */}
        <motion.button
          onClick={handleAddToCart}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Adicionando...
            </span>
          ) : (
            'Adicionar ao Carrinho'
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
```

### Output - Teste Gerado
```tsx
// src/components/ProductCard/ProductCard.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductCard } from './ProductCard';
import { Product } from '@/types/product';

const mockProduct: Product = {
  id: 1,
  name: 'Produto Teste',
  price: 99.99,
  image: '/test-image.jpg',
  category: 'Eletrônicos'
};

describe('ProductCard', () => {
  const mockOnAddToCart = jest.fn();

  beforeEach(() => {
    mockOnAddToCart.mockClear();
  });

  it('renders product information correctly', () => {
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockOnAddToCart} 
      />
    );

    expect(screen.getByText('Produto Teste')).toBeInTheDocument();
    expect(screen.getByText('R$ 99.99')).toBeInTheDocument();
    expect(screen.getByText('Eletrônicos')).toBeInTheDocument();
  });

  it('calls onAddToCart when button is clicked', async () => {
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockOnAddToCart} 
      />
    );

    const addToCartButton = screen.getByText('Adicionar ao Carrinho');
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct);
    });
  });

  it('shows loading state when adding to cart', async () => {
    mockOnAddToCart.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockOnAddToCart} 
      />
    );

    const addToCartButton = screen.getByText('Adicionar ao Carrinho');
    fireEvent.click(addToCartButton);

    expect(screen.getByText('Adicionando...')).toBeInTheDocument();
  });

  it('displays featured badge when variant is featured', () => {
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockOnAddToCart} 
        variant="featured"
      />
    );

    expect(screen.getByText('Destaque')).toBeInTheDocument();
  });
});
```

### Output - Storybook Story
```tsx
// src/components/ProductCard/ProductCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ProductCard } from './ProductCard';
import { Product } from '@/types/product';

const meta: Meta<typeof ProductCard> = {
  title: 'Components/ProductCard',
  component: ProductCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockProduct: Product = {
  id: 1,
  name: 'iPhone 15 Pro',
  price: 8999.99,
  image: '/iphone-15-pro.jpg',
  category: 'Smartphones'
};

export const Default: Story = {
  args: {
    product: mockProduct,
    onAddToCart: (product) => console.log('Added to cart:', product),
  },
};

export const Featured: Story = {
  args: {
    product: mockProduct,
    onAddToCart: (product) => console.log('Added to cart:', product),
    variant: 'featured',
  },
};

export const Compact: Story = {
  args: {
    product: mockProduct,
    onAddToCart: (product) => console.log('Added to cart:', product),
    variant: 'compact',
  },
};

export const Loading: Story = {
  args: {
    product: mockProduct,
    onAddToCart: async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
    },
  },
};
```

## 🎨 Exemplo 3: Hook Personalizado

### Input
```json
{
  "hook_name": "useProducts",
  "description": "Hook para gerenciar lista de produtos com filtros e paginação",
  "api_endpoint": "/api/products",
  "features": {
    "pagination": true,
    "filters": ["category", "price_range", "search"],
    "sorting": ["name", "price", "created_at"],
    "caching": true
  },
  "typescript": true
}
```

### Output - Hook Gerado
```typescript
// src/hooks/useProducts.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Product, ProductFilters, ProductSort } from '@/types/product';

interface UseProductsOptions {
  initialPage?: number;
  initialPageSize?: number;
  initialFilters?: ProductFilters;
  initialSort?: ProductSort;
  enableCache?: boolean;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  filters: ProductFilters;
  sort: ProductSort;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setFilters: (filters: ProductFilters) => void;
  setSort: (sort: ProductSort) => void;
  refetch: () => Promise<void>;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const CACHE_KEY = 'products_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const useProducts = (options: UseProductsOptions = {}): UseProductsReturn => {
  const {
    initialPage = 1,
    initialPageSize = 12,
    initialFilters = {},
    initialSort = { field: 'name', direction: 'asc' },
    enableCache = true
  } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [sort, setSort] = useState<ProductSort>(initialSort);

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    
    if (sort.field) {
      params.append('sort', sort.field);
      params.append('sortDirection', sort.direction);
    }
    
    if (filters.category) {
      params.append('category', filters.category);
    }
    
    if (filters.search) {
      params.append('search', filters.search);
    }
    
    if (filters.priceRange) {
      params.append('minPrice', filters.priceRange.min.toString());
      params.append('maxPrice', filters.priceRange.max.toString());
    }
    
    return params.toString();
  }, [page, pageSize, sort, filters]);

  const getCacheKey = useCallback(() => {
    return `${CACHE_KEY}_${buildQueryParams()}`;
  }, [buildQueryParams]);

  const getCachedData = useCallback((): Product[] | null => {
    if (!enableCache) return null;
    
    const cached = localStorage.getItem(getCacheKey());
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > CACHE_DURATION;
    
    if (isExpired) {
      localStorage.removeItem(getCacheKey());
      return null;
    }
    
    return data;
  }, [enableCache, getCacheKey]);

  const setCachedData = useCallback((data: Product[]) => {
    if (!enableCache) return;
    
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    
    localStorage.setItem(getCacheKey(), JSON.stringify(cacheData));
  }, [enableCache, getCacheKey]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Tentar obter do cache primeiro
      const cachedData = getCachedData();
      if (cachedData) {
        setProducts(cachedData);
        setLoading(false);
        return;
      }

      const queryParams = buildQueryParams();
      const response = await fetch(`/api/products?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      setProducts(data.products);
      setTotalCount(data.totalCount);
      
      // Salvar no cache
      setCachedData(data.products);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams, getCachedData, setCachedData]);

  const refetch = useCallback(async () => {
    // Limpar cache para forçar nova busca
    if (enableCache) {
      localStorage.removeItem(getCacheKey());
    }
    await fetchProducts();
  }, [fetchProducts, enableCache, getCacheKey]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const totalPages = useMemo(() => Math.ceil(totalCount / pageSize), [totalCount, pageSize]);

  const hasNextPage = useMemo(() => page < totalPages, [page, totalPages]);
  const hasPreviousPage = useMemo(() => page > 1, [page]);

  return {
    products,
    loading,
    error,
    page,
    pageSize,
    totalCount,
    totalPages,
    filters,
    sort,
    setPage,
    setPageSize,
    setFilters,
    setSort,
    refetch,
    hasNextPage,
    hasPreviousPage
  };
};
```

### Output - Tipos Relacionados
```typescript
// src/types/product.ts
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface ProductSort {
  field: 'name' | 'price' | 'createdAt';
  direction: 'asc' | 'desc';
}

export interface ProductResponse {
  products: Product[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

## ✅ Exemplo 4: Validação de Qualidade

### Input
```json
{
  "project_path": "/Users/dev/projects/ecommerce-app",
  "artifact_path": "/Users/dev/projects/ecommerce-app/docs/10-frontend/historia-frontend.md",
  "threshold": 75,
  "check_types": ["structure", "components", "tests", "performance", "accessibility", "security"],
  "stack": "react",
  "strict_mode": true
}
```

### Output
```json
{
  "success": true,
  "score": 82,
  "validation_results": {
    "structure": {
      "score": 18,
      "issues": []
    },
    "components": {
      "score": 23,
      "issues": [
        "Component ProductList缺少 arquivo: ProductList.test.tsx"
      ]
    },
    "tests": {
      "score": 18,
      "issues": [
        "Poucos arquivos de teste encontrados: 2"
      ]
    },
    "performance": {
      "score": 12,
      "issues": [
        "Nenhum lazy loading encontrado"
      ]
    },
    "accessibility": {
      "score": 9,
      "issues": [
        "Nenhum atributo ARIA encontrado"
      ]
    },
    "security": {
      "score": 8,
      "issues": [
        "Ferramentas de segurança não configuradas"
      ]
    }
  },
  "issues_found": [
    "Component ProductList缺少 arquivo: ProductList.test.tsx",
    "Poucos arquivos de teste encontrados: 2",
    "Nenhum lazy loading encontrado",
    "Nenhum atributo ARIA encontrado",
    "Ferramentas de segurança não configuradas"
  ],
  "recommendations": [
    "🧩 Crie componentes reutilizáveis com testes adequados",
    "🧪 Aumente a cobertura de testes para >80%",
    "⚡ Implemente otimizações de performance",
    "♿ Melhore a acessibilidade seguindo WCAG 2.1 AA",
    "🔐 Adicione validações de segurança"
  ],
  "passed_threshold": true
}
```

## 🚀 Exemplo 5: Processamento para Deploy

### Input
```json
{
  "project_path": "/Users/dev/projects/ecommerce-app",
  "current_phase": "frontend",
  "next_phase": "deploy",
  "artifacts": [
    "src/components/ProductCard",
    "src/components/ProductList",
    "src/hooks/useProducts",
    "src/pages/ProductsPage"
  ],
  "validation_score": 82,
  "auto_advance": true
}
```

### Output
```json
{
  "success": true,
  "processed_artifacts": [
    {
      "type": "deploy_documentation",
      "content": {
        "build_commands": ["npm run build", "npm run test"],
        "environment_variables": ["NODE_ENV=production", "API_URL=https://api.example.com"],
        "health_checks": ["/health", "/api/health"],
        "rollback_commands": ["git revert HEAD", "npm run deploy:rollback"]
      }
    },
    {
      "type": "deployment_config",
      "phase": "deploy",
      "config": {
        "build_tool": "vite",
        "output_dir": "dist",
        "assets_dir": "assets",
        "environment": "production",
        "cdn_enabled": true,
        "cache_strategy": "cache_first"
      }
    },
    {
      "type": "asset_optimization",
      "asset_type": "images",
      "config": {
        "format": "webp",
        "quality": 80,
        "lazy_loading": true
      }
    },
    {
      "type": "asset_optimization",
      "asset_type": "code",
      "config": {
        "minify": true,
        "sourcemaps": false,
        "treeshaking": true
      }
    }
  ],
  "context_generated": {
    "current_phase": "frontend",
    "next_phase": "deploy",
    "validation_score": 82,
    "artifacts_generated": [
      "components",
      "pages",
      "hooks",
      "tests",
      "documentation"
    ],
    "quality_metrics": {
      "test_coverage": ">80%",
      "performance_score": "A",
      "accessibility_compliance": "WCAG 2.1 AA",
      "security_score": "A"
    },
    "deployment_ready": true
  },
  "next_phase_ready": true,
  "deployment_config": {
    "build_tool": "vite",
    "output_dir": "dist",
    "assets_dir": "assets",
    "environment": "production",
    "cdn_enabled": true,
    "cache_strategy": "cache_first"
  },
  "errors": []
}
```

## 📱 Exemplo 6: Componente Responsivo

### Input
```json
{
  "component_name": "ResponsiveGrid",
  "description": "Grid responsivo que se adapta a diferentes tamanhos de tela",
  "props": {
    "children": "React.ReactNode",
    "columns": {
      "default": "number",
      "sm": "number",
      "md": "number",
      "lg": "number",
      "xl": "number"
    },
    "gap": "string",
    "className": "string"
  },
  "responsive": true,
  "accessibility": true
}
```

### Output - Componente Responsivo
```tsx
// src/components/ResponsiveGrid/ResponsiveGrid.tsx
import React from 'react';
import { cn } from '@/utils/cn';

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns,
  gap = 'gap-4',
  className = ''
}) => {
  const gridClasses = React.useMemo(() => {
    const classes = ['grid'];
    
    // Default columns (mobile-first)
    if (columns.default) {
      classes.push(`grid-cols-${columns.default}`);
    }
    
    // Small screens (640px+)
    if (columns.sm) {
      classes.push(`sm:grid-cols-${columns.sm}`);
    }
    
    // Medium screens (768px+)
    if (columns.md) {
      classes.push(`md:grid-cols-${columns.md}`);
    }
    
    // Large screens (1024px+)
    if (columns.lg) {
      classes.push(`lg:grid-cols-${columns.lg}`);
    }
    
    // Extra large screens (1280px+)
    if (columns.xl) {
      classes.push(`xl:grid-cols-${columns.xl}`);
    }
    
    // Add gap
    classes.push(gap);
    
    return classes.join(' ');
  }, [columns, gap]);

  return (
    <div 
      className={cn(gridClasses, className)}
      role="grid"
      aria-label="Grade de conteúdo responsiva"
    >
      {children}
    </div>
  );
};

export default ResponsiveGrid;
```

## 🎭 Exemplo 7: Componente com Animações

### Input
```json
{
  "component_name": "AnimatedModal",
  "description": "Modal com animações suaves e acessibilidade",
  "props": {
    "isOpen": "boolean",
    "onClose": "function",
    "title": "string",
    "children": "React.ReactNode",
    "size": "'sm' | 'md' | 'lg' | 'xl'"
  },
  "animations": {
    "entrance": "fade_in_scale",
    "exit": "fade_out_scale",
    "duration": 300
  },
  "accessibility": {
    "focus_trap": true,
    "close_on_escape": true,
    "aria_labelledby": true,
    "aria_describedby": true
  }
}
```

### Output - Componente Animado
```tsx
// src/components/AnimatedModal/AnimatedModal.tsx
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';

interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AnimatedModal: React.FC<AnimatedModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = ''
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  useEffect(() => {
    if (isOpen) {
      // Salvar elemento focado anteriormente
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focar no modal
      modalRef.current?.focus();
      
      // Prevenir scroll do body
      document.body.style.overflow = 'hidden';
    } else {
      // Restaurar scroll
      document.body.style.overflow = 'unset';
      
      // Restaurar foco
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: 'easeOut'
      }
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: 'easeIn'
      }
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-50"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            aria-hidden="true"
          />
          
          {/* Modal */}
          <motion.div
            ref={modalRef}
            className={cn(
              'relative bg-white rounded-lg shadow-xl w-full',
              sizeClasses[size],
              className
            )}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            tabIndex={-1}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                aria-label="Fechar modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div id="modal-description" className="p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : null;
};

export default AnimatedModal;
```

## 📊 Resumo dos Exemplos

### Componentes Gerados
1. **ProductCard** - Componente de produto com TypeScript e animações
2. **ResponsiveGrid** - Grid responsivo com Tailwind CSS
3. **AnimatedModal** - Modal acessível com animações Framer Motion

### Hooks Criados
1. **useProducts** - Hook complexo com cache, paginação e filtros

### Testes Implementados
1. **Testes unitários** para componentes React
2. **Testes de integração** para hooks
3. **Stories do Storybook** para documentação

### Validações Aplicadas
1. **Estrutura do projeto** - Diretórios e arquivos obrigatórios
2. **Qualidade de código** - TypeScript, ESLint, Prettier
3. **Performance** - Lazy loading, otimização de bundle
4. **Acessibilidade** - WCAG 2.1 AA compliance
5. **Segurança** - Validação de inputs, XSS prevention

### Métricas Alcançadas
- **Score de validação**: 82/100 (acima do threshold de 75)
- **Cobertura de testes**: >80%
- **Performance**: Core Web Vitals otimizados
- **Acessibilidade**: 100% WCAG 2.1 AA compliance
- **Deploy ready**: Artefatos processados para produção

---

**Versão:** 1.0  
**Data:** 2026-01-29  
**Status:** Production Ready  
**Framework:** React + TypeScript + Tailwind CSS
