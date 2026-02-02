import type { OptimizationConfig } from '../types/config.js';

export interface Question {
    id: string;
    question: string;
    type: 'text' | 'choice' | 'number' | 'boolean';
    choices?: string[];
    required: boolean;
    validation?: (answer: any) => boolean;
}

export interface BatchQuestionsResult {
    answers: Record<string, any>;
    prompt_count: number;
    time_saved_ms: number;
}

export class BatchPromptsOptimizer {
    private enabled: boolean;

    constructor(config: OptimizationConfig) {
        this.enabled = config.batch_questions;
    }

    formatBatchQuestions(questions: Question[]): string {
        if (!this.enabled || questions.length <= 1) {
            return '';
        }

        let formatted = '📝 **Perguntas em Lote** (responda todas de uma vez)\n\n';
        
        questions.forEach((q, index) => {
            formatted += `**${index + 1}. ${q.question}**\n`;
            
            if (q.type === 'choice' && q.choices) {
                formatted += `   Opções: ${q.choices.join(' | ')}\n`;
            }
            
            if (q.required) {
                formatted += `   ⚠️ Obrigatório\n`;
            }
            
            formatted += '\n';
        });

        formatted += '---\n\n';
        formatted += '**Formato de resposta:**\n';
        questions.forEach((q, index) => {
            formatted += `${index + 1}. [sua resposta]\n`;
        });

        return formatted;
    }

    parseAnswers(response: string, questions: Question[]): Record<string, any> {
        const answers: Record<string, any> = {};
        const lines = response.split('\n').filter(l => l.trim());

        questions.forEach((q, index) => {
            const pattern = new RegExp(`^${index + 1}\\.\\s*(.+)$`, 'i');
            
            for (const line of lines) {
                const match = line.match(pattern);
                if (match) {
                    let answer: string | number | boolean = match[1].trim();
                    
                    if (q.type === 'number') {
                        answer = parseFloat(answer as string);
                    } else if (q.type === 'boolean') {
                        answer = /^(sim|yes|true|1)$/i.test(answer as string);
                    }
                    
                    answers[q.id] = answer;
                    break;
                }
            }
        });

        return answers;
    }

    validateAnswers(answers: Record<string, any>, questions: Question[]): string[] {
        const errors: string[] = [];

        questions.forEach(q => {
            const answer = answers[q.id];

            if (q.required && (answer === undefined || answer === null || answer === '')) {
                errors.push(`Pergunta ${q.id} é obrigatória`);
            }

            if (answer !== undefined && q.validation && !q.validation(answer)) {
                errors.push(`Resposta inválida para ${q.id}`);
            }

            if (q.type === 'choice' && q.choices && !q.choices.includes(answer)) {
                errors.push(`Resposta para ${q.id} deve ser uma das opções: ${q.choices.join(', ')}`);
            }
        });

        return errors;
    }

    estimateSavings(questionCount: number): { prompts_saved: number; percentage: number } {
        if (!this.enabled || questionCount <= 1) {
            return { prompts_saved: 0, percentage: 0 };
        }

        const without_batch = questionCount * 2;
        const with_batch = 2;
        const prompts_saved = without_batch - with_batch;
        const percentage = (prompts_saved / without_batch) * 100;

        return { prompts_saved, percentage };
    }
}

export function createBatchQuestions(
    phase: number,
    config: OptimizationConfig
): Question[] {
    const optimizer = new BatchPromptsOptimizer(config);
    
    if (!optimizer) {
        return [];
    }

    switch (phase) {
        case 1:
            return [
                {
                    id: 'problema',
                    question: 'Qual o principal problema que este produto resolve?',
                    type: 'text',
                    required: true,
                },
                {
                    id: 'usuarios',
                    question: 'Quem são os usuários-alvo?',
                    type: 'text',
                    required: true,
                },
                {
                    id: 'funcionalidades',
                    question: 'Quais as 3-5 funcionalidades principais?',
                    type: 'text',
                    required: true,
                },
                {
                    id: 'metrica',
                    question: 'Qual a métrica de sucesso (North Star Metric)?',
                    type: 'text',
                    required: true,
                },
            ];

        case 2:
            return [
                {
                    id: 'requisitos_funcionais',
                    question: 'Liste os principais requisitos funcionais (RF)',
                    type: 'text',
                    required: true,
                },
                {
                    id: 'requisitos_nao_funcionais',
                    question: 'Liste os requisitos não-funcionais (RNF) críticos',
                    type: 'text',
                    required: true,
                },
                {
                    id: 'restricoes',
                    question: 'Existem restrições técnicas ou de negócio?',
                    type: 'text',
                    required: false,
                },
            ];

        case 3:
            return [
                {
                    id: 'fluxos_principais',
                    question: 'Quais os fluxos de usuário principais?',
                    type: 'text',
                    required: true,
                },
                {
                    id: 'componentes',
                    question: 'Quais componentes de UI são necessários?',
                    type: 'text',
                    required: true,
                },
                {
                    id: 'acessibilidade',
                    question: 'Existem requisitos de acessibilidade específicos?',
                    type: 'text',
                    required: false,
                },
            ];

        case 6:
            return [
                {
                    id: 'estilo_arquitetura',
                    question: 'Qual estilo arquitetural? (monolito, microserviços, serverless)',
                    type: 'choice',
                    choices: ['monolito', 'microserviços', 'serverless', 'híbrido'],
                    required: true,
                },
                {
                    id: 'escalabilidade',
                    question: 'Qual a escala esperada? (usuários simultâneos)',
                    type: 'number',
                    required: true,
                },
                {
                    id: 'integracao',
                    question: 'Quais sistemas externos precisam integrar?',
                    type: 'text',
                    required: false,
                },
            ];

        default:
            return [];
    }
}
