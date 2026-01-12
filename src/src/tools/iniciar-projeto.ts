import { join } from "path";
import { v4 as uuid } from "uuid";
import type { ToolResult } from "../types/index.js";
import { criarEstadoInicial, serializarEstado } from "../state/storage.js";
import { setCurrentDirectory } from "../state/context.js";
import { criarResumoInicial, serializarResumo } from "../state/memory.js";
import { getFase } from "../flows/types.js";

interface IniciarProjetoArgs {
    nome: string;
    descricao?: string;
    diretorio: string; // Obrigatório - a IA deve informar
}

/**
 * Tool: iniciar_projeto
 * Inicia um novo projeto com o Maestro (modo stateless)
 * Retorna arquivos para a IA salvar - resposta compacta
 */
export async function iniciarProjeto(args: IniciarProjetoArgs): Promise<ToolResult> {
    // Validar diretório
    if (!args.diretorio) {
        return {
            content: [{
                type: "text",
                text: `# ❌ Erro: Diretório Obrigatório

O parâmetro \`diretorio\` é obrigatório.

**Exemplo:**
\`\`\`
iniciar_projeto(nome: "meu-projeto", diretorio: "C:/projetos/meu-projeto")
\`\`\`
`,
            }],
            isError: true,
        };
    }

    const diretorio = args.diretorio;
    setCurrentDirectory(diretorio);

    const projetoId = uuid();
    const estado = criarEstadoInicial(projetoId, args.nome, diretorio);
    const resumo = criarResumoInicial(projetoId, args.nome, "medio", 1, 10);
    resumo.descricao = args.descricao;

    const estadoFile = serializarEstado(estado);
    const resumoFiles = serializarResumo(resumo);

    const fase = getFase("medio", 1)!;

    const resposta = `# 🚀 Projeto Iniciado: ${args.nome}

| Campo | Valor |
|-------|-------|
| **ID** | \`${projetoId}\` |
| **Fase** | 1/? (definido após PRD) |
| **Diretório** | \`${diretorio}\` |

---

## ⚡ AÇÃO OBRIGATÓRIA - Criar Arquivos

### 1. Criar: estado.json
**Caminho:** \`${diretorio}/.maestro/estado.json\`

\`\`\`json
${estadoFile.content}
\`\`\`

### 2. Criar: resumo.json
**Caminho:** \`${diretorio}/.maestro/resumo.json\`

\`\`\`json
${resumoFiles[0].content}
\`\`\`

### 3. Criar: resumo.md
**Caminho:** \`${diretorio}/.maestro/resumo.md\`

\`\`\`markdown
${resumoFiles[1].content}
\`\`\`

---

## 📋 Próximo Passo

Desenvolva o **PRD** definindo:
- Problema a resolver
- Personas
- MVP
- Métricas

Quando terminar, diga **"próximo"**.

> 💡 Use \`read_resource("maestro://especialista/${fase.especialista}")\` para ver o especialista.
> 💡 Use \`read_resource("maestro://template/${fase.template}")\` para ver o template.
`;

    return {
        content: [{ type: "text", text: resposta }],
        files: [
            { path: `${diretorio}/${estadoFile.path}`, content: estadoFile.content },
            ...resumoFiles.map(f => ({ path: `${diretorio}/${f.path}`, content: f.content }))
        ],
        estado_atualizado: estadoFile.content,
    };
}

export const iniciarProjetoSchema = {
    type: "object",
    properties: {
        nome: {
            type: "string",
            description: "Nome do projeto",
        },
        descricao: {
            type: "string",
            description: "Descrição opcional do projeto",
        },
        diretorio: {
            type: "string",
            description: "Diretório absoluto onde o projeto será criado (obrigatório)",
        },
    },
    required: ["nome", "diretorio"],
};
