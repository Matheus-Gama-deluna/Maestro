/**
 * Security Analyzer - OWASP Top 10 and common vulnerabilities
 */

import { BaseAnalyzer, type AnalyzerOptions, type Severity } from "./base.js";

// Security rule patterns
interface SecurityRule {
    id: string;
    name: string;
    description: string;
    severity: Severity;
    pattern: RegExp;
    suggestion: string;
    references: string[];
}

// OWASP Top 10 2021 rules
const OWASP_RULES: SecurityRule[] = [
    // A01: Broken Access Control
    {
        id: "A01-ADMIN-BYPASS",
        name: "Possível bypass de admin",
        description: "Verificação de admin pode ser bypassada",
        severity: "critical",
        pattern: /isAdmin\s*[=!]=\s*(true|false|['"]true['"])/i,
        suggestion: "Use verificação de roles no backend, não confie em flags do cliente",
        references: ["https://owasp.org/Top10/A01_2021-Broken_Access_Control/"],
    },
    {
        id: "A01-DIRECT-REF",
        name: "Referência direta de objeto",
        description: "ID de usuário/recurso exposto diretamente na URL ou parâmetro",
        severity: "high",
        pattern: /\/(user|users|admin|account)\/\{?(id|\d+)\}?/i,
        suggestion: "Implemente verificação de autorização por recurso",
        references: ["https://owasp.org/Top10/A01_2021-Broken_Access_Control/"],
    },

    // A02: Cryptographic Failures
    {
        id: "A02-HARDCODED-SECRET",
        name: "Secret hardcoded",
        description: "Chave, senha ou token hardcoded no código",
        severity: "critical",
        pattern: /(password|secret|api_key|apikey|token|jwt_secret|private_key)\s*[:=]\s*['"][^'"]{8,}['"]/i,
        suggestion: "Use variáveis de ambiente (process.env) para secrets",
        references: ["https://owasp.org/Top10/A02_2021-Cryptographic_Failures/"],
    },
    {
        id: "A02-WEAK-CRYPTO",
        name: "Algoritmo criptográfico fraco",
        description: "Uso de MD5 ou SHA1 para hashing de senhas",
        severity: "high",
        pattern: /\.(md5|sha1)\s*\(/i,
        suggestion: "Use bcrypt, argon2 ou PBKDF2 para senhas",
        references: ["https://owasp.org/Top10/A02_2021-Cryptographic_Failures/"],
    },
    {
        id: "A02-HTTP",
        name: "Comunicação não criptografada",
        description: "URL usando HTTP ao invés de HTTPS",
        severity: "medium",
        pattern: /http:\/\/(?!localhost|127\.0\.0\.1)/i,
        suggestion: "Use HTTPS para todas comunicações externas",
        references: ["https://owasp.org/Top10/A02_2021-Cryptographic_Failures/"],
    },

    // A03: Injection
    {
        id: "A03-SQL-INJECTION",
        name: "SQL Injection",
        description: "Query SQL construída por concatenação de strings",
        severity: "critical",
        pattern: /(?:query|execute|raw)\s*\(\s*[`'"].*\$\{|(?:SELECT|INSERT|UPDATE|DELETE).*\+\s*\w+/i,
        suggestion: "Use prepared statements ou ORM com parâmetros",
        references: ["https://owasp.org/Top10/A03_2021-Injection/"],
    },
    {
        id: "A03-COMMAND-INJECTION",
        name: "Command Injection",
        description: "Execução de comando shell com input do usuário",
        severity: "critical",
        pattern: /(?:exec|spawn|execSync|spawnSync)\s*\([^)]*\$\{/i,
        suggestion: "Evite exec com input do usuário, use libraries específicas",
        references: ["https://owasp.org/Top10/A03_2021-Injection/"],
    },
    {
        id: "A03-EVAL",
        name: "Uso de eval",
        description: "Uso de eval() que pode executar código arbitrário",
        severity: "critical",
        pattern: /\beval\s*\(/i,
        suggestion: "Nunca use eval() com input do usuário. Use JSON.parse para dados",
        references: ["https://owasp.org/Top10/A03_2021-Injection/"],
    },

    // A07: XSS
    {
        id: "A07-XSS-INNERHTML",
        name: "XSS via innerHTML",
        description: "Uso de innerHTML com dados não sanitizados",
        severity: "high",
        pattern: /\.innerHTML\s*=|dangerouslySetInnerHTML/i,
        suggestion: "Use textContent ou sanitize HTML com DOMPurify",
        references: ["https://owasp.org/Top10/A07_2021-Cross-Site_Scripting/"],
    },
    {
        id: "A07-XSS-DOCUMENT-WRITE",
        name: "XSS via document.write",
        description: "Uso de document.write que pode injetar scripts",
        severity: "high",
        pattern: /document\.write\s*\(/i,
        suggestion: "Use métodos DOM seguros como createElement",
        references: ["https://owasp.org/Top10/A07_2021-Cross-Site_Scripting/"],
    },
];

// Additional security rules
const SECURITY_RULES: SecurityRule[] = [
    {
        id: "SEC-CONSOLE-LOG",
        name: "Console.log em produção",
        description: "Console.log pode expor informações sensíveis",
        severity: "low",
        pattern: /console\.(log|debug|info)\s*\(/i,
        suggestion: "Remova console.log ou use logger com níveis",
        references: [],
    },
    {
        id: "SEC-TODO-SECURITY",
        name: "TODO de segurança pendente",
        description: "Comentário indica problema de segurança não resolvido",
        severity: "medium",
        pattern: /\/\/.*TODO.*(?:security|segurança|auth|senha|password)/i,
        suggestion: "Resolva TODOs de segurança antes do deploy",
        references: [],
    },
    {
        id: "SEC-CORS-STAR",
        name: "CORS permissivo",
        description: "CORS configurado para aceitar qualquer origem",
        severity: "medium",
        pattern: /cors\s*\(\s*\)|Access-Control-Allow-Origin.*\*/i,
        suggestion: "Configure CORS para aceitar apenas origens conhecidas",
        references: ["https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS"],
    },
    {
        id: "SEC-JWT-NONE",
        name: "JWT sem algoritmo",
        description: "JWT pode aceitar algoritmo 'none'",
        severity: "high",
        pattern: /algorithms?\s*:\s*\[\s*['"]none['"]/i,
        suggestion: "Especifique algoritmo explícito (RS256, HS256)",
        references: ["https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/"],
    },
    {
        id: "SEC-SENSITIVE-DATA",
        name: "Dados sensíveis expostos",
        description: "Variável com nome sensível pode ser exposta",
        severity: "medium",
        pattern: /(?:return|response|res\.json)\s*\(.*(?:password|ssn|credit_card|cpf)/i,
        suggestion: "Nunca retorne dados sensíveis em responses",
        references: [],
    },
];

export class SecurityAnalyzer extends BaseAnalyzer {
    category = "security" as const;
    name = "Security Analyzer";
    description = "Analisa código em busca de vulnerabilidades OWASP Top 10 e problemas de segurança";

    protected async performAnalysis(content: string, options?: AnalyzerOptions): Promise<void> {
        const lines = content.split("\n");
        const allRules = [...OWASP_RULES, ...SECURITY_RULES];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNum = i + 1;

            for (const rule of allRules) {
                if (rule.pattern.test(line)) {
                    this.addFinding({
                        severity: rule.severity,
                        title: `[${rule.id}] ${rule.name}`,
                        description: rule.description,
                        file: options?.fileName,
                        line: lineNum,
                        code: line.trim(),
                        suggestion: rule.suggestion,
                        references: rule.references,
                    });
                }
            }
        }
    }
}
