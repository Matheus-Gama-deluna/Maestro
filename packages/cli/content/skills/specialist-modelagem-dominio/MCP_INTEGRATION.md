# Guia de Integração MCP - Especialista Modelagem de Domínio

## 🎯 Visão Geral

Este documento descreve como integrar o especialista Modelagem de Domínio com o servidor MCP (Model Context Protocol) para automação completa de processos.

## 📋 Funções MCP Necessárias

### 1. init_domain.py
**Objetivo:** Criar estrutura base para documentos de domínio

```python
def init_domain_modeling(context):
    """
    Inicializa estrutura base para Modelagem de Domínio
    
    Args:
        context: Dicionário com informações do projeto
    
    Returns:
        dict: Estrutura inicial dos documentos de domínio
    """
    # Extrair entidades do design
    # Extrair casos de uso dos requisitos
    # Criar estrutura base do modelo de domínio
    # Criar estrutura de entidades e relacionamentos
    # Criar estrutura de casos de uso
    # Criar estrutura de arquitetura C4
    # Retornar estrutura completa
```

**Inputs Esperados:**
- project_name: Nome do projeto
- design_doc: Documento de design do UX
- requirements: Requisitos funcionais
- wireframes: Estrutura de wireframes
- user_flows: Fluxos de usuário mapeados
- ui_rules: Regras de UI identificadas

**Outputs Gerados:**
- Estrutura base de modelo-dominio.md
- Estrutura base de entidades-relacionamentos.md
- Estrutura base de casos-uso.md
- Estrutura base de arquitetura-c4.md

### 2. validate_domain.py
**Objetivo:** Validar qualidade dos documentos de domínio

```python
def validate_domain_modeling(artifacts):
    """
    Valida qualidade dos documentos de Modelagem de Domínio
    
    Args:
        artifacts: Dicionário com documentos gerados
    
    Returns:
        dict: Resultado da validação com score
    """
    # Validar entidades (25 pontos)
    # Validar relacionamentos (20 pontos)
    # Validar regras de negócio (20 pontos)
    # Validar casos de uso (15 pontos)
    # Validar arquitetura C4 (10 pontos)
    # Validar linguagem ubíqua (10 pontos)
    # Calcular score de qualidade
    # Gerar recomendações
```

**Critérios de Validação:**
- **Entidades:** 100% identificadas com atributos e comportamentos
- **Relacionamentos:** 100% mapeados com cardinalidade
- **Regras de Negócio:** 100% documentadas por entidade
- **Casos de Uso:** 100% mapeados com atores e fluxos
- **Arquitetura C4:** 100% implementada nos 3 níveis
- **Linguagem Ubíqua:** 100% consistente

**Outputs:**
- Score de validação (0-100)
- Lista de issues encontradas
- Recomendações de melhoria
- Status: APROVADO/REPROVADO

### 3. process_domain.py
**Objetivo:** Preparar contexto para Banco de Dados

```python
def process_domain_modeling(artifacts, score):
    """
    Processa artefatos de domínio e prepara contexto para Banco de Dados
    
    Args:
        artifacts: Documentos de domínio validados
        score: Score de validação ≥ 75
    
    Returns:
        dict: Contexto preparado para próximo especialista
    """
    # Validar score mínimo
    # Extrair entidades do modelo
    # Extrair relacionamentos
    # Mapear atributos para tipos de banco
    # Identificar índices necessários
    # Preparar contexto para Banco de Dados
    # Gerar prompt para próxima fase
```

**Condições de Avanço:**
- Score ≥ 75 pontos
- Todas as entidades identificadas
- Relacionamentos mapeados
- Regras de negócio documentadas

**Outputs:**
- CONTEXTO.md atualizado
- Schema de banco proposto
- Índices recomendados
- Prompt para Banco de Dados

## 🔧 Mapeamento de Comandos

### Comandos da Skill → Funções MCP

| Comando Skill | Função MCP | Trigger |
|---------------|------------|---------|
| "iniciar modelagem" | init_domain.py | Início do processo |
| "validar domínio" | validate_domain.py | Após edição |
| "avançar fase" | process_domain.py | Após validação |

### Fluxo de Execução

1. **Inicialização**
   ```
   Usuario: "preciso modelar o domínio do meu projeto"
   Skill: Detecta trigger → Chama init_domain.py()
   MCP: Retorna estrutura base
   Skill: Apresenta templates preenchidos
   ```

2. **Edição**
   ```
   Usuario: Edita os documentos de domínio
   Skill: Aguarda conclusão
   ```

3. **Validação**
   ```
   Usuario: "terminei o modelo de domínio"
   Skill: Chama validate_domain.py()
   MCP: Calcula score e valida
   Skill: Apresenta resultado
   ```

4. **Processamento**
   ```
   Usuario: "pode avançar para banco de dados"
   Skill: Chama process_domain.py()
   MCP: Prepara contexto
   Skill: Transiciona para Banco de Dados
   ```

## 🛡️ Guardrails de Segurança

### Validações Obrigatórias
- **Score Mínimo:** Nunca avançar com score < 75
- **Confirmação:** Sempre confirmar com usuário antes de processar
- **Completude:** Validar 100% entidades mapeadas
- **Consistência:** Verificar linguagem ubíqua

### Tratamento de Erros
- **Score Baixo:** Oferecer sugestões de melhoria
- **Entidades Faltando:** Solicitar complementação
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
- **Design Doc:** Documento de design completo
- **Wireframes:** Estrutura de interface
- **Jornadas:** Mapa de experiências do usuário
- **Componentes:** Elementos reutilizáveis

### Outputs para Próximo Especialista
- **Entidades:** Lista completa com atributos
- **Relacionamentos:** Mapeamento completo
- **Schema Proposto:** Estrutura de banco
- **Índices:** Recomendações de performance

### Atualização de CONTEXTO.md
```markdown
## 4. Modelagem de Domínio
- **Status:** Concluído
- **Score:** 85 pontos
- **Data:** 2026-01-29
- **Artefatos:** modelo-dominio.md, entidades-relacionamentos.md, casos-uso.md, arquitetura-c4.md
- **Entidades:** 5 entidades mapeadas
- **Relacionamentos:** 8 relacionamentos definidos
- **Próxima Fase:** Banco de Dados
```

## 🚀 Implementação Técnica

### Estrutura de Dados

#### Context Input
```json
{
  "project_name": "string",
  "design_doc": {
    "wireframes": {
      "screens": [
        {
          "name": "string",
          "forms": [
            {"entity": "string", "fields": ["string"]}
          ]
        }
      ]
    }
  },
  "requirements": {
    "functional_requirements": [
      {"id": "string", "name": "string", "description": "string"}
    ]
  },
  "wireframes": "object",
  "user_flows": "array",
  "ui_rules": "array"
}
```

#### Validation Output
```json
{
  "score": 85,
  "status": "APROVADO",
  "coverage": {
    "entities": 100,
    "relationships": 100,
    "business_rules": 100,
    "use_cases": 100,
    "c4_architecture": 100,
    "ubiquitous_language": 100
  },
  "issues": [],
  "recommendations": []
}
```

#### Process Output
```json
{
  "context": {
    "entities": [
      {"name": "User", "attributes": ["id", "email", "name"]}
    ],
    "relationships": [
      {"from": "User", "to": "Order", "type": "1:N"}
    ],
    "schema": {
      "users": {
        "columns": [
          {"name": "id", "type": "UUID"},
          {"name": "email", "type": "VARCHAR(255)"}
        ]
      }
    },
    "indexes": [
      {"table": "users", "columns": ["email"], "type": "unique"}
    ]
  },
  "next_prompt": "Modelar banco de dados com entidades: User, Order...",
  "status": "READY_FOR_NEXT_PHASE"
}
```

## 📋 Checklist de Implementação

### Para Desenvolvedor MCP
- [ ] Implementar `init_domain.py()` com extração de entidades
- [ ] Implementar `validate_domain.py()` com score calculation
- [ ] Implementar `process_domain.py()` com context preparation
- [ ] Adicionar guardrails de segurança
- [ ] Implementar tratamento de erros
- [ ] Configurar logging e métricas
- [ ] Testar integração completa

### Para Usuário
- [ ] Fornecer design completo do UX
- [ ] Validar entidades identificadas
- [ ] Revisar relacionamentos propostos
- [ ] Confirmar regras de negócio
- [ ] Validar arquitetura C4

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
- **Validação automática** de critérios DDD
- **Padrões consistentes** em todos os artefatos
- **Rastreabilidade completa** do processo
- **Métricas objetivas** de qualidade

---

**Versão:** 2.0  
**Framework:** Maestro Skills Modernas  
**Atualização:** 2026-01-29  
**Status:** ✅ Ready for Implementation  
**Score Mínimo:** 75 pontos
