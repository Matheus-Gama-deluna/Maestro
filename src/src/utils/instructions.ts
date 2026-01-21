/**
 * Funções auxiliares para gerar instruções padronizadas
 */

/**
 * Gera instrução obrigatória de leitura de recursos (especialista + template)
 */
export function gerarInstrucaoRecursos(
    especialista: string,
    template: string,
    titulo: string = "AÇÃO OBRIGATÓRIA - Carregar Recursos"
): string {
    return `
---

## ⚡ ${titulo}

Antes de gerar qualquer conteúdo, você **DEVE** executar:

1. **Ler especialista:**
   \`\`\`
   read_resource("maestro://especialista/${especialista}")
   \`\`\`

2. **Ler template:**
   \`\`\`
   read_resource("maestro://template/${template}")
   \`\`\`

> ⛔ **NÃO GERE ENTREGÁVEIS** sem ler esses recursos primeiro!

### Fluxo Obrigatório
1. Ler especialista → Seguir suas instruções e perguntas
2. Ler template → Usar TODAS as seções como base
3. Fazer perguntas ao usuário conforme especialista
4. Gerar entregável seguindo o template
5. Apresentar ao usuário para aprovação
6. Só então chamar \`proximo()\`
`;
}

/**
 * Gera instrução compacta de recursos (para contexto/status)
 */
export function gerarInstrucaoRecursosCompacta(
    especialista: string,
    template: string
): string {
    return `
---

## 📚 Recursos da Fase Atual

\`\`\`
read_resource("maestro://especialista/${especialista}")
read_resource("maestro://template/${template}")
\`\`\`

> ⛔ Leia ANTES de gerar conteúdo!
`;
}

/**
 * Gera instrução para próxima fase (após avanço)
 */
export function gerarInstrucaoProximaFase(
    especialista: string,
    template: string,
    fasNome: string
): string {
    return `
---

## ⚡ PRÓXIMA FASE: ${fasNome}

Antes de começar, você **DEVE**:

1. \`read_resource("maestro://especialista/${especialista}")\`
2. \`read_resource("maestro://template/${template}")\`

> ⛔ **NÃO PULE** a leitura dos recursos!
`;
}
