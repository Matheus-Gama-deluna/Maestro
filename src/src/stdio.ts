#!/usr/bin/env node
/**
 * Entry point STDIO — usado por IDEs (Windsurf, Cursor, etc.)
 *
 * Usa o factory createMaestroServer() e conecta via StdioServerTransport.
 * Toda lógica de handlers está em server.ts.
 *
 * @since v6.0 — Unificado com server.ts
 */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMaestroServer, getStartupInfo } from "./server.js";

const projectsDir = process.argv[2] || process.cwd();
const server = createMaestroServer(projectsDir);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`[STDIO] ${getStartupInfo(projectsDir)}`);
}

main().catch(console.error);
