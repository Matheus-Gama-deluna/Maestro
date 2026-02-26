/**
 * Funções auxiliares para gerar instruções padronizadas
 * Versão 2.0: Usa skills locais ao invés de maestro://
 */

import { getSkillParaFase } from "./prompt-mapper.js";
import { getSkillResourcePath, detectIDE, IDEType } from "./ide-paths.js";

/**
 * Gera instrução obrigatória de leitura de recursos (especialista + template)
 * Versão 2.0: Baseada em skills locais
 */
export function gerarInstrucaoRecursos(
    faseNome: string,
    titulo: string = "AÇÃO OBRIGATÓRIA - Carregar Recursos",
    ide?: IDEType
): string {
    const skillNome = getSkillParaFase(faseNome);

    if (!skillNome) {
        return `
---

## ⚡ ${titulo}

Fase **${faseNome}** não possui skill associada.
`;
    }

    const ideUsada = ide || 'windsurf';
    const skillPath = getSkillResourcePath(skillNome, 'reference', ideUsada);
    const templatesPath = getSkillResourcePath(skillNome, 'templates', ideUsada);
    const checklistPath = getSkillResourcePath(skillNome, 'checklists', ideUsada);

    return `
---

## ⚡ ${titulo}

Antes de gerar qualquer conteúdo, você **DEVE** ler os recursos da skill:

### 📚 Recursos Obrigatórios

1. **SKILL.md** (instruções do especialista):
   \`${skillPath}SKILL.md\`

2. **Templates** (estrutura do entregável):
   \`${templatesPath}\`

3. **Checklists** (validação):
   \`${checklistPath}\`

> ⛔ **NÃO GERE ENTREGÁVEIS** sem ler esses recursos primeiro!

### Fluxo Obrigatório
1. Ler SKILL.md → Seguir instruções e perguntas do especialista
2. Ler Templates → Usar TODAS as seções como base
3. Fazer perguntas ao usuário → Conforme indicado na SKILL
4. Gerar entregável → Seguindo o template
5. Apresentar ao usuário → Para aprovação
6. Só então chamar \`proximo()\`
`;
}

/**
 * Gera instrução compacta de recursos (para contexto/status)
 * Versão 2.0: Baseada em skills locais
 */
export function gerarInstrucaoRecursosCompacta(
    faseNome: string,
    ide?: IDEType
): string {
    const skillNome = getSkillParaFase(faseNome);

    if (!skillNome) {
        return `
---

## 📚 Recursos da Fase Atual

Fase **${faseNome}** não possui skill associada.
`;
    }

    const ideUsada = ide || 'windsurf';
    const skillPath = getSkillResourcePath(skillNome, 'reference', ideUsada);
    const templatesPath = getSkillResourcePath(skillNome, 'templates', ideUsada);

    return `
---

## 📚 Recursos da Fase Atual

**Skill:** \`${skillNome}\`

- 📖 **SKILL.md**: \`${skillPath}SKILL.md\`
- 📋 **Templates**: \`${templatesPath}\`

> ⛔ Leia ANTES de gerar conteúdo!
`;
}

/**
 * Gera instrução para próxima fase (após avanço)
 * Versão 2.0: Baseada em skills locais
 */
export function gerarInstrucaoProximaFase(
    faseNome: string,
    ide?: IDEType
): string {
    const skillNome = getSkillParaFase(faseNome);

    if (!skillNome) {
        return `
---

## ⚡ PRÓXIMA FASE: ${faseNome}

Fase não possui skill associada.
`;
    }

    const ideUsada = ide || 'windsurf';
    const skillPath = getSkillResourcePath(skillNome, 'reference', ideUsada);
    const templatesPath = getSkillResourcePath(skillNome, 'templates', ideUsada);

    return `
---

## ⚡ PRÓXIMA FASE: ${faseNome}

Antes de começar, você **DEVE** ler os recursos:

1. **SKILL.md**: \`${skillPath}SKILL.md\`
2. **Templates**: \`${templatesPath}\`

> ⛔ **NÃO PULE** a leitura dos recursos!
`;
}

/**
 * Gera instrução detalhada de correção quando validação falha
 * Inclui paths de templates, checklists e instruções de como melhorar
 */
export function gerarInstrucaoCorrecao(
    faseNome: string,
    qualityScore: number,
    itensAprovados: string[],
    itensPendentes: string[],
    sugestoes: string[],
    secoesFaltando: string[],
    ide?: IDEType,
    diretorio?: string,  // V6 Sprint 1: para payload de auto-correção
    requiresUserDecision: boolean = false  // true = score 50-69, aguarda usuário; false = bloqueio total <50
): string {
    const skillNome = getSkillParaFase(faseNome);
    const ideUsada = ide || 'windsurf';

    // Seção de itens aprovados
    const aprovadosSection = itensAprovados.length > 0
        ? `### ✅ Itens Aprovados (${itensAprovados.length})\n${itensAprovados.map(i => `- ✅ ${i}`).join("\n")}\n`
        : "";

    // Seção de itens pendentes com sugestões
    const pendentesSection = itensPendentes.length > 0
        ? `### ❌ Itens Pendentes (${itensPendentes.length})\n${itensPendentes.map((item, i) => `- ❌ **${item}**\n  💡 ${sugestoes[i] || `Adicione: ${item}`}`).join("\n")}\n`
        : "";

    // Seção de seções faltando
    const secoesSection = secoesFaltando.length > 0
        ? `### 📝 Seções Faltando no Documento\n${secoesFaltando.map(s => `- 📝 **${s}** — Adicione esta seção ao entregável`).join("\n")}\n`
        : "";

    // Seção de recursos da skill (templates/checklists)
    let recursosSection = "";
    if (skillNome) {
        const skillPath = getSkillResourcePath(skillNome, 'reference', ideUsada);
        const templatesPath = getSkillResourcePath(skillNome, 'templates', ideUsada);
        const checklistPath = getSkillResourcePath(skillNome, 'checklists', ideUsada);

        recursosSection = `
---

## 📚 Recursos Para Correção

**Consulte esses arquivos para saber EXATAMENTE o que incluir:**

1. **Template do entregável** (estrutura completa):
   \`${templatesPath}\`
   → Use como referência para as seções obrigatórias

2. **Checklist de validação** (critérios de aprovação):
   \`${checklistPath}\`
   → Cada item precisa estar presente no entregável

3. **SKILL.md** (instruções do especialista):
   \`${skillPath}SKILL.md\`
   → Siga os princípios e perguntas do especialista
`;
    }

    const dirStr = diretorio || '<diretorio_do_projeto>';

    // Instrução autônoma: apenas para bloqueio total (<50), nunca quando requer decisão do usuário
    const instrucaoAutonoma = !requiresUserDecision ? `
---

> ⚙️ **INSTRUÇÃO DE SISTEMA — AÇÃO AUTÔNOMA REQUERIDA**
> O usuário humano NÃO precisa intervir neste ciclo de correção.
> **Você (IA assistente) deve, na ordem, SEM pedir confirmação:**
> 1. Abrir o template indicado acima em \`resources/templates/\`
> 2. Editar o entregável no disco aplicando as correções dos itens ❌
> 3. Salvar o arquivo no mesmo caminho
> 4. Chamar imediatamente: \`executar({ diretorio: "${dirStr}", acao: "avancar" })\`
>
> ⚠️ Se após 3 tentativas o score ainda for < 70, pare e apresente as opções ao usuário.
` : '';

    // Instrução de como corrigir
    const instrucaoCorrecao = `
---

## 🔄 Como Corrigir

1. **Leia o template** → Veja quais seções estão faltando
2. **Leia o checklist** → Veja quais critérios não foram atendidos
3. **Edite o entregável** → Adicione as seções e conteúdos faltantes
4. **Salve o arquivo** → No mesmo local no disco
5. **Re-submeta** → Chame \`executar({ acao: "avancar" })\` novamente

> 💡 **Dica:** Foque nos itens ❌ pendentes listados acima. Cada item precisa estar presente no conteúdo do entregável.
${instrucaoAutonoma}`;



    return `
## 📊 Resultado da Validação: ${qualityScore}/100

${aprovadosSection}
${pendentesSection}
${secoesSection}
${recursosSection}
${instrucaoCorrecao}
`;
}

/**
 * V6 Sprint 6: Gera instrução de continuidade autônoma.
 * Para fases do tipo 'input_required', retorna vazio — especialista fará as perguntas.
 */
export function gerarInstrucaoContinuidade(
    diretorio: string,
    faseAtual: number,
    proximaFase: string,
    phaseType: 'input_required' | 'derived' | 'technical' | 'correction_loop'
): string {
    if (phaseType === 'input_required') return '';

    return [
        ``,
        `---`,
        ``,
        `> ✅ **Gate aprovado — Fase ${faseAtual} concluída.**`,
        `> **AÇÃO DO SISTEMA:** Nova fase "${proximaFase}" iniciada.`,
        `> Leia o SKILL.md do especialista indicado acima.`,
        `> ✋ **NÃO GERE O ENTREGÁVEL COMPLETO AINDA.** Em vez disso, apresente ao usuário uma sugestão de esqueleto ou faça perguntas de alinhamento para garantir que a direção está correta.`,
        `> Só avance gerando os artefatos completos após a resposta ou aprovação do usuário.`,
        ``,
    ].join('\n');
}
