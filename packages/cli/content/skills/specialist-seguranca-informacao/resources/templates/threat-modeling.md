# 🎯 Threat Modeling Template

## 📋 Informações do Projeto

**Nome do Projeto:** [Nome do sistema/aplicação]  
**Versão:** [Versão atual]  
**Data:** [Data de criação]  
**Responsável:** [Nome do analista de segurança]

## 🎯 Assets Críticos

### 1. Dados Sensíveis
- [ ] **Dados Pessoais (PII):** [Listar tipos de dados pessoais]
- [ ] **Dados Financeiros:** [Listar tipos de dados financeiros]
- [ ] **Dados de Saúde:** [Listar tipos de dados de saúde]
- [ ] **Segredos de Negócio:** [Listar informações confidenciais]
- [ ] **Propriedade Intelectual:** [Listar IP do sistema]

### 2. Funcionalidades Críticas
- [ ] **Autenticação:** [Descrição da funcionalidade]
- [ ] **Autorização:** [Descrição da funcionalidade]
- [ ] **Transações Financeiras:** [Descrição da funcionalidade]
- [ ] **Processamento de Dados:** [Descrição da funcionalidade]
- [ ] **Integrações Externas:** [Listar integrações]

### 3. Infraestrutura Chave
- [ ] **Banco de Dados:** [Tipo e localização]
- [ ] **APIs:** [Lista de APIs críticas]
- [ ] **Servidores:** [Lista de servidores críticos]
- [ ] **Rede:** [Topologia de rede]
- [ ] **Storage:** [Sistemas de armazenamento]

## 👥 Threat Agents

### Agentes Internos
- [ ] **Desenvolvedores:** [Nível de acesso e risco]
- [ ] **Administradores:** [Nível de acesso e risco]
- [ ] **Funcionários:** [Nível de acesso e risco]
- [ ] **Contratados:** [Nível de acesso e risco]

### Agentes Externos
- [ ] **Hackers:** [Motivação e capacidade]
- [ ] **Concorrentes:** [Motivação e capacidade]
- [ ] **Nações-Estado:** [Motivação e capacidade]
- [ ] **Criminosos Cibernéticos:** [Motivação e capacidade]

## 🎯 Attack Vectors

### 1. Vetores de Rede
- [ ] **DDoS:** [Descrição e impacto]
- [ ] **Man-in-the-Middle:** [Descrição e impacto]
- [ ] **Packet Sniffing:** [Descrição e impacto]
- [ ] **DNS Poisoning:** [Descrição e impacto]

### 2. Vetores de Aplicação
- [ ] **SQL Injection:** [Descrição e impacto]
- [ ] **XSS:** [Descrição e impacto]
- [ ] **CSRF:** [Descrição e impacto]
- [ ] **Authentication Bypass:** [Descrição e impacto]

### 3. Vetores de Sistema
- [ ] **Malware:** [Descrição e impacto]
- [ ] **Ransomware:** [Descrição e impacto]
- [ ] **Insider Threat:** [Descrição e impacto]
- [ ] **Social Engineering:** [Descrição e impacto]

## 🛡️ Análise de Risco

### Matriz de Risco
| Asset | Threat | Probabilidade | Impacto | Risco | Mitigação |
|-------|--------|---------------|---------|-------|-----------|
| [Asset] | [Ameaça] | [Alta/Média/Baixa] | [Crítico/Alto/Médio/Baixo] | [Score] | [Mitigação] |

### Categorias de Risco
- [ ] **Risco Crítico (9-10):** [Listar riscos críticos]
- [ ] **Risco Alto (7-8):** [Listar riscos altos]
- [ ] **Risco Médio (5-6):** [Listar riscos médios]
- [ ] **Risco Baixo (1-4):** [Listar riscos baixos]

## 🔧 Estratégias de Mitigação

### 1. Controles Preventivos
- [ ] **Autenticação Forte:** [Descrição da implementação]
- [ ] **Criptografia:** [Descrição da implementação]
- [ ] **Firewall:** [Descrição da implementação]
- [ ] **Input Validation:** [Descrição da implementação]

### 2. Controles Detectivos
- [ ] **Logging:** [Descrição da implementação]
- [ ] **Monitoring:** [Descrição da implementação]
- [ ] **IDS/IPS:** [Descrição da implementação]
- [ ] **SIEM:** [Descrição da implementação]

### 3. Controles Corretivos
- [ ] **Incident Response:** [Descrição do plano]
- [ ] **Backup Recovery:** [Descrição do plano]
- [ ] **Patch Management:** [Descrição do plano]
- [ ] **Forensics:** [Descrição do plano]

## 📊 Métricas de Segurança

### Indicadores Chave
- [ ] **MTTD (Mean Time to Detect):** [Valor em horas]
- [ ] **MTTR (Mean Time to Respond):** [Valor em horas]
- [ ] **Number of Incidents:** [Valor mensal]
- [ ] **Security Score:** [Score 0-100]

### SLAs de Segurança
- [ ] **Disponibilidade:** [99.9%]
- [ ] **Tempo de Resposta:** [< 1 hora]
- [ ] **Recuperação:** [< 4 horas]
- [ ] **Falsos Positivos:** [< 5%]

## 🔄 Processo de Revisão

### Frequência de Revisão
- [ ] **Diária:** [Security logs e alerts]
- [ ] **Semanal:** [Vulnerability scans]
- [ ] **Mensal:** [Threat model update]
- [ ] **Trimestral:** [Risk assessment]
- [ ] **Anual:** [Security audit completo]

### Gatilhos de Revisão
- [ ] **Novas funcionalidades:** [Revisar threat model]
- [ ] **Mudanças na infra:** [Revisar controles]
- [ ] **Incidentes:** [Analisar e atualizar]
- [ ] **Novas regulamentações:** [Compliance update]

## 📋 Checklist de Validação

### Validação do Threat Model
- [ ] **Todos os identificados:** [Assets, threats, vulnerabilities]
- [ ] **Risco avaliado:** [Probabilidade e impacto]
- [ ] **Mitigações definidas:** [Para cada risco]
- [ ] **Implementação planejada:** [Timeline e responsáveis]
- [ ] **Métricas definidas:** [KPIs e SLAs]
- [ ] **Processo de revisão:** [Frequência e gatilhos]

### Aprovação
- [ ] **Security Team:** [Assinatura e data]
- [ ] **Development Team:** [Assinatura e data]
- [ ] **Product Owner:** [Assinatura e data]
- [ ] **Compliance Officer:** [Assinatura e data]

## 📚 Referências

### Frameworks
- [ ] **STRIDE:** [Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege]
- [ ] **PASTA:** [Process for Attack Simulation and Threat Analysis]
- [ ] **LINDDUN:** [Linkability, Identifiability, Non-repudiation, Detectability, Disclosure of Information, Unawareness, Non-compliance]

### Ferramentas
- [ ] **Microsoft Threat Modeling Tool:** [Link e versão]
- [ ] **OWASP Threat Dragon:** [Link e versão]
- [ ] **IriusRisk:** [Link e versão]

---

**Score de Validação:** [ ] / 100  
**Status:** [ ] Em Progresso / [ ] Aprovado / [ ] Requer Revisão  
**Próxima Revisão:** [Data]