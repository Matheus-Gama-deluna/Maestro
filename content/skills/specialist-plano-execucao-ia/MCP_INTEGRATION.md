# Integração MCP - Plano de Execução

**Versão:** 2.0  
**Última Atualização:** 31/01/2026  
**Especialista:** Plano de Execução com IA

---

## 🎯 Visão Geral da Integração MCP

Este documento descreve como o MCP (Maestro Command Processor) automatiza o processo de planejamento de execução, desde a inicialização da estrutura de backlog até a validação de qualidade e preparação para a próxima fase.

### **Princípios de Integração**

- **Skill Descritiva:** Este especialista contém apenas informações e processos
- **Automação Externa:** Toda lógica de execução está no MCP
- **Quality Gates:** Validação automatizada com score mínimo de 75/100
- **Context Flow:** Dados fluem automaticamente entre fases

---

## 🤖 Funções MCP Disponíveis

### **1. init_backlog_structure**

**Propósito:** Inicializar estrutura de backlog a partir de documentos de entrada

**Input:**
```typescript
{
  prd: string;              // Conteúdo do PRD.md
  requisitos: string;       // Conteúdo do requisitos.md
  designDoc: string;        // Conteúdo do design-doc.md
  arquitetura: string;      // Conteúdo do arquitetura.md
  contexto: string;         // Conteúdo do CONTEXTO.md
  capacidadeTime?: {        // Opcional
    desenvolvedores: number;
    duracaoSprint: number;  // em semanas
    deadlines?: string[];
  }
}
```

**Output:**
```typescript
{
  backlog: {
    epicos: Epico[];
    features: Feature[];
    timeline: Timeline;
    metricas: Metricas;
  };
  estruturaArquivos: {
    backlogMd: string;      // Conteúdo do backlog.md
    features: FeatureFile[]; // Arquivos de features
    contratos: ContratoFile[]; // Arquivos de contratos API
  };
  proximaFase: string;      // Nome da próxima fase
}
```

**Processo:**
1. Analisa todos os documentos de entrada
2. Identifica épicos principais do PRD
3. Mapeia requisitos funcionais para features
4. Separa features por tipo (CONT, FE, BE, INT)
5. Define dependências entre features
6. Calcula timeline com buffer de 20%
7. Gera estrutura de arquivos

**Exemplo de Uso:**
```typescript
const resultado = await mcp.initBacklogStructure({
  prd: await readFile('docs/01-produto/PRD.md'),
  requisitos: await readFile('docs/02-requisitos/requisitos.md'),
  designDoc: await readFile('docs/03-ux/design-doc.md'),
  arquitetura: await readFile('docs/06-arquitetura/arquitetura.md'),
  contexto: await readFile('docs/CONTEXTO.md'),
  capacidadeTime: {
    desenvolvedores: 2,
    duracaoSprint: 2,
    deadlines: ['2026-03-15']
  }
});

// Salvar arquivos gerados
await writeFile('docs/08-backlog/backlog.md', resultado.estruturaArquivos.backlogMd);
```

---

### **2. validate_backlog_quality**

**Propósito:** Validar qualidade do backlog gerado com checklist automatizado

**Input:**
```typescript
{
  backlogMd: string;        // Conteúdo do backlog.md
  features: FeatureFile[];  // Arquivos de features
  contratos: ContratoFile[]; // Arquivos de contratos
  strictMode?: boolean;     // Modo rigoroso (default: false)
}
```

**Output:**
```typescript
{
  score: number;            // 0-100
  aprovado: boolean;        // true se score >= 75
  detalhes: {
    estruturaBacklog: {
      score: number;        // 0-25
      itens: ChecklistItem[];
    };
    qualidadeHistorias: {
      score: number;        // 0-30
      itens: ChecklistItem[];
    };
    rastreabilidade: {
      score: number;        // 0-20
      itens: ChecklistItem[];
    };
    planejamento: {
      score: number;        // 0-25
      itens: ChecklistItem[];
    };
  };
  recomendacoes: string[];  // Sugestões de melhoria
}
```

**Checklist Automatizado:**

**1. Estrutura do Backlog (25 pontos):**
- ✅ Épicos claramente definidos (5 pts)
- ✅ Features mapeadas para épicos (5 pts)
- ✅ Histórias mapeadas para features (5 pts)
- ✅ Priorização RICE aplicada (5 pts)
- ✅ Dependências identificadas (5 pts)

**2. Qualidade das Histórias (30 pontos):**
- ✅ Formato "Como [persona], quero [ação], para [benefício]" (8 pts)
- ✅ Critérios de aceite em Gherkin (8 pts)
- ✅ Estimativas de esforço (7 pts)
- ✅ Dependências técnicas (7 pts)

**3. Rastreabilidade (20 pontos):**
- ✅ Histórias → Requisitos (7 pts)
- ✅ Histórias → Design (7 pts)
- ✅ Matriz de rastreabilidade (6 pts)

**4. Planejamento (25 pontos):**
- ✅ Sprints definidos (7 pts)
- ✅ Releases planejados (6 pts)
- ✅ Riscos identificados (6 pts)
- ✅ Buffer de 20% (6 pts)

**Exemplo de Uso:**
```typescript
const validacao = await mcp.validateBacklogQuality({
  backlogMd: await readFile('docs/08-backlog/backlog.md'),
  features: await readFeatures('docs/08-backlog/features/'),
  contratos: await readContratos('docs/08-backlog/contratos/'),
  strictMode: false
});

if (!validacao.aprovado) {
  console.log(`Score: ${validacao.score}/100 - BLOQUEADO`);
  console.log('Recomendações:', validacao.recomendacoes);
} else {
  console.log(`Score: ${validacao.score}/100 - APROVADO`);
}
```

---

### **3. process_backlog_to_next_phase**

**Propósito:** Preparar backlog para desenvolvimento e avançar para próxima fase

**Input:**
```typescript
{
  backlogMd: string;
  features: FeatureFile[];
  contratos: ContratoFile[];
  validacao: ValidationResult; // Resultado de validate_backlog_quality
}
```

**Output:**
```typescript
{
  proximaFase: {
    nome: string;           // "Contrato de API" ou "Desenvolvimento"
    especialista: string;   // Nome do próximo especialista
    artefatosEntrada: string[]; // Arquivos necessários
  };
  historiasProximas: Historia[]; // Histórias prioritárias
  contextoPrepared: {
    backlogResumo: string;
    epicosAtivos: Epico[];
    dependenciasCriticas: Dependencia[];
  };
  atualizacoes: {
    contextoMd: string;     // Atualização do CONTEXTO.md
    statusMd: string;       // Atualização do STATUS.md
  };
}
```

**Processo:**
1. Valida que score >= 75 (ou aprovação manual)
2. Identifica próxima fase (Contrato API ou Desenvolvimento)
3. Prepara histórias prioritárias para sprint 1
4. Atualiza CONTEXTO.md com resumo do planejamento
5. Registra métricas de planejamento
6. Retorna dados para próximo especialista

**Exemplo de Uso:**
```typescript
const proximaFase = await mcp.processBacklogToNextPhase({
  backlogMd: await readFile('docs/08-backlog/backlog.md'),
  features: await readFeatures('docs/08-backlog/features/'),
  contratos: await readContratos('docs/08-backlog/contratos/'),
  validacao: resultadoValidacao
});

// Atualizar arquivos
await writeFile('docs/CONTEXTO.md', proximaFase.atualizacoes.contextoMd);
await writeFile('docs/STATUS.md', proximaFase.atualizacoes.statusMd);

console.log(`Próxima fase: ${proximaFase.proximaFase.nome}`);
console.log(`Especialista: ${proximaFase.proximaFase.especialista}`);
```

---

## 🔄 Fluxo de Integração Completo

### **Sequência de Chamadas MCP**

```typescript
// 1. Inicializar backlog
const backlog = await mcp.initBacklogStructure({
  prd, requisitos, designDoc, arquitetura, contexto
});

// 2. Salvar arquivos gerados
await saveBacklogFiles(backlog.estruturaArquivos);

// 3. Validar qualidade
const validacao = await mcp.validateBacklogQuality({
  backlogMd: backlog.estruturaArquivos.backlogMd,
  features: backlog.estruturaArquivos.features,
  contratos: backlog.estruturaArquivos.contratos
});

// 4. Se aprovado, processar para próxima fase
if (validacao.aprovado) {
  const proximaFase = await mcp.processBacklogToNextPhase({
    backlogMd: backlog.estruturaArquivos.backlogMd,
    features: backlog.estruturaArquivos.features,
    contratos: backlog.estruturaArquivos.contratos,
    validacao
  });
  
  // 5. Avançar para próximo especialista
  await loadNextSpecialist(proximaFase.proximaFase.especialista);
}
```

---

## 📊 Quality Gates e Thresholds

### **Score Mínimo**
- **Padrão:** 75/100 pontos
- **Modo Rigoroso:** 85/100 pontos
- **Aprovação Manual:** Permitida com justificativa

### **Critérios de Bloqueio**

**Bloqueio Automático (Score < 70):**
- Histórias sem critérios de aceite
- Épicos sem features
- Timeline sem buffer
- Dependências não mapeadas

**Aviso (Score 70-74):**
- Estimativas incompletas
- Rastreabilidade parcial
- Riscos não documentados

**Aprovado (Score >= 75):**
- Todos os critérios obrigatórios atendidos
- Pode avançar automaticamente

---

## 🎯 Context Flow

### **Dados Recebidos de Fases Anteriores**

| Fase | Artefato | Uso |
|------|----------|-----|
| Gestão de Produto | PRD.md | Identificar épicos e MVP |
| Engenharia de Requisitos | requisitos.md | Mapear RFs para histórias |
| UX Design | design-doc.md | Rastrear histórias para wireframes |
| Arquitetura de Software | arquitetura.md | Definir stack e separação FE/BE |

### **Dados Enviados para Próximas Fases**

| Fase | Artefato | Conteúdo |
|------|----------|----------|
| Contrato de API | contratos/*.yaml | Especificações OpenAPI |
| Desenvolvimento Frontend | features/FE-*.md | Histórias frontend |
| Desenvolvimento Backend | features/BE-*.md | Histórias backend |
| Integração | features/INT-*.md | Histórias de integração |

---

## 📝 Implementação de Referência

As funções MCP descritas acima são **referências** para implementação no servidor MCP. O diretório `mcp_functions/` contém:

- `init_backlog_structure.py` - Implementação de referência da função 1
- `validate_backlog_quality.py` - Implementação de referência da função 2
- `process_backlog_to_next_phase.py` - Implementação de referência da função 3
- `README.md` - Documentação das funções

**Nota:** Estas são funções de **referência** e devem ser implementadas no servidor MCP, não executadas localmente.

---

## 🔧 Troubleshooting

### **Problema: Score baixo na validação**

**Causa:** Histórias incompletas ou sem critérios de aceite

**Solução:**
1. Revisar checklist de validação
2. Completar campos obrigatórios
3. Adicionar critérios de aceite em Gherkin
4. Re-executar validação

### **Problema: Dependências circulares**

**Causa:** Features dependem umas das outras em loop

**Solução:**
1. Revisar mapeamento de dependências
2. Quebrar features em partes menores
3. Definir ordem de execução clara

### **Problema: Timeline irrealista**

**Causa:** Estimativas muito otimistas ou sem buffer

**Solução:**
1. Adicionar buffer de 20% mínimo
2. Revisar estimativas com time
3. Considerar riscos e impedimentos

---

**Versão:** 2.0  
**Framework:** Skills Modernas com Progressive Disclosure  
**Arquitetura:** Skill Descritiva + Automação MCP
