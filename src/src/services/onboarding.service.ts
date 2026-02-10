/**
 * Serviço compartilhado de onboarding
 * Centraliza criação e manipulação de estado de onboarding
 * Elimina duplicação entre iniciar-projeto.ts e onboarding-orchestrator.ts
 */

import type { EstadoProjeto } from "../types/index.js";
import type { OnboardingState, SpecialistPhaseState } from "../types/onboarding.js";
import { gerarBlocosDiscovery } from "../utils/discovery-adapter.js";

/**
 * Cria estado inicial de onboarding (ÚNICO LUGAR - antes duplicado em 2 arquivos)
 */
export function criarEstadoOnboardingInicial(
    projectId: string,
    modo: 'economy' | 'balanced' | 'quality'
): OnboardingState {
    const blocosDiscovery = gerarBlocosDiscovery({
        mode: modo,
        skipCompletedBlocks: false,
        prioritizeByMode: true,
        allowBatchInput: true,
    });

    return {
        projectId,
        phase: 'discovery',
        discoveryStatus: 'in_progress',
        discoveryBlocks: blocosDiscovery,
        discoveryResponses: {},
        discoveryStartedAt: new Date().toISOString(),
        brainstormStatus: 'pending',
        brainstormSections: [],
        prdStatus: 'pending',
        prdScore: 0,
        mode: modo,
        totalInteractions: 0,
        lastInteractionAt: new Date().toISOString(),
    };
}

/**
 * Obtém estado de onboarding do estado do projeto
 */
export function obterEstadoOnboarding(estado: EstadoProjeto): OnboardingState | null {
    return (estado as any).onboarding || null;
}

/**
 * v6.0: Cria estado de onboarding com specialistPhase (novo fluxo)
 * Não cria discoveryBlocks — o especialista conduz a coleta conversacional
 */
export function criarEstadoOnboardingComEspecialista(
    projectId: string,
    modo: 'economy' | 'balanced' | 'quality',
    skillName: string = 'specialist-gestao-produto'
): OnboardingState {
    const specialistPhase: SpecialistPhaseState = {
        skillName,
        status: 'active',
        collectedData: {},
        interactionCount: 0,
        activatedAt: new Date().toISOString(),
    };

    return {
        projectId,
        phase: 'specialist_active',
        specialistPhase,
        // Legacy fields (vazios — não usados no novo fluxo)
        discoveryStatus: 'pending',
        discoveryBlocks: [],
        discoveryResponses: {},
        brainstormStatus: 'pending',
        brainstormSections: [],
        prdStatus: 'pending',
        prdScore: 0,
        mode: modo,
        totalInteractions: 0,
        lastInteractionAt: new Date().toISOString(),
    };
}

/**
 * Salva estado de onboarding no estado do projeto
 */
export function salvarEstadoOnboarding(estado: EstadoProjeto, onboarding: OnboardingState): EstadoProjeto {
    return {
        ...estado,
        onboarding: onboarding as any,
        atualizado_em: new Date().toISOString(),
    };
}
