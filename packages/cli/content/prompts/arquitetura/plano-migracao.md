# Prompt: Plano de Migração

> **Quando usar:** Planejar migração de sistemas legados ou modernização  
> **Especialista:** Migração e Modernização  
> **Nível:** Complexo  
> **Pré-requisitos:** Sistema legado identificado, target architecture definida

---

## Fluxo de Contexto
**Inputs:** Sistema legado, arquitetura target, requisitos de negócio  
**Outputs:** Plano de migração detalhado, estratégia Strangler Fig, roadmap  
**Especialista anterior:** Arquitetura Avançada  
**Especialista seguinte:** DevOps e Infraestrutura

---

## Prompt Completo

Atue como um **Modernization Specialist** com experiência em migração de sistemas legados usando padrões como Strangler Fig, zero-downtime migrations e modernização incremental.

## Contexto da Migração
[COLE INFORMAÇÕES SOBRE SISTEMA LEGADO]

[COLE ARQUITETURA TARGET DEFINIDA]

[COLE REQUISITOS DE NEGÓCIO]

## Sua Missão
Criar um **plano de migração completo** que permita modernizar o sistema legado de forma segura, incremental e com mínimo impacto nos usuários, seguindo padrões estabelecidos de migração.

### Metodologia de Migração

#### 1. Análise do Sistema Legado
- **Arquitetura atual:** [Tecnologias, padrões, dependências]
- **Complexidade:** [Número de módulos, integrações, dados]
- **Riscos:** [Técnicos, de negócio, operacionais]
- **Oportunidades:** [Melhorias possíveis]

#### 2. Definição da Estratégia
- **Approach:** [Strangler Fig, Big Bang, Phased]
- **Timeline:** [Duração estimada, fases]
- **Resources:** [Equipe necessária, orçamento]
- **Success Criteria:** [Métricas de sucesso]

#### 3. Planejamento Detalhado
- **Phase breakdown:** [Fases detalhadas]
- **Dependency mapping:** [Mapeamento de dependências]
- **Risk mitigation:** [Mitigação de riscos]
- **Rollback strategy:** [Plano de reversão]

#### 4. Implementação
- **Proof of concept:** [PoC inicial]
- **Incremental delivery:** [Entregas incrementais]
- **Testing strategy:** [Estratégia de testes]
- **Monitoring:** [Monitoramento durante migração]

#### 5. Pós-Migração
- **Decommission:** [Desativação do legado]
- **Optimization:** [Otimizações pós-migração]
- **Documentation:** [Documentação atualizada]
- **Training:** [Treinamento da equipe]

### Template de Plano de Migração

#### 1. Visão Geral
```markdown
# Plano de Migração: [Nome do Sistema]

## Executive Summary
- **System:** [Nome do sistema legado]
- **Target:** [Arquitetura target]
- **Timeline:** [Duração total]
- **Budget:** [Orçamento estimado]
- **Business Impact:** [Impacto no negócio]

## Current State Analysis
### Sistema Legado
- **Technology Stack:** [Tecnologias atuais]
- **Architecture:** [Arquitetura atual]
- **Data Volume:** [Volume de dados]
- **Active Users:** [Usuários ativos]
- **Dependencies:** [Dependências externas]
- **Known Issues:** [Problemas conhecidos]

### Pain Points
- **Performance:** [Issues de performance]
- **Scalability:** [Limites de escalabilidade]
- **Maintenance:** [Dificuldades de manutenção]
- **Security:** [Vulnerabilidades]
- **Cost:** [Custos operacionais]

## Target State
### Nova Arquitetura
- **Technology Stack:** [Novas tecnologias]
- **Architecture Pattern:** [Padrões arquiteturais]
- **Infrastructure:** [Infraestrutura target]
- **Data Strategy:** [Estratégia de dados]
- **Security Model:** [Modelo de segurança]

### Benefits Expected
- **Performance:** [Melhorias esperadas]
- **Scalability:** [Capacidade de escala]
- **Cost Reduction:** [Redução de custos]
- **Developer Experience:** [Melhorias para dev]
- **Business Agility:** [Agilidade de negócio]
```

#### 2. Estratégia de Migração
```markdown
## Migration Strategy

### Approach Selection
**Stranger Fig Pattern** selecionado porque:
- Permite migração incremental
- Minimiza riscos
- Mantém sistema operacional
- Facilita rollback

### Migration Pattern
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Legacy System │◄──►│   New System    │◄──►│  Full Migration  │
│   (100%)        │    │   (Growing)     │    │   (100%)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
      ▲                       ▲                       ▲
      │                       │                       │
┌─────┴─────┐         ┌─────┴─────┐         ┌─────┴─────┐
│  Router   │         │  Router   │         │  Router   │
│  (Proxy)  │         │  (Proxy)  │         │  (Proxy)  │
└───────────┘         └───────────┘         └───────────┘
```

### Phased Approach
**Phase 1:** Proof of Concept (2 meses)
**Phase 2:** Core Migration (6 meses)
**Phase 3:** Feature Migration (8 meses)
**Phase 4:** Data Migration (4 meses)
**Phase 5:** Decommission (2 meses)

### Success Criteria
- **Zero downtime:** [Meta de uptime]
- **Data integrity:** [100% integridade]
- **Performance:** [Métricas alvo]
- **User satisfaction:** [Score mínimo]
- **Cost targets:** [Orçamento cumprido]
```

#### 3. Análise Detalhada
```markdown
## Detailed Analysis

### Component Mapping
| Legacy Component | Target Component | Complexity | Priority | Risk |
|-------------------|-------------------|------------|----------|------|
| Authentication | OAuth 2.0 + JWT | Medium | High | Low |
| User Management | User Service | High | High | Medium |
| Payment Gateway | Payment Service | High | Critical | High |
| Reporting | Analytics Service | Medium | Medium | Low |
| Notifications | Notification Service | Low | Low | Low |

### Data Migration Strategy
```sql
-- Legacy Database Analysis
Tables:
- users (50K records, 5MB)
- orders (200K records, 50MB)
- products (10K records, 2MB)
- transactions (1M records, 200MB)

Migration Approach:
1. Full sync for static data (products)
2. Incremental sync for transactional data
3. Cut-over with final sync
4. Validation and reconciliation
```

### Integration Points
- **External APIs:** [Lista de APIs externas]
- **Message Queues:** [Filas de mensagem]
- **File Storage:** [Armazenamento de arquivos]
- **Third-party Services:** [Serviços terceiros]
- **Internal Systems:** [Sistemas internos]

### Risk Assessment
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Data loss | Low | Critical | Multiple backups, validation |
| Performance degradation | Medium | High | Load testing, monitoring |
| User resistance | Medium | Medium | Training, communication |
| Budget overrun | High | Medium | Phased approach, contingency |
| Technical debt | High | Low | Code reviews, refactoring |
```

#### 4. Plano de Implementação
```markdown
## Implementation Plan

### Phase 1: Proof of Concept (Months 1-2)
**Objectives:**
- Validar arquitetura target
- Testar migração de dados
- Provar performance
- Identificar blockers

**Activities:**
- [ ] Setup ambiente target
- [ ] Implementar core service (Authentication)
- [ ] Migrar subset de dados (1%)
- [ ] Performance testing
- [ ] Security validation

**Deliverables:**
- PoC funcionando
- Performance benchmarks
- Risk assessment atualizado
- Lessons learned

**Success Criteria:**
- Performance > 2x legado
- Data integrity 100%
- Security compliance
- Stakeholder approval

### Phase 2: Core Migration (Months 3-8)
**Objectives:**
- Migrar funcionalidades críticas
- Implementar Strangler Fig router
- Estabelecer pipeline CI/CD
- Treinar equipe

**Activities:**
- [ ] Implementar router/proxy
- [ ] Migrar Authentication service
- [ ] Migrar User Management
- [ ] Migrar core business logic
- [ ] Setup monitoring e alerting
- [ ] Implementar rollback procedures

**Deliverables:**
- Router funcionando
- Core services migrados
- CI/CD pipeline
- Monitoring dashboard
- Team training completed

**Success Criteria:**
- 50% do tráfego no novo sistema
- Zero downtime incidents
- Performance targets met
- Team proficient with new stack

### Phase 3: Feature Migration (Months 9-16)
**Objectives:**
- Migrar funcionalidades restantes
- Otimizar performance
- Implementar features novas
- Decommission components legados

**Activities:**
- [ ] Migrar Reporting system
- [ ] Migrar Notifications
- [ ] Migrar Analytics
- [ ] Implementar caching
- [ ] Add new features
- [ ] Remove legacy components

**Deliverables:**
- Todas features migradas
- Performance otimizada
- New features implementadas
- Legacy components removidos
- Documentation atualizada

**Success Criteria:**
- 100% do tráfego no novo sistema
- Performance 3x legado
- New features delivering value
- Legacy system < 10% usage

### Phase 4: Data Migration (Months 17-20)
**Objectives:**
- Migrar 100% dos dados
- Validar integridade
- Otimizar performance de dados
- Implementar backup strategy

**Activities:**
- [ ] Full data migration
- [ ] Data validation e reconciliation
- [ ] Performance optimization
- [ ] Backup e recovery procedures
- [ ] Data archiving strategy

**Deliverables:**
- 100% dados migrados
- Validation reports
- Backup procedures
- Recovery playbooks
- Data governance docs

**Success Criteria:**
- 100% data integrity
- RTO < 1 hora
- RPO < 15 minutos
- Compliance audit passed

### Phase 5: Decommission (Months 21-22)
**Objectives:**
- Desativar sistema legado
- Mover recursos restantes
- Documentar lições aprendidas
- Celebrar sucesso

**Activities:**
- [ ] Final cut-over
- [ ] Decommission legacy servers
- [ ] Archive legacy code
- [ ] Update documentation
- [ ] Team retrospective

**Deliverables:**
- Legacy system desativado
- Resources liberados
- Final documentation
- Success report
- Lessons learned

**Success Criteria:**
- Legacy system 100% desativado
- Cost savings realized
- Team satisfaction high
- Stakeholders delighted
```

#### 5. Plano de Dados
```markdown
## Data Migration Plan

### Data Classification
| Data Type | Volume | Criticality | Migration Strategy |
|-----------|--------|------------|-------------------|
| Master Data | 10MB | High | Full sync |
| Transactional | 200MB | Critical | Incremental |
| Historical | 500MB | Medium | Batch |
| Logs | 2GB | Low | Archive |
| Temp | 100MB | Low | Skip |

### Migration Tools
```python
# Data Migration Script Example
class DataMigrator:
    def __init__(self, legacy_db, target_db):
        self.legacy_db = legacy_db
        self.target_db = target_db
    
    def migrate_users(self):
        """Migrate users with validation"""
        # Extract from legacy
        users = self.legacy_db.query("SELECT * FROM users")
        
        # Transform
        transformed_users = []
        for user in users:
            transformed = {
                'id': str(user['id']),
                'email': user['email'].lower().strip(),
                'name': user['name'].title(),
                'created_at': user['created_date'],
                'updated_at': datetime.now()
            }
            transformed_users.append(transformed)
        
        # Load to target
        self.target_db.bulk_insert('users', transformed_users)
        
        # Validate
        self.validate_user_migration()
    
    def validate_user_migration(self):
        """Validate data integrity"""
        legacy_count = self.legacy_db.count('users')
        target_count = self.target_db.count('users')
        
        if legacy_count != target_count:
            raise Exception(f"Count mismatch: {legacy_count} vs {target_count}")
        
        # Sample validation
        sample_legacy = self.legacy_db.query("SELECT * FROM users LIMIT 10")
        sample_target = self.target_db.query("SELECT * FROM users LIMIT 10")
        
        for legacy, target in zip(sample_legacy, sample_target):
            assert legacy['email'] == target['email']
            assert legacy['name'] == target['name']
```

### Validation Strategy
```python
# Data Validation Framework
class DataValidator:
    def __init__(self, legacy_db, target_db):
        self.legacy_db = legacy_db
        self.target_db = target_db
        self.validation_results = []
    
    def validate_all_tables(self):
        """Validate all migrated tables"""
        tables = ['users', 'orders', 'products', 'transactions']
        
        for table in tables:
            result = self.validate_table(table)
            self.validation_results.append(result)
    
    def validate_table(self, table_name):
        """Validate specific table"""
        legacy_count = self.legacy_db.count(table_name)
        target_count = self.target_db.count(table_name)
        
        result = {
            'table': table_name,
            'legacy_count': legacy_count,
            'target_count': target_count,
            'match': legacy_count == target_count,
            'issues': []
        }
        
        if not result['match']:
            result['issues'].append(f"Count mismatch: {legacy_count} vs {target_count}")
        
        # Sample validation
        sample_size = min(100, legacy_count)
        sample_legacy = self.legacy_db.query(f"SELECT * FROM {table_name} LIMIT {sample_size}")
        sample_target = self.target_db.query(f"SELECT * FROM {table_name} LIMIT {sample_size}")
        
        for i, (legacy, target) in enumerate(zip(sample_legacy, sample_target)):
            if not self.records_match(legacy, target, table_name):
                result['issues'].append(f"Record {i} mismatch")
        
        return result
```

### Rollback Strategy
```python
# Rollback Procedures
class RollbackManager:
    def __init__(self):
        self.checkpoints = []
    
    def create_checkpoint(self, name):
        """Create migration checkpoint"""
        checkpoint = {
            'name': name,
            'timestamp': datetime.now(),
            'data_backup': self.backup_target_data(),
            'config_backup': self.backup_config(),
            'router_config': self.backup_router_config()
        }
        self.checkpoints.append(checkpoint)
        return checkpoint
    
    def rollback_to_checkpoint(self, checkpoint_name):
        """Rollback to specific checkpoint"""
        checkpoint = next(c for c in self.checkpoints if c['name'] == checkpoint_name)
        
        # Restore data
        self.restore_data(checkpoint['data_backup'])
        
        # Restore config
        self.restore_config(checkpoint['config_backup'])
        
        # Restore router
        self.restore_router(checkpoint['router_config'])
        
        # Validate rollback
        self.validate_rollback()
```
```

#### 6. Monitoramento e Testes
```markdown
## Monitoring and Testing Strategy

### Migration Monitoring
```yaml
# Monitoring Dashboard
metrics:
  - migration_progress:
      description: "Percentage of migration completed"
      target: "> 95%"
      
  - system_health:
      description: "Overall system health"
      target: "> 99%"
      
  - data_integrity:
      description: "Data validation results"
      target: "100%"
      
  - performance_comparison:
      description: "New vs Legacy performance"
      target: "> 2x"
      
  - error_rate:
      description: "Error rate during migration"
      target: "< 0.1%"
      
alerts:
  - high_error_rate:
      condition: "error_rate > 1%"
      action: "Pause migration, investigate"
      
  - data_validation_failure:
      condition: "data_integrity < 100%"
      action: "Stop migration, rollback"
      
  - performance_degradation:
      condition: "performance < 1x legacy"
      action: "Investigate bottleneck"
```

### Testing Strategy
```python
# Migration Testing Framework
class MigrationTestSuite:
    def __init__(self):
        self.test_results = []
    
    def run_all_tests(self):
        """Run complete test suite"""
        tests = [
            self.test_data_integrity,
            self.test_performance,
            self.test_security,
            self.test_functionality,
            self.test_rollback
        ]
        
        for test in tests:
            result = test()
            self.test_results.append(result)
    
    def test_data_integrity(self):
        """Test data integrity"""
        # Test 1: Count validation
        legacy_count = self.legacy_db.count_all()
        target_count = self.target_db.count_all()
        
        assert legacy_count == target_count, f"Count mismatch: {legacy_count} vs {target_count}"
        
        # Test 2: Sample validation
        sample_validation = self.validate_sample_data(1000)
        assert sample_validation['match_rate'] > 0.99, "Sample validation failed"
        
        return {'test': 'data_integrity', 'status': 'passed', 'details': sample_validation}
    
    def test_performance(self):
        """Test performance comparison"""
        # Test legacy system
        legacy_time = self.benchmark_legacy_system()
        
        # Test new system
        new_time = self.benchmark_new_system()
        
        # Assert improvement
        improvement = legacy_time / new_time
        assert improvement > 2.0, f"Performance improvement insufficient: {improvement}x"
        
        return {
            'test': 'performance',
            'status': 'passed',
            'legacy_time': legacy_time,
            'new_time': new_time,
            'improvement': improvement
        }
```

### Automated Testing Pipeline
```yaml
# CI/CD Pipeline for Migration
stages:
  - pre_migration_tests:
      - unit_tests
      - integration_tests
      - security_scan
      
  - migration_execution:
      - backup_data
      - run_migration
      - validate_migration
      
  - post_migration_tests:
      - smoke_tests
      - performance_tests
      - user_acceptance_tests
      
  - rollback_tests:
      - test_rollback_procedures
      - validate_rollback_state
```
```

#### 7. Comunicação e Gestão
```markdown
## Communication and Change Management

### Stakeholder Management
| Stakeholder | Interest | Influence | Communication Strategy |
|-------------|----------|-----------|---------------------|
| Business Owners | ROI, Features | High | Weekly updates, demos |
| Development Team | Technical details | High | Daily standups, technical reviews |
| Operations Team | Stability, Uptime | Medium | Migration schedule, downtime |
| End Users | Features, Performance | Low | Training, user guides |
| Management | Budget, Timeline | High | Executive summaries, risk reports |

### Communication Plan
**Phase 1 (PoC):**
- Weekly stakeholder updates
- Technical reviews with dev team
- Risk assessments with management

**Phase 2 (Core Migration):**
- Daily standups with dev team
- Weekly business reviews
- Monthly executive summaries

**Phase 3 (Feature Migration):**
- Bi-weekly stakeholder demos
- User feedback sessions
- Performance reports

**Phase 4 (Data Migration):**
- Daily data validation reports
- Weekly business impact analysis
- User acceptance testing results

**Phase 5 (Decommission):**
- Final success report
- Lessons learned documentation
- Celebration event

### Risk Management
```markdown
## Risk Management Plan

### High-Risk Items
1. **Data Loss**
   - Probability: Low
   - Impact: Critical
   - Mitigation: Multiple backups, validation, rollback procedures

2. **Performance Degradation**
   - Probability: Medium
   - Impact: High
   - Mitigation: Load testing, monitoring, optimization

3. **Budget Overrun**
   - Probability: High
   - Impact: Medium
   - Mitigation: Phased approach, contingency planning

4. **Team Resistance**
   - Probability: Medium
   - Impact: Medium
   - Mitigation: Training, involvement, communication

### Contingency Planning
**Budget Contingency:** 20% of estimated budget
**Timeline Buffer:** 25% additional time
**Resource Buffer:** 2 extra team members
**Rollback Plan:** Immediate rollback capability for each phase
```

### Success Metrics
```markdown
## Success Metrics and KPIs

### Technical Metrics
- **Migration Progress:** % of components migrated
- **Data Integrity:** % of data successfully migrated
- **Performance Improvement:** Speed improvement over legacy
- **System Availability:** Uptime during migration
- **Error Rate:** % of failed operations

### Business Metrics
- **User Satisfaction:** Survey scores
- **Feature Adoption:** Usage of new features
- **Cost Reduction:** Operational cost savings
- **Revenue Impact:** Business value generated
- **Time to Market:** Speed of delivering new features

### Project Metrics
- **Budget Variance:** Actual vs planned budget
- **Timeline Adherence:** On-time delivery
- **Quality Metrics:** Defect density, test coverage
- **Team Productivity:** Velocity, throughput
- **Stakeholder Satisfaction:** Feedback scores
```

## Resposta Esperada

### Estrutura da Resposta
1. **Análise completa** do sistema legado e target
2. **Estratégia de migração** bem definida e justificada
3. **Plano detalhado** com fases e atividades
4. **Plano de dados** com validação e rollback
5. **Estratégia de testes** e monitoramento
6. **Plano de comunicação** e gestão de mudanças

### Formato
- **Markdown** com estrutura clara
- **Mermaid diagrams** para visualizações
- **Code blocks** para exemplos
- **Tables** para organização
- **Checklists** para validação

## Checklist Pós-Geração

### Validação do Plano
- [ ] **Análise completa** do sistema atual
- [ ] **Target architecture** bem definida
- [ ] **Estratégia selecionada** é apropriada
- [ ] **Riscos identificados** com mitigação
- [ ] **Timeline realista** e alcançável

### Qualidade da Execução
- [ ] **Fases bem definidas** com deliverables
- [ ] **Dependencies mapeadas** corretamente
- [ ] **Testes abrangentes** planejados
- [ ] **Monitoramento adequado** configurado
- [ ] **Comunicação efetiva** planejada

### Implementação
- [ ] **Criar** documentação em `docs/`
- [ ] **Compartilhar** com stakeholders
- [ ] **Obter aprovação** executiva
- [ ] **Setup ferramentas** de monitoramento
- [ ] **Treinar equipe** no plano

---

## Notas Adicionais

### Best Practices
- **Incremental approach:** Migração gradual para reduzir riscos
- **Data-first:** Priorizar integridade dos dados
- **User-centric:** Focar em experiência do usuário
- **Automation:** Automatizar tudo que for possível
- **Communication:** Comunicação clara e frequente

### Armadilhas Comuns
- **Big bang migration:** Muito arriscado
- **Poor testing:** Testes insuficientes
- **Ignoring users:** Não considerar impacto nos usuários
- **Underestimating complexity:** Subestimar esforço necessário
- **Poor planning:** Planejamento inadequado

### Ferramentas Recomendadas
- **Migration Tools:** AWS DMS, Azure Migrate, Google Cloud Migrate
- **Monitoring:** Datadog, New Relic, Grafana
- **Testing:** Selenium, Cypress, JUnit
- **Documentation:** Confluence, GitBook
- **Project Management:** Jira, Linear, Asana
