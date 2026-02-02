import { RiskEvaluator } from '../../core/risk/RiskEvaluator.js';
import { AutoFixEngine } from '../../core/autofix/AutoFixEngine.js';
import { CodebaseDiscovery } from '../../core/discovery/CodebaseDiscovery.js';

// ==================== EVALUATE RISK ====================
export interface EvaluateRiskParams {
    operation: string;
    context?: any;
    estado_json: string;
    diretorio: string;
}

export async function evaluateRisk(params: EvaluateRiskParams) {
    try {
        const evaluator = new RiskEvaluator(params.diretorio);
        const risk = await evaluator.evaluate(params.operation, params.context);

        const icon = risk.level === 'DANGEROUS' ? '🔴' :
                    risk.level === 'HIGH' ? '⚠️' :
                    risk.level === 'MEDIUM' ? '⚡' :
                    risk.level === 'LOW' ? 'ℹ️' : '✅';

        let text = `${icon} **Avaliação de Risco**\n\n`;
        text += `Operação: ${params.operation}\n`;
        text += `Nível: ${risk.level}\n`;
        text += `Score: ${risk.score}/100\n\n`;
        text += `**Fatores:**\n`;
        risk.factors.forEach(f => {
            text += `- ${f.description} (peso: ${f.weight})\n`;
        });

        return { content: [{ type: "text" as const, text }] };
    } catch (error) {
        return {
            content: [{ type: "text" as const, text: `❌ Erro: ${String(error)}` }],
            isError: true
        };
    }
}

export const evaluateRiskSchema = {
    type: "object" as const,
    properties: {
        operation: { type: "string", description: "Operação a avaliar" },
        context: { type: "object", description: "Contexto adicional" },
        estado_json: { type: "string" },
        diretorio: { type: "string" },
    },
    required: ["operation", "estado_json", "diretorio"],
};

// ==================== AUTO FIX ====================
export interface AutoFixParams {
    code: string;
    error: string;
    estado_json: string;
    diretorio: string;
}

export async function autoFix(params: AutoFixParams) {
    try {
        const engine = new AutoFixEngine();
        const result = await engine.fix(params.code, params.error);

        let text = result.success ? '✅ **Auto-Fix Aplicado**\n\n' : '❌ **Não foi possível corrigir**\n\n';
        if (result.changes.length > 0) {
            text += `**Mudanças:**\n${result.changes.map(c => `- ${c}`).join('\n')}\n`;
        }
        if (result.errors.length > 0) {
            text += `\n**Erros:**\n${result.errors.map(e => `- ${e}`).join('\n')}`;
        }

        return {
            content: [{ type: "text" as const, text }],
            files: result.success ? [{ path: 'fixed.txt', content: result.fixed }] : undefined
        };
    } catch (error) {
        return {
            content: [{ type: "text" as const, text: `❌ Erro: ${String(error)}` }],
            isError: true
        };
    }
}

export const autoFixSchema = {
    type: "object" as const,
    properties: {
        code: { type: "string", description: "Código com erro" },
        error: { type: "string", description: "Mensagem de erro" },
        estado_json: { type: "string" },
        diretorio: { type: "string" },
    },
    required: ["code", "error", "estado_json", "diretorio"],
};

// ==================== DISCOVER CODEBASE ====================
export interface DiscoverCodebaseParams {
    estado_json: string;
    diretorio: string;
}

export async function discoverCodebase(params: DiscoverCodebaseParams) {
    try {
        const discovery = new CodebaseDiscovery(params.diretorio);
        const analysis = await discovery.analyze();

        let text = `🔍 **Análise do Codebase**\n\n`;
        text += `**Arquitetura:** ${analysis.architecture}\n`;
        text += `**Stack:** ${analysis.stack.join(', ') || 'Não detectado'}\n`;
        text += `**Módulos:** ${analysis.modules.join(', ')}\n`;
        text += `**Arquivos:** ${analysis.fileCount}\n`;
        text += `**Dependências:** ${Object.keys(analysis.dependencies).length}\n`;

        return { content: [{ type: "text" as const, text }] };
    } catch (error) {
        return {
            content: [{ type: "text" as const, text: `❌ Erro: ${String(error)}` }],
            isError: true
        };
    }
}

export const discoverCodebaseSchema = {
    type: "object" as const,
    properties: {
        estado_json: { type: "string" },
        diretorio: { type: "string" },
    },
    required: ["estado_json", "diretorio"],
};
