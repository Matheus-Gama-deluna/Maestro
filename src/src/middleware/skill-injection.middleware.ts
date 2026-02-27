/**
 * Middleware: withSkillInjection
 *
 * v7.2: Revertido para abordagem de menções de arquivo (economia de tokens).
 * Gera menções nativas da IDE (#path no Windsurf, @path no Cursor) para forçar
 * a IA a LER os arquivos em vez de injetar conteúdo inline na resposta.
 *
 * Safety net: só injeta se proximo.ts não tiver injetado antes.
 *
 * @since v7.0 — Menção dinâmica da IDE (apenas SKILL.md)
 * @since v7.1 — Injeção de conteúdo real (REVERTIDO — gasto de tokens)
 * @since v7.2 — Menções expandidas: SKILL.md + templates + checklists + gate
 */

import { parsearEstado } from "../state/storage.js";
import { getSkillParaFase } from "../utils/prompt-mapper.js";
import { getFaseComStitch } from "../flows/types.js";
import { formatSkillHydrationCommand, detectIDE } from "../utils/ide-paths.js";
import type { ToolResult } from "../types/index.js";

type ToolHandler = (args: Record<string, unknown>) => Promise<ToolResult>;

export function withSkillInjection(handler: ToolHandler): ToolHandler {
    return async (args: Record<string, unknown>) => {
        const result = await handler(args);

        // Se deu erro ou não tem diretório, não injetar
        const diretorio = args.diretorio as string | undefined;
        if (result.isError || !diretorio) {
            return result;
        }

        // Se a resposta já contém contexto de especialista (proximo.ts já injetou), pular
        const responseText = result.content?.[0]?.text || "";
        if (responseText.includes("🧠 Contexto do Especialista") || responseText.includes("Próximo Especialista")) {
            return result;
        }

        // Se tem next_action apontando para uma fase que precisa de skill,
        // e a resposta não tem contexto injetado, adicionar menções
        if (result.next_action && result.estado_atualizado) {
            try {
                const estado = parsearEstado(result.estado_atualizado);
                if (!estado) return result;

                const faseInfo = getFaseComStitch(
                    estado.nivel as any,
                    estado.fase_atual,
                    estado.usar_stitch
                );
                if (!faseInfo) return result;

                const skillName = getSkillParaFase(faseInfo.nome);
                if (!skillName) return result;

                // Verificar se a próxima ação é gerar entregável (não injetar em status, etc.)
                const actionsThatNeedSkill = ["proximo", "avancar", "validar_gate", "validar"];
                if (!actionsThatNeedSkill.includes(result.next_action.tool)) {
                    return result;
                }

                // v7.2: Gerar menções de arquivo com projectDir correto
                const ide = estado.ide || detectIDE(diretorio) || 'windsurf';
                const hydrationCommand = formatSkillHydrationCommand(skillName, ide, diretorio);

                if (result.content?.[0]) {
                    result.content[0].text += `\n\n---\n\n## 🧠 Contexto do Especialista (${faseInfo.nome})\n\n${hydrationCommand}`;
                }
            } catch (error) {
                console.warn("[withSkillInjection] Falha ao injetar skill:", error);
            }
        }

        return result;
    };
}
