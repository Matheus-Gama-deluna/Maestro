import type { NivelComplexidade, ClassificacaoResultado } from "../types/index.js";

/**
 * Classifica a complexidade do projeto baseado no PRD
 */
export function classificarPRD(prd: string): ClassificacaoResultado {
    let pontos = 0;
    const criterios: string[] = [];

    // Critério 1: Entidades (conta substantivos capitalizados únicos)
    const entidadesMatch = prd.match(/[A-Z][a-záéíóúàãõç]+/g) || [];
    const entidadesUnicas = new Set(entidadesMatch.filter(e => e.length > 3));
    const numEntidades = entidadesUnicas.size;

    if (numEntidades > 15) {
        pontos += 3;
        criterios.push(`Muitas entidades (${numEntidades}+)`);
    } else if (numEntidades > 8) {
        pontos += 2;
        criterios.push(`Entidades moderadas (${numEntidades})`);
    } else {
        pontos += 1;
    }

    // Critério 2: Integrações externas
    const integracoes = /API|integra|externa|third-party|webhook|OAuth|SSO|payment|pagamento/gi;
    if (integracoes.test(prd)) {
        pontos += 3;
        criterios.push("Integrações externas detectadas");
    }

    // Critério 3: Requisitos de segurança
    const seguranca = /LGPD|GDPR|compliance|autenticação|autorização|JWT|criptografia|encrypt|PCI/gi;
    if (seguranca.test(prd)) {
        pontos += 3;
        criterios.push("Requisitos de segurança/compliance");
    }

    // Critério 4: Escala e performance
    const escala = /milhares|milhões|alta disponibilidade|scale|concurrent|cluster|load balanc/gi;
    if (escala.test(prd)) {
        pontos += 3;
        criterios.push("Requisitos de escala/performance");
    }

    // Critério 5: Multi-tenant ou B2B
    const multiTenant = /multi-tenant|inquilino|organização|workspace|empresa|cliente/gi;
    if (multiTenant.test(prd)) {
        pontos += 2;
        criterios.push("Multi-tenancy ou B2B");
    }

    // Critério 6: Tempo/cronograma
    const cronogramaMatch = prd.match(/(\d+)\s*(mês|meses|mes|month|semana|semanas|week)/gi);
    if (cronogramaMatch) {
        const tempo = parseInt(cronogramaMatch[0]);
        if (tempo > 6) {
            pontos += 3;
            criterios.push(`Cronograma longo (${tempo}+ meses)`);
        } else if (tempo > 2) {
            pontos += 2;
            criterios.push(`Cronograma moderado (${tempo} meses)`);
        } else {
            pontos += 1;
        }
    }

    // Critério 7: Complexidade de regras de negócio
    const regrasNegocio = /regra|cálculo|fluxo|workflow|estado|status|condição|if|when|validação/gi;
    const regrasCount = (prd.match(regrasNegocio) || []).length;
    if (regrasCount > 10) {
        pontos += 3;
        criterios.push("Muitas regras de negócio");
    } else if (regrasCount > 5) {
        pontos += 2;
    }

    // Critério 8: Equipe
    const equipe = /equipe|time|desenvolvedor|dev|programador/gi;
    const equipeMatch = prd.match(/(\d+)\s*(desenvolvedor|dev|pessoa|membro)/gi);
    if (equipeMatch) {
        const tamanho = parseInt(equipeMatch[0]);
        if (tamanho > 5) {
            pontos += 2;
            criterios.push(`Equipe grande (${tamanho}+ devs)`);
        }
    }

    // Determinar nível baseado na pontuação
    let nivel: NivelComplexidade;
    if (pontos <= 8) {
        nivel = "simples";
    } else if (pontos <= 15) {
        nivel = "medio";
    } else {
        nivel = "complexo";
    }

    return {
        nivel,
        pontuacao: pontos,
        criterios,
    };
}

/**
 * Retorna descrição do nível de complexidade
 */
export function descreverNivel(nivel: NivelComplexidade): string {
    switch (nivel) {
        case "simples":
            return "Projeto simples (5 fases) - MVP rápido, poucas integrações";
        case "medio":
            return "Projeto médio (11 fases) - Completo com segurança e testes";
        case "complexo":
            return "Projeto complexo (15 fases) - Enterprise com arquitetura avançada";
    }
}
