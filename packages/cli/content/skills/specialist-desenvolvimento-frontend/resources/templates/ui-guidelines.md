# 🎨 UI Guidelines Template

## 📋 Project Overview

**Project Name:** [Project Name]  
**Design System:** [Design System Name]  
**UI Framework:** [React/Vue/Angular/Svelte]  
**Styling Solution:** [Tailwind CSS/Styled Components/Emotion]  
**Last Updated:** [Date]  
**Version:** [X.X.X]

## 🎯 Design Principles

### Core Principles
1. **Consistency:** [Descrição do princípio de consistência]
2. **Clarity:** [Descrição do princípio de clareza]
3. **Efficiency:** [Descrição do princípio de eficiência]
4. **Accessibility:** [Descrição do princípio de acessibilidade]

### User Experience Goals
- [ ] **Intuitive:** [Meta de usabilidade]
- [ ] **Responsive:** [Meta de responsividade]
- [ ] **Performant:** [Meta de performance]
- [ ] **Accessible:** [Meta de acessibilidade]

## 🎨 Visual Design System

### Color Palette

#### Primary Colors
```css
/* Primary Colors */
--color-primary-50: #f0f9ff;
--color-primary-100: #e0f2fe;
--color-primary-200: #bae6fd;
--color-primary-300: #7dd3fc;
--color-primary-400: #38bdf8;
--color-primary-500: #0ea5e9;  /* Main primary */
--color-primary-600: #0284c7;
--color-primary-700: #0369a1;
--color-primary-800: #075985;
--color-primary-900: #0c4a6e;
```

#### Secondary Colors
```css
/* Secondary Colors */
--color-secondary-50: #f8fafc;
--color-secondary-100: #f1f5f9;
--color-secondary-200: #e2e8f0;
--color-secondary-300: #cbd5e1;
--color-secondary-400: #94a3b8;
--color-secondary-500: #64748b;  /* Main secondary */
--color-secondary-600: #475569;
--color-secondary-700: #334155;
--color-secondary-800: #1e293b;
--color-secondary-900: #0f172a;
```

#### Semantic Colors
```css
/* Success Colors */
--color-success-50: #f0fdf4;
--color-success-500: #22c55e;
--color-success-600: #16a34a;

/* Warning Colors */
--color-warning-50: #fffbeb;
--color-warning-500: #f59e0b;
--color-warning-600: #d97706;

/* Error Colors */
--color-error-50: #fef2f2;
--color-error-500: #ef4444;
--color-error-600: #dc2626;

/* Info Colors */
--color-info-50: #eff6ff;
--color-info-500: #3b82f6;
--color-info-600: #2563eb;
```

#### Neutral Colors
```css
/* Neutral Colors for text and backgrounds */
--color-neutral-0: #ffffff;
--color-neutral-50: #fafafa;
--color-neutral-100: #f5f5f5;
--color-neutral-200: #e5e5e5;
--color-neutral-300: #d4d4d4;
--color-neutral-400: #a3a3a3;
--color-neutral-500: #737373;
--color-neutral-600: #525252;
--color-neutral-700: #404040;
--color-neutral-800: #262626;
--color-neutral-900: #171717;
--color-neutral-950: #0a0a0a;
```

### Typography

#### Font Family
```css
/* Font Stack */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
--font-serif: 'Georgia', 'Times New Roman', serif;
```

#### Font Sizes
```css
/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
--text-6xl: 3.75rem;   /* 60px */
```

#### Font Weights
```css
/* Font Weights */
--font-thin: 100;
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
--font-black: 900;
```

#### Line Heights
```css
/* Line Heights */
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

### Spacing System

#### Base Spacing
```css
/* Base Spacing Unit */
--space-px: 1px;
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
--space-32: 8rem;     /* 128px */
```

#### Component Spacing
```css
/* Component-specific spacing */
--spacing-component-padding: var(--space-4);
--spacing-component-margin: var(--space-6);
--spacing-section-padding: var(--space-12);
--spacing-section-margin: var(--space-16);
```

### Border Radius

```css
/* Border Radius */
--radius-none: 0;
--radius-sm: 0.125rem;    /* 2px */
--radius-base: 0.25rem;   /* 4px */
--radius-md: 0.375rem;    /* 6px */
--radius-lg: 0.5rem;      /* 8px */
--radius-xl: 0.75rem;     /* 12px */
--radius-2xl: 1rem;       /* 16px */
--radius-3xl: 1.5rem;     /* 24px */
--radius-full: 9999px;
```

### Shadows

```css
/* Shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
```

## 📱 Layout Guidelines

### Grid System

#### Container
```css
/* Container */
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

@media (min-width: 640px) {
  .container { max-width: 640px; }
}

@media (min-width: 768px) {
  .container { max-width: 768px; }
}

@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}
```

#### Grid
```css
/* Grid System */
.grid {
  display: grid;
  gap: var(--space-4);
}

.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
```

### Breakpoints

```css
/* Breakpoints */
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Small desktops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large desktops */
```

### Responsive Utilities

```css
/* Mobile-first approach */
.component {
  /* Mobile styles (default) */
  padding: var(--space-4);
}

@media (min-width: 768px) {
  .component {
    /* Tablet and up */
    padding: var(--space-6);
  }
}

@media (min-width: 1024px) {
  .component {
    /* Desktop and up */
    padding: var(--space-8);
  }
}
```

## 🎯 Component Guidelines

### Button Component

#### Variants
```css
/* Button Primary */
.btn-primary {
  background-color: var(--color-primary-500);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--color-primary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* Button Secondary */
.btn-secondary {
  background-color: transparent;
  color: var(--color-primary-500);
  border: 1px solid var(--color-primary-500);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: var(--color-primary-50);
}
```

#### Sizes
```css
/* Button Sizes */
.btn-sm {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
}

.btn-md {
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-base);
}

.btn-lg {
  padding: var(--space-4) var(--space-8);
  font-size: var(--text-lg);
}
```

### Card Component

```css
/* Card */
.card {
  background-color: var(--color-neutral-0);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
  padding: var(--space-6);
  border: 1px solid var(--color-neutral-200);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  transition: all 0.2s ease;
}

.card-header {
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-neutral-200);
}

.card-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-900);
  margin: 0;
}

.card-content {
  color: var(--color-neutral-600);
  line-height: var(--leading-relaxed);
}
```

### Form Components

#### Input Field
```css
/* Input */
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.input:invalid {
  border-color: var(--color-error-500);
}

.input::placeholder {
  color: var(--color-neutral-400);
}
```

#### Label
```css
/* Label */
.label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-neutral-700);
  margin-bottom: var(--space-2);
}
```

## 🎭 Animation Guidelines

### Transitions

```css
/* Standard Transitions */
.transition-standard {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-slow {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-fast {
  transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Hover Effects

```css
/* Hover Lift */
.hover-lift {
  transition: transform 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
}

/* Hover Scale */
.hover-scale {
  transition: transform 0.2s ease;
}

.hover-scale:hover {
  transform: scale(1.05);
}
```

### Loading Animations

```css
/* Spinner */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
}

/* Pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

## ♿ Accessibility Guidelines

### Focus Management

```css
/* Focus Styles */
.focus-ring {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.focus-visible:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
```

### Screen Reader Support

```css
/* Screen Reader Only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### Color Contrast

#### Minimum Contrast Ratios
- **WCAG AA:** 4.5:1 for normal text, 3:1 for large text
- **WCAG AAA:** 7:1 for normal text, 4.5:1 for large text

#### Contrast Validation
```css
/* Text Colors with Proper Contrast */
.text-primary {
  color: var(--color-neutral-900); /* High contrast */
}

.text-secondary {
  color: var(--color-neutral-600); /* Good contrast */
}

.text-muted {
  color: var(--color-neutral-400); /* Lower contrast, for decorative text */
}
```

## 📐 Responsive Design Patterns

### Mobile-First Approach

#### Mobile Styles (Default)
```css
.hero {
  padding: var(--space-8) var(--space-4);
  text-align: center;
}

.hero-title {
  font-size: var(--text-3xl);
  margin-bottom: var(--space-4);
}
```

#### Tablet Styles (768px+)
```css
@media (min-width: 768px) {
  .hero {
    padding: var(--space-16) var(--space-8);
    text-align: left;
  }
  
  .hero-title {
    font-size: var(--text-4xl);
    margin-bottom: var(--space-6);
  }
}
```

#### Desktop Styles (1024px+)
```css
@media (min-width: 1024px) {
  .hero {
    padding: var(--space-24) var(--space-12);
  }
  
  .hero-title {
    font-size: var(--text-5xl);
    margin-bottom: var(--space-8);
  }
}
```

### Component Patterns

#### Navigation
```css
/* Mobile Navigation */
.nav-mobile {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Desktop Navigation */
@media (min-width: 1024px) {
  .nav-desktop {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--space-8);
  }
  
  .nav-mobile {
    display: none;
  }
}
```

## 🔧 Development Guidelines

### CSS Architecture

#### BEM Methodology
```css
/* Block */
.card { }

/* Element */
.card__header { }
.card__content { }
.card__footer { }

/* Modifier */
.card--featured { }
.card--compact { }
.card__header--centered { }
```

#### CSS Custom Properties
```css
/* Use custom properties for theming */
:root {
  --component-bg: var(--color-neutral-0);
  --component-border: var(--color-neutral-200);
  --component-text: var(--color-neutral-900);
}

[data-theme="dark"] {
  --component-bg: var(--color-neutral-900);
  --component-border: var(--color-neutral-700);
  --component-text: var(--color-neutral-100);
}
```

### Performance Guidelines

#### CSS Optimization
- [ ] **Minimize CSS:** Remove unused styles
- [ ] **Critical CSS:** Inline critical above-the-fold styles
- [ ] **CSS Compression:** Use minification in production
- [ ] **Avoid @import:** Use link tags instead

#### Image Optimization
- [ ] **Modern Formats:** Use WebP, AVIF when supported
- [ ] **Responsive Images:** Use srcset and sizes attributes
- [ ] **Lazy Loading:** Implement lazy loading for below-fold images
- [ ] **Compression:** Compress images without quality loss

## 📊 Quality Assurance

### Code Review Checklist

#### Visual Design
- [ ] **Color Usage:** Colors match design system
- [ ] **Typography:** Fonts, sizes, and weights are correct
- [ ] **Spacing:** Consistent spacing throughout
- [ ] **Alignment:** Proper alignment of elements

#### Responsiveness
- [ ] **Mobile:** Layout works on mobile devices
- [ ] **Tablet:** Layout adapts to tablet screens
- [ ] **Desktop:** Layout optimized for desktop
- [ ] **Breakpoints:** Smooth transitions between breakpoints

#### Accessibility
- [ ] **Contrast:** Text meets WCAG contrast requirements
- [ ] **Focus:** Focus states are visible and logical
- [ ] **Keyboard:** All interactive elements keyboard accessible
- [ ] **Screen Reader:** Proper ARIA labels and roles

#### Performance
- [ ] **Load Time:** Pages load within acceptable time
- [ ] **Animation:** Animations are smooth and performant
- [ ] **Bundle Size:** CSS bundle size is optimized
- [ ] **Unused CSS:** No unused CSS in production

### Browser Support

#### Target Browsers
- [ ] **Chrome:** Latest version
- [ ] **Firefox:** Latest version
- [ ] **Safari:** Latest 2 versions
- [ ] **Edge:** Latest version

#### Progressive Enhancement
- [ ] **Core Functionality:** Works without JavaScript
- [ ] **Enhanced Experience:** Enhanced with JavaScript
- [ ] **Fallbacks:** Graceful degradation for older browsers

## 🚀 Implementation Checklist

### Pre-Launch
- [ ] **Design System:** All components follow design system
- [ ] **Cross-browser:** Tested across all target browsers
- [ ] **Responsive:** Tested on various device sizes
- [ ] **Accessibility:** Accessibility audit completed
- [ ] **Performance:** Performance metrics meet targets

### Post-Launch
- [ ] **Monitoring:** Performance monitoring implemented
- [ ] **Analytics:** User interaction tracking
- [ ] **Feedback:** User feedback collection system
- [ ] **Maintenance:** Regular updates and improvements

---

**Design Team:** [Design team contact]  
**Development Team:** [Development team contact]  
**Last Review:** [Date of last review]  
**Next Review:** [Date of next review]