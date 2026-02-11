/**
 * ClassificacaoProgressivaService v6.0
 * 
 * Serviço de classificação progressiva que acumula sinais ao longo das fases
 * e refina a classificação continuamente, em vez de decidir tudo no PRD.
 * 
 * Features:
 * - Acumula sinais de múltiplas fases (Produto, Requisitos, Arquitetura)
 * - Recalcula classificação com todos os sinais acumulados
 * - Detecta necessidade de expansão do fluxo (simples → médio → complexo)
 * - Nunca reduz complexidade (proteção contra regressão)
 */

import type {
    NivelComplexidade,
    SinalClassificacao,
    ClassificacaoProgressiva,
    Fase
} from "../types/index.js";

/**
 * Serviço principal de classificação progressiva
 */
export class ClassificacaoProgressivaService {
    /**
     * Registra sinais extraídos do entregável de cada fase
     */
    registrarSinais(
        entregavel: string,
        fase: Fase,
        sinaisExistentes: SinalClassificacao[]
    ): SinalClassificacao[] {
        const novosSinais: SinalClassificacao[] = [];
        const timestamp = new Date().toISOString();

        // Extrair sinais específicos por tipo de fase
        if (fase.numero === 1 || fase.nome.toLowerCase().includes("produto")) {
            novosSinais.push(...this.extrairSinaisProduto(entregavel, fase.numero, timestamp));
        } else if (fase.nome.toLowerCase().includes("requisito")) {
            novosSinais.push(...this.extrairSinaisRequisitos(entregavel, fase.numero, timestamp));
        } else if (fase.nome.toLowerCase().includes("arquitetura")) {
            novosSinais.push(...this.extrairSinaisArquitetura(entregavel, fase.numero, timestamp));
        } else if (fase.nome.toLowerCase().includes("ux") || fase.nome.toLowerCase().includes("design")) {
            novosSinais.push(...this.extrairSinaisUX(entregavel, fase.numero, timestamp));
        } else {
            // Extrator genérico para outras fases
            novosSinais.push(...this.extrairSinaisGenerico(entregavel, fase, timestamp));
        }

        // Combinar com sinais existentes (deduplicar por categoria+valor)
        const sinaisCombinados = [...sinaisExistentes];
        for (const novoSinal of novosSinais) {
            const jaExiste = sinaisExistentes.some(
                s => s.categoria === novoSinal.categoria && s.valor === novoSinal.valor
            );
            if (!jaExiste) {
                sinaisCombinados.push(novoSinal);
            }
        }

        return sinaisCombinados;
    }

    /**
     * Recalcula classificação com todos os sinais acumulados
     */
    recalcular(sinais: SinalClassificacao[]): {
        nivel: NivelComplexidade;
        confianca: number;
        criterios: string[]
    } {
        let pontos = 0;
        const criterios: string[] = [];
        let confiancaTotal = 0;

        // Agrupar sinais por categoria
        const sinaisPorCategoria = this.agruparPorCategoria(sinais);

        // Domínio (peso 1.0)
        const sinaisDominio = sinaisPorCategoria.get("dominio") || [];
        if (sinaisDominio.length > 0) {
            const melhorDominio = this.melhorSinal(sinaisDominio);
            criterios.push(`Domínio: ${melhorDominio.valor}`);
            confiancaTotal += melhorDominio.confianca * 100;
        }

        // Stack (peso 1.5 - mais importante)
        const sinaisStack = sinaisPorCategoria.get("stack") || [];
        if (sinaisStack.length > 0) {
            pontos += sinaisStack.length * 2;
            criterios.push(`Stack definida (${sinaisStack.length} componentes)`);
            const confiancaMedia = sinaisStack.reduce((acc, s) => acc + s.confianca, 0) / sinaisStack.length;
            confiancaTotal += confiancaMedia * 100 * 1.5;
        }

        // Integrações (peso 2.0 - muito importante)
        const sinaisIntegracao = sinaisPorCategoria.get("integracao") || [];
        if (sinaisIntegracao.length >= 3) {
            pontos += 5;
            criterios.push(`Múltiplas integrações (${sinaisIntegracao.length})`);
            confiancaTotal += 85 * 2.0;
        } else if (sinaisIntegracao.length > 0) {
            pontos += sinaisIntegracao.length;
            criterios.push(`Integrações: ${sinaisIntegracao.map(s => s.valor).join(", ")}`);
            confiancaTotal += 70;
        }

        // Segurança/Compliance (peso 2.5 - crítico)
        const sinaisSeguranca = sinaisPorCategoria.get("seguranca") || [];
        if (sinaisSeguranca.length > 0) {
            pontos += sinaisSeguranca.length * 3;
            criterios.push(`Requisitos de segurança: ${sinaisSeguranca.map(s => s.valor).join(", ")}`);
            confiancaTotal += 90 * 2.5;
        }

        // Volume (peso 1.8)
        const sinaisVolume = sinaisPorCategoria.get("volume") || [];
        if (sinaisVolume.length > 0) {
            const melhorVolume = this.melhorSinal(sinaisVolume);
            if (melhorVolume.valor.includes("Alto") || melhorVolume.valor.includes("10k+")) {
                pontos += 4;
                criterios.push(`Alto volume: ${melhorVolume.valor}`);
                confiancaTotal += 80 * 1.8;
            } else {
                pontos += 1;
            }
        }

        // Equipe (peso 0.8 - menos importante)
        const sinaisEquipe = sinaisPorCategoria.get("equipe") || [];
        if (sinaisEquipe.length > 0) {
            const melhorEquipe = this.melhorSinal(sinaisEquipe);
            criterios.push(`Equipe: ${melhorEquipe.valor}`);
            confiancaTotal += melhorEquipe.confianca * 100 * 0.8;
        }

        // Determinar nível baseado em pontos
        let nivel: NivelComplexidade;
        if (pontos <= 8) {
            nivel = "simples";
        } else if (pontos <= 18) {
            nivel = "medio";
        } else {
            nivel = "complexo";
        }

        // Calcular confiança geral (normalizada)
        const pesoTotal = 1.0 + 1.5 + 2.0 + 2.5 + 1.8 + 0.8; // soma dos pesos
        const confianca = Math.min(Math.round(confiancaTotal / pesoTotal), 100);

        return { nivel, confianca, criterios };
    }

    /**
     * Verifica se o nível precisa mudar (expansão)
     */
    verificarExpansao(
        nivelAtual: NivelComplexidade,
        nivelCalculado: NivelComplexidade,
        faseAtual: number
    ): {
        expandir: boolean;
        de: NivelComplexidade;
        para: NivelComplexidade;
        fasesAdicionadas: number;
    } {
        const ordem: Record<NivelComplexidade, number> = {
            "simples": 1,
            "medio": 2,
            "complexo": 3
        };

        const expandir = ordem[nivelCalculado] > ordem[nivelAtual];

        let fasesAdicionadas = 0;
        if (expandir) {
            // Simples: 7 fases, Médio: 13 fases, Complexo: 17 fases
            const fasesPorNivel: Record<NivelComplexidade, number> = {
                "simples": 7,
                "medio": 13,
                "complexo": 17
            };
            fasesAdicionadas = fasesPorNivel[nivelCalculado] - fasesPorNivel[nivelAtual];
        }

        return {
            expandir,
            de: nivelAtual,
            para: nivelCalculado,
            fasesAdicionadas
        };
    }

    /**
     * Extrai sinais do PRD (Fase 1: Produto)
     */
    private extrairSinaisProduto(entregavel: string, fase: number, timestamp: string): SinalClassificacao[] {
        const sinais: SinalClassificacao[] = [];

        // Domínio
        const dominioPatterns: Array<{ pattern: RegExp; nome: string }> = [
            { pattern: /e-?commerce|loja|venda|produto|pedido|carrinho/i, nome: "E-commerce" },
            { pattern: /saas|assinatura|subscription|mensalidade/i, nome: "SaaS" },
            { pattern: /marketplace|multi-?vendor/i, nome: "Marketplace" },
            { pattern: /dashboard|relatório|bi|analytics/i, nome: "Dashboard/BI" },
            { pattern: /educação|curso|aula|escola|e-?learning/i, nome: "EdTech" },
            { pattern: /saúde|médico|clínica|hospital|paciente/i, nome: "HealthTech" },
            { pattern: /financeiro|banco|fintech|pagamento/i, nome: "FinTech" },
            { pattern: /social|rede|comunidade|chat|mensagem/i, nome: "Social/Comunidade" },
        ];

        for (const { pattern, nome } of dominioPatterns) {
            if (pattern.test(entregavel)) {
                sinais.push({
                    fase,
                    fonte: "prd",
                    categoria: "dominio",
                    valor: nome,
                    confianca: 0.75,
                    timestamp
                });
                break; // apenas um domínio
            }
        }

        // Escopo funcional (número de funcionalidades mencionadas)
        const funcionalidades = (entregavel.match(/funcionalidade|feature|capacidade/gi) || []).length;
        if (funcionalidades > 15) {
            sinais.push({
                fase,
                fonte: "prd",
                categoria: "escopo",
                valor: "Alto (15+ funcionalidades)",
                confianca: 0.7,
                timestamp
            });
        } else if (funcionalidades > 8) {
            sinais.push({
                fase,
                fonte: "prd",
                categoria: "escopo",
                valor: "Médio (8-15 funcionalidades)",
                confianca: 0.7,
                timestamp
            });
        } else {
            sinais.push({
                fase,
                fonte: "prd",
                categoria: "escopo",
                valor: "Baixo (<8 funcionalidades)",
                confianca: 0.7,
                timestamp
            });
        }

        // Timeline
        const cronogramaMatch = entregavel.match(/(\d+)\s*(meses?|semanas?)/i);
        if (cronogramaMatch) {
            const tempo = parseInt(cronogramaMatch[1]);
            const unidade = cronogramaMatch[2].toLowerCase();
            const tempoEmMeses = unidade.startsWith("semana") ? tempo / 4 : tempo;

            sinais.push({
                fase,
                fonte: "prd",
                categoria: "timeline",
                valor: tempoEmMeses > 6 ? "Longo (>6 meses)" : tempoEmMeses > 3 ? "Médio (3-6 meses)" : "Curto (<3 meses)",
                confianca: 0.9,
                timestamp
            });
        }

        return sinais;
    }

    /**
     * Extrai sinais do documento de Requisitos (Fase 2)
     */
    private extrairSinaisRequisitos(entregavel: string, fase: number, timestamp: string): SinalClassificacao[] {
        const sinais: SinalClassificacao[] = [];

        // Compliance/Segurança
        const compliancePatterns: Array<{ pattern: RegExp; nome: string }> = [
            { pattern: /lgpd|gdpr|lei\s*de\s*dados/i, nome: "LGPD/GDPR" },
            { pattern: /pci-?dss|cartão|crédito/i, nome: "PCI-DSS" },
            { pattern: /hipaa|saúde|médico/i, nome: "HIPAA" },
            { pattern: /sox|sarbanes/i, nome: "SOX" },
        ];

        for (const { pattern, nome } of compliancePatterns) {
            if (pattern.test(entregavel)) {
                sinais.push({
                    fase,
                    fonte: "requisitos",
                    categoria: "seguranca",
                    valor: nome,
                    confianca: 0.9,
                    timestamp
                });
            }
        }

        // Autenticação/Autorização
        if (/autenticação|autorização|jwt|oauth|sso|2fa|mfa/i.test(entregavel)) {
            sinais.push({
                fase,
                fonte: "requisitos",
                categoria: "seguranca",
                valor: "Autenticação avançada",
                confianca: 0.85,
                timestamp
            });
        }

        // Performance/NFRs
        if (/performance|latência|throughput|sla|uptime/i.test(entregavel)) {
            sinais.push({
                fase,
                fonte: "requisitos",
                categoria: "nfr",
                valor: "Requisitos de performance",
                confianca: 0.8,
                timestamp
            });
        }

        // Escalabilidade
        if (/escala|escalabilidade|milhares|milhões|concorrência/i.test(entregavel)) {
            sinais.push({
                fase,
                fonte: "requisitos",
                categoria: "volume",
                valor: "Alto volume esperado",
                confianca: 0.75,
                timestamp
            });
        }

        return sinais;
    }

    /**
     * Extrai sinais do documento de Arquitetura (Fase 4+)
     */
    private extrairSinaisArquitetura(entregavel: string, fase: number, timestamp: string): SinalClassificacao[] {
        const sinais: SinalClassificacao[] = [];

        // Stack - Frontend
        const frontendPatterns: Array<{ pattern: RegExp; nome: string }> = [
            { pattern: /react|next\.?js/i, nome: "React/Next.js" },
            { pattern: /vue|nuxt\.?js/i, nome: "Vue/Nuxt.js" },
            { pattern: /angular/i, nome: "Angular" },
            { pattern: /flutter|react native/i, nome: "Mobile (Flutter/RN)" },
        ];

        for (const { pattern, nome } of frontendPatterns) {
            if (pattern.test(entregavel)) {
                sinais.push({
                    fase,
                    fonte: "arquitetura",
                    categoria: "stack",
                    valor: `Frontend: ${nome}`,
                    confianca: 0.95,
                    timestamp
                });
                break;
            }
        }

        // Stack - Backend
        const backendPatterns: Array<{ pattern: RegExp; nome: string }> = [
            { pattern: /node\.?js|express|nestjs/i, nome: "Node.js" },
            { pattern: /python|django|fastapi|flask/i, nome: "Python" },
            { pattern: /java|spring/i, nome: "Java/Spring" },
            { pattern: /go|golang/i, nome: "Go" },
            { pattern: /\.net|csharp|c#/i, nome: ".NET/C#" },
        ];

        for (const { pattern, nome } of backendPatterns) {
            if (pattern.test(entregavel)) {
                sinais.push({
                    fase,
                    fonte: "arquitetura",
                    categoria: "stack",
                    valor: `Backend: ${nome}`,
                    confianca: 0.95,
                    timestamp
                });
                break;
            }
        }

        // Stack - Database
        const dbPatterns: Array<{ pattern: RegExp; nome: string }> = [
            { pattern: /postgresql|postgres/i, nome: "PostgreSQL" },
            { pattern: /mongodb|mongo/i, nome: "MongoDB" },
            { pattern: /mysql/i, nome: "MySQL" },
            { pattern: /firebase/i, nome: "Firebase" },
            { pattern: /supabase/i, nome: "Supabase" },
        ];

        for (const { pattern, nome } of dbPatterns) {
            if (pattern.test(entregavel)) {
                sinais.push({
                    fase,
                    fonte: "arquitetura",
                    categoria: "stack",
                    valor: `Database: ${nome}`,
                    confianca: 0.95,
                    timestamp
                });
                break;
            }
        }

        // Integrações
        const integracaoPatterns: Array<{ pattern: RegExp; nome: string }> = [
            { pattern: /stripe|mercadopago|paypal/i, nome: "Gateway de pagamento" },
            { pattern: /auth0|firebase auth|oauth/i, nome: "Autenticação social" },
            { pattern: /sendgrid|mailchimp|email/i, nome: "Email/SMTP" },
            { pattern: /twilio|sms|whatsapp/i, nome: "SMS/WhatsApp" },
            { pattern: /s3|cloudinary|storage/i, nome: "Armazenamento" },
            { pattern: /google maps|mapbox/i, nome: "Maps" },
        ];

        for (const { pattern, nome } of integracaoPatterns) {
            if (pattern.test(entregavel)) {
                sinais.push({
                    fase,
                    fonte: "arquitetura",
                    categoria: "integracao",
                    valor: nome,
                    confianca: 0.9,
                    timestamp
                });
            }
        }

        // Microserviços
        if (/microserviço|microservice|arquitetura\s*distribuída/i.test(entregavel)) {
            sinais.push({
                fase,
                fonte: "arquitetura",
                categoria: "arquitetura",
                valor: "Microserviços",
                confianca: 0.95,
                timestamp
            });
        }

        // Multi-tenant
        if (/multi-tenant|multi-inquilino|organizações/i.test(entregavel)) {
            sinais.push({
                fase,
                fonte: "arquitetura",
                categoria: "arquitetura",
                valor: "Multi-tenant",
                confianca: 0.9,
                timestamp
            });
        }

        return sinais;
    }

    /**
     * Extrai sinais do documento de UX/Design (Fase 3)
     */
    private extrairSinaisUX(entregavel: string, fase: number, timestamp: string): SinalClassificacao[] {
        const sinais: SinalClassificacao[] = [];

        // Plataformas
        const plataformas: string[] = [];
        if (/web|navegador|browser/i.test(entregavel)) plataformas.push("Web");
        if (/mobile|ios|android|app/i.test(entregavel)) plataformas.push("Mobile");
        if (/desktop|electron/i.test(entregavel)) plataformas.push("Desktop");

        if (plataformas.length > 1) {
            sinais.push({
                fase,
                fonte: "ux",
                categoria: "plataforma",
                valor: `Multi-plataforma: ${plataformas.join(", ")}`,
                confianca: 0.85,
                timestamp
            });
        } else if (plataformas.length === 1) {
            sinais.push({
                fase,
                fonte: "ux",
                categoria: "plataforma",
                valor: plataformas[0],
                confianca: 0.9,
                timestamp
            });
        }

        // Complexidade visual
        const telas = (entregavel.match(/tela|página|view|screen/gi) || []).length;
        if (telas > 20) {
            sinais.push({
                fase,
                fonte: "ux",
                categoria: "complexidade_ui",
                valor: "Alta (20+ telas)",
                confianca: 0.8,
                timestamp
            });
        } else if (telas > 10) {
            sinais.push({
                fase,
                fonte: "ux",
                categoria: "complexidade_ui",
                valor: "Média (10-20 telas)",
                confianca: 0.8,
                timestamp
            });
        }

        return sinais;
    }

    /**
     * Extrator genérico para outras fases
     */
    private extrairSinaisGenerico(entregavel: string, fase: Fase, timestamp: string): SinalClassificacao[] {
        const sinais: SinalClassificacao[] = [];

        // Apenas registrar que a fase foi completada
        sinais.push({
            fase: fase.numero,
            fonte: fase.nome.toLowerCase(),
            categoria: "fase_completa",
            valor: fase.nome,
            confianca: 1.0,
            timestamp
        });

        return sinais;
    }

    /**
     * Agrupa sinais por categoria
     */
    private agruparPorCategoria(sinais: SinalClassificacao[]): Map<string, SinalClassificacao[]> {
        const mapa = new Map<string, SinalClassificacao[]>();
        for (const sinal of sinais) {
            if (!mapa.has(sinal.categoria)) {
                mapa.set(sinal.categoria, []);
            }
            mapa.get(sinal.categoria)!.push(sinal);
        }
        return mapa;
    }

    /**
     * Retorna o sinal com maior confiança de um array
     */
    private melhorSinal(sinais: SinalClassificacao[]): SinalClassificacao {
        return sinais.reduce((melhor, atual) =>
            atual.confianca > melhor.confianca ? atual : melhor
        );
    }
}

// Singleton export
export const classificacaoProgressiva = new ClassificacaoProgressivaService();
