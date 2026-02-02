import { join } from "path";
import { existsSync, readFileSync, writeFileSync } from "fs";
import type { ToolResult, EstadoProjeto } from "../types/index.js";
import { parsearEstado, serializarEstado } from "../state/storage.js";
import type { OperationMode, ProjectConfig } from "../types/config.js";
import { MODE_CONFIGS, getDefaultConfig, getModeDescription } from "../types/config.js";
import { logEvent, EventTypes } from "../utils/history.js";

interface ConfigurarModoArgs {
    mode: OperationMode;
    estado_json: string;
    diretorio: string;
}

export async function configurarModo(args: ConfigurarModoArgs): Promise<ToolResult> {
    if (!args.estado_json) {
        return {
            content: [{
                type: "text",
                text: "❌ **Erro**: Parâmetro `estado_json` é obrigatório.",
            }],
            isError: true,
        };
    }

    if (!args.diretorio) {
        return {
            content: [{
                type: "text",
                text: "❌ **Erro**: Parâmetro `diretorio` é obrigatório.",
            }],
            isError: true,
        };
    }

    const estado = parsearEstado(args.estado_json);
    if (!estado) {
        return {
            content: [{
                type: "text",
                text: "❌ **Erro**: Não foi possível parsear o estado JSON.",
            }],
            isError: true,
        };
    }

    const modeConfig = MODE_CONFIGS[args.mode];
    if (!modeConfig) {
        return {
            content: [{
                type: "text",
                text: `❌ **Erro**: Modo inválido. Use: economy, balanced ou quality.`,
            }],
            isError: true,
        };
    }

    const previousMode = estado.config?.mode || 'balanced';
    
    estado.config = {
        mode: args.mode,
        flow: estado.config?.flow || 'principal',
        optimization: modeConfig.optimization,
        frontend_first: estado.config?.frontend_first ?? true,
        auto_checkpoint: modeConfig.checkpoint_frequency !== 'never',
        auto_fix: modeConfig.auto_fix_enabled,
    };

    const estadoAtualizado = serializarEstado(estado);

    await logEvent(args.diretorio, EventTypes.CONFIG_CHANGED, {
        previous_mode: previousMode,
        new_mode: args.mode,
        optimization: modeConfig.optimization,
    });

    const modeInfo = getModeDescription(args.mode);
    const savings = calculateSavings(args.mode);

    return {
        content: [{
            type: "text",
            text: `# ✅ Modo de Operação Configurado

**Modo Anterior:** ${previousMode}  
**Modo Atual:** ${args.mode}

${modeInfo}

## 📊 Impacto Esperado

- **Prompts por Fase:** ${modeConfig.prompts_per_phase.min}-${modeConfig.prompts_per_phase.max} (alvo: ${modeConfig.prompts_per_phase.target})
- **Economia de Prompts:** ~${savings.percentage}%
- **Quality Threshold:** ${modeConfig.quality_threshold}%
- **Auto-fix:** ${modeConfig.auto_fix_enabled ? '✅ Ativado' : '❌ Desativado'}
- **Checkpoints:** ${modeConfig.checkpoint_frequency}

## 🔧 Otimizações Ativas

${Object.entries(modeConfig.optimization)
    .map(([key, value]) => `- **${formatOptimizationName(key)}:** ${value ? '✅' : '❌'}`)
    .join('\n')}

---

**Próximos Passos:**
1. Continue o desenvolvimento normalmente
2. O sistema aplicará as otimizações automaticamente
3. Use \`status()\` para ver estatísticas de economia

**Arquivo para salvar:**
\`\`\`json:.maestro/estado.json
${estadoAtualizado}
\`\`\`
`,
        }],
        isError: false,
    };
}

function calculateSavings(mode: OperationMode): { percentage: number; prompts_saved: number } {
    const baseline = 140;
    
    switch (mode) {
        case 'economy':
            return { percentage: 70, prompts_saved: 98 };
        case 'balanced':
            return { percentage: 45, prompts_saved: 63 };
        case 'quality':
            return { percentage: 0, prompts_saved: 0 };
    }
}

function formatOptimizationName(key: string): string {
    return key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
