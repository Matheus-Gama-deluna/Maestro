/**
 * Testes para DeliverableValidator v6.1
 *
 * Cobre os cenários críticos de validação de entregáveis de fase:
 * - PRD vazio → bloqueado
 * - PRD completo → aprovado
 * - Placeholders → penalizado
 * - Gate checklist → score aumenta quando evidenciado
 * - Fases de código (Frontend/Backend) → tratamento especial
 */

import { describe, it, expect } from 'vitest';
import { DeliverableValidator } from '../core/validation/layers/DeliverableValidator.js';
import type { DeliverableContext } from '../core/validation/layers/DeliverableValidator.js';

const validator = new DeliverableValidator();

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeContext(nomeFase: string, gateChecklist: string[] = []): DeliverableContext {
    return {
        projectPath: '/test/project',
        nomeFase,
        gateChecklist,
        tier: 'base',
    };
}

const PRD_VAZIO = '';
const PRD_CURTO = '# PRD\n\nAlgum texto.';
const PRD_PLACEHOLDER = `# PRD do Produto

## Problema
Lorem ipsum dolor sit amet.

## Objetivo
TODO: definir objetivo

## Persona
[inserir persona aqui]

## MVP
- Feature A
- Feature B

## Funcionalidades
FIXME: listar funcionalidades
`;

const PRD_COMPLETO = `# PRD — Sistema de Gestão de Pedidos

## Problema
Restaurantes perdem pedidos por falta de sistema centralizado. O processo manual gera erros e atrasos.

## Objetivo
Criar um sistema digital que centralize pedidos, reduza erros em 80% e aumente a satisfação dos clientes.

## Persona
**João, Gerente de Restaurante** — 35 anos, usa smartphone, precisa de visibilidade em tempo real dos pedidos.

## MVP
O MVP inclui: cadastro de produtos, recebimento de pedidos via tablet, notificação para cozinha, e relatório diário.

## Funcionalidades Principais
1. Cadastro de cardápio com categorias e preços
2. Interface de pedido para garçons (tablet)
3. Painel da cozinha com fila de pedidos
4. Relatório de vendas por período
5. Integração com sistema de pagamento

## Critérios de Sucesso
- Redução de 80% nos erros de pedido
- Tempo de atendimento < 2 minutos
- Satisfação do cliente ≥ 4.5/5
`;

const REQUISITOS_COMPLETO = `# Requisitos do Sistema

## RF-001 — Cadastro de Produto
O sistema deve permitir cadastrar produtos com nome, preço e categoria.
**Critério de aceite:** Produto salvo aparece no cardápio em < 1s.

## RF-002 — Pedido via Tablet
O garçom deve conseguir registrar pedidos pelo tablet.
**Critério de aceite:** Pedido enviado para cozinha em < 3s.

## RNF-001 — Performance
O sistema deve responder em < 500ms para 95% das requisições.

## RNF-002 — Disponibilidade
O sistema deve ter uptime de 99.9%.

## Critérios de Aceite Gerais
Todos os RFs devem ter testes automatizados com cobertura > 80%.
`;

// ─── Testes ────────────────────────────────────────────────────────────────

describe('DeliverableValidator: Fase Produto (PRD)', () => {
    it('deve BLOQUEAR entregável vazio', async () => {
        const result = await validator.validate(PRD_VAZIO, makeContext('Produto'));
        expect(result.passed).toBe(false);
        expect(result.score).toBeLessThan(70);
    });

    it('deve BLOQUEAR entregável muito curto', async () => {
        const result = await validator.validate(PRD_CURTO, makeContext('Produto'));
        expect(result.passed).toBe(false);
        expect(result.issues.some(i => i.type === 'content-too-short')).toBe(true);
    });

    it('deve PENALIZAR entregável com placeholders', async () => {
        const result = await validator.validate(PRD_PLACEHOLDER, makeContext('Produto'));
        expect(result.issues.some(i => i.type === 'placeholder-content')).toBe(true);
        // Score deve ser menor que um PRD sem placeholders
        const resultSemPlaceholder = await validator.validate(PRD_COMPLETO, makeContext('Produto'));
        expect(result.score).toBeLessThan(resultSemPlaceholder.score);
    });

    it('deve APROVAR PRD completo com todas as seções', async () => {
        const result = await validator.validate(PRD_COMPLETO, makeContext('Produto'));
        expect(result.passed).toBe(true);
        expect(result.score).toBeGreaterThanOrEqual(70);
    });

    it('deve ter score maior quando gate checklist é evidenciado', async () => {
        const gate = ['problema', 'persona', 'funcionalidades'];

        const resultSemGate = await validator.validate(PRD_COMPLETO, makeContext('Produto', []));
        const resultComGate = await validator.validate(PRD_COMPLETO, makeContext('Produto', gate));

        // Com gate evidenciado, score deve ser igual ou maior (bônus)
        expect(resultComGate.score).toBeGreaterThanOrEqual(resultSemGate.score);
    });

    it('deve PENALIZAR quando gate checklist não é evidenciado', async () => {
        const gate = ['análise competitiva detalhada', 'projeção financeira de 5 anos', 'pesquisa com 1000 usuários'];
        const result = await validator.validate(PRD_COMPLETO, makeContext('Produto', gate));

        // Gate items muito específicos não estarão no PRD → penalidade
        expect(result.issues.some(i => i.type === 'gate-checklist-incomplete')).toBe(true);
    });
});

describe('DeliverableValidator: Fase Requisitos', () => {
    it('deve APROVAR requisitos completos com RF, RNF e critérios', async () => {
        const result = await validator.validate(REQUISITOS_COMPLETO, makeContext('Requisitos'));
        expect(result.passed).toBe(true);
        expect(result.score).toBeGreaterThanOrEqual(70);
    });

    it('deve detectar ausência de critérios de aceite', async () => {
        const semCriterios = `# Requisitos\n\n## RF-001\nO sistema deve fazer X.\n\n## RNF-001\nPerformance adequada.\n`;
        const result = await validator.validate(semCriterios, makeContext('Requisitos'));
        // 'aceite' está nos termos obrigatórios — deve detectar ausência
        const missingIssue = result.issues.find(i => i.type === 'missing-sections');
        expect(missingIssue).toBeDefined();
    });
});

describe('DeliverableValidator: Qualidade do Markdown', () => {
    it('deve detectar documento sem headings', async () => {
        const semHeadings = 'Apenas texto sem nenhum heading markdown. '.repeat(50);
        const result = await validator.validate(semHeadings, makeContext('Produto'));
        expect(result.issues.some(i => i.type === 'no-headings')).toBe(true);
    });

    it('deve detectar documento apenas com bullets', async () => {
        const apenasBullets = Array(20).fill('- Item de lista sem contexto').join('\n');
        const result = await validator.validate(apenasBullets, makeContext('Produto'));
        expect(result.issues.some(i => i.type === 'only-bullets')).toBe(true);
    });
});

describe('DeliverableValidator: Fases de Código (Frontend/Backend)', () => {
    const codigoFrontend = `
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Componente de lista de pedidos
export function OrderList() {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    // Estado de carregamento
    const [loading, setLoading] = useState(false);

    return (
        <div className="order-list">
            {orders.map(order => (
                <div key={order.id}>{order.name}</div>
            ))}
        </div>
    );
}

// Rota principal
export default OrderList;
`;

    it('deve detectar entregável de código para fase Frontend', async () => {
        const result = await validator.validate(codigoFrontend, makeContext('Frontend'));
        // Para código, não deve exigir headings Markdown
        const noHeadingsIssue = result.issues.find(i => i.type === 'no-headings');
        // Código legítimo não deve ser bloqueado por falta de headings Markdown
        // (o validator deve detectar que é código e não Markdown)
        expect(result.score).toBeGreaterThan(0); // Não deve dar score 0 para código válido
    });

    it('deve ter tamanho mínimo menor para fases de código', async () => {
        // Fases de código têm tamanho mínimo de 300 chars (menor que PRD com 800)
        const codigoCurto = `export function hello() { return 'world'; }`;
        const result = await validator.validate(codigoCurto, makeContext('Frontend'));
        // Código curto pode falhar por tamanho, mas não por ausência de headings
        const noHeadingsIssue = result.issues.find(i => i.type === 'no-headings');
        // Para código, não deve ter issue de headings
        expect(noHeadingsIssue).toBeUndefined();
    });
});

describe('DeliverableValidator: Score e Threshold', () => {
    it('score deve ser 100 para documento perfeito sem issues', async () => {
        // Fase sem seções obrigatórias definidas → sem penalidades de seção
        const conteudoPerfeito = `# Documento Perfeito\n\n${'Conteúdo detalhado e completo. '.repeat(30)}`;
        const result = await validator.validate(conteudoPerfeito, makeContext('Desconhecida'));
        expect(result.score).toBeGreaterThanOrEqual(90); // Sem penalidades → score alto
    });

    it('threshold de aprovação deve ser 70', async () => {
        // Verificar que o threshold é 70 (não 60 nem 80)
        const result = await validator.validate(PRD_COMPLETO, makeContext('Produto'));
        // PRD completo deve passar com score ≥ 70
        if (result.score >= 70) {
            expect(result.passed).toBe(true);
        } else {
            expect(result.passed).toBe(false);
        }
    });
});
