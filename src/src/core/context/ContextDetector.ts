import type { BoundedContext, Entity } from './types.js';

/**
 * Detector de Bounded Contexts (Fase 3 - Melhoria #28)
 */
export class ContextDetector {
    async detectContexts(projectPath: string): Promise<BoundedContext[]> {
        console.log('[ContextDetector] Detectando contextos em:', projectPath);

        const contexts: BoundedContext[] = [];

        // Detecção baseada em estrutura de diretórios
        const detectedContexts = await this.analyzeDirectoryStructure(projectPath);
        contexts.push(...detectedContexts);

        // Detecção baseada em agregados
        const aggregateContexts = await this.analyzeAggregates(projectPath);
        contexts.push(...aggregateContexts);

        console.log('[ContextDetector] Contextos detectados:', contexts.length);

        return contexts;
    }

    private async analyzeDirectoryStructure(projectPath: string): Promise<BoundedContext[]> {
        // Simplificado - retorna contextos exemplo
        return [
            {
                id: 'ctx-user',
                name: 'User Management',
                domain: 'Identity',
                entities: [
                    { name: 'User', properties: ['id', 'email', 'name'], methods: ['authenticate', 'updateProfile'] },
                    { name: 'Role', properties: ['id', 'name', 'permissions'], methods: ['grantPermission'] }
                ],
                aggregates: [
                    { name: 'UserAggregate', root: 'User', entities: ['User', 'Role'] }
                ],
                services: [
                    { name: 'AuthenticationService', type: 'domain', operations: ['login', 'logout'] }
                ],
                relationships: [],
                consistency: 'strong',
                detected: true
            }
        ];
    }

    private async analyzeAggregates(projectPath: string): Promise<BoundedContext[]> {
        // Simplificado - retorna contextos baseados em agregados
        return [];
    }

    validateContext(context: BoundedContext): { valid: boolean; issues: string[] } {
        const issues: string[] = [];

        if (context.entities.length === 0) {
            issues.push('Contexto sem entidades');
        }

        if (context.aggregates.length === 0) {
            issues.push('Contexto sem agregados definidos');
        }

        return {
            valid: issues.length === 0,
            issues
        };
    }
}
