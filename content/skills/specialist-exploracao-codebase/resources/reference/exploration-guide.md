# Guia Completo - Exploração de Codebase

## 📋 Introdução

Guia completo para análise sistemática de codebases existentes.

---

## 🔍 Técnicas de Análise

### 1. Análise Estrutural
- Mapeamento de diretórios
- Identificação de entry points
- Detecção de padrões arquiteturais

### 2. Análise de Qualidade
- Complexidade ciclomática
- Duplicação de código
- Cobertura de testes

### 3. Análise de Dependências
- Dependências desatualizadas
- Vulnerabilidades conhecidas
- Dependências circulares

---

## 🛠️ Ferramentas Recomendadas

### Análise de Código
```bash
# Métricas básicas
cloc .                    # Lines of code
lizard src/               # Complexidade
jscpd src/                # Duplicação

# Visualização
madge --circular src/     # Dependências circulares
```

### Dependências
```bash
# Node.js
npm outdated              # Dependências desatualizadas
npm audit                 # Vulnerabilidades

# Python
pip list --outdated       # Dependências desatualizadas
pip-audit                 # Vulnerabilidades
```

---

## 📊 Padrões Arquiteturais Comuns

### MVC (Model-View-Controller)
- **Estrutura:** models/, views/, controllers/
- **Características:** Separação clara de responsabilidades

### Clean Architecture
- **Estrutura:** domain/, application/, infrastructure/
- **Características:** Independência de frameworks

### Microserviços
- **Estrutura:** services/, shared/
- **Características:** Serviços independentes

---

## 🚨 Code Smells Comuns

### 1. Complexidade Alta
- **Threshold:** Complexidade > 10
- **Ação:** Refatorar em funções menores

### 2. Duplicação
- **Threshold:** Duplicação > 5%
- **Ação:** Extrair código comum

### 3. Baixa Cobertura
- **Threshold:** Coverage < 70%
- **Ação:** Adicionar testes

---

## 📈 Cálculo de Dívida Técnica

### Fórmula
```
Debt = (Code Smells × 0.5) + (Complexity × 0.3) + (Duplication × 0.2)
```

### Classificação
- **0-30:** Baixo
- **31-60:** Médio
- **61-100:** Alto

---

## 🔧 Troubleshooting

### Problema: Codebase muito grande
**Solução:** Analisar por módulos

### Problema: Múltiplas linguagens
**Solução:** Usar ferramentas multi-linguagem (cloc, SonarQube)

---

**Versão:** 1.0.0  
**Última Atualização:** 30/01/2026
