export type TaskType = 'epic' | 'feature' | 'story' | 'task' | 'subtask';

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'review' | 'done';

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Task {
    id: string;
    type: TaskType;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    parent_id?: string;
    children_ids: string[];
    dependencies: string[];
    phase?: number;
    assignee?: string;
    estimate_hours?: number;
    actual_hours?: number;
    created_at: string;
    updated_at: string;
    started_at?: string;
    completed_at?: string;
    tags: string[];
    metadata: {
        files?: string[];
        commits?: string[];
        tests?: string[];
        acceptance_criteria?: string[];
    };
}

export interface TaskHierarchy {
    epics: Task[];
    features: Task[];
    stories: Task[];
    tasks: Task[];
    subtasks: Task[];
}

export interface TaskProgress {
    total: number;
    todo: number;
    in_progress: number;
    blocked: number;
    review: number;
    done: number;
    completion_percentage: number;
}

export interface TaskStats {
    by_type: Record<TaskType, number>;
    by_status: Record<TaskStatus, number>;
    by_priority: Record<TaskPriority, number>;
    by_phase: Record<number, number>;
    total_estimate: number;
    total_actual: number;
    variance: number;
}

export interface TaskFilter {
    type?: TaskType[];
    status?: TaskStatus[];
    priority?: TaskPriority[];
    phase?: number[];
    parent_id?: string;
    tags?: string[];
    assignee?: string;
}

export interface TaskUpdate {
    status?: TaskStatus;
    priority?: TaskPriority;
    description?: string;
    assignee?: string;
    estimate_hours?: number;
    actual_hours?: number;
    tags?: string[];
    metadata?: Partial<Task['metadata']>;
}

export interface TaskDependency {
    task_id: string;
    depends_on: string[];
    blocks: string[];
    can_start: boolean;
    blocking_tasks: Task[];
}

export interface TaskTimeline {
    task_id: string;
    events: TaskEvent[];
}

export interface TaskEvent {
    timestamp: string;
    type: 'created' | 'updated' | 'status_changed' | 'assigned' | 'commented' | 'completed';
    user?: string;
    data: Record<string, any>;
}

export interface TaskBreakdown {
    epic: Task;
    features: Task[];
    stories: Task[];
    tasks: Task[];
    total_estimate: number;
    total_actual: number;
    progress: TaskProgress;
}
