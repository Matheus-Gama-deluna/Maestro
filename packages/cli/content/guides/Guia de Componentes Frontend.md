# Guia de Componentes Frontend

**Versão:** 1.0  
**Data:** [DATA]  
**Status:** [RASCUNHO/REVISÃO/APROVADO]

---

## 🎯 **Objetivo**

Este guia fornece um framework completo para desenvolvimento de componentes frontend reutilizáveis, seguindo princípios de design system, atomic design e melhores práticas de desenvolvimento.

---

## 📋 **Contexto**

**Especialista Responsável:** Desenvolvimento Frontend  
**Fase:** 10 - Desenvolvimento Frontend  
**Artefatos Anteriores:** Design Doc, Componentes Hooks  
**Préximos Artefatos:** Implementação, Testes, Deploy

---

## 🔄 **Metodologia de Componentes**

### **Princípios Fundamentais**
- **Atomic Design:** Hierarquia clara de componentes
- **Reusabilidade:** Componentes genéricos e configuráveis
- **Composição:** Componha componentes complexos
- **Consistência:** Design system unificado
- **Acessibilidade:** WCAG 2.1 AA compliance
- **Performance:** Otimização de renderização

### **Fluxo de Desenvolvimento**
```
1. Análise do Design (1 dia)
2. Estruturação Atômica (1 dia)
3. Implementação Base (2-3 dias)
4. Testes Unitários (1 dia)
5. Testes de Integração (1 dia)
6. Documentação (1 dia)
```

---

## 📚 **Estrutura do Guia**

### **1. Atomic Design**

#### **Hierarquia de Componentes**
```markdown
## Hierarquia de Componentes

### Átomos (Atoms)
- **Definição:** Menor unidade de UI
- **Características:** Não podem ser divididos
- **Exemplos:** Botões, inputs, labels, ícones

### Moléculas (Molecules)
- **Definição:** Combinação de átomos
- **Características:** Formam UI simples
- **Exemplos:** Formulários, cards, headers

### Organismos (Organisms)
- **Definição:** Combinação de moléculas
- **Características:** Seções complexas
- **Exemplos:** Headers completos, sidebars, listas

### Templates
- **Definição:** Estrutura de página
- **Características:** Layout com placeholders
- **Exemplos:** Template de artigo, template de dashboard

### Páginas (Pages)
- **Definição:** Instância específica
- **Características:** Dados reais
- **Exemplos:** Página do produto, página de perfil
```

#### **Estrutura de Pastas**
```
src/
├── components/
│   ├── atoms/              # Átomos
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Label/
│   │   └── Icon/
│   ├── molecules/          # Moléculas
│   │   ├── Form/
│   │   ├── Card/
│   │   ├── Header/
│   │   └── ListItem/
│   ├── organisms/          # Organismos
│   │   ├── Sidebar/
│   │   ├── Navbar/
│   │   ├── Table/
│   │   └── Modal/
│   ├── templates/          # Templates
│   │   ├── ArticleTemplate/
│   │   ├── DashboardTemplate/
│   │   └── ProfileTemplate/
│   └── pages/              # Páginas
│       ├── HomePage/
│       ├── ProductPage/
│       └── ProfilePage/
├── hooks/                  # Hooks personalizados
├── utils/                  # Utilitários
├── styles/                 # Estilos globais
└── types/                  # Tipos TypeScript
```

### **2. Átomos**

#### **Button Atom**
```typescript
// components/atoms/Button/Button.tsx
import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
      outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    };
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };
    
    const widthClasses = fullWidth ? 'w-full' : '';
    
    const classes = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      widthClasses,
      className
    );
    
    const renderIcon = () => {
      if (!icon) return null;
      
      return (
        <span className={cn(
          'flex-shrink-0',
          iconPosition === 'left' ? 'mr-2' : 'ml-2'
        )}>
          {icon}
        </span>
      );
    };
    
    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {iconPosition === 'left' && renderIcon()}
        {children}
        {iconPosition === 'right' && renderIcon()}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
```

#### **Input Atom**
```typescript
// components/atoms/Input/Input.tsx
import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'filled';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const baseClasses = 'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm';
    
    const variantClasses = {
      default: 'border-gray-300',
      outlined: 'border-gray-300',
      filled: 'border-transparent bg-gray-100',
    };
    
    const inputClasses = cn(
      baseClasses,
      variantClasses[variant],
      error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
      className
    );
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className={cn(
              'block text-sm font-medium text-gray-700 mb-1',
              error && 'text-red-500'
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            className={inputClasses}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-500">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
```

#### **Icon Atom**
```typescript
// components/atoms/Icon/Icon.tsx
import React from 'react';
import { cn } from '@/utils/cn';

interface IconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

const Icon: React.FC<IconProps> = ({ name, size = 'md', className, onClick }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };
  
  const classes = cn(
    'inline-block',
    sizeClasses[size],
    className,
    onClick && 'cursor-pointer'
  );
  
  // Icon mapping - em um projeto real, isso viria de um sprite SVG ou biblioteca de ícones
  const iconMap: Record<string, string> = {
    'user': '<path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>',
    'search': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>',
    'menu': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>',
    'close': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>',
    'check': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>',
    'arrow-right': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>',
  };
  
  const iconPath = iconMap[name] || iconMap['user'];
  
  return (
    <svg
      className={classes}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
    >
      <g dangerouslySetInnerHTML={{ __html: iconPath }} />
    </svg>
  );
};

export default Icon;
```

### **3. Moléculas**

#### **Form Molecule**
```typescript
// components/molecules/Form/Form.tsx
import React from 'react';
import Button from '../Button/Button';
import Input from '../Input/Input';
import { cn } from '@/utils/cn';

interface FormProps {
  title?: string;
  onSubmit: (data: Record<string, any>) => void;
  fields: FormField[];
  submitText?: string;
  loading?: boolean;
  className?: string;
}

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  required?: boolean;
  validation?: (value: string) => string | undefined;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Form: React.FC<FormProps> = ({
  title,
  onSubmit,
  fields,
  submitText = 'Enviar',
  loading = false,
  className
}) => {
  const [formData, setFormData] = React.useState<Record<string, string>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  
  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateField = (field: FormField, value: string): string | undefined => {
    if (field.required && !value.trim()) {
      return `${field.label} é obrigatório`;
    }
    
    if (field.validation) {
      return field.validation(value);
    }
    
    return undefined;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    // Validate all fields
    fields.forEach(field => {
      const error = validateField(field, formData[field.name] || '');
      if (error) {
        newErrors[field.name] = error;
      }
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {title && (
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      )}
      
      {fields.map(field => (
        <Input
          key={field.name}
          id={field.name}
          name={field.name}
          label={field.label}
          type={field.type}
          placeholder={field.placeholder}
          required={field.required}
          error={errors[field.name]}
          leftIcon={field.leftIcon}
          rightIcon={field.rightIcon}
          value={formData[field.name] || ''}
          onChange={(e) => handleInputChange(field.name, e.target.value)}
        />
      ))}
      
      <Button
        type="submit"
        loading={loading}
        fullWidth
        className="mt-6"
      >
        {submitText}
      </Button>
    </form>
  );
};

export default Form;
```

#### **Card Molecule**
```typescript
// components/molecules/Card/Card.tsx
import React from 'react';
import Button from '../Button/Button';
import { cn } from '@/utils/cn';

interface CardProps {
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  actions?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  className?: string;
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  description,
  image,
  actions,
  variant = 'default',
  className,
  children
}) => {
  const baseClasses = 'rounded-lg overflow-hidden transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-white border border-gray-200',
    outlined: 'bg-white border-2 border-gray-300',
    elevated: 'bg-white shadow-lg hover:shadow-xl',
  };
  
  const classes = cn(
    baseClasses,
    variantClasses[variant],
    className
  );
  
  return (
    <div className={classes}>
      {image && (
        <div className="aspect-w-16 aspect-h-9">
          <img
            src={image}
            alt={title}
            className="w-full h-48 object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {title}
          </h3>
        )}
        
        {subtitle && (
          <p className="text-sm text-gray-500 mb-3">
            {subtitle}
          </p>
        )}
        
        {description && (
          <p className="text-gray-600 mb-4">
            {description}
          </p>
        )}
        
        {children}
        
        {actions && (
          <div className="flex space-x-3 mt-4">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
```

### **4. Organismos**

#### **Header Organism**
```typescript
// components/organisms/Header/Header.tsx
import React from 'react';
import Button from '../../atoms/Button/Button';
import Icon from '../../atoms/Icon/Icon';
import { cn } from '@/utils/cn';

interface HeaderProps {
  logo?: React.ReactNode;
  navigation?: NavigationItem[];
  user?: User;
  onLogin?: () => void;
  onLogout?: () => void;
  className?: string;
}

interface NavigationItem {
  label: string;
  href: string;
  active?: boolean;
}

interface User {
  name: string;
  avatar?: string;
  email: string;
}

const Header: React.FC<HeaderProps> = ({
  logo,
  navigation = [],
  user,
  onLogin,
  onLogout,
  className
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  return (
    <header className={cn('bg-white shadow-sm', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            {logo}
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map(item => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  'text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium',
                  item.active && 'text-gray-900 bg-gray-100'
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>
          
          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  {user.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                >
                  Sair
                </Button>
              </div>
            ) : (
              <Button onClick={onLogin}>
                Entrar
              </Button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Icon name="menu" />
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map(item => (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-gray-500 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium',
                    item.active && 'text-gray-900 bg-gray-100'
                  )}
                >
                  {item.label}
                </a>
              ))}
            </div>
            
            <div className="pt-4 pb-3 border-t border-gray-200">
              {user ? (
                <div className="px-2 space-y-1">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs text-gray-600">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    className="w-full"
                  >
                    Sair
                  </Button>
                </div>
              ) : (
                <Button onClick={onLogin} className="w-full">
                  Entrar
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
```

#### **Table Organism**
```typescript
// components/organisms/Table/Table.tsx
import React from 'react';
import Button from '../../atoms/Button/Button';
import Icon from '../../atoms/Icon/Icon';
import { cn } from '@/utils/cn';

interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  pagination?: PaginationConfig;
  onRowClick?: (row: T) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  className?: string;
}

interface ColumnDef<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

const Table = <T,>({
  data,
  columns,
  loading = false,
  pagination,
  onRowClick,
  onSort,
  className
}: TableProps<T>) => {
  const [sortColumn, setSortColumn] = React.useState<string>('');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  
  const handleSort = (column: string) => {
    if (!onSort) return;
    
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    onSort(column, newDirection);
  };
  
  const renderCell = (column: ColumnDef<T>, row: T) => {
    const value = row[column.key];
    
    if (column.render) {
      return column.render(value, row);
    }
    
    return <span>{String(value)}</span>;
  };
  
  return (
    <div className={cn('overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg', className)}>
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(column => (
              <th
                key={String(column.key)}
                scope="col"
                className={cn(
                  'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                  column.sortable && 'cursor-pointer hover:bg-gray-100',
                  column.width
                )}
                onClick={() => column.sortable && handleSort(String(column.key))}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {column.sortable && (
                    <Icon
                      name="arrow-right"
                      className={cn(
                        'w-4 h-4 transition-transform',
                        sortColumn === String(column.key) && sortDirection === 'desc' && 'rotate-180'
                      )}
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-center">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                Nenhum registro encontrado
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={index}
                className={cn(
                  'hover:bg-gray-50',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map(column => (
                  <td
                    key={String(column.key)}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {renderCell(column, row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {pagination && (
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page * pagination.limit >= pagination.total}
            >
              Próximo
            </Button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando{' '}
                <span className="font-medium">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{' '}
                até{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                de{' '}
                <span className="font-medium">{pagination.total}</span>{' '}
                resultados
              </p>
            </div>
            
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="rounded-l-md"
                >
                  Anterior
                </Button>
                
                <div className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300">
                  Página {pagination.page}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(pagination.page + 1)}
                  disabled={pagination.page * pagination.limit >= pagination.total}
                  className="rounded-r-md"
                >
                  Próximo
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
```

### **5. Templates**

#### **Dashboard Template**
```typescript
// components/templates/DashboardTemplate/DashboardTemplate.tsx
import React from 'react';
import Header from '../../organisms/Header/Header';
import Sidebar from '../../organisms/Sidebar/Sidebar';
import { cn } from '@/utils/cn';

interface DashboardTemplateProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
}

const DashboardTemplate: React.FC<DashboardTemplateProps> = ({
  children,
  sidebar,
  header,
  className
}) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  return (
    <div className={cn('min-h-screen bg-gray-100', className)}>
      {header}
      
      <div className="flex">
        {sidebar}
        
        <main className="flex-1 lg:pl-64">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardTemplate;
```

### **6. Testes**

#### **Teste de Componente**
```typescript
// components/atoms/Button/Button.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-blue-600', 'text-white');
  });
  
  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="secondary">Click me</Button>);
    
    let button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toHaveClass('bg-gray-200', 'text-gray-900');
    
    rerender(<Button variant="outline">Click me</Button>);
    button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toHaveClass('border-2', 'border-gray-300');
  });
  
  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="sm">Click me</Button>);
    
    let button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
    
    rerender(<Button size="lg">Click me</Button>);
    button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
  });
  
  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('shows loading state', () => {
    render(<Button loading>Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeDisabled();
    expect(button.querySelector('.animate-spin')).toBeInTheDocument();
  });
  
  it('renders with icon', () => {
    render(
      <Button icon={<span data-testid="icon">+</span>}>
        Add Item
      </Button>
    );
    
    const icon = screen.getByTestId('icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('mr-2');
  });
  
  it('is accessible', () => {
    render(<Button disabled>Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });
});
```

---

## ✅ **Checklist de Validação**

### **Antes do Desenvolvimento**
- [ ] **Design system** definido
- [ ] **Atomic design** estrutura estabelecida
- [ ] **Componentes** planejados
- [ ] **Requisitos** analisados
- [ ] **Acessibilidade** considerada

### **Durante o Desenvolvimento**
- [ ] **Componentes** seguem padrões
- [ ] **Props** bem tipadas
- [ ] **Estados** gerenciados corretamente
- [ ] **Eventos** implementados
- [ ] **Estilos** consistentes

### **Após o Desenvolvimento**
- [ ] **Testes unitários** criados
- [ ] **Testes de integração** implementados
- [ ] **Documentação** atualizada
- [ ] **Performance** otimizada
- [ ] **Acessibilidade** validada

### **Qualidade dos Componentes**
- [ ] **Reusabilidade:** Componentes genéricos
- [ ] **Composição:** Facilidade de composição
- [ ] **Consistência:** Padronização visual
- [ ] **Performance:** Renderização otimizada
- [ ] **Manutenibilidade:** Código limpo

---

## 🚀 **Dicas e Melhores Práticas**

### **Para Componentes**
- **Single responsibility:** Um componente, uma responsabilidade
- **Props drilling:** Evite quando possível
- **State management:** Use o estado certo no lugar certo
- **Performance:** Use memoização quando necessário
- **Testing:** Teste comportamentos, não implementação

### **Para Estilos**
- **Design tokens:** Use tokens de design
- **Consistência:** Mantenha consistência visual
- **Responsividade:** Pense mobile-first
- **Acessibilidade:** Garanta WCAG compliance
- **Performance:** Otimize CSS

### **Para Arquitetura**
- **Atomic design:** Siga a hierarquia
- **Component library:** Construa uma biblioteca
- **Storybook:** Use para desenvolvimento
- **Versioning:** Versione componentes
- **Documentation:** Documente tudo

---

## 📞 **Ferramentas e Recursos**

### **Ferramentas Essenciais**
- **React:** [Link para documentação]
- **TypeScript:** [Link para documentação]
- **Tailwind CSS:** [Link para documentação]
- **Storybook:** [Link para documentação]
- **Jest:** [Link para documentação]

### **Bibliotecas Complementares**
- **React Hook Form:** [Link para documentação]
- **React Query:** [Link para documentação]
- **Framer Motion:** [Link para documentação]
- **React Router:** [Link para documentação]
- **Zustand:** [Link para documentação]

### **Comunidade e Suporte**
- **React Community:** [Fóruns e grupos]
- **Stack Overflow:** [Busca de ajuda técnica]
- **Component Libraries:** [Lista de bibliotecas]
- **Design Systems:** [Referências de design]
- **Tutoriais:** [Links para vídeos/guias]

---

## 🔄 **Atualizações e Manutenção**

### **Versão 1.0** (Data: [DATA])
- Versão inicial do guia
- Framework básico de componentes
- Exemplos e templates iniciais
- Processo de desenvolvimento

### **Próximas Versões**
- **v1.1:** Adicionar exemplos avançados
- **v1.2:** Incluir animações e micro-interações
- **v1.3:** Adicionar componentes complexos
- **v2.0:** Framework completo de design system

---

**Versão:** 1.0  
**Data:** [DATA]  
**Próxima Atualização:** [DATA + 3 meses]  
**Mantenedor:** Equipe de Frontend Maestro  
**Contato:** [email@empresa.com]
