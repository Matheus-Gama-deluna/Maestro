import { appendFile, mkdir } from 'fs/promises';
import { join } from 'path';

export interface HistoryEvent {
  id?: string;
  ts?: string;
  type: string;
  fase: number;
  actor?: 'user' | 'mcp' | 'ai';
  data: Record<string, unknown>;
}

/**
 * Registra um evento no histórico do projeto
 * Eventos são salvos em .maestro/history/events.jsonl
 */
export async function logEvent(diretorio: string, event: HistoryEvent): Promise<void> {
  const historyPath = join(diretorio, '.maestro', 'history');
  await mkdir(historyPath, { recursive: true });
  
  const fullEvent: HistoryEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    ts: new Date().toISOString(),
    actor: 'mcp',
    ...event
  };
  
  await appendFile(
    join(historyPath, 'events.jsonl'),
    JSON.stringify(fullEvent) + '\n'
  );
}

/**
 * Tipos de eventos suportados
 */
export const EventTypes = {
  PROJECT_INIT: 'project_init',
  PROJECT_CONFIRMED: 'project_confirmed',
  PHASE_TRANSITION: 'phase_transition',
  GATE_VALIDATED: 'gate_validated',
  GATE_APPROVED: 'gate_approved',
  DELIVERABLE_SAVED: 'deliverable_saved',
  FEATURE_STARTED: 'feature_started',
  BUG_STARTED: 'bug_started',
  REFACTOR_STARTED: 'refactor_started',
  // v2.0: Novos eventos
  CONFIG_CHANGED: 'config_changed',
  MODE_CHANGED: 'mode_changed',
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_COMPLETED: 'task_completed',
  CHECKPOINT_CREATED: 'checkpoint_created',
  AUTO_FIX_ATTEMPTED: 'auto_fix_attempted',
  CONTRACT_GENERATED: 'contract_generated',
  MOCKS_GENERATED: 'mocks_generated',
  OPTIMIZATION_APPLIED: 'optimization_applied'
} as const;
