"""
Função MCP de Referência: initialize_frontend_structure()

ESTE ARQUIVO É APENAS REFERÊNCIA PARA IMPLEMENTAÇÃO NO MCP
NÃO EXECUTÁVEL LOCALMENTE

Implementação real deve ser feita no servidor MCP externo.
"""

import os
import json
from typing import Dict, List, Any, Optional
from pathlib import Path

async def initialize_frontend_structure(params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Cria estrutura base de frontend com template padrão
    
    Args:
        params: Dicionário com parâmetros de inicialização
            - project_path: str - Caminho do projeto
            - stack: str - React/Vue/Angular/Svelte
            - styling: str - Tailwind/Styled Components/Emotion
            - state_management: str - Redux/Zustand/Pinia/Vuex
            - testing: str - Jest/Vitest + Testing Library
            - build_tool: str - Vite/Webpack
            - design_system: str - Pure Tailwind/shadcn/Headless UI
            - typescript: bool - Usar TypeScript
            - storybook: bool - Configurar Storybook
            - eslint: bool - Configurar ESLint
            - prettier: bool - Configurar Prettier
    
    Returns:
        Dict com resultado da operação
            - success: bool - Status da operação
            - structure_created: dict - Estrutura criada
            - template_generated: str - Caminho do template gerado
            - next_steps: list - Próximos passos
            - errors: list - Lista de erros
    """
    
    try:
        project_path = params.get("project_path")
        stack = params.get("stack", "react")
        typescript = params.get("typescript", True)
        
        if not project_path:
            return {
                "success": False,
                "structure_created": {},
                "template_generated": "",
                "next_steps": [],
                "errors": ["project_path é obrigatório"]
            }
        
        # Criar estrutura de diretórios base
        base_structure = {
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
        }
        
        # Adicionar diretórios específicos por stack
        if stack == "react":
            base_structure["src"].update({
                "contexts": {},
                "services": {}
            })
        elif stack == "vue":
            base_structure["src"].update({
                "composables": {},
                "stores": {}
            })
        elif stack == "angular":
            base_structure["src"].update({
                "app": {},
                "environments": {}
            })
        
        # Criar diretórios fisicamente
        created_dirs = []
        for dir_path, subdirs in base_structure.items():
            full_path = os.path.join(project_path, dir_path)
            os.makedirs(full_path, exist_ok=True)
            created_dirs.append(full_path)
            
            for subdir in subdirs:
                subdir_path = os.path.join(full_path, subdir)
                os.makedirs(subdir_path, exist_ok=True)
                created_dirs.append(subdir_path)
        
        # Gerar template principal
        template_content = await _generate_historia_frontend_template(params)
        template_path = os.path.join(project_path, "docs", "10-frontend", "historia-frontend.md")
        
        # Criar diretório se não existir
        os.makedirs(os.path.dirname(template_path), exist_ok=True)
        
        with open(template_path, 'w', encoding='utf-8') as f:
            f.write(template_content)
        
        # Gerar arquivos de configuração
        config_files = await _generate_config_files(params, project_path)
        
        # Gerar componentes base
        base_components = await _generate_base_components(params, project_path)
        
        next_steps = [
            "1. Configure o design system",
            "2. Defina os componentes principais",
            "3. Implemente os hooks necessários",
            "4. Configure os testes",
            "5. Execute `npm install` para instalar dependências"
        ]
        
        return {
            "success": True,
            "structure_created": {
                "directories": created_dirs,
                "config_files": config_files,
                "base_components": base_components
            },
            "template_generated": template_path,
            "next_steps": next_steps,
            "errors": []
        }
        
    except Exception as e:
        return {
            "success": False,
            "structure_created": {},
            "template_generated": "",
            "next_steps": [],
            "errors": [f"Erro na inicialização: {str(e)}"]
        }

async def _generate_historia_frontend_template(params: Dict[str, Any]) -> str:
    """Gera conteúdo do template história-frontend.md"""
    
    stack = params.get("stack", "react")
    styling = params.get("styling", "tailwind")
    
    template_content = f"""# 📋 História de Usuário Frontend

## 🎯 Informações Básicas

**ID da História:** [HIST-XXX]  
**Título:** [Título claro e conciso]  
**Prioridade:** [Alta/Média/Baixa]  
**Sprint:** [Sprint XXX]  
**Data:** {params.get('date', '2026-01-29')}  
**Responsável:** [Nome do desenvolvedor]

## 👥 Persona e Contexto

**Persona:** [Nome da persona]  
**Role:** [Papel do usuário]  
**Necessidade:** [O que o usuário precisa]  
**Motivação:** [Por que precisa disso]  
**Frustração Atual:** [Problema atual que enfrenta]

## 📝 User Story Format

### Como um [persona],
**Eu quero** [ação/funcionalidade],
**Para que** [benefício/resultado].

### Critérios de Aceite (Acceptance Criteria)

#### Funcionalidade Principal
- [ ] **Dado que** [contexto inicial], **quando** [ação], **então** [resultado esperado]
- [ ] **Dado que** [contexto], **quando** [outra ação], **então** [outro resultado]
- [ ] **Dado que** [contexto], **quando** [ação], **então** [resultado]

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

## 🎨 Design e UX

### Design System
- [ ] **Cores:** Seguir palette do design system
- [ ] **Tipografia:** Fontes e tamanhos definidos
- [ ] **Espaçamento:** Seguir grid system
- [ ] **Border radius:** Consistente com design

### Componentes
- [ ] **Componentes existentes** reutilizados
- [ ] **Novos componentes** criados se necessário
- [ ] **Props tipadas** com TypeScript
- [ ] **Variants** implementadas (se aplicável)

### Responsividade
- [ ] **Mobile-first** approach
- [ ] **Breakpoints:** sm (640px), md (768px), lg (1024px), xl (1280px)
- [ ] **Touch targets** mínimo 44px
- [ ] **Layout adaptável** para diferentes telas

### Animações
- [ ] **Micro-interações** em elementos clicáveis
- [ ] **Transições suaves** entre estados
- [ ] **Loading states** animados
- [ ] **Reduced motion** support

## 🔧 Implementação Técnica

### Stack Tecnológico
- **Framework:** {stack}
- **Styling:** {styling}
- **State Management:** {params.get('state_management', 'Zustand')}
- **Testing:** {params.get('testing', 'Vitest + Testing Library')}
- **Build Tool:** {params.get('build_tool', 'Vite')}

### Estrutura de Arquivos
```
src/
├── components/
│   ├── [ComponentName]/
│   │   ├── index.tsx
│   │   ├── [ComponentName].tsx
│   │   ├── [ComponentName].test.tsx
│   │   └── [ComponentName].stories.tsx
├── hooks/
│   └── use[HookName].ts
├── pages/
│   └── [PageName].tsx
└── types/
    └── [TypeName].ts
```

### Componentes Principais
- [ ] **[Component1]:** [Descrição e responsabilidades]
- [ ] **[Component2]:** [Descrição e responsabilidades]
- [ ] **[Component3]:** [Descrição e responsabilidades]

### Hooks e Estado
- [ ] **use[Hook1]:** [Descrição do hook]
- [ ] **use[Hook2]:** [Descrição do hook]
- [ ] **Estado global:** [Se aplicável]

### API Integration
- [ ] **Endpoints:** [Lista de endpoints necessários]
- [ ] **Data fetching:** [Como os dados serão buscados]
- [ ] **Error handling:** [Estratégia de tratamento de erros]
- [ ] **Caching:** [Estratégia de cache]

## 🧪 Testes

### Testes Unitários
- [ ] **Componentes:** 100% de cobertura de componentes críticos
- [ ] **Hooks:** 100% de cobertura de hooks
- [ ] **Utilitários:** 100% de cobertura de funções utilitárias
- [ ] **Mock de APIs:** Todos os endpoints mockados

### Testes de Integração
- [ ] **User flows:** Fluxos principais testados
- [ ] **API integration:** Integração com backend testada
- [ ] **Formulários:** Validação e submissão testadas
- [ ] **Navegação:** Transições entre páginas testadas

### Testes E2E
- [ ] **Cenários críticos:** Caminhos felizes testados
- [ ] **Cross-browser:** Chrome, Firefox, Safari testados
- [ ] **Mobile:** iOS e Android testados
- [ ] **Accessibility:** Screen readers testados

### Cobertura de Testes
- **Target:** >80% cobertura geral
- **Components:** >90% cobertura
- **Hooks:** >95% cobertura
- **Pages:** >70% cobertura

## 📱 Performance

### Métricas
- [ ] **LCP (Largest Contentful Paint):** < 2.5s
- [ ] **FID (First Input Delay):** < 100ms
- [ ] **CLS (Cumulative Layout Shift):** < 0.1
- [ ] **TTI (Time to Interactive):** < 3.8s

### Otimizações
- [ ] **Code splitting:** Implementado por rota
- [ ] **Lazy loading:** Imagens e componentes pesados
- [ ] **Bundle size:** < 500KB gzipped
- [ ] **Image optimization:** WebP, lazy loading

### Monitoramento
- [ ] **Error tracking:** Sentry/LogRocket configurado
- [ ] **Performance monitoring:** Web Vitals monitorados
- [ ] **User analytics:** Eventos trackeados
- [ ] **A/B testing:** Framework configurado

## ♿ Acessibilidade

### WCAG 2.1 AA Compliance
- [ ] **Contraste:** Mínimo 4.5:1 para texto normal
- [ ] **Focus management:** Ordem lógica de tab
- [ ] **Screen reader:** ARIA labels apropriados
- [ ] **Keyboard navigation:** 100% navegável por teclado

### Testes de Acessibilidade
- [ ] **Automated:** axe-core integration
- [ ] **Manual:** Screen reader testing
- [ ] **Keyboard:** Navegação por teclado
- [ ] **Color blind:** Simulação de daltonismo

## 🔐 Segurança

### Validação
- [ ] **Input sanitization:** Todos os inputs validados
- [ ] **XSS prevention:** Conteúdo sanitizado
- [ ] **CSRF protection:** Tokens implementados
- [ ] **Content Security Policy:** Headers configurados

### Dados Sensíveis
- [ ] **PII protection:** Dados mascarados em logs
- [ ] **API keys:** Variáveis de ambiente
- [ ] **Local storage:** Dados sensíveis criptografados
- [ ] **Session management:** Timeout implementado

## 📋 Checklist de Deploy

### Pré-Deploy
- [ ] **Build sucesso:** Sem erros de build
- [ ] **Testes passando:** 100% dos testes
- [ ] **Lint:** Sem warnings de lint
- [ ] **TypeScript:** Sem erros de TS

### Review
- [ ] **Code review:** Aprovado por peer
- [ ] **Design review:** Aprovado por UX
- [ ] **Security review:** Aprovado por security
- [ ] **Performance review:** Métricas OK

### Deploy
- [ ] **Staging:** Testado em staging
- [ ] **Canary:** Deploy gradual (se aplicável)
- [ ] **Monitoring:** Alertas configurados
- [ ] **Rollback:** Plano de rollback pronto

## 📊 Métricas de Sucesso

### Técnicas
- [ ] **Performance:** Core Web Vitals metas atingidas
- [ ] **Quality:** >80% cobertura de testes
- [ ] **Accessibility:** 100% WCAG AA compliance
- [ ] **Bundle size:** < 500KB gzipped

### Negócio
- [ ] **User engagement:** Taxa de cliques esperada
- [ ] **Conversion:** Taxa de conversão esperada
- [ ] **Error rate:** < 1% de erros
- [ ] **Load time:** < 3 segundos

## 🔄 Iteração Futura

### Próximas Melhorias
- [ ] **Feature 1:** [Descrição da melhoria]
- [ ] **Feature 2:** [Descrição da melhoria]
- [ ] **Feature 3:** [Descrição da melhoria]

### Technical Debt
- [ ] **Refactoring:** [Componentes a refatorar]
- [ ] **Upgrades:** [Dependências a atualizar]
- [ ] **Optimization:** [Otimizações pendentes]

## 📝 Notas e Observações

[Espaço para notas adicionais, decisões tomadas, bloqueios, etc.]

---

**Status:** [ ] Em Progresso / [ ] Em Review / [ ] Aprovado / [ ] Deployed  
**Score de Qualidade:** [ ] / 100  
**Tempo Estimado:** [ ] horas  
**Tempo Real:** [ ] horas  
**Sprint:** [ ] / [ ] story points
"""
    
    return template_content

async def _generate_config_files(params: Dict[str, Any], project_path: str) -> List[str]:
    """Gera arquivos de configuração base"""
    
    stack = params.get("stack", "react")
    typescript = params.get("typescript", True)
    styling = params.get("styling", "tailwind")
    testing = params.get("testing", "vitest")
    
    config_files = []
    
    # package.json
    package_json = await _generate_package_json(params)
    package_path = os.path.join(project_path, "package.json")
    with open(package_path, 'w', encoding='utf-8') as f:
        json.dump(package_json, f, indent=2)
    config_files.append(package_path)
    
    # tsconfig.json (se TypeScript)
    if typescript:
        tsconfig = await _generate_tsconfig_json(params)
        tsconfig_path = os.path.join(project_path, "tsconfig.json")
        with open(tsconfig_path, 'w', encoding='utf-8') as f:
            json.dump(tsconfig, f, indent=2)
        config_files.append(tsconfig_path)
    
    # tailwind.config.js (se Tailwind)
    if styling == "tailwind":
        tailwind_config = await _generate_tailwind_config(params)
        tailwind_path = os.path.join(project_path, "tailwind.config.js")
        with open(tailwind_path, 'w', encoding='utf-8') as f:
            f.write(tailwind_config)
        config_files.append(tailwind_path)
    
    # vite.config.ts
    vite_config = await _generate_vite_config(params)
    vite_path = os.path.join(project_path, "vite.config.ts")
    with open(vite_path, 'w', encoding='utf-8') as f:
        f.write(vite_config)
    config_files.append(vite_path)
    
    # .eslintrc.js
    eslint_config = await _generate_eslint_config(params)
    eslint_path = os.path.join(project_path, ".eslintrc.js")
    with open(eslint_path, 'w', encoding='utf-8') as f:
        f.write(eslint_config)
    config_files.append(eslint_path)
    
    # .prettierrc
    prettier_config = await _generate_prettier_config(params)
    prettier_path = os.path.join(project_path, ".prettierrc")
    with open(prettier_path, 'w', encoding='utf-8') as f:
        json.dump(prettier_config, f, indent=2)
    config_files.append(prettier_path)
    
    return config_files

async def _generate_base_components(params: Dict[str, Any], project_path: str) -> List[str]:
    """Gera componentes base"""
    
    stack = params.get("stack", "react")
    typescript = params.get("typescript", True)
    
    components = []
    
    if stack == "react":
        # Button component
        button_component = await _generate_button_component(params)
        button_dir = os.path.join(project_path, "src", "components", "Button")
        os.makedirs(button_dir, exist_ok=True)
        
        # Component file
        button_file = os.path.join(button_dir, "Button.tsx" if typescript else "Button.jsx")
        with open(button_file, 'w', encoding='utf-8') as f:
            f.write(button_component)
        components.append(button_file)
        
        # Index file
        index_file = os.path.join(button_dir, "index.ts")
        with open(index_file, 'w', encoding='utf-8') as f:
            f.write("export { Button } from './Button';\nexport { default } from './Button';\n")
        components.append(index_file)
        
        # Test file
        test_file = os.path.join(button_dir, "Button.test.tsx")
        with open(test_file, 'w', encoding='utf-8') as f:
            f.write(await _generate_button_test(params))
        components.append(test_file)
        
        # Storybook story
        story_file = os.path.join(button_dir, "Button.stories.tsx")
        with open(story_file, 'w', encoding='utf-8') as f:
            f.write(await _generate_button_story(params))
        components.append(story_file)
    
    return components

# Funções auxiliares para gerar configurações
async def _generate_package_json(params: Dict[str, Any]) -> Dict[str, Any]:
    """Gera package.json"""
    
    stack = params.get("stack", "react")
    typescript = params.get("typescript", True)
    styling = params.get("styling", "tailwind")
    testing = params.get("testing", "vitest")
    
    dependencies = {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
    }
    
    if styling == "tailwind":
        dependencies.update({
            "tailwindcss": "^3.4.0",
            "autoprefixer": "^10.4.0",
            "postcss": "^8.4.0",
        })
    
    dev_dependencies = {
        "@vitejs/plugin-react": "^4.0.0",
        "vite": "^4.4.0",
        "eslint": "^8.45.0",
        "eslint-plugin-react": "^7.32.0",
        "eslint-plugin-react-hooks": "^4.6.0",
        "prettier": "^3.0.0",
    }
    
    if typescript:
        dependencies.update({
            "@types/react": "^18.2.0",
            "@types/react-dom": "^18.2.0",
        })
        dev_dependencies.update({
            "typescript": "^5.0.0",
        })
    
    if testing == "vitest":
        dev_dependencies.update({
            "vitest": "^0.34.0",
            "@testing-library/react": "^13.4.0",
            "@testing-library/jest-dom": "^6.0.0",
            "@testing-library/user-event": "^14.4.0",
        })
    
    if params.get("storybook"):
        dev_dependencies.update({
            "@storybook/react": "^7.0.0",
            "@storybook/react-vite": "^7.0.0",
            "@storybook/addon-essentials": "^7.0.0",
        })
    
    return {
        "name": "frontend-app",
        "private": True,
        "version": "0.1.0",
        "type": "module",
        "scripts": {
            "dev": "vite",
            "build": "vite build",
            "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
            "preview": "vite preview",
            "test": "vitest",
            "test:ui": "vitest --ui",
            "test:coverage": "vitest --coverage",
            "storybook": "storybook dev -p 6006",
            "build-storybook": "storybook build"
        },
        "dependencies": dependencies,
        "devDependencies": dev_dependencies
    }

async def _generate_tsconfig_json(params: Dict[str, Any]) -> Dict[str, Any]:
    """Gera tsconfig.json"""
    
    return {
        "compilerOptions": {
            "target": "ES2020",
            "useDefineForClassFields": True,
            "lib": ["ES2020", "DOM", "DOM.Iterable"],
            "module": "ESNext",
            "skipLibCheck": True,
            "moduleResolution": "bundler",
            "allowImportingTsExtensions": True,
            "resolveJsonModule": True,
            "isolatedModules": True,
            "noEmit": True,
            "jsx": "react-jsx",
            "strict": True,
            "noUnusedLocals": True,
            "noUnusedParameters": True,
            "noFallthroughCasesInSwitch": True,
            "baseUrl": ".",
            "paths": {
                "@/*": ["src/*"]
            }
        },
        "include": ["src"],
        "references": [{"path": "./tsconfig.node.json"}]
    }

async def _generate_tailwind_config(params: Dict[str, Any]) -> str:
    """Gera tailwind.config.js"""
    
    return '''/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}'''

async def _generate_vite_config(params: Dict[str, Any]) -> str:
    """Gera vite.config.ts"""
    
    typescript = params.get("typescript", True)
    
    return '''import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})'''

async def _generate_eslint_config(params: Dict[str, Any]) -> str:
    """Gera .eslintrc.js"""
    
    return '''module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}'''

async def _generate_prettier_config(params: Dict[str, Any]) -> Dict[str, Any]:
    """Gera .prettierrc"""
    
    return {
        "semi": True,
        "trailingComma": "es5",
        "singleQuote": True,
        "printWidth": 80,
        "tabWidth": 2,
        "useTabs": False
    }

async def _generate_button_component(params: Dict[str, Any]) -> str:
    """Gera componente Button"""
    
    return '''import React from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps {
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  onClick,
  disabled = false,
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;'''

async def _generate_button_test(params: Dict[str, Any]) -> str:
    """Gera teste do componente Button"""
    
    return '''import { render, screen, fireEvent } from '@testing-library/react';
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
    expect(button).toHaveClass('bg-blue-600');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});'''

async def _generate_button_story(params: Dict[str, Any]) -> str:
    """Gera Storybook story do componente Button"""
    
    return '''import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default Button',
  },
};

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};'''

# Função utilitária cn
async def _generate_utils_cn(params: Dict[str, Any]) -> str:
    """Gera utilitário cn para class names"""
    
    return '''import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}'''

# Exportar função principal
__all__ = ['initialize_frontend_structure']
