import type { ToolResult } from "../types/index.js";
import { salvarEstado, criarEstadoInicial, carregarEstado } from "../state/storage.js";
import { lerEspecialista, lerTemplate } from "../utils/files.js";
import { FLUXO_FEATURE, FLUXO_BUG, FLUXO_REFATORACAO } from "../flows/alternativas.js";
import { v4 as uuid } from "uuid";

interface NovaFeatureArgs {
    descricao: string;
    impacto_estimado?: "baixo" | "medio" | "alto";
}

/**
 * Tool: nova_feature
 * Inicia fluxo de desenvolvimento de nova feature
 */
export async function novaFeature(args: NovaFeatureArgs): Promise<ToolResult> {
    const diretorio = process.cwd();
    let estado = await carregarEstado(diretorio);

    // Se não existe projeto, cria um para a feature
    if (!estado) {
        estado = criarEstadoInicial(uuid(), `Feature: ${args.descricao.slice(0, 50)}`, diretorio);
    }

    estado.tipo_fluxo = "feature";
    estado.fase_atual = 1;
    estado.total_fases = FLUXO_FEATURE.total_fases;
    estado.gates_validados = [];
    await salvarEstado(diretorio, estado);

    const fase = FLUXO_FEATURE.fases[0];
    const especialista = await lerEspecialista(fase.especialista);
    const template = await lerTemplate(fase.template);

    const resposta = `# 🆕 Nova Feature Iniciada

## Descrição
${args.descricao}

## Impacto Estimado
${args.impacto_estimado?.toUpperCase() || "A definir"}

## Fluxo de Feature (${FLUXO_FEATURE.total_fases} fases)

${FLUXO_FEATURE.fases.map((f, i) => `${i === 0 ? "🔄" : "⬜"} **Fase ${f.numero}**: ${f.nome}`).join("\n")}

---

# 📍 Fase 1: ${fase.nome}

## Especialista: ${fase.especialista}

${especialista}

---

## Template: ${fase.template}

${template}

---

## Gate de Saída
${fase.gate_checklist.map(item => `- [ ] ${item}`).join("\n")}

Quando terminar, diga **"próximo"** para avançar.
`;

    return {
        content: [{ type: "text", text: resposta }],
    };
}

export const novaFeatureSchema = {
    type: "object",
    properties: {
        descricao: {
            type: "string",
            description: "Descrição da feature a ser desenvolvida",
        },
        impacto_estimado: {
            type: "string",
            enum: ["baixo", "medio", "alto"],
            description: "Impacto estimado da feature",
        },
    },
    required: ["descricao"],
};

interface CorrigirBugArgs {
    descricao: string;
    severidade?: "critica" | "alta" | "media" | "baixa";
    ticket_id?: string;
}

/**
 * Tool: corrigir_bug
 * Inicia fluxo de correção de bug
 */
export async function corrigirBug(args: CorrigirBugArgs): Promise<ToolResult> {
    const diretorio = process.cwd();
    let estado = await carregarEstado(diretorio);

    if (!estado) {
        estado = criarEstadoInicial(uuid(), `Bug: ${args.descricao.slice(0, 50)}`, diretorio);
    }

    estado.tipo_fluxo = "bug";
    estado.fase_atual = 1;
    estado.total_fases = FLUXO_BUG.total_fases;
    estado.gates_validados = [];
    await salvarEstado(diretorio, estado);

    const fase = FLUXO_BUG.fases[0];
    const especialista = await lerEspecialista(fase.especialista);
    const template = await lerTemplate(fase.template);

    const resposta = `# 🐛 Correção de Bug Iniciada

## Descrição
${args.descricao}

## Severidade
${args.severidade?.toUpperCase() || "A definir"}

${args.ticket_id ? `## Ticket\n\`${args.ticket_id}\`` : ""}

## Fluxo de Bug Fix (${FLUXO_BUG.total_fases} fases)

${FLUXO_BUG.fases.map((f, i) => `${i === 0 ? "🔄" : "⬜"} **Fase ${f.numero}**: ${f.nome}`).join("\n")}

---

# 📍 Fase 1: ${fase.nome}

## Especialista: ${fase.especialista}

${especialista}

---

## Template: ${fase.template}

${template}

---

## Gate de Saída
${fase.gate_checklist.map(item => `- [ ] ${item}`).join("\n")}

Quando terminar, diga **"próximo"** para avançar.
`;

    return {
        content: [{ type: "text", text: resposta }],
    };
}

export const corrigirBugSchema = {
    type: "object",
    properties: {
        descricao: {
            type: "string",
            description: "Descrição do bug a ser corrigido",
        },
        severidade: {
            type: "string",
            enum: ["critica", "alta", "media", "baixa"],
            description: "Severidade do bug",
        },
        ticket_id: {
            type: "string",
            description: "ID do ticket (opcional)",
        },
    },
    required: ["descricao"],
};

interface RefatorarArgs {
    area: string;
    motivo: string;
}

/**
 * Tool: refatorar
 * Inicia fluxo de refatoração de código legado
 */
export async function refatorar(args: RefatorarArgs): Promise<ToolResult> {
    const diretorio = process.cwd();
    let estado = await carregarEstado(diretorio);

    if (!estado) {
        estado = criarEstadoInicial(uuid(), `Refatoração: ${args.area}`, diretorio);
    }

    estado.tipo_fluxo = "refatoracao";
    estado.fase_atual = 1;
    estado.total_fases = FLUXO_REFATORACAO.total_fases;
    estado.gates_validados = [];
    await salvarEstado(diretorio, estado);

    const fase = FLUXO_REFATORACAO.fases[0];
    const especialista = await lerEspecialista(fase.especialista);
    const template = await lerTemplate(fase.template);

    const resposta = `# 🔧 Refatoração Iniciada

## Área a Refatorar
${args.area}

## Motivo
${args.motivo}

## Fluxo de Refatoração (${FLUXO_REFATORACAO.total_fases} fases)

${FLUXO_REFATORACAO.fases.map((f, i) => `${i === 0 ? "🔄" : "⬜"} **Fase ${f.numero}**: ${f.nome}`).join("\n")}

---

# 📍 Fase 1: ${fase.nome}

## Especialista: ${fase.especialista}

${especialista}

---

## Template: ${fase.template}

${template}

---

## Gate de Saída
${fase.gate_checklist.map(item => `- [ ] ${item}`).join("\n")}

Quando terminar, diga **"próximo"** para avançar.
`;

    return {
        content: [{ type: "text", text: resposta }],
    };
}

export const refatorarSchema = {
    type: "object",
    properties: {
        area: {
            type: "string",
            description: "Área do código a ser refatorada",
        },
        motivo: {
            type: "string",
            description: "Motivo da refatoração",
        },
    },
    required: ["area", "motivo"],
};
