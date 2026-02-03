# MCP Maestro v2.1

Servidor MCP (Model Context Protocol) para o Maestro - Guia de Desenvolvimento Assistido por IA.

**Pacote**: `@maestro-ai/mcp-server@2.1.0`

## 🚀 Uso via npx (Recomendado)

O Maestro agora é distribuído como pacote npm e executado localmente via `npx`, garantindo acesso direto aos arquivos do seu projeto.

### Instalação e Configuração

1. **Configure seu cliente MCP** (ex: Gemini, VS Code, Cline):

   ```json
   {
     "mcpServers": {
       "maestro": {
         "command": "npx",
         "args": ["-y", "@maestro-ai/mcp-server@latest"],
         "disabled": false,
         "env": {}
       }
     }
   }
   ```

2. **O Maestro usará automaticamente o diretório de trabalho atual** onde você estiver trabalhando.

3. **Especificar diretório manualmente (se necessário)**:
   ```json
   {
     "mcpServers": {
       "maestro": {
         "command": "npx",
         "args": ["-y", "@maestro-ai/mcp-server@latest", "D:\\Meus\\Projetos"],
         "disabled": false,
         "env": {}
       }
     }
   }
   ```



### Fluxo de Uso (inclui modos e discovery)

```bash
# 1. Iniciar novo projeto (analisa e sugere classificação)
iniciar_projeto(
    nome: "Meu App",
    descricao: "Sistema de gestão de tarefas",
    diretorio: "D:\\Projetos\\meu-app",
    ide: "windsurf",
    modo: "balanced"   # economy | balanced | quality
)

# 2. Confirmar criação (injeta conteúdo automaticamente)
confirmar_projeto(
    nome: "Meu App",
    diretorio: "D:\\Projetos\\meu-app",
    tipo_artefato: "product",
    nivel_complexidade: "medio",
    ide: "windsurf",
    modo: "balanced"
)

# 3. Coletar discovery (reduz prompts)
discovery(
    estado_json: "<conteudo do estado.json>",
    diretorio: "D:\\Projetos\\meu-app"
)

# 4. Trabalhar nas fases
proximo()      # Avança para próxima fase
status()       # Ver status completo
salvar()       # Salva entregáveis
```

### Injeção Automática de Conteúdo

Ao confirmar um projeto, o Maestro injeta automaticamente:

```
meu-app/
├── .maestro/
│   ├── content/          ← Conteúdo injetado aqui
│   │   ├── specialists/  # Especialistas de cada fase
│   │   ├── templates/    # Modelos de entregáveis
│   │   ├── guides/       # Guias de apoio
│   │   └── prompts/      # Prompts por categoria
│   ├── estado.json       # Estado do projeto
│   └── resumo.json       # Memória do projeto
```

### Comandos Principais

| Comando | Descrição |
|---------|-----------|
| `iniciar_projeto` | Analisa e sugere classificação |
| `confirmar_projeto` | Cria projeto e injeta conteúdo |
| `carregar_projeto` | Carrega projeto existente |
| `proximo` | Salva entregável e avança fase |
| `status` | Retorna status completo |
| `discovery` | Coleta perguntas iniciais agrupadas e salva em `estado.discovery` |
| `injetar_conteudo` | Reinjeta conteúdo (use `force:true`) |

---

## Destaques do Changelog v2.1
- Modos de operação: economy / balanced / quality com otimizações automáticas
- Discovery agrupado para reduzir 40-75% dos prompts iniciais
- Multi-IDE consolidado via `ide-paths.ts` (Windsurf, Cursor, Antigravity)
- Correções de dependências e atualização do SDK MCP para 1.25.3

---

## Tools Disponíveis

| Tool | Descrição |
|------|-----------|
| `iniciar_projeto` | Inicia um novo projeto com classificação |
| `confirmar_projeto` | Confirma criação e injeta conteúdo |
| `carregar_projeto` | Carrega projeto existente |
| `proximo` | Salva entregável e avança para próxima fase |
| `status` | Retorna status atual do projeto |
| `validar_gate` | Valida checklist antes de avançar fase |
| `contexto` | Obtém contexto completo do projeto |
| `salvar` | Salva artefatos do projeto |
| `injetar_conteudo` | Injeta conteúdo base no projeto |
| `nova_feature` | Fluxo para adicionar nova feature |
| `corrigir_bug` | Fluxo para correção de bugs |
| `refatorar` | Fluxo para refatoração de código |
| `classificar` | Classifica entregáveis |
| `avaliar_entregavel` | Avalia qualidade com score |

---

## 📚 Resources Disponíveis

| URI | Descrição |
|-----|-----------|
| `maestro://especialista/{nome}` | Especialistas de IA |
| `maestro://template/{nome}` | Templates de documentos |
| `maestro://guia/{nome}` | Guias práticos |
| `maestro://prompt/{categoria}/{nome}` | Prompts especializados |
| `maestro://system-prompt` | System prompt do Maestro |

---

## 💻 Desenvolvimento Local

### Instalação

```bash
cd src
npm install
```

### Desenvolvimento

```bash
# Modo npx (STDIO) - principal
npm run dev

# Modo HTTP - apenas para testes
npm run dev:http
```

### Build e Produção

```bash
npm run build
npm run start:stdio    # Modo npx
npm run start          # Modo HTTP
```

### Teste Local do Pacote

```bash
# Gerar pacote
npm run pack

# Testar antes de publicar (usa diretório atual)
npx ./maestro-ai-mcp-server-1.0.0.tgz

# Ou especificar diretório
npx ./maestro-ai-mcp-server-1.0.0.tgz D:\Projetos\teste
```

### Instalação Global

```bash
# Instalar globalmente
npm install -g @maestro-ai/mcp-server@1.0.0

# Usar diretamente (usa diretório atual)
maestro-mcp

# Ou especificar diretório
maestro-mcp D:\Projetos\meu-app
```

### Publicação

```bash
# Publicar no npm (requer login)
npm publish --access public
```

---

## 📋 Exemplo de Fluxo Completo (Modo npx)

```bash
# 1. Iniciar projeto
iniciar_projeto(
    nome: "meu-app",
    descricao: "Sistema de gestão de tarefas",
    diretorio: "D:\\Projetos\\meu-app"
)

# 2. Confirmar criação (injeta conteúdo automaticamente)
confirmar_projeto(
    nome: "meu-app",
    diretorio: "D:\\Projetos\\meu-app",
    tipo_artefato: "product",
    nivel_complexidade: "medio"
)

# 3. Verificar status
status(
    diretorio: "D:\\Projetos\\meu-app"
)

# 4. Avançar fase
proximo(
    entregavel: "# PRD - Produto\n\n## Problema\n...",
    diretorio: "D:\\Projetos\\meu-app"
)
```

---

## 🐳 Docker (Legado)

A imagem Docker continua disponível para o modo HTTP:

```bash
# Produção
docker-compose up -d

# Desenvolvimento
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

---

## 📄 Licença

MIT License - veja arquivo LICENSE para detalhes.
