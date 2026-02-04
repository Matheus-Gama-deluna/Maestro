import { promises as fs } from "fs";
import { join } from "path";
import { homedir } from "os";

export interface MaestroUserConfig {
    ide: "windsurf" | "cursor" | "antigravity";
    modo: "economy" | "balanced" | "quality";
    usar_stitch: boolean;
    preferencias_stack?: {
        frontend?: "react" | "vue" | "angular" | "nextjs";
        backend?: "node" | "java" | "php" | "python";
        database?: "postgres" | "mysql" | "mongodb";
    };
    team_size?: "solo" | "pequeno" | "medio" | "grande";
    version?: string;
}

const CONFIG_DIR = join(homedir(), ".maestro");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");

export async function loadUserConfig(): Promise<MaestroUserConfig | null> {
    try {
        const raw = await fs.readFile(CONFIG_PATH, "utf-8");
        return JSON.parse(raw) as MaestroUserConfig;
    } catch {
        return null;
    }
}

export async function saveUserConfig(config: MaestroUserConfig): Promise<void> {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
    const payload = {
        version: config.version || "2.1.0",
        ...config,
    } satisfies MaestroUserConfig;
    await fs.writeFile(CONFIG_PATH, JSON.stringify(payload, null, 2), "utf-8");
}

export function getConfigPath(): string {
    return CONFIG_PATH;
}
