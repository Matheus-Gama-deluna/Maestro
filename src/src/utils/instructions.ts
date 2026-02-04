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
