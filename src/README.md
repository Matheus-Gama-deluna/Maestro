# MCP Maestro v5.5.0

Servidor MCP (Model Context Protocol) para o Maestro - Orquestração Autônoma Avançada e Zero-API.

**Pacote**: `@maestro-ai/mcp-server@5.5.0`

## 🚀 Uso via npx (Recomendado)

O Maestro agora é distribuído como pacote npm e executado localmente via `npx`, garantindo acesso direto aos arquivos do seu projeto e orquestração autônoma da IA da IDE.

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



### Mecânica 5 Tools (V3+)

O Maestro consolidou suas dezenas de tools antigas em **5 Entry Points Inteligentes** que auto-gerenciam o estado do projeto.

```bash
# 1. Maestro (Entry Point)
maestro({ diretorio: "D:\\Projetos\\meu-app" })                      # Autodetecta status atual
maestro({ acao: "criar_projeto", respostas: {...} })                  # Cria novo projeto
maestro({ acao: "setup_inicial", respostas: { ide: "windsurf" } })    # Define ambiente

# 2. Executar (Ações Mutações)
executar({ acao: "avancar", entregavel: "..." })                     # Avança fluxo com validação
executar({ acao: "salvar", conteudo: "...", tipo: "rascunho" })      # Gravação intermediária

# 3. Validar (Checagens)
validar({ diretorio: "D:\\Projetos\\meu-app" })                      # Roda pipeline de validação da fase

# 4. Analisar (Insights e Refatoração)
analisar({ diretorio: "D:\\Projetos\\meu-app", tipo: "completo" })   # Relatório de Technical/AI Debt

# 5. Contextualizar
contexto({ diretorio: "D:\\Projetos\\meu-app" })                     # Sumarização de estado e regras base
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

### Comandos Principais e Fluxo Inteligente (Automação Zero-API)

Com a arquitetura Fat MCP v5.5, a IA agora conta com um **Pipeline de Validação Watcher** (`chokidar`) totalmente engrenado.

| Tool | Descrição |
|---------|-----------|
| `maestro` | Portal de engajamento do projeto. Auto-resolve entre inicializar e obter status. |
| `executar` | Comando central para mutações, lidar com TDD invertido, auto-correção forçada e transições lógicas. |
| `validar` | Disparo manual ou auto-acionado pelo Watcher ao salvar um MD (score baseado em regex e semântica). |
| `analisar` | Camada de verificação de Code Smells e Architectural Debt. |
| `contexto` | Permite à IA compreender regras atuais com segurança sem divagar. |

---

## Destaques do Changelog v5.5 (V6)
- **Watcher Progressivo (Sprint 5):** Qualquer save num entregável via IDE agora dispara a pontuação via background automaticamente sem queima de tokens.
- **TDD Invertido (Sprint 4):** A IA passa a ler um `.checklist-esperante.md` obrigatório ANTES de escrever o documento.
- **Hydration Multi-IDE (Sprint 3):** Prompt adaptável que manda links reais locais em favorísticos MCP (`@.cursor`, etc).
- **Zero Pause Points & Auto-Flow (Sprint 6):** Pipeline de transição avança automaticamente as etapas (derivação ou técnicas), parando unicamente em bloqueios (Score < 70) ou requerimentos explícitos humanos.

---

## Estrutura do Projeto Gerada

Quando instanciado, um esqueleto como este rege a progressão:
```
meu-app/
├── .maestro/
│   ├── validation/       # Reports das validações locais 
│   ├── estado.json       # Maquina de estados da IA e fluxo
│   └── resumo.json       # Memoria Cache Limitada
├── .agent/
│   └── skills/           # Especialistas Injetados
├── docs/                 # Entregáveis de cada sprint/fase
│   ├── fase-xx/          # Entregáveis iterativos 
```

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
# 1. Iniciar projeto (detectará que o estado não existe)
maestro({
    diretorio: "D:\\Projetos\\meu-app"
})

# 2. Configurar (injeta conteúdo e inicializa estrutura)
maestro({
    acao: "setup_inicial",
    diretorio: "D:\\Projetos\\meu-app",
    respostas: {
       ide: "windsurf",
       modo: "balanced"
    }
})

# 3. Validar estado do projeto a qualquer momento
contexto({
    diretorio: "D:\\Projetos\\meu-app"
})

# 4. Avançar iterações/fases do desenvolvimento
executar({
    acao: "avancar",
    entregavel: "# PRD - Produto\n\n## Problema\n...",
    diretorio: "D:\\Projetos\\meu-app"
})
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
