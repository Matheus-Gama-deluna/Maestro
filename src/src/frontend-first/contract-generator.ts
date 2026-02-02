import type { ProjectConfig } from '../types/config.js';

export interface Endpoint {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    description: string;
    request?: {
        params?: Record<string, string>;
        query?: Record<string, string>;
        body?: Record<string, any>;
    };
    response: {
        success: Record<string, any>;
        error?: Record<string, any>;
    };
    auth_required?: boolean;
}

export interface APIContract {
    version: string;
    base_url: string;
    endpoints: Endpoint[];
    schemas: Record<string, any>;
    auth?: {
        type: 'bearer' | 'apikey' | 'oauth2';
        header?: string;
    };
}

export class ContractGenerator {
    private config: ProjectConfig;

    constructor(config: ProjectConfig) {
        this.config = config;
    }

    generateOpenAPISpec(contract: APIContract): string {
        const spec = {
            openapi: '3.0.0',
            info: {
                title: 'API Contract',
                version: contract.version,
                description: 'Generated API contract for frontend-first development',
            },
            servers: [
                {
                    url: contract.base_url,
                    description: 'API Server',
                },
            ],
            paths: this.generatePaths(contract.endpoints),
            components: {
                schemas: contract.schemas,
                securitySchemes: contract.auth ? this.generateSecuritySchemes(contract.auth) : {},
            },
        };

        return JSON.stringify(spec, null, 2);
    }

    private generatePaths(endpoints: Endpoint[]): Record<string, any> {
        const paths: Record<string, any> = {};

        endpoints.forEach(endpoint => {
            if (!paths[endpoint.path]) {
                paths[endpoint.path] = {};
            }

            paths[endpoint.path][endpoint.method.toLowerCase()] = {
                summary: endpoint.description,
                parameters: this.generateParameters(endpoint.request),
                requestBody: endpoint.request?.body ? {
                    required: true,
                    content: {
                        'application/json': {
                            schema: endpoint.request.body,
                        },
                    },
                } : undefined,
                responses: {
                    '200': {
                        description: 'Successful response',
                        content: {
                            'application/json': {
                                schema: endpoint.response.success,
                            },
                        },
                    },
                    '400': endpoint.response.error ? {
                        description: 'Error response',
                        content: {
                            'application/json': {
                                schema: endpoint.response.error,
                            },
                        },
                    } : undefined,
                },
                security: endpoint.auth_required ? [{ bearerAuth: [] }] : undefined,
            };
        });

        return paths;
    }

    private generateParameters(request?: Endpoint['request']): any[] {
        const parameters: any[] = [];

        if (request?.params) {
            Object.entries(request.params).forEach(([name, type]) => {
                parameters.push({
                    name,
                    in: 'path',
                    required: true,
                    schema: { type },
                });
            });
        }

        if (request?.query) {
            Object.entries(request.query).forEach(([name, type]) => {
                parameters.push({
                    name,
                    in: 'query',
                    required: false,
                    schema: { type },
                });
            });
        }

        return parameters;
    }

    private generateSecuritySchemes(auth: APIContract['auth']): Record<string, any> {
        if (!auth) return {};

        switch (auth.type) {
            case 'bearer':
                return {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                };
            case 'apikey':
                return {
                    apiKeyAuth: {
                        type: 'apiKey',
                        in: 'header',
                        name: auth.header || 'X-API-Key',
                    },
                };
            case 'oauth2':
                return {
                    oauth2: {
                        type: 'oauth2',
                        flows: {
                            authorizationCode: {
                                authorizationUrl: '/oauth/authorize',
                                tokenUrl: '/oauth/token',
                                scopes: {},
                            },
                        },
                    },
                };
            default:
                return {};
        }
    }

    generateTypeScriptSchemas(schemas: Record<string, any>): string {
        let output = "// Generated TypeScript schemas\n\n";

        Object.entries(schemas).forEach(([name, schema]) => {
            output += this.schemaToTypeScript(name, schema);
            output += "\n\n";
        });

        return output;
    }

    private schemaToTypeScript(name: string, schema: any): string {
        if (schema.type === 'object' && schema.properties) {
            let ts = `export interface ${name} {\n`;
            
            Object.entries(schema.properties).forEach(([prop, propSchema]: [string, any]) => {
                const optional = schema.required?.includes(prop) ? '' : '?';
                const type = this.mapTypeToTS(propSchema);
                ts += `  ${prop}${optional}: ${type};\n`;
            });
            
            ts += "}";
            return ts;
        }

        return `export type ${name} = ${this.mapTypeToTS(schema)};`;
    }

    private mapTypeToTS(schema: any): string {
        if (schema.$ref) {
            return schema.$ref.split('/').pop();
        }

        switch (schema.type) {
            case 'string':
                return schema.enum ? schema.enum.map((v: string) => `'${v}'`).join(' | ') : 'string';
            case 'number':
            case 'integer':
                return 'number';
            case 'boolean':
                return 'boolean';
            case 'array':
                return `${this.mapTypeToTS(schema.items)}[]`;
            case 'object':
                return 'Record<string, any>';
            default:
                return 'any';
        }
    }

    generateZodSchemas(schemas: Record<string, any>): string {
        let output = "import { z } from 'zod';\n\n";
        output += "// Generated Zod schemas\n\n";

        Object.entries(schemas).forEach(([name, schema]) => {
            output += this.schemaToZod(name, schema);
            output += "\n\n";
        });

        return output;
    }

    private schemaToZod(name: string, schema: any): string {
        const zodSchema = this.mapSchemaToZod(schema);
        return `export const ${name}Schema = ${zodSchema};\n\nexport type ${name} = z.infer<typeof ${name}Schema>;`;
    }

    private mapSchemaToZod(schema: any, indent: number = 0): string {
        const spaces = '  '.repeat(indent);

        if (schema.$ref) {
            return schema.$ref.split('/').pop() + 'Schema';
        }

        switch (schema.type) {
            case 'string':
                let str = 'z.string()';
                if (schema.minLength) str += `.min(${schema.minLength})`;
                if (schema.maxLength) str += `.max(${schema.maxLength})`;
                if (schema.pattern) str += `.regex(/${schema.pattern}/)`;
                if (schema.format === 'email') str += '.email()';
                if (schema.format === 'uuid') str += '.uuid()';
                if (schema.format === 'date-time') str += '.datetime()';
                if (schema.enum) str = `z.enum([${schema.enum.map((v: string) => `'${v}'`).join(', ')}])`;
                return str;

            case 'number':
            case 'integer':
                let num = schema.type === 'integer' ? 'z.number().int()' : 'z.number()';
                if (schema.minimum !== undefined) num += `.min(${schema.minimum})`;
                if (schema.maximum !== undefined) num += `.max(${schema.maximum})`;
                return num;

            case 'boolean':
                return 'z.boolean()';

            case 'array':
                return `z.array(${this.mapSchemaToZod(schema.items, indent)})`;

            case 'object':
                if (schema.properties) {
                    let obj = 'z.object({\n';
                    Object.entries(schema.properties).forEach(([prop, propSchema]: [string, any]) => {
                        const propZod = this.mapSchemaToZod(propSchema, indent + 1);
                        const optional = schema.required?.includes(prop) ? '' : '.optional()';
                        obj += `${spaces}  ${prop}: ${propZod}${optional},\n`;
                    });
                    obj += `${spaces}})`;
                    return obj;
                }
                return 'z.record(z.any())';

            default:
                return 'z.any()';
        }
    }

    generateAPIClient(contract: APIContract, framework: 'axios' | 'fetch' = 'axios'): string {
        let output = '';

        if (framework === 'axios') {
            output += "import axios from 'axios';\n";
            output += "import type { AxiosInstance } from 'axios';\n\n";
        }

        output += "// Generated API Client\n\n";
        output += `const BASE_URL = '${contract.base_url}';\n\n`;

        if (framework === 'axios') {
            output += `export const apiClient: AxiosInstance = axios.create({\n`;
            output += `  baseURL: BASE_URL,\n`;
            output += `  headers: {\n`;
            output += `    'Content-Type': 'application/json',\n`;
            output += `  },\n`;
            output += `});\n\n`;
        }

        contract.endpoints.forEach(endpoint => {
            output += this.generateEndpointFunction(endpoint, framework);
            output += "\n\n";
        });

        return output;
    }

    private generateEndpointFunction(endpoint: Endpoint, framework: 'axios' | 'fetch'): string {
        const funcName = this.endpointToFunctionName(endpoint);
        const params = this.extractParams(endpoint);
        const paramsStr = params.length > 0 ? params.join(', ') : '';

        let func = `export async function ${funcName}(${paramsStr}) {\n`;

        if (framework === 'axios') {
            const url = this.buildUrlTemplate(endpoint.path);
            func += `  const response = await apiClient.${endpoint.method.toLowerCase()}(\`${url}\``;
            
            if (endpoint.request?.body) {
                func += `, data`;
            }
            
            func += `);\n`;
            func += `  return response.data;\n`;
        } else {
            const url = this.buildUrlTemplate(endpoint.path);
            func += `  const response = await fetch(\`\${BASE_URL}${url}\`, {\n`;
            func += `    method: '${endpoint.method}',\n`;
            
            if (endpoint.request?.body) {
                func += `    headers: { 'Content-Type': 'application/json' },\n`;
                func += `    body: JSON.stringify(data),\n`;
            }
            
            func += `  });\n`;
            func += `  return response.json();\n`;
        }

        func += `}`;
        return func;
    }

    private endpointToFunctionName(endpoint: Endpoint): string {
        const method = endpoint.method.toLowerCase();
        const pathParts = endpoint.path.split('/').filter(p => p && !p.startsWith(':'));
        const resource = pathParts[pathParts.length - 1] || 'resource';
        
        return `${method}${this.capitalize(resource)}`;
    }

    private extractParams(endpoint: Endpoint): string[] {
        const params: string[] = [];

        if (endpoint.request?.params) {
            Object.keys(endpoint.request.params).forEach(param => {
                params.push(`${param}: string`);
            });
        }

        if (endpoint.request?.query) {
            params.push(`query?: Record<string, any>`);
        }

        if (endpoint.request?.body) {
            params.push(`data: any`);
        }

        return params;
    }

    private buildUrlTemplate(path: string): string {
        return path.replace(/:(\w+)/g, '${$1}');
    }

    private capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
