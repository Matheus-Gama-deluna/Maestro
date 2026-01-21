import { join } from "path";
import type { ToolResult } from "../types/index.js";
import { parsearEstado } from "../state/storage.js";
import { setCurrentDirectory } from "../state/context.js";
import { getFase } from "../flows/types.js";
import { lerEspecialista, lerTemplate } from "../utils/files.js";
import { gerarInstrucaoRecursos } from "../utils/instructions.js";
import type { EstadoProjeto } from "../types/index.js";

interface CarregarProjetoArgs {
    estado_json: string;    // Conteúdo de .maestro/estado.json
    resumo_json?: string;   // Opcional: .maestro/resumo.json
    diretorio: string;      // Caminho do projeto (para referência)
}

/**
 * Tool: carregar_projeto
 * Carrega um projeto existente a partir do estado JSON (modo stateless)
 * A IA deve ler o arquivo .maestro/estado.json e passar como parâmetro
 */
export async function carregarProjeto(args: CarregarProjetoArgs): Promise<ToolResult> {
    // Validar parâmetros
    if (!args.estado_json) {
        return {
            content: [{
                type: "text",
                text: `# 📂 Carregar Projeto (Modo Stateless)

## Como usar

1. A IA lê o arquivo \`.maestro/estado.json\` do projeto
2. Passa o conteúdo como parâmetro \`estado_json\`

**Exemplo:**
\`\`\`typescript
// IA lê o arquivo primeiro
const estadoContent = read_file("C:/projetos/meu-projeto/.maestro/estado.json");

// Depois chama a tool
carregar_projeto(
    estado_json: estadoContent,
    diretorio: "C:/projetos/meu-projeto"
)
\`\`\`

## Parâmetros

| Parâmetro | Obrigatório | Descrição |
|-----------|-------------|-----------|
| \`estado_json\` | ✅ | Conteúdo do \`.maestro/estado.json\` |
| \`resumo_json\` | ❌ | Conteúdo do \`.maestro/resumo.json\` (opcional) |
| \`diretorio\` | ✅ | Caminho absoluto do projeto |
`,
            }],
        };
    }

    if (!args.diretorio) {
        return {
            content: [{
                type: "text",
                text: "❌ **Erro**: Parâmetro `diretorio` é obrigatório.",
            }],
            isError: true,
        };
    }

    // Parsear estado
    const estado = parsearEstado(args.estado_json);

    if (!estado) {
        return {
            content: [{
                type: "text",
                text: `❌ **Erro**: Não foi possível parsear o estado JSON.

**Verifique se:**
- O conteúdo é um JSON válido
- O arquivo \`.maestro/estado.json\` existe e não está corrompido

**JSON recebido (primeiros 200 chars):**
\`\`\`
${args.estado_json.slice(0, 200)}...
\`\`\`
`,
            }],
            isError: true,
        };
    }

    // Define o diretório global
    setCurrentDirectory(args.diretorio);

    // Carregar info da fase atual
    const faseAtual = getFase(estado.nivel, estado.fase_atual);
    let especialistaInfo = "";
    let templateInfo = "";

    if (faseAtual) {
        try {
            const especialista = await lerEspecialista(faseAtual.especialista);
            const template = await lerTemplate(faseAtual.template);
            especialistaInfo = `

---

## 🎭 Especialista: ${faseAtual.especialista}

${especialista.slice(0, 500)}${especialista.length > 500 ? "...\n\n*[truncado para visualização]*" : ""}
`;
            templateInfo = `

---

## 📝 Template: ${faseAtual.template}

${template.slice(0, 500)}${template.length > 500 ? "...\n\n*[truncado para visualização]*" : ""}
`;
        } catch {
            // Ignore se não encontrar especialista/template
        }
    }

    const progresso = Math.round((estado.fase_atual / estado.total_fases) * 100);
    const barra = "█".repeat(Math.floor(progresso / 10)) + "░".repeat(10 - Math.floor(progresso / 10));

    const resposta = `# ✅ Projeto Carregado!

## ${estado.nome}

| Campo | Valor |
|-------|-------|
| **ID** | \`${estado.projeto_id}\` |
| **Diretório** | \`${args.diretorio}\` |
| **Nível** | ${estado.nivel.toUpperCase()} |
| **Fase Atual** | ${estado.fase_atual}/${estado.total_fases} |

## Progresso

| ${barra} | ${progresso}% |
|:---|---:|

## 📍 Fase Atual: ${faseAtual?.nome || "N/A"}

| Campo | Valor |
|-------|-------|
| **Especialista** | ${faseAtual?.especialista || "N/A"} |
| **Entregável** | ${faseAtual?.entregavel_esperado || "N/A"} |

### Gate de Saída
${faseAtual?.gate_checklist.map(item => `- [ ] ${item}`).join("\n") || "N/A"}

${especialistaInfo}
${templateInfo}

---

**Próximos passos:**
- Para ver status completo: \`status(estado_json: "...")\`
- Para avançar: \`proximo(entregavel: "...", estado_json: "...")\`

${faseAtual ? gerarInstrucaoRecursos(faseAtual.especialista, faseAtual.template, "AÇÃO OBRIGATÓRIA - Carregar Recursos") : ""}
`;

    return {
        content: [{ type: "text", text: resposta }],
        estado_atualizado: args.estado_json, // Retornar estado para contexto
    };
}

export const carregarProjetoSchema = {
    type: "object",
    properties: {
        estado_json: {
            type: "string",
            description: "Conteúdo do arquivo .maestro/estado.json",
        },
        resumo_json: {
            type: "string",
            description: "Conteúdo do arquivo .maestro/resumo.json (opcional)",
        },
        diretorio: {
            type: "string",
            description: "Caminho absoluto do diretório do projeto",
        },
    },
    required: ["estado_json", "diretorio"],
};
