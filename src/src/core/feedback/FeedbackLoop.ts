import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Feedback Loop (Fase 2 - Melhoria #20)
 * Sistema de feedback e aprendizado contínuo
 */
export class FeedbackLoop {
    async recordOutcome(outcome: Outcome): Promise<void> {
        console.log('[FeedbackLoop] Registrando resultado:', outcome.operation);

        try {
            const loopsDir = path.join(process.cwd(), '.maestro', 'feedback', 'loops');
            await fs.mkdir(loopsDir, { recursive: true });

            const filename = `outcome-${Date.now()}.json`;
            const filepath = path.join(loopsDir, filename);

            await fs.writeFile(filepath, JSON.stringify(outcome, null, 2));
        } catch (error) {
            console.error('[FeedbackLoop] Erro ao registrar outcome:', error);
        }
    }

    async extractLearnings(): Promise<Learning[]> {
        const learnings: Learning[] = [];

        try {
            const loopsDir = path.join(process.cwd(), '.maestro', 'feedback', 'loops');
            const files = await fs.readdir(loopsDir);

            for (const file of files.slice(-50)) {
                const filepath = path.join(loopsDir, file);
                const content = await fs.readFile(filepath, 'utf-8');
                const outcome = JSON.parse(content);

                if (outcome.success) {
                    learnings.push({
                        pattern: outcome.operation,
                        confidence: 0.8,
                        context: outcome.context
                    });
                }
            }
        } catch {
            // Sem dados ainda
        }

        return learnings;
    }
}

export interface Outcome {
    operation: string;
    success: boolean;
    duration: number;
    context: any;
    timestamp: string;
}

export interface Learning {
    pattern: string;
    confidence: number;
    context: any;
}
