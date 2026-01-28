# 📁 Exemplo de Estrutura Gerada pelo Adaptador

## 🎯 Cenário: Projeto E-commerce com 3 IDEs

### Estrutura Master (content/skills/)
```
content/skills/
├── api-patterns/
│   ├── SKILL.md
│   ├── rest.md
│   ├── graphql.md
│   └── scripts/
│       └── api_validator.py
├── frontend-design/
│   ├── SKILL.md
│   ├── ux-psychology.md
│   ├── color-system.md
│   └── scripts/
│       └── ux_audit.py
└── database-design/
    ├── SKILL.md
    ├── schema-design.md
    └── migrations.md
```

---

## 🟢 Windsurf - Formato Nativo (100% Compatível)

### Comando
```bash
npx @maestro-ai/cli --ide windsurf
```

### Estrutura Gerada
```
.windsurf/
├── skills/
│   ├── api-patterns/
│   │   ├── SKILL.md                 # ✅ Cópia exata
│   │   ├── rest.md                  # ✅ Cópia exata
│   │   ├── graphql.md               # ✅ Cópia exata
│   │   └── scripts/
│   │       └── api_validator.py     # ✅ Cópia exata
│   ├── frontend-design/
│   │   ├── SKILL.md                 # ✅ Cópia exata
│   │   ├── ux-psychology.md         # ✅ Cópia exata
│   │   ├── color-system.md          # ✅ Cópia exata
│   │   └── scripts/
│   │       └── ux_audit.py           # ✅ Cópia exata
│   └── database-design/
│       ├── SKILL.md                 # ✅ Cópia exata
│       ├── schema-design.md          # ✅ Cópia exata
│       └── migrations.md             # ✅ Cópia exata
└── workflows/
    └── [workflows copiados]
```

### Exemplo de Arquivo (SKILL.md)
```markdown
---
name: api-patterns
description: API design principles and decision-making...
allowed-tools: Read, Write, Edit, Glob, Grep
---

# API Patterns

## 📑 Content Map
| File | Description | When to Read |
|------|-------------|--------------|
| `rest.md` | Resource naming, HTTP methods | Designing REST API |
| `graphql.md` | Schema design, when to use | Considering GraphQL |
```

---

## 🟡 Cursor - Versão Simplificada (75% Compatível)

### Comando
```bash
npx @maestro-ai/cli --ide cursor
```

### Estrutura Gerada
```
.cursor/
├── skills/
│   ├── api-patterns/
│   │   ├── SKILL.md                 # 🔄 Adaptado
│   │   ├── rest.md                  # ✅ Cópia
│   │   ├── graphql.md               # ✅ Cópia
│   │   └── scripts/
│   │       └── api_validator.py     # ✅ Cópia
│   ├── frontend-design/
│   │   ├── SKILL.md                 # 🔄 Adaptado
│   │   ├── ux-psychology.md         # ✅ Cópia
│   │   ├── color-system.md          # ✅ Cópia
│   │   └── scripts/
│   │       └── ux_audit.py           # ✅ Cópia
│   └── database-design/
│       ├── SKILL.md                 # 🔄 Adaptado
│       ├── schema-design.md          # ✅ Cópia
│       └── migrations.md             # ✅ Cópia
└── commands/
    └── [workflows copiados]
```

### Exemplo de Arquivo Adaptado (SKILL.md)
```markdown
# API Patterns

## Description
API design principles and decision-making. REST vs GraphQL selection, response formats, versioning.

## Quick Access
- **rest**: Resource naming, HTTP methods, status codes
- **graphql**: Schema design, when to use, security
- **response**: Envelope pattern, error format, pagination

## When to Use
Use this skill when:
- Designing new APIs
- Choosing between REST/GraphQL/tRPC
- Planning API documentation
- Setting up API versioning

## Files Available
- rest.md
- graphql.md
- response.md
- versioning.md
- auth.md
- rate-limiting.md

---
*This skill is part of the Maestro File System - adapted for Cursor*
```

---

## 🟠 Antigravity - Versão Reestruturada (60% Compatível)

### Comando
```bash
npx @maestro-ai/cli --ide antigravity
```

### Estrutura Gerada
```
.agent/
├── skills/
│   ├── api-patterns/
│   │   ├── skill.md                 # 🔄 Renomeado + Adaptado
│   │   └── content/                 # 🔄 Subdiretório
│   │       ├── rest.md              # ✅ Movido
│   │       ├── graphql.md           # ✅ Movido
│   │       └── scripts/
│   │           └── api_validator.py # ✅ Movido
│   ├── frontend-design/
│   │   ├── skill.md                 # 🔄 Renomeado + Adaptado
│   │   └── content/                 # 🔄 Subdiretório
│   │       ├── ux-psychology.md     # ✅ Movido
│   │       ├── color-system.md      # ✅ Movido
│   │       └── scripts/
│   │           └── ux_audit.py       # ✅ Movido
│   └── database-design/
│       ├── skill.md                 # 🔄 Renomeado + Adaptado
│       └── content/                 # 🔄 Subdiretório
│           ├── schema-design.md      # ✅ Movido
│           └── migrations.md         # ✅ Movido
└── workflows/
    └── [workflows copiados]
```

### Exemplo de Arquivo Adaptado (skill.md)
```markdown
---
name: api-patterns
trigger: on_demand
category: backend
version: 1.0.0
---

# API Patterns

## Overview
API design principles and decision-making for modern applications.

## Quick Start
This skill provides expertise in API design. Use it when you need help with:

- **rest**: Resource naming, HTTP methods, status codes
- **graphql**: Schema design, when to use, security
- **response**: Envelope pattern, error format, pagination
- **versioning**: URI/Header/Query versioning strategies
- **auth**: JWT, OAuth, API Keys patterns
- **rate-limiting**: Token bucket, sliding window

## Available Resources
All detailed guides are available in the `content/` directory:
- `content/rest.md`
- `content/graphql.md`
- `content/response.md`
- `content/versioning.md`
- `content/auth.md`
- `content/rate-limiting.md`

## Usage
Simply reference this skill when working on API design tasks, and the AI will automatically load the relevant expertise.

---
*Generated by Maestro CLI for Antigravity/Gemini*
```

---

## 🔄 Processo de Atualização

### Comando
```bash
npx @maestro-ai/cli update
```

### O que acontece:
1. **Detecta IDE atual** (lê `.maestro/config.json`)
2. **Atualiza content master** (`.maestro/content/`)
3. **Re-adapta skills** para IDE detectada
4. **Mantém consistência** entre master e versão específica

### Exemplo de Update (Cursor)
```
🔄 Detectando IDE atual... cursor
📝 Atualizando content principal...
📋 Atualizando workflows...
🔄 Atualizando skills para cursor...
✅ Skills atualizadas para cursor
```

---

## 📊 Comparação de Performance

| Operação | Windsurf | Cursor | Antigravity |
|----------|----------|--------|-------------|
| **Inicialização** | < 1s | ~2s | ~3s |
| **Atualização** | < 1s | ~2s | ~3s |
| **Uso na IDE** | ⚡ Nativo | 🐌 Leitura | ⏳ Indexação |
| **Features** | 100% | 75% | 60% |

---

## 🎯 Benefícios Práticos

### Para o Desenvolvedor
```bash
# Único comando para qualquer IDE
npx @maestro-ai/cli --ide [sua-ide]

# Mesma experiência em qualquer IDE
/api-patterns  # Carrega expertise automaticamente
```

### Para o Mantenedor
```bash
# Atualiza todas as IDEs de uma vez
npx @maestro-ai/cli update

# Mudanças na master propagam automaticamente
```

### Para a Equipe
- **Consistência** - Mesmo conteúdo base
- **Flexibilidade** - Cada um usa sua IDE preferida
- **Produtividade** - Skills otimizadas para cada ambiente

---

## 🔧 Validação

### Script de Teste
```bash
node scripts/test-skill-adapter.js
```

### Saída Esperada
```
🧪 Testando Skill Adapter...

🔄 Testando adaptação para WINDSURF...
✅ windsurf: 47 skills adaptadas
   📁 Estrutura Windsurf: SKILL.md=true

🔄 Testando adaptação para CURSOR...
✅ cursor: 47 skills adaptadas
   📁 Estrutura Cursor: SKILL.md=true

🔄 Testando adaptação para ANTI-GRAVITY...
✅ antigravity: 47 skills adaptadas
   📁 Estrutura Antigravity: skill.md=true, content/=true

📊 Resumo dos testes:
📁 Arquivos gerados em: test-output
💡 Revise manualmente para validar qualidade da adaptação
```

---

*Este exemplo demonstra como o adaptador mantém a consistência do conteúdo enquanto otimiza o formato para cada IDE específica.*
