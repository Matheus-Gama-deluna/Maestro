import type { ToolResult, EstadoProjeto } from "../types/index.js";
import { parsearEstado } from "../state/storage.js";
import { getFase } from "../flows/types.js";
import { validarGate as validarGateCore, formatarResultadoGate, validarGateComTemplate } from "../gates/validator.js";
import { formatarResultadoValidacao } from "../gates/template-validator.js";
import { gerarRelatorioQualidade, compararComTier } from "../gates/quality-scorer.js";
import { normalizeProjectPath, resolveProjectPath } from "../utils/files.js";
import { setCurrentDirectory } from "../state/context.js";
import { resolve, dirname } from "path";
import { getSkillParaFase } from "../utils/prompt-mapper.js";
import { getSkillResourcePath, detectIDE } from "../utils/ide-paths.js";

interface ValidarGateArgs {
    fase?: number;
    entregavel?: string;
    estado_json: string;     // Estado atual (obrigatório)
    diretorio: string;       // Diretório do projeto (obrigatório)
}

/**
 * Tool: validar_gate
 * Valida checklist de saída da fase (modo stateless)
 */
export async function validarGate(args: ValidarGateArgs): Promise<ToolResult> {
    // Validar parâmetros
    if (!args.estado_json) {
        return {
            content: [{
                type: "text",
                text: `# 📋 Validar Gate (Modo Stateless)

Para validar um gate, a IA deve:
1. Ler o arquivo \`.maestro/estado.json\` do projeto
2. Passar o conteúdo como parâmetro

**Uso:**
\`\`\`
validar_gate(
    entregavel: "[conteúdo]",
    estado_json: "...",
    diretorio: "C:/projetos/meu-projeto"
)
\`\`\`
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
                text: "❌ **Erro**: Não foi possível parsear o estado JSON.",
            }],
            isError: true,
        };
    }

    const diretorio = resolveProjectPath(args.diretorio);
    setCurrentDirectory(diretorio);

    const numeroFase = args.fase || estado.fase_atual;
    const fase = getFase(estado.nivel, numeroFase);

    if (!fase) {
        return {
            content: [{
                type: "text",
                text: `❌ **Erro**: Fase ${numeroFase} não encontrada.`,
            }],
            isError: true,
        };
    }

    // Se não passou entregável, mostrar checklist
    if (!args.entregavel) {
        const resposta = `# 📋 Gate da Fase ${numeroFase}: ${fase.nome}

## Checklist de Saída

${fase.gate_checklist.map((item, i) => `${i + 1}. ${item}`).join("\n")}

## Como usar

Para validar o gate, passe o entregável:
\`\`\`
validar_gate(
    entregavel: "[seu conteúdo]",
    estado_json: "...",
    diretorio: "..."
)
\`\`\`
`;

        return {
            content: [{ type: "text", text: resposta }],
        };
    }

    // Tentar validação com template (novo sistema)
    const diretorioMaestro = dirname(dirname(dirname(__dirname)));
    const diretorioContent = resolve(diretorioMaestro, "content");
    const tier = estado.tier_gate || "base";
    
    const validacaoTemplate = validarGateComTemplate(fase, args.entregavel, tier, diretorioContent);
    
    let resposta = "";
    
    if (validacaoTemplate.sucesso && validacaoTemplate.resultado) {
        // Usar novo sistema baseado em template
        const resultado = validacaoTemplate.resultado;
        
        resposta = `# Gate da Fase ${numeroFase}: ${fase.nome}

`;
        resposta += `## 🎯 Validação Baseada em Template\n\n`;
        resposta += `**Template:** \`${resultado.skillNome}\`\n`;
        resposta += `**Tier:** ${tier}\n\n`;
        
        resposta += formatarResultadoValidacao(resultado, tier);
        
        // Relatório de qualidade
        if (resultado.qualidade) {
            resposta += "\n" + gerarRelatorioQualidade(resultado.qualidade, tier);
            
            const comparacao = compararComTier(resultado.qualidade, tier);
            resposta += "\n" + comparacao.mensagem + "\n\n";
        }
        
        // Link para template
        const skillAtual = getSkillParaFase(fase.nome);
        if (skillAtual) {
            const ide = estado.ide || detectIDE(args.diretorio) || 'windsurf';
            const templatesPath = getSkillResourcePath(skillAtual, 'templates', ide);
            resposta += `## 📄 Template de Referência\n\n`;
            resposta += `**Localização:** \`${templatesPath}\`\n\n`;
            resposta += `> 💡 Consulte o template para ver a estrutura completa esperada.\n\n`;
        }
        
        resposta += resultado.valido
            ? "✅ **Você pode avançar!** Use `proximo(entregavel: \"...\", estado_json: \"...\")` para ir para a próxima fase."
            : "⚠️ **Complete os itens pendentes** ou use `proximo(entregavel: \"...\", estado_json: \"...\", confirmar_usuario: true)` para forçar avanço.";
    } else {
        // Fallback para sistema legado
        const resultado = validarGateCore(fase, args.entregavel);
        const resultadoFormatado = formatarResultadoGate(resultado);
        
        resposta = `# Gate da Fase ${numeroFase}: ${fase.nome}\n\n`;
        resposta += `## ⚠️ Validação Legada (Template não disponível)\n\n`;
        resposta += resultadoFormatado + "\n\n";
        
        const skillAtual = getSkillParaFase(fase.nome);
        if (skillAtual) {
            const ide = estado.ide || detectIDE(args.diretorio) || 'windsurf';
            const checklistPath = getSkillResourcePath(skillAtual, 'checklists', ide);
            resposta += `## 📋 Checklist da Skill\n\n`;
            resposta += `**Localização:** \`${checklistPath}\`\n\n`;
            resposta += `> 💡 Consulte o checklist completo da skill para validação detalhada.\n\n`;
        }
        
        resposta += resultado.valido
            ? "✅ **Você pode avançar!** Use `proximo(entregavel: \"...\", estado_json: \"...\")` para ir para a próxima fase."
            : "⚠️ **Complete os itens pendentes** ou use `proximo(entregavel: \"...\", estado_json: \"...\", confirmar_usuario: true)` para forçar avanço.";
    }

    return {
        content: [{ type: "text", text: resposta }],
        estado_atualizado: args.estado_json,
    };
}

/**
 * Input schema para validar_gate
 */
export const validarGateSchema = {
    type: "object",
    properties: {
        fase: {
            type: "number",
            description: "Número da fase a validar (default: fase atual)",
        },
        entregavel: {
            type: "string",
            description: "Conteúdo do entregável para validação",
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
    required: ["estado_json", "diretorio"],
};
