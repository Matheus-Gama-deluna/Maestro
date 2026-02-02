import { promises as fs } from 'fs';
import path from 'path';

export interface CodebaseAnalysis {
    architecture: string;
    stack: string[];
    modules: string[];
    fileCount: number;
    dependencies: Record<string, string>;
}

export class CodebaseDiscovery {
    constructor(private projectDir: string) {}

    async analyze(): Promise<CodebaseAnalysis> {
        const packageJson = await this.readPackageJson();
        const files = await this.scanFiles();

        return {
            architecture: this.detectArchitecture(files),
            stack: this.detectStack(packageJson),
            modules: this.detectModules(files),
            fileCount: files.length,
            dependencies: packageJson?.dependencies || {}
        };
    }

    private async readPackageJson(): Promise<any> {
        try {
            const content = await fs.readFile(
                path.join(this.projectDir, 'package.json'),
                'utf-8'
            );
            return JSON.parse(content);
        } catch {
            return null;
        }
    }

    private async scanFiles(): Promise<string[]> {
        const files: string[] = [];
        await this.scanDir(this.projectDir, files);
        return files;
    }

    private async scanDir(dir: string, files: string[]): Promise<void> {
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                if (['node_modules', '.git', 'dist'].includes(entry.name)) continue;
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    await this.scanDir(fullPath, files);
                } else {
                    files.push(path.relative(this.projectDir, fullPath));
                }
            }
        } catch {}
    }

    private detectArchitecture(files: string[]): string {
        if (files.some(f => f.includes('domain') && f.includes('application'))) return 'Clean Architecture';
        if (files.some(f => f.includes('controllers') && f.includes('services'))) return 'MVC';
        return 'Monolithic';
    }

    private detectStack(pkg: any): string[] {
        if (!pkg?.dependencies) return [];
        const deps = Object.keys(pkg.dependencies);
        const stack: string[] = [];
        if (deps.includes('react')) stack.push('React');
        if (deps.includes('vue')) stack.push('Vue');
        if (deps.includes('express')) stack.push('Express');
        if (deps.includes('next')) stack.push('Next.js');
        return stack;
    }

    private detectModules(files: string[]): string[] {
        const modules = new Set<string>();
        files.forEach(f => {
            const parts = f.split(path.sep);
            if (parts[0] === 'src' && parts.length > 1) {
                modules.add(parts[1]);
            }
        });
        return Array.from(modules);
    }
}
