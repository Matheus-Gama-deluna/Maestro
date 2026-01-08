import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuid } from "uuid";
import type { ToolResult } from "../types/index.js";
import { lerEspecialista, lerTemplate } from "../utils/files.js";
import { salvarEstado, criarEstadoInicial } from "../state/storage.js";
import { setCurrentDirectory } from "../state/context.js";
import { getFase, getFluxo } from "../flows/types.js";

interface IniciarProjetoArgs {
    nome: string;
    descricao?: string;
    diretorio?: string;
}

/**
 * Tool: iniciar_projeto
 * Inicia um novo projeto com o Maestro
 */
export async function iniciarProjeto(args: IniciarProjetoArgs): Promise<ToolResult> {
    const diretorio = args.diretorio || process.cwd();

    // Set global directory context for subsequent tool calls
    setCurrentDirectory(diretorio);

    const projetoId = uuid();

    // Criar estrutura de pastas
    await mkdir(join(diretorio, ".guia"), { recursive: true });
    await mkdir(join(diretorio, "docs"), { recursive: true });

    // Estado inicial (médio por padrão, será reclassificado após PRD)
    const estado = criarEstadoInicial(projetoId, args.nome, diretorio);
    await salvarEstado(diretorio, estado);

    // Carregar especialista e template da fase 1
    const fase = getFase("medio", 1)!;
    const especialista = await lerEspecialista(fase.especialista);
    const template = await lerTemplate(fase.template);

    const resposta = `# 🚀 Projeto Iniciado: ${args.nome}

## Status
| Campo | Valor |
|-------|-------|
| **ID** | \`${projetoId}\` |
| **Fase** | 1/? (definido após PRD) |
| **Especialista** | ${fase.especialista} |
| **Diretório** | \`${diretorio}\` |

## 📋 Próximo Passo

Desenvolva o **PRD (Product Requirements Document)** para definir:
- Qual problema será resolvido
- Quem são os usuários (personas)
- Quais funcionalidades compõem o MVP
- Métricas de sucesso

Quando terminar, diga **"próximo"** para avançar.

---

## 🎭 Especialista: ${fase.especialista}

${especialista}

---

## 📝 Template: PRD

${template}
`;

    return {
        content: [{ type: "text", text: resposta }],
    };
}

/**
 * Input schema para iniciar_projeto
 */
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
            description: "Diretório do projeto (default: diretório atual)",
        },
    },
    required: ["nome"],
};
