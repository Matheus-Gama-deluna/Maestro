import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
    ListToolsRequestSchema,
    CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
    listarEspecialistas,
    listarTemplates,
    listarGuias,
    lerEspecialista,
    lerTemplate,
    lerGuia,
    lerPrompt,
} from "../utils/files.js";

/**
 * Gera o system prompt com instruções para a IA
 */
async function gerarSystemPrompt(): Promise<string> {
    return `# Maestro - Instruções para IA

Você está usando o **Maestro**, um guia de desenvolvimento assistido por IA.

## Comportamentos Automáticos

Quando o usuário disser "próximo", "avançar", "terminei" ou "pronto":
1. Identifique o entregável desenvolvido na conversa
2. Chame a tool \`proximo\` passando o entregável
3. Aguarde a resposta com a próxima fase

## Gatilhos Reconhecidos

| Gatilho | Ação |
|---------|------|
| "próximo", "next", "avançar" | Chamar \`proximo(entregavel)\` |
| "status", "onde estou" | Chamar \`status()\` |
| "validar", "verificar gate" | Chamar \`validar_gate()\` |

## Fluxo de Desenvolvimento

1. **Produto** → PRD com problema e MVP
2. **Requisitos** → RFs, RNFs, critérios de aceite
3. **UX** → Jornadas, wireframes
4. **Modelo** → Entidades e relacionamentos
5. **Banco de Dados** → Modelo relacional, migrações
6. **Arquitetura** → C4, stack, ADRs
7. **Segurança** → OWASP, autenticação
8. **Testes** → Plano e estratégia
9. **Backlog** → Épicos e histórias
10. **Contrato** → OpenAPI, tipos
11. **Desenvolvimento** → Frontend/Backend

## Tools Disponíveis

- \`iniciar_projeto\` - Inicia novo projeto
- \`proximo\` - Salva entregável e avança fase
- \`status\` - Retorna estado atual
- \`validar_gate\` - Valida checklist da fase
`;
}

/**
 * Registra handlers de resources no servidor MCP
 */
export function registerResources(server: Server) {
    // Listar resources disponíveis
    server.setRequestHandler(ListResourcesRequestSchema, async () => {
        const especialistas = await listarEspecialistas();
        const templates = await listarTemplates();
        const guias = await listarGuias();

        return {
            resources: [
                // Especialistas
                ...especialistas.map((e) => ({
                    uri: `maestro://especialista/${encodeURIComponent(e)}`,
                    name: `Especialista: ${e}`,
                    mimeType: "text/markdown",
                    description: `Especialista em ${e}`,
                })),
                // Templates
                ...templates.map((t) => ({
                    uri: `maestro://template/${encodeURIComponent(t)}`,
                    name: `Template: ${t}`,
                    mimeType: "text/markdown",
                    description: `Template de ${t}`,
                })),
                // Guias
                ...guias.map((g) => ({
                    uri: `maestro://guia/${encodeURIComponent(g)}`,
                    name: `Guia: ${g}`,
                    mimeType: "text/markdown",
                    description: `Guia de ${g}`,
                })),
                // System prompt
                {
                    uri: "maestro://system-prompt",
                    name: "System Prompt",
                    mimeType: "text/markdown",
                    description: "Instruções de comportamento para a IA",
                },
            ],
        };
    });

    // Ler resource específico
    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        const { uri } = request.params;

        // Especialista
        if (uri.startsWith("maestro://especialista/")) {
            const nome = decodeURIComponent(uri.replace("maestro://especialista/", ""));
            const conteudo = await lerEspecialista(nome);
            return { contents: [{ uri, mimeType: "text/markdown", text: conteudo }] };
        }

        // Template
        if (uri.startsWith("maestro://template/")) {
            const nome = decodeURIComponent(uri.replace("maestro://template/", ""));
            const conteudo = await lerTemplate(nome);
            return { contents: [{ uri, mimeType: "text/markdown", text: conteudo }] };
        }

        // Guia
        if (uri.startsWith("maestro://guia/")) {
            const nome = decodeURIComponent(uri.replace("maestro://guia/", ""));
            const conteudo = await lerGuia(nome);
            return { contents: [{ uri, mimeType: "text/markdown", text: conteudo }] };
        }

        // Prompt
        if (uri.startsWith("maestro://prompt/")) {
            const path = uri.replace("maestro://prompt/", "");
            const [categoria, nome] = path.split("/");
            const conteudo = await lerPrompt(
                decodeURIComponent(categoria),
                decodeURIComponent(nome)
            );
            return { contents: [{ uri, mimeType: "text/markdown", text: conteudo }] };
        }

        // System prompt
        if (uri === "maestro://system-prompt") {
            const conteudo = await gerarSystemPrompt();
            return { contents: [{ uri, mimeType: "text/markdown", text: conteudo }] };
        }

        throw new Error(`Resource não encontrado: ${uri}`);
    });
}
