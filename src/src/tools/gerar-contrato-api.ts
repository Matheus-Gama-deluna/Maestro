import { join } from "path";
import type { ToolResult, EstadoProjeto } from "../types/index.js";
import { parsearEstado } from "../state/storage.js";
import { ContractGenerator, type APIContract, type Endpoint } from "../frontend-first/contract-generator.js";
import { MockGenerator } from "../frontend-first/mock-generator.js";
import { logEvent, EventTypes } from "../utils/history.js";

interface GerarContratoAPIArgs {
    endpoints: Endpoint[];
    schemas: Record<string, any>;
    base_url?: string;
    generate_mocks?: boolean;
    generate_client?: boolean;
    mock_count?: number;
    estado_json: string;
    diretorio: string;
}

export async function gerarContratoAPI(args: GerarContratoAPIArgs): Promise<ToolResult> {
    if (!args.estado_json) {
        return {
            content: [{
                type: "text",
                text: "❌ **Erro**: Parâmetro `estado_json` é obrigatório.",
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

    if (!args.endpoints || args.endpoints.length === 0) {
        return {
            content: [{
                type: "text",
                text: "❌ **Erro**: Pelo menos um endpoint deve ser fornecido.",
            }],
            isError: true,
        };
    }

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

    const config = estado.config || { mode: 'balanced', flow: 'principal', frontend_first: true };
    
    const contract: APIContract = {
        version: '1.0.0',
        base_url: args.base_url || 'http://localhost:3000',
        endpoints: args.endpoints,
        schemas: args.schemas || {},
    };

    const generator = new ContractGenerator(config as any);

    const openapi = generator.generateOpenAPISpec(contract);
    const tsSchemas = generator.generateTypeScriptSchemas(contract.schemas);
    const zodSchemas = generator.generateZodSchemas(contract.schemas);
    const apiClient = generator.generateAPIClient(contract, 'axios');

    let mockFiles: Record<string, string> = {};
    if (args.generate_mocks !== false) {
        const mockGenerator = new MockGenerator({
            count: args.mock_count || 20,
            realistic: true,
        });
        mockFiles = mockGenerator.generateMockFiles(contract);
    }

    await logEvent(args.diretorio, {
        type: EventTypes.DELIVERABLE_SAVED,
        fase: estado.fase_atual,
        data: {
            tipo: 'api-contract',
            endpoints_count: args.endpoints.length,
            schemas_count: Object.keys(args.schemas || {}).length,
            mocks_generated: args.generate_mocks !== false,
        }
    });

    const files: Record<string, string> = {
        'api-contract/openapi.yaml': openapi,
        'api-contract/schemas/index.ts': tsSchemas,
        'api-contract/schemas/validation.ts': zodSchemas,
        'api-contract/client/api-client.ts': apiClient,
        ...Object.fromEntries(
            Object.entries(mockFiles).map(([path, content]) => [`api-contract/${path}`, content])
        ),
    };

    const withMocks = args.generate_mocks !== false;

    if (withMocks) {
        files['api-contract/README.md'] = generateReadme(contract, true);
    }

    let output = `# ✅ Contrato de API Gerado

**Frontend-First Architecture** implementada com sucesso!

## 📊 Resumo

- **Endpoints:** ${args.endpoints.length}
- **Schemas:** ${Object.keys(args.schemas || {}).length}
- **Mocks:** ${args.generate_mocks !== false ? `✅ ${args.mock_count || 20} registros por schema` : '❌ Não gerado'}
- **Cliente API:** ${args.generate_client !== false ? '✅ Gerado (Axios)' : '❌ Não gerado'}

## 📁 Arquivos Gerados

`;

    Object.keys(files).forEach(path => {
        output += `- \`${path}\`\n`;
    });

    output += `\n## 🚀 Como Usar

### 1. Instalar Dependências

\`\`\`bash
npm install axios zod msw @faker-js/faker
\`\`\`

### 2. Configurar MSW (Mock Service Worker)

\`\`\`typescript
// src/main.tsx
import { worker } from './api-contract/mocks/browser';

if (process.env.NODE_ENV === 'development') {
  worker.start();
}
\`\`\`

### 3. Usar Cliente API

\`\`\`typescript
import { getUsers, createUser } from './api-contract/client/api-client';

// Listar usuários (com mocks)
const users = await getUsers();

// Criar usuário (com mocks)
const newUser = await createUser({ name: 'John', email: 'john@example.com' });
\`\`\`

### 4. Desenvolvimento Paralelo

**Frontend:**
- Desenvolva com mocks (MSW)
- Testes com dados realistas
- Não depende de backend

**Backend:**
- Implemente mesmos endpoints
- Use mesmos schemas (Zod)
- Valide contra OpenAPI

### 5. Integração

\`\`\`typescript
// Trocar mocks por API real
if (process.env.NODE_ENV === 'production') {
  // MSW não inicia
  // Cliente usa API real
}
\`\`\`

## 📝 Próximos Passos

1. **Fase 11 (Frontend):** Desenvolver UI com mocks
2. **Fase 12 (Backend):** Implementar API real
3. **Fase 13 (Integração):** Trocar mocks por API

---

`;

    Object.entries(files).forEach(([path, content]) => {
        output += `\n### Arquivo: \`${path}\`\n\n\`\`\`\n${content}\n\`\`\`\n\n`;
    });

    return {
        content: [{
            type: "text",
            text: output,
        }],
        isError: false,
    };
}

function generateReadme(contract: APIContract, withMocks: boolean): string {
    return `# API Contract

Contrato de API gerado automaticamente para desenvolvimento frontend-first.

## Endpoints

${contract.endpoints.map(e => `- \`${e.method} ${e.path}\` - ${e.description}`).join('\n')}

## Schemas

${Object.keys(contract.schemas).map(s => `- \`${s}\``).join('\n')}

## Uso

### Com Mocks (Desenvolvimento)

\`\`\`typescript
import { worker } from './mocks/browser';

worker.start();
\`\`\`

### Com API Real (Produção)

\`\`\`typescript
import { apiClient } from './client/api-client';

apiClient.defaults.baseURL = process.env.API_URL;
\`\`\`

## Validação

Todos os schemas possuem validação Zod:

\`\`\`typescript
import { UserSchema } from './schemas/validation';

const user = UserSchema.parse(data);
\`\`\`
`;
}
