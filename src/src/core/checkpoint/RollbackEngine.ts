import { promises as fs } from 'fs';
import path from 'path';
import { Checkpoint, RollbackResult, DependencyGraph } from './types.js';
import { CheckpointManager } from './CheckpointManager.js';

export class RollbackEngine {
    private cpManager: CheckpointManager;

    constructor(private projectDir: string) {
        this.cpManager = new CheckpointManager(projectDir);
    }

    /**
     * Rollback total para um checkpoint
     */
    async rollbackTotal(checkpointId: string): Promise<RollbackResult> {
        const checkpoint = await this.cpManager.get(checkpointId);
        if (!checkpoint) {
            return {
                success: false,
                filesRestored: 0,
                errors: [`Checkpoint ${checkpointId} não encontrado`],
                checkpoint: null as any,
            };
        }

        const errors: string[] = [];
        let filesRestored = 0;

        // Restaurar todos os arquivos
        for (const file of checkpoint.snapshot.files) {
            try {
                const fullPath = path.join(this.projectDir, file.path);
                await fs.mkdir(path.dirname(fullPath), { recursive: true });
                await fs.writeFile(fullPath, file.content, 'utf-8');
                filesRestored++;
            } catch (error) {
                errors.push(`Erro ao restaurar ${file.path}: ${String(error)}`);
            }
        }

        // Restaurar estado
        try {
            const estadoPath = path.join(this.projectDir, '.maestro', 'estado.json');
            await fs.writeFile(
                estadoPath,
                JSON.stringify(checkpoint.snapshot.estado, null, 2),
                'utf-8'
            );
        } catch (error) {
            errors.push(`Erro ao restaurar estado: ${String(error)}`);
        }

        return {
            success: errors.length === 0,
            filesRestored,
            errors,
            checkpoint,
        };
    }

    /**
     * Rollback parcial (apenas módulos específicos)
     */
    async rollbackPartial(
        checkpointId: string,
        modules: string[]
    ): Promise<RollbackResult> {
        const checkpoint = await this.cpManager.get(checkpointId);
        if (!checkpoint) {
            return {
                success: false,
                filesRestored: 0,
                errors: [`Checkpoint ${checkpointId} não encontrado`],
                checkpoint: null as any,
            };
        }

        const errors: string[] = [];
        let filesRestored = 0;

        // Filtrar arquivos dos módulos especificados
        const filesToRestore = checkpoint.snapshot.files.filter(file => {
            const module = this.extractModule(file.path);
            return modules.includes(module);
        });

        // Construir grafo de dependências
        const depGraph = await this.buildDependencyGraph(checkpoint);

        // Expandir para incluir dependências
        const allFilesToRestore = this.expandWithDependencies(
            filesToRestore.map(f => f.path),
            depGraph
        );

        // Restaurar arquivos
        for (const filePath of allFilesToRestore) {
            const file = checkpoint.snapshot.files.find(f => f.path === filePath);
            if (!file) continue;

            try {
                const fullPath = path.join(this.projectDir, file.path);
                await fs.mkdir(path.dirname(fullPath), { recursive: true });
                await fs.writeFile(fullPath, file.content, 'utf-8');
                filesRestored++;
            } catch (error) {
                errors.push(`Erro ao restaurar ${file.path}: ${String(error)}`);
            }
        }

        return {
            success: errors.length === 0,
            filesRestored,
            errors,
            checkpoint,
        };
    }

    /**
     * Constrói grafo de dependências
     */
    private async buildDependencyGraph(checkpoint: Checkpoint): Promise<DependencyGraph> {
        const graph: DependencyGraph = {};

        for (const file of checkpoint.snapshot.files) {
            const imports = this.extractImports(file.content);
            graph[file.path] = {
                imports,
                importedBy: [],
            };
        }

        // Preencher importedBy
        for (const [filePath, data] of Object.entries(graph)) {
            for (const importPath of data.imports) {
                if (graph[importPath]) {
                    graph[importPath].importedBy.push(filePath);
                }
            }
        }

        return graph;
    }

    /**
     * Extrai imports de um arquivo
     */
    private extractImports(content: string): string[] {
        const imports: string[] = [];
        const importRegex = /import\s+.*?\s+from\s+['"](.+?)['"]/g;
        let match;

        while ((match = importRegex.exec(content)) !== null) {
            const importPath = match[1];
            // Apenas imports relativos
            if (importPath.startsWith('.')) {
                imports.push(importPath);
            }
        }

        return imports;
    }

    /**
     * Expande lista de arquivos com dependências
     */
    private expandWithDependencies(
        files: string[],
        graph: DependencyGraph
    ): string[] {
        const result = new Set<string>(files);
        const queue = [...files];

        while (queue.length > 0) {
            const file = queue.shift()!;
            const node = graph[file];
            if (!node) continue;

            // Adicionar dependências (imports)
            for (const dep of node.imports) {
                if (!result.has(dep)) {
                    result.add(dep);
                    queue.push(dep);
                }
            }

            // Adicionar dependentes (importedBy)
            for (const dependent of node.importedBy) {
                if (!result.has(dependent)) {
                    result.add(dependent);
                    queue.push(dependent);
                }
            }
        }

        return Array.from(result);
    }

    /**
     * Extrai módulo do path
     */
    private extractModule(filePath: string): string {
        const parts = filePath.split(path.sep);
        if (parts[0] === 'src' && parts.length > 1) {
            return parts[1];
        }
        return parts[0];
    }
}
