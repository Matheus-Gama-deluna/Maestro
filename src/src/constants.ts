/**
 * Constantes centralizadas do Maestro MCP
 * 
 * Ponto ÚNICO de definição de versão, nome e protocol.
 * Todos os entry points (stdio.ts, index.ts, server.ts) importam daqui.
 */

export const MAESTRO_NAME = "mcp-maestro";
export const MAESTRO_VERSION = "5.1.0";
export const MAESTRO_DESCRIPTION = "Maestro — Orquestrador de desenvolvimento assistido por IA";

/**
 * Protocol version suportada pelo servidor.
 * 2025-03-26 é compatível com Windsurf (protocolo mais antigo entre os targets).
 * Quando Windsurf atualizar, mover para 2025-06-18.
 */
export const SUPPORTED_PROTOCOL_VERSION = "2025-03-26";
