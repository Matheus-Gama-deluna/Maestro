/**
 * Tipos para o fluxo de onboarding otimizado
 */

export type OnboardingPhase = 'discovery' | 'brainstorm' | 'prd_draft' | 'validation' | 'completed';
export type DiscoveryBlockStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';
export type BrainstormStatus = 'pending' | 'in_progress' | 'completed';

/**
 * Campo individual do discovery
 */
export interface DiscoveryField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'array';
  required: boolean;
  placeholder?: string;
  options?: string[];
  value?: any;
  filled: boolean;
}

/**
 * Bloco de discovery adaptativo
 */
export interface DiscoveryBlock {
  id: string;
  title: string;
  description: string;
  fields: DiscoveryField[];
  required: boolean;
  mode: 'economy' | 'balanced' | 'quality';
  status: DiscoveryBlockStatus;
  order: number;
  estimatedTime: number; // em minutos
}

/**
 * Seção de brainstorm
 */
export interface BrainstormSection {
  id: string;
  title: string;
  description: string;
  prompt: string;
  expectedOutput: string;
  status: BrainstormStatus;
  response?: string;
  insights?: string[];
  order: number;
}

/**
 * Estado do onboarding
 */
export interface OnboardingState {
  projectId: string;
  phase: OnboardingPhase;
  
  // Discovery
  discoveryStatus: 'pending' | 'in_progress' | 'completed';
  discoveryBlocks: DiscoveryBlock[];
  discoveryResponses: Record<string, any>;
  discoveryStartedAt?: string;
  discoveryCompletedAt?: string;
  
  // Brainstorm
  brainstormStatus: BrainstormStatus;
  brainstormSections: BrainstormSection[];
  brainstormStartedAt?: string;
  brainstormCompletedAt?: string;
  
  // PRD
  prdStatus: 'pending' | 'draft' | 'validated' | 'approved';
  prdScore: number;
  prdValidationReport?: {
    score: number;
    checklist: Record<string, boolean>;
    gaps: string[];
    suggestions: string[];
  };
  
  // Metadata
  mode: 'economy' | 'balanced' | 'quality';
  completedAt?: string;
  totalInteractions: number;
  lastInteractionAt?: string;
}

/**
 * Resultado de validação de readiness
 */
export interface ReadinessCheckResult {
  isReady: boolean;
  score: number;
  completedFields: number;
  totalFields: number;
  missingFields: string[];
  recommendations: string[];
  nextActions: string[];
}

/**
 * Dashboard de próximos passos
 */
export interface NextStepsDashboard {
  discoveryStatus: {
    completed: number;
    total: number;
    percentage: number;
    nextBlock?: DiscoveryBlock;
  };
  brainstormStatus: {
    completed: number;
    total: number;
    percentage: number;
    nextSection?: BrainstormSection;
  };
  prdReadiness: ReadinessCheckResult;
  recommendedActions: Array<{
    action: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    estimatedTime: number;
  }>;
  estimatedTimeRemaining: number;
  currentPhase: OnboardingPhase;
}

/**
 * Configuração de discovery adaptativo
 */
export interface DiscoveryAdaptiveConfig {
  mode: 'economy' | 'balanced' | 'quality';
  existingData?: Record<string, any>;
  skipCompletedBlocks: boolean;
  prioritizeByMode: boolean;
  allowBatchInput: boolean;
}
