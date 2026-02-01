# Prompt: Deploy Kubernetes

> **Quando usar**: Projetos de nível Complexo que precisam de orquestração
> **Especialista**: [DevOps e Infraestrutura](../../02-especialistas/Especialista%20em%20DevOps%20e%20Infraestrutura.md)
> **Nível**: Complexo

---

## Fluxo de Contexto

Antes de usar este prompt, tenha em mãos:
- `docs/CONTEXTO.md` - Entendimento do projeto
- `docs/05-arquitetura/arquitetura.md` - Arquitetura e componentes
- `docker-compose.yml` ou Dockerfiles existentes

Após gerar, salve o resultado em:
- `k8s/` - Diretório com manifests
- `helm/` - Diretório com chart Helm (se aplicável)

---

## Prompt Completo

```text
Atue como especialista em Kubernetes e orquestração de containers.

## Contexto do Projeto

[COLE O CONTEÚDO DE docs/CONTEXTO.md]

## Arquitetura de Serviços

- Serviços: [Liste todos os serviços/microserviços]
- Dependências: [Bancos, caches, filas]
- Tráfego esperado: [requests/segundo aproximado]

## Ambiente Kubernetes

- Provedor: [EKS/GKE/AKS/On-premise/k3s]
- Namespaces: [estrutura desejada]
- Ingress controller: [nginx/traefik/ALB]
- Cert-manager: [Sim/Não]

## Requisitos

- Réplicas mínimas: [número]
- Autoscaling: [Sim/Não, critérios]
- Recursos por pod: [limites de CPU/memória]
- Secrets management: [External Secrets/Vault/nativo]
- Persistência: [volumes necessários]

---

## Sua Missão

Gere manifests Kubernetes completos:

### 1. Estrutura de Diretórios

```
k8s/
├── base/
│   ├── namespace.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── configmap.yaml
│   └── kustomization.yaml
├── overlays/
│   ├── staging/
│   │   ├── kustomization.yaml
│   │   └── patches/
│   └── production/
│       ├── kustomization.yaml
│       └── patches/
```

### 2. Namespace

```yaml
# k8s/base/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: [app-name]
  labels:
    app: [app-name]
    environment: [env]
```

### 3. Deployment

```yaml
# k8s/base/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: [app-name]
  namespace: [namespace]
  labels:
    app: [app-name]
spec:
  replicas: 2
  selector:
    matchLabels:
      app: [app-name]
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: [app-name]
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3000"
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      containers:
        - name: [app-name]
          image: [registry]/[image]:[tag]
          imagePullPolicy: Always
          ports:
            - containerPort: 3000
              name: http
          env:
            - name: NODE_ENV
              value: "production"
            - name: DB_HOST
              valueFrom:
                secretKeyRef:
                  name: [app-name]-secrets
                  key: db-host
          envFrom:
            - configMapRef:
                name: [app-name]-config
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          livenessProbe:
            httpGet:
              path: /health
              port: http
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /ready
              port: http
            initialDelaySeconds: 5
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3
          volumeMounts:
            - name: tmp
              mountPath: /tmp
      volumes:
        - name: tmp
          emptyDir: {}
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchLabels:
                    app: [app-name]
                topologyKey: kubernetes.io/hostname
```

### 4. Service

```yaml
# k8s/base/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: [app-name]
  namespace: [namespace]
spec:
  type: ClusterIP
  selector:
    app: [app-name]
  ports:
    - port: 80
      targetPort: http
      protocol: TCP
      name: http
```

### 5. Ingress

```yaml
# k8s/base/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: [app-name]
  namespace: [namespace]
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
spec:
  tls:
    - hosts:
        - [domain]
      secretName: [app-name]-tls
  rules:
    - host: [domain]
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: [app-name]
                port:
                  number: 80
```

### 6. ConfigMap

```yaml
# k8s/base/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: [app-name]-config
  namespace: [namespace]
data:
  LOG_LEVEL: "info"
  API_TIMEOUT: "30000"
  FEATURE_FLAGS: |
    {
      "newFeature": false
    }
```

### 7. Secrets (template)

```yaml
# k8s/base/secrets.yaml (NÃO commitar valores reais!)
apiVersion: v1
kind: Secret
metadata:
  name: [app-name]-secrets
  namespace: [namespace]
type: Opaque
stringData:
  db-host: "PLACEHOLDER"
  db-password: "PLACEHOLDER"
  api-key: "PLACEHOLDER"
```

### 8. HorizontalPodAutoscaler

```yaml
# k8s/base/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: [app-name]
  namespace: [namespace]
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: [app-name]
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Pods
          value: 2
          periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
```

### 9. PodDisruptionBudget

```yaml
# k8s/base/pdb.yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: [app-name]
  namespace: [namespace]
spec:
  minAvailable: 1
  selector:
    matchLabels:
      app: [app-name]
```

### 10. NetworkPolicy

```yaml
# k8s/base/networkpolicy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: [app-name]
  namespace: [namespace]
spec:
  podSelector:
    matchLabels:
      app: [app-name]
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - protocol: TCP
          port: 3000
  egress:
    - to:
        - namespaceSelector: {}
      ports:
        - protocol: TCP
          port: 5432  # PostgreSQL
    - to:
        - namespaceSelector: {}
          podSelector:
            matchLabels:
              app: redis
```

### 11. Kustomization

```yaml
# k8s/base/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: [app-name]

resources:
  - namespace.yaml
  - deployment.yaml
  - service.yaml
  - ingress.yaml
  - configmap.yaml
  - hpa.yaml
  - pdb.yaml
  - networkpolicy.yaml

commonLabels:
  app.kubernetes.io/name: [app-name]
  app.kubernetes.io/managed-by: kustomize
```

### 12. Comandos Úteis

```bash
# Aplicar configuração
kubectl apply -k k8s/overlays/staging

# Ver status
kubectl -n [namespace] get all

# Logs
kubectl -n [namespace] logs -f deployment/[app-name]

# Shell no pod
kubectl -n [namespace] exec -it deployment/[app-name] -- sh

# Port forward para teste
kubectl -n [namespace] port-forward svc/[app-name] 8080:80

# Rollout status
kubectl -n [namespace] rollout status deployment/[app-name]

# Rollback
kubectl -n [namespace] rollout undo deployment/[app-name]
```
```

---

## Exemplo de Uso

```text
Atue como especialista em Kubernetes.

## Contexto

API de pagamentos com alta disponibilidade.

## Serviços

- api-gateway (Node.js)
- payment-service (Go)
- notification-service (Node.js)
- PostgreSQL (managed)
- Redis (cache)

## Ambiente

- Provedor: AWS EKS
- Ingress: AWS ALB Controller
- Cert-manager: Sim

## Requisitos

- Mínimo 3 réplicas
- Autoscaling até 20 pods
- Limites: 500m CPU, 512Mi RAM
- External Secrets com AWS Secrets Manager
```

---

## Checklist Pós-Geração

- [ ] Namespace criado
- [ ] Deployments com probes e limits
- [ ] Services configurados
- [ ] Ingress com TLS
- [ ] ConfigMaps separados de Secrets
- [ ] HPA configurado
- [ ] PDB para alta disponibilidade
- [ ] NetworkPolicy restritiva
- [ ] Kustomize para múltiplos ambientes
- [ ] Comandos documentados
