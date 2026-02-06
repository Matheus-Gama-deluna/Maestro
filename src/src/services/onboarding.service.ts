/**
 * Serviço compartilhado de onboarding
 * Centraliza criação e manipulação de estado de onboarding
 * Elimina duplicação entre iniciar-projeto.ts e onboarding-orchestrator.ts
 */

import type { EstadoProjeto } from "../types/index.js";
import type { OnboardingState } from "../types/onboarding.js";
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
 * Salva estado de onboarding no estado do projeto
 */
export function salvarEstadoOnboarding(estado: EstadoProjeto, onboarding: OnboardingState): EstadoProjeto {
    return {
        ...estado,
        onboarding: onboarding as any,
        atualizado_em: new Date().toISOString(),
    };
}
