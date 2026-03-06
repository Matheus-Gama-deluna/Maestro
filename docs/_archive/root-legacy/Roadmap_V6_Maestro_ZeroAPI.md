# Roadmap de Implementação: Maestro V6 (Fat MCP - Zero API)
**Versão:** 2.0 — Detalhado para Implementação  
**Base de Código:** `@maestro/mcp-server` (v5.5+)

---

## 1. Fundações Existentes (Não reescrever)

| Fundação | Arquivo → Função/Campo | Status |
| :--- | :--- | :--- |
| Instruções corretivas | `instructions.ts` → `gerarInstrucaoCorrecao()` | ✅ 80% — falta payload imperativo |
| Bloqueio de estado | `storage.ts` → `aguardando_aprovacao` | ✅ Existe — não usado no middleware |
| Anti-loop | `avancar.ts` L46 → `MAX_IDENTICAL_CALLS = 3` | ✅ Implementado |
| Skills locais injetadas | `content-injector.ts` → `.agent/skills/` | ✅ Base do Épico 3 |
| Middleware MCP | `validation.middleware.ts` → `withPromptValidation()` | ✅ Intercepta — falta filtro de estado |
| Pipeline de validação | `ValidationPipeline.js` → layers | ✅ Base dos Épicos 4 e 5 |
| Checklist por fase | `skill-loader.service.ts` → `loadChecklist()` | ✅ Reutilizar no Épico 4 |
| Adapter IDE-aware | `ide-paths.ts` → `formatSkillMessage()` | ✅ Paths corretos — falta tom imperativo |
| Modo autônomo parcial | `avancar.ts` L41 → `auto_flow?: boolean` | ⚠️ Existe, subutilizado |

---

## 2. Grafo de Dependências

```
Sprint 1 (Auto-Correção)
    └→ Sprint 2 (Estado Compulsório)    ← bloquear sem loop de saída é prender a IA
         └→ Sprint 3 (Hydration/Persona) ← sem contenção, troca de persona no estado errado
              └→ Sprint 4 (TDD Invertido) ← sem persona certa, checklist antecipado é ignorado
                   ├→ Sprint 5 (Watcher)  ← sem TDD, o watcher valida sem critério
                   └→ Sprint 6 (Zero Pause Points) ← depende de todos os anteriores
```

---

## 3. Sprint 1 — Auto-Correção Injetada

**Objetivo:** A IA corrige e resubmete sem o usuário digitar nada após Gate reprovar.  
**Esforço estimado:** ~2h | **Complexidade:** 🟡 Baixa

### 3.1 Arquivo: `src/utils/instructions.ts`

**Localização exata:** Função `gerarInstrucaoCorrecao()`, linha final (após L222).

**Diff a aplicar:**
```diff
     > 💡 **Dica:** Foque nos itens ❌ pendentes listados acima.
+
+---
+
+> ⚙️ **INSTRUÇÃO DE SISTEMA — AÇÃO AUTÔNOMA REQUERIDA**
+> O usuário humano NÃO precisa intervir neste ciclo de correção.
+> **Você (IA assistente) deve, na ordem, SEM pedir confirmação:**
+> 1. Abrir o template indicado acima em `resources/templates/`
+> 2. Editar o entregável no disco aplicando as correções dos itens ❌
+> 3. Salvar o arquivo
+> 4. Chamar imediatamente: \`executar({ diretorio: "{{DIRETORIO}}", acao: "avancar" })\`
+>
+> ⚠️ Se após 3 tentativas o score ainda for < 70, pare e informe o usuário.
```

**Observação:** Substituir `{{DIRETORIO}}` pelo valor do parâmetro `diretorio` que a função recebe.

### 3.2 Arquivo: `src/tools/proximo.ts`

**Localização exata:** Verificar que o retorno do bloco Score < 70 (em torno da L669) usa `gerarInstrucaoCorrecao()` e não apenas texto estático. Confirmar que o payload correto chega.

**Cenário de Teste do Sprint 1:**
1. Submeter um PRD incompleto (sem seção de Métricas) via `executar({acao:'avancar'})`.
2. Esperar score < 70.
3. **Critério de sucesso:** A IA lê o template, adiciona a seção, salva o arquivo, e chama `executar` novamente — sem que o usuário escreva uma única mensagem.
4. **Critério de falha:** A IA escreve "Corrigi o PRD, quer que eu resubmeta?" — isso significa que o payload imperativo não foi assimilado e o wording precisa ser ajustado.

---

## 4. Sprint 2 — Estado Compulsório Anti-Divagação

**Objetivo:** Quando Gate reprova, só `executar` e `validar` funcionam. Qualquer outra tool retorna erro explicativo.  
**Esforço estimado:** ~4h | **Complexidade:** 🟠 Média

### 4.1 Arquivo: `src/types/index.ts`

**Adicionar ao tipo `EstadoProjeto`:**
```typescript
// Épico 2 V6: Estado compulsório
em_estado_compulsorio?: boolean;
tools_permitidas_no_compulsorio?: string[]; // default: ['executar', 'validar']
```

### 4.2 Arquivo: `src/state/storage.ts`

**Na função `criarEstadoInicial()`**, adicionar defaults:
```typescript
em_estado_compulsorio: false,
tools_permitidas_no_compulsorio: ['executar', 'validar', 'contexto'],
```

> **Atenção:** Incluir `contexto` na whitelist — ela é pequena e ajuda a IA verificar o estado sem avançar indevidamente.

### 4.3 Arquivo: `src/middleware/validation.middleware.ts`

**No início do handler** (antes de chamar `handler(args)`), injetar:
```typescript
// Épico 2 V6: verificação de estado compulsório
const estadoJson = args.estado_json as string | undefined 
                 ?? readFileSync(`${args.diretorio}/.maestro/estado.json`, 'utf-8');
const estado = JSON.parse(estadoJson) as EstadoProjeto;
const ALLOWED = estado.tools_permitidas_no_compulsorio 
              ?? ['executar', 'validar', 'contexto'];

if (estado.em_estado_compulsorio && !ALLOWED.includes(toolName)) {
    return {
        content: formatError(
            toolName,
            `⛔ Gate reprovado — sistema em modo compulsório.`,
            `Corrija o entregável e chame \`executar({acao:'avancar'})\`. ` +
            `Somente as tools [${ALLOWED.join(', ')}] estão disponíveis agora.`
        ),
        isError: true,
    };
}
```

### 4.4 Ativar/Desativar o estado compulsório

- **Ativar:** Em `proximo.ts`, quando o score < 70 e o usuário não aprovou manualmente, setar `estado.em_estado_compulsorio = true` antes de salvar o estado.
- **Desativar:** Em `proximo.ts`, quando o score ≥ 70 (aprovação), setar `estado.em_estado_compulsorio = false`.

**Cenário de Teste do Sprint 2:**
1. Reprovar o Gate (score < 70).
2. Tentar chamar `maestro({ diretorio: "..." })` para ver o status.
3. **Critério de sucesso:** Receber `⛔ Gate reprovado — sistema em modo compulsório.`
4. Tentar chamar `contexto({ diretorio: "..." })`.
5. **Critério de sucesso:** Funcionar normalmente (está na whitelist).
6. Corrigir e resubmeter com score ≥ 70.
7. **Critério de sucesso:** `maestro()` volta a funcionar.

---

## 5. Sprint 3 — Hydration de Contexto e Active Rules Pointer

**Objetivo:** A IA assume a persona correta a cada fase sem o usuário pedir.  
**Esforço estimado:** ~3h | **Complexidade:** 🟠 Média

### 5.1 Arquivo: `src/utils/ide-paths.ts`

**Adicionar nova função** após `formatSkillMessage()` (L107):
```typescript
/**
 * Épico 3 V6: Gera comando imperativo de hidratação de contexto.
 * Usa o formato de @menção nativo de cada IDE para forçar leitura do SKILL.md.
 */
export function formatSkillHydrationCommand(skillName: string, ide: IDEType): string {
    const skillPath = getSkillFilePath(skillName, ide);
    const mention = ide === 'cursor'   ? `@${skillPath}`
                  : ide === 'windsurf' ? `#${skillPath}`
                  : `@[${skillPath}]`; // antigravity

    return [
        ``,
        `---`,
        ``,
        `> ⚙️ **SISTEMA — AÇÃO OBRIGATÓRIA (Nova Fase)**`,
        `> Leia AGORA o arquivo do especialista: ${mention}`,
        `> Assuma a persona descrita no arquivo. Não aguarde confirmação do usuário.`,
        `> Após ler, confirme dizendo: "Sou {nome do especialista}, meu foco é {entregável}."`,
        ``,
    ].join('\n');
}
```

### 5.2 Arquivo: `src/tools/proximo.ts` (L1053)

**Substituir** o fallback `formatSkillMessage(proximaSkill, ide)` por `formatSkillHydrationCommand(proximaSkill, ide)`.

```diff
- ${formatSkillMessage(proximaSkill, ide)}
+ ${formatSkillHydrationCommand(proximaSkill, ide)}
```

### 5.3 Arquivo: `src/tools/iniciar-projeto.ts`

**Detectar o primeiro uso** usando o retorno de `injectContentForIDE` (o campo `installed: boolean`):
```typescript
const injResult = await injectContentForIDE(diretorio, ideEfetiva);

const avisoNovoChatSection = injResult.installed
    ? `\n\n> 💡 **PRIMEIRO USO:** Skills e rules foram criadas agora.\n` +
      `> Para garantia máxima, abra um **Novo Chat** (\`Ctrl+L\`).\n` +
      `> *(Opcional: continue aqui — o Maestro tentará hidratar o contexto automaticamente.)*\n`
    : '';
```

Injetar `avisoNovoChatSection` no corpo da resposta final.

### 5.4 Arquivo: `content/rules/RULES.md` (fonte das rules injetadas)

> **Estratégia:** Editar diretamente o `RULES.md` fonte — que é o arquivo que `content-injector.ts` lê e copia para o projeto. A `generateDefaultRules()` é apenas fallback de emergência quando esse arquivo não existe. A âncora deve viver na fonte.

**Localização no arquivo:** Ao final da seção `## 🤖 SKILLS E ESPECIALISTAS` (após linha 311 do RULES.md atual), antes do `---` de seção.

**Bloco a adicionar no RULES.md:**
```markdown
### 🔄 Regra de Transição de Fase (Active Rules Auto-Hydration)

**Sempre que o servidor MCP confirmar avanço de fase:**
1. Leia **imediatamente** o arquivo SKILL.md do especialista indicado no retorno da tool
2. O path será fornecido no formato nativo da sua IDE:
   - Antigravity: `@[.agent/skills/{specialist}/SKILL.md]`
   - Cursor:      `@.cursor/skills/{specialist}/SKILL.md`
   - Windsurf:    `#.windsurf/skills/{specialist}/SKILL.md`
3. Assuma a persona descrita sem aguardar confirmação do usuário
4. Confirme dizendo: "Sou {nome do especialista}, meu foco é {entregável desta fase}."

> ❌ NUNCA aguarde o usuário pedir para carregar o especialista
> ✅ SEMPRE assuma a persona imediatamente ao receber a transição de fase
```

**Cenário de Teste do Sprint 3:**
1. Avançar fase do PRD para Requisitos.
2. Na resposta do `executar`, verificar se há menção `@[.agent/skills/specialist-engenharia-requisitos-ia/SKILL.md]` (ou equivalente da IDE).
3. **Critério de sucesso:** A IA inicia a fase de Requisitos sem o usuário precisar pedir, apresentando-se como o especialista correto.

---

## 6. Sprint 4 — TDD Invertido (Gate Antecipado)

**Objetivo:** Criar automaticamente um guia de critérios do Gate antes de a IA começar a escrever.  
**Esforço estimado:** ~2h | **Complexidade:** 🟢 Baixa (reuso)

### 6.1 Nova função: `src/utils/gate-orientation.ts`

```typescript
import { SkillLoaderService } from '../services/skill-loader.service.js';
import { ContentResolverService } from '../services/content-resolver.service.js';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { getSkillParaFase } from './prompt-mapper.js';

export async function generateGateOrientationDoc(
    diretorio: string,
    faseNome: string,
    faseNumero: number
): Promise<string | null> {
    const resolver = new ContentResolverService(diretorio);
    const loader = new SkillLoaderService(resolver);
    const checklist = await loader.loadChecklist(faseNome);
    if (!checklist) return null;

    const skillName = getSkillParaFase(faseNome);
    const conteudo = [
        `# 🎯 Critérios do Gate — Fase ${faseNumero}: ${faseNome}`,
        ``,
        `> Gerado automaticamente pelo Maestro. Leia ANTES de escrever o entregável.`,
        `> Estes são os critérios EXATOS que a validação irá checar.`,
        ``,
        `## Skill Ativa`,
        `\`${skillName}\``,
        ``,
        `## Checklist de Aprovação`,
        ``,
        checklist,
        ``,
        `---`,
        `_Score mínimo para aprovação automática: **70/100**_`,
    ].join('\n');

    const outputPath = join(diretorio, 'docs', `fase-${String(faseNumero).padStart(2, '0')}`, '.orientacoes-gate.md');
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, conteudo, 'utf-8');
    return outputPath;
}
```

### 6.2 Arquivo: `src/handlers/specialist-phase-handler.ts`

**No início do handler**, chamar `generateGateOrientationDoc()` ao iniciar nova fase e incluir o path no retorno:
```typescript
const gatePath = await generateGateOrientationDoc(diretorio, faseNome, faseNumero);

// No retorno da resposta:
const gateSection = gatePath
    ? `\n\n📋 **Guia de Gate criado:** \`${gatePath}\`\n> Leia este arquivo antes de escrever o entregável.`
    : '';
```

**Cenário de Teste do Sprint 4:**
1. Avançar para uma nova fase.
2. Verificar se o arquivo `docs/fase-02/.orientacoes-gate.md` foi criado.
3. Abrir o arquivo e confirmar que contém o checklist legível da fase.
4. **Critério de sucesso:** Score ≥ 70 na **primeira** tentativa de entregável (prova que a IA usou o checklist como guia).

---

## 7. Sprint 5 — Event-Driven Watcher

**Objetivo:** Validar automaticamente ao salvar o arquivo, sem o usuário chamar `validar()`.  
**Esforço estimado:** ~1 dia | **Complexidade:** 🔴 Alta

### 7.1 Dependência

```bash
npm install chokidar --workspace=packages/mcp-server
```

> Usar `chokidar` e não `fs.watch` nativo — mais estável no Windows e Mac.

### 7.2 Novo arquivo: `src/services/watcher.service.ts`

```typescript
import chokidar, { FSWatcher } from 'chokidar';

interface WatcherConfig {
    filePath: string;
    diretorio: string;
    faseNome: string;
    onValidationResult: (score: number, feedback: string) => void;
}

const activeWatchers = new Map<string, FSWatcher>();

export function startFileWatcher(config: WatcherConfig): void {
    stopFileWatcher(config.diretorio); // Garante que não há duplicata

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const watcher = chokidar.watch(config.filePath, { persistent: false });

    watcher.on('change', () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            // Chamar ValidationPipeline aqui
            // config.onValidationResult(score, feedbackText);
        }, 500);
    });

    activeWatchers.set(config.diretorio, watcher);
}

export function stopFileWatcher(diretorio: string): void {
    const watcher = activeWatchers.get(diretorio);
    if (watcher) {
        watcher.close();
        activeWatchers.delete(diretorio);
    }
}
```

### 7.3 Ciclo de vida do Watcher

- **Iniciar:** Ao receber entregável válido em `proximo.ts` (antes de validar) — `startFileWatcher()`.
- **Parar:** Ao avançar fase com sucesso (score ≥ 70) — `stopFileWatcher()`.
- **Parar também:** Ao chamar `aprovar_gate()` — evitar leak.

**Critério de Sucesso:**
1. Save no arquivo → validação roda ≤ 1s.
2. 5 saves rápidos consecutivos → apenas 1 validação (debounce funcionou).
3. Avançar fase → watcher encerrado (confirmar via `activeWatchers.size === 0`).

---

## 8. Sprint 6 — Fluxo Autônomo Inteligente (Smart Auto-Flow)

**Objetivo:** O Maestro distingue automaticamente quais fases precisam de dados do usuário e quais pode executar sozinho. O pipeline avança continuamente, parando *apenas* nos pontos onde o input humano é genuinamente necessário.  
**Esforço estimado:** ~2 dias | **Complexidade:** 🔴 Alta

### 8.1 Taxonomia de Fases por Tipo de Input

| Tipo de Fase | Característica | Auto-Flow | Exemplo |
| :--- | :--- | :---: | :--- |
| **Coleta de Negócio** | Requer dados únicos que só o humano tem | ❌ Pausa | PRD (problema, personas, MVP) |
| **Coleta de Decisão** | Requer escolha humana com impacto irreversível | ❌ Pausa | Classificação Simples/Médio/Complexo |
| **Derivada** | A IA pode derivar da fase anterior sem novos dados | ✅ Automático | Requisitos (deriva do PRD), Arquitetura (deriva dos Requisitos) |
| **Técnica Pura** | Produção de código/config sem input novo | ✅ Automático | Frontend, Backend, Banco de Dados |
| **Gate de Correção** | Loop de correção baseado em score < 70 | 🔁 Loop | Qualquer fase com Gate reprovado |

### 8.2 Mapa de Auto-Flow por Fase

| Fase | Tipo | Dados necessários do usuário | Auto? |
| :--- | :--- | :--- | :---: |
| Fase 0 (Setup) | Coleta de Negócio | nome, dir, IDE, modo | ❌ |
| Fase 1 (Produto/PRD) | Coleta de Negócio | problema, público, MVP, métricas | ❌ |
| Classificação | Coleta de Decisão | confirmação simples/médio/complexo | ❌ |
| Fase 2 (Requisitos) | Derivada do PRD | Nenhum novo | ✅ |
| Fase 3 (UX Design) | Derivada + Opcional | Paleta/estilo (opcional) | ✅ |
| Fase 4 (Arquitetura) | Derivada | Nenhum novo | ✅ |
| Fase 5 (Backlog) | Derivada | Nenhum novo | ✅ |
| Fase 6/7 (FE/BE) | Técnica Pura | Nenhum novo | ✅ |
| Fase DB/API/Testes | Técnica Pura | Nenhum novo | ✅ |
| Gate Reprovado | Correção | Decisão após 3 falhas | 🔁/❌ |

> **Em prática:** Apenas Setup, PRD e Classificação precisam de input humano. O restante pode ser executado em pipeline contínuo.

### 8.3 Implementação: `FlowMode` no Estado

Em `src/types/index.ts`, adicionar:
```typescript
type FlowPhaseType = 'input_required' | 'derived' | 'technical' | 'correction_loop';

// Adicionar ao EstadoProjeto:
flow_phase_type?: FlowPhaseType;
auto_flow_enabled?: boolean;
```

Em `src/state/storage.ts`, popular o `flow_phase_type` ao avançar fase:
```typescript
const PHASE_TYPE_MAP: Record<string, FlowPhaseType> = {
    'Produto':        'input_required',
    'Requisitos':     'derived',
    'UX Design':      'derived',
    'Arquitetura':    'derived',
    'Backlog':        'derived',
    'Frontend':       'technical',
    'Backend':        'technical',
    'Banco de Dados': 'technical',
    // ... restante das fases
};
```

### 8.4 O que muda em `next_action`

Em `proximo.ts` e `avancar.ts`, definir `requires_user_input` dinamicamente:
```typescript
const phaseType = PHASE_TYPE_MAP[proximaFase.nome] ?? 'derived';
const requiresInput = phaseType === 'input_required';

next_action: {
    tool: "executar",
    description: `Gerar entregável: ${proximaFase.entregavel_esperado}`,
    args_template: { diretorio, acao: "avancar" },
    requires_user_input: requiresInput,
    user_prompt: requiresInput
        ? `Para esta fase (${proximaFase.nome}), o especialista precisa de informações que só você tem.`
        : ``,
}
```

### 8.5 Instrução de Continuidade (Nas fases Derivadas e Técnicas)

Em `src/utils/instructions.ts`, criar:
```typescript
export function gerarInstrucaoContinuidade(
    diretorio: string,
    faseAtual: number,
    proximaFase: string,
    phaseType: FlowPhaseType
): string {
    if (phaseType === 'input_required') return ''; // Não gerar — o especialista fará as perguntas
    
    return [
        ``,
        `---`,
        ``,
        `> ✅ **Gate aprovado — Fase ${faseAtual} concluída.**`,
        `> **AÇÃO AUTOMÁTICA:** Inicie imediatamente a fase "${proximaFase}".`,
        `> Leia o SKILL.md do especialista indicado acima e gere o entregável.`,
        `> Não aguarde mensagem do usuário. Chame \`executar({ diretorio: "${diretorio}", acao: "avancar" })\` quando pronto.`,
        ``,
    ].join('\n');
}
```

### 8.6 Pontos de Pausa Legítimos (Preservados)

| Condição | Campo | Comportamento |
| :--- | :--- | :--- |
| Fase do tipo `input_required` | `flow_phase_type` | IA faz as perguntas e aguarda |
| Classificação do projeto | `aguardando_classificacao: true` | Para e aguarda confirmação |
| Gate reprovado 3x | `em_estado_compulsorio: true` + retries = 3 | Apresenta opções ao usuário |
| Aprovação manual de Gate | Usuário diz "aprovar" | `aprovar_gate()` executado |
| Solicitação de Stitch | `usar_stitch` não confirmado | Pergunta se quer prototipagem |

### 8.1 O que mudar em `next_action`

Em `src/tools/proximo.ts` e `src/tools/consolidated/avancar.ts`, nos retornos de transição bem-sucedida, alterar:

```diff
 next_action: {
     tool: "executar",
     description: "Gerar entregável da próxima fase",
     args_template: { ... },
-    requires_user_input: true,
-    user_prompt: "Aguarde o especialista gerar o entregável",
+    requires_user_input: false,   // ← Chave da mudança
+    user_prompt: "",
 }
```

### 8.2 Instrução de Continuidade Padrão

Em `src/utils/instructions.ts`, criar função:
```typescript
export function gerarInstrucaoContinuidade(diretorio: string, faseAtual: number): string {
    return [
        ``,
        `---`,
        ``,
        `> ✅ **Fase ${faseAtual} concluída.**`,
        `> **AÇÃO AUTOMÁTICA DO SISTEMA:** Inicie a próxima fase imediatamente.`,
        `> Não aguarde confirmação. Chame \`executar({ diretorio: "${diretorio}", acao: "avancar" })\``,
        `> com o entregável da próxima fase assim que pronto.`,
        ``,
    ].join('\n');
}
```

Chamar esta função no final de cada avanço bem-sucedido em `proximo.ts`.

### 8.3 `auto_flow` como padrão

Em `avancar.ts`, mudar o default:
```diff
- const autoFlow = args.auto_flow ?? false;
+ const autoFlow = args.auto_flow ?? !estado.aguardando_aprovacao;
```

Isso faz o `auto_flow` ser `true` por padrão sempre que não há aprovação manual pendente.

### 8.4 Pontos de Pausa Legítimos (NÃO remover)

| Condição | Campo no estado | Comportamento |
| :--- | :--- | :--- |
| Classificação pendente | `aguardando_classificacao: true` | Para e aguarda o usuário |
| Gate reprovado | `em_estado_compulsorio: true` | Para, entra no loop de correção |
| Dados do negócio faltando | `requires_user_input: true` | Para e faz a pergunta |

**Cenário de Teste do Sprint 6:**
1. Iniciar um projeto com `auto_flow: true` e fornecendo todos os dados de produto.
2. **Critério de sucesso:** O Maestro avança das fases 1 → 2 → 3 sem nenhuma intervenção humana.
3. Reprovar um Gate intencionalmente.
4. **Critério de sucesso:** O loop de correção roda (Sprint 1) e, ao aprovar, o pipeline retoma automaticamente.

---

## 9. Tabela Consolidada de Sprints

| Sprint | Épico | Complexidade | Esforço | Arquivos Principais |
| :--- | :--- | :---: | :---: | :--- |
| 1 | Auto-Correção Loop | 🟡 Baixa | ~2h | `instructions.ts` |
| 2 | Estado Compulsório | 🟠 Média | ~4h | `validation.middleware.ts`, `types/index.ts`, `proximo.ts` |
| 3 | Hydration / Persona | 🟠 Média | ~3h | `ide-paths.ts`, `proximo.ts`, `iniciar-projeto.ts` |
| 4 | TDD Invertido | 🟢 Baixa | ~2h | `gate-orientation.ts` (novo), `specialist-phase-handler.ts` |
| 5 | Watcher | 🔴 Alta | ~1 dia | `watcher.service.ts` (novo), `proximo.ts` |
| 6 | Zero Pause Points | 🔴 Alta | ~2 dias | `avancar.ts`, `proximo.ts`, `instructions.ts` |

---

## 10. Riscos e Mitigações

| Risco | Prob. | Impacto | Mitigação |
| :--- | :---: | :---: | :--- |
| Loop infinito de auto-correção | Média | Alto | `MAX_IDENTICAL_CALLS = 3` já garante |
| Watcher gerando CPU leak | Alta | Alto | Debounce 500ms + `stopFileWatcher()` na troca de fase |
| `auto_flow` em Gate manual | Alta | Alto | `em_estado_compulsorio` bloqueia explicitamente |
| Prompt imperativo ignorado pela LLM | Média | Médio | Testar wording em Cursor/Windsurf/Antigravity e ajustar por IDE |
| `@mention` no formato errado | Baixa | Alto | `formatSkillHydrationCommand()` usa `IDE_CONFIGS` como fonte única de verdade |
| Watcher não detecta save no Windows | Média | Médio | Usar `chokidar` com opção `usePolling: true` como fallback |

---

## 11. Conclusão

O *codebase* (v5.5+) está preparado. A maioria das fundações existe — o trabalho é **ajustar o tom e conectar os pontos**. Os Sprints 1 e 3 são os de maior impacto imediato com menor risco. O Sprint 6 (Zero Pause Points) é a visão final e requer os 5 anteriores funcionando.

```
Sprint 1+2 → IA corrige e não divaga
Sprint 3   → IA assume a persona certa
Sprint 4   → IA sabe os critérios antes de escrever
Sprint 5   → Validação automática ao salvar
Sprint 6   → Tudo conectado: pipeline autônomo completo
```
