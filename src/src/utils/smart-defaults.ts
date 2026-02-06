/**
 * Smart Defaults — Pré-preenche campos do discovery com dados do config global
 * 
 * Reduz fricção do onboarding ao usar preferências já conhecidas do usuário.
 * Fonte: ~/.maestro/config.json (salvo por setup_inicial)
 */

import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { join } from "path";
import { homedir } from "os";

/**
 * Configuração global do Maestro (salva por setup_inicial)
 */
export interface MaestroGlobalConfig {
    ide?: 'windsurf' | 'cursor' | 'antigravity';
    mode?: 'economy' | 'balanced' | 'quality';
    team_size?: 'solo' | 'small' | 'medium' | 'large';
    preferencias_stack?: {
        frontend?: string;
        backend?: string;
        database?: string;
        infra?: string;
    };
    preferencias_gerais?: {
        linguagem?: string;
        framework_preferido?: string;
        testes_automaticos?: boolean;
        ci_cd?: boolean;
    };
    historico_projetos?: number;
    setup_completed_at?: string;
}

/**
 * Defaults inferidos a partir do config global
 */
export interface SmartDefaults {
    ide: 'windsurf' | 'cursor' | 'antigravity';
    mode: 'economy' | 'balanced' | 'quality';
    stack_sugerida: {
        frontend?: string;
        backend?: string;
        database?: string;
    };
    perguntas_pular: string[];
    valores_default: Record<string, string>;
    confianca: number;
}

/**
 * Carrega config global do Maestro
 */
export async function loadGlobalConfig(): Promise<MaestroGlobalConfig | null> {
    try {
        const configPath = join(homedir(), ".maestro", "config.json");
        if (!existsSync(configPath)) return null;
        const raw = await readFile(configPath, "utf-8");
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

/**
 * Gera smart defaults baseados no config global
 */
export async function getSmartDefaults(): Promise<SmartDefaults> {
    const config = await loadGlobalConfig();

    const defaults: SmartDefaults = {
        ide: config?.ide || 'windsurf',
        mode: config?.mode || 'balanced',
        stack_sugerida: {},
        perguntas_pular: [],
        valores_default: {},
        confianca: 0,
    };

    if (!config) return defaults;

    // Pré-preencher stack se já definida
    if (config.preferencias_stack) {
        defaults.stack_sugerida = {
            frontend: config.preferencias_stack.frontend,
            backend: config.preferencias_stack.backend,
            database: config.preferencias_stack.database,
        };
        defaults.confianca += 30;

        // Se temos stack, podemos pular perguntas técnicas básicas
        if (config.preferencias_stack.frontend) {
            defaults.valores_default["framework_frontend"] = config.preferencias_stack.frontend;
            defaults.perguntas_pular.push("qual_framework_frontend");
        }
        if (config.preferencias_stack.backend) {
            defaults.valores_default["framework_backend"] = config.preferencias_stack.backend;
            defaults.perguntas_pular.push("qual_framework_backend");
        }
        if (config.preferencias_stack.database) {
            defaults.valores_default["banco_dados"] = config.preferencias_stack.database;
            defaults.perguntas_pular.push("qual_banco_dados");
        }
    }

    // Team size influencia complexidade esperada
    if (config.team_size) {
        defaults.valores_default["team_size"] = config.team_size;
        defaults.perguntas_pular.push("tamanho_equipe");
        defaults.confianca += 10;
    }

    // Preferências gerais
    if (config.preferencias_gerais) {
        if (config.preferencias_gerais.linguagem) {
            defaults.valores_default["linguagem_principal"] = config.preferencias_gerais.linguagem;
            defaults.confianca += 10;
        }
        if (config.preferencias_gerais.testes_automaticos !== undefined) {
            defaults.valores_default["usa_testes"] = config.preferencias_gerais.testes_automaticos ? "sim" : "nao";
            defaults.confianca += 5;
        }
    }

    // Histórico de projetos aumenta confiança
    if (config.historico_projetos && config.historico_projetos > 3) {
        defaults.confianca += 15;
    }

    // Cap confiança em 80 (nunca 100% — sempre confirmar com usuário)
    defaults.confianca = Math.min(defaults.confianca, 80);

    return defaults;
}

/**
 * Formata smart defaults como texto para o discovery
 */
export function formatSmartDefaultsSummary(defaults: SmartDefaults): string {
    const lines: string[] = [];

    if (Object.keys(defaults.stack_sugerida).length > 0) {
        lines.push("### Stack Pré-configurada");
        if (defaults.stack_sugerida.frontend) lines.push(`- **Frontend:** ${defaults.stack_sugerida.frontend}`);
        if (defaults.stack_sugerida.backend) lines.push(`- **Backend:** ${defaults.stack_sugerida.backend}`);
        if (defaults.stack_sugerida.database) lines.push(`- **Database:** ${defaults.stack_sugerida.database}`);
    }

    if (Object.keys(defaults.valores_default).length > 0) {
        lines.push("\n### Valores Padrão Aplicados");
        for (const [key, value] of Object.entries(defaults.valores_default)) {
            lines.push(`- **${key}:** ${value}`);
        }
    }

    if (defaults.perguntas_pular.length > 0) {
        lines.push(`\n> 💡 ${defaults.perguntas_pular.length} perguntas puladas com base nas suas preferências (confiança: ${defaults.confianca}%)`);
    }

    return lines.join("\n");
}
