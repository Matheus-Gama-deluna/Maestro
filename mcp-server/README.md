# MCP Maestro

Servidor MCP (Model Context Protocol) para o Maestro - Guia de Desenvolvimento Assistido por IA.

## Instalação

```bash
cd mcp-server
npm install
```

## Uso

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
npm run build
npm start
```

## Endpoints

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/` | GET | Informações do servidor |
| `/health` | GET | Health check |
| `/mcp` | POST | Endpoint MCP JSON-RPC |
| `/resources` | GET | Lista resources disponíveis |
| `/tools` | GET | Lista tools disponíveis |

## Tools Disponíveis

| Tool | Descrição |
|------|-----------|
| `iniciar_projeto` | Inicia um novo projeto |
| `proximo` | Salva entregável e avança fase |
| `status` | Retorna status do projeto |
| `validar_gate` | Valida checklist da fase |

## Resources Disponíveis

| URI | Descrição |
|-----|-----------|
| `maestro://especialista/{nome}` | Especialistas |
| `maestro://template/{nome}` | Templates |
| `maestro://guia/{nome}` | Guias práticos |
| `maestro://system-prompt` | Instruções para IA |

## Exemplo de Uso

```bash
# Listar tools
curl http://localhost:3000/tools

# Chamar tool
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/call",
    "params": {
      "name": "status",
      "arguments": {}
    }
  }'
```

## Integração com IDEs

Configure sua IDE para conectar ao endpoint:
```
http://localhost:3000/mcp
```
