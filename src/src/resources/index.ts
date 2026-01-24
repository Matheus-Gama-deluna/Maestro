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
    listarExemplos,
    lerEspecialista,
    lerTemplate,
    lerGuia,
    lerPrompt,
    lerExemplo,
    getProjectDirectory,
} from "../utils/files.js";

/**
 * Gera o system prompt com instruções para a IA
 */
async function gerarSystemPrompt(): Promise<string> {
    return `# Maestro - Instruções OBRIGATÓRIAS para IA

## 📦 PRÉ-REQUISITO: Configuração Local

Antes de usar qualquer tool do Maestro, verifique se o projeto foi configurado:

\`\`\`bash
npx @maestro-ai/cli
\`\`\`

Este comando injeta especialistas, templates e prompts localmente no projeto.
**Se a pasta \`.maestro/content/\` não existir, ORIENTE O USUÁRIO a executar o npx acima.**

---

## 🚫 REGRAS ABSOLUTAS (VIOLAÇÃO = FALHA)

1. **NUNCA chame \`aprovar_gate\`** - Esta tool é EXCLUSIVA do usuário humano
2. **NUNCA gere entregáveis SEM LER o especialista e template ANTES**
3. **NUNCA avance sem confirmação EXPLÍCITA do usuário**
4. **NUNCA passe entregáveis vazios ou incompletos** para \`proximo()\`

---

## 📚 LEITURA OBRIGATÓRIA DE RECURSOS

Para CADA fase, você DEVE executar ANTES de gerar conteúdo:

\`\`\`
read_resource("maestro://especialista/{nome}")
read_resource("maestro://template/{nome}")
\`\`\`

> ⛔ **GERAR ENTREGÁVEL SEM LER RECURSOS = ERRO GRAVE**

---

## 🔄 FLUXO OBRIGATÓRIO

1. \`status()\` → ver fase atual
2. **LER especialista** → OBRIGATÓRIO
3. **LER template** → OBRIGATÓRIO
4. Perguntas do especialista ao usuário
5. Gerar entregável seguindo template
6. Apresentar e pedir confirmação
7. \`proximo(entregavel)\`
8. Se bloqueado: PARAR e informar

---

## 🔐 Proteção de Gates

- Score >= 70: Aprovado
- Score 50-69: BLOQUEADO → usuário decide
- Score < 50: Rejeitado
- Entregável < 200 chars: BLOQUEADO

## Tools

- \`iniciar_projeto\`, \`proximo\`, \`status\`, \`validar_gate\`
- \`aprovar_gate\` → ⛔ IA NÃO PODE USAR
`;
}

/**
 * Registra handlers de resources no servidor MCP
 */
export function registerResources(server: Server) {
    // Listar resources disponíveis
    server.setRequestHandler(ListResourcesRequestSchema, async () => {
        // Usa diretório do projeto para priorizar content local (null -> undefined)
        const diretorio = getProjectDirectory() || undefined;
        const especialistas = await listarEspecialistas(diretorio);
        const templates = await listarTemplates(diretorio);
        const guias = await listarGuias(diretorio);
        const exemplos = await listarExemplos(diretorio);

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
                // Exemplos de Fluxo Completo
                ...exemplos.map((ex) => ({
                    uri: `maestro://exemplo/${encodeURIComponent(ex)}`,
                    name: `Exemplo: ${ex}`,
                    mimeType: "text/markdown",
                    description: `Exemplo de fluxo completo: ${ex}`,
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

        // Usa diretório do projeto para priorizar content local (null -> undefined)
        const diretorio = getProjectDirectory() || undefined;

        // Especialista
        if (uri.startsWith("maestro://especialista/")) {
            const nome = decodeURIComponent(uri.replace("maestro://especialista/", ""));
            const conteudo = await lerEspecialista(nome, diretorio);
            return { contents: [{ uri, mimeType: "text/markdown", text: conteudo }] };
        }

        // Template
        if (uri.startsWith("maestro://template/")) {
            const nome = decodeURIComponent(uri.replace("maestro://template/", ""));
            const conteudo = await lerTemplate(nome, diretorio);
            return { contents: [{ uri, mimeType: "text/markdown", text: conteudo }] };
        }

        // Guia
        if (uri.startsWith("maestro://guia/")) {
            const nome = decodeURIComponent(uri.replace("maestro://guia/", ""));
            const conteudo = await lerGuia(nome, diretorio);
            return { contents: [{ uri, mimeType: "text/markdown", text: conteudo }] };
        }

        // Prompt
        if (uri.startsWith("maestro://prompt/")) {
            const path = uri.replace("maestro://prompt/", "");
            const [categoria, nome] = path.split("/");
            const conteudo = await lerPrompt(
                decodeURIComponent(categoria),
                decodeURIComponent(nome),
                diretorio
            );
            return { contents: [{ uri, mimeType: "text/markdown", text: conteudo }] };
        }

        // Exemplo de Fluxo Completo
        if (uri.startsWith("maestro://exemplo/")) {
            const nome = decodeURIComponent(uri.replace("maestro://exemplo/", ""));
            const conteudo = await lerExemplo(nome, diretorio);
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
