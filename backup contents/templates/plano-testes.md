# Plano de Testes: [Nome do Sistema]

**Versão:** 1.0  
**Data:** YYYY-MM-DD  
**QA Responsável:** [Nome]  
**Requisitos Relacionados:** [Link]

---

## 1. Escopo

### 1.1 O que será testado
- [Módulo/Funcionalidade 1]
- [Módulo/Funcionalidade 2]
- [Módulo/Funcionalidade 3]

### 1.2 O que NÃO será testado
- [Funcionalidades fora do escopo e porquê]

### 1.3 Riscos de Qualidade
| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| [Risco 1] | Alta/Média/Baixa | Alto/Médio/Baixo | [Ação] |

---

## 2. Estratégia de Testes

### Pirâmide de Testes

```
         /\
        /  \  E2E (10%)
       /----\
      /      \  Integração (20%)
     /--------\
    /          \  Unitários (70%)
   /--------------\
```

### Tipos de Teste por Camada

| Tipo | Ferramenta | Cobertura Alvo | Responsável |
|---|---|---|---|
| Unitários | Jest/Vitest | 80% | Devs |
| Integração | Jest + Supertest | 60% | Devs |
| E2E | Playwright/Cypress | Fluxos críticos | QA |
| Performance | k6/Artillery | - | DevOps/QA |
| Segurança | OWASP ZAP | - | Sec/QA |

---

## 3. Casos de Teste

### 3.1 [Módulo/Funcionalidade 1]

#### TC001 - [Nome do Caso de Teste] (RF001)
| Campo | Valor |
|---|---|
| **Prioridade** | Alta/Média/Baixa |
| **Tipo** | Funcional/Integração/E2E |
| **Pré-condições** | [O que precisa estar configurado] |

**Passos:**
1. [Ação 1]
2. [Ação 2]
3. [Ação 3]

**Resultado Esperado:**
- [O que deve acontecer]

**Dados de Teste:**
| Input | Output Esperado |
|---|---|
| [Valor 1] | [Resultado 1] |
| [Valor 2] | [Resultado 2] |

---

#### TC002 - [Caso de Erro] (RF001)
| Campo | Valor |
|---|---|
| **Prioridade** | Alta |
| **Tipo** | Funcional |
| **Pré-condições** | [Condição de erro] |

**Passos:**
1. [Ação que causa erro]

**Resultado Esperado:**
- Mensagem de erro "[texto]"
- Sistema mantém estado anterior

---

### 3.2 [Módulo/Funcionalidade 2]

#### TC003 - [Nome do Caso]
[Repetir estrutura]

---

## 4. Matriz de Rastreabilidade

| Requisito | Casos de Teste | Status |
|---|---|---|
| RF001 | TC001, TC002 | ✅ Passando |
| RF002 | TC003 | 🔄 Em desenvolvimento |
| RF003 | TC004, TC005 | ⏳ Pendente |

---

## 5. Ambiente de Testes

### 5.1 Configuração
| Componente | Ambiente de Teste | Observações |
|---|---|---|
| API | staging.api.example.com | Reset diário |
| Banco | PostgreSQL (container) | Seeds automáticos |
| Redis | Container local | - |

### 5.2 Dados de Teste
- [ ] Seeds de dados configurados
- [ ] Usuários de teste criados
- [ ] Limpeza entre execuções

---

## 6. Critérios de Aceitação

### 6.1 Critérios de Entrada
- [ ] Código em branch de feature
- [ ] Build passando
- [ ] Code review aprovado

### 6.2 Critérios de Saída
- [ ] Todos os testes passando
- [ ] Cobertura mínima atingida (80% unit, 60% integration)
- [ ] Zero bugs críticos/bloqueadores
- [ ] Bugs médios documentados

---

## 7. Métricas de Qualidade

| Métrica | Alvo | Atual |
|---|---|---|
| Cobertura unitária | > 80% | - |
| Cobertura integração | > 60% | - |
| Taxa de bugs escapados | < 5% | - |
| Tempo médio de fix | < 2 dias | - |

---

## 8. Cronograma

| Fase | Data Início | Data Fim | Status |
|---|---|---|---|
| Testes unitários | | | ⏳ |
| Testes integração | | | ⏳ |
| Testes E2E | | | ⏳ |
| Testes performance | | | ⏳ |
| Regression final | | | ⏳ |

---

## 9. Relatório de Bugs

Template para reportar bugs encontrados:

```markdown
## BUG-XXX: [Título]

**Severidade:** Crítico/Alto/Médio/Baixo
**Ambiente:** [Onde ocorreu]
**Requisito:** [RF relacionado]

### Passos para Reproduzir
1. 
2. 
3. 

### Resultado Atual
[O que acontece]

### Resultado Esperado
[O que deveria acontecer]

### Evidências
[Screenshots, logs]
```

---

## Changelog

| Versão | Data | Autor | Mudanças |
|---|---|---|---|
| 1.0 | YYYY-MM-DD | [Nome] | Versão inicial |
