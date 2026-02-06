# Prompt: Análise de Segurança

> **Quando usar**: Antes de ir para produção, ou durante code review
> **Especialista**: Segurança da Informação
> **Nível**: Médio a Complexo

---

## Fluxo de Contexto

Antes de usar este prompt, tenha em mãos:
- `docs/CONTEXTO.md` - Entendimento do projeto
- `docs/05-arquitetura/arquitetura.md` - Arquitetura do sistema
- Código-fonte a analisar (ou descrição técnica)

Após gerar, salve o resultado em:
- `docs/09-seguranca/analise-seguranca.md`

---

## Prompt Completo

```text
Atue como especialista em segurança de aplicações (AppSec).

## Contexto do Projeto

[COLE O CONTEÚDO DE docs/CONTEXTO.md]

## Arquitetura

[DESCREVA A ARQUITETURA - Frontend, Backend, Banco, APIs externas]

## Stack Tecnológica

- Backend: [Framework/Linguagem]
- Frontend: [Framework]
- Banco de dados: [Tipo]
- Autenticação: [Método atual - JWT, Sessions, OAuth]
- Infraestrutura: [Cloud/On-premise]

## Código/Fluxo a Analisar (opcional)

```[LINGUAGEM]
[COLE CÓDIGO ESPECÍFICO SE QUISER ANÁLISE PONTUAL]
```

## Dados Sensíveis no Sistema

- [Liste tipos de dados: PII, financeiros, saúde, etc]

## Compliance Requerido

- [ ] LGPD
- [ ] SOC2
- [ ] PCI-DSS
- [ ] HIPAA
- [ ] Nenhum específico

---

## Sua Missão

Realize uma análise de segurança completa:

### 1. OWASP Top 10 - Análise de Riscos

Para cada item do OWASP Top 10 aplicável:

| # | Vulnerabilidade | Risco no Sistema | Severidade | Mitigação |
|---|-----------------|------------------|------------|-----------|
| A01 | Broken Access Control | [Aplica/Não aplica] | [Crítico/Alto/Médio/Baixo] | [Ação] |
| A02 | Cryptographic Failures | ... | ... | ... |
| A03 | Injection | ... | ... | ... |
| A04 | Insecure Design | ... | ... | ... |
| A05 | Security Misconfiguration | ... | ... | ... |
| A06 | Vulnerable Components | ... | ... | ... |
| A07 | Auth Failures | ... | ... | ... |
| A08 | Data Integrity Failures | ... | ... | ... |
| A09 | Logging Failures | ... | ... | ... |
| A10 | SSRF | ... | ... | ... |

### 2. Autenticação e Autorização

- Método de autenticação atual
- Vulnerabilidades identificadas
- Recomendações:
  - Password policy
  - MFA
  - Session management
  - Token handling (JWT best practices)
  - RBAC/ABAC

### 3. Proteção de Dados

- Dados em repouso (at rest)
  - Criptografia de banco
  - Campos sensíveis
- Dados em trânsito (in transit)
  - TLS/HTTPS
  - Certificate pinning (mobile)
- Dados em uso
  - Mascaramento em logs
  - Sanitização de inputs

### 4. Validação de Input

- Onde inputs são recebidos
- Riscos de injection (SQL, NoSQL, Command, LDAP)
- XSS (Stored, Reflected, DOM-based)
- Recomendações de sanitização

### 5. API Security

- Rate limiting
- API keys / OAuth
- Validação de payloads
- CORS configuration
- Versionamento seguro

### 6. Infraestrutura

- Secrets management
- Network segmentation
- WAF configuration
- Container security (se aplicável)
- Dependency scanning

### 7. Logging e Monitoramento de Segurança

- O que logar para auditoria
- Detecção de ataques
- Alertas de segurança
- Retenção de logs

### 8. Checklist de Hardening

Para cada componente, verificar:
- [ ] Headers de segurança (CSP, HSTS, X-Frame-Options)
- [ ] Desabilitar debug em produção
- [ ] Remover endpoints de desenvolvimento
- [ ] Atualizar dependências
- [ ] Configurar firewall corretamente

### 9. Plano de Resposta a Incidentes

- Passos iniciais ao detectar breach
- Quem notificar
- Como preservar evidências
- Comunicação com usuários (LGPD)

### 10. Priorização de Correções

| Vulnerabilidade | Severidade | Esforço | Prioridade |
|-----------------|------------|---------|------------|
| [Vuln 1] | Crítico | Baixo | ⭐⭐⭐ URGENTE |
| [Vuln 2] | Alto | Médio | ⭐⭐⭐ |
| [Vuln 3] | Médio | Alto | ⭐⭐ |
```

---

## Exemplo de Uso

```text
Atue como especialista em segurança de aplicações (AppSec).

## Contexto do Projeto

Sistema de agendamento para salões de beleza.
Clientes agendam online, dados são armazenados.

## Arquitetura

- Frontend: Next.js na Vercel
- Backend: NestJS na AWS ECS
- Banco: PostgreSQL RDS
- Cache: Redis ElastiCache

## Stack Tecnológica

- Backend: NestJS + TypeScript
- Frontend: Next.js + React
- Banco de dados: PostgreSQL
- Autenticação: JWT armazenado em httpOnly cookie
- Infraestrutura: AWS

## Dados Sensíveis no Sistema

- Nome e telefone de clientes (PII)
- Email dos clientes
- Histórico de agendamentos
- Senhas dos administradores (hash)

## Compliance Requerido

- [x] LGPD
- [ ] SOC2
- [ ] PCI-DSS
- [ ] HIPAA
```

---

## Resposta Esperada (Resumo)

### OWASP Top 10 - Resumo

| # | Vulnerabilidade | Risco | Severidade |
|---|-----------------|-------|------------|
| A01 | Broken Access Control | Alto - Verificar IDOR | Crítico |
| A02 | Cryptographic Failures | Médio - Verificar hash de senhas | Alto |
| A03 | Injection | Baixo - Usando ORM | Médio |
| A07 | Auth Failures | Médio - Verificar brute force | Alto |

### Top 3 Prioridades

1. **IDOR em endpoints** (Crítico, Esforço Baixo)
   - Verificar autorização por recurso
   - Implementar middleware de ownership

2. **Rate Limiting** (Alto, Esforço Baixo)
   - Adicionar limite em /login
   - Adicionar limite em /api/*

3. **Audit Logging** (Médio, Esforço Médio)
   - Logar ações administrativas
   - Logar acessos a dados sensíveis

---

## Checklist Pós-Geração

- [ ] OWASP Top 10 analisado
- [ ] Autenticação e autorização revisadas
- [ ] Proteção de dados mapeada
- [ ] Input validation verificada
- [ ] API security checklist completo
- [ ] Secrets management verificado
- [ ] Logging de segurança configurado
- [ ] Priorização de correções definida
- [ ] LGPD compliance verificado (se aplicável)
- [ ] Salvar em `docs/09-seguranca/analise-seguranca.md`
