/**
 * Serviço de detecção de capabilities do client MCP.
 * 
 * Captura capabilities no handshake `initialize` e expõe para todas as tools.
 * Permite adaptar comportamento do servidor baseado no client (Windsurf, Cursor, VS Code, etc.).
 * 
 * @since v5.1.0 — Task 2.1 do Roadmap de Melhorias MCP
 */

// === TIPOS ===

export interface ClientCapabilities {
    hasElicitation: boolean;
    hasSampling: boolean;
    hasRoots: boolean;
    hasTasks: boolean;
    hasAnnotations: boolean;
    hasStructuredContent: boolean;
    hasListChanged: boolean;
    clientName: string;
    protocolVersion: string;
}

export type ClientType = "windsurf" | "cursor" | "vscode" | "claude" | "cline" | "unknown";

// === ESTADO ===

const DEFAULT_CAPABILITIES: ClientCapabilities = {
    hasElicitation: false,
    hasSampling: false,
    hasRoots: false,
    hasTasks: false,
    hasAnnotations: false,
    hasStructuredContent: false,
    hasListChanged: false,
    clientName: "unknown",
    protocolVersion: "2024-11-05",
};

let currentCapabilities: ClientCapabilities = { ...DEFAULT_CAPABILITIES };

// === API PÚBLICA ===

/**
 * Captura capabilities do client a partir dos parâmetros do handshake `initialize`.
 * Deve ser chamado uma vez durante o handshake MCP.
 */
export function captureClientCapabilities(initializeParams: Record<string, unknown>): void {
    const caps = (initializeParams?.capabilities || {}) as Record<string, unknown>;
    const proto = (initializeParams?.protocolVersion as string) || "2024-11-05";
    const clientInfo = (initializeParams?.clientInfo || {}) as Record<string, unknown>;

    currentCapabilities = {
        hasElicitation: !!caps.elicitation,
        hasSampling: !!caps.sampling,
        hasRoots: !!caps.roots,
        hasTasks: !!(caps as any).experimental?.tasks || !!(caps as any).tasks,
        hasAnnotations: proto >= "2025-06-18",
        hasStructuredContent: proto >= "2025-06-18",
        hasListChanged: !!(caps.tools as any)?.listChanged,
        clientName: (clientInfo?.name as string) || "unknown",
        protocolVersion: proto,
    };

    console.error(`[Capabilities] Client: ${currentCapabilities.clientName}, Protocol: ${proto}`);
    console.error(`[Capabilities] Elicitation: ${currentCapabilities.hasElicitation}, Sampling: ${currentCapabilities.hasSampling}, Roots: ${currentCapabilities.hasRoots}`);
}

/**
 * Retorna capabilities atuais do client (imutável).
 */
export function getClientCapabilities(): Readonly<ClientCapabilities> {
    return currentCapabilities;
}

/**
 * Verifica se o client suporta uma feature específica.
 */
export function clientSupports(feature: keyof ClientCapabilities): boolean {
    return !!currentCapabilities[feature];
}

/**
 * Identifica o tipo de client para adaptações específicas.
 */
export function getClientType(): ClientType {
    const name = currentCapabilities.clientName.toLowerCase();
    if (name.includes("windsurf") || name.includes("cascade")) return "windsurf";
    if (name.includes("cursor")) return "cursor";
    if (name.includes("visual studio code") || name.includes("copilot") || name.includes("vscode")) return "vscode";
    if (name.includes("claude")) return "claude";
    if (name.includes("cline")) return "cline";
    return "unknown";
}

/**
 * Retorna resumo legível das capabilities para debug/logging.
 */
export function getCapabilitiesSummary(): string {
    const c = currentCapabilities;
    return [
        `Client: ${c.clientName} (${getClientType()})`,
        `Protocol: ${c.protocolVersion}`,
        `Elicitation: ${c.hasElicitation ? "✅" : "❌"}`,
        `Sampling: ${c.hasSampling ? "✅" : "❌"}`,
        `Roots: ${c.hasRoots ? "✅" : "❌"}`,
        `Tasks: ${c.hasTasks ? "✅" : "❌"}`,
        `Annotations: ${c.hasAnnotations ? "✅" : "❌"}`,
        `StructuredContent: ${c.hasStructuredContent ? "✅" : "❌"}`,
    ].join(" | ");
}

/**
 * Reset capabilities (para testes).
 */
export function resetCapabilities(): void {
    currentCapabilities = { ...DEFAULT_CAPABILITIES };
}
