/**
 * Tipos para Bounded Contexts (Fase 3 - Melhoria #28)
 */

export interface BoundedContext {
    id: string;
    name: string;
    domain: string;
    entities: Entity[];
    aggregates: Aggregate[];
    services: Service[];
    relationships: ContextRelationship[];
    consistency: string;
    detected: boolean;
}

export interface Entity {
    name: string;
    properties: string[];
    methods: string[];
}

export interface Aggregate {
    name: string;
    root: string;
    entities: string[];
}

export interface Service {
    name: string;
    type: 'domain' | 'application' | 'infrastructure';
    operations: string[];
}

export interface ContextRelationship {
    from: string;
    to: string;
    type: 'shared-kernel' | 'customer-supplier' | 'conformist' | 'anti-corruption';
    integration: 'sync' | 'async' | 'event-driven';
    description: string;
}

export interface ContextMap {
    contexts: BoundedContext[];
    relationships: ContextRelationship[];
}
