import { readFile } from "fs/promises";
import { join } from "path";
import type { ToolResult, TipoHistoria } from "../types/index.js";
import { carregarEstado } from "../state/storage.js";
import { lerEspecialista } from "../utils/files.js";
import { resolveDirectory } from "../state/context.js";

interface ImplementarHistoriaArgs {
    historia_id?: string;
    modo?: "analisar" | "iniciar" | "proximo_bloco";
    diretorio?: string;
}

interface BlocoImplementacao {
    ordem: number;
    tipo: string;
    nome: string;
    descricao: string;
    arquivos_afetados: string[];
    status: "pendente" | "em_andamento" | "concluido";
}

/**
 * Tool: implementar_historia
 * Orquestra a implementação de uma história de usuário em blocos
 */
export async function implementarHistoria(args: ImplementarHistoriaArgs): Promise<ToolResult> {
    const diretorio = resolveDirectory(args.diretorio);
    const estado = await carregarEstado(diretorio);

    if (!estado) {
        return {
            content: [{
                type: "text",
                text: "❌ **Erro**: Nenhum projeto iniciado neste diretório.",
            }],
            isError: true,
        };
    }

    const modo = args.modo || "analisar";

    // Se não passou história, mostra como usar
    if (!args.historia_id && modo === "analisar") {
        return {
            content: [{
                type: "text",
                text: `# 🔨 Implementar História

## Uso

**Analisar história:**
\`\`\`
implementar_historia(historia_id: "US001")
\`\`\`

**Iniciar implementação:**
\`\`\`
implementar_historia(historia_id: "US001", modo: "iniciar")
\`\`\`

**Avançar para próximo bloco:**
\`\`\`
implementar_historia(modo: "proximo_bloco")
\`\`\`

## Fluxo Frontend First

1. **Contrato** → Define schema OpenAPI, gera types
2. **Frontend** → Componentes, hooks, páginas (com mocks)
3. **Backend** → DTOs, Services, Controllers
4. **Integração** → Remove mocks, conecta FE ao BE

## Blocos por Tipo

| Tipo | Blocos |
|------|--------|
| Contrato | schema, types_frontend, types_backend, mock_server |
| Frontend | component, hook, store, page, teste |
| Backend | dto, entity, repository, service, controller, teste |
| Integração | remover_mock, teste_e2e |
`,
            }],
        };
    }

    // Detectar tipo da história baseado no ID
    const tipoHistoria = detectarTipoHistoria(args.historia_id || "");
    const blocos = getBlocosPorTipo(tipoHistoria);
    const especialista = await getEspecialistaPorTipo(tipoHistoria);

    const resposta = `# 🔨 Implementar História: ${args.historia_id || "Nova"}

## Tipo Detectado
**${tipoHistoria.toUpperCase()}**

## Especialista
${especialista ? `Carregado: **${especialista}**` : "Desenvolvimento"}

## Plano de Blocos

${blocos.map((b, i) => `
### Bloco ${i + 1}: ${b.nome}
- **Tipo:** ${b.tipo}
- **Descrição:** ${b.descricao}
- **Arquivos:** ${b.arquivos_afetados.join(", ") || "A definir"}
- **Status:** ${b.status === "pendente" ? "⬜" : b.status === "em_andamento" ? "🔄" : "✅"} ${b.status}
`).join("\n")}

---

## Próximo Passo

${modo === "analisar" ? `
Use \`implementar_historia(historia_id: "${args.historia_id}", modo: "iniciar")\` para começar.
` : `
Implemente o **Bloco 1: ${blocos[0].nome}** seguindo as instruções acima.

Quando concluir, use \`implementar_historia(modo: "proximo_bloco")\` para avançar.
`}
`;

    return {
        content: [{ type: "text", text: resposta }],
    };
}

function detectarTipoHistoria(id: string): TipoHistoria {
    const upperId = id.toUpperCase();
    if (upperId.startsWith("CONT") || upperId.includes("API")) return "contrato";
    if (upperId.includes("FE") || upperId.includes("FRONT")) return "frontend";
    if (upperId.includes("BE") || upperId.includes("BACK")) return "backend";
    if (upperId.includes("INT")) return "integracao";
    return "backend"; // default
}

function getBlocosPorTipo(tipo: TipoHistoria): BlocoImplementacao[] {
    switch (tipo) {
        case "contrato":
            return [
                { ordem: 1, tipo: "schema", nome: "Schema OpenAPI", descricao: "Definir endpoints e modelos", arquivos_afetados: ["openapi.yaml"], status: "pendente" },
                { ordem: 2, tipo: "types_frontend", nome: "Types Frontend", descricao: "Gerar tipos TypeScript para FE", arquivos_afetados: ["src/types/api.ts"], status: "pendente" },
                { ordem: 3, tipo: "types_backend", nome: "Types Backend", descricao: "Gerar DTOs para BE", arquivos_afetados: ["src/dtos/"], status: "pendente" },
                { ordem: 4, tipo: "mock_server", nome: "Mock Server", descricao: "Configurar mocks para desenvolvimento FE", arquivos_afetados: ["mocks/"], status: "pendente" },
            ];
        case "frontend":
            return [
                { ordem: 1, tipo: "component", nome: "Componentes", descricao: "Criar componentes UI", arquivos_afetados: ["src/components/"], status: "pendente" },
                { ordem: 2, tipo: "hook", nome: "Hooks/Store", descricao: "Criar hooks de estado/API", arquivos_afetados: ["src/hooks/"], status: "pendente" },
                { ordem: 3, tipo: "page", nome: "Página", descricao: "Montar página com componentes", arquivos_afetados: ["src/pages/"], status: "pendente" },
                { ordem: 4, tipo: "teste", nome: "Testes", descricao: "Testes de componente e E2E", arquivos_afetados: ["tests/"], status: "pendente" },
            ];
        case "backend":
            return [
                { ordem: 1, tipo: "dto", nome: "DTOs", descricao: "Data Transfer Objects", arquivos_afetados: ["src/dtos/"], status: "pendente" },
                { ordem: 2, tipo: "entity", nome: "Entidade", descricao: "Modelo de banco de dados", arquivos_afetados: ["src/entities/"], status: "pendente" },
                { ordem: 3, tipo: "repository", nome: "Repository", descricao: "Camada de acesso a dados", arquivos_afetados: ["src/repositories/"], status: "pendente" },
                { ordem: 4, tipo: "service", nome: "Service", descricao: "Regras de negócio", arquivos_afetados: ["src/services/"], status: "pendente" },
                { ordem: 5, tipo: "controller", nome: "Controller", descricao: "Endpoints da API", arquivos_afetados: ["src/controllers/"], status: "pendente" },
                { ordem: 6, tipo: "teste", nome: "Testes", descricao: "Testes unitários e integração", arquivos_afetados: ["tests/"], status: "pendente" },
            ];
        case "integracao":
            return [
                { ordem: 1, tipo: "remover_mock", nome: "Remover Mocks", descricao: "Substituir mocks por chamadas reais", arquivos_afetados: ["src/"], status: "pendente" },
                { ordem: 2, tipo: "teste_e2e", nome: "Testes E2E", descricao: "Testar fluxo completo", arquivos_afetados: ["tests/e2e/"], status: "pendente" },
            ];
    }
}

async function getEspecialistaPorTipo(tipo: TipoHistoria): Promise<string> {
    const mapa: Record<TipoHistoria, string> = {
        contrato: "Contrato de API",
        frontend: "Desenvolvimento Frontend",
        backend: "Desenvolvimento",
        integracao: "DevOps",
    };
    return mapa[tipo];
}

/**
 * Input schema para implementar_historia
 */
export const implementarHistoriaSchema = {
    type: "object",
    properties: {
        historia_id: {
            type: "string",
            description: "ID da história de usuário (ex: US001, CONT-001)",
        },
        modo: {
            type: "string",
            enum: ["analisar", "iniciar", "proximo_bloco"],
            description: "Modo de operação",
        },
        diretorio: {
            type: "string",
            description: "Diretório do projeto (opcional)",
        },
    },
};
