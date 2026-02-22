/**
 * Middleware: withSkillInjection
 * 
 * Após execução da tool, se o resultado indica transição de fase,
 * injeta automaticamente o conteúdo da skill da próxima fase.
 * 
 * Este middleware é complementar ao código de injeção já existente
 * em proximo.ts — serve como safety net para tools que não fazem
 * injeção diretamente.
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
        if (responseText.includes("🧠 Contexto do Especialista")) {
            return result;
        }

        // Se tem next_action apontando para uma fase que precisa de skill,
        // e a resposta não tem contexto injetado, adicionar
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

                // v7.0: Substituído injeção ativa por menção dinâmica da IDE
                const ide = estado.ide || detectIDE(diretorio) || 'windsurf';
                const hydrationCommand = formatSkillHydrationCommand(skillName, ide);

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
