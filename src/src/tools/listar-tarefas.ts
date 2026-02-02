import type { ToolResult } from "../types/index.js";
import { parsearEstado } from "../state/storage.js";
import { globalTaskManager } from "../tasks/task-manager.js";
import type { TaskFilter } from "../types/tasks.js";

interface ListarTarefasArgs {
    filter?: {
        type?: string[];
        status?: string[];
        priority?: string[];
        phase?: number[];
        parent_id?: string;
        tags?: string[];
    };
    estado_json: string;
    diretorio: string;
}

export async function listarTarefas(args: ListarTarefasArgs): Promise<ToolResult> {
    if (!args.estado_json) {
        return {
            content: [{
                type: "text",
                text: "❌ **Erro**: Parâmetro `estado_json` é obrigatório.",
            }],
            isError: true,
        };
    }

    if (!args.diretorio) {
        return {
            content: [{
                type: "text",
                text: "❌ **Erro**: Parâmetro `diretorio` é obrigatório.",
            }],
            isError: true,
        };
    }

    const estado = parsearEstado(args.estado_json);
    if (!estado) {
        return {
            content: [{
                type: "text",
                text: "❌ **Erro**: Não foi possível parsear o estado JSON.",
            }],
            isError: true,
        };
    }

    if (!estado.tasks || estado.tasks.length === 0) {
        return {
            content: [{
                type: "text",
                text: `# 📋 Nenhuma Tarefa Encontrada

O projeto ainda não possui tarefas cadastradas.

**Como criar tarefas:**
\`\`\`typescript
await criar_tarefa({
  type: "epic",
  title: "Título da tarefa",
  description: "Descrição detalhada",
  priority: "high",
  estado_json: estadoJson,
  diretorio: "./"
});
\`\`\`
`,
            }],
            isError: false,
        };
    }

    globalTaskManager.importTasks(estado.tasks);

    const filter: TaskFilter = {};
    if (args.filter) {
        if (args.filter.type) filter.type = args.filter.type as any;
        if (args.filter.status) filter.status = args.filter.status as any;
        if (args.filter.priority) filter.priority = args.filter.priority as any;
        if (args.filter.phase) filter.phase = args.filter.phase;
        if (args.filter.parent_id !== undefined) filter.parent_id = args.filter.parent_id;
        if (args.filter.tags) filter.tags = args.filter.tags;
    }

    const tasks = globalTaskManager.listTasks(filter);
    const progress = globalTaskManager.getProgress(filter);
    const stats = globalTaskManager.getStats(filter);

    let output = `# 📋 Lista de Tarefas

**Total:** ${tasks.length} tarefa(s)

## 📊 Progresso Geral

- ⚪ **A Fazer:** ${progress.todo}
- 🔵 **Em Progresso:** ${progress.in_progress}
- 🔴 **Bloqueadas:** ${progress.blocked}
- 🟣 **Em Revisão:** ${progress.review}
- ✅ **Concluídas:** ${progress.done}

**Conclusão:** ${progress.completion_percentage.toFixed(1)}%

---

## 📈 Estatísticas

### Por Tipo
${Object.entries(stats.by_type).map(([type, count]) => `- **${formatTaskType(type)}:** ${count}`).join('\n')}

### Por Prioridade
${Object.entries(stats.by_priority).map(([priority, count]) => `- **${formatPriority(priority)}:** ${count}`).join('\n')}

### Estimativas
- **Total Estimado:** ${stats.total_estimate}h
- **Total Real:** ${stats.total_actual}h
- **Variação:** ${stats.variance > 0 ? '+' : ''}${stats.variance}h

---

## 📝 Tarefas

`;

    const tasksByType = groupTasksByType(tasks);

    ['epic', 'feature', 'story', 'task', 'subtask'].forEach(type => {
        const typeTasks = tasksByType[type] || [];
        if (typeTasks.length > 0) {
            output += `\n### ${formatTaskType(type)} (${typeTasks.length})\n\n`;
            typeTasks.forEach(task => {
                output += formatTaskItem(task);
            });
        }
    });

    output += `\n---

**Filtros Aplicados:**
${args.filter ? JSON.stringify(args.filter, null, 2) : 'Nenhum'}

**Comandos:**
- \`criar_tarefa()\` - Criar nova tarefa
- \`atualizar_tarefa()\` - Atualizar tarefa existente
- \`listar_tarefas({ filter: {...} })\` - Filtrar tarefas
`;

    return {
        content: [{
            type: "text",
            text: output,
        }],
        isError: false,
    };
}

function groupTasksByType(tasks: any[]): Record<string, any[]> {
    return tasks.reduce((acc, task) => {
        if (!acc[task.type]) acc[task.type] = [];
        acc[task.type].push(task);
        return acc;
    }, {} as Record<string, any[]>);
}

function formatTaskItem(task: any): string {
    const statusIcon = getStatusIcon(task.status);
    const priorityIcon = getPriorityIcon(task.priority);
    
    let item = `${statusIcon} **${task.title}**\n`;
    item += `   - ID: \`${task.id}\`\n`;
    item += `   - Prioridade: ${priorityIcon} ${task.priority}\n`;
    item += `   - Status: ${task.status}\n`;
    
    if (task.phase) {
        item += `   - Fase: ${task.phase}\n`;
    }
    
    if (task.estimate_hours) {
        item += `   - Estimativa: ${task.estimate_hours}h`;
        if (task.actual_hours) {
            item += ` | Real: ${task.actual_hours}h`;
        }
        item += `\n`;
    }
    
    if (task.parent_id) {
        item += `   - Pai: \`${task.parent_id}\`\n`;
    }
    
    if (task.children_ids.length > 0) {
        item += `   - Filhos: ${task.children_ids.length}\n`;
    }
    
    if (task.dependencies.length > 0) {
        item += `   - Dependências: ${task.dependencies.length}\n`;
    }
    
    if (task.tags.length > 0) {
        item += `   - Tags: ${task.tags.join(', ')}\n`;
    }
    
    item += `\n`;
    return item;
}

function formatTaskType(type: string): string {
    const labels: Record<string, string> = {
        epic: '🎯 Epics',
        feature: '✨ Features',
        story: '📖 Stories',
        task: '✅ Tasks',
        subtask: '📝 Subtasks',
    };
    return labels[type] || type;
}

function formatPriority(priority: string): string {
    const labels: Record<string, string> = {
        critical: '🔴 Crítica',
        high: '🟠 Alta',
        medium: '🟡 Média',
        low: '🟢 Baixa',
    };
    return labels[priority] || priority;
}

function getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
        todo: '⚪',
        in_progress: '🔵',
        blocked: '🔴',
        review: '🟣',
        done: '✅',
    };
    return icons[status] || '⚪';
}

function getPriorityIcon(priority: string): string {
    const icons: Record<string, string> = {
        critical: '🔴',
        high: '🟠',
        medium: '🟡',
        low: '🟢',
    };
    return icons[priority] || '🟡';
}
