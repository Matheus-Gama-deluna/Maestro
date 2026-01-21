import type { ToolResult, EstadoProjeto } from "../types/index.js";
import { parsearEstado, serializarEstado } from "../state/storage.js";
import { setCurrentDirectory } from "../state/context.js";

interface AprovarGateArgs {
    estado_json: string;     // Estado atual (obrigatório)
    diretorio: string;       // Diretório do projeto (obrigatório)
    acao: "aprovar" | "rejeitar";  // Ação do usuário
}

/**
 * Tool: aprovar_gate
 * 🔐 EXCLUSIVO DO USUÁRIO - Aprova ou rejeita avanço com pendências
 * 
 * Esta tool só deve ser executada quando o USUÁRIO HUMANO explicitamente
 * solicitar aprovação ou rejeição do gate pendente.
 * 
 * A IA NÃO deve chamar esta tool por conta própria.
 */
export async function aprovarGate(args: AprovarGateArgs): Promise<ToolResult> {
    // Validar parâmetros
    if (!args.estado_json) {
        return {
            content: [{
                type: "text",
                text: `# 🔐 Aprovar Gate (Exclusivo do Usuário)

Esta tool é para uso EXCLUSIVO do usuário humano.

**Uso:**
\`\`\`
aprovar_gate(
    acao: "aprovar" | "rejeitar",
    estado_json: "...",
    diretorio: "C:/projetos/meu-projeto"
)
\`\`\`

> ⚠️ **IMPORTANTE**: A IA NÃO deve chamar esta tool automaticamente.
> Apenas execute quando o usuário pedir explicitamente para aprovar ou rejeitar.
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

    if (!args.acao || !["aprovar", "rejeitar"].includes(args.acao)) {
        return {
            content: [{
                type: "text",
                text: "❌ **Erro**: Parâmetro `acao` deve ser 'aprovar' ou 'rejeitar'.",
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
                text: "❌ **Erro**: Não foi possível parsear o estado JSON.",
            }],
            isError: true,
        };
    }

    setCurrentDirectory(args.diretorio);

    // Verificar se há aprovação pendente
    if (!estado.aguardando_aprovacao) {
        return {
            content: [{
                type: "text",
                text: `# ℹ️ Nenhuma Aprovação Pendente

O projeto não está aguardando aprovação de gate.

**Estado atual:**
- Fase: ${estado.fase_atual}/${estado.total_fases}
- Nível: ${estado.nivel}

> ⚠️ Para usar esta tool, o projeto deve primeiro passar por \`proximo()\`
> e ser bloqueado com score < 70.
`,
            }],
        };
    }

    // Verificar se há score registrado (garante que passou por validação real)
    if (args.acao === "aprovar" && estado.score_bloqueado === undefined) {
        return {
            content: [{
                type: "text",
                text: `# ⚠️ Aprovação Inválida

Não há score registrado para aprovar.

O projeto deve primeiro:
1. Passar por \`proximo()\` com um entregável
2. Ser bloqueado com score < 70
3. Então o usuário pode aprovar

**Use \`proximo()\` primeiro com o entregável completo.**
`,
            }],
            isError: true,
        };
    }

    const scoreAnterior = estado.score_bloqueado;
    const motivoAnterior = estado.motivo_bloqueio;

    if (args.acao === "aprovar") {
        // Limpar flags de bloqueio
        estado.aguardando_aprovacao = false;
        estado.motivo_bloqueio = undefined;
        estado.score_bloqueado = undefined;

        // Serializar estado
        const estadoFile = serializarEstado(estado);

        return {
            content: [{
                type: "text",
                text: `# ✅ Gate Aprovado pelo Usuário

O avanço foi autorizado manualmente.

| Campo | Valor |
|-------|-------|
| **Score anterior** | ${scoreAnterior}/100 |
| **Motivo bloqueio** | ${motivoAnterior} |

## ⚡ Próximos Passos

1. **Salve o estado atualizado:**
   \`${args.diretorio}/.maestro/estado.json\`

2. **Chame \`proximo()\`** para avançar:
   \`\`\`
   proximo(entregavel: "...", estado_json: "...", diretorio: "...")
   \`\`\`

---

## 📁 Estado Atualizado

\`\`\`json
${estadoFile.content}
\`\`\`
`,
            }],
            files: [{
                path: `${args.diretorio}/${estadoFile.path}`,
                content: estadoFile.content
            }],
            estado_atualizado: estadoFile.content,
        };
    } else {
        // Rejeitar - limpar flags e manter na fase atual
        estado.aguardando_aprovacao = false;
        estado.motivo_bloqueio = undefined;
        estado.score_bloqueado = undefined;

        // Serializar estado
        const estadoFile = serializarEstado(estado);

        return {
            content: [{
                type: "text",
                text: `# ❌ Gate Rejeitado pelo Usuário

O avanço foi rejeitado. O projeto permanece na fase atual.

| Campo | Valor |
|-------|-------|
| **Fase atual** | ${estado.fase_atual}/${estado.total_fases} |
| **Score rejeitado** | ${scoreAnterior}/100 |

## 💡 Recomendação

Corrija os itens pendentes antes de tentar avançar novamente.

---

## 📁 Estado Atualizado

\`\`\`json
${estadoFile.content}
\`\`\`
`,
            }],
            files: [{
                path: `${args.diretorio}/${estadoFile.path}`,
                content: estadoFile.content
            }],
            estado_atualizado: estadoFile.content,
        };
    }
}

/**
 * Input schema para aprovar_gate
 */
export const aprovarGateSchema = {
    type: "object",
    properties: {
        acao: {
            type: "string",
            enum: ["aprovar", "rejeitar"],
            description: "🔐 EXCLUSIVO DO USUÁRIO. 'aprovar' para liberar avanço, 'rejeitar' para manter na fase atual.",
        },
        estado_json: {
            type: "string",
            description: "Conteúdo do arquivo .maestro/estado.json",
        },
        diretorio: {
            type: "string",
            description: "Diretório absoluto do projeto",
        },
    },
    required: ["acao", "estado_json", "diretorio"],
};
