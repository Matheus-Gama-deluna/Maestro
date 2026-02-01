# 📚 Component Story Template

## 🎯 Component Information

**Component Name:** [ComponentName]  
**Category:** [Form/UI/Layout/Data Display/Navigation]  
**Status:** [Design/Development/Review/Approved]  
**Version:** [X.X.X]  
**Last Updated:** [Date]  
**Maintainer:** [Developer Name]

## 📋 Overview

### Purpose
[Breve descrição do propósito do componente e qual problema ele resolve]

### When to Use
- [ ] **Scenario 1:** [Quando usar este componente]
- [ ] **Scenario 2:** [Outro cenário de uso]
- [ ] **Scenario 3:** [Terceiro cenário]

### When NOT to Use
- [ ] **Avoid:** [Quando não usar este componente]
- [ ] **Alternative:** [Qual alternativa usar]

## 🎨 Design Specifications

### Visual Design
- [ ] **Colors:** [Cores principais do componente]
- [ ] **Typography:** [Fontes e tamanhos]
- [ ] **Spacing:** [Espaçamento interno e externo]
- [ ] **Border radius:** [Arredondamento de bordas]
- [ ] **Shadows:** [Sombras aplicadas]

### Design Tokens
```css
/* Design System Tokens */
--component-bg: [color-value];
--component-border: [color-value];
--component-text: [color-value];
--component-primary: [color-value];
--component-secondary: [color-value];
```

### Responsive Behavior
- [ ] **Mobile (< 640px):** [Comportamento em mobile]
- [ ] **Tablet (640px - 1024px):** [Comportamento em tablet]
- [ ] **Desktop (> 1024px):** [Comportamento em desktop]

## 🔧 Technical Implementation

### Props Interface
```typescript
interface [ComponentName]Props {
  // Required Props
  requiredProp: string;
  
  // Optional Props
  optionalProp?: string;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  
  // Event Handlers
  onClick?: (event: React.MouseEvent) => void;
  onChange?: (value: string) => void;
  
  // Children
  children?: React.ReactNode;
  
  // Accessibility
  ariaLabel?: string;
  ariaDescribedBy?: string;
}
```

### Default Props
```typescript
const defaultProps: Partial<[ComponentName]Props> = {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false
};
```

### Variants
#### Primary Variant
- [ ] **Use case:** [Quando usar variante primary]
- [ ] **Styling:** [Estilos específicos]
- [ ] **Behavior:** [Comportamento específico]

#### Secondary Variant
- [ ] **Use case:** [Quando usar variante secondary]
- [ ] **Styling:** [Estilos específicos]
- [ ] **Behavior:** [Comportamento específico]

#### Tertiary Variant
- [ ] **Use case:** [Quando usar variante tertiary]
- [ ] **Styling:** [Estilos específicos]
- [ ] **Behavior:** [Comportamento específico]

### States
#### Default State
```typescript
<ComponentName>
  Default content
</ComponentName>
```

#### Hover State
```typescript
<ComponentName>
  Hover content
</ComponentName>
```

#### Active State
```typescript
<ComponentName>
  Active content
</ComponentName>
```

#### Focus State
```typescript
<ComponentName>
  Focus content
</ComponentName>
```

#### Disabled State
```typescript
<ComponentName disabled>
  Disabled content
</ComponentName>
```

#### Loading State
```typescript
<ComponentName loading>
  Loading content
</ComponentName>
```

#### Error State
```typescript
<ComponentName error="Error message">
  Error content
</ComponentName>
```

## 🧪 Testing Stories

### Unit Tests
```typescript
describe('[ComponentName]', () => {
  it('renders correctly with default props', () => {
    render(<ComponentName>Test</ComponentName>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<ComponentName onClick={handleClick}>Click me</ComponentName>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct variant styles', () => {
    render(<ComponentName variant="secondary">Test</ComponentName>);
    const element = screen.getByText('Test');
    expect(element).toHaveClass('variant-secondary');
  });
});
```

### Visual Regression Tests
```typescript
describe('[ComponentName] Visual Tests', () => {
  it('matches default snapshot', () => {
    const { container } = render(<ComponentName>Test</ComponentName>);
    expect(container).toMatchSnapshot();
  });

  it('matches variant snapshots', () => {
    const variants = ['primary', 'secondary', 'tertiary'];
    
    variants.forEach(variant => {
      const { container } = render(
        <ComponentName variant={variant}>Test</ComponentName>
      );
      expect(container).toMatchSnapshot(`variant-${variant}`);
    });
  });
});
```

### Accessibility Tests
```typescript
describe('[ComponentName] Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<ComponentName>Test</ComponentName>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('is keyboard navigable', () => {
    render(<ComponentName>Test</ComponentName>);
    const element = screen.getByText('Test');
    
    element.focus();
    expect(element).toHaveFocus();
    
    fireEvent.keyDown(element, { key: 'Enter' });
    // Test keyboard interaction
  });
});
```

## 📱 Responsive Stories

### Mobile View
```typescript
const MobileStory = () => (
  <div style={{ width: '375px' }}>
    <ComponentName>Mobile content</ComponentName>
  </div>
);
```

### Tablet View
```typescript
const TabletStory = () => (
  <div style={{ width: '768px' }}>
    <ComponentName>Tablet content</ComponentName>
  </div>
);
```

### Desktop View
```typescript
const DesktopStory = () => (
  <div style={{ width: '1024px' }}>
    <ComponentName>Desktop content</ComponentName>
  </div>
);
```

## 🎭 Interaction Stories

### Click Interaction
```typescript
const ClickStory = () => {
  const [count, setCount] = useState(0);
  
  return (
    <ComponentName onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </ComponentName>
  );
};
```

### Form Integration
```typescript
const FormStory = () => {
  const [value, setValue] = useState('');
  
  return (
    <form>
      <ComponentName 
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter text"
      />
    </form>
  );
};
```

### Data Fetching
```typescript
const DataFetchingStory = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/data');
      const result = await response.json();
      setData(result);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ComponentName 
      loading={loading}
      onClick={fetchData}
      disabled={loading}
    >
      {loading ? 'Loading...' : 'Fetch Data'}
    </ComponentName>
  );
};
```

## 🌍 Internationalization Stories

### Multiple Languages
```typescript
const I18nStory = () => {
  const [locale, setLocale] = useState('en');
  
  const translations = {
    en: { text: 'Hello World' },
    es: { text: 'Hola Mundo' },
    pt: { text: 'Olá Mundo' }
  };
  
  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => setLocale('en')}>English</button>
        <button onClick={() => setLocale('es')}>Español</button>
        <button onClick={() => setLocale('pt')}>Português</button>
      </div>
      
      <ComponentName>
        {translations[locale].text}
      </ComponentName>
    </div>
  );
};
```

### RTL Support
```typescript
const RTLStory = () => (
  <div dir="rtl">
    <ComponentName>
      محتوى باللغة العربية
    </ComponentName>
  </div>
);
```

## 🎨 Theme Stories

### Light Theme
```typescript
const LightThemeStory = () => (
  <ThemeProvider theme={lightTheme}>
    <ComponentName>Light theme content</ComponentName>
  </ThemeProvider>
);
```

### Dark Theme
```typescript
const DarkThemeStory = () => (
  <ThemeProvider theme={darkTheme}>
    <ComponentName>Dark theme content</ComponentName>
  </ThemeProvider>
);
```

### Custom Theme
```typescript
const CustomThemeStory = () => {
  const customTheme = {
    colors: {
      primary: '#purple',
      secondary: '#pink'
    }
  };
  
  return (
    <ThemeProvider theme={customTheme}>
      <ComponentName>Custom theme content</ComponentName>
    </ThemeProvider>
  );
};
```

## 🔧 Development Stories

### Development Mode
```typescript
const DevStory = () => (
  <ComponentName 
    debug={true}
    showBorders={true}
    showProps={true}
  >
    Development content
  </ComponentName>
);
```

### Error Boundaries
```typescript
const ErrorBoundaryStory = () => (
  <ErrorBoundary>
    <ComponentName>
      Content with error boundary
    </ComponentName>
  </ErrorBoundary>
);
```

### Performance Testing
```typescript
const PerformanceStory = () => {
  const items = Array.from({ length: 1000 }, (_, i) => `Item ${i}`);
  
  return (
    <div>
      {items.map(item => (
        <ComponentName key={item}>
          {item}
        </ComponentName>
      ))}
    </div>
  );
};
```

## 📊 Usage Examples

### Basic Usage
```typescript
// Simple usage
<ComponentName>
  Basic content
</ComponentName>
```

### Advanced Usage
```typescript
// Advanced usage with all props
<ComponentName
  variant="primary"
  size="lg"
  disabled={false}
  loading={false}
  onClick={handleClick}
  ariaLabel="Action button"
>
  Advanced content
</ComponentName>
```

### Composition
```typescript
// Composed with other components
<Card>
  <ComponentName variant="primary">
    Card content
  </ComponentName>
</Card>
```

## 📝 Documentation

### Props Documentation
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | - | Content to render inside the component |
| variant | 'primary' \| 'secondary' \| 'tertiary' | 'primary' | Visual style variant |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Size variant |
| disabled | boolean | false | Whether the component is disabled |
| loading | boolean | false | Whether to show loading state |
| onClick | (event: MouseEvent) => void | - | Click event handler |

### Best Practices
- [ ] **Do:** [Melhor prática 1]
- [ ] **Do:** [Melhor prática 2]
- [ ] **Don't:** [O que evitar 1]
- [ ] **Don't:** [O que evitar 2]

### Common Pitfalls
- [ ] **Pitfall 1:** [Descrição do problema e solução]
- [ ] **Pitfall 2:** [Descrição do problema e solução]

## 🔄 Migration Guide

### From Previous Version
```typescript
// Old version
<OldComponent prop1="value" prop2="value" />

// New version
<ComponentName variant="primary" size="md">
  Content
</ComponentName>
```

### Breaking Changes
- [ ] **Change 1:** [Descrição da mudança e impacto]
- [ ] **Change 2:** [Descrição da mudança e impacto]

## 📈 Performance Metrics

### Bundle Size Impact
- **Component size:** [X]KB gzipped
- **Dependencies:** [List of additional dependencies]
- **Tree-shaking:** [Supported/Not supported]

### Runtime Performance
- **Render time:** [X]ms average
- **Re-render frequency:** [Low/Medium/High]
- **Memory usage:** [X]MB average

### Optimization Tips
- [ ] **Tip 1:** [Otimização de performance]
- [ ] **Tip 2:** [Otimização de performance]

---

**Storybook URL:** [Link to Storybook]  
**Figma URL:** [Link to Figma design]  
**Related Components:** [List of related components]  
**Dependencies:** [List of dependencies]  
**Test Coverage:** [X]%