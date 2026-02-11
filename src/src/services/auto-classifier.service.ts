/**
 * AutoClassifierService v1.0
 * 
 * @deprecated v6.0 - Este serviço foi substituído por ClassificacaoProgressivaService
 * que acumula sinais ao longo de múltiplas fases em vez de classificar apenas no PRD.
 * 
 * Mantido para compatibilidade e referência, mas não é mais usado no fluxo principal.
 * 
 * Serviço de classificação automática de projetos baseado em análise
 * multi-especialista do PRD.
 * 
 * Features:
 * - Análise por múltiplos especialistas virtuais (produto, arquitetura, volume)
 * - Inferência automática de stack, integrações, domínio, volume
 * - Cálculo de confianca por critério
 * - Cache de classificações para evitar reprocessamento
 */

import type { NivelComplexidade, ClassificacaoResultado } from "../types/index.js";

export interface ClassificacaoAuto extends ClassificacaoResultado {
  /** Nível de confianca geral (0-100) */
  confianca: number;
  /** Critérios com alta confianca (>85%) */
  criteriosConfiantes: string[];
  /** Critérios com baixa confianca (<85%) */
  criteriosDuvidosos: string[];
  /** Especialistas que contribuíram para a classificação */
  inferidoPor: string[];
  /** Dados inferidos detalhados */
  inferencias: {
    stack?: {
      frontend?: string;
      backend?: string;
      database?: string;
      confianca: number;
    };
    integracoes?: {
      lista: string[];
      confianca: number;
    };
    volume?: {
      usuarios: string;
      dados: string;
      confianca: number;
    };
    domino?: {
      tipo: string;
      confianca: number;
    };
    seguranca?: {
      requisitos: string[];
      confianca: number;
    };
    equipe?: {
      tamanhoSugerido: string;
      confianca: number;
    };
  };
}

interface EspecialistaAnalise {
  nome: string;
  peso: number;
  analisar(prd: string): { pontos: number; confianca: number; criterios: string[] };
}

/**
 * Serviço principal de classificação automática
 */
export class AutoClassifierService {
  private especialistas: EspecialistaAnalise[];
  private cache: Map<string, ClassificacaoAuto> = new Map();

  constructor() {
    this.especialistas = [
      new EspecialistaProduto(),
      new EspecialistaArquitetura(),
      new EspecialistaVolume(),
    ];
  }

  /**
   * Classifica um PRD automaticamente usando análise multi-especialista
   */
  async classificar(prd: string, prdHash?: string): Promise<ClassificacaoAuto> {
    // Verificar cache
    const hash = prdHash || this.computeHash(prd);
    if (this.cache.has(hash)) {
      return this.cache.get(hash)!;
    }

    // Análise por cada especialista
    const analises = this.especialistas.map(e => ({
      nome: e.nome,
      ...e.analisar(prd),
    }));

    // Agregar pontuação
    let pontosTotais = 0;
    const todosCriterios: string[] = [];
    const inferidoPor: string[] = [];
    let confiancaTotal = 0;
    const criteriosConfiantes: string[] = [];
    const criteriosDuvidosos: string[] = [];

    for (const analise of analises) {
      pontosTotais += analise.pontos * (this.especialistas.find(e => e.nome === analise.nome)?.peso || 1);
      todosCriterios.push(...analise.criterios);
      inferidoPor.push(analise.nome);
      confiancaTotal += analise.confianca;

      // Separar critérios por confianca
      for (const criterio of analise.criterios) {
        if (analise.confianca >= 85) {
          criteriosConfiantes.push(`${analise.nome}: ${criterio}`);
        } else {
          criteriosDuvidosos.push(`${analise.nome}: ${criterio}`);
        }
      }
    }

    // Normalizar pontuação
    pontosTotais = Math.round(pontosTotais / this.especialistas.length);
    const confiancaMedia = Math.round(confiancaTotal / analises.length);

    // Determinar nível
    let nivel: NivelComplexidade;
    if (pontosTotais <= 10) {
      nivel = "simples";
    } else if (pontosTotais <= 20) {
      nivel = "medio";
    } else {
      nivel = "complexo";
    }

    // Extrair inferências detalhadas
    const inferencias = this.extrairInferencias(prd);

    const resultado: ClassificacaoAuto = {
      nivel,
      pontuacao: pontosTotais,
      criterios: [...new Set(todosCriterios)], // deduplicar
      confianca: confiancaMedia,
      criteriosConfiantes,
      criteriosDuvidosos,
      inferidoPor,
      inferencias,
    };

    // Cachear resultado
    this.cache.set(hash, resultado);

    return resultado;
  }

  /**
   * Verifica se a classificação pode ser aplicada automaticamente
   */
  podeAplicarAutomaticamente(classificacao: ClassificacaoAuto): boolean {
    return classificacao.confianca >= 85 && classificacao.criteriosDuvidosos.length === 0;
  }

  /**
   * Gera mensagem de confirmação para o usuário
   */
  gerarMensagemConfirmacao(classificacao: ClassificacaoAuto): string {
    const { nivel, confianca, inferencias, criteriosDuvidosos } = classificacao;

    let mensagem = `## 🔍 Classificação Sugerida: **${nivel.toUpperCase()}**\n\n`;
    mensagem += `**Confiança:** ${confianca}%\n\n`;

    // Mostrar inferências
    mensagem += `### 📊 Detalhes Inferidos:\n\n`;

    if (inferencias.stack) {
      mensagem += `**Stack Sugerida:**\n`;
      if (inferencias.stack.frontend) mensagem += `- Frontend: ${inferencias.stack.frontend}\n`;
      if (inferencias.stack.backend) mensagem += `- Backend: ${inferencias.stack.backend}\n`;
      if (inferencias.stack.database) mensagem += `- Database: ${inferencias.stack.database}\n`;
      mensagem += `\n`;
    }

    if (inferencias.integracoes && inferencias.integracoes.lista.length > 0) {
      mensagem += `**Integrações Detectadas:** ${inferencias.integracoes.lista.join(", ")}\n\n`;
    }

    if (inferencias.volume) {
      mensagem += `**Volume Estimado:**\n`;
      mensagem += `- Usuários: ${inferencias.volume.usuarios}\n`;
      mensagem += `- Dados: ${inferencias.volume.dados}\n\n`;
    }

    if (inferencias.domino) {
      mensagem += `**Domínio:** ${inferencias.domino.tipo}\n\n`;
    }

    // Mostrar critérios duvidosos se houver
    if (criteriosDuvidosos.length > 0) {
      mensagem += `⚠️ **Itens que precisam de confirmação:**\n`;
      for (const criterio of criteriosDuvidosos.slice(0, 3)) {
        mensagem += `- ${criterio}\n`;
      }
      mensagem += `\n`;
    }

    if (this.podeAplicarAutomaticamente(classificacao)) {
      mensagem += `✅ **Esta classificação será aplicada automaticamente.**\n`;
    } else {
      mensagem += `🤔 **Por favor, confirme se os detalhes acima estão corretos.**\n`;
    }

    return mensagem;
  }

  /**
   * Extrai inferências detalhadas do PRD
   */
  private extrairInferencias(prd: string): ClassificacaoAuto["inferencias"] {
    const inferencias: ClassificacaoAuto["inferencias"] = {};

    // Stack
    const stack = this.inferirStack(prd);
    if (stack) {
      inferencias.stack = { ...stack, confianca: 75 };
    }

    // Integrações
    const integracoes = this.inferirIntegracoes(prd);
    if (integracoes.length > 0) {
      inferencias.integracoes = {
        lista: integracoes,
        confianca: Math.min(70 + integracoes.length * 5, 95),
      };
    }

    // Volume
    const volume = this.inferirVolume(prd);
    if (volume) {
      inferencias.volume = { ...volume, confianca: 70 };
    }

    // Domínio
    const domino = this.inferirDomino(prd);
    if (domino) {
      inferencias.domino = { ...domino, confianca: 80 };
    }

    // Segurança
    const seguranca = this.inferirSeguranca(prd);
    if (seguranca.length > 0) {
      inferencias.seguranca = {
        requisitos: seguranca,
        confianca: 85,
      };
    }

    // Equipe
    const equipe = this.inferirEquipe(prd);
    if (equipe) {
      inferencias.equipe = { ...equipe, confianca: 65 };
    }

    return inferencias;
  }

  private inferirStack(prd: string): { frontend?: string; backend?: string; database?: string } | null {
    const stack: { frontend?: string; backend?: string; database?: string } = {};
    let encontrouAlgo = false;

    // Frontend
    const frontendPatterns = [
      { pattern: /react|next\.?js/i, name: "React/Next.js" },
      { pattern: /vue|nuxt\.?js/i, name: "Vue/Nuxt.js" },
      { pattern: /angular/i, name: "Angular" },
      { pattern: /flutter|react native|mobile/i, name: "Mobile (Flutter/React Native)" },
    ];

    for (const { pattern, name } of frontendPatterns) {
      if (pattern.test(prd)) {
        stack.frontend = name;
        encontrouAlgo = true;
        break;
      }
    }

    // Backend
    const backendPatterns = [
      { pattern: /node\.?js|express|nestjs/i, name: "Node.js" },
      { pattern: /python|django|fastapi|flask/i, name: "Python" },
      { pattern: /java|spring/i, name: "Java/Spring" },
      { pattern: /go|golang/i, name: "Go" },
      { pattern: /\.net|csharp|c#/i, name: ".NET/C#" },
    ];

    for (const { pattern, name } of backendPatterns) {
      if (pattern.test(prd)) {
        stack.backend = name;
        encontrouAlgo = true;
        break;
      }
    }

    // Database
    const dbPatterns = [
      { pattern: /postgresql|postgres/i, name: "PostgreSQL" },
      { pattern: /mongodb|mongo/i, name: "MongoDB" },
      { pattern: /mysql/i, name: "MySQL" },
      { pattern: /firebase/i, name: "Firebase" },
      { pattern: /supabase/i, name: "Supabase" },
    ];

    for (const { pattern, name } of dbPatterns) {
      if (pattern.test(prd)) {
        stack.database = name;
        encontrouAlgo = true;
        break;
      }
    }

    return encontrouAlgo ? stack : null;
  }

  private inferirIntegracoes(prd: string): string[] {
    const integracoes: string[] = [];

    const patterns = [
      { pattern: /api|integra|webhook/i, name: "APIs externas" },
      { pattern: /pagamento|stripe|mercadopago|paypal/i, name: "Gateway de pagamento" },
      { pattern: /autenticação|auth0|firebase auth|oauth|sso/i, name: "Autenticação social" },
      { pattern: /email|sendgrid|mailchimp/i, name: "Email/SMTP" },
      { pattern: /sms|whatsapp|telegram/i, name: "Notificações (SMS/WhatsApp)" },
      { pattern: /storage|s3|cloudinary|firebase storage/i, name: "Armazenamento de arquivos" },
      { pattern: /analytics|google analytics|mixpanel/i, name: "Analytics" },
      { pattern: /maps|google maps|mapbox/i, name: "Maps/Geolocalização" },
    ];

    for (const { pattern, name } of patterns) {
      if (pattern.test(prd)) {
        integracoes.push(name);
      }
    }

    return [...new Set(integracoes)]; // deduplicar
  }

  private inferirVolume(prd: string): { usuarios: string; dados: string } | null {
    // Detectar volume de usuários
    const usuarioPatterns = [
      { pattern: /(\d+)\s*(mil|k|milhões?|mi|m)\s*usuários?/i, type: "explicit" },
      { pattern: /escala\s*(grande|enterprise|massiva)/i, type: "large" },
      { pattern: /100\+|milhares|milhões/i, type: "large" },
      { pattern: /pequena escala|poucos usuários|inicial/i, type: "small" },
    ];

    let usuarios = "Não especificado";
    for (const { pattern, type } of usuarioPatterns) {
      if (pattern.test(prd)) {
        usuarios = type === "large" ? "Alto (10k+ usuários)" :
          type === "small" ? "Baixo (< 1k usuários)" : "Médio (1k-10k)";
        break;
      }
    }

    // Detectar volume de dados
    const dadosPatterns = [
      { pattern: /big data|data warehouse|milhões?\s*de\s*registros?/i, type: "large" },
      { pattern: /arquivos?|imagens?|vídeos?|mídia/i, type: "media" },
      { pattern: /transações?|pedidos?|vendas?/i, type: "transactional" },
    ];

    let dados = "Padrão";
    for (const { pattern, type } of dadosPatterns) {
      if (pattern.test(prd)) {
        dados = type === "large" ? "Alto volume (Big Data)" :
          type === "media" ? "Mídia/Arquivos" : "Transacional";
        break;
      }
    }

    return { usuarios, dados };
  }

  private inferirDomino(prd: string): { tipo: string } | null {
    const patterns = [
      { pattern: /e-?commerce|loja|venda|produto|pedido|carrinho/i, type: "E-commerce" },
      { pattern: /saaS|assinatura|subscription|mensalidade/i, type: "SaaS" },
      { pattern: /marketplace|multi-?vendor/i, type: "Marketplace" },
      { pattern: /app|mobile|ios|android/i, type: "Aplicativo Mobile" },
      { pattern: /dashboard|relatório|bi|analytics/i, type: "Dashboard/BI" },
      { pattern: /educação|curso|aula|escola|e-?learning/i, type: "EdTech" },
      { pattern: /saúde|médico|clínica|hospital|paciente/i, type: "HealthTech" },
      { pattern: /financeiro|banco|fintech|pagamento/i, type: "FinTech" },
      { pattern: /social|rede|comunidade|chat|mensagem/i, type: "Social/Comunidade" },
    ];

    for (const { pattern, type } of patterns) {
      if (pattern.test(prd)) {
        return { tipo: type };
      }
    }

    return null;
  }

  private inferirSeguranca(prd: string): string[] {
    const requisitos: string[] = [];

    const patterns = [
      { pattern: /lgpd|gdpr|lei\s*de\s*dados/i, name: "LGPD/GDPR" },
      { pattern: /pci-?dss|cartão|crédito/i, name: "PCI-DSS" },
      { pattern: /hipaa|saúde|médico/i, name: "HIPAA" },
      { pattern: /autenticação|autorização|jwt|oauth/i, name: "Autenticação/Autorização" },
      { pattern: /criptografia|encriptação|ssl|tls/i, name: "Criptografia" },
      { pattern: /senha|password|hash/i, name: "Gestão de senhas" },
      { pattern: /2fa|mfa|autenticação\s*em\s*2\s*fatores/i, name: "2FA/MFA" },
    ];

    for (const { pattern, name } of patterns) {
      if (pattern.test(prd)) {
        requisitos.push(name);
      }
    }

    return [...new Set(requisitos)];
  }

  private inferirEquipe(prd: string): { tamanhoSugerido: string } | null {
    const patterns = [
      { pattern: /(\d+)\s*desenvolvedor/i, type: "explicit" },
      { pattern: /time\s*(grande|grande\s*equipe)/i, type: "large" },
      { pattern: /só|individual|freelancer|único/i, type: "solo" },
      { pattern: /dupla|2\s*pessoas|par/i, type: "small" },
    ];

    for (const { pattern, type } of patterns) {
      if (pattern.test(prd)) {
        const tamanho = type === "explicit" ? "Conforme especificado" :
          type === "large" ? "5+ desenvolvedores" :
            type === "solo" ? "1 desenvolvedor" :
              "2-4 desenvolvedores";
        return { tamanhoSugerido: tamanho };
      }
    }

    return null;
  }

  private computeHash(prd: string): string {
    // Hash simples baseado nos primeiros 1000 caracteres + tamanho
    const sample = prd.slice(0, 1000);
    let hash = 0;
    for (let i = 0; i < sample.length; i++) {
      const char = sample.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `${hash}-${prd.length}`;
  }
}

/**
 * Especialista: Produto
 * Analisa complexidade funcional, domínio de negócio
 */
class EspecialistaProduto implements EspecialistaAnalise {
  nome = "Produto";
  peso = 1.0;

  analisar(prd: string): { pontos: number; confianca: number; criterios: string[] } {
    let pontos = 0;
    const criterios: string[] = [];
    let confianca = 70; // base

    // Complexidade de funcionalidades
    const funcionalidades = (prd.match(/funcionalidade|feature|capacidade/i) || []).length;
    if (funcionalidades > 15) {
      pontos += 4;
      criterios.push("Muitas funcionalidades complexas");
      confianca += 10;
    } else if (funcionalidades > 8) {
      pontos += 2;
      criterios.push("Funcionalidades moderadas");
      confianca += 5;
    } else {
      pontos += 1;
    }

    // Personas
    const personas = (prd.match(/persona|usuário|cliente/i) || []).length;
    if (personas > 5) {
      pontos += 2;
      criterios.push("Múltiplas personas complexas");
    }

    // Fluxos de negócio
    const fluxos = (prd.match(/fluxo|workflow|processo|jornada/i) || []).length;
    if (fluxos > 5) {
      pontos += 3;
      criterios.push("Fluxos de negócio complexos");
      confianca += 5;
    }

    // Regras de negócio
    const regras = (prd.match(/regra|condição|validação|cálculo/i) || []).length;
    if (regras > 10) {
      pontos += 3;
      criterios.push("Muitas regras de negócio");
    }

    return { pontos, confianca: Math.min(confianca, 95), criterios };
  }
}

/**
 * Especialista: Arquitetura
 * Analisa integrações, stack, segurança, escala
 */
class EspecialistaArquitetura implements EspecialistaAnalise {
  nome = "Arquitetura";
  peso = 1.2; // maior peso pois afeta mais a complexidade técnica

  analisar(prd: string): { pontos: number; confianca: number; criterios: string[] } {
    let pontos = 0;
    const criterios: string[] = [];
    let confianca = 70;

    // Integrações
    const integracoes = [
      /api|integração|webhook/i,
      /pagamento|stripe|paypal/i,
      /autenticação|oauth|sso/i,
      /email|sms|notificação/i,
    ];
    let numIntegracoes = 0;
    for (const pattern of integracoes) {
      if (pattern.test(prd)) numIntegracoes++;
    }
    if (numIntegracoes >= 3) {
      pontos += 4;
      criterios.push("Múltiplas integrações externas");
      confianca += 15;
    } else if (numIntegracoes >= 1) {
      pontos += 2;
      criterios.push("Integrações externas presentes");
      confianca += 10;
    }

    // Segurança/compliance
    const seguranca = /lgpd|gdpr|pci|hipaa|compliance|criptografia/i;
    if (seguranca.test(prd)) {
      pontos += 3;
      criterios.push("Requisitos de segurança/compliance");
      confianca += 10;
    }

    // Escala
    const escala = /escala|milhares|milhões|concorrência|performance|latência/i;
    if (escala.test(prd)) {
      pontos += 3;
      criterios.push("Requisitos de escala/performance");
      confianca += 5;
    }

    // Multi-tenant
    const multiTenant = /multi-tenant|multi-inquilino|organizações|empresas/i;
    if (multiTenant.test(prd)) {
      pontos += 2;
      criterios.push("Arquitetura multi-tenant");
    }

    // Tempo/cronograma
    const cronograma = prd.match(/(\d+)\s*(meses?|semanas?)/i);
    if (cronograma) {
      const tempo = parseInt(cronograma[1]);
      const unidade = cronograma[2].toLowerCase();
      const tempoEmMeses = unidade.startsWith("semana") ? tempo / 4 : tempo;

      if (tempoEmMeses > 6) {
        pontos += 3;
        criterios.push("Cronograma longo (>6 meses)");
      } else if (tempoEmMeses > 3) {
        pontos += 2;
        criterios.push("Cronograma moderado");
      }
    }

    return { pontos, confianca: Math.min(confianca, 95), criterios };
  }
}

/**
 * Especialista: Volume
 * Analisa volume de usuários, dados, transações
 */
class EspecialistaVolume implements EspecialistaAnalise {
  nome = "Volume";
  peso = 0.8;

  analisar(prd: string): { pontos: number; confianca: number; criterios: string[] } {
    let pontos = 0;
    const criterios: string[] = [];
    let confianca = 65;

    // Volume de usuários
    const usuariosAlto = /100\+|milhares|milhões|massivo|enterprise/i;
    const usuariosMedio = /\d+\s*usuários|escala\s*média/i;
    if (usuariosAlto.test(prd)) {
      pontos += 3;
      criterios.push("Alto volume de usuários");
      confianca += 15;
    } else if (usuariosMedio.test(prd)) {
      pontos += 1;
      criterios.push("Volume moderado de usuários");
      confianca += 10;
    }

    // Volume de dados
    const dadosAlto = /big\s*data|terabytes?|petabytes?|data\s*warehouse/i;
    const dadosMedio = /muitos\s*dados|relatórios?\s*complexos?/i;
    if (dadosAlto.test(prd)) {
      pontos += 3;
      criterios.push("Alto volume de dados");
      confianca += 10;
    } else if (dadosMedio.test(prd)) {
      pontos += 1;
    }

    // Transações
    const transacoesAlto = /milhares?\s*de\s*transações|transações?\s*por\s*segundo/i;
    if (transacoesAlto.test(prd)) {
      pontos += 2;
      criterios.push("Alto volume de transações");
    }

    // Tempo real
    const tempoReal = /tempo\s*real|real-?time|live|streaming/i;
    if (tempoReal.test(prd)) {
      pontos += 2;
      criterios.push("Requisitos de tempo real");
      confianca += 5;
    }

    return { pontos, confianca: Math.min(confianca, 95), criterios };
  }
}

// Singleton export
export const autoClassifier = new AutoClassifierService();
