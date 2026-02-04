import type { InferenciaContextual, PerguntaPriorizada } from "../types/index.js";

const DOMINIO_PATTERNS: Record<string, string[]> = {
    "e-commerce": ["loja", "produto", "carrinho", "pagamento", "estoque"],
    "fintech": ["pagamento", "cartão", "banco", "transação", "pix"],
    "saude": ["paciente", "consulta", "prontuário", "medico"],
    "educacao": ["aluno", "curso", "aula", "professor"],
    "gestao": ["usuario", "dashboard", "relatório", "admin"],
};

const STACK_RULES = [
    {
        stack: { frontend: "react", backend: "node", database: "postgres" },
        condicoes: ["spa", "dashboard", "tempo real", "socket", "node", "typescript"],
    },
    {
        stack: { frontend: "blade", backend: "laravel", database: "mysql" },
        condicoes: ["crud", "backoffice", "tradicional", "php", "laravel"],
    },
    {
        stack: { frontend: "vue", backend: "php", database: "mysql" },
        condicoes: ["vue", "inertia", "php"],
    },
];

export function inferirContextoBalanceado(texto: string): InferenciaContextual {
    const dominio = detectarDominio(texto);
    const stack = inferirStack(texto);

    const perguntas_prioritarias: PerguntaPriorizada[] = buildPerguntasPrioritarias({ dominio, stack });

    return {
        dominio,
        stack,
        perguntas_prioritarias,
    };
}

function detectarDominio(texto: string): { nome: string; confianca: number } | undefined {
    const lower = texto.toLowerCase();
    let melhor: { nome: string; confianca: number } | undefined;

    Object.entries(DOMINIO_PATTERNS).forEach(([nome, palavras]) => {
        const hits = palavras.filter((p) => lower.includes(p)).length;
        if (hits === 0) return;
        const confianca = Math.min(1, hits / palavras.length + 0.2);
        if (!melhor || confianca > melhor.confianca) {
            melhor = { nome, confianca };
        }
    });

    return melhor && melhor.confianca >= 0.55 ? melhor : undefined;
}

function inferirStack(texto: string): { frontend?: string; backend?: string; database?: string; confianca: number } | undefined {
    const lower = texto.toLowerCase();
    let melhor: { frontend?: string; backend?: string; database?: string; confianca: number } | undefined;

    STACK_RULES.forEach((rule) => {
        const hits = rule.condicoes.filter((c) => lower.includes(c)).length;
        if (hits === 0) return;
        const confianca = Math.min(1, hits / rule.condicoes.length + 0.25);
        if (!melhor || confianca > melhor.confianca) {
            melhor = { ...rule.stack, confianca };
        }
    });

    return melhor && melhor.confianca >= 0.6 ? melhor : undefined;
}

function buildPerguntasPrioritarias(ctx: {
    dominio?: { nome: string; confianca: number };
    stack?: { frontend?: string; backend?: string; database?: string; confianca: number };
}): PerguntaPriorizada[] {
    const perguntas: PerguntaPriorizada[] = [];

    // Perguntas críticas sempre perguntadas (não inferir)
    perguntas.push(
        { pergunta: "Quais integrações externas são obrigatórias?", prioridade: "critica", pode_inferir: false },
        { pergunta: "Existem requisitos de segurança/compliance (LGPD/PCI/HIPAA)?", prioridade: "critica", pode_inferir: false },
        { pergunta: "Volume de usuários/dados esperado?", prioridade: "critica", pode_inferir: false },
    );

    // Perguntas importantes: podem ser inferidas só se alta confiança
    if (ctx.dominio) {
        perguntas.push({
            pergunta: `Domínio do projeto é ${ctx.dominio.nome}?`,
            prioridade: "importante",
            pode_inferir: ctx.dominio.confianca >= 0.75,
            valor_inferido: ctx.dominio.nome,
            confianca_inferencia: ctx.dominio.confianca,
        });
    } else {
        perguntas.push({ pergunta: "Qual é o domínio do produto?", prioridade: "importante", pode_inferir: false });
    }

    if (ctx.stack) {
        perguntas.push({
            pergunta: `Stack preferida confirma ${ctx.stack.frontend || ""}/${ctx.stack.backend || ""}/${ctx.stack.database || ""}?`,
            prioridade: "importante",
            pode_inferir: ctx.stack.confianca >= 0.75,
            valor_inferido: `${ctx.stack.frontend || ""}/${ctx.stack.backend || ""}/${ctx.stack.database || ""}`,
            confianca_inferencia: ctx.stack.confianca,
        });
    } else {
        perguntas.push({ pergunta: "Alguma stack preferida? (frontend/backend/database)", prioridade: "importante", pode_inferir: false });
    }

    // Perguntas opcionais
    perguntas.push({ pergunta: "Time e senioridade?", prioridade: "opcional", pode_inferir: false });

    return perguntas;
}
