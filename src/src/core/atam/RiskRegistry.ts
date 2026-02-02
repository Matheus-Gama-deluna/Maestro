import type { Risk, Mitigation } from './types.js';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Registro de Riscos e Mitigações (Fase 3 - Melhoria #23)
 */
export class RiskRegistry {
    private risks: Map<string, Risk>;
    private mitigations: Map<string, Mitigation[]>;

    constructor() {
        this.risks = new Map();
        this.mitigations = new Map();
    }

    registerRisk(risk: Risk): void {
        this.risks.set(risk.id, risk);
        console.log('[RiskRegistry] Risco registrado:', risk.id);
    }

    registerMitigation(mitigation: Mitigation): void {
        if (!this.mitigations.has(mitigation.riskId)) {
            this.mitigations.set(mitigation.riskId, []);
        }
        this.mitigations.get(mitigation.riskId)!.push(mitigation);
        console.log('[RiskRegistry] Mitigação registrada:', mitigation.id);
    }

    getRisk(riskId: string): Risk | undefined {
        return this.risks.get(riskId);
    }

    getMitigations(riskId: string): Mitigation[] {
        return this.mitigations.get(riskId) || [];
    }

    getAllRisks(): Risk[] {
        return Array.from(this.risks.values());
    }

    getCriticalRisks(): Risk[] {
        return this.getAllRisks().filter(r => 
            r.probability === 'high' && r.impact === 'high'
        );
    }

    getHighRisks(): Risk[] {
        return this.getAllRisks().filter(r => 
            r.probability === 'high' || r.impact === 'high'
        );
    }

    getRiskScore(risk: Risk): number {
        const probScore = { high: 3, medium: 2, low: 1 };
        const impScore = { high: 3, medium: 2, low: 1 };
        return probScore[risk.probability] * impScore[risk.impact];
    }

    getRisksByCategory(category: string): Risk[] {
        return this.getAllRisks().filter(r => r.category === category);
    }

    async save(): Promise<void> {
        try {
            const registryDir = path.join(process.cwd(), '.maestro', 'atam', 'risks');
            await fs.mkdir(registryDir, { recursive: true });

            const data = {
                risks: Array.from(this.risks.values()),
                mitigations: Object.fromEntries(this.mitigations)
            };

            const filepath = path.join(registryDir, 'registry.json');
            await fs.writeFile(filepath, JSON.stringify(data, null, 2));
            console.log('[RiskRegistry] Registro salvo:', filepath);
        } catch (error) {
            console.error('[RiskRegistry] Erro ao salvar:', error);
        }
    }

    async load(): Promise<void> {
        try {
            const filepath = path.join(process.cwd(), '.maestro', 'atam', 'risks', 'registry.json');
            const content = await fs.readFile(filepath, 'utf-8');
            const data = JSON.parse(content);

            this.risks.clear();
            this.mitigations.clear();

            for (const risk of data.risks) {
                this.risks.set(risk.id, risk);
            }

            for (const [riskId, mits] of Object.entries(data.mitigations)) {
                this.mitigations.set(riskId, mits as Mitigation[]);
            }

            console.log('[RiskRegistry] Registro carregado');
        } catch {
            console.log('[RiskRegistry] Nenhum registro anterior encontrado');
        }
    }
}
