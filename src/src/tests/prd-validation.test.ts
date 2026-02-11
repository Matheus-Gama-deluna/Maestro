/**
 * Testes de validação do PRD — verifica que PRDs reais passam nos 3 validadores
 * Criado para garantir que regex/keywords expandidas funcionam corretamente.
 */

import { describe, it, expect } from 'vitest';
import { validarEstrutura } from '../gates/estrutura.js';
import { validarGate } from '../gates/validator.js';
import type { Fase } from '../types/index.js';

// PRD real do SubsTrack (caso de teste que falhava com score 67/100)
const PRD_SUBSTRACK = `# SubsTrack - PRD Completo e Evoluído

## PROBLEMA
Fadiga de assinaturas: pessoas perdem dinheiro com serviços não utilizados, esquecem períodos de teste e não visualizam impacto total dos gastos recorrentes no orçamento mensal. Causa raiz: proliferação de modelos de assinatura e falta de ferramentas centralizadas.

## USUÁRIOS/PERSONAS
**Ana Silva (B2C)**: 32 anos, profissional de marketing, 8+ assinaturas (streaming, fitness, produtividade). Objetivo: controlar gastos e evitar surpresas. Dores: esquece cancelamentos, perde dinheiro.

**Carlos Oliveira (B2B)**: 28 anos, freelancer designer, 5+ ferramentas SaaS. Objetivo: otimizar custos operacionais com orçamento apertado. Dores: perde controle dos custos SaaS.

## FUNCIONALIDADES/MVP
1. **Varredura Automática**: Integração com e-mail/Open Banking para identificar cobranças recorrentes
2. **Alertas de Renovação**: Notificação 3 dias antes de cobranças/fim de testes gratuitos
3. **Cancelamento em Um Clique**: Automatização via IA agents ou e-mails jurídicos automáticos
4. **Dashboard de Gastos**: Visualização clara do "Custo de Vida Digital" mensal/anual

## MÉTRICAS DE SUCESSO
**North Star**: Economia Média por Usuário (valor em R$ economizado nos primeiros 90 dias, meta: R$50)

**KPIs Secundários**:
- Taxa de ativação: 60% em 7 dias
- Assinaturas identificadas: 8+ por usuário
- Retenção mensal: 85%
- NPS: 50+
- LTV: R$240 (12 meses x R$19,90)
- CAC: R$50 (marketing digital)
- Payback: 3 meses
- Churn Rate: <5% mensal

## STAKEHOLDERS
- Sponsor: João Silva (CEO, ex-nubank, 10 anos fintech)
- Product Manager: Maria Santos (ex-picpay, specialist em produtos financeiros)
- Tech Lead: Pedro Costa (8 anos experiência em Open Banking e IA)
- Design Lead: Ana Lima (UX sênior, especialista em produtos financeiros)

## ANÁLISE COMPETITIVA
| Concorrente | Modelo | Diferencial | Fraqueza |
|-------------|--------|-------------|----------|
| Mobills | Controle financeiro | Controle completo | Sem cancelamento automatizado |
| Organizze | Planejamento | Educação financeira | Manual, sem IA |
| GuiaBolso | Agregador | Conexão bancária | Foco em controle, não em cancelamento |

**Posicionamento**: Único com Auto-Pilot de Cancelamento via IA e especialização em recorrência

## TIMELINE MVP
10 semanas: 4 semanas integração APIs, 4 semanas interface/alertas, 2 semanas beta fechado com 50 usuários.

## PLANO DE APRENDIZADO
- **Experimento 1**: Beta fechado 50 usuários, >95% precisão identificação, 2 semanas
- **Experimento 2**: Teste A/B cancelamento (100 usuários), >60% taxa cancelamento automatizado vs 20% manual, 2 semanas`;

const fasePRD: Fase = {
    numero: 1,
    nome: "Produto",
    especialista: "Gestor de Produto",
    template: "PRD.md",
    entregavel_esperado: "PRD",
    gate_checklist: [
        "Problema claramente definido",
        "Personas ou usuários identificados",
        "Funcionalidades MVP listadas",
        "Métricas de sucesso definidas",
    ],
};

describe('Validação do PRD — estrutura.ts', () => {
    it('deve encontrar 4/4 seções obrigatórias no PRD do SubsTrack', () => {
        const result = validarEstrutura(1, PRD_SUBSTRACK, 'base');
        expect(result.secoes_encontradas).toHaveLength(4);
        expect(result.secoes_faltando).toHaveLength(0);
        expect(result.valido).toBe(true);
        expect(result.score).toBeGreaterThanOrEqual(80);
    });

    it('deve aceitar headers com ### (h3)', () => {
        const prd = `### Problema\nDescrição do problema aqui.\n\n### Usuários\nDescrição dos usuários.\n\n### MVP\nFuncionalidades do MVP.\n\n### Métricas\nMétricas de sucesso.`;
        const result = validarEstrutura(1, prd, 'base');
        expect(result.secoes_encontradas.length).toBeGreaterThanOrEqual(3);
    });

    it('deve aceitar headers numerados (## 1. Problema)', () => {
        const prd = `## 1. Problema\nDescrição.\n\n## 2. Personas\nDescrição.\n\n## 3. Funcionalidades\nDescrição.\n\n## 4. Métricas\nDescrição.`;
        const result = validarEstrutura(1, prd, 'base');
        expect(result.secoes_encontradas.length).toBeGreaterThanOrEqual(3);
    });

    it('deve aceitar variações com acento (USUÁRIOS, MÉTRICAS)', () => {
        const prd = `## PROBLEMA\nDescrição.\n\n## USUÁRIOS\nDescrição.\n\n## FUNCIONALIDADES\nDescrição.\n\n## MÉTRICAS DE SUCESSO\nDescrição.`;
        const result = validarEstrutura(1, prd, 'base');
        expect(result.secoes_encontradas).toHaveLength(4);
    });

    it('deve aceitar "USUÁRIOS/PERSONAS" com barra', () => {
        const prd = `## PROBLEMA\nDescrição.\n\n## USUÁRIOS/PERSONAS\nDescrição.\n\n## FUNCIONALIDADES/MVP\nDescrição.\n\n## MÉTRICAS DE SUCESSO\nDescrição.`;
        const result = validarEstrutura(1, prd, 'base');
        expect(result.secoes_encontradas).toHaveLength(4);
    });

    it('deve aceitar sinônimos (Público-alvo, Solução, KPIs)', () => {
        const prd = `## Dor do Cliente\nDescrição.\n\n## Público-alvo\nDescrição.\n\n## Solução Proposta\nDescrição.\n\n## KPIs\nDescrição.`;
        const result = validarEstrutura(1, prd, 'base');
        expect(result.secoes_encontradas).toHaveLength(4);
    });
});

describe('Validação do PRD — validator.ts (checklist)', () => {
    it('deve validar 4/4 itens do checklist no PRD do SubsTrack', () => {
        const result = validarGate(fasePRD, PRD_SUBSTRACK);
        expect(result.itens_validados).toHaveLength(4);
        expect(result.itens_pendentes).toHaveLength(0);
        expect(result.valido).toBe(true);
    });

    it('deve reconhecer "problema" via sinônimos', () => {
        const prd = 'A dor principal é a falta de controle financeiro sobre assinaturas.';
        const result = validarGate(fasePRD, prd);
        // Pelo menos o item "Problema claramente definido" deve passar (sinônimo "dor")
        expect(result.itens_validados.some(i => i.toLowerCase().includes('problema'))).toBe(true);
    });

    it('deve reconhecer "personas" via sinônimos', () => {
        const prd = 'O público-alvo são jovens profissionais de 25-35 anos.';
        const result = validarGate(fasePRD, prd);
        expect(result.itens_validados.some(i => i.toLowerCase().includes('persona') || i.toLowerCase().includes('usuário'))).toBe(true);
    });

    it('deve reconhecer "funcionalidades" via sinônimos', () => {
        const prd = 'O MVP inclui dashboard, alertas e cancelamento automático.';
        const result = validarGate(fasePRD, prd);
        expect(result.itens_validados.some(i => i.toLowerCase().includes('funcionalidade') || i.toLowerCase().includes('mvp'))).toBe(true);
    });

    it('deve reconhecer "métricas" via sinônimos', () => {
        const prd = 'Os KPIs incluem taxa de ativação, retenção e NPS.';
        const result = validarGate(fasePRD, prd);
        expect(result.itens_validados.some(i => i.toLowerCase().includes('métrica') || i.toLowerCase().includes('sucesso'))).toBe(true);
    });
});

describe('Score combinado (calcularQualityScore simulado)', () => {
    it('PRD do SubsTrack deve atingir score >= 70', () => {
        const estruturaResult = validarEstrutura(1, PRD_SUBSTRACK, 'base');
        const gateResult = validarGate(fasePRD, PRD_SUBSTRACK);

        const totalChecklist = gateResult.itens_validados.length + gateResult.itens_pendentes.length;
        const checklistScore = totalChecklist > 0
            ? (gateResult.itens_validados.length / totalChecklist) * 100
            : 100;
        const tamanhoScore = estruturaResult.tamanho_ok ? 100 : 50;

        const qualityScore = Math.round(
            (estruturaResult.score * 0.30) +
            (checklistScore * 0.50) +
            (tamanhoScore * 0.20)
        );

        expect(qualityScore).toBeGreaterThanOrEqual(70);
    });

    it('PRD mínimo com 4 seções deve atingir score >= 70', () => {
        const prdMinimo = `## Problema\nDescrição do problema com detalhes suficientes para validação.\n\n## Personas\nUsuários identificados com perfis detalhados.\n\n## Funcionalidades MVP\nLista de funcionalidades do MVP com descrições.\n\n## Métricas de Sucesso\nKPIs e métricas definidas com metas claras.`;

        const estruturaResult = validarEstrutura(1, prdMinimo, 'base');
        const gateResult = validarGate(fasePRD, prdMinimo);

        const totalChecklist = gateResult.itens_validados.length + gateResult.itens_pendentes.length;
        const checklistScore = totalChecklist > 0
            ? (gateResult.itens_validados.length / totalChecklist) * 100
            : 100;
        const tamanhoScore = estruturaResult.tamanho_ok ? 100 : 50;

        const qualityScore = Math.round(
            (estruturaResult.score * 0.30) +
            (checklistScore * 0.50) +
            (tamanhoScore * 0.20)
        );

        expect(qualityScore).toBeGreaterThanOrEqual(70);
    });
});
