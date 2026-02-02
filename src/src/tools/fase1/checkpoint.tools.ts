import { CheckpointManager } from '../../core/checkpoint/CheckpointManager.js';
import { RollbackEngine } from '../../core/checkpoint/RollbackEngine.js';

// ==================== CREATE CHECKPOINT ====================

export interface CreateCheckpointParams {
    reason: string;
    auto?: boolean;
    estado_json: string;
    diretorio: string;
}

export async function createCheckpoint(params: CreateCheckpointParams) {
    try {
        const estado = JSON.parse(params.estado_json);
        const cpManager = new CheckpointManager(params.diretorio);

        const id = await cpManager.create(
            params.reason,
            params.auto || false,
            estado
        );

        const checkpoint = await cpManager.get(id);

        return {
            content: [{
                type: "text" as const,
                text: `✅ **Checkpoint Criado: ${id}**\n\nMotivo: ${params.reason}\nFase: ${estado.fase_atual}\nArquivos: ${checkpoint?.metadata.filesCount || 0}\nTamanho: ${Math.round((checkpoint?.metadata.totalSize || 0) / 1024)} KB\n\nO checkpoint foi salvo em \`.maestro/checkpoints/${id}.json\``
            }]
        };
    } catch (error) {
        return {
            content: [{
                type: "text" as const,
                text: `❌ Erro ao criar checkpoint: ${String(error)}`
            }],
            isError: true
        };
    }
}

export const createCheckpointSchema = {
    type: "object" as const,
    properties: {
        reason: { type: "string", description: "Motivo do checkpoint" },
        auto: { type: "boolean", description: "Checkpoint automático (padrão: false)" },
        estado_json: { type: "string" },
        diretorio: { type: "string" },
    },
    required: ["reason", "estado_json", "diretorio"],
};

// ==================== ROLLBACK TOTAL ====================

export interface RollbackTotalParams {
    checkpointId: string;
    estado_json: string;
    diretorio: string;
}

export async function rollbackTotal(params: RollbackTotalParams) {
    try {
        const rollbackEngine = new RollbackEngine(params.diretorio);
        const result = await rollbackEngine.rollbackTotal(params.checkpointId);

        if (!result.success) {
            return {
                content: [{
                    type: "text" as const,
                    text: `❌ **Rollback Falhou**\n\nErros:\n${result.errors.map(e => `- ${e}`).join('\n')}`
                }],
                isError: true
            };
        }

        // Retornar novo estado
        return {
            content: [{
                type: "text" as const,
                text: `✅ **Rollback Total Concluído**\n\nCheckpoint: ${params.checkpointId}\nArquivos restaurados: ${result.filesRestored}\nFase restaurada: ${result.checkpoint.fase}`
            }],
            files: [
                {
                    path: '.maestro/estado.json',
                    content: JSON.stringify(result.checkpoint.snapshot.estado, null, 2)
                }
            ]
        };
    } catch (error) {
        return {
            content: [{
                type: "text" as const,
                text: `❌ Erro no rollback: ${String(error)}`
            }],
            isError: true
        };
    }
}

export const rollbackTotalSchema = {
    type: "object" as const,
    properties: {
        checkpointId: { type: "string", description: "ID do checkpoint" },
        estado_json: { type: "string" },
        diretorio: { type: "string" },
    },
    required: ["checkpointId", "estado_json", "diretorio"],
};

// ==================== ROLLBACK PARTIAL ====================

export interface RollbackPartialParams {
    checkpointId: string;
    modules: string[];
    estado_json: string;
    diretorio: string;
}

export async function rollbackPartial(params: RollbackPartialParams) {
    try {
        const rollbackEngine = new RollbackEngine(params.diretorio);
        const result = await rollbackEngine.rollbackPartial(
            params.checkpointId,
            params.modules
        );

        if (!result.success) {
            return {
                content: [{
                    type: "text" as const,
                    text: `❌ **Rollback Parcial Falhou**\n\nErros:\n${result.errors.map(e => `- ${e}`).join('\n')}`
                }],
                isError: true
            };
        }

        return {
            content: [{
                type: "text" as const,
                text: `✅ **Rollback Parcial Concluído**\n\nCheckpoint: ${params.checkpointId}\nMódulos: ${params.modules.join(', ')}\nArquivos restaurados: ${result.filesRestored}`
            }]
        };
    } catch (error) {
        return {
            content: [{
                type: "text" as const,
                text: `❌ Erro no rollback parcial: ${String(error)}`
            }],
            isError: true
        };
    }
}

export const rollbackPartialSchema = {
    type: "object" as const,
    properties: {
        checkpointId: { type: "string", description: "ID do checkpoint" },
        modules: { 
            type: "array", 
            items: { type: "string" },
            description: "Módulos para restaurar" 
        },
        estado_json: { type: "string" },
        diretorio: { type: "string" },
    },
    required: ["checkpointId", "modules", "estado_json", "diretorio"],
};

// ==================== LIST CHECKPOINTS ====================

export interface ListCheckpointsParams {
    estado_json: string;
    diretorio: string;
}

export async function listCheckpoints(params: ListCheckpointsParams) {
    try {
        const cpManager = new CheckpointManager(params.diretorio);
        const checkpoints = await cpManager.list();

        let text = `📋 **Checkpoints Disponíveis**\n\n`;
        text += `Total: ${checkpoints.length}\n\n`;

        checkpoints.slice(0, 10).forEach(cp => {
            const date = new Date(cp.timestamp).toLocaleString('pt-BR');
            text += `**${cp.id}**\n`;
            text += `Data: ${date}\n`;
            text += `Motivo: ${cp.reason}\n`;
            text += `Fase: ${cp.fase} | Arquivos: ${cp.metadata.filesCount}\n`;
            text += `Auto: ${cp.auto ? 'Sim' : 'Não'}\n\n`;
        });

        return {
            content: [{
                type: "text" as const,
                text
            }]
        };
    } catch (error) {
        return {
            content: [{
                type: "text" as const,
                text: `❌ Erro ao listar checkpoints: ${String(error)}`
            }],
            isError: true
        };
    }
}

export const listCheckpointsSchema = {
    type: "object" as const,
    properties: {
        estado_json: { type: "string" },
        diretorio: { type: "string" },
    },
    required: ["estado_json", "diretorio"],
};
