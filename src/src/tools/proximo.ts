import { join, resolve } from "path";
import { existsSync, readdirSync } from "fs";
import type { ToolResult, EstadoProjeto } from "../types/index.js";
import { parsearEstado, serializarEstado } from "../state/storage.js";
import { getFase, getFluxo, getFaseComStitch, getFluxoComStitch } from "../flows/types.js";
import { classificarPRD, descreverNivel } from "../flows/classifier.js"; // @deprecated v6.0 - usar ClassificacaoProgressivaService
import { validarGate, formatarResultadoGate, validarGateComTemplate } from "../gates/validator.js";
import { setCurrentDirectory } from "../state/context.js";
import { parsearResumo, serializarResumo, criarResumoInicial, extrairResumoEntregavel } from "../state/memory.js";
import { gerarInstrucaoProximaFase, gerarInstrucaoCorrecao } from "../utils/instructions.js";
import type { EntregavelResumo, ProjectSummary } from "../types/memory.js";
import { logEvent, EventTypes } from "../utils/history.js";
import { getSpecialistPersona } from "../services/specialist.service.js";
import { gerarSystemMd } from "../utils/system-md.js";
import { gerarSecaoPrompts, getSkillParaFase, getSkillPath, getSkillResourcePath } from "../utils/prompt-mapper.js";
import { validarEstrutura } from "../gates/estrutura.js";
import { normalizeProjectPath, resolveProjectPath, joinProjectPath, getServerContentRoot } from "../utils/files.js";
import { formatSkillMessage, detectIDE, getSkillResourcePath as getIDESkillResourcePath } from "../utils/ide-paths.js";
import { inferirContextoBalanceado } from "../utils/inferencia-contextual.js";
import { verificarSkillCarregada } from "../utils/content-injector.js";
import { ContentResolverService } from "../services/content-resolver.service.js";
import { SkillLoaderService } from "../services/skill-loader.service.js";
import { saveFile, saveMultipleFiles, formatSavedFilesConfirmation } from "../utils/persistence.js";
import { classificacaoProgressiva } from "../services/classificacao-progressiva.service.js"; // v6.0
import { getSpecialistQuestions } from "../handlers/specialist-phase-handler.js"; // v7.0
import { resolverPathEntregavel, listarPathsEsperados } from "../utils/entregavel-path.js"; // v5.5.0
import { readFile } from "fs/promises";
import { isPrototypePhase } from "../handlers/prototype-phase-handler.js"; // v9.0

interface ProximoArgs {
    entregavel?: string;  // v5.5.0: Opcional - sistema lê do disco automaticamente
    estado_json: string;         // Estado atual do projeto (obrigatório)
    resumo_json?: string;        // Resumo atual (opcional, cria novo se não informado)
    nome_arquivo?: string;
    diretorio: string;           // Diretório do projeto (obrigatório)
    auto_flow?: boolean;         // Modo fluxo automático: auto-confirma classificação e avança sem bloqueios
}

/**
 * Calcula score de qualidade
 */
function calcularQualityScore(
    estruturaResult: ReturnType<typeof validarEstrutura>,
    gateResult: ReturnType<typeof validarGate>
): number {
    const totalChecklist = gateResult.itens_validados.length + gateResult.itens_pendentes.length;
    const checklistScore = totalChecklist > 0
        ? (gateResult.itens_validados.length / totalChecklist) * 100
        : 100;

    const tamanhoScore = estruturaResult.tamanho_ok ? 100 : 50;

    return Math.round(
        (estruturaResult.score * 0.30) +
        (checklistScore * 0.50) +
        (tamanhoScore * 0.20)
    );
}

/**
 * Tool: proximo
 * Salva entregável e avança para próxima fase (modo stateless)
 * Retorna arquivos para a IA salvar
 */
export async function proximo(args: ProximoArgs): Promise<ToolResult> {
    // Validar parâmetros obrigatórios
    if (!args.estado_json) {
        return {
            content: [{
                type: "text",
                text: `# ❌ Erro: Estado Obrigatório

O parâmetro \`estado_json\` é obrigatório no modo stateless.

**Uso correto:**
1. IA lê \`.maestro/estado.json\` do projeto
2. Passa o conteúdo como parâmetro

\`\`\`
proximo(
    entregavel: "conteúdo do PRD...",
    estado_json: "...",
    diretorio: "C:/projetos/meu-projeto"
)
\`\`\`
`,
            }],
            isError: true,
        };
    }

    if (!args.diretorio) {
        return {
            content: [{
                type: "text",
                text: "❌ **Erro**: Parâmetro `diretorio` é obrigatório.",
            }],
            isError: true,
        };
    }

    // Parsear estado
    const estado = parsearEstado(args.estado_json);
    if (!estado) {
        return {
            content: [{
                type: "text",
                text: "❌ **Erro**: Não foi possível parsear o estado JSON.",
            }],
            isError: true,
        };
    }

    const diretorio = resolveProjectPath(args.diretorio);
    setCurrentDirectory(diretorio);

    // Verifica se há conteúdo local disponível (via npx)
    const avisoContentLocal = ""; // Sem aviso crítico, funciona via npx

    // Obter fase atual para mensagens de erro
    const faseAtualInfo = getFaseComStitch(estado.nivel, estado.fase_atual, estado.usar_stitch);

    // v9.0: Fase de prototipagem — entregável é prototipos.md + verificação de HTML na pasta
    const isProtoPhase = isPrototypePhase(faseAtualInfo?.nome, estado.usar_stitch);

    // v5.5.0: Leitura automática do disco
    let entregavel = args.entregavel;
    let entregavelLidoDoDisco = false;
    let caminhoResolvido: string | null = null;

    // Heurística: se entregável está vazio OU muito curto (< 100 chars), provavelmente é uma descrição
    // Tentamos ler do disco como fallback
    const TAMANHO_MINIMO_CONTEUDO_REAL = 100;

    if (!entregavel || entregavel.trim().length < TAMANHO_MINIMO_CONTEUDO_REAL) {
        if (faseAtualInfo) {
            // v9.0: Para fase de prototipagem, tentar ler prototipos/prototipos.md
            if (isProtoPhase) {
                const protoSummaryPath = join(diretorio, 'prototipos', 'prototipos.md');
                if (existsSync(protoSummaryPath)) {
                    try {
                        entregavel = await readFile(protoSummaryPath, 'utf-8');
                        entregavelLidoDoDisco = true;
                        caminhoResolvido = protoSummaryPath;
                    } catch { /* ignore */ }
                }
            }

            if (!entregavel || entregavel.trim().length < TAMANHO_MINIMO_CONTEUDO_REAL) {
                // Tentar resolver path do entregável
                caminhoResolvido = resolverPathEntregavel(
                    diretorio,
                    estado.fase_atual,
                    faseAtualInfo,
                    estado
                );

                if (caminhoResolvido) {
                    try {
                        entregavel = await readFile(caminhoResolvido, 'utf-8');
                        entregavelLidoDoDisco = true;
                    } catch (err) {
                        // Erro ao ler arquivo, continua com validação abaixo
                    }
                }
            }
        }
    }

    // v9.0: Para fase de prototipagem, verificar se há HTML na pasta prototipos/
    if (isProtoPhase) {
        const protoDir = join(diretorio, 'prototipos');
        let htmlFiles: string[] = [];
        if (existsSync(protoDir)) {
            try {
                const allFiles = readdirSync(protoDir, { recursive: true }) as string[];
                htmlFiles = allFiles.filter(f => {
                    const ext = String(f).toLowerCase();
                    return ext.endsWith('.html') || ext.endsWith('.htm');
                }).map(String);
            } catch { /* ignore */ }
        }

        if (htmlFiles.length === 0) {
            return {
                content: [{
                    type: "text",
                    text: `# ❌ Protótipos HTML Não Encontrados

A fase de Prototipagem requer que os arquivos HTML exportados do Google Stitch estejam na pasta \`prototipos/\`.

## 📁 Pasta verificada
\`${protoDir}\`

## ⚡ AÇÃO OBRIGATÓRIA

1. Acesse **stitch.withgoogle.com**
2. Use os prompts de \`prototipos/stitch-prompts.md\`
3. Exporte os protótipos como HTML
4. Coloque os arquivos \`.html\` na pasta \`prototipos/\`
5. Depois execute: \`executar({acao: "avancar"})\`

> ⛔ A fase **só será concluída** quando os arquivos HTML estiverem na pasta.
`,
                }],
                isError: true,
            };
        }

        // Se tem HTML mas não tem entregável markdown, gerar um resumo automático
        if (!entregavel || entregavel.trim().length < TAMANHO_MINIMO_CONTEUDO_REAL) {
            entregavel = `# Protótipos — Fase de Prototipagem\n\n## Arquivos HTML\n\n${htmlFiles.map(f => `- \`${f}\``).join('\n')}\n\n## Total: ${htmlFiles.length} protótipo(s)\n`;
            entregavelLidoDoDisco = false;
            caminhoResolvido = null;
        }
    }

    // Se ainda não tem entregável válido, retornar erro
    const TAMANHO_MINIMO_ENTREGAVEL = 200;
    if (!entregavel || entregavel.trim().length < TAMANHO_MINIMO_ENTREGAVEL) {
        // Obter skill e IDE para instruções corretas
        const ideDetectada = detectIDE(diretorio) || 'windsurf';
        const skillNome = faseAtualInfo ? getSkillParaFase(faseAtualInfo.nome) : null;

        let instrucoesSkill = "";
        if (skillNome) {
            const skillPath = getIDESkillResourcePath(skillNome, 'reference', ideDetectada);
            const templatesPath = getIDESkillResourcePath(skillNome, 'templates', ideDetectada);
            instrucoesSkill = `
### 📚 Recursos da Skill

Abra os seguintes arquivos no seu IDE:

1. **SKILL.md** (instruções do especialista):
   \`${getIDESkillResourcePath(skillNome, 'reference', ideDetectada)}SKILL.md\`

2. **Templates** (estrutura do entregável):
   \`${templatesPath}\`

3. **Checklists** (validação):
   \`${getIDESkillResourcePath(skillNome, 'checklists', ideDetectada)}\`
`;
        }

        // Listar paths esperados para ajudar o usuário
        const pathsEsperados = faseAtualInfo
            ? listarPathsEsperados(diretorio, estado.fase_atual, faseAtualInfo)
            : [];

        return {
            content: [{
                type: "text",
                text: `# ❌ Entregável Não Encontrado

O sistema não encontrou o entregável da fase atual.

| Métrica | Valor |
|---------|-------|
| **Fase** | ${estado.fase_atual} - ${faseAtualInfo?.nome || 'N/A'} |
| **Entregável esperado** | ${faseAtualInfo?.entregavel_esperado || 'N/A'} |
| **Tamanho recebido** | ${args.entregavel?.trim().length || 0} caracteres |
| **Tamanho mínimo** | ${TAMANHO_MINIMO_ENTREGAVEL} caracteres |

---

## 📁 Paths Verificados

O sistema tentou ler o entregável dos seguintes locais:

${pathsEsperados.map((p, i) => `${i + 1}. \`${p}\``).join('\n')}

> ⚠️ **Nenhum arquivo encontrado** em nenhum dos paths acima.

---

## ⚡ AÇÃO OBRIGATÓRIA

Você **DEVE** desenvolver o entregável corretamente:
${instrucoesSkill}

### Fluxo Obrigatório

1. Leia a **SKILL.md** → Siga as instruções e perguntas do especialista
2. Consulte os **Templates** → Use como base estrutural
3. Faça perguntas ao usuário → Conforme indicado na SKILL
4. Gere o entregável → Seguindo TODAS as seções do template
5. **Salve o arquivo** → Em um dos paths listados acima
6. Valide com o **Checklist** → Antes de avançar
7. Apresente ao usuário → Para aprovação
8. Só então chame \`proximo()\` → Sistema lerá automaticamente do disco

> ⛔ **NÃO TENTE AVANÇAR** com entregáveis vazios ou incompletos!
`,
            }],
            isError: true,
        };
    }

    // v5.5.0: Após validação, entregavel é garantidamente string não-vazia
    // TypeScript assertion para evitar erros de tipo
    const entregavelValidado: string = entregavel!;

    // Verificar se há bloqueio de aprovação pendente (Gate)
    if (estado.aguardando_aprovacao) {
        // v5.5.0: Incluir instruções de correção no bloqueio
        const ideParaInstrucao = detectIDE(diretorio) || 'windsurf';
        const instrucaoCorrecao = faseAtualInfo
            ? gerarInstrucaoCorrecao(
                faseAtualInfo.nome,
                estado.score_bloqueado || 0,
                [], // Itens aprovados não estão salvos no estado
                [], // Itens pendentes não estão salvos no estado
                [],
                [],
                ideParaInstrucao
            )
            : "";

        return {
            content: [{
                type: "text",
                text: `# ⛔ Projeto Aguardando Aprovação

O projeto está bloqueado aguardando aprovação do usuário.

| Campo | Valor |
|-------|-------|
| **Motivo** | ${estado.motivo_bloqueio || "Score abaixo do ideal"} |
| **Score** | ${estado.score_bloqueado}/100 |

${instrucaoCorrecao}

## 🔐 Ação Necessária

O **usuário humano** deve decidir:

- **Para aprovar e avançar**: Diga "aprovar o gate"
- **Para corrigir primeiro**: Siga as instruções acima e re-submeta

> ⚠️ A IA NÃO pode aprovar automaticamente. Aguarde a decisão do usuário.
`,
            }],
        };
    }

    // Fluxo PRD-first: se ainda aguardando PRD, analisar e AUTO-CONFIRMAR se auto_flow
    if (estado.status === "aguardando_prd" && estado.fase_atual === 1) {
        const analise = classificarPRD(entregavelValidado);
        estado.classificacao_sugerida = analise;
        estado.status = "ativo";

        // AUTO-FLOW: confirma automaticamente a classificação e continua
        if (args.auto_flow) {
            estado.nivel = analise.nivel;
            estado.aguardando_classificacao = false;
            estado.classificacao_pos_prd_confirmada = true;
            estado.total_fases = getFluxoComStitch(analise.nivel, estado.usar_stitch).total_fases;
            // Continua o fluxo normal abaixo (não retorna aqui)
        } else {
            estado.aguardando_classificacao = true;
            estado.classificacao_pos_prd_confirmada = false;

            // Inferência balanceada (não assume críticos) + perguntas agrupadas
            estado.inferencia_contextual = inferirContextoBalanceado(`${estado.nome} ${entregavelValidado}`);

            const estadoFile = serializarEstado(estado);

            const perguntas = estado.inferencia_contextual?.perguntas_prioritarias || [];
            const perguntasMarkdown = perguntas.length
                ? perguntas.map((p) => `- (${p.prioridade}) ${p.pergunta}${p.valor_inferido ? `
  - Inferido: ${p.valor_inferido} (confiança ${((p.confianca_inferencia ?? 0) * 100).toFixed(0)}%)` : ""}`).join("\n")
                : "- Informe domínio, stack preferida e integrações em um único prompt.";

            return {
                content: [{
                    type: "text",
                    text: `# 🔍 PRD Analisado (PRD-first)

| Campo | Valor |
|-------|-------|
| Nível sugerido | ${analise.nivel.toUpperCase()} |
| Pontuação | ${analise.pontuacao} |
| Critérios | ${analise.criterios.join(", ")} |

## Ação obrigatória (responder em UM ÚNICO PROMPT)
Confirme ou ajuste a classificação usando:

\`\`\`json
executar({
  "diretorio": "${diretorio}",
  "acao": "avancar",
  "respostas": {
    "nivel": "${analise.nivel}"
  }
})
\`\`\`

Responda também às perguntas abaixo no MESMO prompt:
${perguntasMarkdown}

> ⚠️ Não prossiga para outras fases antes de confirmar a classificação.
`,
                }],
                estado_atualizado: estadoFile.content,
            };
        }
    }

    // Verificar se há bloqueio de confirmação de classificação (Pós-PRD)
    // AUTO-FLOW: auto-confirma e continua sem bloquear
    if (estado.aguardando_classificacao) {
        if (args.auto_flow && estado.classificacao_sugerida) {
            // Auto-confirmar classificação
            estado.nivel = estado.classificacao_sugerida.nivel;
            estado.aguardando_classificacao = false;
            estado.classificacao_pos_prd_confirmada = true;
            estado.total_fases = getFluxoComStitch(estado.classificacao_sugerida.nivel, estado.usar_stitch).total_fases;
            estado.classificacao_sugerida = undefined;
            // Continua o fluxo normal (não retorna)
        } else {
            let msgSugestao = "";
            if (estado.classificacao_sugerida) {
                msgSugestao = `
## Sugestão da IA
| Campo | Valor |
|-------|-------|
| **Nível** | ${estado.classificacao_sugerida.nivel.toUpperCase()} |
| **Pontuação** | ${estado.classificacao_sugerida.pontuacao} |
`;
            }

            return {
                content: [{
                    type: "text",
                    text: `# ⛔ Confirmação de Classificação Necessária

Antes de prosseguir, você precisa confirmar a classificação do projeto.

${msgSugestao}

## 🔐 Ação Necessária (responder em UM ÚNICO PROMPT)

Confirme ou ajuste a classificação:

\`\`\`json
executar({
  "diretorio": "${diretorio}",
  "acao": "avancar",
  "respostas": {
    "nivel": "<simples|medio|complexo>"
  }
})
\`\`\`

Inclua no MESMO prompt qualquer ajuste de domínio/stack ou integrações críticas.

> ⚠️ **IMPORTANTE**: Confirme a classificação antes de continuar.
`,
                }],
            };
        }
    }

    const faseAtual = getFaseComStitch(estado.nivel, estado.fase_atual, estado.usar_stitch);
    if (!faseAtual) {
        return {
            content: [{
                type: "text",
                text: `❌ **Erro**: Fase ${estado.fase_atual} não encontrada no fluxo ${estado.nivel}.`,
            }],
            isError: true,
        };
    }

    // Enforcement de skill + template + checklist antes de avançar
    // AUTO-FLOW: pula verificação de skill carregada (assume que IA já seguiu o template)
    const ideDetectada = detectIDE(diretorio) || 'windsurf';
    const skillObrigatoria = getSkillParaFase(faseAtual.nome);
    if (skillObrigatoria && !args.auto_flow) {
        const skillOk = await verificarSkillCarregada(diretorio, skillObrigatoria, ideDetectada).catch(() => false);
        if (!skillOk) {
            return {
                content: [{
                    type: "text",
                    text: `# ⛔ Skill Obrigatória Não Carregada

Fase: **${faseAtual.nome}**
Skill necessária: \`${skillObrigatoria}\`

Carregue e leia a skill antes de gerar o entregável:
1) Ler SKILL: \`${getIDESkillResourcePath(skillObrigatoria, 'reference', ideDetectada)}SKILL.md\`
2) Templates: \`${getIDESkillResourcePath(skillObrigatoria, 'templates', ideDetectada)}\`
3) Checklist: \`${getIDESkillResourcePath(skillObrigatoria, 'checklists', ideDetectada)}\`

> Gere o entregável seguindo o template e valide com o checklist antes de chamar \`proximo\`.`,
                }],
                isError: true,
            };
        }
    }

    // Tentar validação com template (novo sistema inteligente)
    const diretorioContent = getServerContentRoot();
    const tier = estado.tier_gate || "base";
    const validacaoTemplate = validarGateComTemplate(faseAtual, entregavelValidado, tier, diretorioContent);

    let qualityScore: number;
    let gateResultado: ReturnType<typeof validarGate>;
    let estruturaResult: ReturnType<typeof validarEstrutura>;
    let usouTemplate = false;

    if (validacaoTemplate.sucesso && validacaoTemplate.resultado) {
        // Usar validação baseada em template (enforcement)
        usouTemplate = true;
        const resultado = validacaoTemplate.resultado;

        // Converter resultado do template para formato legado para compatibilidade
        qualityScore = resultado.qualidade?.scoreGeral || resultado.score || 0;

        // Criar estrutura compatível para gateResultado
        gateResultado = {
            valido: resultado.valido,
            itens_validados: resultado.checkboxes?.preenchidos.map((c: any) => c.texto) || [],
            itens_pendentes: resultado.checkboxes?.faltando.map((c: any) => c.texto) || [],
            sugestoes: resultado.sugestoes || [],
        };

        // Criar estrutura compatível para estruturaResult
        estruturaResult = {
            valido: resultado.estrutura?.valida || false,
            score: resultado.estrutura?.score || 0,
            secoes_encontradas: resultado.estrutura?.secoesEncontradas || [],
            secoes_faltando: resultado.estrutura?.secoesFaltando || [],
            tamanho_ok: true,
            feedback: resultado.feedback || [],
        };
    } else {
        // Fallback para sistema legado
        usouTemplate = false;
        estruturaResult = validarEstrutura(estado.fase_atual, entregavelValidado, "base", faseAtual.nome);
        gateResultado = validarGate(faseAtual, entregavelValidado);
        qualityScore = calcularQualityScore(estruturaResult, gateResultado);
    }

    // Score < 50: BLOQUEAR com instruções detalhadas de correção
    if (qualityScore < 50) {
        const ideParaBloqueio = detectIDE(diretorio) || 'windsurf';
        const feedbackBloqueio = gerarInstrucaoCorrecao(
            faseAtual.nome,
            qualityScore,
            gateResultado.itens_validados || [],
            gateResultado.itens_pendentes || [],
            gateResultado.sugestoes || [],
            estruturaResult.secoes_faltando || [],
            ideParaBloqueio
        );

        // Feedback de leitura do disco
        const feedbackLeituraBloqueio = entregavelLidoDoDisco && caminhoResolvido
            ? `> 📄 **Entregável lido de:** \`${caminhoResolvido}\`\n\n`
            : !caminhoResolvido && faseAtualInfo
                ? `> ⚠️ **Arquivo não encontrado no disco.** O conteúdo foi recebido via argumento.\n\n`
                : "";

        return {
            content: [{
                type: "text",
                text: `# ❌ Entregável Bloqueado

${feedbackLeituraBloqueio}## Score: ${qualityScore}/100 - Abaixo do mínimo (50)

O entregável não atende aos requisitos mínimos de qualidade.

${feedbackBloqueio}

---

**Não é possível avançar.** Corrija os itens acima, salve o arquivo e tente novamente com \`executar({ acao: "avancar" })\`.`,
            }],
        };
    }

    // Score 50-69: Bloquear e aguardar aprovação do usuário (com instruções detalhadas)
    if (qualityScore < 70) {
        // Setar flag de bloqueio no estado
        estado.aguardando_aprovacao = true;
        estado.motivo_bloqueio = "Score abaixo de 70 - requer aprovação do usuário";
        estado.score_bloqueado = qualityScore;

        // Serializar estado bloqueado
        const estadoBloqueado = serializarEstado(estado);

        // v5.3: Persistência direta para estado bloqueado
        try {
            await saveFile(`${diretorio}/${estadoBloqueado.path}`, estadoBloqueado.content);
        } catch (err) {
            console.error('[proximo] Erro ao salvar estado bloqueado:', err);
        }

        // v5.5.0: Feedback instrutor com templates e checklists
        const ideParaAprovacao = detectIDE(diretorio) || 'windsurf';
        const feedbackAprovacao = gerarInstrucaoCorrecao(
            faseAtual.nome,
            qualityScore,
            gateResultado.itens_validados || [],
            gateResultado.itens_pendentes || [],
            gateResultado.sugestoes || [],
            estruturaResult.secoes_faltando || [],
            ideParaAprovacao
        );

        // Feedback de leitura do disco
        const feedbackLeituraAprovacao = entregavelLidoDoDisco && caminhoResolvido
            ? `> 📄 **Entregável lido de:** \`${caminhoResolvido}\`\n\n`
            : !caminhoResolvido && faseAtualInfo
                ? `> ⚠️ **Arquivo não encontrado no disco.** O conteúdo foi recebido via argumento.\n\n`
                : "";

        return {
            content: [{
                type: "text",
                text: `# ⚠️ Aprovação do Usuário Necessária

${feedbackLeituraAprovacao}## Score: ${qualityScore}/100 - Abaixo do mínimo recomendado (70)

O entregável tem qualidade abaixo do ideal mas pode ser melhorado.

${feedbackAprovacao}

---

## 🔐 Ação do Usuário Necessária

O projeto foi **bloqueado** aguardando decisão do usuário:

- **Para corrigir** (recomendado): Siga as instruções acima, edite o arquivo e re-submeta com \`executar({ acao: "avancar" })\`
- **Para aprovar mesmo assim**: Diga "aprovar o gate"

> ⚠️ **CRÍTICO**: A IA NÃO pode aprovar automaticamente.
> Aguarde a decisão explícita do usuário humano.
`,
            }],
            estado_atualizado: estadoBloqueado.content,
        };
    }

    // Score >= 70 OU usuário confirmou: Pode avançar

    // Preparar arquivos para salvar
    const filesToSave: Array<{ path: string; content: string }> = [];

    // Arquivo do entregável
    const nomeArquivo = args.nome_arquivo || faseAtual.entregavel_esperado;
    const faseDirName = `fase-${estado.fase_atual.toString().padStart(2, "0")}-${faseAtual.nome.toLowerCase().replace(/\s/g, "-")}`;
    const caminhoArquivo = `${diretorio}/docs/${faseDirName}/${nomeArquivo}`;

    filesToSave.push({
        path: caminhoArquivo,
        content: entregavelValidado
    });

    // Atualizar estado com entregável registrado
    estado.entregaveis[`fase_${estado.fase_atual}`] = caminhoArquivo;

    // Preparar/atualizar resumo
    let resumo: ProjectSummary;
    if (args.resumo_json) {
        resumo = parsearResumo(args.resumo_json) || criarResumoInicial(estado.projeto_id, estado.nome, estado.nivel, estado.fase_atual, estado.total_fases);
    } else {
        resumo = criarResumoInicial(estado.projeto_id, estado.nome, estado.nivel, estado.fase_atual, estado.total_fases);
    }

    // Extrair resumo do entregável
    const extractedInfo = extrairResumoEntregavel(entregavelValidado, estado.fase_atual, faseAtual.nome, faseAtual.entregavel_esperado, caminhoArquivo);

    const novoEntregavel: EntregavelResumo = {
        fase: estado.fase_atual,
        nome: faseAtual.nome,
        tipo: faseAtual.entregavel_esperado,
        arquivo: caminhoArquivo,
        resumo: extractedInfo.resumo,
        pontos_chave: extractedInfo.pontos_chave,
        criado_em: new Date().toISOString(),
    };

    // Adicionar ou atualizar entregável no resumo
    const existingIdx = resumo.entregaveis.findIndex(e => e.fase === estado.fase_atual);
    if (existingIdx >= 0) {
        resumo.entregaveis[existingIdx] = novoEntregavel;
    } else {
        resumo.entregaveis.push(novoEntregavel);
    }

    // v6.0: Classificação Progressiva — acumula sinais e refina em TODA transição de fase
    let classificacaoInfo = "";

    // Inicializar classificação progressiva se não existir
    if (!estado.classificacao_progressiva) {
        estado.classificacao_progressiva = {
            nivel_atual: estado.nivel,
            nivel_provisorio: true,
            confianca_geral: 50,
            sinais: [],
            historico_niveis: [],
            fases_refinamento: []
        };
    }

    // Registrar sinais do entregável atual
    const sinaisAtualizados = classificacaoProgressiva.registrarSinais(
        entregavelValidado,
        faseAtual,
        estado.classificacao_progressiva.sinais
    );
    estado.classificacao_progressiva.sinais = sinaisAtualizados;

    // Sprint 4 (v7.0): Capturar sinais das respostas dos especialistas
    // Fase 2 (Requisitos) e Fase 4 (Arquitetura) fazem perguntas técnicas
    if (estado.fase_atual === 2 || estado.fase_atual === 4) {
        const sinaisEspecialista = classificacaoProgressiva.extrairSinaisEspecialista(
            estado.fase_atual,
            entregavelValidado
        );

        if (sinaisEspecialista.length > 0) {
            // Adicionar sinais do especialista aos sinais existentes
            estado.classificacao_progressiva.sinais = [
                ...estado.classificacao_progressiva.sinais,
                ...sinaisEspecialista
            ];
        }
    }

    // Recalcular classificação com todos os sinais acumulados (incluindo sinais do especialista)
    const { nivel: nivelCalculado, confianca, criterios } = classificacaoProgressiva.recalcular(
        estado.classificacao_progressiva.sinais
    );

    // Verificar se precisa expandir o fluxo
    const expansao = classificacaoProgressiva.verificarExpansao(
        estado.classificacao_progressiva.nivel_atual,
        nivelCalculado,
        estado.fase_atual
    );

    // Atualizar classificação progressiva
    estado.classificacao_progressiva.confianca_geral = confianca;
    estado.classificacao_progressiva.fases_refinamento.push(estado.fase_atual);

    // Se houve expansão, registrar no histórico e expandir fluxo
    if (expansao.expandir) {
        estado.classificacao_progressiva.historico_niveis.push({
            fase: estado.fase_atual,
            nivel: nivelCalculado,
            motivo: `Expansão detectada: ${criterios.join(", ")}`
        });
        estado.classificacao_progressiva.nivel_atual = nivelCalculado;
        estado.nivel = nivelCalculado;
        estado.total_fases = getFluxoComStitch(nivelCalculado, estado.usar_stitch).total_fases;

        classificacaoInfo = `
## 🔄 Expansão de Fluxo Detectada!

| Campo | Valor |
|-------|-------|
| **De** | ${expansao.de.toUpperCase()} |
| **Para** | ${expansao.para.toUpperCase()} |
| **Fases Adicionadas** | +${expansao.fasesAdicionadas} fases |
| **Total de Fases** | ${estado.total_fases} |
| **Confiança** | ${confianca}% |

### 📊 Sinais que levaram à expansão:
${criterios.map(c => `- ${c}`).join("\n")}

> ⚡ O sistema detectou complexidade adicional baseado nas suas respostas e expandiu o fluxo automaticamente.
> As fases já concluídas permanecem intactas.
`;
    } else if (estado.fase_atual === 1) {
        // Primeira classificação (provisória)
        estado.classificacao_progressiva.nivel_atual = nivelCalculado;
        estado.nivel = nivelCalculado;
        estado.total_fases = getFluxoComStitch(nivelCalculado, estado.usar_stitch).total_fases;

        classificacaoInfo = `
## 🎯 Classificação Inicial (PROVISÓRIA)

| Campo | Valor |
|-------|-------|
| **Nível** | ${nivelCalculado.toUpperCase()} |
| **Confiança** | ${confianca}% |
| **Total de Fases** | ${estado.total_fases} |

### Critérios detectados:
${criterios.map(c => `- ${c}`).join("\n")}

> 💡 Esta classificação é **provisória** e será refinada automaticamente
> conforme você avança nas fases de Requisitos e Arquitetura.
`;
    } else {
        // Refinamento em fases intermediárias
        const nivelMudou = estado.classificacao_progressiva.nivel_atual !== nivelCalculado;
        if (nivelMudou && !expansao.expandir) {
            // Nível mudou mas não expandiu (confiança aumentou)
            estado.classificacao_progressiva.nivel_atual = nivelCalculado;
            estado.nivel = nivelCalculado;
        }

        classificacaoInfo = `
## 📊 Classificação Refinada

| Campo | Valor |
|-------|-------|
| **Nível Atual** | ${estado.classificacao_progressiva.nivel_atual.toUpperCase()} |
| **Confiança** | ${confianca}% |
| **Sinais Acumulados** | ${sinaisAtualizados.length} |

### Critérios atualizados:
${criterios.slice(0, 5).map(c => `- ${c}`).join("\n")}
`;
    }

    // Marcar como definitiva na fase de Arquitetura
    if (faseAtual.nome.toLowerCase().includes("arquitetura")) {
        estado.classificacao_progressiva.nivel_provisorio = false;
        classificacaoInfo += `\n> ✅ **Classificação DEFINITIVA** confirmada na fase de Arquitetura.\n`;
    }

    // Avançar para próxima fase
    const faseAnterior = estado.fase_atual;

    if (estado.fase_atual < estado.total_fases) {
        estado.fase_atual += 1;
        estado.gates_validados.push(faseAnterior);
    }

    const proximaFase = getFaseComStitch(estado.nivel, estado.fase_atual, estado.usar_stitch);

    // Atualizar contexto no resumo
    const proximaFaseInfo = getFaseComStitch(estado.nivel, estado.fase_atual, estado.usar_stitch);
    if (proximaFaseInfo) {
        resumo.contexto_atual = {
            fase_nome: proximaFaseInfo.nome,
            objetivo: `Desenvolver ${proximaFaseInfo.entregavel_esperado}`,
            proximo_passo: `Trabalhar com ${proximaFaseInfo.especialista} para criar o entregável`,
            dependencias: resumo.entregaveis.map(e => e.nome),
        };
    }
    resumo.fase_atual = estado.fase_atual;
    resumo.nivel = estado.nivel;
    resumo.total_fases = estado.total_fases;

    // Serializar estado e resumo
    const estadoFile = serializarEstado(estado);
    const resumoFiles = serializarResumo(resumo);

    filesToSave.push({
        path: `${diretorio}/${estadoFile.path}`,
        content: estadoFile.content
    });
    filesToSave.push(...resumoFiles.map(f => ({
        path: `${diretorio}/${f.path}`,
        content: f.content
    })));

    // Logar transição de fase e atualizar SYSTEM.md
    try {
        await logEvent(diretorio, {
            type: EventTypes.PHASE_TRANSITION,
            fase: estado.fase_atual,
            data: {
                de: faseAnterior,
                para: estado.fase_atual,
                entregavel: caminhoArquivo,
                score: qualityScore
            }
        });

        if (proximaFase) {
            await gerarSystemMd(
                diretorio,
                estado,
                proximaFase.nome,
                proximaFase.especialista,
                proximaFase.gate_checklist
            );
        }
    } catch (error) {
        console.warn('Aviso: Não foi possível atualizar histórico/SYSTEM.md:', error);
    }

    // v6.0: Bloco de interrupção pós-PRD removido — classificação progressiva já cuida disso

    // v5.5.0: Feedback visual quando entregável foi lido do disco
    const feedbackLeitura = entregavelLidoDoDisco && caminhoResolvido
        ? `
> 📄 **Entregável lido automaticamente de:** \`${caminhoResolvido}\`

`
        : "";

    // Gerar informações da próxima skill — INJEÇÃO ATIVA v5
    const proximaSkillInfo = await (async () => {
        if (!proximaFase) return "";

        const proximaSkill = getSkillParaFase(proximaFase.nome);
        if (!proximaSkill) return "";

        // Detectar modo do projeto
        const mode = (estado.config?.mode || "balanced") as "economy" | "balanced" | "quality";

        try {
            // Injeção ativa: carregar e incluir conteúdo real da skill na resposta
            const contentResolver = new ContentResolverService(diretorio);
            const skillLoader = new SkillLoaderService(contentResolver);
            const contextPackage = await skillLoader.loadForPhase(proximaFase.nome, mode);

            if (contextPackage) {
                return `\n\n---\n\n# 🧠 Contexto do Especialista — ${proximaFase.nome}\n\n${skillLoader.formatAsMarkdown(contextPackage)}\n`;
            }
        } catch (error) {
            console.warn("[proximo] Falha ao carregar skill ativa, usando fallback:", error);
        }

        // Fallback: referência textual (compatibilidade v4)
        const ide = estado.ide || detectIDE(diretorio) || 'windsurf';
        return `

## 🤖 Próximo Especialista

${formatSkillMessage(proximaSkill, ide)}

> 💡 **Próximos passos:**
> 1. Ative a skill: \`@${proximaSkill}\`
> 2. Leia SKILL.md para entender a fase
> 3. Consulte o template apropriado
> 4. Siga o checklist de validação
`;
    })();

    const resposta = `# ✅ Fase ${faseAnterior} Concluída!

## 📁 Entregável
\`${caminhoArquivo}\`

${gateResultado.valido ? "✅ Gate aprovado" : "⚠️ Gate forçado"}
${classificacaoInfo}

---

# 📍 Fase ${estado.fase_atual}/${estado.total_fases}: ${proximaFase?.nome || "Concluído"}

| Campo | Valor |
|-------|-------|
| **Especialista** | ${proximaFase?.especialista || "-"} |
| **Entregável** | ${proximaFase?.entregavel_esperado || "-"} |

${getSpecialistQuestions(estado.fase_atual, proximaFase?.nome)}

## Gate de Saída
${proximaFase?.gate_checklist.map(item => `- [ ] ${item}`).join("\n") || "Nenhum"}
${proximaSkillInfo}
---

`;

    // v5.3: Persistência direta — salvar todos os arquivos via fs
    try {
        await saveMultipleFiles(filesToSave);
    } catch (err) {
        console.error('[proximo] Erro ao salvar arquivos:', err);
    }

    const confirmacao = formatSavedFilesConfirmation(filesToSave.map(f => f.path));

    const specialist = proximaFase ? getSpecialistPersona(proximaFase.nome) : null;

    // v5: next_action e progress são calculados automaticamente pelo middleware flow-engine.middleware.ts
    // Mantemos apenas specialist_persona e estado_atualizado para o middleware processar
    return {
        content: [{ type: "text", text: feedbackLeitura + resposta + confirmacao }],
        estado_atualizado: estadoFile.content,
        specialist_persona: specialist || undefined,
        // next_action e progress serão adicionados pelo middleware withFlowEngine
    };
}

/**
 * Input schema para proximo
 */
export const proximoSchema = {
    type: "object",
    properties: {
        entregavel: {
            type: "string",
            description: "Conteúdo do entregável da fase atual",
        },
        estado_json: {
            type: "string",
            description: "Conteúdo do arquivo .maestro/estado.json",
        },
        resumo_json: {
            type: "string",
            description: "Conteúdo do arquivo .maestro/resumo.json (opcional)",
        },
        nome_arquivo: {
            type: "string",
            description: "Nome do arquivo para salvar (opcional)",
        },
        diretorio: {
            type: "string",
            description: "Diretório absoluto do projeto",
        },
        auto_flow: {
            type: "boolean",
            description: "Modo fluxo automático: auto-confirma classificação, pula verificações redundantes e avança automaticamente se score >= 70 (padrão: false)",
        },
    },
    required: ["estado_json", "diretorio"],  // v5.5.0: entregavel agora é opcional
};
