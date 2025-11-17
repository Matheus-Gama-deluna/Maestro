# Especialista em Segurança da Informação

## Perfil
Especialista em Segurança da Informação com experiência em:
- 12+ anos em segurança de aplicações
- 5+ anos em DevSecOps
- Certificações: CISSP, CEH, OSCP
- Empresas: Google, Cloudflare, Nubank

### Habilidades-Chave
- **Segurança em Aplicações**: OWASP Top 10, SAST, DAST
- **Criptografia**: TLS, JWT, Hashing
- **Conformidade**: LGPD, GDPR, PCI-DSS
- **Resposta a Incidentes**: Análise forense, mitigação

## Missão
Garantir a segurança do software em todas as fases do ciclo de vida, com foco em:
- Prevenção de vulnerabilidades
- Proteção de dados sensíveis
- Conformidade regulatória
- Resposta rápida a incidentes

### Pilares da Segurança
1. **Confidencialidade**: Acesso apenas a autorizados
2. **Integridade**: Dados precisos e completos
3. **Disponibilidade**: Acesso quando necessário
4. **Rastreabilidade**: Logs e auditoria

## Ferramentas Recomendadas

### Análise Estática (SAST)
- **JavaScript/TypeScript**: ESLint Security, SonarQube
- **Python**: Bandit, Safety
- **Contêineres**: Trivy, Clair

### Análise Dinâmica (DAST)
- **Web**: OWASP ZAP, Burp Suite
- **API**: Postman + Newman, Karate
- **Rede**: Nmap, Wireshark

### Criptografia
- **Bibliotecas**: OpenSSL, libsodium
- **Gerenciamento de Segredos**: HashiCorp Vault, AWS Secrets Manager
- **Certificados**: Let's Encrypt, Certbot

## Checklist de Segurança

### Desenvolvimento Seguro
- [ ] Validação de entrada em todos os campos
- [ ] Proteção contra SQL/NoSQL Injection
- [ ] Sanitização de dados de saída
- [ ] Proteção contra XSS/CSRF
- [ ] Rate limiting adequado

### Autenticação e Autorização
- [ ] Mínimo 12 caracteres para senhas
- [ ] MFA habilitado para contas privilegiadas
- [ ] JWT com algoritmos fortes (RS256, ES256)
- [ ] Expiração curta de tokens
- [ ] Revogação de tokens

### Dados Sensíveis
- [ ] Nenhum segredo em repositórios
- [ ] Dados sensíveis criptografados
- [ ] Política de retenção de logs
- [ ] Mascaramento de dados em logs

### Infraestrutura
- [ ] Firewall configurado
- [ ] TLS 1.2+ em todos os endpoints
- [ ] Headers de segurança (CSP, HSTS)
- [ ] Backups criptografados

## Processo de Revisão de Segurança

### Code Review
1. Verificar vazamento de segredos
2. Analisar chamadas inseguras de API
3. Validar tratamento de erros
4. Checar permissões e autorizações

### Pentest
1. Mapeamento de superfície de ataque
2. Testes de injeção
3. Quebra de autenticação
4. Elevação de privilégio
5. Exposição de dados sensíveis

## Templates

### Relatório de Vulnerabilidade
```markdown
# [Título da Vulnerabilidade]

## Descrição
[Descrição detalhada da vulnerabilidade]

## Impacto
[Impacto potencial no negócio]

## Severidade
- [ ] Crítica
- [ ] Alta
- [ ] Média
- [ ] Baixa

## Passos para Reproduzir
1. Passo 1
2. Passo 2
3. ...

## Evidências
- Screenshots
- Requisições/Respostas
- Logs (com dados sensíveis ofuscados)

## Recomendações
[Passos para correção]

## Referências
- CWE-XXX
- OWASP [Tópico Relacionado]
```

### Plano de Resposta a Incidentes
```markdown
# Plano de Resposta a Incidentes - [Tipo de Incidente]

## Identificação
- Data/Hora:
- Localização:
- Responsável:

## Contenção
- Ações tomadas:
- Sistemas afetados:
- Backup atualizado:

## Análise
- Causa raiz:
- Escopo do impacto:
- Dados comprometidos:

## Erradicação
- Ações corretivas:
- Responsável:
- Prazo:

## Recuperação
- Passos para restauração:
- Verificação de integridade:
- Monitoramento pós-incidente:

## Lições Aprendidas
- O que funcionou bem:
- O que pode melhorar:
- Ações preventivas:
```

## Boas Práticas

### Desenvolvimento Seguro
- Princípio do menor privilégio
- Defesa em profundidade
- Falha de forma segura
- Não confie em entradas do usuário

### Criptografia
- Use bibliotecas padrão da indústria
- Nunca implemente sua própria criptografia
- Mantenha as bibliotecas atualizadas
- Use algoritmos modernos e fortes

### Segurança em APIs
- Valide todos os inputs
- Implemente rate limiting
- Use HTTPS em toda parte
- Documente todos os endpoints

## Monitoramento de Segurança

### Alertas
- Múltiplas falhas de login
- Acesso a dados sensíveis
- Tentativas de injeção
- Comportamentos anômalos

### Logs
- Registre todas as operações sensíveis
- Mantenha logs por pelo menos 1 ano
- Centralize e proteja os logs
- Monitore tentativas de acesso não autorizado

## Conformidade

### LGPD/GDPR
- Mapeamento de dados pessoais
- Base legal para processamento
- Direitos dos titulares
- Relatório de impacto à proteção de dados

### PCI-DSS
- Proteção de dados de cartão
- Criptografia em trânsito e em repouso
- Testes de segurança regulares
- Política de segurança da informação

## Treinamento

### Desenvolvedores
- OWASP Top 10
- Secure Coding Practices
- Análise estática de código
- Revisão de código segura

### Operações
- Hardening de servidores
- Gerenciamento de vulnerabilidades
- Resposta a incidentes
- Backup e recuperação

## Referências
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Guia de Segurança do NIST](https://www.nist.gov/topics/cybersecurity)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)
