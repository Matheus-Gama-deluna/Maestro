import { randomUUID } from 'crypto';
import type {
    Task,
    TaskType,
    TaskStatus,
    TaskPriority,
    TaskFilter,
    TaskUpdate,
    TaskProgress,
    TaskStats,
    TaskDependency,
    TaskBreakdown,
} from '../types/tasks.js';

export class TaskManager {
    private tasks: Map<string, Task>;

    constructor() {
        this.tasks = new Map();
    }

    createTask(
        type: TaskType,
        title: string,
        description: string,
        options: {
            priority?: TaskPriority;
            parent_id?: string;
            phase?: number;
            assignee?: string;
            estimate_hours?: number;
            tags?: string[];
        } = {}
    ): Task {
        const task: Task = {
            id: randomUUID(),
            type,
            title,
            description,
            status: 'todo',
            priority: options.priority || 'medium',
            parent_id: options.parent_id,
            children_ids: [],
            dependencies: [],
            phase: options.phase,
            assignee: options.assignee,
            estimate_hours: options.estimate_hours,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            tags: options.tags || [],
            metadata: {},
        };

        this.tasks.set(task.id, task);

        if (task.parent_id) {
            const parent = this.tasks.get(task.parent_id);
            if (parent) {
                parent.children_ids.push(task.id);
                parent.updated_at = new Date().toISOString();
            }
        }

        return task;
    }

    getTask(id: string): Task | undefined {
        return this.tasks.get(id);
    }

    updateTask(id: string, update: TaskUpdate): Task | null {
        const task = this.tasks.get(id);
        if (!task) {
            return null;
        }

        if (update.status) {
            task.status = update.status;
            if (update.status === 'in_progress' && !task.started_at) {
                task.started_at = new Date().toISOString();
            }
            if (update.status === 'done' && !task.completed_at) {
                task.completed_at = new Date().toISOString();
            }
        }

        if (update.priority) task.priority = update.priority;
        if (update.description) task.description = update.description;
        if (update.assignee) task.assignee = update.assignee;
        if (update.estimate_hours !== undefined) task.estimate_hours = update.estimate_hours;
        if (update.actual_hours !== undefined) task.actual_hours = update.actual_hours;
        if (update.tags) task.tags = update.tags;
        if (update.metadata) {
            task.metadata = { ...task.metadata, ...update.metadata };
        }

        task.updated_at = new Date().toISOString();
        return task;
    }

    deleteTask(id: string): boolean {
        const task = this.tasks.get(id);
        if (!task) {
            return false;
        }

        if (task.parent_id) {
            const parent = this.tasks.get(task.parent_id);
            if (parent) {
                parent.children_ids = parent.children_ids.filter(cid => cid !== id);
            }
        }

        task.children_ids.forEach(child_id => {
            this.deleteTask(child_id);
        });

        this.tasks.delete(id);
        return true;
    }

    listTasks(filter?: TaskFilter): Task[] {
        let tasks = Array.from(this.tasks.values());

        if (filter) {
            if (filter.type) {
                tasks = tasks.filter(t => filter.type!.includes(t.type));
            }
            if (filter.status) {
                tasks = tasks.filter(t => filter.status!.includes(t.status));
            }
            if (filter.priority) {
                tasks = tasks.filter(t => filter.priority!.includes(t.priority));
            }
            if (filter.phase) {
                tasks = tasks.filter(t => t.phase !== undefined && filter.phase!.includes(t.phase));
            }
            if (filter.parent_id !== undefined) {
                tasks = tasks.filter(t => t.parent_id === filter.parent_id);
            }
            if (filter.tags && filter.tags.length > 0) {
                tasks = tasks.filter(t => filter.tags!.some(tag => t.tags.includes(tag)));
            }
            if (filter.assignee) {
                tasks = tasks.filter(t => t.assignee === filter.assignee);
            }
        }

        return tasks;
    }

    getChildren(parent_id: string): Task[] {
        const parent = this.tasks.get(parent_id);
        if (!parent) {
            return [];
        }

        return parent.children_ids
            .map(id => this.tasks.get(id))
            .filter((t): t is Task => t !== undefined);
    }

    getProgress(filter?: TaskFilter): TaskProgress {
        const tasks = this.listTasks(filter);
        const total = tasks.length;

        const by_status = tasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {} as Record<TaskStatus, number>);

        return {
            total,
            todo: by_status.todo || 0,
            in_progress: by_status.in_progress || 0,
            blocked: by_status.blocked || 0,
            review: by_status.review || 0,
            done: by_status.done || 0,
            completion_percentage: total > 0 ? ((by_status.done || 0) / total) * 100 : 0,
        };
    }

    getStats(filter?: TaskFilter): TaskStats {
        const tasks = this.listTasks(filter);

        const by_type = tasks.reduce((acc, task) => {
            acc[task.type] = (acc[task.type] || 0) + 1;
            return acc;
        }, {} as Record<TaskType, number>);

        const by_status = tasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {} as Record<TaskStatus, number>);

        const by_priority = tasks.reduce((acc, task) => {
            acc[task.priority] = (acc[task.priority] || 0) + 1;
            return acc;
        }, {} as Record<TaskPriority, number>);

        const by_phase = tasks.reduce((acc, task) => {
            if (task.phase !== undefined) {
                acc[task.phase] = (acc[task.phase] || 0) + 1;
            }
            return acc;
        }, {} as Record<number, number>);

        const total_estimate = tasks.reduce((sum, task) => sum + (task.estimate_hours || 0), 0);
        const total_actual = tasks.reduce((sum, task) => sum + (task.actual_hours || 0), 0);
        const variance = total_actual - total_estimate;

        return {
            by_type,
            by_status,
            by_priority,
            by_phase,
            total_estimate,
            total_actual,
            variance,
        };
    }

    addDependency(task_id: string, depends_on_id: string): boolean {
        const task = this.tasks.get(task_id);
        const depends_on = this.tasks.get(depends_on_id);

        if (!task || !depends_on) {
            return false;
        }

        if (this.wouldCreateCycle(task_id, depends_on_id)) {
            return false;
        }

        if (!task.dependencies.includes(depends_on_id)) {
            task.dependencies.push(depends_on_id);
            task.updated_at = new Date().toISOString();
        }

        return true;
    }

    removeDependency(task_id: string, depends_on_id: string): boolean {
        const task = this.tasks.get(task_id);
        if (!task) {
            return false;
        }

        task.dependencies = task.dependencies.filter(id => id !== depends_on_id);
        task.updated_at = new Date().toISOString();
        return true;
    }

    getDependencies(task_id: string): TaskDependency {
        const task = this.tasks.get(task_id);
        if (!task) {
            return {
                task_id,
                depends_on: [],
                blocks: [],
                can_start: true,
                blocking_tasks: [],
            };
        }

        const depends_on = task.dependencies;
        const blocks = Array.from(this.tasks.values())
            .filter(t => t.dependencies.includes(task_id))
            .map(t => t.id);

        const blocking_tasks = depends_on
            .map(id => this.tasks.get(id))
            .filter((t): t is Task => t !== undefined && t.status !== 'done');

        const can_start = blocking_tasks.length === 0;

        return {
            task_id,
            depends_on,
            blocks,
            can_start,
            blocking_tasks,
        };
    }

    private wouldCreateCycle(from_id: string, to_id: string): boolean {
        const visited = new Set<string>();
        const queue = [to_id];

        while (queue.length > 0) {
            const current = queue.shift()!;
            if (current === from_id) {
                return true;
            }

            if (visited.has(current)) {
                continue;
            }
            visited.add(current);

            const task = this.tasks.get(current);
            if (task) {
                queue.push(...task.dependencies);
            }
        }

        return false;
    }

    getBreakdown(epic_id: string): TaskBreakdown | null {
        const epic = this.tasks.get(epic_id);
        if (!epic || epic.type !== 'epic') {
            return null;
        }

        const features = this.getChildren(epic_id);
        const stories: Task[] = [];
        const tasks: Task[] = [];

        features.forEach(feature => {
            const feature_stories = this.getChildren(feature.id);
            stories.push(...feature_stories);

            feature_stories.forEach(story => {
                const story_tasks = this.getChildren(story.id);
                tasks.push(...story_tasks);
            });
        });

        const all_tasks = [epic, ...features, ...stories, ...tasks];
        const total_estimate = all_tasks.reduce((sum, t) => sum + (t.estimate_hours || 0), 0);
        const total_actual = all_tasks.reduce((sum, t) => sum + (t.actual_hours || 0), 0);

        return {
            epic,
            features,
            stories,
            tasks,
            total_estimate,
            total_actual,
            progress: this.getProgress({ parent_id: epic_id }),
        };
    }

    exportTasks(): Task[] {
        return Array.from(this.tasks.values());
    }

    importTasks(tasks: Task[]): void {
        tasks.forEach(task => {
            this.tasks.set(task.id, task);
        });
    }

    clear(): void {
        this.tasks.clear();
    }
}

export const globalTaskManager = new TaskManager();
