# Prompt: Componentes e Hooks Frontend

> **Quando usar:** Desenvolver componentes React e hooks personalizados  
> **Especialista:** Desenvolvimento Frontend  
> **Nível:** Médio  
> **Pré-requisitos:** Design Doc aprovado, contrato API definido

---

## Fluxo de Contexto
**Inputs:** design-doc.md, contrato-api.md  
**Outputs:** Componentes React, hooks personalizados, testes  
**Especialista anterior:** Contrato de API  
**Especialista seguinte:** Desenvolvimento Backend

---

## Prompt Completo

Atue como um **Frontend Engineer Sênior** especializado em React, TypeScript e desenvolvimento de componentes reutilizáveis.

## Contexto do Projeto
[COLE CONTEÚDO DE docs/03-ux/design-doc.md]

[COLE CONTEÚDO DE docs/09-api/contrato-api.md]

## Sua Missão
Desenvolver **componentes React reutilizáveis** e **hooks personalizados** que implementem o design system e integrem com as APIs definidas. O código deve seguir as melhores práticas de React, TypeScript e performance.

### Estrutura de Desenvolvimento

#### 1. Análise do Design System
- **Componentes Identificados:** [Listar todos os componentes do design]
- **Tokens de Design:** [Cores, tipografia, spacing]
- **Padrões de Interação:** [Botões, forms, navegação]
- **Estados Variados:** [Loading, error, success, empty]
- **Breakpoints:** [Desktop, tablet, mobile]

#### 2. Arquitetura de Componentes
- **Hierarquia:** [Estrutura de pastas]
- **Componentes Atômicos:** [Botões, inputs, ícones]
- **Componentes Compostos:** [Cards, forms, modais]
- **Páginas/Layouts:** [Estruturas maiores]
- **Utils/Helpers:** [Funções auxiliares]

#### 3. Hooks Personalizados
- **Data Fetching:** [Integração com APIs]
- **State Management:** [Estados locais complexos]
- **Form Handling:** [Validação e submit]
- **UI Interactions:** [Modais, tooltips, drag&drop]
- **Performance:** [Memoização, lazy loading]

### Componentes Obrigatórios

#### Base Components (Atômicos)
```typescript
// Button
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
}

// Input
interface InputProps {
  type: 'text' | 'email' | 'password' | 'number';
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

// Card
interface CardProps {
  header?: ReactNode;
  actions?: ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}
```

#### Composite Components
```typescript
// Form
interface FormProps {
  onSubmit: (data: any) => void;
  validation?: ValidationSchema;
  defaultValues?: any;
  children: ReactNode;
}

// Modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
}

// Table
interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  pagination?: PaginationConfig;
  onRowClick?: (row: T) => void;
}
```

#### Layout Components
```typescript
// Layout
interface LayoutProps {
  sidebar?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

// Navigation
interface NavigationProps {
  items: NavItem[];
  activeItem?: string;
  onItemClick?: (item: NavItem) => void;
}
```

### Hooks Personalizados

#### Data Fetching Hooks
```typescript
// useApi
interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  mutate: (data: T) => void;
}

function useApi<T>(url: string, options?: ApiOptions): UseApiResult<T>

// usePaginatedData
function usePaginatedData<T>(
  url: string,
  initialParams?: PaginationParams
): UsePaginatedDataResult<T>
```

#### Form Hooks
```typescript
// useForm
interface UseFormResult<T> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  setFieldValue: (field: keyof T, value: any) => void;
  handleSubmit: () => void;
  reset: () => void;
}

function useForm<T>(
  initialValues: T,
  validation?: ValidationSchema<T>
): UseFormResult<T>
```

#### UI Hooks
```typescript
// useModal
function useModal(): UseModalResult {
  const isOpen: boolean;
  const open: () => void;
  const close: () => void;
  const toggle: () => void;
}

// useLocalStorage
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void]

// useDebounce
function useDebounce<T>(value: T, delay: number): T
```

#### Performance Hooks
```typescript
// useIntersectionObserver
function useIntersectionObserver(
  ref: RefObject<Element>,
  options?: IntersectionObserverOptions
): IntersectionObserverEntry | null

// useWindowSize
function useWindowSize(): { width: number; height: number }

// useKeyboardShortcut
function useKeyboardShortcut(
  keys: string[],
  callback: () => void,
  options?: KeyboardShortcutOptions
): void
```

### Implementação Requerida

#### 1. Estrutura de Pastas
```
src/
├── components/
│   ├── ui/              # Base components
│   ├── forms/           # Form components
│   ├── layout/          # Layout components
│   └── index.ts         # Barrel exports
├── hooks/
│   ├── api/             # Data fetching
│   ├── forms/           # Form handling
│   ├── ui/              # UI interactions
│   └── index.ts         # Barrel exports
├── utils/
│   ├── api.ts           # API utilities
│   ├── validation.ts    # Validation helpers
│   └── constants.ts     # App constants
└── types/
    ├── api.ts           # API types
    ├── components.ts    # Component props
    └── global.ts        # Global types
```

#### 2. Padrões de Código
- **TypeScript strict:** Todas as props tipadas
- **Forward refs:** Para componentes DOM
- **Memoização:** Onde aplicável
- **Error boundaries:** Para tratamento de erros
- **Lazy loading:** Para componentes pesados

#### 3. Testes Obrigatórios
```typescript
// Unit tests para cada componente
describe('Button', () => {
  it('renders correctly', () => {});
  it('handles click events', () => {});
  it('shows loading state', () => {});
  it('is accessible', () => {});
});

// Tests para hooks
describe('useApi', () => {
  it('fetches data on mount', () => {});
  it('handles loading states', () => {});
  it('refetches data', () => {});
});
```

#### 4. Performance Considerations
- **React.memo:** Para componentes puros
- **useMemo/useCallback:** Para valores/funções caras
- **Code splitting:** Por rota/componente
- **Virtual scrolling:** Para listas longas
- **Image optimization:** Lazy loading, WebP

### Integração com APIs

#### 1. Type Safety
```typescript
// Gerar types do OpenAPI
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// API client tipado
class ApiClient {
  async getUsers(): Promise<User[]> {}
  async createUser(data: CreateUserDto): Promise<User> {}
  async updateUser(id: string, data: UpdateUserDto): Promise<User> {}
}
```

#### 2. Error Handling
```typescript
// Global error boundary
class ErrorBoundary extends Component<Props, State> {
  // Fallback UI para erros
}

// Hook para erros de API
function useApiError() {
  const error = useApiErrorState();
  // Tratamento centralizado de erros
}
```

#### 3. Loading States
```typescript
// Loading components
const LoadingSpinner = () => <Spinner />;
const LoadingSkeleton = () => <Skeleton />;
const LoadingButton = ({ loading, children, ...props }) => (
  <Button {...props} disabled={loading}>
    {loading ? <Spinner /> : children}
  </Button>
);
```

### Acessibilidade

#### 1. ARIA Attributes
```typescript
// Button com suporte a screen reader
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => (
    <button
      ref={ref}
      aria-label={props.ariaLabel}
      aria-disabled={props.disabled}
      {...props}
    >
      {children}
    </button>
  )
);
```

#### 2. Keyboard Navigation
```typescript
// Hook para navegação por teclado
function useKeyboardNavigation(
  items: RefObject<HTMLElement>[]
): KeyboardNavigationResult {
  // Implementar arrow keys, enter, escape
}
```

#### 3. Focus Management
```typescript
// Modal com focus trap
const Modal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      trapFocus(modalRef.current);
    }
  }, [isOpen]);
};
```

### Exemplo de Implementação

#### Componente Completo
```typescript
// components/ui/Button.tsx
import forwardRef from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'primary',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
            'border border-input hover:bg-accent hover:text-accent-foreground': variant === 'outline',
          },
          {
            'h-9 px-3 text-sm': size === 'sm',
            'h-10 px-4 py-2': size === 'md',
            'h-11 px-8 text-lg': size === 'lg',
          },
          className
        )}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <LoadingSpinner className="mr-2 h-4 w-4" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

#### Hook Completo
```typescript
// hooks/api/useApi.ts
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/utils/api';

interface UseApiOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

export function useApi<T>(url: string, options: UseApiOptions<T> = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.get<T>(url);
      setData(result);
      options.onSuccess?.(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      options.onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    if (options.immediate !== false) {
      execute();
    }
  }, [execute, options.immediate]);

  return { data, loading, error, refetch: execute };
}
```

## Resposta Esperada

### Estrutura da Resposta
1. **Análise do design system** e componentes necessários
2. **Estrutura de pastas** organizada
3. **Componentes implementados** com TypeScript
4. **Hooks personalizados** reutilizáveis
5. **Testes unitários** para componentes críticos
6. **Documentação** de uso

### Formato
- **TypeScript** com tipagem completa
- **JSDoc comments** para documentação
- **Storybook stories** para visualização
- **Unit tests** com Jest + Testing Library
- **Export barrel** para fácil import

## Checklist Pós-Geração

### Validação de Componentes
- [ ] **Props tipadas** com TypeScript
- [ ] **Forward refs** implementadas
- [ ] **Acessibilidade** (ARIA, keyboard)
- [ ] **Responsividade** funcionando
- [ ] **Estados** (loading, error, success)
- [ ] **Testes unitários** passando

### Validação de Hooks
- [ ] **Tipagem correta** de inputs/outputs
- [ ] **Error handling** robusto
- [ ] **Performance** otimizada
- [ ] **Testes** cobrindo casos de uso
- [ ] **Documentação** clara

### Qualidade Geral
- [ ] **Código limpo** e legível
- [ ] **Padrões consistentes**
- [ ] **Reutilizabilidade** alta
- [ ] **Performance** adequada
- [ ] **Browser compatibility** verificada

### Implementação
- [ ] **Salvar** componentes em `src/components/`
- [ ] **Salvar** hooks em `src/hooks/`
- [ ] **Criar** testes em `__tests__/`
- [ ] **Atualizar** barrel exports
- [ ] **Documentar** usage examples

---

## Notas Adicionais

### Best Practices
- **Component-first thinking:** Pensar em componentes antes de páginas
- **Composition over inheritance:** Compor componentes complexos
- **Props drilling:** Evitar com context quando necessário
- **Side effects:** Isolar em hooks customizados
- **Performance:** Medir antes de otimizar

### Armadilhas Comuns
- **Over-engineering:** Componentes muito complexos
- **Prop drilling:** Muitos níveis de props
- **Unnecessary re-renders:** Falta de memoização
- **Inline functions:** Quebram memoização
- **Missing keys:** Em listas renderizadas

### Ferramentas Recomendadas
- **Storybook:** Para desenvolvimento de componentes
- **React DevTools:** Para debugging
- **Lighthouse:** Para performance
- **Axe DevTools:** Para acessibilidade
- **Bundle analyzer:** Para otimização
