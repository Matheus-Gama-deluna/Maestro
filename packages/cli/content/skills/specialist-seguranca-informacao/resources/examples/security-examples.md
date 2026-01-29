# 🔒 Exemplos Práticos - Especialista em Segurança da Informação

## 📋 Input/Output Examples

### Exemplo 1: Sistema E-commerce

#### Input (Contexto do Projeto)
```
Nome: ECommerce Fashion Store
Stack: React + Node.js + MongoDB + AWS
Dados sensíveis: Cartões de crédito, dados pessoais, histórico de compras
Compliance: PCI-DSS, LGPD
Volume: 100k usuários, 10k transações/dia
```

#### Output (Checklist Gerado)
```markdown
# 🔒 Checklist de Segurança - ECommerce Fashion Store

## 📋 Sumário Executivo
- [x] **Problema resolvido:** Loja online com dados sensíveis de clientes
- [x] **Solução proposta:** Arquitetura segura com compliance PCI-DSS e LGPD
- [x] **Impacto esperado:** Redução de 95% em risco de vazamento de dados

## Autenticação e Autorização
- [x] **MFA implementado:** Para admin e checkout
- [x] **Password policies:** Mínimo 12 caracteres, expiração 90 dias
- [x] **Session management:** JWT com refresh token
- [x] **RBAC definido:** Customer, Admin, Super Admin

## Proteção de Dados
- [x] **Dados sensíveis mapeados:** Cartões, PII, histórico
- [x] **Criptografia implementada:** AES-256 em repouso, TLS 1.3 em trânsito
- [x] **Masking em logs:** Números de cartão mascarados
- [x] **Retention policies:** 5 anos para LGPD, 1 ano para logs

## Compliance
- [x] **PCI-DSS:** Nível 4, validação trimestral
- [x] **LGPD:** Consentimento explícito, direito ao esquecimento
- [x] **Audit trails:** Completo para transações financeiras
- [x] **Data residency:** Servidores em Brasil (AWS SA-East-1)

## Score de Validação: 92/100 ✅
```

---

### Exemplo 2: API de Fintech

#### Input (Contexto do Projeto)
```
Nome: Fintech Payments API
Stack: Python + FastAPI + PostgreSQL + Kubernetes
Dados sensíveis: Transações financeiras, dados bancários
Compliance: BACEN, PCI-DSS, LGPD
Volume: 1M transações/dia, 50 instituições parceiras
```

#### Output (Checklist Gerado)
```markdown
# 🔒 Checklist de Segurança - Fintech Payments API

## 📋 Sumário Executivo
- [x] **Problema resolvido:** API de pagamentos com alto volume
- [x] **Solução proposta:** Arquitetura zero-trust com validação BACEN
- [x] **Impacto esperado:** Conformidade 100% com regulamentações

## Autenticação e Autorização
- [x] **MFA implementado:** OAuth 2.0 + MFA para todos os endpoints
- [x] **Password policies:** Políticas de senha para instituições
- [x] **Session management:** Access tokens de 15 minutos
- [x] **RBAC definido:** Instituição, Operador, Auditor, Admin

## Proteção de Dados
- [x] **Dados sensíveis mapeados:** Contas, transações, saldos
- [x] **Criptografia implementada:** HSM para chaves, AES-256 para dados
- [x] **Masking em logs:** Nenhuma informação sensível em logs
- [x] **Retention policies:** 10 anos para BACEN, 5 anos para auditoria

## Infraestrutura Segura
- [x] **Hardened servers:** Containers com security scanning
- [x] **Network segmentation:** DMZ para API, rede isolada para DB
- [x] **Firewall rules:** WAF com regras específicas para fintech
- [x] **WAF configurado:** ModSecurity com OWASP CRS

## Compliance
- [x] **BACEN:** Resolução 4658 implementada
- [x] **PCI-DSS:** Nível 1, validação anual
- [x] **LGPD:** Anonimização após período legal
- [x] **Audit trails:** Imutáveis com blockchain

## Score de Validação: 95/100 ✅
```

---

### Exemplo 3: Sistema de Saúde

#### Input (Contexto do Projeto)
```
Nome: HealthCare Management System
Stack: Angular + Java Spring + Oracle + Azure
Dados sensíveis: Prontuários médicos, exames, histórico
Compliance: LGPD, HIPAA (internacional), ANS
Volume: 500 pacientes, 50 médicos, 10 hospitais
```

#### Output (Checklist Gerado)
```markdown
# 🔒 Checklist de Segurança - HealthCare Management System

## 📋 Sumário Executivo
- [x] **Problema resolvido:** Sistema de gestão hospitalar
- [x] **Solução proposta:** Arquitetura com compliance médico completo
- [x] **Impacto esperado:** Proteção total de dados de saúde

## Autenticação e Autorização
- [x] **MFA implementado:** Para médicos e acesso a prontuários
- [x] **Password policies:** Políticas específicas para saúde
- [x] **Session management:** Timeout de 10 minutos para dados sensíveis
- [x] **RBAC definido:** Paciente, Médico, Enfermeiro, Admin, Auditor

## Proteção de Dados
- [x] **Dados sensíveis mapeados:** Prontuários, exames, prescrições
- [x] **Criptografia implementada:** End-to-end para dados de saúde
- [x] **Masking em logs:** Hash de dados identificáveis
- [x] **Retention policies:** 20 anos (ANS), direito ao esquecimento

## Compliance
- [x] **LGPD:** Consentimento explícito para tratamento
- [x] **HIPAA:** Privacy e Security Rules implementadas
- [x] **ANS:** Resoluções da ANS para dados médicos
- [x] **Audit trails:** Completo para acesso a prontuários

## Monitoramento e Resposta
- [x] **Security logging:** Acesso a prontuários logado
- [x] **Alerting configurado:** Alertas para acesso anômalo
- [x] **Incident response:** Plano específico para vazamento de dados
- [x] **Forensics:** Capacidade de investigação completa

## Score de Validação: 88/100 ✅
```

---

## 🎯 Exemplos de Threat Modeling

### Exemplo 1: API de Pagamentos

#### Assets Identificados
- **Dados:** Números de cartão, CVV, dados de conta
- **Funcionalidades:** Processamento de pagamento, reembolso
- **Infraestrutura:** API Gateway, Database, Payment Processor

#### Threats Principais
- **Carding:** Teste massivo de cartões roubados
- **Man-in-the-Middle:** Interceptação de dados em trânsito
- **SQL Injection:** Acesso não autorizado ao banco
- **DDoS:** Indisponibilidade do serviço

#### Mitigações Implementadas
- **Rate Limiting:** 10 requisições/minuto por IP
- **Tokenization:** Substituição de dados sensíveis
- **WAF:** Bloqueio automático de ataques conhecidos
- **Monitoring:** Alertas em tempo real

---

### Exemplo 2: Sistema de E-commerce

#### Assets Identificados
- **Dados:** PII, histórico de compras, preferências
- **Funcionalidades:** Catálogo, carrinho, checkout
- **Infraestrutura:** Web servers, CDN, Database

#### Threats Principais
- **Data Scraping:** Extração massiva de dados
- **Account Takeover:** Sequestro de contas
- **Price Manipulation:** Alteração de preços
- **Inventory Manipulation:** Manipulação de estoque

#### Mitigações Implementadas
- **CAPTCHA:** Para ações suspeitas
- **Behavioral Analysis:** Detecção de anomalias
- **Data Validation:** Validação rigorosa de inputs
- **Audit Logging:** Registro completo de ações

---

## 📊 Exemplos de SLO/SLI

### Exemplo 1: Sistema Financeiro

#### SLIs Definidos
- **Disponibilidade:** 99.95% uptime
- **Tempo de Detecção:** 5 minutos para fraudes
- **Tempo de Resposta:** 30 minutos para incidentes críticos
- **Taxa de Falsos Positivos:** 2% para detecção de fraude

#### SLOs Estabelecidos
- **Disponibilidade:** 99.9% (error budget: 0.05%)
- **Detecção:** 95% fraudes detectadas em 5 min
- **Resposta:** 90% incidentes resolvidos em 30 min
- **Precisão:** Máximo 2% falsos positivos

---

### Exemplo 2: E-commerce

#### SLIs Definidos
- **Disponibilidade:** 99.9% uptime
- **Tempo de Detecção:** 15 minutos para ataques
- **Tempo de Resposta:** 60 minutos para incidentes
- **Taxa de Falsos Positivos:** 5% para segurança

#### SLOs Estabelecidos
- **Disponibilidade:** 99.9% (error budget: 0.1%)
- **Detecção:** 90% ataques detectados em 15 min
- **Resposta:** 85% incidentes resolvidos em 60 min
- **Precisão:** Máximo 5% falsos positivos

---

## 🛠️ Exemplos de Implementação

### Exemplo 1: Configuração de OWASP Top 10

#### Broken Access Control
```python
# Middleware de autorização
@app.middleware("http")
async def authorize_request(request: Request, call_next):
    # Verificar token JWT
    token = request.headers.get("Authorization")
    if not validate_token(token):
        raise HTTPException(401, "Unauthorized")
    
    # Verificar permissões
    endpoint = request.url.path
    user_role = get_user_role(token)
    if not has_permission(user_role, endpoint):
        raise HTTPException(403, "Forbidden")
    
    response = await call_next(request)
    return response
```

#### Cryptographic Failures
```python
# Configuração de criptografia
from cryptography.fernet import Fernet

class EncryptionService:
    def __init__(self):
        self.key = os.environ.get("ENCRYPTION_KEY")
        self.cipher = Fernet(self.key)
    
    def encrypt_sensitive_data(self, data: str) -> str:
        return self.cipher.encrypt(data.encode()).decode()
    
    def decrypt_sensitive_data(self, encrypted_data: str) -> str:
        return self.cipher.decrypt(encrypted_data.encode()).decode()
```

---

### Exemplo 2: Supply Chain Security

#### Scan de Dependências
```bash
#!/bin/bash
# security-scan.sh

echo "Iniciando scan de segurança..."

# Node.js
npm audit --audit-level moderate
if [ $? -ne 0 ]; then
    echo "Vulnerabilidades encontradas em Node.js"
    exit 1
fi

# Python
pip-audit
if [ $? -ne 0 ]; then
    echo "Vulnerabilidades encontradas em Python"
    exit 1
fi

# Gerar SBOM
syft dir:. -o spdx-json > sbom.json

# Scan de imagem Docker
trivy image --severity HIGH,CRITICAL myapp:latest

echo "Scan concluído com sucesso!"
```

---

## 📈 Exemplos de Métricas

### Dashboard de Segurança
```json
{
  "security_metrics": {
    "availability": {
      "current": "99.95%",
      "slo": "99.9%",
      "status": "healthy"
    },
    "incident_detection": {
      "mttd": "4.2 minutes",
      "slo": "5 minutes",
      "status": "healthy"
    },
    "incident_response": {
      "mttr": "25.3 minutes",
      "slo": "30 minutes",
      "status": "healthy"
    },
    "false_positive_rate": {
      "current": "1.8%",
      "slo": "2%",
      "status": "healthy"
    },
    "vulnerability_coverage": {
      "critical_patches": "98.5%",
      "slo": "95%",
      "status": "healthy"
    }
  }
}
```

---

## 🎓 Aprendizados Práticos

### Do's
- ✅ **Sempre validar** inputs em todas as camadas
- ✅ **Implementar MFA** para acesso a dados sensíveis
- ✅ **Usar rate limiting** para prevenir ataques
- ✅ **Logar eventos** de segurança
- ✅ **Monitorar SLOs** continuamente

### Don'ts
- ❌ **Nunca armazenar** senhas em plaintext
- ❌ **Nunca exibir** dados sensíveis em logs
- ❌ **Nunca ignorar** vulnerabilidades críticas
- ❌ **Nunca confiar** apenas em client-side validation
- ❌ **Nunca usar** algoritmos criptográficos obsoletos

---

**Última atualização:** 2026-01-29  
**Fonte:** Implementações reais em produção  
**Validado:** ✅ Por especialistas em segurança