## Uso do MCP Maestro via npx

### Instalação e Execução

O MCP Maestro agora é distribuído como pacote npm e executado localmente via `npx`, garantindo acesso direto aos arquivos do seu projeto.

#### 1. Configurar mcp_config.json

```json
{
  "mcpServers": {
    "maestro": {
      "command": "npx",
      "args": ["-y", "@maestro/mcp-server", "D:\\Sistemas\\"],
      "disabled": false,
      "env": {}
    }
  }
}
```

- **command**: `npx`
- **args**: 
  - `-y`: Confirma instalação automática
  - `@maestro/mcp-server`: Pacote npm
  - `DIRETÓRIO`: Caminho absoluto onde seus projetos Maestro estão

#### 2. Fluxo de Uso

1. **Iniciar um novo projeto**
   ```
   iniciar_projeto(
       nome: "Meu Projeto",
       descricao: "Sistema de gestão de tarefas",
       diretorio: "D:\\Projetos\\meu-projeto"
   )
   ```

2. **Confirmar criação** (conteúdo injetado automaticamente)
   ```
   confirmar_projeto(
       nome: "Meu Projeto",
       diretorio: "D:\\Projetos\\meu-projeto",
       tipo_artefato: "product",
       nivel_complexidade: "medio"
   )
   ```

3. **Injeção manual (se necessário)**
   ```
   injetar_conteudo(
       diretorio: "D:\\Projetos\\meu-projeto",
       force: true
   )
   ```

### Injeção Automática de Conteúdo

Ao confirmar um projeto, o Maestro injeta automaticamente:

```
meu-projeto/
├── .maestro/
│   ├── content/          ← Conteúdo injetado aqui
│   │   ├── specialists/
│   │   ├── templates/
│   │   ├── guides/
│   │   └── prompts/
│   ├── estado.json
│   └── resumo.json
```

### Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `iniciar_projeto` | Analisa e sugere classificação |
| `confirmar_projeto` | Cria projeto e injeta conteúdo |
| `carregar_projeto` | Carrega projeto existente |
| `proximo` | Salva entregável e avança fase |
| `status` | Retorna status completo |
| `injetar_conteudo` | Reinjeta conteúdo (force:true) |

### Desenvolvimento

Para desenvolver localmente:

```bash
cd src
npm run dev        # STDIO (modo npx)
npm run dev:http   # HTTP (apenas testes)
npm run build      # Compila para dist/
npm run pack       # Gera .tgz para teste
```

### Teste Local

Antes de publicar, teste o pacote:

```bash
npx ./maestro-mcp-server-1.0.0.tgz D:\Projetos\teste
```

### Benefícios do Modo npx

✅ **Acesso local total** – Sem limitações de Docker  
✅ **Instalação zero** – `npx` baixa e executa  
✅ **Offline** – Conteúdo embutido no pacote  
✅ **Portabilidade** – Projeto funciona em qualquer máquina  
✅ **Versionamento** – Cada projeto pode ter sua versão de conteúdo
