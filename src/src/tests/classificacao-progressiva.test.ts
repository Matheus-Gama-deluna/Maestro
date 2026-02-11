/**
 * Testes para ClassificacaoProgressivaService v6.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ClassificacaoProgressivaService } from '../services/classificacao-progressiva.service.js';
import type { Fase, SinalClassificacao } from '../types/index.js';

describe('ClassificacaoProgressivaService', () => {
    let service: ClassificacaoProgressivaService;

    beforeEach(() => {
        service = new ClassificacaoProgressivaService();
    });

    describe('registrarSinais', () => {
        it('deve extrair sinais do PRD (Fase 1)', () => {
            const prd = `
# PRD - Sistema E-commerce

## Funcionalidades
- Carrinho de compras
- Pagamento com Stripe
- Autenticação OAuth
- Dashboard de vendas
- Integração com API de frete

## Requisitos
- LGPD compliance
- Alta disponibilidade
- Multi-tenant
- Cronograma: 6 meses
            `;

            const fase: Fase = {
                numero: 1,
                nome: 'Produto',
                especialista: 'Gestão de Produto',
                entregavel_esperado: 'PRD.md',
                gate_checklist: [],
                template: 'PRD.md'
            };

            const sinais = service.registrarSinais(prd, fase, []);

            expect(sinais.length).toBeGreaterThan(0);

            // Deve detectar domínio
            const sinalDominio = sinais.find(s => s.categoria === 'dominio');
            expect(sinalDominio).toBeDefined();
            expect(sinalDominio?.valor).toBe('E-commerce');

            // Deve detectar timeline
            const sinalTimeline = sinais.find(s => s.categoria === 'timeline');
            expect(sinalTimeline).toBeDefined();
            expect(sinalTimeline?.valor).toContain('6 meses');
        });

        it('deve extrair sinais de requisitos (Fase 2)', () => {
            const requisitos = `
# Requisitos

## Segurança
- LGPD compliance obrigatório
- Autenticação JWT
- 2FA para admin

## Performance
- Latência < 200ms
- SLA 99.9%
- Escalabilidade para 100k usuários
            `;

            const fase: Fase = {
                numero: 2,
                nome: 'Requisitos',
                especialista: 'Engenharia de Requisitos',
                entregavel_esperado: 'requisitos.md',
                gate_checklist: [],
                template: 'requisitos.md'
            };

            const sinais = service.registrarSinais(requisitos, fase, []);

            // Deve detectar compliance
            const sinalSeguranca = sinais.filter(s => s.categoria === 'seguranca');
            expect(sinalSeguranca.length).toBeGreaterThan(0);
            expect(sinalSeguranca.some(s => s.valor === 'LGPD/GDPR')).toBe(true);

            // Deve detectar volume
            const sinalVolume = sinais.find(s => s.categoria === 'volume');
            expect(sinalVolume).toBeDefined();
        });

        it('deve extrair sinais de arquitetura (Fase 4+)', () => {
            const arquitetura = `
# Arquitetura

## Stack
- Frontend: React/Next.js
- Backend: Node.js/NestJS
- Database: PostgreSQL

## Integrações
- Stripe para pagamentos
- SendGrid para emails
- S3 para storage

## Padrões
- Microserviços
- Multi-tenant
            `;

            const fase: Fase = {
                numero: 4,
                nome: 'Arquitetura',
                especialista: 'Arquitetura de Software',
                entregavel_esperado: 'arquitetura.md',
                gate_checklist: [],
                template: 'arquitetura.md'
            };

            const sinais = service.registrarSinais(arquitetura, fase, []);

            // Deve detectar stack
            const sinaisStack = sinais.filter(s => s.categoria === 'stack');
            expect(sinaisStack.length).toBeGreaterThanOrEqual(3); // Frontend, Backend, Database

            // Deve detectar integrações
            const sinaisIntegracao = sinais.filter(s => s.categoria === 'integracao');
            expect(sinaisIntegracao.length).toBeGreaterThanOrEqual(2);
        });

        it('não deve duplicar sinais', () => {
            const prd = 'E-commerce com LGPD';
            const fase: Fase = {
                numero: 1,
                nome: 'Produto',
                especialista: 'Gestão de Produto',
                entregavel_esperado: 'PRD.md',
                gate_checklist: [],
                template: 'PRD.md'
            };

            const sinais1 = service.registrarSinais(prd, fase, []);
            const sinais2 = service.registrarSinais(prd, fase, sinais1);

            // Não deve duplicar
            expect(sinais2.length).toBe(sinais1.length);
        });
    });

    describe('recalcular', () => {
        it('deve classificar como simples com poucos sinais', () => {
            const sinais: SinalClassificacao[] = [
                {
                    fase: 1,
                    fonte: 'prd',
                    categoria: 'dominio',
                    valor: 'Dashboard',
                    confianca: 0.8,
                    timestamp: new Date().toISOString()
                },
                {
                    fase: 1,
                    fonte: 'prd',
                    categoria: 'escopo',
                    valor: 'Baixo (<8 funcionalidades)',
                    confianca: 0.7,
                    timestamp: new Date().toISOString()
                }
            ];

            const resultado = service.recalcular(sinais);

            expect(resultado.nivel).toBe('simples');
            expect(resultado.confianca).toBeGreaterThan(0);
            expect(resultado.criterios.length).toBeGreaterThan(0);
        });

        it('deve classificar como médio com sinais moderados', () => {
            const sinais: SinalClassificacao[] = [
                {
                    fase: 1,
                    fonte: 'prd',
                    categoria: 'dominio',
                    valor: 'E-commerce',
                    confianca: 0.8,
                    timestamp: new Date().toISOString()
                },
                {
                    fase: 1,
                    fonte: 'prd',
                    categoria: 'escopo',
                    valor: 'Médio (8-15 funcionalidades)',
                    confianca: 0.8,
                    timestamp: new Date().toISOString()
                },
                {
                    fase: 2,
                    fonte: 'requisitos',
                    categoria: 'seguranca',
                    valor: 'LGPD/GDPR',
                    confianca: 0.9,
                    timestamp: new Date().toISOString()
                },
                {
                    fase: 2,
                    fonte: 'requisitos',
                    categoria: 'volume',
                    valor: 'Médio (10k-100k usuários)',
                    confianca: 0.8,
                    timestamp: new Date().toISOString()
                },
                {
                    fase: 4,
                    fonte: 'arquitetura',
                    categoria: 'integracao',
                    valor: 'Gateway de pagamento',
                    confianca: 0.9,
                    timestamp: new Date().toISOString()
                },
                {
                    fase: 4,
                    fonte: 'arquitetura',
                    categoria: 'integracao',
                    valor: 'Email/SMTP',
                    confianca: 0.85,
                    timestamp: new Date().toISOString()
                },
                {
                    fase: 4,
                    fonte: 'arquitetura',
                    categoria: 'stack',
                    valor: 'Frontend: React',
                    confianca: 0.95,
                    timestamp: new Date().toISOString()
                },
                {
                    fase: 4,
                    fonte: 'arquitetura',
                    categoria: 'stack',
                    valor: 'Backend: Node.js',
                    confianca: 0.95,
                    timestamp: new Date().toISOString()
                }
            ];

            const resultado = service.recalcular(sinais);

            expect(resultado.nivel).toBe('medio');
            expect(resultado.confianca).toBeGreaterThan(50);
        });

        it('deve classificar como complexo com muitos sinais', () => {
            const sinais: SinalClassificacao[] = [
                {
                    fase: 1,
                    fonte: 'prd',
                    categoria: 'dominio',
                    valor: 'FinTech',
                    confianca: 0.8,
                    timestamp: new Date().toISOString()
                },
                {
                    fase: 1,
                    fonte: 'prd',
                    categoria: 'escopo',
                    valor: 'Alto (>15 funcionalidades)',
                    confianca: 0.85,
                    timestamp: new Date().toISOString()
                },
                {
                    fase: 2,
                    fonte: 'requisitos',
                    categoria: 'seguranca',
                    valor: 'PCI-DSS',
                    confianca: 0.9,
                    timestamp: new Date().toISOString()
                },
                {
                    fase: 2,
                    fonte: 'requisitos',
                    categoria: 'seguranca',
                    valor: 'LGPD/GDPR',
                    confianca: 0.9,
                    timestamp: new Date().toISOString()
                },
                {
                    fase: 2,
                    fonte: 'requisitos',
                    categoria: 'volume',
                    valor: 'Alto (>100k usuários)',
                    confianca: 0.9,
                    timestamp: new Date().toISOString()
                },
                {
                    fase: 4,
                    fonte: 'arquitetura',
                    categoria: 'integracao',
                    valor: 'Gateway de pagamento',
                    confianca: 0.9,
                    timestamp: new Date().toISOString()
                },
                {
                    fase: 4,
                    fonte: 'arquitetura',
                    categoria: 'integracao',
                    valor: 'Autenticação social',
                    confianca: 0.85,
                    timestamp: new Date().toISOString()
                },
                {
                    fase: 4,
                    fonte: 'arquitetura',
                    categoria: 'integracao',
                    valor: 'Email/SMTP',
                    confianca: 0.8,
                    timestamp: new Date().toISOString()
                },
                {
                    fase: 4,
                    fonte: 'arquitetura',
                    categoria: 'integracao',
                    valor: 'Storage/CDN',
                    confianca: 0.8,
                    timestamp: new Date().toISOString()
                },
                {
                    fase: 4,
                    fonte: 'arquitetura',
                    categoria: 'arquitetura',
                    valor: 'Multi-tenant',
                    confianca: 0.9,
                    timestamp: new Date().toISOString()
                },
                {
                    fase: 4,
                    fonte: 'arquitetura',
                    categoria: 'arquitetura',
                    valor: 'Microserviços',
                    confianca: 0.85,
                    timestamp: new Date().toISOString()
                },
                {
                    fase: 4,
                    fonte: 'arquitetura',
                    categoria: 'stack',
                    valor: 'Frontend: React',
                    confianca: 0.95,
                    timestamp: new Date().toISOString()
                },
                {
                    fase: 4,
                    fonte: 'arquitetura',
                    categoria: 'stack',
                    valor: 'Backend: Node.js',
                    confianca: 0.95,
                    timestamp: new Date().toISOString()
                },
                {
                    fase: 4,
                    fonte: 'arquitetura',
                    categoria: 'stack',
                    valor: 'Database: PostgreSQL',
                    confianca: 0.9,
                    timestamp: new Date().toISOString()
                }
            ];

            const resultado = service.recalcular(sinais);

            expect(resultado.nivel).toBe('complexo');
            expect(resultado.confianca).toBeGreaterThan(70);
        });
    });

    describe('verificarExpansao', () => {
        it('deve detectar expansão de simples para médio', () => {
            const resultado = service.verificarExpansao('simples', 'medio', 2);

            expect(resultado.expandir).toBe(true);
            expect(resultado.de).toBe('simples');
            expect(resultado.para).toBe('medio');
            expect(resultado.fasesAdicionadas).toBe(6); // 13 - 7 = 6
        });

        it('deve detectar expansão de médio para complexo', () => {
            const resultado = service.verificarExpansao('medio', 'complexo', 5);

            expect(resultado.expandir).toBe(true);
            expect(resultado.de).toBe('medio');
            expect(resultado.para).toBe('complexo');
            expect(resultado.fasesAdicionadas).toBe(4); // 17 - 13 = 4
        });

        it('não deve expandir se nível não mudou', () => {
            const resultado = service.verificarExpansao('medio', 'medio', 3);

            expect(resultado.expandir).toBe(false);
            expect(resultado.fasesAdicionadas).toBe(0);
        });

        it('não deve expandir se nível diminuiu (proteção)', () => {
            const resultado = service.verificarExpansao('complexo', 'simples', 10);

            expect(resultado.expandir).toBe(false);
            expect(resultado.fasesAdicionadas).toBe(0);
        });
    });
});
