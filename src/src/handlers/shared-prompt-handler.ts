/**
 * Handler compartilhado de Prompts MCP.
 * 
 * Centraliza a lógica de listagem e resolução de prompts
 * para ambos entry points (stdio.ts e index.ts).
 * 
 * @since v5.2.0 — Task C.4 do Roadmap v5.2
 */

import { createStateService } from "../services/state.service.js";
import { getFaseComStitch } from "../flows/types.js";
import { getSpecialistPersona } from "../services/specialist.service.js";
import { ContentResolverService } from "../services/content-resolver.service.js";
import { SkillLoaderService } from "../services/skill-loader.service.js";
import { getRegisteredTools } from "../router.js";
import { formatSkillHydrationCommand, detectIDE } from "../utils/ide-paths.js";
import { getSkillParaFase } from "../utils/prompt-mapper.js";

// === TIPOS ===

interface PromptDefinition {
    name: string;
    description: string;
    arguments: Array<{ name: string; description: string; required: boolean }>;
}

interface PromptMessage {
    role: "user" | "assistant";
    content: { type: "text"; text: string };
}

interface PromptResult {
    [x: string]: unknown; // SDK ServerResult compatibility
    description: string;
    messages: PromptMessage[];
}

// === LISTAGEM ===

const PROMPT_DEFINITIONS: PromptDefinition[] = [
    {
        name: "maestro-specialist",
        description: "Persona + instruções do especialista da fase atual do projeto",
        arguments: [{ name: "diretorio", description: "Diretório do projeto", required: true }],
    },
    {
        name: "maestro-context",
        description: "Contexto completo do projeto para a sessão de trabalho",
        arguments: [{ name: "diretorio", description: "Diretório do projeto", required: true }],
    },
    {
        name: "maestro-template",
        description: "Template do entregável esperado para a fase atual",
        arguments: [{ name: "diretorio", description: "Diretório do projeto", required: true }],
    },
    {
        name: "maestro-sessao",
        description: "Contexto completo para sessão de trabalho (specialist + context + template + tools)",
        arguments: [{ name: "diretorio", description: "Diretório do projeto", required: true }],
    },
];

/**
 * Retorna lista de prompts disponíveis.
 */
export function listPrompts(): { prompts: PromptDefinition[] } {
    return { prompts: PROMPT_DEFINITIONS };
}

/**
 * Resolve um prompt pelo nome.
 */
export async function getPrompt(name: string, diretorio: string): Promise<PromptResult> {
    switch (name) {
        case "maestro-specialist":
            return buildSpecialistPrompt(diretorio);
        case "maestro-context":
            return buildContextPrompt(diretorio);
        case "maestro-template":
            return buildTemplatePrompt(diretorio);
        case "maestro-sessao":
            return buildSessionPrompt(diretorio);
        default:
            throw new Error(`Prompt não encontrado: ${name}`);
    }
}

// === v6.0: REGRAS ANTI-INFERÊNCIA (P1, P5, P9) ===

const ANTI_INFERENCE_RULES = `---

## ⛔ REGRAS OBRIGATÓRIAS — Anti-Inferência

1. **NUNCA invente dados** que o usuário não forneceu explicitamente
2. **NUNCA preencha campos** com valores fictícios, placeholder ou "exemplo"
3. **NUNCA assuma** preferências do usuário (IDE, modo, stack, etc.)
4. **SEMPRE pergunte** quando uma informação for necessária e não estiver disponível
5. Se o usuário pedir "preencha para teste" ou "invente dados", responda: "Preciso de informações reais para gerar um resultado útil. Quais são os dados reais?"
6. **NUNCA use** \`maestro({acao: "status"})\` para tentar avançar — use \`executar({acao: "avancar"})\`
7. Quando respostas forem vagas (< 20 palavras), faça perguntas de follow-up antes de prosseguir
8. **NUNCA assuma a persona da próxima fase** por conta própria. Seu limite de atuação é a aprovação do gate da fase ATUAL.
9. **NUNCA gere código ou artefatos de fases futuras**. (ex: se está em UX Design ou Produto, JAMAIS gere HTML/código).`;

const FLOW_RULES = `## 🔄 REGRAS DE FLUXO — Ferramentas Corretas

| Ação | Ferramenta Correta | ❌ NÃO use |
|------|-------------------|------------|
| Avançar fase | \`executar({acao: "avancar"})\` | \`maestro({acao: "status"})\` |
| Enviar respostas | \`executar({acao: "avancar", respostas: {...}})\` | \`maestro({respostas: {...}})\` |
| Enviar entregável | \`executar({acao: "avancar", entregavel: "..."})\` | \`maestro({entregavel: "..."})\` |
| Ver status | \`maestro({diretorio: "..."})\` | — |
| Validar gate | \`validar({diretorio: "..."})\` | — |

⚠️ **IMPORTANTE:** O parâmetro \`diretorio\` é SEMPRE obrigatório em todas as chamadas.`;

// === BUILDERS ===

function noProjectResult(msg?: string): PromptResult {
    return {
        description: "Nenhum projeto encontrado",
        messages: [{
            role: "user",
            content: { type: "text", text: msg || "Nenhum projeto ativo neste diretório. Use `maestro(diretorio)` para começar." },
        }],
    };
}

async function buildSpecialistPrompt(diretorio: string): Promise<PromptResult> {
    const stateService = createStateService(diretorio);
    const estado = await stateService.load();

    if (!estado) return noProjectResult();

    // v6.0: Detectar novo fluxo com specialistPhase
    const onboarding = (estado as any).onboarding;
    if (onboarding?.specialistPhase) {
        return buildSpecialistPhasePrompt(diretorio, estado, onboarding);
    }

    const faseInfo = getFaseComStitch(estado.nivel as any, estado.fase_atual, estado.usar_stitch);
    if (!faseInfo) {
        return {
            description: `Projeto: ${estado.nome}`,
            messages: [{
                role: "user",
                content: { type: "text", text: `Projeto ${estado.nome} — fase ${estado.fase_atual} não encontrada no fluxo.` },
            }],
        };
    }

    try {
        const skillName = getSkillParaFase(faseInfo.nome);
        if (skillName) {
            const ide = estado.ide || detectIDE(diretorio) || 'windsurf';
            const hydrationCommand = formatSkillHydrationCommand(skillName, ide);
            const specialist = getSpecialistPersona(faseInfo.nome);
            
            return {
                description: `Especialista: ${specialist?.name || faseInfo.nome} — Fase ${estado.fase_atual}/${estado.total_fases}`,
                messages: [{
                    role: "user",
                    content: {
                        type: "text",
                        text: `# Especialista da Fase: ${faseInfo.nome}\n\n${hydrationCommand}\n\n${ANTI_INFERENCE_RULES}`,
                    },
                }],
            };
        }
    } catch (error) {
        console.warn("[Prompt] Falha ao injetar comando de hydração:", error);
    }

    // Fallback: persona básica
    const specialist = getSpecialistPersona(faseInfo.nome);
    return {
        description: `Especialista: ${specialist?.name || faseInfo.nome}`,
        messages: [{
            role: "user",
            content: {
                type: "text",
                text: specialist
                    ? `# ${specialist.name}\n\n**Tom:** ${specialist.tone}\n**Expertise:** ${specialist.expertise.join(", ")}\n**Instruções:** ${specialist.instructions}\n\n${ANTI_INFERENCE_RULES}`
                    : `Fase ${estado.fase_atual}: ${faseInfo.nome}\n\n${ANTI_INFERENCE_RULES}`,
            },
        }],
    };
}

/**
 * v6.0: Prompt específico para o novo fluxo com specialistPhase
 * Injeta recursos reais + regras anti-inferência + instruções de fluxo
 */
async function buildSpecialistPhasePrompt(
    diretorio: string,
    estado: any,
    onboarding: any
): Promise<PromptResult> {
    const sp = onboarding.specialistPhase;
    const mode = (onboarding.mode || "balanced") as "economy" | "balanced" | "quality";

    let skillContent = "";
    let templateContent = "";
    let checklistContent = "";

    // Carregar recursos reais da skill
    try {
        const contentResolver = new ContentResolverService(diretorio);
        const skillLoader = new SkillLoaderService(contentResolver);
        const pkg = await skillLoader.loadFullPackage(sp.skillName);
        if (pkg) {
            skillContent = pkg.skillContent;
            templateContent = pkg.templateContent;
            checklistContent = pkg.checklistContent;
        }
    } catch (err) {
        console.warn("[Prompt] Falha ao carregar skill para specialistPhase:", err);
    }

    // Montar dados coletados até agora
    const collectedEntries = Object.entries(sp.collectedData || {});
    const collectedSummary = collectedEntries.length > 0
        ? collectedEntries.map(([k, v]) => `- **${k}**: ${v}`).join("\n")
        : "Nenhum dado coletado ainda.";

    const statusLabel: Record<string, string> = {
        active: "Aguardando início da coleta",
        collecting: "Coletando informações do produto",
        generating: "Gerando PRD",
        validating: "Validando PRD",
        approved: "PRD aprovado",
    };

    const promptText = `# 🧠 Especialista: Gestão de Produto

**Status:** ${statusLabel[sp.status] || sp.status}
**Interações:** ${sp.interactionCount}
**Modo:** ${mode.toUpperCase()}

---

## Persona

Você É o especialista de Gestão de Produto. Conduza a coleta de informações de forma conversacional focada em **PRODUTO** (não infraestrutura técnica).

${skillContent ? `## Instruções da Skill\n\n${skillContent}\n` : ""}
${templateContent ? `## Template do Entregável (PRD)\n\n${templateContent}\n` : ""}
${checklistContent ? `## Checklist de Validação\n\n${checklistContent}\n` : ""}

## Dados Coletados

${collectedSummary}

${ANTI_INFERENCE_RULES}

${FLOW_RULES}

---

⚠️ **LEMBRETE FINAL:**
- Para avançar: \`executar({diretorio: "${diretorio}", acao: "avancar", respostas: {...}})\`
- Para enviar PRD: \`executar({diretorio: "${diretorio}", acao: "avancar", entregavel: "..."})\`
- NUNCA use \`maestro({acao: "status"})\` para tentar avançar
- NUNCA invente dados — PERGUNTE ao usuário`;

    return {
        description: `Especialista: Gestão de Produto — ${statusLabel[sp.status] || sp.status}`,
        messages: [{
            role: "user",
            content: { type: "text", text: promptText },
        }],
    };
}

async function buildContextPrompt(diretorio: string): Promise<PromptResult> {
    const stateService = createStateService(diretorio);
    const estado = await stateService.load();

    if (!estado) return noProjectResult("Nenhum projeto ativo neste diretório.");

    const faseInfo = getFaseComStitch(estado.nivel as any, estado.fase_atual, estado.usar_stitch);

    const contextText = `# Contexto do Projeto: ${estado.nome}

## Estado
| Campo | Valor |
|-------|-------|
| **Nível** | ${estado.nivel.toUpperCase()} |
| **Fase Atual** | ${estado.fase_atual}/${estado.total_fases} — ${faseInfo?.nome || "N/A"} |
| **Gates Validados** | ${estado.gates_validados?.join(", ") || "nenhum"} |

## Entregáveis Salvos
${Object.entries(estado.entregaveis || {}).map(([k, v]) => `- **${k}:** ${v}`).join("\n") || "Nenhum ainda."}

## Próximo Passo
Trabalhe com o especialista **${faseInfo?.especialista || "N/A"}** para gerar: **${faseInfo?.entregavel_esperado || "N/A"}**
`;

    return {
        description: `Projeto: ${estado.nome} — Fase ${estado.fase_atual}/${estado.total_fases}`,
        messages: [{
            role: "user",
            content: { type: "text", text: contextText },
        }],
    };
}

async function buildTemplatePrompt(diretorio: string): Promise<PromptResult> {
    const stateService = createStateService(diretorio);
    const estado = await stateService.load();

    if (!estado) return noProjectResult("Nenhum projeto ativo neste diretório.");

    const faseInfo = getFaseComStitch(estado.nivel as any, estado.fase_atual, estado.usar_stitch);
    if (!faseInfo) {
        return {
            description: `Projeto: ${estado.nome}`,
            messages: [{
                role: "user",
                content: { type: "text", text: `Projeto ${estado.nome} — fase ${estado.fase_atual} não encontrada.` },
            }],
        };
    }

    const contentResolver = new ContentResolverService(diretorio);
    const skillLoader = new SkillLoaderService(contentResolver);

    try {
        const templateContent = await skillLoader.loadTemplate(faseInfo.nome);
        if (templateContent) {
            return {
                description: `Template: ${faseInfo.entregavel_esperado || faseInfo.nome}`,
                messages: [{
                    role: "user",
                    content: {
                        type: "text",
                        text: `# Template do Entregável: ${faseInfo.entregavel_esperado || faseInfo.nome}

## Fase ${estado.fase_atual}/${estado.total_fases}: ${faseInfo.nome}

Use este template como base para gerar o entregável:

---

${templateContent}

---

> 💡 Dica: Preencha todas as seções marcadas com [...] ou indicadores de conteúdo.`,
                    },
                }],
            };
        }
    } catch (error) {
        console.warn("[Prompt] Falha ao carregar template:", error);
    }

    // Fallback: estrutura básica
    return {
        description: `Template: ${faseInfo.entregavel_esperado || faseInfo.nome}`,
        messages: [{
            role: "user",
            content: {
                type: "text",
                text: `# Template do Entregável: ${faseInfo.entregavel_esperado || faseInfo.nome}

## Fase ${estado.fase_atual}/${estado.total_fases}: ${faseInfo.nome}

### Estrutura Esperada

${faseInfo.gate_checklist.map((item: string, i: number) => `${i + 1}. ${item}`).join("\n")}

---

> ℹ️ Template específico não disponível. Use a lista acima como guia.`,
            },
        }],
    };
}

async function buildSessionPrompt(diretorio: string): Promise<PromptResult> {
    const stateService = createStateService(diretorio);
    const estado = await stateService.load();

    if (!estado) {
        // v5.2: Lista tools consolidadas
        const tools = getRegisteredTools();
        const toolsList = tools.map(t => `- **${t.name}** — ${t.description.replace(/^[^\s]+ /, "")}`).join("\n");
        return {
            description: "Nenhum projeto encontrado",
            messages: [{
                role: "user",
                content: {
                    type: "text",
                    text: `# 🎯 Sessão Maestro

Nenhum projeto ativo em \`${diretorio}\`.

Use \`maestro(diretorio: "${diretorio}")\` para começar.

## Tools Disponíveis
${toolsList}`,
                },
            }],
        };
    }

    const faseInfo = getFaseComStitch(estado.nivel as any, estado.fase_atual, estado.usar_stitch);
    const specialist = faseInfo ? getSpecialistPersona(faseInfo.nome) : null;

    let sessionContent = `# 🎯 Sessão Maestro — ${estado.nome}\n\n`;

    // Specialist
    if (specialist) {
        sessionContent += `## 🤖 Especialista: ${specialist.name}\n\n`;
        sessionContent += `**Tom:** ${specialist.tone}\n`;
        sessionContent += `**Expertise:** ${specialist.expertise.join(", ")}\n`;
        sessionContent += `**Instruções:** ${specialist.instructions}\n\n`;
    }

    // Contexto do projeto
    sessionContent += `## 📋 Contexto\n\n`;
    sessionContent += `| Campo | Valor |\n|-------|-------|\n`;
    sessionContent += `| **Projeto** | ${estado.nome} |\n`;
    sessionContent += `| **Nível** | ${estado.nivel.toUpperCase()} |\n`;
    sessionContent += `| **Fase** | ${estado.fase_atual}/${estado.total_fases} — ${faseInfo?.nome || "N/A"} |\n`;
    sessionContent += `| **Gates Validados** | ${estado.gates_validados.length} |\n\n`;

    // Skill injection
    if (faseInfo) {
        try {
            const skillName = getSkillParaFase(faseInfo.nome);
            if (skillName) {
                const ide = estado.ide || detectIDE(diretorio) || 'windsurf';
                const hydrationCommand = formatSkillHydrationCommand(skillName, ide);
                sessionContent += `## 📚 Skill da Fase\n\n${hydrationCommand}\n\n`;
            }
        } catch {
            // Fallback silencioso
        }
    }

    // v5.2: Tools consolidadas dinâmicas
    const tools = getRegisteredTools();
    sessionContent += `## 🔧 Tools Disponíveis\n\n`;
    sessionContent += tools.map(t => `- **${t.name}** — ${t.description.replace(/^[^\s]+ /, "")}`).join("\n");

    // v6.0 (P1/P5/P9): Regras anti-inferência
    sessionContent += `\n\n${ANTI_INFERENCE_RULES}\n\n${FLOW_RULES}`;

    return {
        description: `Sessão: ${estado.nome} — Fase ${estado.fase_atual}`,
        messages: [{
            role: "user",
            content: { type: "text", text: sessionContent },
        }],
    };
}
