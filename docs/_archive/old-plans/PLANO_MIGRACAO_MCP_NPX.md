## Plano de Migração MCP Maestro → npx Local

### 1. Contexto Atual
- Servidor HTTP (Express + SSE) hospedado em Docker dificulta acesso a arquivos locais do usuário.
- Modo STDIO (`src/stdio.ts`) já existe e funciona em regime stateless, compatível com npx.
- Tools trabalham com `estado_json` + `diretorio` e já produzem `files` para a IA salvar localmente.

### 2. Objetivos da Migração
1. Publicar o MCP como pacote npm (`@maestro/mcp-server`) executado via `npx` diretamente na máquina do usuário.
2. Garantir acesso de leitura/escrita aos arquivos locais dos projetos Maestro sem depender de HTTP/Docker.
3. Automatizar a injeção do conteúdo base (`content/`) dentro de `.maestro/content` em cada projeto.
4. Fornecer documentação e scripts consistentes para desenvolvimento, build, testes e publicação.

### 3. Arquitetura Alvo
- **Entrada principal**: `dist/stdio.js` (binário `maestro-mcp`).
- **Modo HTTP**: mantido apenas para testes com `npm run dev:http` / `npm run start:http`.
- **Scripts npm**: `build`, `dev`, `dev:http`, `start`, `start:http`, `prepublishOnly`, `typecheck`, `pack`.
- **Distribuição**: pacote npm contendo `dist/**/*` e `content/**/*`.
- **Injeção de conteúdo**: utilitário dedicado + nova tool `injetar_conteudo` (execução manual) + chamada automática em `confirmar_projeto`.

### 4. Fases do Plano
| Fase | Descrição | Resultado Esperado |
|------|-----------|--------------------|
| 1. Preparação | Atualizar `package.json`, garantir build TS e organizar scripts | Pacote pronto para build e publicação |
| 2. Injeção | Criar utilitário de cópia do conteúdo e integrar às tools | `.maestro/content` criado automaticamente e tool manual disponível |
| 3. Ajustes STDIO | Garantir registro das novas tools no servidor STDIO e alinhar `stdio.ts` | Servidor MCP funcional via `npx` |
| 4. Testes & Publicação | Rodar `npm run build`, `npm run test`, `npm pack`, validar via `npx <tgz>` e publicar | Pacote publicado em `@maestro/mcp-server` |
| 5. Documentação | Atualizar README e guias com instruções de uso via `npx` + fluxo de injeção | Usuários sabem configurar `mcp_config.json` e executar ferramentas |

### 5. Checklist Técnico
1. `package.json` preparado (✔️ ajustado nesta fase).
2. Criar utilitário `utils/content-injector.ts` com funções `injectContentIntoProject` e `ensureContentInstalled`.
3. Atualizar `confirmar_projeto` para chamar `ensureContentInstalled` após criar `.maestro`.
4. Implementar tool `injetar_conteudo` (entrada: `diretorio`, `source?`, `force?`).
5. Registrar tool em `tools/index.ts` e `stdio.ts`.
6. Adicionar logs claros quando a injeção ocorrer (para debug do usuário).
7. Testar fluxo completo:
   - `npx @maestro/mcp-server D:\projeto`
   - `iniciar_projeto` → `confirmar_projeto` → verificar `.maestro/content`
   - Tool manual `injetar_conteudo` (com e sem `force`).
8. Rodar `npm run pack` e testar o `.tgz` em ambiente limpo antes de publicar.

### 6. Documentação Necessária
- **README**: seção "Uso via npx" com exemplo de `mcp_config.json` e parâmetros esperados.
- **Guia de Injeção**: passo a passo sobre como o conteúdo é criado automaticamente e como forçar reinjeção.
- **Release Notes**: destacar mudança de transporte (HTTP → npx) e impactos para usuários existentes.

### 7. Próximos Passos Imediatos
1. Implementar utilitário de injeção e nova tool.
2. Integrar chamadas automáticas nas tools existentes.
3. Validar build/test e empacotamento.
4. Atualizar documentação e comunicar migração aos usuários.

> Este plano consolida o contexto discutido e serve como referência para executar e acompanhar a migração para o modo npx local.
