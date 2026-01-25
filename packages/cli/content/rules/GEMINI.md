---
trigger: always_on
system: maestro
version: 1.0.0
---

# GEMINI.md - MCP Maestro Development Kit (FS Mode)

> Este arquivo define como a IA deve se comportar ao trabalhar com o sistema Maestro File System.

---

## CRITICAL: MAESTRO FS PROTOCOL (START HERE)

> **MANDATORY:** Você DEVE seguir o protocolo Maestro FS para todos os projetos neste workspace.

### 1. Detectar Contexto

**Antes de QUALQUER ação, verificar**:
- ✅ Existe `.maestro/estado.json` no diretório?
- ✅ Se SIM → Ativar Modo Maestro FS
- ✅ Se NÃO → Seguir fluxo padrão ou sugerir `/iniciar-projeto`

### 2. Princípio "Workflow-Driven" (CRÍTICO)

```
❌ ERRADO: Tentar usar tools MCP inexistentes (mcp_maestro_*).
✅ CORRETO: Ler e seguir os workflows definidos em `.agent/workflows/`.
```

**Protocolo obrigatório**:
1. Recebe comando (ex: `/avancar-fase`)
2. **LÊ** o arquivo de workflow correspondente (ex: `.agent/workflows/avancar-fase.md`)
3. **EXECUTA** os passos descritos, usando tools nativas (`read_file`, `write_to_file`).
4. **MANIPULA** o estado em `.maestro/estado.json` diretamente.

---

## 📥 REQUEST CLASSIFIER (STEP 1)

**Classifique a intenção do usuário e map para o workflow:**

| Intenção | Comando/Gatilho | Ação (Ler Workflow) |
|----------|-----------------|---------------------|
| **Iniciar** | "criar projeto", "novo" | Ler `.agent/workflows/01-iniciar-projeto.md` |
| **Avançar** | "próximo", "terminei", "avançar" | Ler `.agent/workflows/02-avancar-fase.md` |
| **Status** | "status", "onde estou" | Ler `.agent/workflows/00-maestro.md` |
| **Maestro** | "ajuda", "o que fazer", "/maestro" | Ler `.agent/workflows/00-maestro.md` |
| **Continuar** | "continuar", "prompts" | Ler `.agent/workflows/03-continuar-fase.md` |
| **Validar** | "validar", "checklist" | Ler `.agent/workflows/../guides/guide-validacao.md` |

---

## 🤖 SPECIALIST AUTO-LOADING (STEP 2)

**Sempre que definir ou mudar de fase:**

1.  Ler `.maestro/estado.json` para saber a fase atual.
2.  Identificar o especialista em `.maestro/content/specialists/`.
3.  **Ler o arquivo do especialista** e aplicar sua persona.

### Response Format (MANDATORY)

Ao assumir um especialista:

```markdown
🎯 **Fase {número}: {nome}**
🤖 **Especialista**: `{nome_especialista}`
📋 **Entregável**: {entregavel_esperado}

[Continuar com instruções do especialista]
```

---

## TIER 0: REGRAS UNIVERSAIS

### 🌐 Language Handling
- **Responder**: Sempre em português do Brasil
- **Código**: Inglês
- **Documentação**: Português

### 📁 File Structure Awareness

**Estrutura Padrão**:
```
projeto/
├── .maestro/
│   ├── estado.json       # ⭐ FONTE DA VERDADE
│   ├── content/          # Especialistas e templates (LOCAL)
│   └── history/          # Histórico de eventos
├── docs/                 # Documentação do projeto
└── src/                  # Código fonte
```

**Antes de modificar arquivos**:
1. Verificar se está seguindo estrutura Maestro
2. Criar diretórios por fase (`docs/{numero}-{nome}/`) quando instruído pelo workflow

---

## TIER 1: OPERAÇÃO MANUAL DE ESTADO

Como não há MCP para gerenciar o estado, **VOCÊ É O GERENTE DO ESTADO**.

### Como Ler Estado
```javascript
// Ação real
const content = read_file('.maestro/estado.json');
const estado = JSON.parse(content);
```

### Como Salvar Estado
```javascript
// Ação real
estado.updated_at = new Date().toISOString();
write_to_file('.maestro/estado.json', JSON.stringify(estado, null, 2));
```

**NUNCA invente dados.** Use apenas o que está nos arquivos.

---

## TIER 2: VALIDAÇÃO E QUALIDADE

Ao executar `/validar-gate` ou `/avancar-fase`, você **DEVE** ler:

1.  `.maestro/content/rules/quality-gates.md` (Checklist Específico da Transição)
2.  `.maestro/content/rules/validation-rules.md` (Cálculo de Score e Tiers)

**Não tente validar de memória.** Use sempre os critérios definidos nestes arquivos.

---

## 📁 QUICK REFERENCE - WORKFLOWS

**Workflows Antigravity (.agent/workflows/)**:

- `/00-maestro` -> `00-maestro.md`
- `/01-iniciar-projeto` -> `01-iniciar-projeto.md`
- `/02-avancar-fase` -> `02-avancar-fase.md`
- `/03-continuar-fase` -> `03-continuar-fase.md`
- `/04-implementar-historia` -> `04-implementar-historia.md`
- `/05-nova-feature` -> `05-nova-feature.md`
- `/06-corrigir-bug` -> `06-corrigir-bug.md`
- `/07-refatorar-codigo` -> `07-refatorar-codigo.md`
- `/08-deploy-projeto` -> `08-deploy-projeto.md`

Use `view_file` para ler o workflow antes de executá-lo.
