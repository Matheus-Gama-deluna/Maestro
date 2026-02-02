import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Checkpoint } from './types.js';

export class CheckpointManager {
    private baseDir: string;

    constructor(private projectDir: string) {
        this.baseDir = path.join(projectDir, '.maestro', 'checkpoints');
    }

    /**
     * Cria um novo checkpoint
     */
    async create(reason: string, auto: boolean, estado: any): Promise<string> {
        const id = `CP-${Date.now()}`;
        const timestamp = new Date().toISOString();

        // Coletar arquivos do projeto
        const files = await this.collectProjectFiles();

        // Calcular hashes
        const filesWithHash = files.map(f => ({
            ...f,
            hash: this.calculateHash(f.content),
        }));

        // Extrair módulos únicos
        const modules = [...new Set(files.map(f => this.extractModule(f.path)))];

        const checkpoint: Checkpoint = {
            id,
            timestamp,
            reason,
            auto,
            fase: estado.fase_atual || 0,
            snapshot: {
                files: filesWithHash,
                estado: JSON.parse(JSON.stringify(estado)),
            },
            metadata: {
                filesCount: files.length,
                totalSize: files.reduce((sum, f) => sum + f.content.length, 0),
                modules,
            },
        };

        // Salvar checkpoint
        await fs.mkdir(this.baseDir, { recursive: true });
        const checkpointPath = path.join(this.baseDir, `${id}.json`);
        await fs.writeFile(
            checkpointPath,
            JSON.stringify(checkpoint, null, 2),
            'utf-8'
        );

        return id;
    }

    /**
     * Lista todos os checkpoints
     */
    async list(): Promise<Checkpoint[]> {
        try {
            const files = await fs.readdir(this.baseDir);
            const checkpoints: Checkpoint[] = [];

            for (const file of files) {
                if (!file.endsWith('.json')) continue;

                const content = await fs.readFile(
                    path.join(this.baseDir, file),
                    'utf-8'
                );
                checkpoints.push(JSON.parse(content));
            }

            return checkpoints.sort((a, b) => 
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
        } catch (error) {
            return [];
        }
    }

    /**
     * Obtém checkpoint por ID
     */
    async get(id: string): Promise<Checkpoint | null> {
        try {
            const content = await fs.readFile(
                path.join(this.baseDir, `${id}.json`),
                'utf-8'
            );
            return JSON.parse(content);
        } catch (error) {
            return null;
        }
    }

    /**
     * Deleta checkpoint
     */
    async delete(id: string): Promise<void> {
        await fs.unlink(path.join(this.baseDir, `${id}.json`));
    }

    /**
     * Coleta arquivos do projeto
     */
    private async collectProjectFiles(): Promise<Array<{path: string, content: string}>> {
        const files: Array<{path: string, content: string}> = [];
        const srcDir = path.join(this.projectDir, 'src');
        const docsDir = path.join(this.projectDir, 'docs');

        // Coletar de src/
        if (await this.dirExists(srcDir)) {
            await this.collectFilesRecursive(srcDir, files);
        }

        // Coletar de docs/
        if (await this.dirExists(docsDir)) {
            await this.collectFilesRecursive(docsDir, files);
        }

        return files;
    }

    /**
     * Coleta arquivos recursivamente
     */
    private async collectFilesRecursive(
        dir: string,
        files: Array<{path: string, content: string}>
    ): Promise<void> {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                // Ignorar node_modules, .git, etc
                if (['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
                    continue;
                }
                await this.collectFilesRecursive(fullPath, files);
            } else if (entry.isFile()) {
                // Apenas arquivos de código/docs
                const ext = path.extname(entry.name);
                if (['.ts', '.js', '.tsx', '.jsx', '.md', '.json'].includes(ext)) {
                    const content = await fs.readFile(fullPath, 'utf-8');
                    files.push({
                        path: path.relative(this.projectDir, fullPath),
                        content,
                    });
                }
            }
        }
    }

    /**
     * Verifica se diretório existe
     */
    private async dirExists(dir: string): Promise<boolean> {
        try {
            const stat = await fs.stat(dir);
            return stat.isDirectory();
        } catch {
            return false;
        }
    }

    /**
     * Calcula hash SHA256
     */
    private calculateHash(content: string): string {
        return crypto.createHash('sha256').update(content).digest('hex');
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
