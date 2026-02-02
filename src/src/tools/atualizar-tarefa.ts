import type { ToolResult } from "../types/index.js";
import { parsearEstado, serializarEstado } from "../state/storage.js";
import { globalTaskManager } from "../tasks/task-manager.js";
import type { TaskUpdate } from "../types/tasks.js";
import { logEvent, EventTypes } from "../utils/history.js";

interface AtualizarTarefaArgs {
    task_id: string;
    update: {
        status?: string;
        priority?: string;
        description?: string;
        estimate_hours?: number;
        actual_hours?: number;
        tags?: string[];
    };
    estado_json: string;
    diretorio: string;
}

export async function atualizarTarefa(args: AtualizarTarefaArgs): Promise<ToolResult> {
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

    if (!args.task_id) {
        return {
            content: [{
                type: "text",
                text: "❌ **Erro**: Parâmetro `task_id` é obrigatório.",
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
                text: "❌ **Erro**: Projeto não possui tarefas cadastradas.",
            }],
            isError: true,
        };
    }

    globalTaskManager.importTasks(estado.tasks);

    const taskBefore = globalTaskManager.getTask(args.task_id);
    if (!taskBefore) {
        return {
            content: [{
                type: "text",
                text: `❌ **Erro**: Tarefa com ID \`${args.task_id}\` não encontrada.`,
            }],
            isError: true,
        };
    }

    const update: TaskUpdate = {};
    if (args.update.status) update.status = args.update.status as any;
    if (args.update.priority) update.priority = args.update.priority as any;
    if (args.update.description) update.description = args.update.description;
    if (args.update.estimate_hours !== undefined) update.estimate_hours = args.update.estimate_hours;
    if (args.update.actual_hours !== undefined) update.actual_hours = args.update.actual_hours;
    if (args.update.tags) update.tags = args.update.tags;

    const taskAfter = globalTaskManager.updateTask(args.task_id, update);
    if (!taskAfter) {
        return {
            content: [{
                type: "text",
                text: `❌ **Erro**: Não foi possível atualizar a tarefa.`,
            }],
            isError: true,
        };
    }

    estado.tasks = globalTaskManager.exportTasks();
    const estadoAtualizado = serializarEstado(estado);

    const eventType = taskAfter.status === 'done' ? EventTypes.TASK_COMPLETED : EventTypes.TASK_UPDATED;
    await logEvent(args.diretorio, {
        type: eventType,
        fase: estado.fase_atual,
        data: {
            task_id: args.task_id,
            changes: args.update,
            status_before: taskBefore.status,
            status_after: taskAfter.status,
        }
    });

    const changes = buildChangesSummary(taskBefore, taskAfter);

    return {
        content: [{
            type: "text",
            text: `# ✅ Tarefa Atualizada

${getTaskHierarchy(taskAfter)}

## 📝 Alterações

${changes}

## 📋 Estado Atual

- **ID:** \`${taskAfter.id}\`
- **Tipo:** ${formatTaskType(taskAfter.type)}
- **Título:** ${taskAfter.title}
- **Status:** ${formatStatus(taskAfter.status)}
- **Prioridade:** ${formatPriority(taskAfter.priority)}
- **Fase:** ${taskAfter.phase || 'N/A'}
- **Estimativa:** ${taskAfter.estimate_hours ? `${taskAfter.estimate_hours}h` : 'Não definida'}
- **Real:** ${taskAfter.actual_hours ? `${taskAfter.actual_hours}h` : 'Não registrado'}
- **Tags:** ${taskAfter.tags.length > 0 ? taskAfter.tags.join(', ') : 'Nenhuma'}

${taskAfter.status === 'done' ? '\n🎉 **Tarefa Concluída!**\n' : ''}

---

**Próximos Passos:**
- Use \`listar_tarefas()\` para ver todas as tarefas
- Use \`atualizar_tarefa()\` para fazer mais alterações

**Arquivo para salvar:**
\`\`\`json:.maestro/estado.json
${estadoAtualizado}
\`\`\`
`,
        }],
        isError: false,
    };
}

function buildChangesSummary(before: any, after: any): string {
    const changes: string[] = [];

    if (before.status !== after.status) {
        changes.push(`- **Status:** ${formatStatus(before.status)} → ${formatStatus(after.status)}`);
    }

    if (before.priority !== after.priority) {
        changes.push(`- **Prioridade:** ${formatPriority(before.priority)} → ${formatPriority(after.priority)}`);
    }

    if (before.description !== after.description) {
        changes.push(`- **Descrição:** Atualizada`);
    }

    if (before.estimate_hours !== after.estimate_hours) {
        changes.push(`- **Estimativa:** ${before.estimate_hours || 0}h → ${after.estimate_hours || 0}h`);
    }

    if (before.actual_hours !== after.actual_hours) {
        changes.push(`- **Horas Reais:** ${before.actual_hours || 0}h → ${after.actual_hours || 0}h`);
    }

    if (JSON.stringify(before.tags) !== JSON.stringify(after.tags)) {
        changes.push(`- **Tags:** ${before.tags.join(', ') || 'Nenhuma'} → ${after.tags.join(', ') || 'Nenhuma'}`);
    }

    return changes.length > 0 ? changes.join('\n') : '- Nenhuma alteração registrada';
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

function formatTaskType(type: string): string {
    const labels: Record<string, string> = {
        epic: '🎯 Epic',
        feature: '✨ Feature',
        story: '📖 Story',
        task: '✅ Task',
        subtask: '📝 Subtask',
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
