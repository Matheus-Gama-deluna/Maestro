import { ValidationResult, ValidationIssue, SecurityVulnerability, ComplianceCheck } from './types.js';

export class SecurityValidator {
    /**
     * Valida código contra OWASP Top 10
     */
    async validateOWASP(code: string, language: 'typescript' | 'javascript' | 'python' = 'typescript'): Promise<ValidationResult> {
        const issues: ValidationIssue[] = [];

        // A01: Broken Access Control
        issues.push(...this.checkAccessControl(code));

        // A02: Cryptographic Failures
        issues.push(...this.checkCryptography(code));

        // A03: Injection
        issues.push(...this.checkInjection(code, language));

        // A05: Security Misconfiguration
        issues.push(...this.checkSecurityConfig(code));

        // A07: Identification and Authentication Failures
        issues.push(...this.checkAuthentication(code));

        // A08: Software and Data Integrity Failures
        issues.push(...this.checkIntegrity(code));

        const score = this.calculateScore(issues);

        return {
            valid: score >= 70,
            score,
            issues,
            summary: this.generateSummary(issues)
        };
    }

    /**
     * Verifica compliance com padrões
     */
    async checkCompliance(code: string, standard: 'LGPD' | 'PCI-DSS' | 'HIPAA'): Promise<ComplianceCheck> {
        const issues: string[] = [];

        if (standard === 'LGPD') {
            // Verificar se há tratamento de dados pessoais
            if (code.includes('email') || code.includes('cpf') || code.includes('phone')) {
                if (!code.includes('encrypt') && !code.includes('hash')) {
                    issues.push('Dados pessoais sem criptografia detectados');
                }
                if (!code.includes('consent') && !code.includes('authorization')) {
                    issues.push('Falta verificação de consentimento para dados pessoais');
                }
            }
        }

        return {
            standard,
            passed: issues.length === 0,
            issues
        };
    }

    /**
     * Verifica controle de acesso
     */
    private checkAccessControl(code: string): ValidationIssue[] {
        const issues: ValidationIssue[] = [];

        // Verificar rotas sem autenticação
        if (code.match(/app\.(get|post|put|delete)\([^)]*\)/g)) {
            const routes = code.match(/app\.(get|post|put|delete)\([^)]*\)/g) || [];
            routes.forEach(route => {
                if (!route.includes('auth') && !route.includes('middleware')) {
                    issues.push({
                        severity: 'high',
                        type: 'broken_access_control',
                        message: 'Rota sem autenticação detectada',
                        suggestion: 'Adicione middleware de autenticação'
                    });
                }
            });
        }

        return issues;
    }

    /**
     * Verifica criptografia
     */
    private checkCryptography(code: string): ValidationIssue[] {
        const issues: ValidationIssue[] = [];

        // Verificar uso de MD5 ou SHA1 (inseguros)
        if (code.includes('md5') || code.includes('MD5')) {
            issues.push({
                severity: 'critical',
                type: 'weak_cryptography',
                message: 'Uso de MD5 detectado (algoritmo inseguro)',
                suggestion: 'Use SHA-256 ou bcrypt'
            });
        }

        if (code.includes('sha1') || code.includes('SHA1')) {
            issues.push({
                severity: 'high',
                type: 'weak_cryptography',
                message: 'Uso de SHA1 detectado (algoritmo fraco)',
                suggestion: 'Use SHA-256 ou superior'
            });
        }

        // Verificar senhas em texto plano
        if (code.match(/password\s*=\s*['"][^'"]+['"]/)) {
            issues.push({
                severity: 'critical',
                type: 'hardcoded_password',
                message: 'Senha hardcoded detectada',
                suggestion: 'Use variáveis de ambiente'
            });
        }

        return issues;
    }

    /**
     * Verifica injeção
     */
    private checkInjection(code: string, language: string): ValidationIssue[] {
        const issues: ValidationIssue[] = [];

        // SQL Injection
        if (code.includes('SELECT') || code.includes('INSERT') || code.includes('UPDATE')) {
            if (code.match(/\$\{[^}]+\}/g) || code.match(/\+\s*\w+\s*\+/g)) {
                issues.push({
                    severity: 'critical',
                    type: 'sql_injection',
                    message: 'Possível SQL Injection detectado',
                    suggestion: 'Use prepared statements ou ORM'
                });
            }
        }

        // Command Injection
        if (code.includes('exec') || code.includes('spawn') || code.includes('system')) {
            if (code.match(/exec\([^)]*\$\{[^}]+\}/)) {
                issues.push({
                    severity: 'critical',
                    type: 'command_injection',
                    message: 'Possível Command Injection detectado',
                    suggestion: 'Valide e sanitize inputs antes de executar comandos'
                });
            }
        }

        // XSS
        if (code.includes('innerHTML') || code.includes('dangerouslySetInnerHTML')) {
            issues.push({
                severity: 'high',
                type: 'xss',
                message: 'Uso de innerHTML detectado (risco de XSS)',
                suggestion: 'Use textContent ou sanitize HTML'
            });
        }

        return issues;
    }

    /**
     * Verifica configuração de segurança
     */
    private checkSecurityConfig(code: string): ValidationIssue[] {
        const issues: ValidationIssue[] = [];

        // CORS aberto
        if (code.includes('cors()') && !code.includes('origin:')) {
            issues.push({
                severity: 'medium',
                type: 'security_misconfiguration',
                message: 'CORS configurado sem restrições',
                suggestion: 'Configure origins permitidas'
            });
        }

        // Debug mode em produção
        if (code.includes('debug: true') || code.includes('DEBUG=true')) {
            issues.push({
                severity: 'medium',
                type: 'security_misconfiguration',
                message: 'Debug mode habilitado',
                suggestion: 'Desabilite debug em produção'
            });
        }

        return issues;
    }

    /**
     * Verifica autenticação
     */
    private checkAuthentication(code: string): ValidationIssue[] {
        const issues: ValidationIssue[] = [];

        // JWT sem expiração
        if (code.includes('jwt.sign') && !code.includes('expiresIn')) {
            issues.push({
                severity: 'high',
                type: 'auth_failure',
                message: 'JWT sem expiração detectado',
                suggestion: 'Adicione expiresIn ao token'
            });
        }

        // Sessões sem timeout
        if (code.includes('session') && !code.includes('maxAge') && !code.includes('expires')) {
            issues.push({
                severity: 'medium',
                type: 'auth_failure',
                message: 'Sessão sem timeout detectada',
                suggestion: 'Configure maxAge ou expires'
            });
        }

        return issues;
    }

    /**
     * Verifica integridade
     */
    private checkIntegrity(code: string): ValidationIssue[] {
        const issues: ValidationIssue[] = [];

        // Desserialização insegura
        if (code.includes('JSON.parse') && code.match(/JSON\.parse\([^)]*req\./)) {
            issues.push({
                severity: 'high',
                type: 'integrity_failure',
                message: 'Desserialização de dados não confiáveis',
                suggestion: 'Valide dados antes de desserializar'
            });
        }

        return issues;
    }

    /**
     * Calcula score
     */
    private calculateScore(issues: ValidationIssue[]): number {
        let score = 100;

        for (const issue of issues) {
            switch (issue.severity) {
                case 'critical':
                    score -= 30;
                    break;
                case 'high':
                    score -= 20;
                    break;
                case 'medium':
                    score -= 10;
                    break;
                case 'low':
                    score -= 5;
                    break;
            }
        }

        return Math.max(0, score);
    }

    /**
     * Gera resumo
     */
    private generateSummary(issues: ValidationIssue[]): string {
        if (issues.length === 0) {
            return '✅ Nenhuma vulnerabilidade detectada';
        }

        const critical = issues.filter(i => i.severity === 'critical').length;
        const high = issues.filter(i => i.severity === 'high').length;

        if (critical > 0) {
            return `🔴 ${critical} vulnerabilidade(s) crítica(s) encontrada(s)`;
        }

        if (high > 0) {
            return `⚠️ ${high} vulnerabilidade(s) alta(s) encontrada(s)`;
        }

        return `⚠️ ${issues.length} problema(s) de segurança encontrado(s)`;
    }
}
