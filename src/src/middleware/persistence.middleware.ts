/**
 * Middleware: withPersistence
 * 
 * Após execução da tool, salva estado e arquivos automaticamente
 * no filesystem via StateService.
 * 
 * A IA não precisa mais salvar files[] manualmente — o MCP persiste diretamente.
 * Fallback: continua retornando files[] se a persistência falhar.
 */

import { createStateService } from "../services/state.service.js";
import { parsearEstado } from "../state/storage.js";
import type { ToolResult } from "../types/index.js";

type ToolHandler = (args: Record<string, unknown>) => Promise<ToolResult>;

export function withPersistence(handler: ToolHandler): ToolHandler {
    return async (args: Record<string, unknown>) => {
        const result = await handler(args);

        // Se não tem diretório ou deu erro, não persistir
        const diretorio = args.diretorio as string | undefined;
        if (!diretorio || result.isError) {
            return result;
        }

        const stateService = createStateService(diretorio);

        // 1. Persistir estado atualizado
        if (result.estado_atualizado) {
            try {
                const estado = parsearEstado(result.estado_atualizado);
                if (estado) {
                    const saved = await stateService.save(estado);
                    if (saved) {
                        // Marcar que estado foi salvo automaticamente
                        (result as any)._state_persisted = true;
                    }
                }
            } catch (error) {
                console.warn("[withPersistence] Falha ao salvar estado:", error);
            }
        }

        // 2. Persistir arquivos retornados
        if (result.files && result.files.length > 0) {
            try {
                const savedCount = await stateService.saveFiles(
                    result.files.map(f => ({
                        path: f.path,
                        content: f.content,
                    }))
                );
                if (savedCount > 0) {
                    (result as any)._files_persisted = savedCount;
                }
            } catch (error) {
                console.warn("[withPersistence] Falha ao salvar arquivos:", error);
            }
        }

        return result;
    };
}
