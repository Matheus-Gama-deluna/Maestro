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
export function loadCollectingContext(skillName: string, ide: IDEType, projectDir?: string): string {
    return formatSkillHydrationCommand(skillName, ide, projectDir);
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

    const collectingContext = loadCollectingContext(sp.skillName, resolveIDE(estado, diretorio), diretorio);

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

    // v8.0: Perguntas OPERACIONAIS para fases de código (não de stack — já definida na Arquitetura)
    if (nome === 'frontend' || nome.includes('frontend')) {
        return `
## 🎨 Desenvolvimento Frontend — Setup Operacional

A stack já está definida na Arquitetura. Preciso confirmar pontos **operacionais**:

### 1. Estado do Projeto
- O projeto Frontend já foi inicializado? (ex: pasta \`frontend/\` existe?)
- Se não, posso criar com a stack da Arquitetura?

### 2. Prioridade de Implementação
- Qual User Story quer priorizar? (Recomendo começar pelo fluxo principal do Backlog)
- Prefere seguir a ordem dos Sprints planejados no Backlog?

### 3. Mock Server
- MSW já configurado? Precisa de setup com tipos do OpenAPI?
- Ou quer desenvolver direto contra o backend (se já existir)?

### 4. Estrutura
- Monorepo ou repos separados (frontend/backend)?
- Tem design system ou component library já configurado?

> 💡 Após suas respostas, vou gerar o setup e começar pela primeira User Story.
> Se preferir, posso prosseguir com defaults razoáveis baseados na Arquitetura.
`;
    }

    if (nome === 'backend' || nome.includes('backend')) {
        return `
## ⚙️ Desenvolvimento Backend — Setup Operacional

A stack já está definida na Arquitetura. Preciso confirmar pontos **operacionais**:

### 1. Banco de Dados
- O banco PostgreSQL está rodando? (local, Docker, ou cloud?)
- O Prisma schema já existe ou devo criar a partir do \`design-banco.md\`?
- Seeds iniciais necessários? (dados de teste)

### 2. Prioridade de Implementação
- Seguir a ordem dos Sprints do Backlog?
- Qual módulo implementar primeiro? (Recomendo: Auth → CRUD principal)

### 3. Estrutura
- Onde fica o código backend? (pasta \`backend/\`, \`server/\`, raiz?)
- Clean Architecture conforme definido na Arquitetura?

### 4. Ambiente
- Variáveis de ambiente (.env) já configuradas?
- Redis disponível para cache/filas?

> 💡 Após suas respostas, vou criar a estrutura e começar pela primeira User Story.
`;
    }

    if (nome.includes('integra')) {
        return `
## 🔗 Integração — Setup Operacional

### 1. Conexão Frontend ↔ Backend
- Frontend em qual porta? Backend em qual porta?
- CORS já configurado?
- Proxy ou chamada direta?

### 2. Variáveis de Ambiente
- \`.env\` do frontend com URL do backend?
- \`.env\` do backend com credenciais de serviços externos?

### 3. Mocks
- Quer manter mock como fallback ou remover totalmente?
- MSW configurado para desativar em produção?

### 4. Testes E2E
- Playwright ou Cypress configurado?
- Precisa de Docker Compose para ambiente completo?

> 💡 O objetivo é substituir todos os mocks por conexões reais e validar E2E.
`;
    }

    if (nome.includes('deploy')) {
        return `
## 🚀 Deploy Final — Setup Operacional

### 1. Infraestrutura
- Ambiente de deploy definido? (AWS, Vercel, Docker, VPS?)
- CI/CD pipeline já existe? (GitHub Actions, etc.)

### 2. Configuração
- Variáveis de ambiente de produção definidas?
- Domínio e SSL configurados?

### 3. Monitoramento
- Observabilidade configurada? (logs, métricas, traces)
- Health checks implementados?

### 4. Estratégia
- Deploy blue/green, canary, ou direto?
- Rollback automático configurado?

> 💡 O objetivo é colocar o sistema em produção com monitoramento ativo.
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
