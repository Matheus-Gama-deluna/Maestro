# ✅ Checklist de Validação - Especialista em Segurança da Informação

## 🎯 Visão Geral

**Objetivo:** Validar qualidade e completude dos artefatos de segurança gerados pelo especialista.  
 **Score Mínimo:** 85 pontos para aprovação automática  
 **Validação:** Automática via MCP  
 **Frequência:** A cada geração de artefato

## 📋 Critérios de Validação

### 1. Estrutura do Documento (20 pontos)

#### Formato Obrigatório
- [ ] **Frontmatter completo** (3 pontos)
  - [ ] name: specialist-seguranca-informacao
  - [ ] description: Descrição clara do especialista
  - [ ] version: 2.0
  - [ ] framework: progressive-disclosure
  - [ ] architecture: mcp-centric

- [ ] **Seções obrigatórias presentes** (5 pontos)
  - [ ] Sumário Executivo
  - [ ] Autenticação e Autorização
  - [ ] Proteção de Dados
  - [ ] Infraestrutura Segura
  - [ ] Compliance
  - [ ] Monitoramento e Resposta

- [ ] **Progressive disclosure implementado** (4 pontos)
  - [ ] SKILL.md < 500 linhas
  - [ ] Resources em diretórios separados
  - [ ] Referências claras para templates
  - [ ] Links funcionais para recursos

- [ ] **MCP Integration documentado** (4 pontos)
  - [ ] MCP_INTEGRATION.md presente
  - [ ] Funções MCP descritas
  - [ ] Parâmetros documentados
  - [ ] Exemplos de implementação

- [ ] **Templates estruturados** (4 pontos)
  - [ ] Template principal presente
  - [ ] Templates de apoio completos
  - [ ] Placeholders [ ] definidos
  - [ ] Exemplos práticos incluídos

### 2. Conteúdo de Segurança (30 pontos)

#### OWASP Top 10 Coverage (10 pontos)
- [ ] **Broken Access Control** (1 ponto)
  - [ ] RBAC implementado em todas as requests
  - [ ] Validação de autorização
  - [ ] Testes de acesso negativo

- [ ] **Cryptographic Failures** (1 ponto)
  - [ ] TLS 1.3+ configurado
  - [ ] Algoritmos modernos (bcrypt, Argon2)
  - [ ] Gerenciamento seguro de chaves

- [ ] **Injection** (1 ponto)
  - [ ] ORMs utilizados
  - [ ] Prepared statements
  - [ ] Input validation

- [ ] **Insecure Design** (1 ponto)
  - [ ] Threat modeling realizado
  - [ ] Secure-by-default
  - [ ] Principle of least privilege

- [ ] **Security Misconfiguration** (1 ponto)
  - [ ] Servers hardenizados
  - [ ] Defaults removidos
  - [ ] Headers de segurança

- [ ] **Vulnerable Components** (1 ponto)
  - [ ] Scan de dependências
  - [ ] SBOM gerado
  - [ ] Auto-updates configurados

- [ ] **ID & Auth Failures** (1 ponto)
  - [ ] MFA implementado
  - [ ] Password policies
  - [ ] Rate limiting

- [ ] **Software & Data Integrity** (1 ponto)
  - [ ] Code signing
  - [ ] Package verification
  - [ ] Checksums

- [ ] **Logging & Monitoring** (1 ponto)
  - [ ] Logs centralizados
  - [ ] Alerts configurados
  - [ ] SIEM integration

- [ ] **SSRF** (1 ponto)
  - [ ] URL whitelisting
  - [ ] Network segmentation
  - [ ] Input validation

#### Proteção de Dados (10 pontos)
- [ ] **Dados sensíveis mapeados** (3 pontos)
  - [ ] PII identificado
  - [ ] Dados financeiros mapeados
  - [ ] Dados de saúde (se aplicável)

- [ ] **Criptografia implementada** (3 pontos)
  - [ ] Em trânsito (TLS 1.3+)
  - [ ] Em repouso (AES-256)
  - [ ] Gerenciamento de chaves

- [ ] **Masking e Anonimização** (2 pontos)
  - [ ] Logs sem dados sensíveis
  - [ ] UI com masking
  - [ ] Anonimização para analytics

- [ ] **Retention Policies** (2 pontos)
  - [ ] Políticas definidas
  - [ ] Compliance legal
  - [ ] Processo de deleção

#### Compliance Regulatório (10 pontos)
- [ ] **LGPD/GDPR** (4 pontos)
  - [ ] Base legal identificada
  - [ ] Consentimento obtido
  - [ ] Direitos dos titulares
  - [ ] Data officer designado

- [ ] **PCI-DSS** (se aplicável) (3 pontos)
  - [ ] Nível determinado
  - [ ] SAQ preenchido
  - [ ] Validador aprovado

- [ ] **Outros compliance** (3 pontos)
  - [ ] HIPAA (saúde)
  - [ ] BACEN (fintech)
  - [ ] ANS (saúde suplementar)

### 3. Qualidade Técnica (25 pontos)

#### Implementação (10 pontos)
- [ ] **Autenticação robusta** (3 pontos)
  - [ ] MFA configurado
  - [ ] Password policies
  - [ ] Session management

- [ ] **Autorização granular** (3 pontos)
  - [ ] RBAC/ABAC implementado
  - [ ] Principle of least privilege
  - [ ] Segregação de duties

- [ ] **Infraestrutura segura** (4 pontos)
  - [ ] Network segmentation
  - [ ] Firewall rules
  - [ ] WAF configurado
  - [ ] Hardened servers

#### Monitoramento (8 pontos)
- [ ] **Logging completo** (3 pontos)
  - [ ] Eventos de segurança logados
  - [ ] Formato estruturado
  - [ ] Retention adequado

- [ ] **Alerting efetivo** (3 pontos)
  - [ ] Thresholds definidos
  - [ ] Canais configurados
  - [ ] Escalation matrix

- [ ] **Incident Response** (2 pontos)
  - [ ] Plano documentado
  - [ ] Team treinado
  - [ ] Simulações realizadas

#### Supply Chain Security (7 pontos)
- [ ] **Dependências seguras** (3 pontos)
  - [ ] Scan automatizado
  - [ ] Zero HIGH/CRITICAL
  - [ ] Private registry

- [ ] **Build seguro** (2 pontos)
  - [ ] CI/CD seguro
  - [ ] Code signing
  - [ ] Immutable builds

- [ ] **Deploy seguro** (2 pontos)
  - [ ] Segregação de ambientes
  - [ ] Rollback capability
  - [ ] Blue/green deployment

### 4. Documentação e Processos (15 pontos)

#### Documentação (8 pontos)
- [ ] **Checklist completo** (3 pontos)
  - [ ] Todos os itens preenchidos
  - [ ] Evidências fornecidas
  - [ ] Status claro

- [ ] **Threat model** (2 pontos)
  - [ ] Assets identificados
  - [ ] Threats analisadas
  - [ ] Mitigações definidas

- [ ] **Runbooks** (2 pontos)
  - [ ] Incident response
  - [ ] Recovery procedures
  - [ ] Contact information

- [ ] **Arquitetura de segurança** (1 ponto)
  - [ ] Diagrama atualizado
  - [ ] Fluxos de dados
  - [ ] Pontos de controle

#### Processos (7 pontos)
- [ ] **Validação contínua** (3 pontos)
  - [ ] Scans automatizados
  - [ ] Testes de penetração
  - [ ] Code reviews

- [ ] **Treinamento** (2 pontos)
  - [ ] Equipe treinada
  - [ ] Conscientização
  - [ ] Atualizações regulares

- [ ] **Melhoria contínua** (2 pontos)
  - [ ] Lessons learned
  - [ ] Métricas monitoradas
  - [ ] Processos otimizados

### 5. Métricas e Performance (10 pontos)

#### SLO/SLI (5 pontos)
- [ ] **SLIs definidos** (2 pontos)
  - [ ] Métricas relevantes
  - [ ] Fontes de dados
  - [ ] Cálculo claro

- [ ] **SLOs estabelecidos** (2 pontos)
  - [ ] Metas realistas
  - [ ] Error budget
  - [ ] Período definido

- [ ] **Monitoramento ativo** (1 ponto)
  - [ ] Dashboard funcional
  - [ ] Alertas configurados
  - [ ] Relatórios gerados

#### Performance (5 pontos)
- [ ] **Tempo de geração** (2 pontos)
  - [ ] < 40 minutos total
  - [ ] Discovery < 15 min
  - [ ] Validação < 5 min

- [ ] **Qualidade dos artefatos** (2 pontos)
  - [ ] Consistência 100%
  - [ ] Completude 100%
  - [ ] Score ≥ 85

- [ ] **Progressive disclosure** (1 ponto)
  - [ ] 80% redução tokens
  - [ ] Carregamento sob demanda
  - [ ] Performance otimizada

## 📊 Cálculo de Score

### Fórmula
```
Score Final = (Estrutura + Conteúdo + Técnica + Documentação + Métricas) / 5

Onde:
- Estrutura: Máximo 20 pontos
- Conteúdo: Máximo 30 pontos
- Técnica: Máximo 25 pontos
- Documentação: Máximo 15 pontos
- Métricas: Máximo 10 pontos
- Total: Máximo 100 pontos
```

### Níveis de Aprovação
- **✅ Aprovado:** 85-100 pontos
- **⚠️ Requer Ajustes:** 70-84 pontos
- **❌ Reprovado:** < 70 pontos

## 🔧 Validação Automática

### Scripts MCP
```python
async def validate_security_artifact(artifact_path: str) -> dict:
    """Validação automática de artefatos de segurança"""
    
    # 1. Validar estrutura
    structure_score = await validate_structure(artifact_path)
    
    # 2. Validar conteúdo OWASP
    owasp_score = await validate_owasp_coverage(artifact_path)
    
    # 3. Validar compliance
    compliance_score = await validate_compliance(artifact_path)
    
    # 4. Validar implementação técnica
    technical_score = await validate_technical_implementation(artifact_path)
    
    # 5. Validar documentação
    documentation_score = await validate_documentation(artifact_path)
    
    # 6. Validar métricas
    metrics_score = await validate_metrics(artifact_path)
    
    # Calcular score final
    final_score = (
        structure_score * 0.20 +
        owasp_score * 0.30 +
        technical_score * 0.25 +
        documentation_score * 0.15 +
        metrics_score * 0.10
    )
    
    return {
        "final_score": final_score,
        "structure_score": structure_score,
        "owasp_score": owasp_score,
        "technical_score": technical_score,
        "documentation_score": documentation_score,
        "metrics_score": metrics_score,
        "approved": final_score >= 85,
        "recommendations": generate_recommendations(final_score)
    }
```

## 📋 Checklist Rápido

### Validação Mínima (Score 85+)
- [ ] **OWASP Top 10:** 100% coberto
- [ ] **Compliance:** 100% implementado
- [ ] **Autenticação:** MFA + RBAC
- [ ] **Criptografia:** TLS 1.3+ + AES-256
- [ ] **Logging:** Completo e centralizado
- [ ] **Monitoramento:** Alertas ativos
- [ ] **Documentação:** Completa e atualizada
- [ ] **SLO/SLI:** Definidos e monitorados

### Gatilhos de Rejeição Automática
- ❌ Score < 70 pontos
- ❌ Vulnerabilidades HIGH/CRITICAL não mitigadas
- ❌ Compliance não implementado
- ❌ Ausência de MFA para dados sensíveis
- ❌ Criptografia inadequada
- ❌ Logs de segurança ausentes

## 🎯 Melhoria Contínua

### Análise de Resultados
- **Score médio:** Monitorar tendência
- **Itens críticos:** Identificar padrões de falha
- **Recomendações:** Implementar melhorias
- **Feedback:** Coletar dos usuários

### Otimização do Processo
- **Templates:** Melhorar com base em uso
- **Validação:** Automatizar mais verificações
- **Métricas:** Refinar cálculos
- **Documentação:** Manter atualizada

---

**Versão:** 2.0  
**Framework:** Skills Modernas com Progressive Disclosure  
**Status:** ✅ Produção Ready  
**Última atualização:** 2026-01-29