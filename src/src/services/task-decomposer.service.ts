/**
 * TaskDecomposer — Decompõe entregável de arquitetura em tasks executáveis
 *
 * Recebe o documento de arquitetura e gera uma hierarquia de tasks:
 * - Epics: módulos principais (ex: "API Auth", "API Users")
 * - Stories: funcionalidades dentro do módulo (ex: "Login endpoint")
 * - Tasks: unidades de trabalho (ex: "Criar route handler", "Criar testes")
 *
 * @since v6.5
 */

import { randomUUID } from "crypto";

export interface TaskItem {
    id: string;
    type: 'epic' | 'feature' | 'story' | 'task' | 'subtask';
    title: string;
    description: string;
    status: 'todo' | 'in_progress' | 'blocked' | 'review' | 'done';
    priority: 'critical' | 'high' | 'medium' | 'low';
    parent_id?: string;
    children_ids: string[];
    dependencies: string[];
    phase?: number;
    estimate_hours?: number;
    created_at: string;
    updated_at: string;
    tags: string[];
    metadata?: {
        files?: string[];
        tests?: string[];
        acceptance_criteria?: string[];
    };
}

/**
 * Gera uma estrutura de tasks a partir do entregável de arquitetura.
 *
 * A IA fornece o documento de arquitetura como texto. Este serviço extrai:
 * - Seções com ## ou ### como potenciais epics/stories
 * - Listas de itens como tasks
 * - Referências a arquivos como metadata.files
 *
 * @param arquiteturaContent - Conteúdo do documento de arquitetura (Markdown)
 * @param faseNumero - Número da fase de código (ex: 5 para Backend, 6 para Frontend)
 * @returns Array de TaskItem hierárquicas
 */
export function decomposeArchitectureToTasks(
    arquiteturaContent: string,
    faseNumero: number
): TaskItem[] {
    const tasks: TaskItem[] = [];

    // Extrair seções H2 como epics
    const epicSections = extractSections(arquiteturaContent, 2);

    for (const section of epicSections) {
        const epicId = generateId();
        const childIds: string[] = [];

        // Extrair subsections H3 como stories
        const storySections = extractSections(section.content, 3);

        for (const story of storySections) {
            const storyId = generateId();
            childIds.push(storyId);

            // Gerar tasks padrão para cada story
            const taskIds: string[] = [];

            // Task: implementação
            const implTaskId = generateId();
            taskIds.push(implTaskId);
            tasks.push(createTask({
                id: implTaskId,
                type: 'task',
                title: `Implementar: ${story.title}`,
                description: `Implementar a funcionalidade "${story.title}" conforme especificado na arquitetura.`,
                parent_id: storyId,
                phase: faseNumero,
                tags: ['implementation'],
                metadata: { acceptance_criteria: extractListItems(story.content) },
            }));

            // Task: testes
            const testTaskId = generateId();
            taskIds.push(testTaskId);
            tasks.push(createTask({
                id: testTaskId,
                type: 'task',
                title: `Testes: ${story.title}`,
                description: `Criar testes unitários e de integração para "${story.title}".`,
                parent_id: storyId,
                phase: faseNumero,
                dependencies: [implTaskId],
                tags: ['testing'],
            }));

            // Story
            tasks.push(createTask({
                id: storyId,
                type: 'story',
                title: story.title,
                description: story.content.substring(0, 200),
                parent_id: epicId,
                children_ids: taskIds,
                phase: faseNumero,
                tags: ['story'],
            }));
        }

        // Epic
        tasks.push(createTask({
            id: epicId,
            type: 'epic',
            title: section.title,
            description: `Epic: ${section.title}`,
            children_ids: childIds,
            phase: faseNumero,
            priority: 'high',
            tags: ['epic'],
        }));
    }

    return tasks;
}

/**
 * Retorna a próxima task a ser executada (status=todo, sem dependências bloqueadas).
 */
export function getNextTask(tasks: TaskItem[]): TaskItem | null {
    const doneTasks = new Set(tasks.filter(t => t.status === 'done').map(t => t.id));

    return tasks.find(t => {
        if (t.type !== 'task' && t.type !== 'subtask') return false;
        if (t.status !== 'todo') return false;
        // Verificar se todas as dependências estão done
        return t.dependencies.every(dep => doneTasks.has(dep));
    }) || null;
}

/**
 * Calcula progresso das tasks para uma fase específica.
 */
export function getTaskProgress(tasks: TaskItem[], phase: number): {
    total: number;
    done: number;
    inProgress: number;
    blocked: number;
    percentage: number;
} {
    const phaseTasks = tasks.filter(t => t.phase === phase && (t.type === 'task' || t.type === 'subtask'));
    const done = phaseTasks.filter(t => t.status === 'done').length;
    const inProgress = phaseTasks.filter(t => t.status === 'in_progress').length;
    const blocked = phaseTasks.filter(t => t.status === 'blocked').length;

    return {
        total: phaseTasks.length,
        done,
        inProgress,
        blocked,
        percentage: phaseTasks.length > 0 ? Math.round((done / phaseTasks.length) * 100) : 0,
    };
}

/**
 * v8.0: Decompõe o backlog em tasks executáveis para fases de código.
 *
 * Em vez de parsear H2/H3 de um documento markdown genérico,
 * esta função extrai User Stories do backlog e filtra por relevância
 * para a fase atual (Frontend, Backend, Integração, Deploy).
 *
 * Se o backlog não for encontrado ou não tiver US parseáveis,
 * faz fallback para decomposeArchitectureToTasks().
 *
 * @param backlogContent - Conteúdo do backlog.md
 * @param openApiContent - Conteúdo do openapi.yaml (opcional, para enriquecer tasks)
 * @param faseNumero - Número da fase de código
 * @param faseNome - Nome da fase ('Frontend', 'Backend', 'Integração', 'Deploy Final')
 * @returns Array de TaskItem hierárquicas baseadas nas User Stories
 */
export function decomposeBacklogToTasks(
    backlogContent: string,
    openApiContent: string | null,
    faseNumero: number,
    faseNome: string
): TaskItem[] {
    const tasks: TaskItem[] = [];

    // 1. Extrair user stories do backlog
    const stories = extractUserStories(backlogContent);
    if (stories.length === 0) {
        // Fallback: usar decomposição por H2/H3 do backlog como markdown
        return decomposeArchitectureToTasks(backlogContent, faseNumero);
    }

    // 2. Filtrar por tipo relevante à fase
    const relevantStories = stories.filter(s =>
        isRelevantForPhase(s, faseNome)
    );

    // Se nenhuma story é relevante para a fase, usar todas (melhor que zero)
    const storiesToUse = relevantStories.length > 0 ? relevantStories : stories;

    // 3. Extrair endpoints do OpenAPI (se disponível) para enriquecer tasks
    const endpoints = openApiContent ? extractOpenApiEndpoints(openApiContent) : [];

    // 4. Gerar task de Setup como primeira task
    const setupEpicId = generateId();
    const setupTaskId = generateId();
    const setupSubTasks: string[] = [];

    const setupTask = createTask({
        id: setupTaskId,
        type: 'task',
        title: `Setup: Inicializar projeto ${faseNome}`,
        description: buildSetupDescription(faseNome, endpoints),
        parent_id: setupEpicId,
        phase: faseNumero,
        priority: 'critical',
        tags: ['setup', faseNome.toLowerCase()],
    });
    tasks.push(setupTask);
    setupSubTasks.push(setupTaskId);

    // 5. Para cada story relevante, gerar sub-tasks baseadas no tipo da fase
    const storyEpicId = generateId();
    const storyChildIds: string[] = [];

    for (const story of storiesToUse) {
        const storyId = generateId();
        const taskIds: string[] = [];

        // Gerar sub-tasks específicas por tipo de fase
        const subTaskTemplates = getSubTaskTemplates(faseNome, story, endpoints);
        for (const tmpl of subTaskTemplates) {
            const taskId = generateId();
            taskIds.push(taskId);
            tasks.push(createTask({
                id: taskId,
                type: 'task',
                title: tmpl.title,
                description: tmpl.description,
                parent_id: storyId,
                phase: faseNumero,
                priority: story.priority || 'medium',
                dependencies: tmpl.dependsOnPrev && taskIds.length > 1 ? [taskIds[taskIds.length - 2]] : [],
                tags: [faseNome.toLowerCase(), story.id.toLowerCase(), tmpl.tag],
                metadata: {
                    files: tmpl.expectedFiles,
                    acceptance_criteria: tmpl.acceptanceCriteria,
                },
            }));
        }

        // Story wrapper
        storyChildIds.push(storyId);
        tasks.push(createTask({
            id: storyId,
            type: 'story',
            title: `${story.id}: ${story.title}`,
            description: `${story.description} (${story.points}pts)`,
            parent_id: storyEpicId,
            children_ids: taskIds,
            phase: faseNumero,
            priority: story.priority || 'medium',
            tags: ['story', story.id.toLowerCase(), story.tipo.toLowerCase()],
        }));
    }

    // Setup epic
    tasks.push(createTask({
        id: setupEpicId,
        type: 'epic',
        title: `Setup ${faseNome}`,
        description: `Configuração inicial do projeto ${faseNome}`,
        children_ids: setupSubTasks,
        phase: faseNumero,
        priority: 'critical',
        tags: ['epic', 'setup'],
    }));

    // Implementation epic
    tasks.push(createTask({
        id: storyEpicId,
        type: 'epic',
        title: `Implementação ${faseNome}`,
        description: `User Stories para ${faseNome}: ${storiesToUse.map(s => s.id).join(', ')}`,
        children_ids: storyChildIds,
        phase: faseNumero,
        priority: 'high',
        tags: ['epic', 'implementation'],
    }));

    return tasks;
}

// === BACKLOG PARSING HELPERS ===

interface ParsedUserStory {
    id: string;         // US-020
    title: string;      // "cadastrar/editar produtos com estoque mínimo"
    description: string;
    tipo: string;       // "FE+BE", "FE", "BE", "Integração", "Setup", "Infra"
    points: number;
    priority: 'critical' | 'high' | 'medium' | 'low';
    deps: string[];     // ["US-010"]
    dod: string;        // "CRUD completo + testes"
}

/**
 * Extrai user stories do conteúdo do backlog.
 * Parseia tabelas markdown com formato:
 * | ID | User Story | Tipo | Dep | Est. | DoD principal |
 */
function extractUserStories(backlogContent: string): ParsedUserStory[] {
    const stories: ParsedUserStory[] = [];
    const lines = backlogContent.split('\n');

    for (const line of lines) {
        // Buscar linhas de tabela que começam com | US-
        const match = line.match(/\|\s*(US-\d+)\s*\|\s*(.+?)\s*\|\s*(\S+)\s*\|\s*(\S*)\s*\|\s*(\d+)\s*pts?\s*\|\s*(.+?)\s*\|/);
        if (match) {
            const [, id, storyText, tipo, deps, points, dod] = match;
            // Extrair título limpo (remover "Como X quero Y")
            const titleMatch = storyText.match(/(?:quero|want)\s+(.+)/i);
            const title = titleMatch ? titleMatch[1].trim() : storyText.trim();

            stories.push({
                id,
                title,
                description: storyText.trim(),
                tipo: tipo.trim(),
                points: parseInt(points, 10),
                priority: parseInt(points, 10) >= 8 ? 'high' : 'medium',
                deps: deps.trim() ? deps.split(/[,;]/).map(d => d.trim()).filter(Boolean) : [],
                dod: dod.trim(),
            });
        }
    }

    return stories;
}

/**
 * Determina se uma user story é relevante para a fase atual.
 */
function isRelevantForPhase(story: ParsedUserStory, faseNome: string): boolean {
    const tipo = story.tipo.toLowerCase();
    const fase = faseNome.toLowerCase();

    if (fase.includes('frontend')) {
        return tipo.includes('fe') || tipo === 'setup';
    }
    if (fase.includes('backend')) {
        return tipo.includes('be') || tipo === 'setup';
    }
    if (fase.includes('integra')) {
        return tipo.includes('integra') || tipo.includes('fe+be');
    }
    if (fase.includes('deploy')) {
        return tipo.includes('infra') || tipo.includes('deploy') || tipo === 'setup';
    }
    return true; // Se não reconhece a fase, inclui tudo
}

/**
 * Extrai endpoints do OpenAPI YAML (parsing simplificado).
 * Retorna lista de { method, path, tag, summary }
 */
interface ParsedEndpoint {
    method: string;
    path: string;
    tag: string;
    summary: string;
}

function extractOpenApiEndpoints(yamlContent: string): ParsedEndpoint[] {
    const endpoints: ParsedEndpoint[] = [];
    const lines = yamlContent.split('\n');
    let currentPath = '';
    let currentMethod = '';
    let currentTag = '';
    let currentSummary = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Detectar paths (ex: /products:)
        const pathMatch = line.match(/^  (\/\S+):$/);
        if (pathMatch) {
            currentPath = pathMatch[1];
            continue;
        }
        // Detectar methods (ex: get:, post:, put:, delete:)
        const methodMatch = line.match(/^\s{4}(get|post|put|delete|patch):$/);
        if (methodMatch && currentPath) {
            currentMethod = methodMatch[1].toUpperCase();
            currentTag = '';
            currentSummary = '';
            continue;
        }
        // Detectar tags
        const tagMatch = line.match(/^\s+tags:\s*\[(.+)\]/);
        if (tagMatch && currentMethod) {
            currentTag = tagMatch[1].replace(/['"]/g, '').trim();
        }
        // Detectar summary
        const summaryMatch = line.match(/^\s+summary:\s*(.+)/);
        if (summaryMatch && currentMethod) {
            currentSummary = summaryMatch[1].trim();
            endpoints.push({
                method: currentMethod,
                path: currentPath,
                tag: currentTag,
                summary: currentSummary,
            });
            currentMethod = '';
        }
    }

    return endpoints;
}

interface SubTaskTemplate {
    title: string;
    description: string;
    tag: string;
    dependsOnPrev: boolean;
    expectedFiles?: string[];
    acceptanceCriteria?: string[];
}

/**
 * Gera templates de sub-tasks específicas por tipo de fase.
 */
function getSubTaskTemplates(
    faseNome: string,
    story: ParsedUserStory,
    endpoints: ParsedEndpoint[]
): SubTaskTemplate[] {
    const fase = faseNome.toLowerCase();
    const storyEndpoints = endpoints.filter(e =>
        story.title.toLowerCase().includes(e.tag.toLowerCase()) ||
        e.tag.toLowerCase().includes(story.id.toLowerCase().replace('us-', ''))
    );
    const endpointList = storyEndpoints.length > 0
        ? storyEndpoints.map(e => `${e.method} ${e.path}`).join(', ')
        : 'ver OpenAPI';

    if (fase.includes('frontend')) {
        return [
            {
                title: `Componentes UI: ${story.id}`,
                description: `Criar componentes React para ${story.title}. Endpoints: ${endpointList}`,
                tag: 'component',
                dependsOnPrev: false,
                acceptanceCriteria: ['Componentes criados', 'Props tipadas', 'Responsivo'],
            },
            {
                title: `Hooks/API: ${story.id}`,
                description: `Criar hooks React Query para consumir API. Endpoints: ${endpointList}`,
                tag: 'hook',
                dependsOnPrev: true,
                acceptanceCriteria: ['Hooks com loading/error states', 'Tipagem completa'],
            },
            {
                title: `Pages/Routes: ${story.id}`,
                description: `Criar páginas e rotas para ${story.title}`,
                tag: 'page',
                dependsOnPrev: true,
                acceptanceCriteria: ['Páginas funcionais', 'Navegação correta'],
            },
            {
                title: `Testes: ${story.id}`,
                description: `Testes unitários para componentes e hooks de ${story.title}`,
                tag: 'test',
                dependsOnPrev: true,
                acceptanceCriteria: ['Testes passando', 'Cobertura mínima'],
            },
        ];
    }

    if (fase.includes('backend')) {
        return [
            {
                title: `DTOs/Validação: ${story.id}`,
                description: `Criar DTOs com validação de input para ${story.title}. Endpoints: ${endpointList}`,
                tag: 'dto',
                dependsOnPrev: false,
                acceptanceCriteria: ['DTOs tipados', 'Validação com Zod/class-validator'],
            },
            {
                title: `Service/Domain: ${story.id}`,
                description: `Implementar regras de negócio para ${story.title}`,
                tag: 'service',
                dependsOnPrev: true,
                acceptanceCriteria: ['Lógica de negócio implementada', 'Erros tratados'],
            },
            {
                title: `Controller/Routes: ${story.id}`,
                description: `Criar endpoints REST para ${story.title}. Endpoints: ${endpointList}`,
                tag: 'controller',
                dependsOnPrev: true,
                acceptanceCriteria: ['Endpoints conforme OpenAPI', 'Auth/RBAC aplicado'],
            },
            {
                title: `Testes: ${story.id}`,
                description: `Testes unitários e de integração para ${story.title}`,
                tag: 'test',
                dependsOnPrev: true,
                acceptanceCriteria: ['Testes passando', 'Cobertura ≥85%'],
            },
        ];
    }

    if (fase.includes('integra')) {
        return [
            {
                title: `Remover mocks: ${story.id}`,
                description: `Substituir mocks por chamadas reais ao backend para ${story.title}`,
                tag: 'integration',
                dependsOnPrev: false,
                acceptanceCriteria: ['Mocks removidos', 'Chamadas reais funcionando'],
            },
            {
                title: `E2E: ${story.id}`,
                description: `Testes end-to-end para o fluxo completo de ${story.title}`,
                tag: 'e2e',
                dependsOnPrev: true,
                acceptanceCriteria: ['Testes E2E passando', 'Fluxo completo validado'],
            },
        ];
    }

    // Deploy ou genérico
    return [
        {
            title: `Implementar: ${story.id}`,
            description: `Implementar ${story.title}. ${story.dod}`,
            tag: 'implementation',
            dependsOnPrev: false,
            acceptanceCriteria: [story.dod],
        },
        {
            title: `Testes: ${story.id}`,
            description: `Validar ${story.title}`,
            tag: 'test',
            dependsOnPrev: true,
            acceptanceCriteria: ['Validação completa'],
        },
    ];
}

/**
 * Gera descrição de setup específica por fase.
 */
function buildSetupDescription(faseNome: string, endpoints: ParsedEndpoint[]): string {
    const fase = faseNome.toLowerCase();

    if (fase.includes('frontend')) {
        return `Inicializar projeto Frontend:\n` +
            `- Criar projeto com framework definido na Arquitetura\n` +
            `- Instalar dependências (state management, UI lib, testing)\n` +
            `- Configurar mock server (MSW) com tipos do OpenAPI\n` +
            `- Estrutura de diretórios: components/, pages/, hooks/, lib/api/\n` +
            (endpoints.length > 0 ? `- ${endpoints.length} endpoints disponíveis no OpenAPI` : '');
    }

    if (fase.includes('backend')) {
        return `Inicializar projeto Backend:\n` +
            `- Criar projeto com framework definido na Arquitetura\n` +
            `- Configurar ORM e conexão com banco de dados\n` +
            `- Rodar migrações a partir do design-banco.md\n` +
            `- Estrutura: controllers/, services/, repositories/, dtos/\n` +
            (endpoints.length > 0 ? `- ${endpoints.length} endpoints a implementar conforme OpenAPI` : '');
    }

    if (fase.includes('integra')) {
        return `Setup de Integração:\n` +
            `- Configurar variáveis de ambiente (.env)\n` +
            `- Configurar CORS e proxy\n` +
            `- Substituir mock server por URLs reais\n` +
            `- Configurar testes E2E (Playwright/Cypress)`;
    }

    return `Setup ${faseNome}:\n- Configurar ambiente e dependências`;
}

// === HELPERS ===

function generateId(): string {
    return `task-${randomUUID().substring(0, 8)}`;
}

interface Section {
    title: string;
    content: string;
}

function extractSections(markdown: string, level: number): Section[] {
    const prefix = '#'.repeat(level) + ' ';
    const lines = markdown.split('\n');
    const sections: Section[] = [];
    let current: Section | null = null;

    for (const line of lines) {
        if (line.startsWith(prefix)) {
            if (current) sections.push(current);
            current = { title: line.substring(prefix.length).trim(), content: '' };
        } else if (current) {
            current.content += line + '\n';
        }
    }
    if (current) sections.push(current);

    return sections;
}

function extractListItems(content: string): string[] {
    return content.split('\n')
        .filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* '))
        .map(line => line.trim().replace(/^[-*]\s+/, ''));
}

function createTask(partial: Partial<TaskItem> & { id: string; type: TaskItem['type']; title: string }): TaskItem {
    const now = new Date().toISOString();
    return {
        description: '',
        status: 'todo',
        priority: 'medium',
        children_ids: [],
        dependencies: [],
        tags: [],
        created_at: now,
        updated_at: now,
        ...partial,
    };
}
