export interface Checkpoint {
    id: string;
    timestamp: string;
    reason: string;
    auto: boolean;
    fase: number;
    snapshot: {
        files: Array<{
            path: string;
            content: string;
            hash: string;
        }>;
        estado: any;
    };
    metadata: {
        filesCount: number;
        totalSize: number;
        modules: string[];
    };
}

export interface RollbackResult {
    success: boolean;
    filesRestored: number;
    errors: string[];
    checkpoint: Checkpoint;
}

export interface DependencyGraph {
    [file: string]: {
        imports: string[];
        importedBy: string[];
    };
}
