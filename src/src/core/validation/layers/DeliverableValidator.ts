import type { LayerValidationResult, ValidationContext, ValidationIssue } from '../types.js';

/**
 * DeliverableValidator — Validador de Entregáveis de Fase (Camada Semântica de Documentos)
 *
 * v6.1: Substitui as camadas de validação de código TypeScript para entregáveis
 * que são documentos Markdown (PRD, Requisitos, UX Design, Arquitetura, etc.).
 *
 * Valida:
 * 1. Presença de seções obrigatórias por fase
 * 2. Completude do gate_checklist da fase
 * 3. Tamanho mínimo de conteúdo por seção
 * 4. Qualidade semântica (não apenas presença)
 */

// Fases cujo entregável principal é código (não Markdown)
const FASES_DE_CODIGO = new Set([
    'Frontend',
    'Backend',
]);

// Padrões que indicam que o conteúdo é código (não Markdown)
const PADROES_CODIGO = [
    /^import\s+/m,
    /^export\s+(default\s+)?(function|class|const|interface|type)/m,
    /^(async\s+)?function\s+\w+/m,
    /^class\s+\w+/m,
    /=>\s*\{/,
    /^\s*(const|let|var)\s+\w+\s*=/m,
];

/**
 * Detecta se o conteúdo é código (TypeScript/JavaScript) ao invés de Markdown
 */
function isCode(content: string): boolean {
    return PADROES_CODIGO.some(pattern => pattern.test(content));
}


const SECOES_POR_FASE: Record<string, string[]> = {
    'Produto': [
        'problema', 'objetivo', 'persona', 'mvp', 'funcionalidade',
    ],
    'Requisitos': [
        'requisito', 'rf-', 'rnf-', 'critério', 'aceite',
    ],
    'UX Design': [
        'jornada', 'wireframe', 'fluxo', 'navegação', 'usuário',
    ],
    'Prototipagem': [
        'protótipo', 'stitch', 'componente', 'tela',
    ],
    'Modelo de Domínio': [
        'entidade', 'relacionamento', 'regra', 'domínio', 'agregado',
    ],
    'Banco de Dados': [
        'tabela', 'coluna', 'índice', 'migração', 'schema',
    ],
    'Arquitetura': [
        'stack', 'componente', 'diagrama', 'decisão', 'adr',
    ],
    'Arquitetura Avançada': [
        'bounded context', 'microserviço', 'evento', 'cqrs', 'domínio',
    ],
    'Segurança': [
        'owasp', 'autenticação', 'autorização', 'vulnerabilidade', 'dado sensível',
    ],
    'Performance': [
        'caching', 'métrica', 'load', 'escalabilidade', 'latência',
    ],
    'Observabilidade': [
        'log', 'métrica', 'trace', 'dashboard', 'alerta',
    ],
    'Testes': [
        'teste', 'estratégia', 'caso', 'cobertura', 'ferramenta',
    ],
    'Backlog': [
        'épico', 'história', 'sprint', 'prioridade', 'definition of done',
    ],
    'Contrato API': [
        'endpoint', 'openapi', 'schema', 'response', 'request',
    ],
    'Frontend': [
        'componente', 'interface', 'estado', 'rota', 'mock',
    ],
    'Backend': [
        'api', 'serviço', 'repositório', 'banco', 'teste',
    ],
    'Integração': [
        'deploy', 'pipeline', 'ci', 'cd', 'integração',
    ],
    'Deploy Final': [
        'produção', 'monitoramento', 'health', 'rollback', 'release',
    ],
};

// Tamanho mínimo de conteúdo por fase (em caracteres)
const TAMANHO_MINIMO_POR_FASE: Record<string, number> = {
    'Produto': 800,
    'Requisitos': 600,
    'UX Design': 500,
    'Prototipagem': 300,
    'Modelo de Domínio': 400,
    'Banco de Dados': 400,
    'Arquitetura': 600,
    'Arquitetura Avançada': 700,
    'Segurança': 400,
    'Performance': 400,
    'Observabilidade': 400,
    'Testes': 400,
    'Backlog': 600,
    'Contrato API': 500,
    'Frontend': 300,
    'Backend': 300,
    'Integração': 300,
    'Deploy Final': 300,
};

export interface DeliverableContext extends ValidationContext {
    /** Nome da fase atual (ex: "Produto", "Requisitos") */
    nomeFase: string;
    /** Gate checklist da fase (itens que devem ser evidenciados) */
    gateChecklist?: string[];
}

export class DeliverableValidator {
    async validate(
        content: string,
        context?: DeliverableContext
    ): Promise<LayerValidationResult> {
        const issues: ValidationIssue[] = [];
        const suggestions: string[] = [];
        const nomeFase = context?.nomeFase || 'Desconhecida';
        const contentLower = content.toLowerCase();

        // 1. Verificar tamanho mínimo
        const tamanhoMinimo = TAMANHO_MINIMO_POR_FASE[nomeFase] ?? 300;
        if (content.trim().length < tamanhoMinimo) {
            issues.push({
                type: 'content-too-short',
                severity: 'high',
                message: `Entregável muito curto: ${content.trim().length} caracteres (mínimo: ${tamanhoMinimo})`,
                suggestion: `Expanda o conteúdo da fase "${nomeFase}" com mais detalhes`
            });
        }

        // 2. Verificar presença de seções obrigatórias por fase
        const secoesObrigatorias = SECOES_POR_FASE[nomeFase] ?? [];
        const secoesFaltando: string[] = [];

        for (const secao of secoesObrigatorias) {
            if (!contentLower.includes(secao.toLowerCase())) {
                secoesFaltando.push(secao);
            }
        }

        if (secoesFaltando.length > 0) {
            const proporcaoFaltando = secoesFaltando.length / secoesObrigatorias.length;
            const severity: ValidationIssue['severity'] =
                proporcaoFaltando > 0.6 ? 'critical' :
                proporcaoFaltando > 0.3 ? 'high' : 'medium';

            issues.push({
                type: 'missing-sections',
                severity,
                message: `Seções/termos obrigatórios ausentes: ${secoesFaltando.join(', ')}`,
                suggestion: `Inclua conteúdo sobre: ${secoesFaltando.join(', ')}`
            });
        }

        // 3. Verificar gate_checklist da fase
        const gateChecklist = context?.gateChecklist ?? [];
        const itensFaltandoGate: string[] = [];

        for (const item of gateChecklist) {
            // Verificar se o item do checklist é evidenciado no conteúdo
            // Usa palavras-chave do item para busca flexível
            const palavrasChave = item.toLowerCase()
                .replace(/[^a-záàâãéèêíïóôõöúüçñ\s]/gi, '')
                .split(' ')
                .filter(p => p.length > 3);

            const itemEvidenciado = palavrasChave.some(palavra =>
                contentLower.includes(palavra)
            );

            if (!itemEvidenciado) {
                itensFaltandoGate.push(item);
            }
        }

        if (itensFaltandoGate.length > 0) {
            const proporcaoFaltando = itensFaltandoGate.length / gateChecklist.length;
            const severity: ValidationIssue['severity'] =
                proporcaoFaltando > 0.5 ? 'high' : 'medium';

            issues.push({
                type: 'gate-checklist-incomplete',
                severity,
                message: `Gate checklist incompleto — ${itensFaltandoGate.length}/${gateChecklist.length} itens não evidenciados`,
                suggestion: `Adicione evidências para: ${itensFaltandoGate.slice(0, 3).join('; ')}${itensFaltandoGate.length > 3 ? '...' : ''}`
            });
        }

        // 4. Verificar qualidade do conteúdo
        // v6.2 S3.2: Para fases de código (Frontend/Backend), não aplicar verificações de Markdown
        const ehFaseDeCodigo = FASES_DE_CODIGO.has(nomeFase);
        const ehCodigo = ehFaseDeCodigo && isCode(content);

        if (ehCodigo) {
            // Para código: verificar apenas se não é um stub vazio
            const linhasComCodigo = content.split('\n').filter(l =>
                l.trim().length > 0 && !l.trim().startsWith('//')
            );
            if (linhasComCodigo.length < 5) {
                issues.push({
                    type: 'code-too-sparse',
                    severity: 'medium',
                    message: 'Código com muito poucas linhas — pode ser apenas um stub',
                    suggestion: 'Implemente a lógica completa do componente/serviço'
                });
            }
        } else {
            // Para Markdown: verificar qualidade do documento
            const markdownIssues = this.checkMarkdownQuality(content);
            issues.push(...markdownIssues);
        }

        // 5. Calcular score
        const score = this.calculateScore(issues, secoesObrigatorias.length, gateChecklist.length);
        const passed = score >= 70;

        // Gerar sugestões consolidadas
        if (!passed) {
            if (secoesFaltando.length > 0) {
                suggestions.push(`📝 Adicione seções sobre: ${secoesFaltando.slice(0, 3).join(', ')}`);
            }
            if (itensFaltandoGate.length > 0) {
                suggestions.push(`✅ Evidencie no texto: ${itensFaltandoGate.slice(0, 2).join('; ')}`);
            }
            if (content.trim().length < tamanhoMinimo) {
                suggestions.push(`📏 Expanda o conteúdo (atual: ${content.trim().length} chars, mínimo: ${tamanhoMinimo})`);
            }
        }

        return {
            layer: `Entregável (${nomeFase})`,
            score,
            passed,
            issues,
            suggestions,
            timestamp: new Date().toISOString()
        };
    }

    private checkMarkdownQuality(content: string): ValidationIssue[] {
        const issues: ValidationIssue[] = [];

        // Verificar se tem pelo menos um heading
        if (!content.includes('#')) {
            issues.push({
                type: 'no-headings',
                severity: 'medium',
                message: 'Documento sem headings Markdown',
                suggestion: 'Estruture o documento com headings (# Título, ## Seção)'
            });
        }

        // Verificar se é apenas uma lista de bullets sem conteúdo
        const linhas = content.split('\n').filter(l => l.trim().length > 0);
        const linhasBullet = linhas.filter(l => l.trim().startsWith('-') || l.trim().startsWith('*'));
        if (linhas.length > 5 && linhasBullet.length / linhas.length > 0.8) {
            issues.push({
                type: 'only-bullets',
                severity: 'low',
                message: 'Documento composto quase inteiramente de bullets sem texto explicativo',
                suggestion: 'Adicione parágrafos explicativos além dos bullets'
            });
        }

        // Verificar conteúdo placeholder
        const placeholders = ['lorem ipsum', 'todo:', 'fixme:', 'placeholder', '[inserir', '[adicionar'];
        for (const placeholder of placeholders) {
            if (content.toLowerCase().includes(placeholder)) {
                issues.push({
                    type: 'placeholder-content',
                    severity: 'high',
                    message: `Conteúdo placeholder detectado: "${placeholder}"`,
                    suggestion: 'Substitua placeholders por conteúdo real'
                });
            }
        }

        return issues;
    }

    private calculateScore(
        issues: ValidationIssue[],
        totalSecoes: number,
        totalGate: number
    ): number {
        if (issues.length === 0) return 100;

        let penalty = 0;
        for (const issue of issues) {
            switch (issue.severity) {
                case 'critical': penalty += 30; break;
                case 'high':     penalty += 15; break;
                case 'medium':   penalty += 7;  break;
                case 'low':      penalty += 3;  break;
            }
        }

        // Bônus por ter muitas seções e gate items cobertos
        const bonus = Math.min(10, (totalSecoes + totalGate) * 0.5);

        return Math.max(0, Math.min(100, 100 - penalty + bonus));
    }
}
