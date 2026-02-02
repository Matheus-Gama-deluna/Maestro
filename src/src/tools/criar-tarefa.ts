import type { ToolResult } from "../types/index.js";
import { parsearEstado, serializarEstado } from "../state/storage.js";
import type { TaskType, TaskPriority } from "../types/tasks.js";
import { globalTaskManager } from "../tasks/task-manager.js";
import { logEvent, EventTypes } from "../utils/history.js";

interface CriarTarefaArgs {
    type: TaskType;
    title: string;
    description: string;
    priority?: TaskPriority;
    parent_id?: string;
    phase?: number;
    estimate_hours?: number;
    tags?: string[];
    estado_json: string;
    diretorio: string;
}

export async function criarTarefa(args: CriarTarefaArgs): Promise<ToolResult> {
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

    if (!estado.tasks) {
        estado.tasks = [];
    }

    const task = globalTaskManager.createTask(
        args.type,
        args.title,
        args.description,
        {
            priority: args.priority || 'medium',
            parent_id: args.parent_id,
            phase: args.phase || estado.fase_atual,
            estimate_hours: args.estimate_hours,
            tags: args.tags || [],
        }
    );

    estado.tasks.push(task);

    const estadoAtualizado = serializarEstado(estado);

    await logEvent(args.diretorio, {
        type: EventTypes.TASK_CREATED,
        fase: estado.fase_atual || task.phase || 0,
        data: {
            task_id: task.id,
            type: task.type,
            title: task.title,
            phase: task.phase,
        }
    });

    const hierarchy = getTaskHierarchy(task);

    return {
        content: [{
            type: "text",
            text: `# ✅ Tarefa Criada

${hierarchy}

## 📋 Detalhes

- **ID:** \`${task.id}\`
- **Tipo:** ${formatTaskType(task.type)}
- **Título:** ${task.title}
- **Descrição:** ${task.description}
- **Prioridade:** ${formatPriority(task.priority)}
- **Status:** ${formatStatus(task.status)}
- **Fase:** ${task.phase || 'N/A'}
- **Estimativa:** ${task.estimate_hours ? `${task.estimate_hours}h` : 'Não definida'}
- **Tags:** ${task.tags.length > 0 ? task.tags.join(', ') : 'Nenhuma'}

${task.parent_id ? `**Tarefa Pai:** \`${task.parent_id}\`` : ''}

---

**Próximos Passos:**
- Use \`listar_tarefas()\` para ver todas as tarefas
- Use \`atualizar_tarefa()\` para mudar status ou adicionar informações
- Use \`criar_tarefa()\` com \`parent_id: "${task.id}"\` para criar subtarefas

**Arquivo para salvar:**
\`\`\`json:.maestro/estado.json
${estadoAtualizado}
\`\`\`
`,
        }],
        isError: false,
    };
}

function getTaskHierarchy(task: any): string {
    const icons: Record<string, string> = {
        epic: '🎯',
        feature: '✨',
        story: '📖',
        task: '✅',
        subtask: '📝',
    };

    return `${icons[task.type] || '📋'} **${task.type.toUpperCase()}:** ${task.title}`;
}

function formatTaskType(type: TaskType): string {
    const labels: Record<TaskType, string> = {
        epic: '🎯 Epic',
        feature: '✨ Feature',
        story: '📖 Story',
        task: '✅ Task',
        subtask: '📝 Subtask',
    };
    return labels[type];
}

function formatPriority(priority: TaskPriority): string {
    const labels: Record<TaskPriority, string> = {
        critical: '🔴 Crítica',
        high: '🟠 Alta',
        medium: '🟡 Média',
        low: '🟢 Baixa',
    };
    return labels[priority];
}

function formatStatus(status: string): string {
    const labels: Record<string, string> = {
        todo: '⚪ A Fazer',
        in_progress: '🔵 Em Progresso',
        blocked: '🔴 Bloqueada',
        review: '🟣 Em Revisão',
        done: '✅ Concluída',
    };
    return labels[status] || status;
}
