# 🛡️ Regras de Análise de Segurança (Code Review)

> Estas regras devem ser verificadas manualmente pela IA ao ler arquivos de código, especialmente antes de commits ou deploys.

Baseado no **OWASP Top 10**.

## 🔴 Crítico (Bloqueante)

| ID | Regra | O que buscar (Padrão/Regex) | Correção Sugerida |
| :--- | :--- | :--- | :--- |
| **A01-ADMIN** | **Bypass de Admin** | `isAdmin\s*[=!]=\s*(true\|false)` ou check confiavel só no frontend | Verificar roles apenas no Backend/Token. |
| **A02-SECRET** | **Secret Hardcoded** | `(password\|secret\|key\|token)\s*[:=]\s*['"][^'"]{8,}['"]` | Mover para variáveis de ambiente (`process.env`). |
| **A03-SQLI** | **SQL Injection** | `query\("SELECT ... " + var` (Concatenação direta) | Usar Prepared Statements ou ORM. |
| **A03-EVAL** | **Uso de Eval** | `eval\(` | **Remover**. Usar JSON.parse ou alternativas seguras. |

## 🟠 Alto (Requer Correção)

| ID | Regra | Padrão Visual | Correção |
| :--- | :--- | :--- | :--- |
| **A02-WEAK** | **Criptografia Fraca** | `md5(`, `sha1(` | Usar `bcrypt`, `argon2` ou `SHA-256`. |
| **A07-XSS** | **XSS (HTML Injection)** | `innerHTML =`, `dangerouslySetInnerHTML` | Usar sanitização (DOMPurify) ou textContent. |
| **A01-ID-REF** | **Exposição de ID** | URL com ID incremental `/user/123` sem auth check | Implementar verificação de permissão por recurso. |

## 🟡 Médio (Sugestão de Melhoria)

| ID | Regra | Padrão Visual | Correção |
| :--- | :--- | :--- | :--- |
| **SEC-LOG** | **Log em Produção** | `console.log(` | Remover ou usar `logger.debug()`. |
| **SEC-TODO** | **TODO de Segurança** | `// TODO: security`, `// TODO: fix auth` | Resolver antes do merge. |
| **SEC-CORS** | **CORS Permissivo** | `Access-Control-Allow-Origin: *` | Restringir domínios. |

---

## 🚦 Como Usar

Durante a fase de **Implementação** ou **Refatoração**:

1.  Ao gerar código, faça uma auto-verificação rápida usando esta tabela.
2.  Se encontrar um padrão **Crítico**, corrija imediatamente.
3.  Se encontrar um padrão **Alto**, avise o usuário e sugira a correção.
