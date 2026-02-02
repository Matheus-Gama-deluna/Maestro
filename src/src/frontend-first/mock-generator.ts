import type { APIContract, Endpoint } from './contract-generator.js';

export interface MockConfig {
    count: number;
    realistic: boolean;
    seed?: number;
}

export class MockGenerator {
    private config: MockConfig;

    constructor(config: MockConfig = { count: 20, realistic: true }) {
        this.config = config;
    }

    generateMocks(contract: APIContract): Record<string, any[]> {
        const mocks: Record<string, any[]> = {};

        Object.entries(contract.schemas).forEach(([name, schema]) => {
            mocks[name] = this.generateMockData(schema, this.config.count);
        });

        return mocks;
    }

    private generateMockData(schema: any, count: number): any[] {
        const data: any[] = [];

        for (let i = 0; i < count; i++) {
            data.push(this.generateMockObject(schema, i));
        }

        return data;
    }

    private generateMockObject(schema: any, index: number): any {
        if (schema.type === 'object' && schema.properties) {
            const obj: any = {};

            Object.entries(schema.properties).forEach(([prop, propSchema]: [string, any]) => {
                obj[prop] = this.generateMockValue(propSchema, prop, index);
            });

            return obj;
        }

        return this.generateMockValue(schema, 'value', index);
    }

    private generateMockValue(schema: any, fieldName: string, index: number): any {
        if (schema.enum) {
            return schema.enum[index % schema.enum.length];
        }

        switch (schema.type) {
            case 'string':
                return this.generateMockString(schema, fieldName, index);
            case 'number':
            case 'integer':
                return this.generateMockNumber(schema, index);
            case 'boolean':
                return index % 2 === 0;
            case 'array':
                const arrayLength = Math.floor(Math.random() * 5) + 1;
                return Array.from({ length: arrayLength }, (_, i) => 
                    this.generateMockValue(schema.items, fieldName, i)
                );
            case 'object':
                return this.generateMockObject(schema, index);
            default:
                return null;
        }
    }

    private generateMockString(schema: any, fieldName: string, index: number): string {
        const field = fieldName.toLowerCase();

        if (schema.format === 'uuid') {
            return this.generateUUID(index);
        }

        if (schema.format === 'email' || field.includes('email')) {
            return `user${index}@example.com`;
        }

        if (schema.format === 'date-time' || field.includes('date') || field.includes('at')) {
            return new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString();
        }

        if (field.includes('name')) {
            return this.generateName(index);
        }

        if (field.includes('title')) {
            return `Title ${index + 1}`;
        }

        if (field.includes('description')) {
            return `Description for item ${index + 1}`;
        }

        if (field.includes('url') || field.includes('link')) {
            return `https://example.com/item/${index}`;
        }

        if (field.includes('phone')) {
            return `+1-555-${String(index).padStart(4, '0')}`;
        }

        if (field.includes('address')) {
            return `${index + 1} Main Street`;
        }

        if (field.includes('city')) {
            const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
            return cities[index % cities.length];
        }

        if (field.includes('country')) {
            const countries = ['USA', 'Canada', 'UK', 'Germany', 'France'];
            return countries[index % countries.length];
        }

        if (schema.minLength || schema.maxLength) {
            const length = schema.minLength || 10;
            return `text_${index}_${'x'.repeat(Math.max(0, length - 10))}`;
        }

        return `value_${index}`;
    }

    private generateMockNumber(schema: any, index: number): number {
        const min = schema.minimum || 0;
        const max = schema.maximum || 1000;
        const value = min + (index % (max - min + 1));

        return schema.type === 'integer' ? Math.floor(value) : value;
    }

    private generateUUID(index: number): string {
        const hex = index.toString(16).padStart(8, '0');
        return `${hex.slice(0, 8)}-${hex.slice(0, 4)}-4${hex.slice(1, 4)}-a${hex.slice(1, 4)}-${hex.slice(0, 12)}`;
    }

    private generateName(index: number): string {
        const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
        
        const firstName = firstNames[index % firstNames.length];
        const lastName = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
        
        return `${firstName} ${lastName}`;
    }

    generateMSWHandlers(contract: APIContract, mocks: Record<string, any[]>): string {
        let output = "import { http, HttpResponse } from 'msw';\n\n";
        output += "// Generated MSW handlers\n\n";

        contract.endpoints.forEach(endpoint => {
            output += this.generateHandler(endpoint, mocks);
            output += "\n";
        });

        output += "\nexport const handlers = [\n";
        contract.endpoints.forEach((endpoint, index) => {
            const comma = index < contract.endpoints.length - 1 ? ',' : '';
            output += `  handler${index}${comma}\n`;
        });
        output += "];\n";

        return output;
    }

    private generateHandler(endpoint: Endpoint, mocks: Record<string, any[]>): string {
        const mockData = this.inferMockData(endpoint, mocks);
        const handlerIndex = Math.floor(Math.random() * 1000);

        let handler = `const handler${handlerIndex} = http.${endpoint.method.toLowerCase()}('${endpoint.path}', ({ request, params }) => {\n`;

        if (endpoint.method === 'GET') {
            if (endpoint.path.includes(':id')) {
                handler += `  const { id } = params;\n`;
                handler += `  const item = ${mockData}.find((item: any) => item.id === id);\n`;
                handler += `  if (!item) {\n`;
                handler += `    return HttpResponse.json({ error: 'Not found' }, { status: 404 });\n`;
                handler += `  }\n`;
                handler += `  return HttpResponse.json(item);\n`;
            } else {
                handler += `  return HttpResponse.json(${mockData});\n`;
            }
        } else if (endpoint.method === 'POST') {
            handler += `  const newItem = await request.json();\n`;
            handler += `  return HttpResponse.json({ ...newItem, id: '${this.generateUUID(handlerIndex)}' }, { status: 201 });\n`;
        } else if (endpoint.method === 'PUT' || endpoint.method === 'PATCH') {
            handler += `  const { id } = params;\n`;
            handler += `  const updates = await request.json();\n`;
            handler += `  return HttpResponse.json({ ...updates, id });\n`;
        } else if (endpoint.method === 'DELETE') {
            handler += `  return HttpResponse.json({ success: true }, { status: 204 });\n`;
        }

        handler += `});\n`;
        return handler;
    }

    private inferMockData(endpoint: Endpoint, mocks: Record<string, any[]>): string {
        const pathParts = endpoint.path.split('/').filter(p => p && !p.startsWith(':'));
        const resource = pathParts[pathParts.length - 1];

        const mockKey = Object.keys(mocks).find(key => 
            key.toLowerCase().includes(resource?.toLowerCase() || '')
        );

        return mockKey ? `mock${mockKey}` : '[]';
    }

    generateMockFiles(contract: APIContract): Record<string, string> {
        const files: Record<string, string> = {};
        const mocks = this.generateMocks(contract);

        Object.entries(mocks).forEach(([name, data]) => {
            let content = `// Generated mock data for ${name}\n\n`;
            content += `export const mock${name} = ${JSON.stringify(data, null, 2)};\n`;
            files[`mocks/${name.toLowerCase()}.mock.ts`] = content;
        });

        files['mocks/handlers.ts'] = this.generateMSWHandlers(contract, mocks);

        files['mocks/browser.ts'] = `import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
`;

        files['mocks/server.ts'] = `import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
`;

        return files;
    }
}
