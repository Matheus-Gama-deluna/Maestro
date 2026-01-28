# Guia de Prototipagem com IA

**Versão:** 1.0  
**Data:** [DATA]  
**Status:** [RASCUNHO/REVISÃO/APROVADO]

---

## 🎯 **Objetivo**

Este guia fornece um framework completo para criar protótipos funcionais rapidamente usando Google Stitch e outras ferramentas de IA, permitindo validação de conceitos e iterações ágeis antes do desenvolvimento completo.

---

## 📋 **Contexto**

**Especialista Responsável:** Prototipagem Rápida com Google Stitch  
**Fase:** 3 - UX Design  
**Artefatos Anteriores:** Design Doc, Requisitos  
**Próximos Artefatos:** Protótipo funcional, Feedback de usuários

---

## 🔄 **Metodologia de Prototipagem**

### **Princípios Fundamentais**
- **Rapidez:** Protótipos funcionais em horas, não dias
- **Iteração:** Ciclos rápidos de feedback e ajuste
- **Foco:** Validar conceitos, não implementar features completas
- **Realismo:** Dados e interações realistas
- **Aprendizado:** Cada protótipo gera insights valiosos

### **Fluxo de Trabalho**
```
1. Definição do Escopo (2-4 horas)
2. Setup do Ambiente (1 hora)
3. Prototipagem com IA (4-8 horas)
4. Validação com Usuários (2-4 horas)
5. Iteração e Refinamento (2-4 horas)
6. Documentação e Handoff (2 horas)
```

---

## 🛠️ **Ferramentas e Tecnologias**

### **Stack Principal**
- **Google Stitch:** Plataforma principal de prototipagem
- **Figma:** Design e colaboração visual
- **ChatGPT/ Claude:** Geração de código e componentes
- **GitHub Pages:** Hospedagem rápida
- **Netlify/Vercel:** Deploy automatizado

### **Ferramentas de Apoio**
- **TypeScript:** Tipagem e segurança
- **Tailwind CSS:** Estilização rápida
- **React:** Componentes reutilizáveis
- **Vercel Analytics:** Métricas de uso
- **Hotjar:** Feedback de usuários

---

## 📋 **Estrutura do Guia**

### **1. Planejamento do Protótipo**

#### **Definição de Escopo**
```markdown
## Protótipo: [Nome do Protótipo]

### Objetivos Principais
- [Objetivo 1]: [Descrição clara]
- [Objetivo 2]: [Descrição clara]
- [Objetivo 3]: [Descrição clara]

### Features Incluídas
- [ ] [Feature 1]: [Descrição]
- [ ] [Feature 2]: [Descrição]
- [ ] [Feature 3]: [Descrição]

### Features Excluídas
- [ ] [Feature 1]: [Motivo da exclusão]
- [ ] [Feature 2]: [Motivo da exclusão]

### Stakeholders
- **Product Manager:** [Nome]
- **UX Designer:** [Nome]
- **Tech Lead:** [Nome]
- **Test Users:** [Lista de usuários]

### Timeline
- **Setup:** [Data/Hora]
- **Prototipagem:** [Data/Hora]
- **Validação:** [Data/Hora]
- **Iteração:** [Data/Hora]
- **Apresentação:** [Data/Hora]
```

#### **User Stories**
```markdown
### User Stories

#### Story 1: [Título]
**Como** [persona], **quero** [ação], **para** [benefício].

**Critérios de Aceite:**
- [ ] [Critério 1]
- [ ] [Critério 2]
- [ ] [Critério 3]

#### Story 2: [Título]
**Como** [persona], **quero** [ação], **para** [benefício].

**Critérios de Aceite:**
- [ ] [Critério 1]
- [ ] [Critério 2]
- [ ] [Critério 3]
```

### **2. Setup do Ambiente**

#### **Configuração do Google Stitch**
```bash
# 1. Criar projeto Stitch
stitch create [project-name]

# 2. Configurar estrutura
cd [project-name]
mkdir -p src/components src/pages src/utils src/styles

# 3. Inicializar dependências
npm init -y
npm install @stitch/core @stitch/react @stitch/tailwind
```

#### **Estrutura de Pastas**
```
[project-name]/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── ui/             # UI básicos
│   │   ├── forms/          # Formulários
│   │   └── layout/         # Layout components
│   ├── pages/              # Páginas do protótipo
│   │   ├── home/           # Página inicial
│   │   ├── dashboard/      # Dashboard
│   │   └── profile/        # Perfil
│   ├── utils/              # Funções utilitárias
│   ├── styles/             # Estilos globais
│   └── data/               # Dados mock
├── public/                # Assets estáticos
├── docs/                  # Documentação
└── README.md              # Instruções
```

#### **Configuração do Tailwind**
```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/**/*.{html,js}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#8B5CF6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
```

### **3. Prototipagem com IA**

#### **Geração de Componentes**
```typescript
// Prompt para IA:
"Atue como um desenvolvedor React especialista. Crie um componente [tipo] para [descrição] com as seguintes características: [características]. Use TypeScript, Tailwind CSS e boas práticas de acessibilidade."

// Exemplo de componente gerado
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

#### **Geração de Páginas**
```typescript
// Prompt para IA:
"Atue como um desenvolvedor React especialista. Crie uma página [tipo] para [descrição] usando os componentes disponíveis. Inclua: [seções específicas]. Use TypeScript, Tailwind CSS e responsividade."

// Exemplo de página gerada
const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    users: 1234,
    orders: 567,
    revenue: 12345,
    growth: 12.5,
  });
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Dashboard
          </h1>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={stats.users.toLocaleString()}
              icon="users"
              trend="+12%"
            />
            <StatCard
              title="Orders"
              value={stats.orders.toLocaleString()}
              icon="shopping-cart"
              trend="+8%"
            />
            <StatCard
              title="Revenue"
              value={`$${stats.revenue.toLocaleString()}`}
              icon="dollar-sign"
              trend="+15%"
            />
            <StatCard
              title="Growth"
              value={`${stats.growth}%`}
              icon="trending-up"
              trend="+2%"
            />
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ChartCard title="Revenue Trend" />
            <ChartCard title="User Activity" />
          </div>
        </div>
      </main>
    </div>
  );
};
```

#### **Integração com APIs Mock**
```typescript
// Mock API service
class MockApiService {
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  async getUsers(): Promise<User[]> {
    await this.delay(1000);
    return [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
    ];
  }
  
  async getOrders(): Promise<Order[]> {
    await this.delay(800);
    return [
      { id: 1, userId: 1, total: 99.99, status: 'completed' },
      { id: 2, userId: 2, total: 149.99, status: 'pending' },
      { id: 3, userId: 3, total: 79.99, status: 'completed' },
    ];
  }
  
  async getStats(): Promise<DashboardStats> {
    await this.delay(500);
    return {
      users: 1234,
      orders: 567,
      revenue: 12345,
      growth: 12.5,
    };
  }
}

// Hook para usar o mock
const useMockApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiService = new MockApiService();
  
  const fetchData = async <T>(
    fetcher: () => Promise<T>
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetcher();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  return { fetchData, loading, error };
};
```

### **4. Validação com Usuários**

#### **Planejamento da Validação**
```markdown
## Plano de Validação

### Objetivos
- Validar fluxos principais do protótipo
- Coletar feedback qualitativo
- Identificar problemas de usabilidade
- Medir satisfação do usuário

### Participantes
- **Usuários Internos:** [Lista de usuários internos]
- **Usuários Externos:** [Lista de usuários externos]
- **Stakeholders:** [Lista de stakeholders]

### Sessões de Teste
| Sessão | Data | Participantes | Objetivo |
|--------|------|-------------|---------|
| Sessão 1 | [Data] | [Participantes] | Testar fluxo principal |
| Sessão 2 | [Data] | [Participantes] | Testar funcionalidades específicas |
| Sessão 3 | [Data] | [Participantes] | Coletar feedback geral |

### Critérios de Avaliação
- **Facilidade de Uso:** 1-5 (1=Muito difícil, 5=Muito fácil)
- **Utilidade Percebida:** 1-5 (1=Inútil, 5=Muito útil)
- **Design Visual:** 1-5 (1=Péssimo, 5=Excelente)
- **Completude:** 1-5 (1=Incompleto, 5=Completo)
```

#### **Roteiro de Validação**
```typescript
// Script de validação
const validationScript = {
  setup: {
    "Bem-vindo ao usuário": "Olá! Sou [nome] e vou te ajudar a testar nosso protótipo.",
    "Explicar objetivo": "Vamos testar [feature] e gostaria de saber sua opinião.",
    "Instruções gerais": "Sinta-se à vontade para explorar e falar o que pensar.",
  },
  
  tasks: [
    {
      id: "login",
      description: "Faça login com suas credenciais",
      success: "Login realizado com sucesso!",
      error: "Vamos tentar novamente de outra forma.",
    },
    {
      id: "dashboard",
      description: "Explore o dashboard e me diga o que acha",
      prompts: [
        "O que você acha mais útil no dashboard?",
        "Alguma informação está faltando?",
        "O design está claro e intuitivo?",
      ],
    },
    {
      id: "feature_x",
      description: "Teste a funcionalidade [feature]",
      prompts: [
        "Você conseguiu [ação] facilmente?",
        "O resultado foi o que esperava?",
        "Como poderíamos melhorar isso?",
      ],
    },
  ],
  
  feedback: {
    overall: "Em uma escala de 1 a 5, como você avaliaria sua experiência geral?",
    specific: [
      "Houve algo que você gostou particularmente?",
      "Houve algo que frustrou ou confundiu?",
      "O que você mudaria no protótipo?",
      "Você usaria um sistema assim no seu dia a dia?",
    ],
    },
  },
  
  wrapUp: {
    "Agradecimento": "Muito obrigado por seu tempo e feedback!",
    "Próximos passos": "Seus comentários nos ajudarão a melhorar o produto.",
    "Contato": "Se tiver mais dúvidas, pode falar com [contato].",
  },
};
```

#### **Coleta de Feedback**
```typescript
// Formulário de feedback
interface FeedbackForm {
  overallRating: number;
  easeOfUse: number;
  usefulness: number;
  visualDesign: number;
  completeness: number;
  likedFeatures: string[];
  dislikedFeatures: string[];
  suggestions: string;
  wouldUse: boolean;
  additionalComments: string;
}

// Componente de feedback
const FeedbackForm: React.FC = () => {
  const [feedback, setFeedback] = useState<FeedbackForm>({
    overallRating: 0,
    easeOfUse: 0,
    usefulness: 0,
    visualDesign: 0,
    completeness: 0,
    likedFeatures: [],
    dislikedFeatures: [],
    suggestions: '',
    wouldUse: false,
    additionalComments: '',
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Enviar feedback para análise
    console.log('Feedback:', feedback);
    // Mostrar mensagem de agradecimento
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating Components */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Avaliação Geral
        </label>
        <RatingInput
          value={feedback.overallRating}
          onChange={(value) => setFeedback({ ...feedback, overallRating: value })}
        />
      </div>
      
      {/* Outros ratings... */}
      
      {/* Text Areas */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Sugestões de Melhoria
        </label>
        <textarea
          value={feedback.suggestions}
          onChange={(e) => setFeedback({ ...feedback, suggestions: e.target.value })}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Como podemos melhorar o protótipo?"
        />
      </div>
      
      {/* Submit Button */}
      <Button type="submit" className="w-full">
        Enviar Feedback
      </Button>
    </form>
  );
};
```

### **5. Iteração e Refinamento**

#### **Análise de Feedback**
```markdown
## Análise de Feedback

### Métricas Quantitativas
- **NPS (Net Promoter Score):** [Valor]
- **Satisfação Média:** [Valor]
- **Taxa de Conclusão:** [Valor]
- **Tempo Médio de Sessão:** [Valor]

### Feedback Qualitativo
#### Pontos Positivos
- [Ponto positivo 1]: [Descrição]
- [Ponto positivo 2]: [Descrição]
- [Ponto positivo 3]: [Descrição]

#### Pontos a Melhorar
- [Problema 1]: [Descrição e sugestão]
- [Problema 2]: [Descrição e sugestão]
- [Problema 3]: [Descrição e sugestão]

#### Insights Principais
- [Insight 1]: [Descoberta importante]
- [Insight 2]: [Padrão identificado]
- [Insight 3]: [Oportunidade de melhoria]
```

#### **Plano de Iteração**
```markdown
## Plano de Iteração

### Prioridades Alta
1. **[Melhoria 1]** - [Descrição e justificativa]
   - **Esforço:** [horas estimadas]
   - **Impacto:** [alto/médio/baixo]
   - **Deadline:** [data]

2. **[Melhoria 2]** - [Descrição e justificativa]
   - **Esforço:** [horas estimadas]
   - **Impacto:** [alto/médio/baixo]
   - **Deadline:** [data]

### Prioridades Média
1. **[Melhoria 3]** - [Descrição e justificativa]
   - **Esforço:** [horas estimadas]
   - **Impacto:** [alto/médio/baixo]
   - **Deadline:** [data]

### Prioridades Baixa
1. **[Melhoria 4]** - [Descrição e justificativa]
   - **Esforço:** [horas estimadas]
   - **Impacto:** [alto/médio/baixo]
   - **Deadline:** [data]
```

### **Implementação das Mudanças**
```typescript
// Exemplo de melhoria baseada em feedback
const ImprovedButton: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  loading = false, // Novo: estado de loading
  ...props
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
    outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
      }`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Carregando...
        </div>
      ) : (
        children
      )}
    </button>
  );
};
```

### **6. Documentação e Handoff**

#### **Documentação do Protótipo**
```markdown
# [Nome do Protótipo] - Documentação

## Visão Geral
- **Propósito:** [Descrição do propósito]
- **Público-Alvo:** [Público-alvo do protótipo]
- **Status:** [Status atual]
- **Data:** [Data da última atualização]

## Funcionalidades
### [Feature 1]
- **Descrição:** [Descrição detalhada]
- **Como usar:** [Passo a passo]
- **Limitações:** [Limitações conhecidas]

### [Feature 2]
- **Descrição:** [Descrição detalhada]
- **Como usar:** [Passo a passo]
- **Limitações:** [Limitações conhecidas]

## Resultados da Validação
### Métricas
- **NPS:** [valor]
- **Satisfação:** [valor]
- **Taxa de Sucesso:** [valor]

### Feedback Principal
- **Pontos Fortes:** [Lista]
- **Áreas de Melhoria:** [Lista]
- **Insights:** [Lista]

## Próximos Passos
1. **[Ação 1]:** [Descrição e responsável]
2. **[Ação 2]:** [Descrição e responsável]
3. [[Ação 3]:** [Descrição e responsável]

## Contato
- **Product Manager:** [Nome e contato]
- **UX Designer:** [Nome e contato]
- **Tech Lead:** [Nome e contato]
```

#### **Handoff para Desenvolvimento**
```markdown
## Handoff para Desenvolvimento

### Arquitetura Decisions
- **Framework:** [Framework escolhido e porquê]
- **Estilização:** [Sistema de estilização]
- **Estado Global:** [Como estado é gerenciado]
- **APIs:** [Integrações planejadas]

### Componentes Reutilizáveis
- **[Componente 1]:** [Descrição e localização]
- **[Componente 2]:** [Descrição e localização]
- **[Componente 3]:** [Descrição e localização]

### Dados Mock
- **Fonte:** [Origem dos dados mock]
- **Estrutura:** [Estrutura dos dados]
- **Validação:** [Como os dados são validados]

### Lições Aprendidas
- **[Lição 1]:** [Descrição]
- **[Lição 2]:** [Descrição]
- **[Lição 3]:** [Descrição]

### Riscos Identificados
- **[Risco 1]:** [Descrição e mitigação]
- **[Risco 2]:** [Descrição e mitigação]
- **[Risco 3]:** [Descrição e mitigação]

### Recomendações
- **[Recomendação 1]:** [Descrição]
- **[Recomendação 2]:** [Descrição]
- **[Recomendação 3]:** [Descrição]
```

---

## 🎯 **Exemplos Práticos**

### **Exemplo 1: Protótipo de E-commerce**
```markdown
# Protótipo: Loja Virtual

## Objetivos
- Validar fluxo de compra
- Testar experiência de busca
- Avaliar design do produto

### Features
- [x] Catálogo de produtos
- [x] Busca e filtros
- [x] Carrinho de compras
- [x] Checkout simplificado
- [ ] Histórico de pedidos
- [ ] Avaliações de produtos

### Timeline
- **Setup:** 2 horas
- **Prototipagem:** 6 horas
- **Validação:** 4 horas
- **Iteração:** 4 horas
- **Apresentação:** 2 horas
```

### **Exemplo 2: Protótipo de Dashboard Analytics**
```markdown
# Protótipo: Analytics Dashboard

## Objetivos
- Validar visualização de dados
- Testar interatividade dos gráficos
- Avaliar usabilidade dos filtros

### Features
- [x] Dashboard principal
- [x] Gráficos interativos
- [x] Filtros dinâmicos
- [x] Exportação de dados
- [ ] Alertas em tempo real
- [ ] Relatórios personalizados

### Timeline
- **Setup:** 1 hora
- **Prototipagem:** 4 horas
- **Validação:** 3 horas
- **Iteração:** 3 horas
- **Apresentação:** 1 hora
```

---

## ✅ **Checklist de Validação**

### **Antes da Prototipagem**
- [ ] **Escopo definido** e aprovado
- [ ] **User stories** criadas
- **Stakeholders** identificados
- [ ] **Timeline** estabelecida
- [ ] **Ambiente** configurado

### **Durante a Prototipagem**
- [ ] **Componentes** reutilizáveis criados
- [ ] **Dados mock** realistas
- [ ] **Interações** funcionais
- [ ] **Responsividade** implementada
- [ ] **Performance** otimizada

### **Após a Prototipagem**
- [ ] **Deploy** realizado com sucesso
- [ ] **Validação** com usuários concluída
- [ ] **Feedback** coletado e analisado
- [ ] **Iterações** planejadas
- [ ] **Documentação** atualizada

### **Qualidade do Protótipo**
- [ ] **Funcionalidade** básica funcionando
- [ ] **Design** visualmente agradável
- [ ] **Usabilidade** intuitiva
- [ ] **Performance** aceitável
- [ ] **Acessibilidade** considerada

---

## 🚀 **Dicas e Melhores Práticas**

### **Para Prototipagem Rápida**
- **Comece pequeno:** Foque em features essenciais
- **Use templates:** Reutilize componentes e padrões
- **Automatize:** Use scripts e ferramentas IA
- **Itere rápido:** Ciclos curtos de feedback
- **Valide cedo:** Teste com usuários reais

### **Para Colaboração**
- **Compartilhe cedo:** Use Figma ou similar
- **Documente tudo:** Mantenha histórico de decisões
- **Envolva a equipe:** Todos devem contribuir
- **Seja transparente:** Compartilhe processo e resultados
- **Celebre sucessos:** Reconheça conquistas

### **Para Qualidade**
- **Teste tudo:** Valide todos os caminhos
- **Peça a peça:** Teste componentes isoladamente
- **Teste responsividade:** Verifique diferentes dispositivos
- **Monitore performance:** Use ferramentas de análise
- **Peça feedback:** Ouça ativamente os usuários

---

## 📞 **Ferramentas e Recursos**

### **Ferramentas Essenciais**
- **Google Stitch:** [Link para documentação]
- **Figma:** [Link para documentação]
- **ChatGPT/Claude:** [Link para acesso]
- **GitHub:** [Link para repositório]
- **Netlify:** [Link para documentação]

### **Templates e Componentes**
- **Component Library:** [Link para biblioteca]
- **Design System:** [Link para design system]
- **Mock Data:** [Link para dados mock]
- **Starter Kits:** [Link para kits iniciais]

### **Comunidade e Suporte**
- **Discord/Slack:** [Canal de comunicação]
- **Stack Overflow:** [Busque de ajuda técnica]
- **Documentação:** [Link para docs]
- **Tutoriais:** [Links para vídeos/guias]

---

## 🔄 **Atualizações e Manutenção**

### **Versão 1.0** (Data: [DATA])
- Versão inicial do guia
- Framework básico de prototipagem
- Exemplos e templates iniciais

### **Próximas Versões**
- **v1.1:** Adicionar mais ferramentas de IA
- **v1.2:** Incluir exemplos avançados
- **v1.3:** Adicionar seção de mobile
- **v2.0:** Framework completo de validação

---

**Versão:** 1.0  
**Data:** [DATA]  
**Próxima Atualização:** [DATA + 3 meses]  
**Mantenedor:** Equipe de Prototipagem Maestro  
**Contato:** [email@empresa.com]
