# MCP Maestro Development Kit - AI Rules

> Este arquivo define como a IA deve se comportar ao trabalhar com o sistema MCP Maestro em modo File System (FS).

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
❌ ERRADO: Tentar adivinhar o próximo passo ou usar tools MCP inexistentes.
✅ CORRETO: Ler o workflow correspondente e SEGUIR AS INSTRUÇÕES DO ARQUIVO.
```

**Protocolo obrigatório**:
1. Recebe comando (ex: `/avancar-fase`)
2. **LÊ** o arquivo de workflow correspondente (ex: `.windsurf/workflows/avancar-fase.md` ou `.cursor/commands/avancar-fase.md`)
3. **EXECUTA** os passos descritos no markdown, manipulando arquivos diretamente.
4. **ATUALIZA** o estado em `.maestro/estado.json` manualmente.

---

## 📥 REQUEST CLASSIFIER (STEP 1)

**Classifique a intenção do usuário e map para o workflow:**

| Intenção | Comando/Gatilho | Ação (Ler Workflow) |
|----------|-----------------|---------------------|
| **Iniciar** | "criar projeto", "novo" | Ler `01-iniciar-projeto.md` |
| **Avançar** | "próximo", "terminei", "avançar" | Ler `02-avancar-fase.md` |
| **Status** | "status", "onde estou" | Ler `00-maestro.md` |
| **Maestro** | "ajuda", "o que fazer", "/maestro" | Ler `00-maestro.md` |
| **Continuar** | "continuar", "prompts" | Ler `03-continuar-fase.md` |
| **Validar** | "validar", "checklist" | Ler `guide-validacao.md` |

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
// Simulação mental
const estado = JSON.parse(fs.readFileSync('.maestro/estado.json'));
```

### Como Salvar Estado
```javascript
// Simulação mental
estado.updated_at = new Date().toISOString();
fs.writeFileSync('.maestro/estado.json', JSON.stringify(estado, null, 2));
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

Se o usuário digitar um comando, **LEIA O ARQUIVO IMEDIATAMENTE**:

- `/00-maestro` -> `00-maestro.md`
- `/01-iniciar-projeto` -> `01-iniciar-projeto.md`
- `/02-avancar-fase` -> `02-avancar-fase.md`
- `/03-continuar-fase` -> `03-continuar-fase.md`
- `/04-implementar-historia` -> `04-implementar-historia.md`
- `/05-nova-feature` -> `05-nova-feature.md`
- `/06-corrigir-bug` -> `06-corrigir-bug.md`
- `/07-refatorar-codigo` -> `07-refatorar-codigo.md`
- `/08-deploy-projeto` -> `08-deploy-projeto.md`

> **Nota**: Os caminhos dos workflows variam conforme a IDE:
> - Windsurf: `.windsurf/workflows/`
> - Cursor: `.cursor/commands/`
> - Antigravity: `.agent/workflows/`
