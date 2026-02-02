import type { QualityScenario, QualityAttribute } from './types.js';

/**
 * Catálogo de Cenários de Qualidade (Fase 3 - Melhoria #23)
 */
export class QualityScenarios {
    private scenarios: Map<QualityAttribute, QualityScenario[]>;

    constructor() {
        this.scenarios = new Map();
        this.initializeDefaultScenarios();
    }

    private initializeDefaultScenarios(): void {
        // Performance
        this.addScenario({
            id: 'perf-001',
            attribute: 'performance',
            stimulus: 'Usuário solicita listagem de 1000 itens',
            response: 'Sistema retorna resultados em menos de 2 segundos',
            metric: 'Tempo de resposta < 2s',
            priority: 'high',
            targetValue: 2000
        });

        this.addScenario({
            id: 'perf-002',
            attribute: 'performance',
            stimulus: 'Sistema sob carga de 1000 requisições/segundo',
            response: 'Latência p95 permanece abaixo de 500ms',
            metric: 'p95 latency < 500ms',
            priority: 'high',
            targetValue: 500
        });

        // Security
        this.addScenario({
            id: 'sec-001',
            attribute: 'security',
            stimulus: 'Tentativa de acesso não autorizado',
            response: 'Sistema bloqueia acesso e registra tentativa',
            metric: 'Taxa de bloqueio = 100%',
            priority: 'high',
            targetValue: 100
        });

        this.addScenario({
            id: 'sec-002',
            attribute: 'security',
            stimulus: 'Dados sensíveis em trânsito',
            response: 'Todos os dados são criptografados com TLS 1.3+',
            metric: 'Cobertura de criptografia = 100%',
            priority: 'high',
            targetValue: 100
        });

        // Maintainability
        this.addScenario({
            id: 'maint-001',
            attribute: 'maintainability',
            stimulus: 'Desenvolvedor precisa adicionar nova feature',
            response: 'Feature implementada em menos de 2 dias',
            metric: 'Tempo de desenvolvimento < 2 dias',
            priority: 'medium',
            targetValue: 2
        });

        this.addScenario({
            id: 'maint-002',
            attribute: 'maintainability',
            stimulus: 'Bug crítico identificado',
            response: 'Correção implementada e deployada em menos de 4 horas',
            metric: 'MTTR < 4 horas',
            priority: 'high',
            targetValue: 4
        });

        // Scalability
        this.addScenario({
            id: 'scale-001',
            attribute: 'scalability',
            stimulus: 'Aumento de 10x no número de usuários',
            response: 'Sistema escala horizontalmente sem degradação',
            metric: 'Capacidade de escala = 10x',
            priority: 'medium',
            targetValue: 10
        });

        this.addScenario({
            id: 'scale-002',
            attribute: 'scalability',
            stimulus: 'Pico de tráfego sazonal (5x normal)',
            response: 'Auto-scaling ativado em menos de 2 minutos',
            metric: 'Tempo de escala < 2 min',
            priority: 'high',
            targetValue: 2
        });

        // Availability
        this.addScenario({
            id: 'avail-001',
            attribute: 'availability',
            stimulus: 'Falha de componente crítico',
            response: 'Failover automático em menos de 30 segundos',
            metric: 'RTO < 30s',
            priority: 'high',
            targetValue: 30
        });

        this.addScenario({
            id: 'avail-002',
            attribute: 'availability',
            stimulus: 'Operação durante 1 ano',
            response: 'Uptime de 99.9% ou superior',
            metric: 'Uptime >= 99.9%',
            priority: 'high',
            targetValue: 99.9
        });

        // Usability
        this.addScenario({
            id: 'usab-001',
            attribute: 'usability',
            stimulus: 'Novo usuário tenta completar tarefa principal',
            response: 'Tarefa completada sem ajuda em menos de 5 minutos',
            metric: 'Time to first success < 5 min',
            priority: 'medium',
            targetValue: 5
        });
    }

    private addScenario(scenario: QualityScenario): void {
        if (!this.scenarios.has(scenario.attribute)) {
            this.scenarios.set(scenario.attribute, []);
        }
        this.scenarios.get(scenario.attribute)!.push(scenario);
    }

    getScenariosByAttribute(attribute: QualityAttribute): QualityScenario[] {
        return this.scenarios.get(attribute) || [];
    }

    getAllScenarios(): QualityScenario[] {
        const all: QualityScenario[] = [];
        for (const scenarios of this.scenarios.values()) {
            all.push(...scenarios);
        }
        return all;
    }

    getScenarioById(id: string): QualityScenario | undefined {
        for (const scenarios of this.scenarios.values()) {
            const found = scenarios.find(s => s.id === id);
            if (found) return found;
        }
        return undefined;
    }

    createCustomScenario(scenario: QualityScenario): void {
        this.addScenario(scenario);
        console.log('[QualityScenarios] Cenário customizado adicionado:', scenario.id);
    }

    getHighPriorityScenarios(): QualityScenario[] {
        return this.getAllScenarios().filter(s => s.priority === 'high');
    }
}
