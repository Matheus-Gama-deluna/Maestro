import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Authority Manager (Fase 2 - Melhoria #16)
 * Gerencia níveis de autoridade e preferências do usuário
 */
export class AuthorityManager {
    private config: AuthorityConfig;

    constructor() {
        this.config = {
            autoExecuteThreshold: 0.8,
            requireApprovalFor: ['delete', 'deploy', 'database'],
            trustLevel: 'medium'
        };
    }

    async loadPreferences(): Promise<void> {
        try {
            const configPath = path.join(process.cwd(), '.maestro', 'authority', 'preferences.json');
            const content = await fs.readFile(configPath, 'utf-8');
            this.config = JSON.parse(content);
            console.log('[AuthorityManager] Preferências carregadas');
        } catch {
            console.log('[AuthorityManager] Usando configuração padrão');
        }
    }

    async savePreferences(): Promise<void> {
        try {
            const configDir = path.join(process.cwd(), '.maestro', 'authority');
            await fs.mkdir(configDir, { recursive: true });
            
            const configPath = path.join(configDir, 'preferences.json');
            await fs.writeFile(configPath, JSON.stringify(this.config, null, 2));
            console.log('[AuthorityManager] Preferências salvas');
        } catch (error) {
            console.error('[AuthorityManager] Erro ao salvar preferências:', error);
        }
    }

    canAutoExecute(operation: string, confidence: number): boolean {
        // Verificar se operação requer aprovação
        if (this.config.requireApprovalFor.some(op => operation.includes(op))) {
            return false;
        }

        // Verificar threshold de confiança
        return confidence >= this.config.autoExecuteThreshold;
    }

    updateTrustLevel(level: 'low' | 'medium' | 'high'): void {
        this.config.trustLevel = level;
        
        // Ajustar thresholds baseado no nível de confiança
        switch (level) {
            case 'low':
                this.config.autoExecuteThreshold = 0.95;
                break;
            case 'medium':
                this.config.autoExecuteThreshold = 0.8;
                break;
            case 'high':
                this.config.autoExecuteThreshold = 0.6;
                break;
        }
    }

    getConfig(): AuthorityConfig {
        return { ...this.config };
    }
}

export interface AuthorityConfig {
    autoExecuteThreshold: number;
    requireApprovalFor: string[];
    trustLevel: 'low' | 'medium' | 'high';
}
