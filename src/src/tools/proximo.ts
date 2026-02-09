import { join, resolve } from "path";
import { existsSync } from "fs";
import type { ToolResult, EstadoProjeto } from "../types/index.js";
import { parsearEstado, serializarEstado } from "../state/storage.js";
import { getFase, getFluxo, getFaseComStitch, getFluxoComStitch } from "../flows/types.js";
import { classificarPRD, descreverNivel } from "../flows/classifier.js";
import { validarGate, formatarResultadoGate, validarGateComTemplate } from "../gates/validator.js";
import { setCurrentDirectory } from "../state/context.js";
import { parsearResumo, serializarResumo, criarResumoInicial, extrairResumoEntregavel } from "../state/memory.js";
import { gerarInstrucaoProximaFase } from "../utils/instructions.js";
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

interface ProximoArgs {
    entregavel: string;
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

    // Validar tamanho mínimo do entregável
    const TAMANHO_MINIMO_ENTREGAVEL = 200;
    if (!args.entregavel || args.entregavel.trim().length < TAMANHO_MINIMO_ENTREGAVEL) {
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

        return {
            content: [{
                type: "text",
                text: `# ❌ Entregável Inválido

O entregável está vazio ou muito curto.

| Métrica | Valor |
|---------|-------|
| **Tamanho recebido** | ${args.entregavel?.trim().length || 0} caracteres |
| **Tamanho mínimo** | ${TAMANHO_MINIMO_ENTREGAVEL} caracteres |

---

## ⚡ AÇÃO OBRIGATÓRIA

Você **DEVE** desenvolver o entregável corretamente:
${instrucoesSkill}

### Fluxo Obrigatório

1. Leia a **SKILL.md** → Siga as instruções e perguntas do especialista
2. Consulte os **Templates** → Use como base estrutural
3. Faça perguntas ao usuário → Conforme indicado na SKILL
4. Gere o entregável → Seguindo TODAS as seções do template
5. Valide com o **Checklist** → Antes de avançar
6. Apresente ao usuário → Para aprovação
7. Só então chame \`proximo()\`

> ⛔ **NÃO TENTE AVANÇAR** com entregáveis vazios ou incompletos!
`,
            }],
            isError: true,
        };
    }

    // Verificar se há bloqueio de aprovação pendente (Gate)
    if (estado.aguardando_aprovacao) {
        return {
            content: [{
                type: "text",
                text: `# ⛔ Projeto Aguardando Aprovação

O projeto está bloqueado aguardando aprovação do usuário.

| Campo | Valor |
|-------|-------|
| **Motivo** | ${estado.motivo_bloqueio || "Score abaixo do ideal"} |
| **Score** | ${estado.score_bloqueado}/100 |

## 🔐 Ação Necessária

O **usuário humano** deve decidir:

- **Aprovar**: \`aprovar_gate(acao: "aprovar", ...)\`
- **Rejeitar**: \`aprovar_gate(acao: "rejeitar", ...)\`

> ⚠️ A IA NÃO pode aprovar automaticamente. Aguarde a decisão do usuário.
`,
            }],
        };
    }

    // Fluxo PRD-first: se ainda aguardando PRD, analisar e AUTO-CONFIRMAR se auto_flow
    if (estado.status === "aguardando_prd" && estado.fase_atual === 1) {
        const analise = classificarPRD(args.entregavel);
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
            estado.inferencia_contextual = inferirContextoBalanceado(`${estado.nome} ${args.entregavel}`);

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
    const validacaoTemplate = validarGateComTemplate(faseAtual, args.entregavel, tier, diretorioContent);
    
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
        estruturaResult = validarEstrutura(estado.fase_atual, args.entregavel);
        gateResultado = validarGate(faseAtual, args.entregavel);
        qualityScore = calcularQualityScore(estruturaResult, gateResultado);
    }

    // Score < 50: BLOQUEAR
    if (qualityScore < 50) {
        return {
            content: [{
                type: "text",
                text: `# ❌ Entregável Bloqueado

## Score: ${qualityScore}/100 - Abaixo do mínimo (50)

O entregável não atende aos requisitos mínimos de qualidade.

### Problemas Encontrados

${estruturaResult.feedback.join("\n")}

### Checklist Pendente
${gateResultado.itens_pendentes.map((item, i) => `- ${item}\n  💡 ${gateResultado.sugestoes[i]}`).join("\n")}

---

**Não é possível avançar.** Corrija os itens acima e tente novamente.`,
            }],
        };
    }

    // Score 50-69: Bloquear e aguardar aprovação do usuário
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

        return {
            content: [{
                type: "text",
                text: `# ⚠️ Aprovação do Usuário Necessária

## Score: ${qualityScore}/100 - Abaixo do mínimo recomendado (70)

O entregável tem qualidade abaixo do ideal.

### Itens Pendentes

${estruturaResult.secoes_faltando.length > 0 ? `**Seções faltando:**\n${estruturaResult.secoes_faltando.map((s: string) => `- ${s}`).join("\n")}\n` : ""}
${gateResultado.itens_pendentes.length > 0 ? `**Checklist pendente:**\n${gateResultado.itens_pendentes.map((item: string) => `- ${item}`).join("\n")}` : ""}

---

## 🔐 Ação do Usuário Necessária

O projeto foi **bloqueado** aguardando decisão do usuário:

- **Para aprovar**: O usuário deve pedir para aprovar o gate
- **Para corrigir**: O usuário deve pedir para rejeitar e corrigir o entregável

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
        content: args.entregavel
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
    const extractedInfo = extrairResumoEntregavel(args.entregavel, estado.fase_atual, faseAtual.nome, faseAtual.entregavel_esperado, caminhoArquivo);

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

    // Classificar complexidade após fase 1 (PRD)
    let classificacaoInfo = "";
    if (estado.fase_atual === 1) {
        const classificacao = classificarPRD(args.entregavel);
        estado.nivel = classificacao.nivel;
        estado.total_fases = getFluxoComStitch(classificacao.nivel, estado.usar_stitch).total_fases;

        classificacaoInfo = `
## 🎯 Classificação do Projeto

| Campo | Valor |
|-------|-------|
| **Nível** | ${classificacao.nivel.toUpperCase()} |
| **Pontuação** | ${classificacao.pontuacao} pontos |
| **Total de Fases** | ${estado.total_fases} |

### Critérios detectados:
${classificacao.criterios.map(c => `- ${c}`).join("\n")}

> ${descreverNivel(classificacao.nivel)}
`;
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

    // Se estiver na Fase 1 (PRD) e ainda não confirmou classificação -> INTERROMPER
    if (estado.fase_atual === 1 && !estado.classificacao_pos_prd_confirmada) {
        const classificacao = classificarPRD(args.entregavel);

        // Atualiza estado para aguardar confirmação
        estado.aguardando_classificacao = true;
        estado.classificacao_sugerida = {
            nivel: classificacao.nivel,
            pontuacao: classificacao.pontuacao,
            criterios: classificacao.criterios
        };

        // Serializa estado bloqueado
        const estadoBloqueado = serializarEstado(estado);

        // v5.3: Persistência direta — salvar todos os arquivos pendentes
        const estadoFileIdx = filesToSave.findIndex((f: { path: string }) => f.path.endsWith("estado.json"));
        if (estadoFileIdx >= 0) {
            filesToSave[estadoFileIdx].content = estadoBloqueado.content;
        } else {
            filesToSave.push({
                path: `${diretorio}/${estadoBloqueado.path}`,
                content: estadoBloqueado.content
            });
        }

        try {
            await saveMultipleFiles(filesToSave);
        } catch (err) {
            console.error('[proximo] Erro ao salvar arquivos:', err);
        }

        const confirmacaoClassif = formatSavedFilesConfirmation(filesToSave.map((f: { path: string }) => f.path));

        return {
            content: [{
                type: "text",
                text: `# 🧐 Verificação de Complexidade Necessária

Analisei o PRD e tenho uma sugestão de classificação.

## Resultado da Análise
| Campo | Valor |
|-------|-------|
| **Nível Sugerido** | **${classificacao.nivel.toUpperCase()}** |
| **Pontuação** | ${classificacao.pontuacao} |

### Critérios
${classificacao.criterios.map(c => `- ${c}`).join("\n")}

---

## 🔐 Próximo Passo: Confirmação

O projeto foi **PAUSADO** para que você confirme essa classificação.
A IA **NÃO** avançou para a próxima fase automaticamente.

EXECUTE para confirmar:

\`\`\`json
executar({
  "diretorio": "${diretorio}",
  "acao": "avancar",
  "respostas": {
    "nivel": "${classificacao.nivel}"
  }
})
\`\`\`
${confirmacaoClassif}
`,
            }],
            estado_atualizado: estadoBloqueado.content,
        };
    }

    // Classificar complexidade após fase 1 (PRD) - (Lógica antiga removida/simplificada pois agora temos o bloco acima)
    let classificacaoInfoAdicional = "";
    if (estado.fase_atual === 1) {
        // Se chegou aqui, é porque já confirmou (classificacao_pos_prd_confirmada == true)
        // Ou na primeira passagem (se por algum motivo a flag já estivesse true, o que não deve ocorrer na fluxo padrão novo)
        // Mantemos apenas informativo se necessário, ou removemos.
        // Dado o fluxo novo, a reclassificação acontece no 'confirmar_classificacao'.
        // Aqui apenas registramos que passou.
    }

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
${classificacaoInfoAdicional}

---

# 📍 Fase ${estado.fase_atual}/${estado.total_fases}: ${proximaFase?.nome || "Concluído"}

| Campo | Valor |
|-------|-------|
| **Especialista** | ${proximaFase?.especialista || "-"} |
| **Entregável** | ${proximaFase?.entregavel_esperado || "-"} |

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
        content: [{ type: "text", text: resposta + confirmacao }],
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
    required: ["entregavel", "estado_json", "diretorio"],
};
