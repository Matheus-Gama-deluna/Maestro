/**
 * Specialist Formatters — Módulo de formatação de output do specialist handler
 *
 * Contém: extractTemplateSkeleton, formatMissingFieldsByBlock, loadCollectingContext,
 *         buildCollectionPrompt, getSpecialistQuestions, truncateValue
 *
 * @since v6.0 — Extraído de specialist-phase-handler.ts (Task 2.8)
 */

import type { ToolResult, EstadoProjeto } from "../types/index.js";
import type { SpecialistPhaseState } from "../types/onboarding.js";
import { formatResponse } from "../utils/response-formatter.js";
import { type IDEType, formatSkillHydrationCommand } from "../utils/ide-paths.js";
import { getRequiredFields, type RequiredField } from "./field-normalizer.js";

/**
 * v6.1 (Problem #4): Extracts only the heading structure (skeleton) from a full template.
 * Reduces token usage by ~80% compared to injecting the full template content.
 */
export function extractTemplateSkeleton(templateContent: string): string {
    const lines = templateContent.split('\n');
    const skeleton: string[] = [];

    for (const line of lines) {
        if (line.match(/^#{1,6}\s+/)) {
            skeleton.push(line);
        } else if (line.match(/^\s*-?\s*\[\s*\]/)) {
            const match = line.match(/^\s*-?\s*\[\s*\]\s*\*?\*?(.+?)[\*:].*/);
            if (match) {
                skeleton.push(`- [ ] ${match[1].trim()}`);
            } else {
                skeleton.push(line.substring(0, 80));
            }
        }
    }

    return skeleton.join('\n');
}

/**
 * Sprint 3 (NP1, NP5, NP9): Formata campos faltantes organizados por blocos temáticos com exemplos.
 */
export function formatMissingFieldsByBlock(missing: RequiredField[], _mode: string): string {
    const blockTitles: Record<string, string> = {
        'problema': '🔍 **O Problema**',
        'solucao': '💡 **A Solução**',
        'planejamento': '📅 **Planejamento**',
    };

    const blockOrder = ['problema', 'solucao', 'planejamento'];
    const grouped: Record<string, RequiredField[]> = {};

    for (const f of missing) {
        if (!grouped[f.block]) grouped[f.block] = [];
        grouped[f.block].push(f);
    }

    const parts: string[] = ['## Campos que FALTAM (pergunte ao usuário):\n'];

    for (const block of blockOrder) {
        const fields = grouped[block];
        if (!fields || fields.length === 0) continue;

        parts.push(`### ${blockTitles[block] || block}\n`);
        for (const f of fields) {
            parts.push(`❌ **${f.label}**`);
            parts.push(`   _${f.hint}_`);
            parts.push(`   ${f.example}\n`);
        }
    }

    return parts.join('\n');
}

/**
 * Sprint 2 (NP6, NP8): Carrega contexto resumido do especialista para injeção na fase collecting.
 * v7.0: Substituído injeção ativa por menção dinâmica da IDE
 */
export function loadCollectingContext(skillName: string, ide: IDEType): string {
    return formatSkillHydrationCommand(skillName, ide);
}

/**
 * Trunca valor para exibição
 */
export function truncateValue(value: unknown): string {
    const str = String(value);
    return str.length > 80 ? str.substring(0, 77) + '...' : str;
}

/**
 * Constrói prompt de coleta quando não há respostas
 */
export async function buildCollectionPrompt(
    estado: EstadoProjeto,
    diretorio: string,
    sp: SpecialistPhaseState,
    mode: string,
    resolveIDE: (estado: EstadoProjeto, diretorio: string) => IDEType
): Promise<ToolResult> {
    const required = getRequiredFields(mode);
    const missing = required.filter(f => !sp.collectedData[f.id]);
    const collected = required.filter(f => sp.collectedData[f.id]);

    const missingTemplate: Record<string, string> = {};
    for (const f of missing) {
        missingTemplate[f.id] = `<${f.label}>`;
    }

    const collectedInfo = collected.length > 0
        ? `\n\nCampos já coletados:\n${collected.map(f => `✅ **${f.label}**: ${truncateValue(sp.collectedData[f.id])}`).join('\n')}`
        : '';

    const collectingContext = loadCollectingContext(sp.skillName, resolveIDE(estado, diretorio));

    return {
        content: formatResponse({
            titulo: "🧠 Especialista: Gestão de Produto",
            resumo: `Coleta de informações do produto. ${collected.length}/${required.length} campos preenchidos.`,
            instrucoes: `⚠️ OBRIGATÓRIO: Pergunte ao usuário os campos abaixo. NÃO invente dados.

${collectingContext}
${collectedInfo}

${formatMissingFieldsByBlock(missing, mode)}

⚠️ REGRA CRÍTICA: Os dados devem vir DIRETAMENTE do usuário.
Se o usuário pedir "crie os dados", "invente para teste" ou "preencha para mim":
→ Responda: "Preciso que VOCÊ me conte sobre o seu produto. Mesmo que seja simples, suas respostas reais vão gerar um PRD muito melhor do que dados inventados."
→ Reformule as perguntas de forma mais simples se o usuário parecer travado.
→ Ofereça exemplos para inspirar, mas NÃO use os exemplos como resposta.

Após coletar as respostas, EXECUTE:

\`\`\`json
executar({
    "diretorio": "${diretorio}",
    "acao": "avancar",
    "respostas": ${JSON.stringify(missingTemplate, null, 4)}
})
\`\`\`

## 📍 Onde Estamos
✅ Setup → 🔄 Coleta → ⏳ Geração PRD → ⏳ Validação → ⏳ Aprovação

⚠️ Para avançar, SEMPRE use: \`executar({acao: "avancar"})\`
⚠️ NUNCA use: \`maestro({acao: "status"})\` para tentar avançar`,
            proximo_passo: {
                tool: "executar",
                descricao: "Enviar respostas coletadas do usuário",
                args: `{ "diretorio": "${diretorio}", "acao": "avancar", "respostas": ${JSON.stringify(missingTemplate)} }`,
                requer_input_usuario: true,
                prompt_usuario: `Responda: ${missing.map(f => f.label).join(', ')}`,
            },
        }),
        next_action: {
            tool: "executar",
            description: `Coletar e enviar: ${missing.map(f => f.label).join(', ')}`,
            args_template: {
                diretorio,
                acao: "avancar",
                respostas: missingTemplate,
            },
            requires_user_input: true,
            user_prompt: `Pergunte ao usuário: ${missing.map(f => f.label).join(', ')}`,
        },
        specialist_persona: {
            name: "Gestão de Produto",
            tone: "Estratégico e orientado ao usuário",
            expertise: ["product discovery", "lean startup", "user stories", "MVP definition"],
            instructions: "Conduza a coleta focada em PRODUTO. PERGUNTE — NÃO invente. Faça follow-up quando respostas forem vagas.",
        },
        progress: {
            current_phase: "specialist_active",
            total_phases: 5,
            completed_phases: 1,
            percentage: 20,
        },
    };
}

/**
 * Sprint 2 (v7.0): Retorna perguntas técnicas que o especialista deve fazer
 * Distribui perguntas técnicas aos especialistas de cada fase
 *
 * v8.1 FIX: Refatorado para usar nome da fase em vez de número hardcoded.
 */
export function getSpecialistQuestions(fase: number, faseNome?: string): string {
    const nome = faseNome?.toLowerCase() || '';

    if (nome === 'requisitos' || (!faseNome && fase === 2)) {
        return `
## 📋 Coleta de Requisitos Técnicos

Como Especialista de Requisitos, preciso entender alguns aspectos técnicos para criar um documento completo:

### 1. Volume e Escala
- Quantos usuários simultâneos você espera?
- Quantas transações/operações por dia?
- Crescimento esperado nos próximos 6 meses?

### 2. Integrações Externas
- Precisa integrar com quais sistemas/APIs?
- Exemplos: pagamento (Stripe, PagSeguro), email (SendGrid), SMS, etc.
- Autenticação social? (Google, Facebook, etc.)

### 3. Segurança e Compliance
- Precisa seguir LGPD? (dados de brasileiros)
- Dados sensíveis? (cartão, saúde, financeiro)
- Outros requisitos? (PCI-DSS, HIPAA, SOC2)

### 4. Performance
- Tempo de resposta esperado? (ex: < 200ms)
- Disponibilidade necessária? (ex: 99.9%)
- Horários de pico de uso?

> 💡 Responda de forma natural, não precisa seguir a ordem exata. Após suas respostas, vou criar o documento de requisitos.
`;
    }

    if (nome === 'arquitetura' || nome === 'arquitetura avançada') {
        return `
## 🏗️ Decisões de Arquitetura

Como Especialista de Arquitetura, preciso entender suas preferências e restrições:

### 1. Stack Tecnológica
- **Frontend:** Tem preferência? (React, Vue, Angular, Next.js)
- **Backend:** Qual linguagem/framework? (Node.js, Python, PHP, Java)
- **Database:** Qual banco de dados? (PostgreSQL, MySQL, MongoDB)
- Alguma restrição ou tecnologia que o time já domina?

### 2. Time e Infraestrutura
- Quem vai desenvolver? (senioridade: júnior, pleno, sênior)
- Onde vai hospedar? (AWS, Azure, Vercel, Heroku, VPS)
- Orçamento mensal de infraestrutura?

### 3. Padrões Arquiteturais
- Monolito ou microserviços?
- Multi-tenant necessário?
- Precisa de cache? CDN?

> 💡 Se não tiver preferência, posso sugerir a melhor stack baseado nos requisitos já definidos.
`;
    }

    if (nome === 'prototipagem') {
        return `
## 🎨 Prototipagem Rápida com Google Stitch

Como Especialista de Prototipagem, vou transformar o Design Doc aprovado em protótipos interativos usando Google Stitch.

### 📋 Processo de 5 Etapas

**Etapa 1 — Análise** *(automática)*
O sistema analisa o Design Doc e mapeia:
- Componentes de UI necessários
- Fluxos de interação principais
- Design System definido

**Etapa 2 — Geração de Prompts** *(automática)*
O sistema gera prompts otimizados e salva em:
📁 \`prototipos/stitch-prompts.md\`

**Etapa 3 — Prototipagem no Stitch** *(usuário)*
Você usa os prompts no stitch.withgoogle.com:
1. Copie cada prompt do arquivo gerado
2. Cole no Google Stitch
3. Itere até obter o resultado desejado
4. **Exporte o código HTML**
5. **Salve os arquivos .html na pasta \`prototipos/\`**

**Etapa 4 — Validação HTML** *(automática)*
O sistema valida os arquivos HTML na pasta:
- Estrutura HTML válida
- Conteúdo mínimo
- Score >= 50 para aprovação

**Etapa 5 — Aprovação**
Protótipos validados → próxima fase

### ⚠️ IMPORTANTE
- **NÃO** peça decisões de stack tecnológica — isso é da fase de Arquitetura
- **NÃO** peça decisões de infraestrutura — isso é da fase de Arquitetura
- Foco é **100% visual**: transformar o Design Doc em protótipos funcionais
- A fase **só será concluída** quando os arquivos HTML estiverem na pasta \`prototipos/\`

### 🎯 Para começar, preciso saber:
1. Qual Design System usar? (Material, Ant Design, Chakra UI, Custom)
2. Quais são as 3-5 telas mais importantes para prototipar primeiro?
3. Tem preferência de tema? (light/dark)

> 💡 Acesse stitch.withgoogle.com para usar os prompts que vou gerar. O Stitch é gratuito e gera interfaces com código exportável.
`;
    }

    return '';
}
