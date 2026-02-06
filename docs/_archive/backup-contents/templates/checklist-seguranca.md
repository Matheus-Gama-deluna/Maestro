# Checklist de Segurança: [Nome do Sistema]

**Versão:** 1.0  
**Data:** YYYY-MM-DD  
**Responsável:** [Nome]  
**Arquitetura Relacionada:** [Link]

---

## 1. Autenticação

- [ ] Senhas hasheadas com algoritmo seguro (bcrypt/argon2)
- [ ] Política de senha forte implementada (min 8 chars, complexidade)
- [ ] Rate limiting em endpoints de login
- [ ] Bloqueio após N tentativas falhas
- [ ] 2FA disponível (se aplicável)
- [ ] Tokens JWT com expiração curta (< 15 min)
- [ ] Refresh tokens com rotação
- [ ] Logout invalida tokens

---

## 2. Autorização

- [ ] Modelo de autorização definido (RBAC/ABAC)
- [ ] Verificação de permissão em cada endpoint
- [ ] Não há exposição de dados entre usuários
- [ ] Admin separado de user comum
- [ ] Princípio do menor privilégio aplicado

---

## 3. Proteção de Dados

### 3.1 Dados em Trânsito
- [ ] HTTPS obrigatório em produção
- [ ] TLS 1.2+ configurado
- [ ] HSTS habilitado
- [ ] Certificados válidos e atualizados

### 3.2 Dados em Repouso
- [ ] Dados sensíveis criptografados no banco
- [ ] Backups criptografados
- [ ] Chaves de criptografia rotacionadas

### 3.3 Dados Sensíveis
- [ ] PII identificada e mapeada
- [ ] Logs não contêm dados sensíveis
- [ ] Mascaramento em ambientes não-prod
- [ ] LGPD/GDPR compliance (se aplicável)

---

## 4. OWASP Top 10

### A01: Broken Access Control
- [ ] Verificação de autorização lado servidor
- [ ] CORS configurado corretamente
- [ ] Tokens não expostos em URLs

### A02: Cryptographic Failures
- [ ] Algoritmos modernos (AES-256, RSA-2048+)
- [ ] Sem secrets hardcoded
- [ ] Gerenciamento seguro de chaves

### A03: Injection
- [ ] Queries parametrizadas (ORM/prepared statements)
- [ ] Validação de input em todo lugar
- [ ] Sanitização de output (XSS)

### A04: Insecure Design
- [ ] Threat modeling realizado
- [ ] Princípios de segurança desde o design
- [ ] Revisão de segurança em features críticas

### A05: Security Misconfiguration
- [ ] Headers de segurança (Helmet)
- [ ] Versões atualizadas de dependências
- [ ] Debug desabilitado em prod
- [ ] Ports desnecessárias fechadas

### A06: Vulnerable Components
- [ ] Dependências auditadas regularmente
- [ ] Alertas de segurança configurados (Dependabot/Snyk)
- [ ] Processo de atualização definido

### A07: Identification and Authentication Failures
- [ ] Políticas de senha adequadas
- [ ] Proteção contra brute force
- [ ] Session management seguro

### A08: Software and Data Integrity Failures
- [ ] Verificação de integridade em dependências
- [ ] CI/CD seguro
- [ ] Assinatura de código (se aplicável)

### A09: Security Logging and Monitoring
- [ ] Logs de eventos de segurança
- [ ] Alertas para eventos suspeitos
- [ ] Retenção adequada de logs
- [ ] Logs protegidos contra tampering

### A10: Server-Side Request Forgery
- [ ] URLs externas validadas
- [ ] Whitelist de domínios permitidos
- [ ] Metadados de cloud bloqueados

---

## 5. Infraestrutura

- [ ] Firewall configurado
- [ ] Grupos de segurança restritivos
- [ ] Acesso SSH restrito (bastion/chave)
- [ ] Secrets em vault (não em env vars plain)
- [ ] Containers rodando como non-root
- [ ] Imagens base atualizadas

---

## 6. API Security

- [ ] Rate limiting implementado
- [ ] Validação de Content-Type
- [ ] Tamanho máximo de payload definido
- [ ] Timeout de requisições
- [ ] CORS restritivo
- [ ] API keys rotacionadas

---

## 7. Riscos de IA (se aplicável)

- [ ] Inputs de usuário não vão direto para LLM
- [ ] Proteção contra prompt injection
- [ ] Dados sensíveis não enviados para AI externa
- [ ] Output de IA validado antes de uso
- [ ] Logs de AI não contêm PII

---

## 8. Testes de Segurança

- [ ] SAST configurado no CI (Semgrep/CodeQL)
- [ ] DAST em staging (OWASP ZAP)
- [ ] Dependency scanning
- [ ] Pentest realizado (para sistemas críticos)

---

## 9. Resposta a Incidentes

- [ ] Plano de resposta documentado
- [ ] Contatos de emergência definidos
- [ ] Processo de rollback testado
- [ ] Comunicação com usuários planejada

---

## Resumo de Status

| Categoria | Checados | Total | % |
|---|---|---|---|
| Autenticação | /8 | 8 | % |
| Autorização | /5 | 5 | % |
| Dados | /12 | 12 | % |
| OWASP | /20 | 20 | % |
| Infra | /7 | 7 | % |
| API | /6 | 6 | % |
| IA | /5 | 5 | % |
| Testes | /4 | 4 | % |
| **TOTAL** | | 67 | % |

---

## Changelog

| Versão | Data | Autor | Mudanças |
|---|---|---|---|
| 1.0 | YYYY-MM-DD | [Nome] | Versão inicial |
