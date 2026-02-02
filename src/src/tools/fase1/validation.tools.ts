import { DependencyValidator } from '../../core/validation/DependencyValidator.js';
import { SecurityValidator } from '../../core/validation/SecurityValidator.js';

// ==================== VALIDATE DEPENDENCIES ====================

export interface ValidateDependenciesParams {
    code: string;
    language?: 'typescript' | 'javascript' | 'python';
    estado_json: string;
    diretorio: string;
}

export async function validateDependencies(params: ValidateDependenciesParams) {
    try {
        const validator = new DependencyValidator();
        const result = await validator.validate(
            params.code,
            params.language || 'typescript'
        );

        let text = `📦 **Validação de Dependências**\n\n`;
        text += `${result.summary}\n`;
        text += `Score: ${result.score}/100\n\n`;

        if (result.issues.length > 0) {
            text += `**Problemas Encontrados:**\n\n`;
            result.issues.forEach(issue => {
                const icon = issue.severity === 'critical' ? '🔴' : 
                            issue.severity === 'high' ? '⚠️' : 
                            issue.severity === 'medium' ? '⚡' : 'ℹ️';
                text += `${icon} **${issue.type}** (${issue.severity})\n`;
                text += `${issue.message}\n`;
                if (issue.line) text += `Linha: ${issue.line}\n`;
                if (issue.suggestion) text += `💡 ${issue.suggestion}\n`;
                text += `\n`;
            });
        }

        return {
            content: [{
                type: "text" as const,
                text
            }],
            isError: !result.valid
        };
    } catch (error) {
        return {
            content: [{
                type: "text" as const,
                text: `❌ Erro na validação: ${String(error)}`
            }],
            isError: true
        };
    }
}

export const validateDependenciesSchema = {
    type: "object" as const,
    properties: {
        code: { type: "string", description: "Código para validar" },
        language: { 
            type: "string", 
            enum: ["typescript", "javascript", "python"],
            description: "Linguagem do código" 
        },
        estado_json: { type: "string" },
        diretorio: { type: "string" },
    },
    required: ["code", "estado_json", "diretorio"],
};

// ==================== VALIDATE SECURITY ====================

export interface ValidateSecurityParams {
    code: string;
    language?: 'typescript' | 'javascript' | 'python';
    estado_json: string;
    diretorio: string;
}

export async function validateSecurity(params: ValidateSecurityParams) {
    try {
        const validator = new SecurityValidator();
        const result = await validator.validateOWASP(
            params.code,
            params.language || 'typescript'
        );

        let text = `🔒 **Validação de Segurança (OWASP)**\n\n`;
        text += `${result.summary}\n`;
        text += `Score: ${result.score}/100\n\n`;

        if (result.issues.length > 0) {
            text += `**Vulnerabilidades Encontradas:**\n\n`;
            
            // Agrupar por severidade
            const critical = result.issues.filter(i => i.severity === 'critical');
            const high = result.issues.filter(i => i.severity === 'high');
            const medium = result.issues.filter(i => i.severity === 'medium');
            const low = result.issues.filter(i => i.severity === 'low');

            if (critical.length > 0) {
                text += `**🔴 Críticas (${critical.length}):**\n`;
                critical.forEach(issue => {
                    text += `- ${issue.message}\n`;
                    if (issue.suggestion) text += `  💡 ${issue.suggestion}\n`;
                });
                text += `\n`;
            }

            if (high.length > 0) {
                text += `**⚠️ Altas (${high.length}):**\n`;
                high.forEach(issue => {
                    text += `- ${issue.message}\n`;
                    if (issue.suggestion) text += `  💡 ${issue.suggestion}\n`;
                });
                text += `\n`;
            }

            if (medium.length > 0) {
                text += `**⚡ Médias (${medium.length}):**\n`;
                medium.forEach(issue => {
                    text += `- ${issue.message}\n`;
                });
                text += `\n`;
            }
        }

        return {
            content: [{
                type: "text" as const,
                text
            }],
            isError: !result.valid
        };
    } catch (error) {
        return {
            content: [{
                type: "text" as const,
                text: `❌ Erro na validação: ${String(error)}`
            }],
            isError: true
        };
    }
}

export const validateSecuritySchema = {
    type: "object" as const,
    properties: {
        code: { type: "string", description: "Código para validar" },
        language: { 
            type: "string", 
            enum: ["typescript", "javascript", "python"],
            description: "Linguagem do código" 
        },
        estado_json: { type: "string" },
        diretorio: { type: "string" },
    },
    required: ["code", "estado_json", "diretorio"],
};

// ==================== CHECK COMPLIANCE ====================

export interface CheckComplianceParams {
    code: string;
    standard: 'LGPD' | 'PCI-DSS' | 'HIPAA';
    estado_json: string;
    diretorio: string;
}

export async function checkCompliance(params: CheckComplianceParams) {
    try {
        const validator = new SecurityValidator();
        const result = await validator.checkCompliance(params.code, params.standard);

        let text = `📋 **Verificação de Compliance - ${params.standard}**\n\n`;
        text += result.passed ? '✅ Passou' : '❌ Falhou';
        text += `\n\n`;

        if (result.issues.length > 0) {
            text += `**Problemas Encontrados:**\n`;
            result.issues.forEach(issue => {
                text += `- ${issue}\n`;
            });
        }

        return {
            content: [{
                type: "text" as const,
                text
            }],
            isError: !result.passed
        };
    } catch (error) {
        return {
            content: [{
                type: "text" as const,
                text: `❌ Erro na verificação: ${String(error)}`
            }],
            isError: true
        };
    }
}

export const checkComplianceSchema = {
    type: "object" as const,
    properties: {
        code: { type: "string", description: "Código para verificar" },
        standard: { 
            type: "string", 
            enum: ["LGPD", "PCI-DSS", "HIPAA"],
            description: "Padrão de compliance" 
        },
        estado_json: { type: "string" },
        diretorio: { type: "string" },
    },
    required: ["code", "standard", "estado_json", "diretorio"],
};
