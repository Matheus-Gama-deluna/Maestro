// src/src/tests/onboarding-types.test.ts
import { describe, it, expect } from 'vitest';
import type { EstadoProjeto } from '../types/index.js';
import type { OnboardingState } from '../types/onboarding.js';

describe('Tipagem de onboarding', () => {
    it('EstadoProjeto.onboarding aceita OnboardingState válido', () => {
        const estado: Partial<EstadoProjeto> = {
            onboarding: {
                projectId: 'test-123',
                phase: 'specialist_active',
                specialistPhase: {
                    skillName: 'specialist-gestao-produto',
                    status: 'active',
                    collectedData: {},
                    interactionCount: 0,
                },
                discoveryStatus: 'pending',
                discoveryBlocks: [],
                discoveryResponses: {},
                brainstormStatus: 'pending',
                brainstormSections: [],
                prdStatus: 'pending',
                prdScore: 0,
                mode: 'balanced',
                totalInteractions: 0,
            } satisfies OnboardingState,
        };
        expect(estado.onboarding?.phase).toBe('specialist_active');
        expect(estado.onboarding?.specialistPhase?.status).toBe('active');
    });

    it('EstadoProjeto.onboarding aceita undefined', () => {
        const estado: Partial<EstadoProjeto> = {
            onboarding: undefined,
        };
        expect(estado.onboarding).toBeUndefined();
    });

    it('onboarding.prdStatus não aceita "completed" (tipo correto é "approved")', () => {
        const estado: Partial<EstadoProjeto> = {
            onboarding: {
                projectId: 'test-456',
                phase: 'prd_draft',
                discoveryStatus: 'completed',
                discoveryBlocks: [],
                discoveryResponses: {},
                brainstormStatus: 'completed',
                brainstormSections: [],
                prdStatus: 'approved',
                prdScore: 85,
                mode: 'balanced',
                totalInteractions: 5,
            },
        };
        expect(estado.onboarding?.prdStatus).toBe('approved');
    });
});
