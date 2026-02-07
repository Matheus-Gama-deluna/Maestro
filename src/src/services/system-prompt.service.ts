/**
 * System Prompt Dinâmico para o Maestro MCP.
 * 
 * Gera system prompt adaptado ao client, capabilities e contexto do projeto.
 * Substitui o system prompt estático do resources/index.ts.
 * 
 * @since v5.1.0 — Task 2.5 do Roadmap de Melhorias MCP
 */

import { MAESTRO_VERSION } from "../constants.js";
import { getClientCapabilities, getClientType } from "./client-capabilities.service.js";
import { getRegisteredTools } from "../router.js";

/**
 * Gera system prompt dinâmico baseado no contexto.
 */
export function buildSystemPrompt(opts?: {
    projectName?: string;
    currentPhase?: string;
    specialistName?: string;
}): string {
    const caps = getClientCapabilities();
    const clientType = getClientType();
    const tools = getRegisteredTools();

    let prompt = `# Maestro v${MAESTRO_VERSION} — Orquestrador de Desenvolvimento

Você é uma IA assistente integrada ao **Maestro MCP**, um orquestrador de desenvolvimento de software.

## Regras Obrigatórias

1. **Sempre use as tools do Maestro** para interagir com o projeto
2. **Nunca invente dados** — use \`maestro()\` para detectar contexto
3. **Siga o fluxo de fases** — não pule etapas
4. **Salve arquivos** quando a tool retornar instruções de salvamento
5. **Respeite o especialista** da fase atual

## Tools Disponíveis (${tools.length})

`;

    for (const tool of tools) {
        prompt += `- **${tool.name}** — ${tool.description}\n`;
    }

    prompt += `\n## Fluxo Recomendado\n\n`;
    prompt += `1. \`maestro(diretorio)\` — Detectar contexto\n`;
    prompt += `2. Seguir instrução do próximo passo\n`;
    prompt += `3. \`avancar(diretorio, entregavel)\` — Avançar fase\n`;
    prompt += `4. \`validar(diretorio)\` — Validar gate\n`;
    prompt += `5. Repetir até conclusão\n`;

    // Adaptar ao client
    if (clientType === "windsurf") {
        prompt += `\n## Notas para Windsurf/Cascade\n\n`;
        prompt += `- Use \`write_to_file\` para salvar arquivos retornados pelas tools\n`;
        prompt += `- Resources estão disponíveis via \`@mcp:maestro:\`\n`;
        prompt += `- Prompts disponíveis via seletor de prompts\n`;
    } else if (clientType === "cursor") {
        prompt += `\n## Notas para Cursor\n\n`;
        prompt += `- Tools MCP acessíveis diretamente\n`;
        prompt += `- Use Composer para executar tools em sequência\n`;
    }

    // Contexto do projeto (se fornecido)
    if (opts?.projectName) {
        prompt += `\n## Projeto Atual: ${opts.projectName}\n\n`;
        if (opts.currentPhase) prompt += `**Fase:** ${opts.currentPhase}\n`;
        if (opts.specialistName) prompt += `**Especialista:** ${opts.specialistName}\n`;
    }

    // Capabilities awareness
    if (!caps.hasElicitation) {
        prompt += `\n> ℹ️ Client sem suporte a elicitation — perguntas serão feitas via texto.\n`;
    }
    if (!caps.hasSampling) {
        prompt += `> ℹ️ Client sem suporte a sampling — análises serão feitas inline.\n`;
    }

    return prompt;
}
