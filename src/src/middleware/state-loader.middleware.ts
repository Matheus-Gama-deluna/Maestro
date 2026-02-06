/**
 * Middleware: withStateLoad
 * 
 * Intercepta chamada de tool e auto-carrega estado do filesystem
 * quando estado_json não é fornecido mas diretorio está disponível.
 * 
 * Torna estado_json OPCIONAL para todas as tools.
 */

import { createStateService } from "../services/state.service.js";
import { serializarEstado } from "../state/storage.js";
import type { ToolResult } from "../types/index.js";

type ToolHandler = (args: Record<string, unknown>) => Promise<ToolResult>;

export function withStateLoad(handler: ToolHandler): ToolHandler {
    return async (args: Record<string, unknown>) => {
        // Se já tem estado_json, não interferir
        if (args.estado_json) {
            return handler(args);
        }

        // Se tem diretório, tentar carregar estado automaticamente
        const diretorio = args.diretorio as string | undefined;
        if (diretorio) {
            try {
                const stateService = createStateService(diretorio);
                const estado = await stateService.load();
                if (estado) {
                    const serialized = serializarEstado(estado);
                    args.estado_json = serialized.content;
                }
            } catch (error) {
                // Falha silenciosa — a tool decidirá o que fazer sem estado
                console.warn("[withStateLoad] Falha ao carregar estado:", error);
            }
        }

        return handler(args);
    };
}
