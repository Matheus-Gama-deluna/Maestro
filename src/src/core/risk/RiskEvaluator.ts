import { promises as fs } from 'fs';
import path from 'path';
import { RiskLevel, RiskFactor, RiskDecision } from './types.js';

export class RiskEvaluator {
    private baseDir: string;

    constructor(private projectDir: string) {
        this.baseDir = path.join(projectDir, '.maestro', 'risk');
    }

    async evaluate(operation: string, context?: any): Promise<RiskLevel> {
        const factors: RiskFactor[] = [];
        let totalScore = 0;

        // Avaliar fatores de risco
        const operationRisk = this.evaluateOperation(operation);
        factors.push(operationRisk);
        totalScore += operationRisk.weight;

        if (context?.filesAffected) {
            const filesRisk = this.evaluateFilesAffected(context.filesAffected);
            factors.push(filesRisk);
            totalScore += filesRisk.weight;
        }

        if (context?.hasTests === false) {
            factors.push({
                name: 'no_tests',
                weight: 20,
                description: 'Operação sem testes'
            });
            totalScore += 20;
        }

        // Determinar nível
        let level: RiskLevel['level'];
        if (totalScore >= 80) level = 'DANGEROUS';
        else if (totalScore >= 60) level = 'HIGH';
        else if (totalScore >= 40) level = 'MEDIUM';
        else if (totalScore >= 20) level = 'LOW';
        else level = 'SAFE';

        return { level, score: totalScore, factors };
    }

    async recordDecision(operation: string, riskLevel: RiskLevel, approved: boolean, justification?: string): Promise<string> {
        const id = `RISK-${Date.now()}`;
        const decision: RiskDecision = {
            id,
            timestamp: new Date().toISOString(),
            operation,
            riskLevel,
            approved,
            justification
        };

        await fs.mkdir(this.baseDir, { recursive: true });
        await fs.writeFile(
            path.join(this.baseDir, `${id}.json`),
            JSON.stringify(decision, null, 2)
        );

        return id;
    }

    private evaluateOperation(operation: string): RiskFactor {
        const dangerousOps = ['delete', 'drop', 'truncate', 'modify-architecture', 'change-database'];
        const highRiskOps = ['refactor', 'migrate', 'update-dependencies'];
        const mediumRiskOps = ['add-feature', 'modify-logic'];

        if (dangerousOps.some(op => operation.toLowerCase().includes(op))) {
            return { name: 'dangerous_operation', weight: 50, description: 'Operação perigosa' };
        }
        if (highRiskOps.some(op => operation.toLowerCase().includes(op))) {
            return { name: 'high_risk_operation', weight: 30, description: 'Operação de alto risco' };
        }
        if (mediumRiskOps.some(op => operation.toLowerCase().includes(op))) {
            return { name: 'medium_risk_operation', weight: 20, description: 'Operação de médio risco' };
        }
        return { name: 'low_risk_operation', weight: 10, description: 'Operação de baixo risco' };
    }

    private evaluateFilesAffected(count: number): RiskFactor {
        if (count > 20) return { name: 'many_files', weight: 30, description: `${count} arquivos afetados` };
        if (count > 10) return { name: 'several_files', weight: 20, description: `${count} arquivos afetados` };
        if (count > 5) return { name: 'some_files', weight: 10, description: `${count} arquivos afetados` };
        return { name: 'few_files', weight: 5, description: `${count} arquivos afetados` };
    }
}
