/**
 * Code Parser - Extracts structure from source code
 */

export interface ParsedCode {
    language: string;
    imports: ImportInfo[];
    exports: ExportInfo[];
    functions: FunctionInfo[];
    classes: ClassInfo[];
    variables: VariableInfo[];
    dependencies: string[];
    lines: number;
    complexity: number;
}

export interface ImportInfo {
    module: string;
    items: string[];
    line: number;
    isDefault: boolean;
}

export interface ExportInfo {
    name: string;
    type: "function" | "class" | "variable" | "default";
    line: number;
}

export interface FunctionInfo {
    name: string;
    params: string[];
    async: boolean;
    line: number;
    complexity: number;
}

export interface ClassInfo {
    name: string;
    extends?: string;
    implements?: string[];
    methods: FunctionInfo[];
    properties: string[];
    line: number;
}

export interface VariableInfo {
    name: string;
    type: "const" | "let" | "var";
    line: number;
}

/**
 * Detect language from file extension or content
 */
export function detectLanguage(fileName: string, content: string): string {
    const ext = fileName.split(".").pop()?.toLowerCase();

    const extMap: Record<string, string> = {
        ts: "typescript",
        tsx: "typescript",
        js: "javascript",
        jsx: "javascript",
        py: "python",
        java: "java",
        cs: "csharp",
        go: "go",
        rs: "rust",
        rb: "ruby",
        php: "php",
        html: "html",
        css: "css",
        scss: "scss",
        sql: "sql",
        yaml: "yaml",
        yml: "yaml",
        json: "json",
        md: "markdown",
    };

    if (ext && extMap[ext]) {
        return extMap[ext];
    }

    // Detect from content
    if (content.includes("import React") || content.includes("from 'react'")) {
        return "typescript";
    }
    if (content.includes("def ") && content.includes(":")) {
        return "python";
    }
    if (content.includes("public class") || content.includes("private void")) {
        return "java";
    }

    return "unknown";
}

/**
 * Parse TypeScript/JavaScript code
 */
export function parseTypeScript(content: string): ParsedCode {
    const lines = content.split("\n");
    const result: ParsedCode = {
        language: "typescript",
        imports: [],
        exports: [],
        functions: [],
        classes: [],
        variables: [],
        dependencies: [],
        lines: lines.length,
        complexity: 0,
    };

    let complexity = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;

        // Parse imports
        const importMatch = line.match(/import\s+(?:(\{[^}]+\})|(\w+))\s+from\s+['"]([^'"]+)['"]/);
        if (importMatch) {
            const items = importMatch[1]
                ? importMatch[1].replace(/[{}]/g, "").split(",").map(s => s.trim())
                : [importMatch[2]];
            result.imports.push({
                module: importMatch[3],
                items,
                line: lineNum,
                isDefault: !importMatch[1],
            });

            // Track dependencies (non-relative imports)
            if (!importMatch[3].startsWith(".") && !importMatch[3].startsWith("/")) {
                const dep = importMatch[3].split("/")[0];
                if (!result.dependencies.includes(dep)) {
                    result.dependencies.push(dep);
                }
            }
        }

        // Parse exports
        const exportMatch = line.match(/export\s+(default\s+)?(function|class|const|let|var)\s+(\w+)/);
        if (exportMatch) {
            result.exports.push({
                name: exportMatch[3],
                type: exportMatch[1] ? "default" : exportMatch[2] as ExportInfo["type"],
                line: lineNum,
            });
        }

        // Parse functions
        const funcMatch = line.match(/(async\s+)?function\s+(\w+)\s*\(([^)]*)\)/);
        if (funcMatch) {
            result.functions.push({
                name: funcMatch[2],
                params: funcMatch[3] ? funcMatch[3].split(",").map(s => s.trim()) : [],
                async: !!funcMatch[1],
                line: lineNum,
                complexity: 1,
            });
        }

        // Parse arrow functions (const/let)
        const arrowMatch = line.match(/(const|let)\s+(\w+)\s*=\s*(async\s+)?\([^)]*\)\s*=>/);
        if (arrowMatch) {
            result.functions.push({
                name: arrowMatch[2],
                params: [],
                async: !!arrowMatch[3],
                line: lineNum,
                complexity: 1,
            });
        }

        // Parse classes
        const classMatch = line.match(/class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+(.+))?/);
        if (classMatch) {
            result.classes.push({
                name: classMatch[1],
                extends: classMatch[2],
                implements: classMatch[3] ? classMatch[3].split(",").map(s => s.trim()) : [],
                methods: [],
                properties: [],
                line: lineNum,
            });
        }

        // Parse variables
        const varMatch = line.match(/(const|let|var)\s+(\w+)\s*[=:]/);
        if (varMatch && !arrowMatch) {
            result.variables.push({
                name: varMatch[2],
                type: varMatch[1] as VariableInfo["type"],
                line: lineNum,
            });
        }

        // Calculate complexity (simplified)
        if (line.includes("if (") || line.includes("if(")) complexity++;
        if (line.includes("else")) complexity++;
        if (line.includes("for (") || line.includes("for(")) complexity++;
        if (line.includes("while (") || line.includes("while(")) complexity++;
        if (line.includes("switch (") || line.includes("switch(")) complexity++;
        if (line.includes("catch (") || line.includes("catch(")) complexity++;
        if (line.includes("&&") || line.includes("||")) complexity++;
        if (line.includes("? ") && line.includes(" : ")) complexity++;
    }

    result.complexity = complexity;

    return result;
}

/**
 * Parse code based on detected language
 */
export function parseCode(content: string, fileName: string = "file.ts"): ParsedCode {
    const language = detectLanguage(fileName, content);

    switch (language) {
        case "typescript":
        case "javascript":
            return parseTypeScript(content);
        default:
            // Return basic info for unsupported languages
            return {
                language,
                imports: [],
                exports: [],
                functions: [],
                classes: [],
                variables: [],
                dependencies: [],
                lines: content.split("\n").length,
                complexity: 0,
            };
    }
}
