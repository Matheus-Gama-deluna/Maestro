# Análise do CLI Maestro (`@packages/cli`)

## 1. Visão Geral
O CLI do Maestro atua como um **injetor de contexto e metodologia**. Diferente de CLIs tradicionais que executam lógica de negócio, o objetivo primário deste CLI é "hidratar" o ambiente de desenvolvimento do usuário com os arquivos necessários para que a **IA da IDE** (Windsurf, Cursor ou Antigravity) assuma o controle da orquestração.

Ele implementa fielmente o conceito "File System First" descrito na documentação, eliminando a necessidade de um servidor MCP ativo para a orquestração diária.

## 2. Arquitetura de "Inject & Forget"

O funcionamento baseia-se em três etapas:
1.  **Build Time**: O script `scripts/copy-content.js` empacota todo o diretório `content/` (especialistas, templates, workflows) dentro do pacote npm.
2.  **Init Time**: O comando `maestro init` copia esses arquivos para o projeto do usuário.
3.  **Run Time**: O CLI sai de cena. A IA da IDE lê os arquivos `.maestro/` e executa os workflows localmente.

## 3. Comandos Principais

### `maestro init`
Responsável pelo setup inicial.
- **Detecção de IDE**: Pergunta interativamente qual IDE está sendo usada (Windsurf, Cursor, Antigravity).
- **Criação da "Fonte da Verdade"**: Cria `.maestro/config.json` e a estrutura de diretórios.
- **Injeção de Conteúdo**:
    - Copia `specialists`, `templates`, `guides`, `prompts` para `.maestro/content/`.
- **Adaptação para IDE**:
    - **Windsurf**: Configura `.windsurfrules`, `.windsurf/workflows` e `.windsurf/skills`.
    - **Cursor**: Configura `.cursorrules`, `.cursor/commands` e `.cursor/skills`.
    - **Antigravity**: Configura `.gemini/GEMINI.md`, `.agent/workflows` e `.agent/skills`.
- **Skill Adapter**: Processa os arquivos de Skills para garantir que links e referências funcionem na estrutura de pastas específica da IDE escolhida.

### `maestro update`
Permite atualizar a metodologia sem perder o estado do projeto.
- Atualiza os arquivos de `content` (templates, especialistas) com as versões mais recentes do pacote.
- Re-executa o `SkillAdapter` para atualizar as skills.
- Atualiza a data de modificação em `config.json`.

## 4. Estrutura de Pacote
- **Entry Point**: `src/index.ts` usa `commander` para roteamento.
- **Scripts**: `copy-content.js` é crítico. Ele filtra workflows legados (ex: `mcp-*.md`) durante o build para não "sujar" a instalação do usuário com arquivos obsoletos.
- **Adapters**: O `SkillAdapter` (`src/adapters/skill-adapter.ts`) é o componente mais "inteligente", garantindo que um único repositório de conhecimento (Skills) funcione em múltiplas IDEs com estruturas de pasta diferentes.

## 5. Pontos Fortes da Implementação Atual
1.  **Agnosticismo de IDE**: A estrutura suporta expansão fácil para outras IDEs (ex: VS Code com Copilot) apenas adicionando novas configurações no objeto `IDE_CONFIGS` em `init.ts`.
2.  **Versionamento de Conteúdo**: Como o conteúdo é empacotado no npm, versões diferentes do CLI entregam versões diferentes da metodologia Maestro.
3.  **Resiliência**: O uso de `fs-extra` e `ora` fornece uma experiência de usuário robusta e visualmente clara.

## 6. Oportunidades de Melhoria (Observadas)
- **Validação de Estado**: O CLI atual apenas cria arquivos. Ele poderia ter um comando `maestro doctor` para verificar se a estrutura `.maestro` está íntegra ou se faltam arquivos críticos.
- **Backup Automático**: Antes de um `update --force`, o CLI poderia criar um backup automático do estado atual.
