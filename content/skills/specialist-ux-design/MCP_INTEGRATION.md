# Guia de Integração MCP - Especialista UX Design

## 🎯 Visão Geral

Este documento descreve como integrar o especialista UX Design com o servidor MCP (Model Context Protocol) para automação completa de processos.

## 📋 Funções MCP Necessárias

### 1. init_ux.py
**Objetivo:** Criar estrutura base para documentos de UX Design

```python
def init_ux_design(context):
    """
    Inicializa estrutura base para UX Design
    
    Args:
        context: Dicionário com informações do projeto
    
    Returns:
        dict: Estrutura inicial dos documentos UX
    """
    # Criar estrutura base
    # Preencher templates com contexto
    # Validar inputs obrigatórios
    # Retornar estrutura pronta para edição
```

**Inputs Esperados:**
- Requisitos validados do especialista anterior
- Matriz de rastreabilidade
- Critérios de aceite testáveis
- Personas mapeadas

**Outputs Gerados:**
- Estrutura base de `design-doc.md`
- Estrutura base de `wireframes.md`
- Estrutura base de `jornada-usuario.md`

### 2. validate_ux.py
**Objetivo:** Validar qualidade dos artefatos de UX Design

```python
def validate_ux_design(artifacts):
    """
    Valida qualidade dos documentos de UX Design
    
    Args:
        artifacts: Dicionário com documentos gerados
    
    Returns:
        dict: Resultado da validação com score
    """
    # Validar cobertura de requisitos
    # Verificar usabilidade WCAG 2.1 AA
    # Checar responsividade
    # Validar consistência visual
    # Calcular score de qualidade
```

**Critérios de Validação:**
- **Cobertura de Requisitos:** 100% requisitos funcionais mapeados
- **Usabilidade:** WCAG 2.1 AA compliance
- **Responsividade:** 100% dispositivos cobertos
- **Consistência:** Padrão visual consistente
- **Score Mínimo:** 75 pontos

**Outputs:**
- Score de validação (0-100)
- Lista de issues encontradas
- Recomendações de melhoria
- Status: APROVADO/REPROVADO

### 3. process_ux.py
**Objetivo:** Preparar contexto para próximo especialista

```python
def process_ux_design(artifacts, score):
    """
    Processa artefatos UX e prepara contexto para Modelagem de Domínio
    
    Args:
        artifacts: Documentos UX validados
        score: Score de validação ≥ 75
    
    Returns:
        dict: Contexto preparado para próximo especialista
    """
    # Validar score mínimo
    # Extrair entidades de negócio dos wireframes
    # Mapear fluxos de usuário
    # Preparar contexto para Modelagem de Domínio
    # Gerar prompt para próxima fase
```

**Condições de Avanço:**
- Score ≥ 75 pontos
- Todos os requisitos funcionais cobertos
- Wireframes validados
- Jornadas mapeadas

**Outputs:**
- CONTEXTO.md atualizado
- Prompt para Modelagem de Domínio
- Status de transição

## 🔧 Mapeamento de Comandos

### Comandos da Skill → Funções MCP

| Comando Skill | Função MCP | Trigger |
|---------------|------------|---------|
| "iniciar ux design" | init_ux.py | Início do processo |
| "validar design" | validate_ux.py | Após edição |
| "avançar fase" | process_ux.py | Após validação |

### Fluxo de Execução

1. **Inicialização**
   ```
   Usuario: "preciso criar wireframes para meu projeto"
   Skill: Detecta trigger → Chama init_ux.py()
   MCP: Retorna estrutura base
   Skill: Apresenta templates preenchidos
   ```

2. **Edição**
   ```
   Usuario: Edita os documentos
   Skill: Aguarda conclusão
   ```

3. **Validação**
   ```
   Usuario: "terminei os wireframes"
   Skill: Chama validate_ux.py()
   MCP: Calcula score e valida
   Skill: Apresenta resultado
   ```

4. **Processamento**
   ```
   Usuario: "pode avançar"
   Skill: Chama process_ux.py()
   MCP: Prepara contexto
   Skill: Transiciona para Modelagem de Domínio
   ```

## 🛡️ Guardrails de Segurança

### Validações Obrigatórias
- **Score Mínimo:** Nunca avançar com score < 75
- **Confirmação:** Sempre confirmar com usuário antes de processar
- **Cobertura:** Validar 100% requisitos mapeados
- **Consistência:** Verificar padrões visuais

### Tratamento de Erros
- **Score Baixo:** Oferecer sugestões de melhoria
- **Requisitos Faltando:** Solicitar complementação
- **Inconsistências:** Apontar correções necessárias
- **Falha MCP:** Fallback para modo manual

## 📊 Métricas e Monitoramento

### KPIs de Performance
- **Tempo de Inicialização:** < 5 segundos
- **Tempo de Validação:** < 10 segundos
- **Tempo de Processamento:** < 5 segundos
- **Precisão:** 95% acurácia na validação

### Logs e Debug
- **Ações do Usuário:** Todas as interações registradas
- **Chamadas MCP:** Timestamp e parâmetros
- **Scores Históricos:** Evolução da qualidade
- **Erros:** Stack trace completo

## 🔄 Context Flow Integration

### Inputs do Especialista Anterior
- **Requisitos Funcionais:** De Engenharia de Requisitos
- **Matriz Rastreabilidade:** Mapeamento RF → PRD
- **Critérios Aceite:** Testes Gherkin
- **Personas:** Definições de usuários

### Outputs para Próximo Especialista
- **Entidades de Negócio:** Extraídas dos wireframes
- **Fluxos de Usuário:** Mapeados nas jornadas
- **Regras de UI:** Validações e interações
- **Componentes:** Reutilizáveis identificados

### Atualização de CONTEXTO.md
```markdown
## 3. UX Design
- **Status:** Concluído
- **Score:** 85 pontos
- **Artefatos:** design-doc.md, wireframes.md, jornada-usuario.md
- **Próxima Fase:** Modelagem de Domínio
```

## 🚀 Implementação Técnica

### Estrutura de Dados

#### Context Input
```json
{
  "project": {
    "name": "string",
    "requirements": ["RF-001", "RF-002"],
    "personas": ["user-type-1", "user-type-2"],
    "constraints": ["mobile-first", "wcag-aa"]
  },
  "artifacts": {
    "requirements": "path/to/requisitos.md",
    "traceability": "path/to/matriz.md",
    "acceptance": "path/to/criterios.md"
  }
}
```

#### Validation Output
```json
{
  "score": 85,
  "status": "APPROVED",
  "coverage": {
    "requirements": 100,
    "accessibility": 100,
    "responsiveness": 100
  },
  "issues": [],
  "recommendations": []
}
```

#### Process Output
```json
{
  "context": {
    "business_entities": ["User", "Product", "Order"],
    "user_flows": ["login", "checkout", "profile"],
    "ui_rules": ["validation-email", "password-strength"],
    "components": ["button", "form", "modal"]
  },
  "next_prompt": "Modelar domínio com entidades: User, Product, Order...",
  "status": "READY_FOR_NEXT_PHASE"
}
```

## 📋 Checklist de Implementação

### Para Desenvolvedor MCP
- [ ] Implementar `init_ux.py()` com template filling
- [ ] Implementar `validate_ux.py()` com score calculation
- [ ] Implementar `process_ux.py()` com context preparation
- [ ] Adicionar guardrails de segurança
- [ ] Implementar tratamento de erros
- [ ] Configurar logging e métricas
- [ ] Testar integração completa

### Para Usuário
- [ ] Fornecer requisitos completos
- [ ] Validar personas mapeadas
- [ ] Revisar wireframes gerados
- [ ] Testar protótipos interativos
- [ ] Confirmar score ≥ 75 antes de avançar

## 🎯 Benefícios da Integração

### Automação Completa
- **Zero esforço manual** na criação de estrutura
- **Validação objetiva** com scores numéricos
- **Transição automática** entre fases
- **Consistência garantida** em todos os projetos

### Experiência do Usuário
- **Início rápido** com templates preenchidos
- **Feedback imediato** na validação
- **Progresso claro** com scores e status
- **Fluxo contínuo** sem interrupções

### Qualidade Assegurada
- **Validação automática** de critérios
- **Padrões consistentes** em todos os artefatos
- **Rastreabilidade completa** do processo
- **Métricas objetivas** de qualidade

---

**Versão:** 2.0  
**Framework:** Maestro Skills Modernas  
**Atualização:** 2026-01-29  
**Status:** ✅ Ready for Implementation  
**Score Mínimo:** 75 pontos
