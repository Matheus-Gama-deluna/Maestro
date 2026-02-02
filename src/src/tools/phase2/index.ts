/**
 * Exporta todos os MCP Tools da Fase 2
 */

export { validationTools } from './validation.tools.js';
export { decisionTools } from './decision.tools.js';
export { architectureTools } from './architecture.tools.js';

// Combinar todos os tools
export const phase2Tools = {
    // Validação (#10)
    ...require('./validation.tools.js').validationTools,
    
    // Decisão (#11)
    ...require('./decision.tools.js').decisionTools,
    
    // Arquitetura (#12)
    ...require('./architecture.tools.js').architectureTools
};
