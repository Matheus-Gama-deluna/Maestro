/**
 * Global project context management
 * Tracks the current project directory across tool calls
 */

// Global state: stores the current project directory
let currentProjectDirectory: string | null = null;

/**
 * Set the current project directory
 */
export function setCurrentDirectory(dir: string): void {
    currentProjectDirectory = dir;
}

/**
 * Get the current project directory
 * Falls back to process.cwd() if not set
 */
export function getCurrentDirectory(): string {
    return currentProjectDirectory || process.cwd();
}

/**
 * Clear the current project directory
 */
export function clearCurrentDirectory(): void {
    currentProjectDirectory = null;
}

/**
 * Check if a project directory is currently tracked
 */
export function hasCurrentDirectory(): boolean {
    return currentProjectDirectory !== null;
}

/**
 * Get project directory from args or fallback to current/cwd
 */
export function resolveDirectory(argsDir?: string): string {
    if (argsDir) {
        // If provided, use it and update global state
        setCurrentDirectory(argsDir);
        return argsDir;
    }
    return getCurrentDirectory();
}
