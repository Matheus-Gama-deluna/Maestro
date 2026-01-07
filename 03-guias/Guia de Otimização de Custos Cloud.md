# Guia de Otimização de Custos Cloud

> **Prioridade**: 🟢 BAIXA  
> **Aplicável a**: Projetos em produção com custos significativos de cloud

---

## Por que Otimizar?

Cloud custa caro se não for gerenciada. Otimização pode reduzir 20-50% dos custos sem impacto em performance.

---

## Pilares de Otimização

### 1. Right-Sizing

Usar instâncias do tamanho certo para a carga.

| Sinal | Problema | Ação |
|-------|----------|------|
| CPU < 20% constante | Superdimensionado | Diminuir tier |
| CPU > 80% frequente | Subdimensionado | Aumentar ou escalar |
| Memória < 30% usada | Superdimensionado | Diminuir tier |
| Picos curtos, idle longo | Má distribuição | Considerar serverless |

### 2. Reserved Instances / Savings Plans

| Tipo | Desconto | Trade-off |
|------|----------|-----------|
| On-Demand | 0% | Flexibilidade total |
| Reserved 1 ano | 30-40% | Compromisso |
| Reserved 3 anos | 50-60% | Compromisso maior |
| Spot/Preemptible | 60-90% | Pode ser terminado |

**Regra**: Reserve workloads estáveis, on-demand para variáveis.

### 3. Auto-Scaling

```yaml
# Exemplo AWS Auto Scaling
ScalingPolicy:
  - Name: scale-on-cpu
    MetricType: CPUUtilization
    TargetValue: 70
    ScaleInCooldown: 300
    ScaleOutCooldown: 60
```

### 4. Storage Optimization

| Classe | Custo | Uso |
|--------|-------|-----|
| Standard | $$$ | Acesso frequente |
| Infrequent Access | $$ | Acesso mensal |
| Glacier/Archive | $ | Backups, compliance |

**Política de Lifecycle**:
```json
{
  "Rules": [{
    "ID": "ArchiveOldData",
    "Filter": { "Prefix": "logs/" },
    "Transitions": [
      { "Days": 30, "StorageClass": "STANDARD_IA" },
      { "Days": 90, "StorageClass": "GLACIER" }
    ],
    "Expiration": { "Days": 365 }
  }]
}
```

### 5. Database Optimization

| Estratégia | Economia |
|------------|----------|
| Read replicas para leitura | Menos carga no primário |
| Serverless DB (Aurora, PlanetScale) | Paga por uso |
| Indices eficientes | Menos CPU |
| Query optimization | Menos tempo de CPU |
| Connection pooling | Menos instâncias |

### 6. Containerização e Serverless

| Workload | Melhor Opção |
|----------|--------------|
| Carga constante 24/7 | Containers (ECS, GKE) |
| Picos esporádicos | Serverless (Lambda, Cloud Run) |
| Batch jobs | Spot instances + containers |
| APIs leves | Serverless |

---

## Checklist de Auditoria de Custos

### Compute
- [ ] Instâncias idle identificadas e terminadas
- [ ] Right-sizing aplicado baseado em métricas
- [ ] Reserved instances para workloads estáveis
- [ ] Spot instances para workloads tolerantes
- [ ] Auto-scaling configurado corretamente

### Storage
- [ ] Buckets/volumes não utilizados deletados
- [ ] Lifecycle policies configuradas
- [ ] Snapshots antigos removidos
- [ ] EBS volumes orfãos identificados
- [ ] Classe de storage correta por tipo de dado

### Network
- [ ] Data transfer entre regiões minimizado
- [ ] NAT Gateway otimizado (VPC endpoints)
- [ ] CDN para conteúdo estático
- [ ] Endpoints privados quando possível

### Database
- [ ] Instâncias provisionadas corretamente
- [ ] Read replicas só onde necessário
- [ ] Backups retidos pelo tempo correto
- [ ] Queries otimizadas (índices)

---

## Ferramentas de Análise

| Provedor | Ferramenta |
|----------|-----------|
| **AWS** | Cost Explorer, Trusted Advisor, Compute Optimizer |
| **GCP** | Cost Management, Recommender |
| **Azure** | Cost Management, Advisor |
| **Multi-cloud** | Kubecost, CloudHealth, Infracost |

---

## Budget e Alertas

```yaml
# AWS Budget example
Budget:
  Name: MonthlyBudget
  Amount: 5000
  TimeUnit: MONTHLY
  Notifications:
    - ThresholdPercentage: 50
      NotificationType: ACTUAL
      Recipients: [team@company.com]
    - ThresholdPercentage: 80
      NotificationType: ACTUAL
      Recipients: [finance@company.com, team@company.com]
    - ThresholdPercentage: 100
      NotificationType: FORECASTED
      Recipients: [all-hands@company.com]
```

---

## Métricas para Monitorar

| Métrica | Meta |
|---------|------|
| Custo por request | Tendência de queda |
| Custo por usuário | Estável ou queda |
| % de Reserved usage | > 80% |
| Recursos idle | 0 |
| Custo vs Budget | < 100% |

---

## Quick Wins

1. **Desligar ambientes dev/staging fora do horário**
   ```bash
   # Lambda para desligar EC2 à noite
   aws ec2 stop-instances --instance-ids $(filter-dev-instances)
   ```

2. **Tagging para identificar ownership**
   ```yaml
   Tags:
     Environment: production
     Team: backend
     CostCenter: engineering
   ```

3. **Alertas de custo diário**

4. **Revisão mensal de custos** (cerimônia do time)

---

## Referências

- [AWS Well-Architected - Cost Optimization](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/)
- [GCP Cost Optimization](https://cloud.google.com/architecture/framework/cost-optimization)
- [FinOps Foundation](https://www.finops.org/)
