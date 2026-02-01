# 🔧 Plano de Implementação - Modificações no CLI Existente

## 📋 Análise do Estado Atual

### ✅ **Já Implementado**
- **CLI funcional** com comandos `init` e `update`
- **Suporte para 3 IDEs**: Windsurf, Cursor, Antigravity
- **250+ arquivos de conteúdo** (skills, specialists, templates, etc.)
- **Estrutura de diretórios** gerada automaticamente
- **Sistema de templates** funcional
- **Publicação NPM** configurada (`@maestro-ai/cli` v1.1.0)

### 🎯 **O que Precisa Ser Adicionado**
- **Motor de orquestração** (workflow engine)
- **Sistema de estado persistente** inteligente
- **Workflow universal** (`/maestro` com detecção automática)
- **Validação de qualidade** e quality gates
- **Integração conversacional** com as IDEs
- **Análise inteligente de contexto**

---

## 🏗️ Estratégia de Modificação

### Fase 1: Extensão do CLI (Semanas 1-2)

#### 1.1 Novos Comandos no CLI
```typescript
// packages/cli/src/commands/
├── init.ts              # ✅ Já existe (manter)
├── update.ts            # ✅ Já existe (manter)
├── status.ts            # 🆕 Novo - status do projeto
├── advance.ts           # 🆕 Novo - avançar fase
├── validate.ts          # 🆕 Novo - validar qualidade
└── universal.ts         # 🆕 Novo - workflow inteligente
```

**Modificações em `src/index.ts`:**
```typescript
// Adicionar novos comandos
import { status } from './commands/status.js';
import { advance } from './commands/advance.js';
import { validate } from './commands/validate.js';
import { universal } from './commands/universal.js';

// Novos comandos no programa
program
    .command('status')
    .description('Mostra status completo do projeto')
    .action(status);

program
    .command('advance')
    .description('Avança para próxima fase com validação')
    .action(advance);

program
    .command('validate')
    .description('Valida qualidade dos entregáveis')
    .action(validate);

program
    .command('universal')
    .description('Executa workflow universal inteligente')
    .action(universal);
```

#### 1.2 Novo Pacote Core
```bash
# Criar novo pacote para o motor de orquestração
packages/
├── cli/                 # ✅ Já existe (modificar)
├── core/                # 🆕 Novo - motor de orquestração
└── shared/              # 🆕 Novo - tipos e utilidades compartilhadas
```

**Estrutura do novo pacote core:**
```bash
packages/core/
├── src/
│   ├── index.ts         # API pública
│   ├── workflow-engine.ts
│   ├── state-manager.ts
│   ├── context-detector.ts
│   ├── skill-loader.ts
│   ├── rule-validator.ts
│   └── universal-workflow.ts
├── types/
│   ├── workflow.ts
│   ├── state.ts
│   └── context.ts
├── package.json
└── README.md
```

#### 1.3 Integração Core ↔ CLI
```typescript
// packages/cli/src/commands/status.ts
import { StateManager } from '@maestro-ai/core';

export async function status() {
    const stateManager = new StateManager();
    const analysis = await stateManager.analyzeCurrentState();
    
    console.log(formatStatusOutput(analysis));
}

// packages/cli/src/commands/universal.ts
import { UniversalWorkflow } from '@maestro-ai/core';

export async function universal() {
    const workflow = new UniversalWorkflow();
    await workflow.execute();
}
```

---

### Fase 2: Motor de Orquestração (Semanas 3-4)

#### 2.1 State Manager
```typescript
// packages/core/src/state-manager.ts
export class StateManager {
    private statePath: string = '.maestro/estado.json';
    
    async loadState(): Promise<ProjectState> {
        // Ler estado existente ou criar inicial
    }
    
    async analyzeCurrentState(): Promise<StateAnalysis> {
        // Análise inteligente do estado atual
        // - Detecta se é novo projeto
        // - Verifica fase incompleta
        // - Determina próxima ação
    }
    
    async updatePhase(phaseNumber: number, result: PhaseResult): Promise<void> {
        // Atualizar estado da fase
    }
}
```

**Integração com CLI existente:**
```typescript
// Modificar packages/cli/src/commands/init.ts
export async function init(options: InitOptions) {
    // ... código existente mantido ...
    
    // 🆕 Adicionar: Criar estado inicial
    const stateManager = new StateManager();
    await stateManager.createInitialState({
        projectName: await askProjectName(),
        projectType: await detectProjectType(),
        complexity: 'medium',
        ide: options.ide
    });
    
    // ... resto do código existente ...
}
```

#### 2.2 Workflow Engine
```typescript
// packages/core/src/workflow-engine.ts
export class WorkflowEngine {
    async executeWorkflow(workflowId: string, context: WorkflowContext): Promise<WorkflowResult> {
        // Carregar workflow do content existente
        const workflow = await this.loadWorkflowFromContent(workflowId);
        
        // Executar fases sequencialmente
        for (const phase of workflow.phases) {
            await this.executePhase(phase, context);
        }
    }
    
    private async loadWorkflowFromContent(workflowId: string): Promise<Workflow> {
        // Ler de .maestro/content/workflows/ ou content do CLI
        const contentPath = this.getContentPath();
        const workflowPath = join(contentPath, 'workflows', `${workflowId}.md`);
        return await this.parseWorkflow(workflowPath);
    }
}
```

#### 2.3 Context Detector
```typescript
// packages/core/src/context-detector.ts
export class ContextDetector {
    async buildContext(phase: number): Promise<ExecutionContext> {
        // Carregar artefatos das fases anteriores
        const artifacts = await this.loadPreviousArtifacts(phase);
        
        // Carregar especialista do content
        const specialist = await this.loadSpecialist(phase);
        
        // Carregar template do content
        const template = await this.loadTemplate(phase);
        
        return { artifacts, specialist, template };
    }
    
    private async loadSpecialist(phase: number): Promise<Specialist> {
        // Ler de .maestro/content/specialists/
        const contentPath = this.getContentPath();
        const specialistFiles = await readdir(join(contentPath, 'specialists'));
        // Mapear fase para especialista correspondente
    }
}
```

---

### Fase 3: Workflow Universal Inteligente (Semanas 5-6)

#### 3.1 Lógica Universal
```typescript
// packages/core/src/universal-workflow.ts
export class UniversalWorkflow {
    constructor(
        private stateManager: StateManager,
        private workflowEngine: WorkflowEngine,
        private contextDetector: ContextDetector
    ) {}
    
    async execute(): Promise<WorkflowResult> {
        // 1. Analisar estado atual
        const analysis = await this.stateManager.analyzeCurrentState();
        
        // 2. Determinar ação necessária
        switch (analysis.status) {
            case 'new_project':
                return await this.handleNewProject();
            case 'phase_incomplete':
                return await this.handleIncompletePhase(analysis);
            case 'ready_to_advance':
                return await this.handlePhaseAdvancement(analysis);
        }
    }
    
    private async handleNewProject(): Promise<WorkflowResult> {
        // Iniciar workflow /iniciar-projeto
        return await this.workflowEngine.executeWorkflow('iniciar-projeto', {});
    }
    
    private async handleIncompletePhase(analysis: StateAnalysis): Promise<WorkflowResult> {
        // Continuar fase do ponto onde parou
        const context = await this.contextDetector.buildContext(analysis.currentPhase);
        return await this.continuePhase(analysis.currentPhase, context);
    }
}
```

#### 3.2 Integração com Workflows Existentes
```typescript
// Mapear workflows existentes para nova estrutura
const WORKFLOW_MAPPING = {
    'iniciar-projeto': {
        file: 'iniciar-projeto.md',
        phases: [1], // Produto
        specialist: 'Gestão de Produto'
    },
    'avancar-fase': {
        file: 'avancar-fase.md',
        dynamic: true, // Determina próxima fase automaticamente
        validation: true
    },
    'status-projeto': {
        file: 'status-projeto.md',
        analysis: true
    }
};
```

#### 3.3 Comandos Conversacionais
```typescript
// packages/core/src/conversation-manager.ts
export class ConversationManager {
    async generateResponse(action: NextAction): Promise<ConversationResponse> {
        switch (action.type) {
            case 'continue_phase':
                return this.buildContinueResponse(action);
            case 'advance_phase':
                return this.buildAdvanceResponse(action);
            case 'start_project':
                return this.buildStartResponse(action);
        }
    }
    
    private buildContinueResponse(action: NextAction): ConversationResponse {
        return {
            message: `📋 **Retomando Fase ${action.phase} - ${action.phaseName}**`,
            context: `👤 **Especialista:** ${action.specialist}`,
            nextSteps: [`Posso continuar com ${action.task} ou você prefere algo específico?`],
            artifacts: action.artifacts
        };
    }
}
```

---

### Fase 4: Validação e Quality Gates (Semanas 7-8)

#### 4.1 Rule Validator
```typescript
// packages/core/src/rule-validator.ts
export class RuleValidator {
    async validateArtifact(artifactPath: string, phase: number): Promise<ValidationResult> {
        // Carregar regras do content existente
        const rules = await this.loadRulesForPhase(phase);
        
        // Validar artefato
        const results = await Promise.all(
            rules.map(rule => this.validateRule(artifactPath, rule))
        );
        
        return this.aggregateResults(results);
    }
    
    private async loadRulesForPhase(phase: number): Promise<Rule[]> {
        // Ler de .maestro/content/rules/
        const contentPath = this.getContentPath();
        const rulesPath = join(contentPath, 'rules');
        
        // Carregar regras específicas da fase
        const phaseRules = await this.loadPhaseRules(rulesPath, phase);
        
        // Carregar regras gerais
        const generalRules = await this.loadGeneralRules(rulesPath);
        
        return [...phaseRules, ...generalRules];
    }
}
```

#### 4.2 Quality Gates
```typescript
// packages/core/src/quality-gates.ts
export class QualityGates {
    private GATES = {
        1: { minScore: 75, validations: ['problema_definido', 'mvp_listado'] },
        2: { minScore: 70, validations: ['requisitos_funcionais', 'mvp_100%_coberto'] },
        3: { minScore: 70, validations: ['wireframes_criados', 'fluxos_navegacao'] },
        // ... demais fases
    };
    
    async validatePhaseTransition(fromPhase: number, toPhase: number): Promise<GateResult> {
        const gate = this.GATES[fromPhase];
        
        // Validar score mínimo
        const score = await this.calculatePhaseScore(fromPhase);
        if (score < gate.minScore) {
            return { passed: false, reason: `Score ${score} < mínimo ${gate.minScore}` };
        }
        
        // Validar regras específicas
        for (const validation of gate.validations) {
            const result = await this.validateSpecificRule(fromPhase, validation);
            if (!result.passed) {
                return { passed: false, reason: result.reason };
            }
        }
        
        return { passed: true };
    }
}
```

---

### Fase 5: Comandos Avançados do CLI (Semanas 9-10)

#### 5.1 Comando Status
```typescript
// packages/cli/src/commands/status.ts
export async function status() {
    const stateManager = new StateManager();
    const analysis = await stateManager.analyzeCurrentState();
    
    console.log(chalk.blue.bold('\n🎯 Status do Projeto Maestro\n'));
    
    if (analysis.status === 'new_project') {
        console.log(chalk.yellow('📋 Projeto não inicializado'));
        console.log(chalk.cyan('🚀 Use: /iniciar-projeto para começar'));
        return;
    }
    
    // Mostrar status detalhado
    console.log(chalk.white(`📁 Projeto: ${analysis.projectName}`));
    console.log(chalk.white(`🔄 Fase Atual: ${analysis.currentPhase}/${analysis.totalPhases} - ${analysis.phaseName}`));
    console.log(chalk.white(`👤 Especialista: ${analysis.specialist}`));
    console.log(chalk.white(`📊 Score: ${analysis.score}/100`));
    
    if (analysis.nextAction) {
        console.log(chalk.green(`\n🎯 Próxima Ação: ${analysis.nextAction}`));
    }
    
    // Mostrar artefatos
    if (analysis.artifacts.length > 0) {
        console.log(chalk.blue('\n📋 Artefatos:'));
        analysis.artifacts.forEach(artifact => {
            console.log(chalk.dim(`  • ${artifact}`));
        });
    }
}
```

#### 5.2 Comando Advance
```typescript
// packages/cli/src/commands/advance.ts
export async function advance() {
    const stateManager = new StateManager();
    const qualityGates = new QualityGates();
    
    const currentState = await stateManager.loadState();
    
    // Validar se fase atual está completa
    const gateResult = await qualityGates.validatePhaseTransition(
        currentState.currentPhase.number,
        currentState.currentPhase.number + 1
    );
    
    if (!gateResult.passed) {
        console.log(chalk.red(`❌ Não é possível avançar: ${gateResult.reason}`));
        return;
    }
    
    // Avançar fase
    const universalWorkflow = new UniversalWorkflow();
    await universalWorkflow.execute();
    
    console.log(chalk.green(`✅ Avançado para Fase ${currentState.currentPhase.number + 1}`));
}
```

#### 5.3 Comando Validate
```typescript
// packages/cli/src/commands/validate.ts
export async function validate() {
    const ruleValidator = new RuleValidator();
    const stateManager = new StateManager();
    
    const currentState = await stateManager.loadState();
    const currentPhase = currentState.currentPhase.number;
    
    // Validar entregável da fase atual
    const artifactPath = getPhaseArtifactPath(currentPhase);
    const validationResult = await ruleValidator.validateArtifact(artifactPath, currentPhase);
    
    console.log(chalk.blue.bold(`\n🔍 Validação - Fase ${currentPhase}\n`));
    
    console.log(chalk.white(`📊 Score: ${validationResult.score}/100`));
    
    if (validationResult.passed) {
        console.log(chalk.green('✅ Artefato aprovado!'));
    } else {
        console.log(chalk.red('❌ Problemas encontrados:'));
        validationResult.issues.forEach(issue => {
            console.log(chalk.red(`  • ${issue}`));
        });
    }
    
    // Mostrar recomendações
    if (validationResult.recommendations.length > 0) {
        console.log(chalk.blue('\n💡 Recomendações:'));
        validationResult.recommendations.forEach(rec => {
            console.log(chalk.dim(`  • ${rec}`));
        });
    }
}
```

---

### Fase 6: Integração Final (Semanas 11-12)

#### 6.1 Atualização de Dependências
```json
// packages/cli/package.json (modificado)
{
    "dependencies": {
        "commander": "^12.0.0",
        "chalk": "^5.3.0",
        "fs-extra": "^11.2.0",
        "ora": "^8.0.0",
        "@maestro-ai/core": "^1.0.0",  // 🆕 Nova dependência
        "@maestro-ai/shared": "^1.0.0"  // 🆕 Tipos compartilhados
    }
}
```

#### 6.2 Scripts de Build
```json
// packages/cli/package.json (modificado)
{
    "scripts": {
        "build": "tsc && npm run copy-content",
        "build:core": "npm run build --workspace=@maestro-ai/core",
        "build:shared": "npm run build --workspace=@maestro-ai/shared",
        "build:all": "npm run build:shared && npm run build:core && npm run build",
        "dev": "tsx src/index.ts",
        "dev:watch": "npm run build:all -- --watch"
    }
}
```

#### 6.3 Configuração Monorepo
```json
// package.json (raiz - novo)
{
    "workspaces": [
        "packages/*"
    ],
    "scripts": {
        "build": "npm run build --workspaces",
        "test": "npm test --workspaces",
        "publish": "npm publish --workspaces"
    }
}
```

---

## 📦 Estrutura Final do Projeto

### Pacotes Modificados
```bash
packages/
├── cli/                     # ✅ Mantido + Modificado
│   ├── src/
│   │   ├── commands/       # 🆕 +4 novos comandos
│   │   │   ├── init.ts     # ✅ Mantido
│   │   │   ├── update.ts   # ✅ Mantido
│   │   │   ├── status.ts   # 🆕 Novo
│   │   │   ├── advance.ts  # 🆕 Novo
│   │   │   ├── validate.ts # 🆕 Novo
│   │   │   └── universal.ts # 🆕 Novo
│   │   └── index.ts        # ✅ Modificado
│   ├── content/            # ✅ Mantido (250+ arquivos)
│   └── package.json        # ✅ Modificado
├── core/                   # 🆕 Novo pacote
│   ├── src/
│   │   ├── workflow-engine.ts
│   │   ├── state-manager.ts
│   │   ├── context-detector.ts
│   │   ├── skill-loader.ts
│   │   ├── rule-validator.ts
│   │   ├── universal-workflow.ts
│   │   └── conversation-manager.ts
│   └── types/
└── shared/                 # 🆕 Novo pacote
    ├── types/
    │   ├── workflow.ts
    │   ├── state.ts
    │   └── context.ts
    └── utils/
```

### Fluxo de Trabalho Atualizado

#### 1. Setup (Mantido + Melhorado)
```bash
# Usuário executa (já existente)
npx @maestro-ai/cli

# 🆕 Agora cria estado inicial inteligente
# 🆕 Detecta tipo de projeto automaticamente
# 🆕 Configura complexidade adequada
```

#### 2. Uso Diário (Novo)
```bash
# 🆕 Comando universal inteligente
maestro universal

# 🆕 Ou comandos específicos
maestro status      # Ver progresso
maestro advance     # Avançar fase
maestro validate    # Validar qualidade
```

#### 3. Integração com IDE (Mantido + Expandido)
```bash
# Windsurf (já existente + novo)
/maestro            # 🆕 Agora é inteligente
/status-projeto     # ✅ Já existe + melhorado
/avancar-fase       # ✅ Já existe + com validação
```

---

## 🎯 Benefícios das Modificações

### Para o Usuário
- **🤖 Inteligência**: O sistema agora detecta estado e sugere ações
- **🔄 Continuidade**: Retoma exatamente de onde parou
- **📊 Qualidade**: Validação automática de entregáveis
- **🎯 Foco**: Usuário só se preocupa com o conteúdo

### Para o Sistema
- **📈 Escalabilidade**: Arquitetura modular com pacotes separados
- **🔧 Manutenibilidade**: Core separado da interface CLI
- **🧪 Testabilidade**: Componentes isolados e testáveis
- **🚀 Performance**: Cache de estado e contexto inteligente

### Para o Desenvolvedor
- **🔄 Compatibilidade**: Mantém tudo que já funciona
- **📦 Modularidade**: Novos recursos sem quebrar existentes
- **🛠️ Extensibilidade**: Fácil adicionar novos workflows e skills
- **📚 Documentação**: API clara e bem definida

---

## 📋 Cronograma de Modificações

### Semana 1: Estrutura Base
- [ ] Criar pacotes `core` e `shared`
- [ ] Configurar monorepo com workspaces
- [ ] Implementar `StateManager` básico
- [ ] Modificar `init.ts` para criar estado inicial

### Semana 2: Novos Comandos CLI
- [ ] Implementar `status.ts`
- [ ] Implementar `advance.ts`
- [ ] Implementar `validate.ts`
- [ ] Implementar `universal.ts`
- [ ] Atualizar `index.ts` com novos comandos

### Semana 3: Workflow Engine
- [ ] Implementar `WorkflowEngine`
- [ ] Integrar com content existente
- [ ] Implementar execução de fases
- [ ] Adicionar validação básica

### Semana 4: Context Detector
- [ ] Implementar `ContextDetector`
- [ ] Integrar com specialists e templates
- [ ] Implementar carregamento de artefatos
- [ ] Adicionar análise de contexto

### Semana 5: Universal Workflow
- [ ] Implementar `UniversalWorkflow`
- [ ] Adicionar lógica de detecção de estado
- [ ] Implementar fluxos conversacionais
- [ ] Integrar com workflows existentes

### Semana 6: Rule Validator
- [ ] Implementar `RuleValidator`
- [ ] Integrar com rules do content
- [ ] Implementar sistema de scoring
- [ ] Adicionar validação cruzada

### Semana 7: Quality Gates
- [ ] Implementar `QualityGates`
- [ ] Definir gates por fase
- [ ] Implementar validação de transição
- [ ] Adicionar métricas de qualidade

### Semana 8: Conversation Manager
- [ ] Implementar `ConversationManager`
- [ ] Criar respostas contextuais
- [ ] Integrar com comandos CLI
- [ ] Adicionar interface conversacional

### Semana 9: Integração e Testes
- [ ] Integrar todos os componentes
- [ ] Implementar testes unitários
- [ ] Implementar testes de integração
- [ ] Corrigir bugs e ajustes

### Semana 10: Performance e Otimização
- [ ] Otimizar carregamento de estado
- [ ] Implementar cache de contexto
- [ ] Otimizar validações
- [ ] Melhorar performance geral

### Semana 11: Documentação
- [ ] Documentar API do core
- [ ] Atualizar documentação do CLI
- [ ] Criar guias de uso
- [ ] Adicionar exemplos

### Semana 12: Deploy e Release
- [ ] Build e testes finais
- [ ] Publicar novos pacotes
- [ ] Atualizar CLI existente
- [ ] Comunicar mudanças

---

## 🎯 Conclusão

### **O que muda na prática:**

1. **CLI mantido** - Todo o investimento existente é preservado
2. **Core adicionado** - Inteligência e orquestração sem modificar interface
3. **Experiência expandida** - De setup estático para orquestração dinâmica
4. **Compatibilidade total** - Workflows existentes continuam funcionando

### **Resultado final:**
- **Setup instantâneo** (já existe) + **orquestração inteligente** (novo)
- **250+ arquivos** (já existem) + **motor de execução** (novo)
- **Compatibilidade IDE** (já existe) + **conversação natural** (novo)
- **Estrutura completa** (já existe) + **estado persistente** (novo)

Esta abordagem garante que o valor já criado seja preservado enquanto adicionamos a camada de inteligência que transforma o Maestro de um gerador de templates para um verdadeiro sistema de orquestração de projetos.
