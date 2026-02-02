/**
 * Notification Manager (Fase 2 - Melhoria #19)
 * Gerencia notificações inteligentes
 */
export class NotificationManager {
    async notify(notification: Notification): Promise<void> {
        console.log(`[NotificationManager] ${notification.type.toUpperCase()}: ${notification.message}`);
        
        // Em produção, poderia enviar para UI, email, etc.
    }

    async requestApproval(request: ApprovalRequest): Promise<boolean> {
        console.log('[NotificationManager] Solicitando aprovação:', request.operation);
        
        // Em produção, aguardaria resposta do usuário
        return false;
    }
}

export interface Notification {
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    details?: string;
}

export interface ApprovalRequest {
    operation: string;
    reason: string;
    risk: string;
    alternatives?: string[];
}
